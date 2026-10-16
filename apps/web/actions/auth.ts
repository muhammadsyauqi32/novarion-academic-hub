'use server';

import { createClient } from '@/lib/supabase/server';
import { getDb, studentWhitelist, profiles, updateUserPassword, verifyUserPassword } from '@novarion/db';
import { loginSchema, changePasswordSchema } from '@novarion/shared';
import { eq, sql } from 'drizzle-orm';
import { authRateLimiter } from '@/lib/auth/rate-limiter';
import { headers } from 'next/headers';
import { requireAuth } from '@/lib/auth/guards';
import { revalidatePath } from 'next/cache';

/**
 * Mendapatkan IP klien untuk keperluan rate-limiting yang aman
 */
function getClientIp(): string {
  const headersList = headers();
  const forwardedFor = headersList.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  return headersList.get('x-real-ip') || '127.0.0.1';
}

/**
 * Delay tiruan untuk mencegah timing attacks / user enumeration
 */
async function timingDelay(minMs: number = 250, maxMs: number = 350) {
  const ms = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
  await new Promise((resolve) => setTimeout(resolve, ms));
}

export interface LoginActionResult {
  success: boolean;
  error?: string;
  mustChangePassword?: boolean;
  redirectTo?: string;
}

/**
 * Action Login Mahasiswa / Admin menggunakan NIM dan Password
 */
export async function loginWithNimAction(formData: FormData): Promise<LoginActionResult> {
  const rawNim = formData.get('nim');
  const rawPassword = formData.get('password');

  // 1. Validasi Schema Input
  const parsed = loginSchema.safeParse({
    nim: rawNim,
    password: rawPassword,
  });

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors.map((e) => e.message).join(', '),
    };
  }

  const { nim, password } = parsed.data;
  const clientIp = getClientIp();
  const normalizedNim = nim.trim().toUpperCase();

  const ipRateKey = `login:ip:${clientIp}`;
  const nimRateKey = `login:nim:${normalizedNim}`;

  // 2. Proteksi Brute-Force Rate Limiting (Maks 5 percobaan gagal per 15 menit)
  const ipCheck = authRateLimiter.check(ipRateKey, 5, 15 * 60 * 1000);
  const nimCheck = authRateLimiter.check(nimRateKey, 5, 15 * 60 * 1000);

  if (!ipCheck.allowed || !nimCheck.allowed) {
    const waitTime = Math.max(ipCheck.retryAfterSeconds, nimCheck.retryAfterSeconds);
    const minutes = Math.ceil(waitTime / 60);
    return {
      success: false,
      error: `Terlalu banyak percobaan masuk yang gagal. Silakan tunggu ${minutes} menit sebelum mencoba kembali.`,
    };
  }

  const db = getDb();

  // 3. Cari NIM pada student_whitelist (Case-insensitive)
  const studentRows = await db
    .select()
    .from(studentWhitelist)
    .where(sql`UPPER(${studentWhitelist.nim}) = ${normalizedNim}`)
    .limit(1);

  if (studentRows.length === 0 || !studentRows[0].isActive) {
    // Timing mitigation agar waktu respon tidak membocorkan keberadaan NIM
    await timingDelay();
    authRateLimiter.recordFailure(ipRateKey);
    authRateLimiter.recordFailure(nimRateKey);
    return {
      success: false,
      error: 'NIM atau kata sandi tidak valid. Hubungi Admin Angkatan jika mengalami kendala.',
    };
  }

  const student = studentRows[0];
  const supabase = createClient();

  // 4. Autentikasi ke Supabase Auth menggunakan email terdaftar di backend
  const { data, error } = await supabase.auth.signInWithPassword({
    email: student.email,
    password: password,
  });

  if (error || !data.user) {
    await timingDelay();
    authRateLimiter.recordFailure(ipRateKey);
    authRateLimiter.recordFailure(nimRateKey);
    return {
      success: false,
      error: 'NIM atau kata sandi tidak valid. Hubungi Admin Angkatan jika mengalami kendala.',
    };
  }

  // 5. Autentikasi berhasil: Reset rate limiting counters
  authRateLimiter.reset(ipRateKey);
  authRateLimiter.reset(nimRateKey);

  // 6. Sinkronkan profil pengguna di public.profiles
  const profileRows = await db
    .select()
    .from(profiles)
    .where(eq(profiles.id, data.user.id))
    .limit(1);

  let mustChangePassword = false;

  if (profileRows.length === 0) {
    // Buat profil jika belum terbentuk
    const inserted = await db
      .insert(profiles)
      .values({
        id: data.user.id,
        nim: student.nim,
        email: student.email,
        fullName: student.fullName,
        role: student.role,
        mustChangePassword: true,
      })
      .returning();
    mustChangePassword = inserted[0].mustChangePassword;
  } else {
    mustChangePassword = profileRows[0].mustChangePassword;
    // Perbarui data jika ada perubahan di whitelist
    await db
      .update(profiles)
      .set({
        fullName: student.fullName,
        role: student.role,
        updatedAt: new Date(),
      })
      .where(eq(profiles.id, data.user.id));
  }

  // 7. Pengalihan: Jika wajib ganti password, arahkan ke /auth/change-password
  if (mustChangePassword) {
    return {
      success: true,
      mustChangePassword: true,
      redirectTo: '/auth/change-password',
    };
  }

  // Redirect sesuai hak akses peran
  const targetUrl = student.role === 'admin' ? '/admin' : '/app';
  return {
    success: true,
    mustChangePassword: false,
    redirectTo: targetUrl,
  };
}

export interface ChangePasswordActionResult {
  success: boolean;
  error?: string;
  redirectTo?: string;
}

/**
 * Action Mengganti Kata Sandi (Wajib pada login pertama atau sukarela dari profil)
 */
export async function changePasswordAction(formData: FormData): Promise<ChangePasswordActionResult> {
  const user = await requireAuth();

  const rawCurrent = formData.get('currentPassword');
  const rawNew = formData.get('newPassword');
  const rawConfirm = formData.get('confirmPassword');

  const parsed = changePasswordSchema.safeParse({
    currentPassword: rawCurrent,
    newPassword: rawNew,
    confirmPassword: rawConfirm,
  });

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors.map((e) => e.message).join(', '),
    };
  }

  const { currentPassword, newPassword } = parsed.data;

  // 1. Verifikasi kata sandi saat ini
  const isCurrentValid = await verifyUserPassword(user.id, currentPassword);
  if (!isCurrentValid) {
    return {
      success: false,
      error: 'Kata sandi saat ini salah. Pastikan Anda memasukkan kata sandi dengan benar.',
    };
  }

  // 2. Perbarui kata sandi dan set mustChangePassword = false
  await updateUserPassword(user.id, newPassword);

  revalidatePath('/app/account');
  revalidatePath('/admin');
  revalidatePath('/app');

  const targetUrl = user.role === 'admin' ? '/admin' : '/app';
  return {
    success: true,
    redirectTo: targetUrl,
  };
}
