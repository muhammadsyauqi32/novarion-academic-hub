import Papa from 'papaparse';
import { z } from 'zod';
import {
  getDb,
  profiles,
  courses,
  academicTerms,
  courseOfferings,
  classSections,
  studyGroups,
  enrollments,
  studyGroupMembers,
  auditLogs,
  eq,
  and,
} from '@novarion/db';

export const academicMappingRowSchema = z.object({
  nim: z.string().min(5, 'NIM minimal 5 karakter').max(20),
  semester: z.string().optional(),
  kode_mata_kuliah: z.string().min(2, 'Kode mata kuliah wajib diisi').max(20),
  kelas: z.string().min(1, 'Kelas paralel wajib diisi').max(50),
  kelompok: z.string().optional(),
});

export type AcademicMappingRow = z.infer<typeof academicMappingRowSchema>;

export interface AcademicMappingError {
  row: number;
  nim?: string;
  kodeMataKuliah?: string;
  message: string;
}

export interface AcademicMappingPreview {
  fileName: string;
  totalRows: number;
  validRows: Array<{
    nim: string;
    studentName: string;
    profileId?: string;
    termCode: string;
    termId: string;
    courseCode: string;
    courseName: string;
    courseId: string;
    kelas: string;
    kelompok?: string;
    action: 'enroll' | 'already_enrolled';
  }>;
  errors: AcademicMappingError[];
}

export interface AcademicMappingResult {
  success: boolean;
  totalRows: number;
  enrolledCount: number;
  alreadyEnrolledCount: number;
  groupsAssignedCount: number;
  errorCount: number;
  errors: AcademicMappingError[];
}

function normalizeHeader(header: string): string {
  const cleaned = header.trim().toLowerCase().replace(/[\s_-]+/g, '_');
  if (['nim', 'nomor_induk', 'nrp'].includes(cleaned)) return 'nim';
  if (['semester', 'term', 'periode', 'tahun_ajaran'].includes(cleaned)) return 'semester';
  if (['kode_mata_kuliah', 'kode_matkul', 'kode_mk', 'kode_course', 'course_code'].includes(cleaned)) return 'kode_mata_kuliah';
  if (['kelas', 'kelas_paralel', 'section', 'class'].includes(cleaned)) return 'kelas';
  if (['kelompok', 'kelompok_praktikum', 'group', 'study_group'].includes(cleaned)) return 'kelompok';
  return cleaned;
}

