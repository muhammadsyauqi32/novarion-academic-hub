import crypto from 'crypto';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { getDb } from './client';
import { studentWhitelist, profiles } from './schema/index';
import { eq, or, sql } from 'drizzle-orm';
import { UserRole } from '@novarion/shared';

export interface ProvisionUserOptions {
  nim: string;
  email: string;
  fullName: string;
  role?: UserRole;
  password?: string;
  mustChangePassword?: boolean;
  isActive?: boolean;
}

export interface ProvisionUserResult {
  id: string;
  nim: string;
  email: string;
  fullName: string;
  role: UserRole;
  temporaryPassword?: string;
  mustChangePassword: boolean;
}

/**
 * Inisialisasi Supabase Admin Client menggunakan Service Role Key resmi.
 */
export function getSupabaseAdmin(): SupabaseClient {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    throw new Error('Konfigurasi URL Supabase (NEXT_PUBLIC_SUPABASE_URL) tidak ditemukan.');
  }

  if (!serviceRoleKey || serviceRoleKey.startsWith('http')) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY belum dikonfigurasi dengan benar di environment. ' +
      'Pastikan menggunakan service_role secret key resmi dari Supabase Dashboard (Project Settings > API).'
    );
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/**
 * Membuat password sementara acak dan unik yang aman serta mudah dibaca.
 * Format: Nvrn-<8 karakter hex acak><karakter khusus>
 */
export function generateSecureTempPassword(): string {
  const randomHex = crypto.randomBytes(4).toString('hex').toUpperCase();
  const special = ['!', '@', '#', '$'][crypto.randomInt(0, 4)];
  return `Nvrn-${randomHex}${special}`;
}

/**
 * Mendapatkan password default untuk keperluan controlled testing.
 * Hanya valid jika minimal 8 karakter.
 */
export function getDefaultStudentPassword(): string {
  const password = process.env.DEFAULT_STUDENT_PASSWORD;

  if (!password || password.length < 8) {
    throw new Error('DEFAULT_STUDENT_PASSWORD wajib diisi pada environment minimal 8 karakter.');
  }

  return password;
}

/**
 * Menyinkronkan dan mem-provision akun menggunakan Supabase Auth Admin API resmi.
 * Menjamin konsistensi antara Supabase Auth, student_whitelist, dan public.profiles.
 * Menolak duplikasi NIM atau Email dan TIDAK PERNAH menimpa password akun yang sudah ada.
 */
export async function provisionUser(options: ProvisionUserOptions): Promise<ProvisionUserResult> {
  const db = getDb();

  const nim = options.nim.trim().toUpperCase();
  const email = options.email.trim().toLowerCase();
  const fullName = options.fullName.trim();
  const role: UserRole = options.role || 'student';
  const isActive = options.isActive ?? true;

  // 1. Validasi duplikasi pada student_whitelist
  const existingWl = await db
    .select()
    .from(studentWhitelist)
    .where(or(sql`UPPER(${studentWhitelist.nim}) = ${nim}`, eq(studentWhitelist.email, email)))
    .limit(1);

  if (existingWl.length > 0) {
    const isNimMatch = existingWl[0].nim.toUpperCase() === nim;
    throw new Error(
      `Akun dengan ${isNimMatch ? 'NIM' : 'email'} '${isNimMatch ? nim : email}' sudah terdaftar di whitelist. Registrasi ditolak untuk mencegah penimpaan akun.`
    );
  }

  // 2. Validasi duplikasi pada public.profiles
  const existingProf = await db
    .select()
    .from(profiles)
    .where(or(sql`UPPER(${profiles.nim}) = ${nim}`, eq(profiles.email, email)))
    .limit(1);

  if (existingProf.length > 0) {
    const isNimMatch = existingProf[0].nim.toUpperCase() === nim;
    throw new Error(
      `Profil dengan ${isNimMatch ? 'NIM' : 'email'} '${isNimMatch ? nim : email}' sudah ada. Registrasi ditolak.`
    );
  }

  const isGeneratedPassword = !options.password;
  const rawPassword = options.password || generateSecureTempPassword();
  const mustChangePassword = options.mustChangePassword ?? isGeneratedPassword;

  // 3. Buat akun baru di Supabase Auth melalui Supabase Auth Admin API
  const supabaseAdmin = getSupabaseAdmin();
  const userMetadata = { full_name: fullName, nim, role };
  const appMetadata = { provider: 'email', providers: ['email'] };

  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password: rawPassword,
    email_confirm: true,
    user_metadata: userMetadata,
    app_metadata: appMetadata,
  });

  if (authError || !authData.user) {
    if (authError?.message?.toLowerCase().includes('already') || authError?.status === 422) {
      throw new Error(`Email '${email}' sudah terdaftar di sistem otentikasi. Akun tidak dapat ditimpa.`);
    }
    throw new Error(`Gagal membuat akun di Supabase Auth: ${authError?.message || 'Kesalahan otentikasi'}`);
  }

  const userId = authData.user.id;

  // 4. Sinkronkan ke student_whitelist dan public.profiles dengan proteksi rollback
  try {
    await db.insert(studentWhitelist).values({
      nim,
      email,
      fullName,
      role,
      isActive,
    });

    await db.insert(profiles).values({
      id: userId,
      nim,
      email,
      fullName,
      role,
      mustChangePassword,
    });

    return {
      id: userId,
      nim,
      email,
      fullName,
      role,
      temporaryPassword: isGeneratedPassword ? rawPassword : options.password,
      mustChangePassword,
    };
  } catch (dbErr) {
    // Rollback akun di Supabase Auth jika penyimpanan database lokal gagal
    console.error('[provisionUser] Sinkronisasi DB gagal. Membatalkan user di Supabase Auth:', dbErr);
    try {
      await supabaseAdmin.auth.admin.deleteUser(userId);
    } catch (rollbackErr) {
      console.error('[provisionUser] Gagal rollback user Supabase Auth:', rollbackErr);
    }
    throw new Error(
      `Gagal menyinkronkan data mahasiswa ke database: ${dbErr instanceof Error ? dbErr.message : String(dbErr)}`
    );
  }
}

