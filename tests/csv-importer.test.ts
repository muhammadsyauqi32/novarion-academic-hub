import { describe, it, expect } from 'vitest';
import Papa from 'papaparse';
import { csvStudentRowSchema } from '../packages/shared/src/schemas.js';

describe('CSV Roster Parser & Validation Logic', () => {
  function normalizeHeader(header: string): string {
    const cleaned = header.trim().toLowerCase().replace(/[\s_-]+/g, '_');
    if (['nim', 'nomor_induk', 'nomor_induk_mahasiswa'].includes(cleaned)) return 'nim';
    if (['email', 'surel', 'email_kampus', 'google_email'].includes(cleaned)) return 'email';
    if (['nama', 'nama_lengkap', 'full_name', 'nama_mahasiswa'].includes(cleaned)) return 'nama';
    if (['role', 'peran', 'status_role'].includes(cleaned)) return 'role';
    return cleaned;
  }

  function validateCSV(csvContent: string) {
    const parsed = Papa.parse<Record<string, string>>(csvContent, {
      header: true,
      skipEmptyLines: 'greedy',
      transformHeader: normalizeHeader,
    });

    const validRows: any[] = [];
    const errors: any[] = [];
    const seenNims = new Set<string>();
    const seenEmails = new Set<string>();
    let duplicateCount = 0;

    parsed.data.forEach((row, index) => {
      const rowNum = index + 2;
      const res = csvStudentRowSchema.safeParse(row);

      if (!res.success) {
        errors.push({ row: rowNum, message: res.error.errors.map((e) => e.message).join('; ') });
        return;
      }

      const { nim, email, nama, role } = res.data;
      if (seenNims.has(nim) || seenEmails.has(email)) {
        duplicateCount++;
        errors.push({ row: rowNum, message: `Duplikat NIM ${nim} atau Email ${email}` });
        return;
      }

      seenNims.add(nim);
      seenEmails.add(email);
      validRows.push({ nim, email, nama, role });
    });

    return { total: parsed.data.length, validRows, errors, duplicateCount };
  }

  it('berhasil memetakan variasi header CSV ekspor Excel/Sheets secara otomatis', () => {
    const csv = [
      'Nomor Induk Mahasiswa,Nama Lengkap,Email Kampus,Peran',
      '10241001,Budi Santoso,budi@kampus.ac.id,admin',
      '10241002,Siti Aminah,siti@kampus.ac.id,student',
    ].join('\n');

    const result = validateCSV(csv);
    expect(result.errors).toHaveLength(0);
    expect(result.validRows).toHaveLength(2);
    expect(result.validRows[0].nim).toBe('10241001');
    expect(result.validRows[0].nama).toBe('Budi Santoso');
    expect(result.validRows[0].email).toBe('budi@kampus.ac.id');
    expect(result.validRows[0].role).toBe('admin');
  });

  it('mendeteksi baris duplikat di dalam file CSV yang sama', () => {
    const csvWithDuplicate = [
      'nim,nama,email',
      '10241001,Budi Santoso,budi@kampus.ac.id',
      '10241001,Budi Duplikat,budi2@kampus.ac.id', // NIM sama!
      '10241002,Siti Aminah,budi@kampus.ac.id',    // Email sama!
    ].join('\n');

    const result = validateCSV(csvWithDuplicate);
    expect(result.validRows).toHaveLength(1);
    expect(result.duplicateCount).toBe(2);
    expect(result.errors).toHaveLength(2);
    expect(result.errors[0].message).toContain('Duplikat');
  });

  it('menolak baris dengan format email tidak valid dan mencatat nomor baris error', () => {
    const csvWithInvalidEmail = [
      'nim,nama,email',
      '10241001,Budi Santoso,bukan-email-valid',
      '10241002,Siti Aminah,siti@kampus.ac.id',
    ].join('\n');

    const result = validateCSV(csvWithInvalidEmail);
    expect(result.validRows).toHaveLength(1);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].row).toBe(2);
    expect(result.errors[0].message).toContain('Email tidak valid');
  });
});