export async function parseAndValidateAcademicMappingCSV(
  csvContent: string,
  fileName = 'mapping_akademik.csv'
): Promise<AcademicMappingPreview> {
  const db = getDb();

  const parsed = Papa.parse<Record<string, string>>(csvContent, {
    header: true,
    skipEmptyLines: 'greedy',
    transformHeader: normalizeHeader,
  });

  const errors: AcademicMappingError[] = [];
  const validRows: AcademicMappingPreview['validRows'] = [];

  // 1. Ambil data master: profiles, courses, academicTerms, existing enrollments
  const [allProfiles, allCourses, allTerms, existingEnrollmentRows] = await Promise.all([
    db.select({ id: profiles.id, nim: profiles.nim, fullName: profiles.fullName }).from(profiles),
    db.select({ id: courses.id, code: courses.code, name: courses.name }).from(courses),
    db.select({ id: academicTerms.id, code: academicTerms.code, isActive: academicTerms.isActive }).from(academicTerms),
    db.select({ profileId: enrollments.profileId, classSectionId: enrollments.classSectionId }).from(enrollments),
  ]);

  const profileMap = new Map(allProfiles.map((p) => [p.nim.trim().toUpperCase(), p]));
  const courseMap = new Map(allCourses.map((c) => [c.code.trim().toUpperCase(), c]));
  const termMap = new Map(allTerms.map((t) => [t.code.trim().toUpperCase(), t]));
  const activeTerm = allTerms.find((t) => t.isActive) || allTerms[0];

  // Map untuk deteksi kontradiksi kelas dalam mata kuliah yang sama per mahasiswa: key = `${nim}:${termId}:${courseId}` -> kelas
  const studentCourseClassMap = new Map<string, { kelas: string; row: number }>();

  // Map untuk mengecek duplikasi persis baris yang sama: key = `${nim}:${termId}:${courseId}:${kelas}`
  const seenExactAssignments = new Set<string>();

  parsed.data.forEach((rawRow, index) => {
    const rowNumber = index + 2;

    const validation = academicMappingRowSchema.safeParse({
      nim: rawRow.nim?.trim() || '',
      semester: rawRow.semester?.trim() || '',
      kode_mata_kuliah: rawRow.kode_mata_kuliah?.trim() || '',
      kelas: rawRow.kelas?.trim() || '',
      kelompok: rawRow.kelompok?.trim() || '',
    });

    if (!validation.success) {
      errors.push({
        row: rowNumber,
        nim: rawRow.nim,
        kodeMataKuliah: rawRow.kode_mata_kuliah,
        message: validation.error.errors.map((e) => e.message).join('; '),
      });
      return;
    }

    const { nim, semester, kode_mata_kuliah, kelas, kelompok } = validation.data;
    const normalizedNim = nim.toUpperCase();
    const normalizedCourseCode = kode_mata_kuliah.toUpperCase();
    const normalizedKelas = kelas.toUpperCase();
    const normalizedKelompok = kelompok ? kelompok.trim() : undefined;

    // A. Validasi Mahasiswa Terdaftar
    const student = profileMap.get(normalizedNim);
    if (!student) {
      errors.push({
        row: rowNumber,
        nim: normalizedNim,
        kodeMataKuliah: normalizedCourseCode,
        message: `Mahasiswa dengan NIM ${normalizedNim} belum terdaftar / belum memiliki akun di sistem. Daftarkan di Data Mahasiswa terlebih dahulu.`,
      });
      return;
    }

    // B. Validasi Mata Kuliah
    const course = courseMap.get(normalizedCourseCode);
    if (!course) {
      errors.push({
        row: rowNumber,
        nim: normalizedNim,
        kodeMataKuliah: normalizedCourseCode,
        message: `Mata kuliah dengan kode "${normalizedCourseCode}" tidak ditemukan di database. Pastikan kode sesuai katalog mata kuliah.`,
      });
      return;
    }

    // C. Validasi Semester / Academic Term
    let targetTerm = activeTerm;
    if (semester && semester.trim()) {
      const foundTerm = termMap.get(semester.trim().toUpperCase());
      if (foundTerm) {
        targetTerm = foundTerm;
      }
    }

    if (!targetTerm) {
      errors.push({
        row: rowNumber,
        nim: normalizedNim,
        kodeMataKuliah: normalizedCourseCode,
        message: `Semester akademik tidak valid atau belum ada semester aktif yang diatur.`,
      });
      return;
    }

    // D. Cek Kontradiksi Kelas untuk Mata Kuliah yang Sama
    const courseAssignmentKey = `${normalizedNim}:${targetTerm.id}:${course.id}`;
    const existingAssignment = studentCourseClassMap.get(courseAssignmentKey);

    if (existingAssignment) {
      if (existingAssignment.kelas !== normalizedKelas) {
        errors.push({
          row: rowNumber,
          nim: normalizedNim,
          kodeMataKuliah: normalizedCourseCode,
          message: `Kontradiksi: Mahasiswa ${normalizedNim} sudah dialokasikan ke ${existingAssignment.kelas} di baris ${existingAssignment.row}, namun di baris ini dialokasikan ke ${normalizedKelas} untuk mata kuliah yang sama (${course.code}).`,
        });
        return;
      }
    } else {
      studentCourseClassMap.set(courseAssignmentKey, { kelas: normalizedKelas, row: rowNumber });
    }

    // E. Cek Duplikasi Persis
    const exactKey = `${normalizedNim}:${targetTerm.id}:${course.id}:${normalizedKelas}:${normalizedKelompok || ''}`;
    if (seenExactAssignments.has(exactKey)) {
      // Abaikan duplikasi baris yang benar-benar identik
      return;
    }
    seenExactAssignments.add(exactKey);

    validRows.push({
      nim: normalizedNim,
      studentName: student.fullName,
      profileId: student.id,
      termCode: targetTerm.code,
      termId: targetTerm.id,
      courseCode: course.code,
      courseName: course.name,
      courseId: course.id,
      kelas: normalizedKelas,
      kelompok: normalizedKelompok,
      action: 'enroll',
    });
  });

  return {
    fileName,
    totalRows: parsed.data.length,
    validRows,
    errors,
  };
}

