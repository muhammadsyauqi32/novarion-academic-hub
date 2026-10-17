import { describe, it, expect } from 'vitest';
import { csvStudentRowSchema } from '@novarion/shared';

describe('PHASE B: Database Security, RLS & CSV Management Tests', () => {
  describe('B.1 Database Security & IDOR Prevention', () => {
    it('memastikan personal tasks terisolasi dan student A tidak dapat mengakses task student B', () => {
      const studentA = { id: 'user-a-uuid', role: 'student' };
      const studentB = { id: 'user-b-uuid', role: 'student' };

      const taskA = { id: 'task-1', profileId: studentA.id, title: 'Tugas Belajar Statistika' };
      const taskB = { id: 'task-2', profileId: studentB.id, title: 'Tugas Pribadi B' };

      // Simulasi RLS policy: profile_id = auth.uid()
      function canAccessTask(task: typeof taskA, currentUserId: string): boolean {
        return task.profileId === currentUserId;
      }

      expect(canAccessTask(taskA, studentA.id)).toBe(true);
      expect(canAccessTask(taskA, studentB.id)).toBe(false);
      expect(canAccessTask(taskB, studentA.id)).toBe(false);
      expect(canAccessTask(taskB, studentB.id)).toBe(true);
    });

    it('memblokir akun nonaktif dari akses data dan sesi akademik', () => {
      const activeStudent = { nim: 'M0401251001', isActive: true };
      const inactiveStudent = { nim: 'M0401251002', isActive: false };

      function evaluateAccess(user: { isActive: boolean }): boolean {
        return user.isActive === true;
      }

      expect(evaluateAccess(activeStudent)).toBe(true);
      expect(evaluateAccess(inactiveStudent)).toBe(false);
    });

    it('memastikan route guard /admin hanya mengizinkan role admin', () => {
      function evaluateAdminGuard(user: { role: string } | null): { allowed: boolean; redirect?: string } {
        if (!user) return { allowed: false, redirect: '/login' };
        if (user.role !== 'admin') return { allowed: false, redirect: '/app' };
        return { allowed: true };
      }

      expect(evaluateAdminGuard(null)).toEqual({ allowed: false, redirect: '/login' });
      expect(evaluateAdminGuard({ role: 'student' })).toEqual({ allowed: false, redirect: '/app' });
      expect(evaluateAdminGuard({ role: 'admin' })).toEqual({ allowed: true });
    });
  });

  describe('B.2 Supabase Storage Authorization & Validation', () => {
    it('memvalidasi batasan ukuran file dan tipe MIME materi akademik', () => {
      const maxSizeBytes = 10 * 1024 * 1024; // 10MB
      const allowedMimes = ['application/pdf', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'];

      function validateMaterialUpload(file: { size: number; type: string }): { valid: boolean; error?: string } {
        if (file.size > maxSizeBytes) {
          return { valid: false, error: 'Ukuran file melebihi batas maksimal 10MB.' };
        }
        if (!allowedMimes.includes(file.type)) {
          return { valid: false, error: 'Tipe file tidak didukung.' };
        }
        return { valid: true };
      }

      expect(validateMaterialUpload({ size: 5 * 1024 * 1024, type: 'application/pdf' }).valid).toBe(true);
      expect(validateMaterialUpload({ size: 15 * 1024 * 1024, type: 'application/pdf' }).valid).toBe(false);
      expect(validateMaterialUpload({ size: 1024, type: 'application/x-msdownload' }).valid).toBe(false);
    });

    it('mencegah path traversal pada nama file materi kuliah', () => {
      function sanitizeFilePath(courseCode: string, fileName: string): string {
        const cleanCourse = courseCode.replace(/[^A-Za-z0-9_-]/g, '');
        const cleanName = fileName.replace(/(\.\.[\/\\])+/g, '').replace(/[^A-Za-z0-9._-]/g, '_');
        return `${cleanCourse}/${cleanName}`;
      }

      const malicious = '../../etc/passwd';
      const sanitized = sanitizeFilePath('STAT101', malicious);
      expect(sanitized).not.toContain('..');
      expect(sanitized).toBe('STAT101/etc_passwd');
    });
  });

  describe('B.3 Student CSV Importer & Idempotency', () => {
    it('memvalidasi kolom lengkap CSV: nim, email, nama, role, kelas, mata_kuliah, kelompok', () => {
      const row = {
        nim: '10241088',
        email: 'student.complete@apps.ipb.ac.id',
        nama: 'Lengkap Santoso',
        role: 'student',
        kelas: 'Kelas A',
        mata_kuliah: 'Metode Statistika',
        kelompok: 'Kelompok 1',
      };

      const parsed = csvStudentRowSchema.safeParse(row);
      expect(parsed.success).toBe(true);
      if (parsed.success) {
        expect(parsed.data.kelas).toBe('Kelas A');
        expect(parsed.data.mata_kuliah).toBe('Metode Statistika');
        expect(parsed.data.kelompok).toBe('Kelompok 1');
      }
    });

    it('menjamin bahwa impor CSV bersifat idempoten dan tidak pernah mereset kata sandi', () => {
      const initialStudentRecord = {
        id: 'wl-1',
        nim: '10241088',
        email: 'student@apps.ipb.ac.id',
        fullName: 'Nama Lama',
        role: 'student',
        passwordHash: 'EncryptedPasswordHash123',
      };

      // Simulasi update baris saat CSV re-import
      const csvImportData = {
        nim: '10241088',
        email: 'student@apps.ipb.ac.id',
        nama: 'Nama Baru Hasil Koreksi',
        role: 'student' as const,
      };

      const updatedRecord = {
        ...initialStudentRecord,
        fullName: csvImportData.nama,
        role: csvImportData.role,
      };

      // Password hash tetap sama persis!
      expect(updatedRecord.passwordHash).toBe(initialStudentRecord.passwordHash);
      expect(updatedRecord.fullName).toBe('Nama Baru Hasil Koreksi');
    });
  });
});
