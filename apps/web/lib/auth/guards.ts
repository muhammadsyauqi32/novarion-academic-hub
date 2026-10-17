import * as React from 'react';
import { createClient } from '../supabase/server';
import { getDb, profiles, studentWhitelist } from '@novarion/db';
import { eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import { UserRole, AuthenticatedUser } from '@novarion/shared';

export type { AuthenticatedUser };
export type UserProfile = AuthenticatedUser;

export interface RequireAuthOptions {
  allowPasswordChange?: boolean;
}

// Aman di runtime Next.js RSC maupun di Node/vitest
const reactCache = typeof React.cache === 'function' ? React.cache : <T extends (...args: any[]) => any>(fn: T): T => fn;

/**
 * Mengambil session dan profil pengguna terautentikasi yang terverifikasi whitelist.
 * Memastikan bahwa pengguna yang dinonaktifkan langsung kehilangan akses seketika.
 * Menggunakan React cache() agar hanya dievaluasi sekali per siklus request.
 */
export const getCurrentUser = reactCache(async (): Promise<AuthenticatedUser | null> => {

  try {
    const supabase = createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user || !user.email) {
      return null;
    }

    const db = getDb();
    const email = user.email.toLowerCase();

    // 1. Cek profil langsung berdasarkan user.id
    const profileRows = await db
      .select()
      .from(profiles)
      .where(eq(profiles.id, user.id))
      .limit(1);

    if (profileRows.length > 0) {
      const p = profileRows[0];

      // Verifikasi status keaktifan pada student_whitelist
      const whitelistRows = await db
        .select()
        .from(studentWhitelist)
        .where(eq(studentWhitelist.nim, p.nim))
        .limit(1);

      if (whitelistRows.length > 0 && !whitelistRows[0].isActive) {
        console.warn(`[getCurrentUser] Akses ditolak: Mahasiswa ${p.nim} dinonaktifkan.`);
        await supabase.auth.signOut();
        return null;
      }

      return {
        id: p.id,
        email: p.email,
        nim: p.nim,
        fullName: p.fullName,
        role: p.role as UserRole,
        avatarUrl: p.avatarUrl,
        mustChangePassword: p.mustChangePassword,
      };
    }

    // 2. Jika profil belum ada, cek apakah email ada dalam student_whitelist yang aktif
    const whitelistRows = await db
      .select()
      .from(studentWhitelist)
      .where(eq(studentWhitelist.email, email))
      .limit(1);

    if (whitelistRows.length === 0 || !whitelistRows[0].isActive) {
      await supabase.auth.signOut();
      return null;
    }

    const w = whitelistRows[0];
    const avatarUrl = user.user_metadata?.avatar_url || null;

    // 3. Auto-provision profile dari data whitelist yang valid secara idempotent
    const inserted = await db
      .insert(profiles)
      .values({
        id: user.id,
        nim: w.nim,
        email: w.email,
        fullName: w.fullName,
        role: w.role,
        avatarUrl,
        mustChangePassword: true,
      })
      .onConflictDoUpdate({
        target: profiles.id,
        set: {
          nim: w.nim,
          email: w.email,
          fullName: w.fullName,
          role: w.role,
          updatedAt: new Date(),
        },
      })
      .returning();

    return {
      id: user.id,
      email: w.email,
      nim: w.nim,
      fullName: w.fullName,
      role: w.role as UserRole,
      avatarUrl,
      mustChangePassword: inserted[0].mustChangePassword,
    };
  } catch (err) {
    console.error('[getCurrentUser] Error fetching current user:', err);
    return null;
  }
});

/**
 * Guard untuk halaman internal (Student / Admin).
 * Otomatis redirect ke /login jika tidak login.
 * Jika mustChangePassword = true dan tidak allowPasswordChange, otomatis redirect ke /auth/change-password.
 */
export async function requireAuth(options?: RequireAuthOptions): Promise<AuthenticatedUser> {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  // Wajib ganti password pada login pertama / setelah reset oleh admin
  if (user.mustChangePassword && !options?.allowPasswordChange) {
    redirect('/auth/change-password');
  }

  return user;
}

/**
 * Guard khusus untuk workspace admin (/admin/*).
 * Memastikan role pengguna adalah 'admin'.
 */
export async function requireAdmin(): Promise<AuthenticatedUser> {
  const user = await requireAuth();

  if (user.role !== 'admin') {
    redirect('/app'); // Mahasiswa biasa dialihkan ke workspace student
  }

  return user;
}
