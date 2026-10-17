'use server';

import { createClient } from '@/lib/supabase/server';
import { getDb, studentWhitelist, profiles, updateUserPassword, verifyUserPassword } from '@novarion/db';
import { loginSchema, changePasswordSchema } from '@novarion/shared';
import { eq } from 'drizzle-orm';
import { authRateLimiter } from '@/lib/auth/rate-limiter';
import { headers } from 'next/headers';
import { requireAuth } from '@/lib/auth/guards';
import { revalidatePath } from 'next/cache';

/**
 * Mendapatkan IP klien untuk keperluan rate-limiting yang aman
 */
function getClientIp(): string {
  try {
    const headersList = headers();
    const forwardedFor = headersList.get('x-forwarded-for');
    if (forwardedFor) {
      return forwardedFor.split(',')[0].trim();
    }
    return headersList.get('x-real-ip') || '127.0.0.1';
  } catch {
    return '127.0.0.1';
  }
}

/**
 * Delay tiruan untuk mencegah timing attacks / user enumeration
 */
async function timingDelay(minMs: number = 250, maxMs: number = 350) {
  const ms = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
  await new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Helper bounded timeout untuk mencegah request gantung permanen
 */
function withTimeout<T>(promise: Promise<T>, timeoutMs: number, operationName: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`Timeout: Operasi ${operationName} melampaui batas waktu ${timeoutMs}ms.`)), timeoutMs)
    ),
  ]);
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
  const tTotalStart = performance.now();
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

  try {
    const db = getDb();

    // 3. Cari NIM pada student_whitelist menggunakan index B-tree
    const tWhitelistStart = performance.now();
    const studentRows = await withTimeout(
      db
        .select()
        .from(studentWhitelist)
        .where(eq(studentWhitelist.nim, normalizedNim))
        .limit(1),
      8000,
      'Lookup Whitelist'
    );
    const whitelistDuration = performance.now() - tWhitelistStart;

    if (studentRows.length === 0 || !studentRows[0].isActive) {
      await timingDelay();
      authRateLimiter.recordFailure(ipRateKey);
      authRateLimiter.recordFailure(nimRateKey);
      console.warn(
        `[AuthAction] Gagal login (NIM tidak aktif/terdaftar) - NIM: ${normalizedNim.slice(0, 3)}*** - Whitelist: ${whitelistDuration.toFixed(1)}ms`
      );
      return {
        success: false,
        error: 'NIM atau kata sandi tidak valid. Hubungi Admin Angkatan jika mengalami kendala.',
      };
    }

    const student = studentRows[0];
    const supabase = createClient();

    // 4. Autentikasi ke Supabase Auth menggunakan email terdaftar di backend
    const tAuthStart = performance.now();
    const { data, error } = await withTimeout(
      supabase.auth.signInWithPassword({
        email: student.email,
        password: password,
      }),
      10000,
      'Supabase Auth'
    );
    const authDuration = performance.now() - tAuthStart;

    if (error || !data.user) {
      await timingDelay();
      authRateLimiter.recordFailure(ipRateKey);
      authRateLimiter.recordFailure(nimRateKey);
      console.warn(
        `[AuthAction] Gagal login (Kredensial salah) - NIM: ${normalizedNim.slice(0, 3)}*** - Whitelist: ${whitelistDuration.toFixed(1)}ms, Auth: ${authDuration.toFixed(1)}ms`
      );
      return {
        success: false,
        error: 'NIM atau kata sandi tidak valid. Hubungi Admin Angkatan jika mengalami kendala.',
      };
    }

    // 5. Autentikasi berhasil: Reset rate limiting counters
    authRateLimiter.reset(ipRateKey);
    authRateLimiter.reset(nimRateKey);

    // 6. Sinkronkan profil pengguna di public.profiles
    const tProfileStart = performance.now();
    const profileRows = await withTimeout(
      db
        .select()
        .from(profiles)
        .where(eq(profiles.id, data.user.id))
        .limit(1),
      8000,
      'Lookup Profile'
    );

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
      mustChangePassword = inserted[0]?.mustChangePassword ?? true;
    } else {
      mustChangePassword = profileRows[0].mustChangePassword;
      // Perbarui data HANYA jika ada perbedaan nama/role di whitelist
      if (
        profileRows[0].fullName !== student.fullName ||
        profileRows[0].role !== student.role
      ) {
        await db
          .update(profiles)
          .set({
            fullName: student.fullName,
            role: student.role,
            updatedAt: new Date(),
          })
          .where(eq(profiles.id, data.user.id));
      }
    }
    const profileDuration = performance.now() - tProfileStart;
    const totalDuration = performance.now() - tTotalStart;

    console.log(
      `[AuthAction] Login berhasil - NIM: ${normalizedNim.slice(0, 3)}*** - Whitelist: ${whitelistDuration.toFixed(1)}ms, Auth: ${authDuration.toFixed(1)}ms, Profile: ${profileDuration.toFixed(1)}ms, Total: ${totalDuration.toFixed(1)}ms`
    );

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
  } catch (err) {
    const totalDuration = performance.now() - tTotalStart;
    console.error(`[AuthAction] Sistem error setelah ${totalDuration.toFixed(1)}ms:`, err instanceof Error ? err.message : String(err));
    return {
      success: false,
      error: 'Terjadi kendala koneksi ke server autentikasi. Silakan coba kembali dalam beberapa saat.',
    };
  }
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
  const user = await requireAuth({ allowPasswordChange: true });

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

  // Perbarui juga sesi pengguna saat ini jika memungkinkan
  try {
    const supabase = createClient();
    await supabase.auth.updateUser({ password: newPassword });
  } catch {
    // Sesi tetap valid atau diperbarui via Supabase Admin API
  }

  revalidatePath('/app/account');
  revalidatePath('/admin');
  revalidatePath('/app');
  revalidatePath('/auth/change-password');

  const targetUrl = user.role === 'admin' ? '/admin' : '/app';
  return {
    success: true,
    redirectTo: targetUrl,
  };
}
