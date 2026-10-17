import Papa from 'papaparse';
import { z } from 'zod';
import { getDb, studentWhitelist, profiles, auditLogs, eq } from '@novarion/db';

export const studentCsvRowSchema = z.object({
  nim: z
    .string()
    .min(5, 'NIM minimal 5 karakter')
    .max(20, 'NIM maksimal 20 karakter'),
  nama: z
    .string()
    .min(2, 'Nama minimal 2 karakter')
    .max(150, 'Nama maksimal 150 karakter'),
  email: z
    .string()
    .email('Format email tidak valid')
    .max(100, 'Email maksimal 100 karakter'),
});

export type StudentCsvRow = z.infer<typeof studentCsvRowSchema>;

export interface StudentCsvError {
  row: number;
  nim?: string;
  email?: string;
  message: string;
}

export interface StudentImportPreview {
  fileName: string;
  totalRows: number;
  validRows: Array<{
    nim: string;
    nama: string;
    email: string;
    action: 'insert' | 'update';
    note?: string;
  }>;
  duplicateCount: number;
  errors: StudentCsvError[];
}

export interface StudentImportResult {
  success: boolean;
  totalRows: number;
  insertedCount: number;
  updatedCount: number;
  errorCount: number;
  errors: StudentCsvError[];
}

function normalizeHeader(header: string): string {
  const cleaned = header.trim().toLowerCase().replace(/[\s_-]+/g, '_');
  if (['nim', 'nomor_induk', 'nomor_induk_mahasiswa', 'nrp'].includes(cleaned)) return 'nim';
  if (['nama', 'nama_lengkap', 'full_name', 'name', 'mahasiswa'].includes(cleaned)) return 'nama';
  if (['email', 'surel', 'email_kampus', 'google_email', 'mail'].includes(cleaned)) return 'email';
  return cleaned;
}

export async function parseAndValidateStudentCSV(
  csvContent: string,
  fileName = 'data_mahasiswa.csv'
): Promise<StudentImportPreview> {
  const db = getDb();

  const parsed = Papa.parse<Record<string, string>>(csvContent, {
    header: true,
    skipEmptyLines: 'greedy',
    transformHeader: normalizeHeader,
  });

  const errors: StudentCsvError[] = [];
  const validRows: StudentImportPreview['validRows'] = [];
  const seenNims = new Set<string>();
  const seenEmails = new Set<string>();
  let duplicateCount = 0;

  // Existing records from studentWhitelist and profiles
  const [existingWhitelist, existingProfiles] = await Promise.all([
    db.select().from(studentWhitelist),
    db.select().from(profiles),
  ]);

  const whitelistNimMap = new Map(existingWhitelist.map((r) => [r.nim.trim().toUpperCase(), r]));
  const whitelistEmailMap = new Map(existingWhitelist.map((r) => [r.email.trim().toLowerCase(), r]));
  const profileNimMap = new Map(existingProfiles.map((p) => [p.nim.trim().toUpperCase(), p]));

  parsed.data.forEach((rawRow, index) => {
    const rowNumber = index + 2;

    const validation = studentCsvRowSchema.safeParse({
      nim: rawRow.nim?.trim() || '',
      nama: rawRow.nama?.trim() || '',
      email: rawRow.email?.trim() || '',
    });

    if (!validation.success) {
      errors.push({
        row: rowNumber,
        nim: rawRow.nim,
        email: rawRow.email,
        message: validation.error.errors.map((e) => e.message).join('; '),
      });
      return;
    }

    const { nim, nama, email } = validation.data;
    const normalizedNim = nim.toUpperCase();
    const normalizedEmail = email.toLowerCase();

    // Check duplicate within the same CSV
    if (seenNims.has(normalizedNim)) {
      duplicateCount++;
      errors.push({
        row: rowNumber,
        nim: normalizedNim,
        email: normalizedEmail,
        message: `NIM ${normalizedNim} duplikat di dalam berkas CSV baris ini.`,
      });
      return;
    }

    if (seenEmails.has(normalizedEmail)) {
      duplicateCount++;
      errors.push({
        row: rowNumber,
        nim: normalizedNim,
        email: normalizedEmail,
        message: `Email ${normalizedEmail} duplikat di dalam berkas CSV baris ini.`,
      });
      return;
    }

    seenNims.add(normalizedNim);
    seenEmails.add(normalizedEmail);

    // Cross-record identity collision check
    const existingNimRecord = whitelistNimMap.get(normalizedNim);
    const existingEmailRecord = whitelistEmailMap.get(normalizedEmail);

    if (existingNimRecord && existingEmailRecord && existingNimRecord.id !== existingEmailRecord.id) {
      errors.push({
        row: rowNumber,
        nim: normalizedNim,
        email: normalizedEmail,
        message: `Konflik: NIM ${normalizedNim} dan email ${normalizedEmail} sudah terdaftar pada dua mahasiswa yang berbeda.`,
      });
      return;
    }

    const isUpdate = !!existingNimRecord || !!existingEmailRecord;
    const hasAccount = profileNimMap.has(normalizedNim);

    validRows.push({
      nim: normalizedNim,
      nama,
      email: normalizedEmail,
      action: isUpdate ? 'update' : 'insert',
      note: hasAccount ? 'Akun sudah aktif (password tidak akan direset)' : 'Whitelist baru (belum aktivasi)',
    });
  });

  return {
    fileName,
    totalRows: parsed.data.length,
    validRows,
    duplicateCount,
    errors,
  };
}

export async function executeStudentImport(
  validRows: StudentImportPreview['validRows'],
  actorId: string
): Promise<StudentImportResult> {
  const db = getDb();
  let insertedCount = 0;
  let updatedCount = 0;
  const errors: StudentCsvError[] = [];

  for (let i = 0; i < validRows.length; i++) {
    const row = validRows[i];
    try {
      const existing = await db
        .select()
        .from(studentWhitelist)
        .where(eq(studentWhitelist.nim, row.nim))
        .limit(1);

      if (existing.length > 0) {
        // Update whitelist record (preserving password, cannot grant super admin)
        await db
          .update(studentWhitelist)
          .set({
            fullName: row.nama,
            email: row.email,
            updatedAt: new Date(),
          })
          .where(eq(studentWhitelist.id, existing[0].id));

        // Also update profiles fullName and email if exists
        await db
          .update(profiles)
          .set({
            fullName: row.nama,
            email: row.email,
            updatedAt: new Date(),
          })
          .where(eq(profiles.nim, row.nim));

        updatedCount++;
      } else {
        // Insert new student whitelist
        await db.insert(studentWhitelist).values({
          nim: row.nim,
          fullName: row.nama,
          email: row.email,
          role: 'student', // Strictly 'student' via CSV, never admin
          isActive: true,
        });
        insertedCount++;
      }
    } catch (err) {
      errors.push({
        row: i + 1,
        nim: row.nim,
        email: row.email,
        message: err instanceof Error ? err.message : String(err),
      });
    }
  }

  // Audit log
  await db.insert(auditLogs).values({
    actorId,
    action: 'CSV_STUDENT_IMPORT_EXECUTED',
    entityType: 'student_whitelist',
    entityId: actorId,
    newValues: {
      totalSubmitted: validRows.length,
      insertedCount,
      updatedCount,
      errorCount: errors.length,
    },
  });

  return {
    success: errors.length === 0,
    totalRows: validRows.length,
    insertedCount,
    updatedCount,
    errorCount: errors.length,
    errors,
  };
}
