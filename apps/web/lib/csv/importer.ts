import Papa from 'papaparse';
import { csvStudentRowSchema } from '@novarion/shared';
import {
  getDb,
  studentWhitelist,
  profiles,
  courses,
  academicTerms,
  courseOfferings,
  classSections,
  studyGroups,
  enrollments,
  studyGroupMembers,
  importRuns,
  auditLogs,
  eq,
  or,
  and,
} from '@novarion/db';

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
  enrollmentsMapped: number;
  groupsMapped: number;
  errors: CSVRowError[];
}

/**
 * Normalisasi nama header agar toleran terhadap variasi ekspor Excel/Sheets/Google Drive
 */
function normalizeHeader(header: string): string {
  const cleaned = header.trim().toLowerCase().replace(/[\s_-]+/g, '_');
  if (['nim', 'nomor_induk', 'nomor_induk_mahasiswa', 'nrp'].includes(cleaned)) return 'nim';
  if (['email', 'surel', 'email_kampus', 'google_email', 'mail'].includes(cleaned)) return 'email';
  if (['nama', 'nama_lengkap', 'full_name', 'nama_mahasiswa'].includes(cleaned)) return 'nama';
  if (['role', 'peran', 'status_role'].includes(cleaned)) return 'role';
  if (['kelas', 'kelas_paralel', 'section', 'class'].includes(cleaned)) return 'kelas';
  if (['mata_kuliah', 'matkul', 'course', 'subject'].includes(cleaned)) return 'mata_kuliah';
  if (['kelompok', 'kelompok_praktikum', 'group', 'study_group'].includes(cleaned)) return 'kelompok';
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
  const existingNimMap = new Map(existingRecords.map((r) => [r.nim.toUpperCase(), r]));
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
    const normalizedNim = nim.trim().toUpperCase();
    const normalizedEmail = email.trim().toLowerCase();

    // Cek duplikasi di dalam file itu sendiri
    if (seenNims.has(normalizedNim) || seenEmails.has(normalizedEmail)) {
      duplicateCount++;
      errors.push({
        row: rowNumber,
        nim: normalizedNim,
        email: normalizedEmail,
        message: `Duplikat ditemukan di dalam file CSV (NIM: ${normalizedNim} atau Email: ${normalizedEmail})`,
      });
      return;
    }

    seenNims.add(normalizedNim);
    seenEmails.add(normalizedEmail);

    // Tentukan aksi: insert jika baru, update jika sudah terdaftar
    const isExisting = existingNimMap.has(normalizedNim) || existingEmailMap.has(normalizedEmail);

    validRows.push({
      nim: normalizedNim,
      email: normalizedEmail,
      nama: nama.trim(),
      role,
      kelas: kelas?.trim(),
      mataKuliah: mata_kuliah?.trim(),
      kelompok: kelompok?.trim(),
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
 * Eksekusi impor CSV secara idempoten ke database PostgreSQL.
 * Memetakan NIM, email, nama, peran ke student_whitelist (dan profiles jika ada),
 * serta menghubungkan mata kuliah, kelas paralel, dan kelompok praktikum.
 * KRITIS: Impor CSV tidak pernah mereset kata sandi akun yang sudah ada.
 */
export async function executeCSVImport(
  preview: CSVImportPreview,
  executedByProfileId?: string
): Promise<CSVImportResult> {
  const db = getDb();
  let insertedCount = 0;
  let updatedCount = 0;
  let enrollmentsMapped = 0;
  let groupsMapped = 0;
  const executionErrors: CSVRowError[] = [...preview.errors];

  for (const item of preview.validRows) {
    try {
      // 1. Sinkronisasi Data Whitelist (Idempoten, tanpa mereset password)
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
        // Idempotent Update pada studentWhitelist
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
        // Insert Baru ke studentWhitelist
        await db.insert(studentWhitelist).values({
          nim: item.nim,
          email: item.email,
          fullName: item.nama,
          role: item.role,
          isActive: true,
        });
        insertedCount++;
      }

      // 2. Pemetaan Relasi Akademik: Mata Kuliah, Kelas, Kelompok & Enrollment
      if (item.mataKuliah) {
        const courseNameOrCode = item.mataKuliah.trim();

        // Cari atau buat Course
        let courseId: string;
        const existingCourse = await db
          .select()
          .from(courses)
          .where(or(eq(courses.code, courseNameOrCode.toUpperCase()), eq(courses.name, courseNameOrCode)))
          .limit(1);

        if (existingCourse.length > 0) {
          courseId = existingCourse[0].id;
        } else {
          const [newCourse] = await db
            .insert(courses)
            .values({
              code: courseNameOrCode.slice(0, 20).toUpperCase(),
              name: courseNameOrCode,
              credits: 3,
            })
            .returning();
          courseId = newCourse.id;
        }

        // Pastikan ada academicTerm aktif
        let termId: string;
        const existingTerm = await db
          .select()
          .from(academicTerms)
          .where(eq(academicTerms.isActive, true))
          .limit(1);

        if (existingTerm.length > 0) {
          termId = existingTerm[0].id;
        } else {
          const [newTerm] = await db
            .insert(academicTerms)
            .values({
              code: '2026-GANJIL',
              name: 'Semester Ganjil 2026/2027',
              isActive: true,
            })
            .returning();
          termId = newTerm.id;
        }

        // Cari atau buat CourseOffering
        let offeringId: string;
        const existingOffering = await db
          .select()
          .from(courseOfferings)
          .where(and(eq(courseOfferings.termId, termId), eq(courseOfferings.courseId, courseId)))
          .limit(1);

        if (existingOffering.length > 0) {
          offeringId = existingOffering[0].id;
        } else {
          const [newOffering] = await db
            .insert(courseOfferings)
            .values({ termId, courseId })
            .returning();
          offeringId = newOffering.id;
        }

        // Jika terdapat spesifikasi kelas paralel
        if (item.kelas) {
          const className = item.kelas.trim();
          let sectionId: string;
          const existingSection = await db
            .select()
            .from(classSections)
            .where(and(eq(classSections.offeringId, offeringId), eq(classSections.name, className)))
            .limit(1);

          if (existingSection.length > 0) {
            sectionId = existingSection[0].id;
          } else {
            const [newSection] = await db
              .insert(classSections)
              .values({ offeringId, name: className })
              .returning();
            sectionId = newSection.id;
          }

          // Cari profile mahasiswa (jika sudah terdaftar akunnya)
          const userProfiles = await db
            .select()
            .from(profiles)
            .where(or(eq(profiles.nim, item.nim), eq(profiles.email, item.email)))
            .limit(1);

          if (userProfiles.length > 0) {
            const profileId = userProfiles[0].id;

            // Hubungkan enrollment secara idempoten
            const existingEnrollment = await db
              .select()
              .from(enrollments)
              .where(and(eq(enrollments.profileId, profileId), eq(enrollments.classSectionId, sectionId)))
              .limit(1);

            if (existingEnrollment.length === 0) {
              await db.insert(enrollments).values({
                profileId,
                classSectionId: sectionId,
              });
              enrollmentsMapped++;
            }
          }

          // Jika terdapat spesifikasi kelompok praktikum
          if (item.kelompok) {
            const groupName = item.kelompok.trim();
            let groupId: string;
            const existingGroup = await db
              .select()
              .from(studyGroups)
              .where(and(eq(studyGroups.classSectionId, sectionId), eq(studyGroups.name, groupName)))
              .limit(1);

            if (existingGroup.length > 0) {
              groupId = existingGroup[0].id;
            } else {
              const [newGroup] = await db
                .insert(studyGroups)
                .values({ classSectionId: sectionId, name: groupName })
                .returning();
              groupId = newGroup.id;
            }

            if (userProfiles.length > 0) {
              const profileId = userProfiles[0].id;
              const existingMember = await db
                .select()
                .from(studyGroupMembers)
                .where(and(eq(studyGroupMembers.profileId, profileId), eq(studyGroupMembers.studyGroupId, groupId)))
                .limit(1);

              if (existingMember.length === 0) {
                await db.insert(studyGroupMembers).values({
                  profileId,
                  studyGroupId: groupId,
                });
                groupsMapped++;
              }
            }
          }
        }
      }
    } catch (err) {
      console.error(`[executeCSVImport] Gagal import baris ${item.nim}:`, err);
      executionErrors.push({
        row: 0,
        nim: item.nim,
        email: item.email,
        message: err instanceof Error ? err.message : String(err),
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
      errorSummary: executionErrors.slice(0, 50),
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
          enrollmentsMapped,
          groupsMapped,
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
    enrollmentsMapped,
    groupsMapped,
    errors: executionErrors,
  };
}
