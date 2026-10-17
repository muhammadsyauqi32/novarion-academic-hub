import * as React from 'react';
import { getDb, userPermissions, profiles } from '@novarion/db';
import { eq, and, or, isNull } from 'drizzle-orm';
import { AppPermission, AuthenticatedUser, UserPermissionItem } from '@novarion/shared';
import { requireAuth } from './guards';

const reactCache = typeof React.cache === 'function' ? React.cache : <T extends (...args: any[]) => any>(fn: T): T => fn;

export { PERMISSION_PRESETS } from './presets';

/**
 * Mengambil daftar izin granular milik user tertentu secara efisien dengan request-scoped memoization.
 */
export const getUserPermissions = reactCache(async (profileId: string): Promise<UserPermissionItem[]> => {
  try {
    const db = getDb();
    const rows = await db
      .select()
      .from(userPermissions)
      .where(eq(userPermissions.profileId, profileId));

    return rows.map((r) => ({
      id: r.id,
      profileId: r.profileId,
      permission: r.permission as AppPermission,
      termId: r.termId,
      courseId: r.courseId,
      classSectionId: r.classSectionId,
      studyGroupId: r.studyGroupId,
      grantedBy: r.grantedBy,
      grantedAt: r.grantedAt,
    }));
  } catch (err) {
    console.error('[getUserPermissions] Error fetching permissions:', err);
    return [];
  }
});

/**
 * Memeriksa apakah seorang pengguna memiliki permission tertentu, dengan mempertimbangkan scope opsional.
 * Catatan: Super Admin (role === 'admin' atau memiliki 'permissions.manage') otomatis memiliki seluruh permission.
 */
export async function hasPermission(
  user: AuthenticatedUser,
  permission: AppPermission,
  scope?: { courseId?: string; classSectionId?: string; studyGroupId?: string }
): Promise<boolean> {
  if (user.role === 'admin') {
    return true;
  }

  const permissions = await getUserPermissions(user.id);
  
  // Jika user memiliki permission Super Admin
  if (permissions.some((p) => p.permission === 'permissions.manage')) {
    return true;
  }

  return permissions.some((p) => {
    if (p.permission !== permission) return false;

    // Jika permission tidak memiliki batasan scope (berlaku universal / angkatan)
    if (!p.courseId && !p.classSectionId && !p.studyGroupId) {
      return true;
    }

    // Jika permission memiliki scope dan dicocokkan dengan request scope
    if (scope?.courseId && p.courseId && p.courseId === scope.courseId) {
      return true;
    }
    if (scope?.classSectionId && p.classSectionId && p.classSectionId === scope.classSectionId) {
      return true;
    }
    if (scope?.studyGroupId && p.studyGroupId && p.studyGroupId === scope.studyGroupId) {
      return true;
    }

    return false;
  });
}

/**
 * Guard untuk Server Actions atau halaman yang membutuhkan permission tertentu.
 */
export async function requirePermission(
  permission: AppPermission,
  scope?: { courseId?: string; classSectionId?: string; studyGroupId?: string }
): Promise<AuthenticatedUser> {
  const user = await requireAuth();

  const allowed = await hasPermission(user, permission, scope);
  if (!allowed) {
    throw new Error(`Akses ditolak: Anda tidak memiliki izin '${permission}' yang diperlukan.`);
  }

  return user;
}

/**
 * Memeriksa apakah user adalah Super Admin murni.
 */
export async function isSuperAdmin(userOrId: AuthenticatedUser | string): Promise<boolean> {
  const profileId = typeof userOrId === 'string' ? userOrId : userOrId.id;
  if (typeof userOrId !== 'string' && userOrId.role === 'admin') {
    return true;
  }
  const permissions = await getUserPermissions(profileId);
  return permissions.some((p) => p.permission === 'permissions.manage');
}
