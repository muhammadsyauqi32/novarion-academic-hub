'use server';

import { requireAdmin } from '@/lib/auth/guards';
import {
  getDb,
  studentWhitelist,
  profiles,
  auditLogs,
  provisionUser,
  resetUserPassword,
  getDefaultStudentPassword,
} from '@novarion/db';
import { studentWhitelistSchema } from '@novarion/shared';
import { eq, or, sql } from 'drizzle-orm';
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
  const normalizedNim = nim.trim().toUpperCase();

  try {
    // 1. Tolak duplikasi NIM atau Email (Aturan A.3.8)
    const existingWl = await db
      .select()
      .from(studentWhitelist)
      .where(or(sql`UPPER(${studentWhitelist.nim}) = ${normalizedNim}`, eq(studentWhitelist.email, email)))
      .limit(1);

    if (existingWl.length > 0) {
      const isNimMatch = existingWl[0].nim.toUpperCase() === normalizedNim;
      return {
        success: false,
        error: `Mahasiswa dengan ${isNimMatch ? 'NIM' : 'email'} '${isNimMatch ? normalizedNim : email}' sudah terdaftar di whitelist.`,
      };
    }

    const existingProfile = await db
      .select()
      .from(profiles)
      .where(or(sql`UPPER(${profiles.nim}) = ${normalizedNim}`, eq(profiles.email, email)))
      .limit(1);

    if (existingProfile.length > 0) {
      const isNimMatch = existingProfile[0].nim.toUpperCase() === normalizedNim;
      return {
        success: false,
        error: `Profil dengan ${isNimMatch ? 'NIM' : 'email'} '${isNimMatch ? normalizedNim : email}' sudah ada.`,
      };
    }

    // 2. Controlled Testing Password Logic (Aturan A.3)
    // Hanya berlaku untuk dummy student TEST001 dan TEST002 dengan role student.
    // Tidak pernah diaplikasikan ke akun admin.
    const isTestAccount = normalizedNim === 'TEST001' || normalizedNim === 'TEST002';
    let initialPassword: string | undefined = undefined;

    if (isTestAccount && role === 'student') {
      try {
        initialPassword = getDefaultStudentPassword();
      } catch (pwdErr) {
        return {
          success: false,
          error: `Gagal membaca konfigurasi kata sandi uji: ${pwdErr instanceof Error ? pwdErr.message : String(pwdErr)}`,
        };
      }
    }

    // 3. Provision akun via Supabase Auth Admin API & sinkronisasi DB
    const provisionResult = await provisionUser({
      nim: normalizedNim,
      email,
      fullName: full_name,
      role,
      password: initialPassword,
      isActive: is_active,
      mustChangePassword: true,
    });

    // 4. Catat Audit Log
    await db.insert(auditLogs).values({
      actorId: admin.id,
      action: 'WHITELIST_STUDENT_ADDED',
      entityType: 'student_whitelist',
      entityId: provisionResult.id,
      newValues: { nim: normalizedNim, email, full_name, role, isTestAccount },
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
