'use server';

import { requireAdmin } from '@/lib/auth/guards';
import { getDb, academicTerms, courses, auditLogs } from '@novarion/db';
import { academicTermSchema, courseSchema } from '@novarion/shared';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function addAcademicTermAction(formData: FormData) {
  const admin = await requireAdmin();
  const db = getDb();

  const rawData = {
    code: formData.get('code'),
    name: formData.get('name'),
    start_date: formData.get('start_date') || undefined,
    end_date: formData.get('end_date') || undefined,
    is_active: formData.get('is_active') === 'true',
  };

  const parsed = academicTermSchema.safeParse(rawData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors.map((e) => e.message).join(', ') };
  }

  const { code, name, start_date, end_date, is_active } = parsed.data;

  try {
    if (is_active) {
      // Jika diset aktif, nonaktifkan semester lain
      await db.update(academicTerms).set({ isActive: false });
    }

    const inserted = await db.insert(academicTerms).values({
      code,
      name,
      startDate: start_date,
      endDate: end_date,
      isActive: is_active,
    }).returning();

    await db.insert(auditLogs).values({
      actorId: admin.id,
      action: 'ACADEMIC_TERM_CREATED',
      entityType: 'academic_terms',
      entityId: inserted[0].id,
      newValues: { code, name, is_active },
    });

    revalidatePath('/admin/academics');
    return { success: true };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}

export async function addCourseAction(formData: FormData) {
  const admin = await requireAdmin();
  const db = getDb();

  const rawData = {
    code: formData.get('code'),
    name: formData.get('name'),
    credits: formData.get('credits'),
  };

  const parsed = courseSchema.safeParse(rawData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors.map((e) => e.message).join(', ') };
  }

  const { code, name, credits } = parsed.data;

  try {
    const inserted = await db.insert(courses).values({
      code,
      name,
      credits,
    }).returning();

    await db.insert(auditLogs).values({
      actorId: admin.id,
      action: 'COURSE_CREATED',
      entityType: 'courses',
      entityId: inserted[0].id,
      newValues: { code, name, credits },
    });

    revalidatePath('/admin/academics');
    return { success: true };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}
