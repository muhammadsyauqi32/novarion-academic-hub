import React from 'react';
import { requireAdmin } from '@/lib/auth/guards';
import { getDb, academicTerms, courses } from '@novarion/db';
import { desc } from 'drizzle-orm';
import { AcademicsClient } from './AcademicsClient';

export default async function AcademicsPage() {
  await requireAdmin();
  const db = getDb();

  const [allTerms, allCourses] = await Promise.all([
    db.select().from(academicTerms).orderBy(desc(academicTerms.createdAt)),
    db.select().from(courses).orderBy(courses.code),
  ]);

  return <AcademicsClient initialTerms={allTerms} initialCourses={allCourses} />;
}
