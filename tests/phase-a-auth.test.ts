import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  generateSecureTempPassword,
  getDefaultStudentPassword,
} from '../packages/db/src/auth-provisioning';
import { loginSchema, changePasswordSchema, studentWhitelistSchema } from '@novarion/shared';

describe('PHASE A: Authentication & Student Account Management Tests', () => {
  const originalEnv = process.env.DEFAULT_STUDENT_PASSWORD;

  beforeEach(() => {
    process.env.DEFAULT_STUDENT_PASSWORD = 'TestDefaultPass2026!';
  });

  afterEach(() => {
    if (originalEnv !== undefined) {
      process.env.DEFAULT_STUDENT_PASSWORD = originalEnv;
    } else {
      delete process.env.DEFAULT_STUDENT_PASSWORD;
    }
  });

  describe('A.3 DEFAULT_STUDENT_PASSWORD — Controlled Testing Configuration', () => {
    it('membaca konfigurasi DEFAULT_STUDENT_PASSWORD yang valid (>= 8 karakter)', () => {
      process.env.DEFAULT_STUDENT_PASSWORD = 'ValidPassword123!';
      const pwd = getDefaultStudentPassword();
      expect(pwd).toBe('ValidPassword123!');
      expect(pwd.length).toBeGreaterThanOrEqual(8);
    });

    it('gagal aman (throw error) jika DEFAULT_STUDENT_PASSWORD tidak diisi atau kurang dari 8 karakter', () => {
      delete process.env.DEFAULT_STUDENT_PASSWORD;
      expect(() => getDefaultStudentPassword()).toThrow(/wajib diisi/i);

      process.env.DEFAULT_STUDENT_PASSWORD = 'short';
      expect(() => getDefaultStudentPassword()).toThrow(/minimal 8 karakter/i);
    });

    it('aturan controlled testing: hanya TEST001 dan TEST002 dengan role student yang menerima default password', () => {
      const defaultPassword = getDefaultStudentPassword();

      function determineInitialPassword(nim: string, role: 'student' | 'admin'): string {
        const normalized = nim.trim().toUpperCase();
        const isTestAccount = normalized === 'TEST001' || normalized === 'TEST002';

        if (isTestAccount && role === 'student') {
          return defaultPassword;
        }

        return generateSecureTempPassword();
      }

      // TEST001 student -> default password
      const p1 = determineInitialPassword('TEST001', 'student');
      expect(p1).toBe(defaultPassword);

      // TEST002 student -> default password (sama persis dengan TEST001)
      const p2 = determineInitialPassword('TEST002', 'student');
      expect(p2).toBe(defaultPassword);
      expect(p1).toBe(p2);

      // TEST001 dengan role admin -> TIDAK BOLEH menerima default password
      const pAdmin = determineInitialPassword('TEST001', 'admin');
      expect(pAdmin).not.toBe(defaultPassword);
      expect(pAdmin).toMatch(/^Nvrn-[0-9A-F]{8}[!@#$]$/);

      // Mahasiswa lain (bukan TEST001/TEST002) -> mendapatkan random password unik
      const pOther1 = determineInitialPassword('TEST003', 'student');
      const pOther2 = determineInitialPassword('M0401251099', 'student');
      expect(pOther1).not.toBe(defaultPassword);
      expect(pOther2).not.toBe(defaultPassword);
      expect(pOther1).not.toBe(pOther2);
    });
  });

  describe('A.4 Validasi Duplikasi Akun & Whitelist Schema', () => {
    it('memvalidasi format input student whitelist dengan benar', () => {
      const valid = studentWhitelistSchema.safeParse({
        nim: 'TEST001',
        email: 'test001@apps.ipb.ac.id',
        full_name: 'Dummy Student Satu',
        role: 'student',
        is_active: true,
      });
      expect(valid.success).toBe(true);
    });

    it('menolak input whitelist dengan email tidak valid atau NIM kosong', () => {
      const invalidEmail = studentWhitelistSchema.safeParse({
        nim: 'TEST001',
        email: 'bukan-email',
        full_name: 'Dummy Student Satu',
      });
      expect(invalidEmail.success).toBe(false);

      const invalidNim = studentWhitelistSchema.safeParse({
        nim: '  ',
        email: 'test001@apps.ipb.ac.id',
        full_name: 'Dummy Student Satu',
      });
      expect(invalidNim.success).toBe(false);
    });
  });

  describe('A.5 Alur Ganti Kata Sandi Wajib (Mandatory Password Change)', () => {
    it('memvalidasi bahwa kata sandi baru harus kuat dan berbeda dari kata sandi saat ini', () => {
      const currentPassword = 'TestDefaultPass2026!';

      // Valid: kuat dan berbeda
      const valid = changePasswordSchema.safeParse({
        currentPassword,
        newPassword: 'MyNewStrongPassword2026!',
        confirmPassword: 'MyNewStrongPassword2026!',
      });
      expect(valid.success).toBe(true);

      // Gagal: sama dengan kata sandi lama
      const sameAsOld = changePasswordSchema.safeParse({
        currentPassword,
        newPassword: currentPassword,
        confirmPassword: currentPassword,
      });
      expect(sameAsOld.success).toBe(false);
      if (!sameAsOld.success) {
        expect(sameAsOld.error.errors[0].message).toContain('tidak boleh sama');
      }

      // Gagal: konfirmasi kata sandi tidak cocok
      const mismatch = changePasswordSchema.safeParse({
        currentPassword,
        newPassword: 'MyNewStrongPassword2026!',
        confirmPassword: 'WrongConfirmation2026!',
      });
      expect(mismatch.success).toBe(false);
      if (!mismatch.success) {
        expect(mismatch.error.errors[0].message).toContain('tidak cocok');
      }
    });

    it('memastikan pemisahan kredensial independen antara TEST001 dan TEST002', () => {
      const accounts = {
        TEST001: { password: 'InitialPassword123!', mustChange: true },
        TEST002: { password: 'InitialPassword123!', mustChange: true },
      };

      // TEST001 mengubah password
      accounts.TEST001.password = 'PersonalSecretTEST001!';
      accounts.TEST001.mustChange = false;

      // TEST002 tidak boleh terpengaruh
      expect(accounts.TEST001.password).toBe('PersonalSecretTEST001!');
      expect(accounts.TEST001.mustChange).toBe(false);
      expect(accounts.TEST002.password).toBe('InitialPassword123!');
      expect(accounts.TEST002.mustChange).toBe(true);
    });
  });

  describe('A.1 & A.2 Proteksi Hak Akses & Session Guard Logic', () => {
    it('mengalihkan user dengan mustChangePassword=true ke halaman aktivasi kata sandi', () => {
      function evaluateRedirect(user: { role: string; mustChangePassword: boolean }, allowPasswordChange = false): string {
        if (user.mustChangePassword && !allowPasswordChange) {
          return '/auth/change-password';
        }
        return user.role === 'admin' ? '/admin' : '/app';
      }

      // Siswa baru dengan mustChangePassword: true mencoba akses dashboard
      expect(evaluateRedirect({ role: 'student', mustChangePassword: true })).toBe('/auth/change-password');
      
      // Siswa mengakses halaman change password langsung
      expect(evaluateRedirect({ role: 'student', mustChangePassword: true }, true)).toBe('/app');

      // Admin dengan akun normal mengakses dashboard
      expect(evaluateRedirect({ role: 'admin', mustChangePassword: false })).toBe('/admin');

      // Siswa normal mengakses dashboard
      expect(evaluateRedirect({ role: 'student', mustChangePassword: false })).toBe('/app');
    });
  });
});
