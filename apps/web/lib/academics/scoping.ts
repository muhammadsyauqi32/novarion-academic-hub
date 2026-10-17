import * as React from 'react';
import { getDb, enrollments, classSections, courseOfferings, studyGroupMembers } from '@novarion/db';
import { eq } from 'drizzle-orm';

const reactCache = typeof React.cache === 'function' ? React.cache : <T extends (...args: any[]) => any>(fn: T): T => fn;

export interface StudentAcademicScope {
  courseIds: string[];
  classSectionIds: string[];
  studyGroupIds: string[];
}

/**
 * Mengambil seluruh ID mata kuliah, kelas, dan kelompok yang diikuti oleh mahasiswa.
 * Di-memoize per-request menggunakan React.cache() untuk performa optimal.
 */
export const getStudentAcademicScope = reactCache(async (profileId: string): Promise<StudentAcademicScope> => {
  try {
    const db = getDb();

    // 1. Ambil seluruh kelas yang di-enroll mahasiswa beserta mata kuliahnya
    const enrollmentRows = await db
      .select({
        classSectionId: enrollments.classSectionId,
        courseId: courseOfferings.courseId,
      })
      .from(enrollments)
      .innerJoin(classSections, eq(enrollments.classSectionId, classSections.id))
      .innerJoin(courseOfferings, eq(classSections.offeringId, courseOfferings.id))
      .where(eq(enrollments.profileId, profileId));

    // 2. Ambil seluruh kelompok studi yang diikuti mahasiswa
    const groupRows = await db
      .select({
        studyGroupId: studyGroupMembers.studyGroupId,
      })
      .from(studyGroupMembers)
      .where(eq(studyGroupMembers.profileId, profileId));

    const courseIds = Array.from(new Set(enrollmentRows.map((r) => r.courseId)));
    const classSectionIds = Array.from(new Set(enrollmentRows.map((r) => r.classSectionId)));
    const studyGroupIds = Array.from(new Set(groupRows.map((r) => r.studyGroupId)));

    return {
      courseIds,
      classSectionIds,
      studyGroupIds,
    };
  } catch (err) {
    console.error('[getStudentAcademicScope] Error fetching student academic scope:', err);
    return {
      courseIds: [],
      classSectionIds: [],
      studyGroupIds: [],
    };
  }
});