export async function executeAcademicMappingImport(
  validRows: AcademicMappingPreview['validRows'],
  actorId: string
): Promise<AcademicMappingResult> {
  const db = getDb();
  let enrolledCount = 0;
  let alreadyEnrolledCount = 0;
  let groupsAssignedCount = 0;
  const errors: AcademicMappingError[] = [];

  // Cache lokal untuk offerings, classSections, studyGroups agar tidak N+1
  const offeringCache = new Map<string, string>(); // `${termId}:${courseId}` -> offeringId
  const sectionCache = new Map<string, string>(); // `${offeringId}:${kelas}` -> sectionId
  const groupCache = new Map<string, string>(); // `${sectionId}:${kelompok}` -> groupId

  for (let i = 0; i < validRows.length; i++) {
    const row = validRows[i];
    if (!row.profileId) continue;

    try {
      // 1. Resolve or Insert Course Offering
      const offeringKey = `${row.termId}:${row.courseId}`;
      let offeringId = offeringCache.get(offeringKey);

      if (!offeringId) {
        const existingOffering = await db
          .select({ id: courseOfferings.id })
          .from(courseOfferings)
          .where(
            and(
              eq(courseOfferings.termId, row.termId),
              eq(courseOfferings.courseId, row.courseId)
            )
          )
          .limit(1);

        if (existingOffering.length > 0) {
          offeringId = existingOffering[0].id;
        } else {
          const inserted = await db
            .insert(courseOfferings)
            .values({
              termId: row.termId,
              courseId: row.courseId,
            })
            .returning({ id: courseOfferings.id });
          offeringId = inserted[0].id;
        }
        offeringCache.set(offeringKey, offeringId);
      }

      // 2. Resolve or Insert Class Section
      const sectionKey = `${offeringId}:${row.kelas}`;
      let sectionId = sectionCache.get(sectionKey);

      if (!sectionId) {
        const existingSection = await db
          .select({ id: classSections.id })
          .from(classSections)
          .where(
            and(
              eq(classSections.offeringId, offeringId),
              eq(classSections.name, row.kelas)
            )
          )
          .limit(1);

        if (existingSection.length > 0) {
          sectionId = existingSection[0].id;
        } else {
          const insertedSection = await db
            .insert(classSections)
            .values({
              offeringId,
              name: row.kelas,
            })
            .returning({ id: classSections.id });
          sectionId = insertedSection[0].id;
        }
        sectionCache.set(sectionKey, sectionId);
      }

      // 3. Idempotent Enrollment
      const existingEnrollment = await db
        .select({ id: enrollments.id })
        .from(enrollments)
        .where(
          and(
            eq(enrollments.profileId, row.profileId),
            eq(enrollments.classSectionId, sectionId)
          )
        )
        .limit(1);

      if (existingEnrollment.length > 0) {
        alreadyEnrolledCount++;
      } else {
        await db.insert(enrollments).values({
          profileId: row.profileId,
          classSectionId: sectionId,
        });
        enrolledCount++;
      }

      // 4. Resolve Study Group (if specified)
      if (row.kelompok) {
        const groupKey = `${sectionId}:${row.kelompok}`;
        let groupId = groupCache.get(groupKey);

        if (!groupId) {
          const existingGroup = await db
            .select({ id: studyGroups.id })
            .from(studyGroups)
            .where(
              and(
                eq(studyGroups.classSectionId, sectionId),
                eq(studyGroups.name, row.kelompok)
              )
            )
            .limit(1);

          if (existingGroup.length > 0) {
            groupId = existingGroup[0].id;
          } else {
            const insertedGroup = await db
              .insert(studyGroups)
              .values({
                classSectionId: sectionId,
                name: row.kelompok,
              })
              .returning({ id: studyGroups.id });
            groupId = insertedGroup[0].id;
          }
          groupCache.set(groupKey, groupId);
        }

        // Idempotent Study Group Membership
        const existingMember = await db
          .select({ id: studyGroupMembers.id })
          .from(studyGroupMembers)
          .where(
            and(
              eq(studyGroupMembers.profileId, row.profileId),
              eq(studyGroupMembers.studyGroupId, groupId)
            )
          )
          .limit(1);

        if (existingMember.length === 0) {
          await db.insert(studyGroupMembers).values({
            profileId: row.profileId,
            studyGroupId: groupId,
          });
          groupsAssignedCount++;
        }
      }
    } catch (err) {
      errors.push({
        row: i + 1,
        nim: row.nim,
        kodeMataKuliah: row.courseCode,
        message: err instanceof Error ? err.message : String(err),
      });
    }
  }

  // Audit log
  await db.insert(auditLogs).values({
    actorId,
    action: 'CSV_ACADEMIC_MAPPING_IMPORT_EXECUTED',
    entityType: 'enrollments',
    entityId: actorId,
    newValues: {
      totalSubmitted: validRows.length,
      enrolledCount,
      alreadyEnrolledCount,
      groupsAssignedCount,
      errorCount: errors.length,
    },
  });

  return {
    success: errors.length === 0,
    totalRows: validRows.length,
    enrolledCount,
    alreadyEnrolledCount,
    groupsAssignedCount,
    errorCount: errors.length,
    errors,
  };
}
