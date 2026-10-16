'use server';

import { requireAdmin } from '@/lib/auth/guards';
import { getDb, studentWhitelist, auditLogs, provisionUser, resetUserPassword } from '@novarion/db';
import { studentWhitelistSchema } from '@novarion/shared';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function addWhitelistStudentAction(formData: FormData) {
  const admin = await requireAdmin();
  const db = getDb();

  const rawData = {
    nim: formData.get('nim'),
    email: formData.get('email'),
    full_name: formData.get('full_name'),
    role: formData.get('role') || 'student',
    is_active: true,
  };

  const parsed = studentWhitelistSchema.safeParse(rawData);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors.map((e) => e.message).join(', '),
    };
  }

  const { nim, email, full_name, role, is_active } = parsed.data;

  try {
    const existing = await db
      .select()
      .from(studentWhitelist)
      .where(eq(studentWhitelist.nim, nim))
      .limit(1);

    if (existing.length > 0) {
      return { success: false, error: `Mahasiswa dengan NIM ${nim} sudah terdaftar.` };
    }

    // Provision akun secara aman di auth.users, student_whitelist, dan profiles
    const provisionResult = await provisionUser({
      nim,
      email,
      fullName: full_name,
      role,
      isActive: is_active,
      mustChangePassword: true,
    });

    // Audit log
    await db.insert(auditLogs).values({
      actorId: admin.id,
      action: 'WHITELIST_STUDENT_ADDED',
      entityType: 'student_whitelist',
      entityId: provisionResult.id,
      newValues: { nim, email, full_name, role },
    });

    revalidatePath('/admin/students');
    return {
      success: true,
      temporaryPassword: provisionResult.temporaryPassword,
    };
  } catch (err) {
    console.error('[addWhitelistStudentAction] Error:', err);
    return { success: false, error: err instanceof Error ? err.message : String(err) };
  }
}

export async function resetStudentPasswordAction(nim: string) {
  const admin = await requireAdmin();
  const db = getDb();

  try {
    const { temporaryPassword } = await resetUserPassword(nim);

    await db.insert(auditLogs).values({
      actorId: admin.id,
      action: 'STUDENT_PASSWORD_RESET',
      entityType: 'student_whitelist',
      newValues: { nim },
    });

    revalidatePath('/admin/students');
    return { success: true, temporaryPassword };
  } catch (err) {
    console.error('[resetStudentPasswordAction] Error:', err);
    return { success: false, error: err instanceof Error ? err.message : String(err) };
  }
}

export async function toggleWhitelistStatusAction(id: string, currentStatus: boolean) {
  const admin = await requireAdmin();
  const db = getDb();

  try {
    await db
      .update(studentWhitelist)
      .set({
        isActive: !currentStatus,
        updatedAt: new Date(),
      })
      .where(eq(studentWhitelist.id, id));

    await db.insert(auditLogs).values({
      actorId: admin.id,
      action: 'WHITELIST_STATUS_TOGGLED',
      entityType: 'student_whitelist',
      entityId: id,
      newValues: { isActive: !currentStatus },
    });

    revalidatePath('/admin/students');
    return { success: true };
  } catch (err) {
    console.error('[toggleWhitelistStatusAction] Error:', err);
    return { success: false, error: err instanceof Error ? err.message : String(err) };
  }
}