/**
 * Mereset password mahasiswa oleh admin menggunakan Supabase Auth Admin API.
 * Menghasilkan password sementara baru dan mengaktifkan must_change_password.
 */
export async function resetUserPassword(
  nimOrUserId: string,
  newPassword?: string
): Promise<{ temporaryPassword: string }> {
  const db = getDb();
  const tempPassword = newPassword || generateSecureTempPassword();

  // Cari user di profiles atau studentWhitelist
  let userRow: { id: string; email: string; nim: string } | null = null;

  const byId = await db.select().from(profiles).where(eq(profiles.id, nimOrUserId)).limit(1);
  if (byId.length > 0) {
    userRow = { id: byId[0].id, email: byId[0].email, nim: byId[0].nim };
  } else {
    const normalizedNim = nimOrUserId.trim().toUpperCase();
    const byNim = await db
      .select()
      .from(studentWhitelist)
      .where(sql`UPPER(${studentWhitelist.nim}) = ${normalizedNim}`)
      .limit(1);

    if (byNim.length > 0) {
      const p = await db.select().from(profiles).where(eq(profiles.nim, byNim[0].nim)).limit(1);
      if (p.length > 0) {
        userRow = { id: p[0].id, email: p[0].email, nim: p[0].nim };
      }
    }
  }

  if (!userRow) {
    throw new Error(`Pengguna dengan identitas '${nimOrUserId}' tidak ditemukan.`);
  }

  // Perbarui password di Supabase Auth via Admin API
  const supabaseAdmin = getSupabaseAdmin();
  const { error: resetError } = await supabaseAdmin.auth.admin.updateUserById(userRow.id, {
    password: tempPassword,
  });

  if (resetError) {
    throw new Error(`Gagal mereset kata sandi di Supabase Auth: ${resetError.message}`);
  }

  // Pasang must_change_password = true di profiles
  await db
    .update(profiles)
    .set({
      mustChangePassword: true,
      updatedAt: new Date(),
    })
    .where(eq(profiles.id, userRow.id));

  return { temporaryPassword: tempPassword };
}

/**
 * Mengubah password sendiri oleh mahasiswa/admin via Supabase Admin API
 * dan mematikan must_change_password di public.profiles.
 */
export async function updateUserPassword(userId: string, newPassword: string): Promise<void> {
  const db = getDb();
  const supabaseAdmin = getSupabaseAdmin();

  const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
    password: newPassword,
  });

  if (updateError) {
    throw new Error(`Gagal memperbarui kata sandi di Supabase Auth: ${updateError.message}`);
  }

  await db
    .update(profiles)
    .set({
      mustChangePassword: false,
      updatedAt: new Date(),
    })
    .where(eq(profiles.id, userId));
}

/**
 * Verifikasi kata sandi saat ini menggunakan autentikasi resmi Supabase Auth.
 */
export async function verifyUserPassword(userId: string, currentPassword: string): Promise<boolean> {
  const db = getDb();

  const byId = await db.select().from(profiles).where(eq(profiles.id, userId)).limit(1);
  if (byId.length === 0) return false;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Konfigurasi URL Supabase atau Anon Key tidak tersedia.');
  }

  const verifyClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  const { data, error } = await verifyClient.auth.signInWithPassword({
    email: byId[0].email,
    password: currentPassword,
  });

  return !error && !!data.user;
}
