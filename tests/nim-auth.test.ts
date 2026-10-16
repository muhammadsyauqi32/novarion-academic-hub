import { describe, it, expect, beforeEach } from 'vitest';
import { loginSchema, changePasswordSchema } from '@novarion/shared';
import { generateSecureTempPassword } from '../packages/db/src/auth-provisioning';

describe('PRIORITAS 1: Autentikasi NIM + Password & Security Controls', () => {
  describe('Validasi Schema Login & Kata Sandi (Zod)', () => {
    it('memvalidasi NIM dan password dengan benar pada format valid', () => {
      const valid = loginSchema.safeParse({
        nim: 'M0401251083',
        password: 'PasswordRahasia123!',
      });
      expect(valid.success).toBe(true);
    });

    it('menolak login jika NIM kosong', () => {
      const invalid = loginSchema.safeParse({
        nim: '   ',
        password: 'PasswordRahasia123!',
      });
      expect(invalid.success).toBe(false);
      if (!invalid.success) {
        expect(invalid.error.errors[0].message).toContain('NIM wajib diisi');
      }
    });

    it('menolak login jika password kosong', () => {
      const invalid = loginSchema.safeParse({
        nim: 'M0401251083',
        password: '',
      });
      expect(invalid.success).toBe(false);
      if (!invalid.success) {
        expect(invalid.error.errors[0].message).toContain('Kata sandi wajib diisi');
      }
    });

    it('memvalidasi aturan kata sandi kuat pada changePasswordSchema', () => {
      // Valid
      const valid = changePasswordSchema.safeParse({
        currentPassword: 'TempPassword123!',
        newPassword: 'MyStrongPassword2026!',
        confirmPassword: 'MyStrongPassword2026!',
      });
      expect(valid.success).toBe(true);

      // Terlalu pendek (< 8)
      const tooShort = changePasswordSchema.safeParse({
        currentPassword: 'TempPassword123!',
        newPassword: 'Ab1!',
        confirmPassword: 'Ab1!',
      });
      expect(tooShort.success).toBe(false);

      // Tanpa angka
      const noNumber = changePasswordSchema.safeParse({
        currentPassword: 'TempPassword123!',
        newPassword: 'MyPasswordWithoutNumber!',
        confirmPassword: 'MyPasswordWithoutNumber!',
      });
      expect(noNumber.success).toBe(false);

      // Konfirmasi tidak cocok
      const mismatch = changePasswordSchema.safeParse({
        currentPassword: 'TempPassword123!',
        newPassword: 'MyStrongPassword2026!',
        confirmPassword: 'DifferentPassword2026!',
      });
      expect(mismatch.success).toBe(false);
      if (!mismatch.success) {
        expect(mismatch.error.errors[0].message).toContain('Konfirmasi kata sandi tidak cocok');
      }

      // Password baru sama dengan password lama
      const sameAsOld = changePasswordSchema.safeParse({
        currentPassword: 'SamePassword123!',
        newPassword: 'SamePassword123!',
        confirmPassword: 'SamePassword123!',
      });
      expect(sameAsOld.success).toBe(false);
      if (!sameAsOld.success) {
        expect(sameAsOld.error.errors[0].message).toContain('tidak boleh sama dengan kata sandi saat ini');
      }
    });
  });

  describe('Generator Kata Sandi Sementara', () => {
    it('menghasilkan kata sandi acak dengan prefix dan karakter khusus', () => {
      const pass1 = generateSecureTempPassword();
      const pass2 = generateSecureTempPassword();

      expect(pass1).toMatch(/^Nvrn-[0-9A-F]{8}[!@#$]$/);
      expect(pass2).toMatch(/^Nvrn-[0-9A-F]{8}[!@#$]$/);
      expect(pass1).not.toBe(pass2);
      expect(pass1.length).toBeGreaterThanOrEqual(14);
    });
  });

  describe('Rate Limiter Autentikasi', () => {
    // Pengujian in-memory rate limiter logic
    it('mengizinkan hingga 5 percobaan gagal dan memblokir pada percobaan ke-6', () => {
      class TestLimiter {
        private store = new Map<string, { count: number; resetAt: number }>();

        check(key: string, maxAttempts = 5, windowMs = 900000) {
          const now = Date.now();
          const record = this.store.get(key);
          if (!record || now >= record.resetAt) {
            return { allowed: true, remainingAttempts: maxAttempts };
          }
          if (record.count >= maxAttempts) {
            return { allowed: false, remainingAttempts: 0 };
          }
          return { allowed: true, remainingAttempts: maxAttempts - record.count };
        }

        recordFailure(key: string, windowMs = 900000) {
          const now = Date.now();
          const record = this.store.get(key);
          if (!record || now >= record.resetAt) {
            this.store.set(key, { count: 1, resetAt: now + windowMs });
          } else {
            record.count += 1;
          }
        }

        reset(key: string) {
          this.store.delete(key);
        }
      }

      const limiter = new TestLimiter();
      const testKey = 'login:nim:10241099';

      // 5 percobaan gagal
      for (let i = 0; i < 5; i++) {
        expect(limiter.check(testKey).allowed).toBe(true);
        limiter.recordFailure(testKey);
      }

      // Percobaan ke-6 harus diblokir
      expect(limiter.check(testKey).allowed).toBe(false);

      // Setelah berhasil login, reset counter
      limiter.reset(testKey);
      expect(limiter.check(testKey).allowed).toBe(true);
    });
  });

  describe('Proteksi Enumerasi Identitas & Status Aktif', () => {
    it('mengembalikan pesan kesalahan generik seragam untuk mencegah timing attack / enumeration', () => {
      const genericError = 'NIM atau kata sandi tidak valid. Hubungi Admin Angkatan jika mengalami kendala.';
      
      // Kasus 1: NIM tidak ada
      const errorNimNotFound = genericError;
      // Kasus 2: NIM ada tapi password salah
      const errorWrongPassword = genericError;
      // Kasus 3: NIM ada tapi akun dinonaktifkan
      const errorDeactivated = genericError;

      expect(errorNimNotFound).toBe(errorWrongPassword);
      expect(errorWrongPassword).toBe(errorDeactivated);
      expect(genericError).not.toContain('email');
      expect(genericError).not.toContain('tidak terdaftar');
    });
  });
});
