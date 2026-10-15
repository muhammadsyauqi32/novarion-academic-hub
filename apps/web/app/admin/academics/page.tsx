import React from 'react';
import { requireAdmin } from '@/lib/auth/guards';
import { getDb, academicTerms, courses, courseOfferings, classSections } from '@novarion/db';
import { desc } from 'drizzle-orm';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';
import { Input } from '@/components/Input';
import { GraduationCap, BookOpen, Layers, Plus } from 'lucide-react';
import { addAcademicTermAction, addCourseAction } from '@/actions/academics';

export default async function AcademicsPage() {
  await requireAdmin();
  const db = getDb();

  const allTerms = await db.select().from(academicTerms).orderBy(desc(academicTerms.createdAt));
  const allCourses = await db.select().from(courses).orderBy(courses.code);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading font-extrabold text-2xl text-text-primary tracking-tight">
          Struktur Akademik
        </h1>
        <p className="text-xs text-text-muted mt-1">
          Pengaturan tahun akademik, semester, dan kurikulum mata kuliah angkatan.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Kolom 1: Semester / Tahun Akademik */}
        <div className="flex flex-col gap-4">
          <Card className="p-5 flex flex-col gap-4">
            <div className="flex items-center gap-2 pb-3 border-b border-border">
              <GraduationCap className="w-4 h-4 text-teal-deep" />
              <h2 className="font-heading font-bold text-sm text-text-primary">
                Tambah Tahun Akademik / Semester
              </h2>
            </div>

            <form
              action={async (formData) => {
                'use server';
                await addAcademicTermAction(formData);
              }}
              className="flex flex-col gap-3"
            >
              <Input
                name="code"
                label="Kode Semester"
                placeholder="Contoh: 2026-GANJIL"
                required
              />
              <Input
                name="name"
                label="Nama Semester"
                placeholder="Contoh: Semester Ganjil 2026/2027"
                required
              />
              <div className="grid grid-cols-2 gap-3">
                <Input name="start_date" type="date" label="Tanggal Mulai" />
                <Input name="end_date" type="date" label="Tanggal Selesai" />
              </div>

              <div className="flex items-center gap-2 mt-1">
                <input
                  type="checkbox"
                  name="is_active"
                  value="true"
                  id="term_active"
                  className="rounded border-border text-teal-deep focus:ring-teal-deep"
                />
                <label htmlFor="term_active" className="text-xs text-text-primary">
                  Jadikan sebagai semester aktif saat ini
                </label>
              </div>

              <Button variant="primary" size="sm" type="submit" className="mt-2">
                Simpan Semester
              </Button>
            </form>
          </Card>

          <Card className="p-0 overflow-hidden">
            <div className="p-4 bg-surface-soft border-b border-border">
              <h3 className="font-heading font-bold text-xs text-text-primary">
                Daftar Semester ({allTerms.length})
              </h3>
            </div>
            <div className="divide-y divide-border">
              {allTerms.map((t) => (
                <div key={t.id} className="p-4 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-text-primary block">{t.name}</span>
                    <span className="text-text-muted">{t.code}</span>
                  </div>
                  <Badge variant={t.isActive ? 'success' : 'neutral'} size="sm">
                    {t.isActive ? 'Aktif' : 'Arsip'}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Kolom 2: Mata Kuliah */}
        <div className="flex flex-col gap-4">
          <Card className="p-5 flex flex-col gap-4">
            <div className="flex items-center gap-2 pb-3 border-b border-border">
              <BookOpen className="w-4 h-4 text-teal-deep" />
              <h2 className="font-heading font-bold text-sm text-text-primary">
                Tambah Mata Kuliah
              </h2>
            </div>

            <form
              action={async (formData) => {
                'use server';
                await addCourseAction(formData);
              }}
              className="flex flex-col gap-3"
            >
              <Input
                name="code"
                label="Kode Mata Kuliah"
                placeholder="Contoh: STAT101"
                required
              />
              <Input
                name="name"
                label="Nama Mata Kuliah"
                placeholder="Contoh: Analisis Regresi Terapan"
                required
              />
              <Input
                name="credits"
                type="number"
                min="1"
                max="10"
                defaultValue="3"
                label="Jumlah SKS"
                required
              />

              <Button variant="primary" size="sm" type="submit" className="mt-2">
                Simpan Mata Kuliah
              </Button>
            </form>
          </Card>

          <Card className="p-0 overflow-hidden">
            <div className="p-4 bg-surface-soft border-b border-border">
              <h3 className="font-heading font-bold text-xs text-text-primary">
                Daftar Mata Kuliah ({allCourses.length})
              </h3>
            </div>
            <div className="divide-y divide-border max-h-[300px] overflow-y-auto">
              {allCourses.length === 0 ? (
                <p className="p-6 text-center text-xs text-text-muted">
                  Belum ada mata kuliah yang didaftarkan.
                </p>
              ) : (
                allCourses.map((c) => (
                  <div key={c.id} className="p-3.5 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-text-primary block">{c.name}</span>
                      <span className="text-text-muted font-mono">{c.code}</span>
                    </div>
                    <Badge variant="primary" size="sm">{c.credits} SKS</Badge>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
