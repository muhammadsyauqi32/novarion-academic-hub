import Papa from 'papaparse';
import { csvStudentRowSchema } from '@novarion/shared';
import { getDb, studentWhitelist, importRuns, auditLogs } from '@novarion/db';
import { eq, or } from 'drizzle-orm';

export interface CSVRowError {
  row: number;
  nim?: string;
  email?: string;
  message: string;
}

export interface CSVImportPreview {
  fileName: string;
  totalRows: number;
  validRows: Array<{
    nim: string;
    email: string;
    nama: string;
    role: 'student' | 'admin';
    kelas?: string;
    mataKuliah?: string;
    kelompok?: string;
    action: 'insert' | 'update';
  }>;
  duplicateCount: number;
  errors: CSVRowError[];
}

export interface CSVImportResult {
  success: boolean;
  totalRows: number;
  successRows: number;
  errorRows: number;
  insertedCount: number;
  updatedCount: number;
  errors: CSVRowError[];
}

/**
 * Normalisasi nama header agar toleran terhadap variasi ekspor Excel/Sheets
 */
function normalizeHeader(header: string): string {
  const cleaned = header.trim().toLowerCase().replace(/[\s_-]+/g, '_');
  if (['nim', 'nomor_induk', 'nomor_induk_mahasiswa'].includes(cleaned)) return 'nim';
  if (['email', 'surel', 'email_kampus', 'google_email'].includes(cleaned)) return 'email';
  if (['nama', 'nama_lengkap', 'full_name', 'nama_mahasiswa'].includes(cleaned)) return 'nama';
  if (['role', 'peran', 'status_role'].includes(cleaned)) return 'role';
  if (['kelas', 'kelas_paralel', 'section'].includes(cleaned)) return 'kelas';
  if (['mata_kuliah', 'matkul', 'course'].includes(cleaned)) return 'mata_kuliah';
  if (['kelompok', 'kelompok_praktikum', 'group'].includes(cleaned)) return 'kelompok';
  return cleaned;
}

/**
 * Parsing dan validasi CSV (Preview Mode / Dry Run)
 */
export async function parseAndValidateCSV(
  csvContent: string,
  fileName = 'roster.csv'
): Promise<CSVImportPreview> {
  const db = getDb();

  const parsed = Papa.parse<Record<string, string>>(csvContent, {
    header: true,
    skipEmptyLines: 'greedy',
    transformHeader: normalizeHeader,
  });

  const errors: CSVRowError[] = [];
  const validRows: CSVImportPreview['validRows'] = [];
  const seenNims = new Set<string>();
  const seenEmails = new Set<string>();
  let duplicateCount = 0;

  // Ambil data whitelist existing untuk menentukan aksi insert vs update
  const existingRecords = await db.select().from(studentWhitelist);
  const existingNimMap = new Map(existingRecords.map((r) => [r.nim, r]));
  const existingEmailMap = new Map(existingRecords.map((r) => [r.email.toLowerCase(), r]));

  parsed.data.forEach((row, index) => {
    const rowNumber = index + 2; // Baris 1 adalah header

    const validation = csvStudentRowSchema.safeParse(row);

    if (!validation.success) {
      const errMsg = validation.error.errors.map((e) => e.message).join('; ');
      errors.push({
        row: rowNumber,
        nim: row.nim,
        email: row.email,
        message: errMsg,
      });
      return;
    }

    const { nim, email, nama, role, kelas, mata_kuliah, kelompok } = validation.data;

    // Cek duplikasi di dalam file itu sendiri
    if (seenNims.has(nim) || seenEmails.has(email)) {
      duplicateCount++;
      errors.push({
        row: rowNumber,
        nim,
        email,
        message: `Duplikat ditemukan di dalam file CSV (NIM: ${nim} atau Email: ${email})`,
      });
      return;
    }

    seenNims.add(nim);
    seenEmails.add(email);

    // Tentukan aksi: insert jika baru, update jika sudah terdaftar
    const isExisting = existingNimMap.has(nim) || existingEmailMap.has(email);

    validRows.push({
      nim,
      email,
      nama,
      role,
      kelas,
      mataKuliah: mata_kuliah,
      kelompok,
      action: isExisting ? 'update' : 'insert',
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

/**
 * Eksekusi impor CSV secara idempoten ke database PostgreSQL
 */
export async function executeCSVImport(
  preview: CSVImportPreview,
  executedByProfileId?: string
): Promise<CSVImportResult> {
  const db = getDb();
  let insertedCount = 0;
  let updatedCount = 0;
  const executionErrors: CSVRowError[] = [...preview.errors];

  for (const item of preview.validRows) {
    try {
      // Cek apakah NIM atau email sudah terdaftar
      const existing = await db
        .select()
        .from(studentWhitelist)
        .where(
          or(
            eq(studentWhitelist.nim, item.nim),
            eq(studentWhitelist.email, item.email)
          )
        )
        .limit(1);

      if (existing.length > 0) {
        // Idempotent Update
        await db
          .update(studentWhitelist)
          .set({
            fullName: item.nama,
            role: item.role,
            isActive: true,
            updatedAt: new Date(),
          })
          .where(eq(studentWhitelist.id, existing[0].id));
        updatedCount++;
      } else {
        // Insert Baru
        await db.insert(studentWhitelist).values({
          nim: item.nim,
          email: item.email,
          fullName: item.nama,
          role: item.role,
          isActive: true,
        });
        insertedCount++;
      }
    } catch (err) {
      console.error(`[executeCSVImport] Gagal import baris ${item.nim}:`, err);
      executionErrors.push({
        row: 0,
        nim: item.nim,
        email: item.email,
        message: String(err),
      });
    }
  }

  const successRows = insertedCount + updatedCount;
  const errorRows = executionErrors.length;

  // Catat riwayat di import_runs
  try {
    await db.insert(importRuns).values({
      executedBy: executedByProfileId,
      fileName: preview.fileName,
      totalRows: preview.totalRows,
      successRows,
      errorRows,
      errorSummary: executionErrors.slice(0, 50), // simpan 50 error pertama
    });

    if (executedByProfileId) {
      await db.insert(auditLogs).values({
        actorId: executedByProfileId,
        action: 'CSV_IMPORT_EXECUTED',
        entityType: 'student_whitelist',
        newValues: {
          fileName: preview.fileName,
          insertedCount,
          updatedCount,
          errorRows,
        },
      });
    }
  } catch (err) {
    console.error('[executeCSVImport] Gagal mencatat log import:', err);
  }

  return {
    success: errorRows === 0 || successRows > 0,
    totalRows: preview.totalRows,
    successRows,
    errorRows,
    insertedCount,
    updatedCount,
    errors: executionErrors,
  };
}
