import { describe, it, expect } from 'vitest';
import { studentCsvRowSchema } from '../apps/web/lib/csv/student-import';
import { academicMappingRowSchema } from '../apps/web/lib/csv/academic-mapping-import';
import { agendaCsvRowSchema } from '../apps/web/lib/csv/agenda-import';

describe('CSV Module A: Student Data Import Validation', () => {
  it('validates correct student row format', () => {
    const valid = studentCsvRowSchema.safeParse({
      nim: 'G1401201001',
      nama: 'Ahmad Fadillah',
      email: 'ahmad.f@apps.ipb.ac.id',
    });
    expect(valid.success).toBe(true);
  });

  it('rejects invalid email and too short NIM', () => {
    const invalidEmail = studentCsvRowSchema.safeParse({
      nim: 'G1401201001',
      nama: 'Ahmad Fadillah',
      email: 'not-an-email',
    });
    expect(invalidEmail.success).toBe(false);

    const invalidNim = studentCsvRowSchema.safeParse({
      nim: 'G1',
      nama: 'Ahmad Fadillah',
      email: 'ahmad.f@apps.ipb.ac.id',
    });
    expect(invalidNim.success).toBe(false);
  });
});

describe('CSV Module B: Academic Mapping Validation', () => {
  it('validates academic mapping row supporting courses, classes, and groups', () => {
    const row = academicMappingRowSchema.safeParse({
      nim: 'G1401201001',
      semester: '2026-GANJIL',
      kode_mata_kuliah: 'STK211',
      kelas: 'A',
      kelompok: 'Kelompok 1',
    });
    expect(row.success).toBe(true);
  });

  it('allows same NIM across different courses (multi-course enrollment)', () => {
    const row1 = academicMappingRowSchema.safeParse({
      nim: 'G1401201001',
      kode_mata_kuliah: 'STK211',
      kelas: 'A',
    });
    const row2 = academicMappingRowSchema.safeParse({
      nim: 'G1401201001',
      kode_mata_kuliah: 'STK222',
      kelas: 'B',
    });
    expect(row1.success).toBe(true);
    expect(row2.success).toBe(true);
  });

  it('rejects row without mandatory course code or class', () => {
    const missingCourse = academicMappingRowSchema.safeParse({
      nim: 'G1401201001',
      kode_mata_kuliah: '',
      kelas: 'A',
    });
    expect(missingCourse.success).toBe(false);

    const missingClass = academicMappingRowSchema.safeParse({
      nim: 'G1401201001',
      kode_mata_kuliah: 'STK211',
      kelas: '',
    });
    expect(missingClass.success).toBe(false);
  });
});

describe('CSV Module C: Academic Agenda Import Validation', () => {
  it('validates agenda row with valid external_id, title, category, deadline, and custom HEX color', () => {
    const row = agendaCsvRowSchema.safeParse({
      external_id: 'TUGAS-STK211-01',
      judul: 'Tugas 1 Regresi Linear',
      kategori: 'tugas',
      waktu_mulai: '2026-10-20 08:00:00',
      deadline: '2026-10-27 23:59:00',
      kode_mata_kuliah: 'STK211',
      kelas: 'A',
      deskripsi: 'Kumpulkan file PDF laporan praktikum',
      warna: '#41C2A1',
    });
    expect(row.success).toBe(true);
  });

  it('validates acceptable categories and rejects invalid category', () => {
    const validCategories = ['tugas', 'praktikum', 'kuis', 'ujian', 'kuliah', 'kegiatan', 'pengumuman'];
    for (const cat of validCategories) {
      const res = agendaCsvRowSchema.safeParse({
        external_id: 'TEST-01',
        judul: 'Agenda Uji',
        kategori: cat,
        deadline: '2026-10-20 23:59:00',
      });
      expect(res.success).toBe(true);
    }

    const invalid = agendaCsvRowSchema.safeParse({
      external_id: 'TEST-01',
      judul: 'Agenda Uji',
      kategori: 'invalid_category_xyz',
      deadline: '2026-10-20 23:59:00',
    });
    expect(invalid.success).toBe(false);
  });

  it('validates HEX color and rejects invalid color strings', () => {
    const validHex = agendaCsvRowSchema.safeParse({
      external_id: 'TEST-01',
      judul: 'Agenda Uji',
      kategori: 'tugas',
      deadline: '2026-10-20 23:59:00',
      warna: '#FFAE5D',
    });
    expect(validHex.success).toBe(true);

    const invalidHex = agendaCsvRowSchema.safeParse({
      external_id: 'TEST-01',
      judul: 'Agenda Uji',
      kategori: 'tugas',
      deadline: '2026-10-20 23:59:00',
      warna: 'not-a-color',
    });
    expect(invalidHex.success).toBe(false);
  });
});
