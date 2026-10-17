'use server';

import { getDb, userPermissions, profiles, studentWhitelist, auditLogs } from '@novarion/db';
import { eq, or, ilike, sql } from 'drizzle-orm';
import { requireAuth } from '@/lib/auth/guards';
import { isSuperAdmin, PERMISSION_PRESETS } from '@/lib/auth/permissions';
import { AppPermission } from '@novarion/shared';
import { revalidatePath } from 'next/cache';

export async function getStudentsPermissionsListAction(searchQuery?: string) {
  const user = await requireAuth();
  const superAdmin = await isSuperAdmin(user);
  if (!superAdmin) {
    throw new Error('Akses ditolak: Hanya Super Admin yang berhak mengelola permission.');
  }

  const db = getDb();
  let query = db
    .select({
      id: profiles.id,
      nim: profiles.nim,
      fullName: profiles.fullName,
      email: profiles.email,
      role: profiles.role,
      whitelistActive: studentWhitelist.isActive,
    })
    .from(profiles)
    .innerJoin(studentWhitelist, eq(profiles.nim, studentWhitelist.nim));

  const trimmed = searchQuery?.trim();
  let studentRows;
  if (trimmed) {
    studentRows = await query
      .where(
        or(
          ilike(profiles.nim, `%${trimmed}%`),
          ilike(profiles.fullName, `%${trimmed}%`),
          ilike(profiles.email, `%${trimmed}%`)
        )
      )
      .limit(50);
  } else {
    studentRows = await query.limit(50);
  }

  // Ambil semua permissions untuk profile yang didapat
  const permissionsRows = await db.select().from(userPermissions);

  const studentsWithPerms = studentRows.map((s) => ({
    ...s,
    permissions: permissionsRows.filter((p) => p.profileId === s.id),
  }));

  return { success: true, data: studentsWithPerms };
}

export async function grantPermissionAction(params: {
  targetProfileId: string;
  permission: AppPermission;
  termId?: string | null;
  courseId?: string | null;
  classSectionId?: string | null;
  studyGroupId?: string | null;
}) {
  const actor = await requireAuth();
  const superAdmin = await isSuperAdmin(actor);
  if (!superAdmin) {
    return { success: false, error: 'Akses ditolak: Anda bukan Super Admin.' };
  }

  try {
    const db = getDb();
    
    // Cek apakah permission sudah ada persis
    const existing = await db
      .select()
      .from(userPermissions)
      .where(
        eq(userPermissions.profileId, params.targetProfileId)
      );

    const duplicate = existing.find(
      (e) =>
        e.permission === params.permission &&
        (e.courseId || null) === (params.courseId || null) &&
        (e.classSectionId || null) === (params.classSectionId || null) &&
        (e.studyGroupId || null) === (params.studyGroupId || null)
    );

    if (duplicate) {
      return { success: false, error: 'Izin dengan cakupan yang sama sudah dimiliki mahasiswa ini.' };
    }

    const inserted = await db
      .insert(userPermissions)
      .values({
        profileId: params.targetProfileId,
        permission: params.permission,
        termId: params.termId || null,
        courseId: params.courseId || null,
        classSectionId: params.classSectionId || null,
        studyGroupId: params.studyGroupId || null,
        grantedBy: actor.id,
      })
      .returning();

    // Rekam jejak audit log
    await db.insert(auditLogs).values({
      actorId: actor.id,
      action: 'GRANT_PERMISSION',
      entityType: 'user_permission',
      entityId: inserted[0].id,
      newValues: {
        targetProfileId: params.targetProfileId,
        permission: params.permission,
        courseId: params.courseId,
      },
    });

    revalidatePath('/admin/permissions');
    return { success: true, data: inserted[0] };
  } catch (err: any) {
    console.error('[grantPermissionAction] Error:', err);
    return { success: false, error: err.message || 'Gagal memberikan izin.' };
  }
}

export async function grantPresetAction(params: {
  targetProfileId: string;
  presetKey: keyof typeof PERMISSION_PRESETS;
  courseId?: string | null;
  classSectionId?: string | null;
  studyGroupId?: string | null;
}) {
  const actor = await requireAuth();
  const superAdmin = await isSuperAdmin(actor);
  if (!superAdmin) {
    return { success: false, error: 'Akses ditolak: Anda bukan Super Admin.' };
  }

  const preset = PERMISSION_PRESETS[params.presetKey];
  if (!preset) {
    return { success: false, error: 'Preset izin tidak dikenali.' };
  }

  try {
    const db = getDb();
    for (const perm of preset.permissions) {
      await db.insert(userPermissions).values({
        profileId: params.targetProfileId,
        permission: perm,
        courseId: params.courseId || null,
        classSectionId: params.classSectionId || null,
        studyGroupId: params.studyGroupId || null,
        grantedBy: actor.id,
      });
    }

    await db.insert(auditLogs).values({
      actorId: actor.id,
      action: 'GRANT_PRESET_PERMISSIONS',
      entityType: 'user_permission',
      newValues: {
        targetProfileId: params.targetProfileId,
        presetKey: params.presetKey,
      },
    });

    revalidatePath('/admin/permissions');
    return { success: true };
  } catch (err: any) {
    console.error('[grantPresetAction] Error:', err);
    return { success: false, error: err.message || 'Gagal memberikan preset izin.' };
  }
}

export async function revokePermissionAction(permissionId: string) {
  const actor = await requireAuth();
  const superAdmin = await isSuperAdmin(actor);
  if (!superAdmin) {
    return { success: false, error: 'Akses ditolak: Anda bukan Super Admin.' };
  }

  try {
    const db = getDb();
    const deleted = await db
      .delete(userPermissions)
      .where(eq(userPermissions.id, permissionId))
      .returning();

    if (deleted.length > 0) {
      await db.insert(auditLogs).values({
        actorId: actor.id,
        action: 'REVOKE_PERMISSION',
        entityType: 'user_permission',
        entityId: permissionId,
        oldValues: deleted[0],
      });
    }

    revalidatePath('/admin/permissions');
    return { success: true };
  } catch (err: any) {
    console.error('[revokePermissionAction] Error:', err);
    return { success: false, error: err.message || 'Gagal mencabut izin.' };
  }
}
