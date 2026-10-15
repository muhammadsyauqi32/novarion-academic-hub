import React from 'react';
import { requireAdmin } from '@/lib/auth/guards';
import { getDb, studentWhitelist } from '@novarion/db';
import { desc } from 'drizzle-orm';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';
import { Input } from '@/components/Input';
import { Users, Plus, ShieldCheck, UserCheck, Power } from 'lucide-react';
import { addWhitelistStudentAction, toggleWhitelistStatusAction } from '@/actions/whitelist';

export default async function StudentsWhitelistPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  await requireAdmin();
  const db = getDb();

  const query = searchParams.q?.toLowerCase() || '';

  const allStudents = await db
    .select()
    .from(studentWhitelist)
    .orderBy(desc(studentWhitelist.createdAt));

  const filteredStudents = allStudents.filter(
    (s) =>
      !query ||
      s.nim.toLowerCase().includes(query) ||
      s.fullName.toLowerCase().includes(query) ||
      s.email.toLowerCase().includes(query)
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-extrabold text-2xl text-text-primary tracking-tight">
            Mahasiswa & Whitelist Angkatan
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Daftar resmi mahasiswa yang diizinkan masuk ke aplikasi Novarion.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant="primary" size="md">
            {allStudents.length} Terdaftar
          </Badge>
        </div>
      </div>

      {/* Grid: Form Tambah Mahasiswa & Tabel Roster */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Form Tambah Satuan */}
        <Card className="lg:col-span-4 p-5 flex flex-col gap-4">
          <div className="flex items-center gap-2 pb-3 border-b border-border">
            <Plus className="w-4 h-4 text-teal-deep" />
            <h2 className="font-heading font-bold text-sm text-text-primary">
              Tambah Mahasiswa ke Whitelist
            </h2>
          </div>

          <form
            action={async (formData) => {
              'use server';
              await addWhitelistStudentAction(formData);
            }}
            className="flex flex-col gap-3"
          >
            <Input
              name="nim"
              label="Nomor Induk Mahasiswa (NIM)"
              placeholder="Contoh: 10241015"
              required
            />
            <Input
              name="full_name"
              label="Nama Lengkap"
              placeholder="Contoh: Budi Santoso"
              required
            />
            <Input
              name="email"
              type="email"
              label="Email Google Kampus"
              placeholder="Contoh: budi.s@kampus.ac.id"
              required
            />

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-text-primary tracking-wide">
                Peran Hak Akses
              </label>
              <select
                name="role"
                defaultValue="student"
                className="w-full px-3.5 py-2 text-sm bg-surface border border-border rounded-input text-text-primary focus:border-teal-deep focus:outline-none"
              >
                <option value="student">Mahasiswa (Student)</option>
                <option value="admin">Administrator Angkatan</option>
              </select>
            </div>

            <Button variant="primary" size="sm" type="submit" className="mt-2 w-full">
              Simpan ke Whitelist
            </Button>
          </form>
        </Card>

        {/* Tabel Data Whitelist */}
        <Card className="lg:col-span-8 p-0 overflow-hidden flex flex-col">
          <div className="p-4 bg-surface-soft border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <form method="get" className="flex items-center gap-2 max-w-sm w-full">
              <input
                name="q"
                defaultValue={query}
                placeholder="Cari NIM, Nama, atau Email..."
                className="w-full px-3 py-1.5 text-xs bg-surface border border-border rounded-lg text-text-primary focus:outline-none focus:border-teal-deep"
              />
              <Button variant="secondary" size="sm" type="submit">
                Cari
              </Button>
            </form>

            <span className="text-xs text-text-muted shrink-0">
              Menampilkan {filteredStudents.length} data
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-text-primary">
              <thead className="bg-surface-soft/60 border-b border-border text-text-muted uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">NIM</th>
                  <th className="py-3 px-4">Nama Lengkap</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-text-muted">
                      Tidak ada mahasiswa yang cocok dengan kriteria pencarian.
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((s) => (
                    <tr key={s.id} className="hover:bg-surface-soft/40 transition-colors">
                      <td className="py-3 px-4 font-bold">{s.nim}</td>
                      <td className="py-3 px-4 font-medium">{s.fullName}</td>
                      <td className="py-3 px-4 text-text-muted">{s.email}</td>
                      <td className="py-3 px-4">
                        <Badge variant={s.role === 'admin' ? 'orange' : 'primary'} size="sm">
                          {s.role}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={s.isActive ? 'success' : 'danger'} size="sm">
                          {s.isActive ? 'Aktif' : 'Nonaktif'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <form
                          action={async () => {
                            'use server';
                            await toggleWhitelistStatusAction(s.id, s.isActive);
                          }}
                        >
                          <button
                            type="submit"
                            title={s.isActive ? 'Nonaktifkan Akun' : 'Aktifkan Akun'}
                            className={`p-1.5 rounded-md text-xs font-semibold transition-colors ${
                              s.isActive
                                ? 'text-text-muted hover:text-danger-text hover:bg-danger-surface'
                                : 'text-teal-deep hover:bg-success-surface'
                            }`}
                          >
                            <Power className="w-3.5 h-3.5" />
                          </button>
                        </form>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
