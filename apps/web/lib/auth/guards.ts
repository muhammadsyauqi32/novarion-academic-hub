import { createClient } from '../supabase/server';
import { getDb, profiles, studentWhitelist } from '@novarion/db';
import { eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import { UserRole } from '@novarion/shared';

export interface AuthenticatedUser {
  id: string;
  email: string;
  nim: string;
  fullName: string;
  role: UserRole;
  avatarUrl?: string | null;
}

/**
 * Mengambil session dan profil pengguna terautentikasi yang terverifikasi whitelist
 */
export async function getCurrentUser(): Promise<AuthenticatedUser | null> {
  try {
    const supabase = createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user || !user.email) {
      return null;
    }

    const db = getDb();
    const email = user.email.toLowerCase();

    // 1. Cek apakah profil sudah terbentuk di tabel profiles
    const profileRows = await db
      .select()
      .from(profiles)
      .where(eq(profiles.id, user.id))
      .limit(1);

    if (profileRows.length > 0) {
      const p = profileRows[0];
      return {
        id: p.id,
        email: p.email,
        nim: p.nim,
        fullName: p.fullName,
        role: p.role as UserRole,
        avatarUrl: p.avatarUrl,
      };
    }

    // 2. Jika profil belum ada, cek apakah email ada dalam student_whitelist
    const whitelistRows = await db
      .select()
      .from(studentWhitelist)
      .where(eq(studentWhitelist.email, email))
      .limit(1);

    if (whitelistRows.length === 0 || !whitelistRows[0].isActive) {
      // Email belum ada di whitelist atau dinonaktifkan
      return null;
    }

    const w = whitelistRows[0];
    const avatarUrl = user.user_metadata?.avatar_url || null;

    // 3. Auto-provision profile dari data whitelist yang valid
    await db.insert(profiles).values({
      id: user.id,
      nim: w.nim,
      email: w.email,
      fullName: w.fullName,
      role: w.role,
      avatarUrl,
    });

    return {
      id: user.id,
      email: w.email,
      nim: w.nim,
      fullName: w.fullName,
      role: w.role as UserRole,
      avatarUrl,
    };
  } catch (err) {
    console.error('[getCurrentUser] Error fetching current user:', err);
    return null;
  }
}

/**
 * Guard untuk halaman internal (Student / Admin).
 * Otomatis redirect ke /login atau /auth/invalid-account jika tidak berhak.
 */
export async function requireAuth(): Promise<AuthenticatedUser> {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
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
