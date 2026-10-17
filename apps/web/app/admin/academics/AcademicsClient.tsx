'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';
import { Input } from '@/components/Input';
import {
  GraduationCap,
  BookOpen,
  Plus,
  FileSpreadsheet,
  AlertCircle,
  Layers,
} from 'lucide-react';
import { addAcademicTermAction, addCourseAction } from '@/actions/academics';
import { CsvImportModal } from '@/components/csv/CsvImportModal';
import {
  previewAcademicMappingCsvAction,
  executeAcademicMappingCsvAction,
} from '@/actions/csv-imports';

interface TermItem {
  id: string;
  code: string;
  name: string;
  startDate: string | null;
  endDate: string | null;
  isActive: boolean;
  createdAt: Date;
}

interface CourseItem {
  id: string;
  code: string;
  name: string;
  credits: number;
  createdAt: Date;
}

interface AcademicsClientProps {
  initialTerms: TermItem[];
  initialCourses: CourseItem[];
}

export function AcademicsClient({ initialTerms, initialCourses }: AcademicsClientProps) {
  const router = useRouter();
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);
  const [termError, setTermError] = useState<string | null>(null);
  const [courseError, setCourseError] = useState<string | null>(null);
  const [isSubmittingTerm, setIsSubmittingTerm] = useState(false);
  const [isSubmittingCourse, setIsSubmittingCourse] = useState(false);

  const handleAddTerm = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmittingTerm) return;
    setIsSubmittingTerm(true);
    setTermError(null);

    const formData = new FormData(e.currentTarget);
    try {
      const res = await addAcademicTermAction(formData);
      if (!res.success) {
        setTermError(res.error || 'Gagal menyimpan semester.');
        setIsSubmittingTerm(false);
        return;
      }
      (e.target as HTMLFormElement).reset();
      setIsSubmittingTerm(false);
      router.refresh();
    } catch (err) {
      setTermError(err instanceof Error ? err.message : String(err));
      setIsSubmittingTerm(false);
    }
  };

  const handleAddCourse = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmittingCourse) return;
    setIsSubmittingCourse(true);
    setCourseError(null);

    const formData = new FormData(e.currentTarget);
    try {
      const res = await addCourseAction(formData);
      if (!res.success) {
        setCourseError(res.error || 'Gagal menyimpan mata kuliah.');
        setIsSubmittingCourse(false);
        return;
      }
      (e.target as HTMLFormElement).reset();
      setIsSubmittingCourse(false);
      router.refresh();
    } catch (err) {
      setCourseError(err instanceof Error ? err.message : String(err));
      setIsSubmittingCourse(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-extrabold text-2xl text-text-primary tracking-tight">
            Struktur Akademik
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Pengaturan semester, kurikulum mata kuliah, dan pemetaan kelas mahasiswa.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsCsvModalOpen(true)}
          className="gap-1.5"
        >
          <FileSpreadsheet className="w-3.5 h-3.5" />
          <span>Impor CSV Mapping Akademik</span>
        </Button>
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

            {termError && (
              <div className="p-3 rounded-lg bg-danger-surface border border-danger-border text-danger-text text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{termError}</span>
              </div>
            )}

            <form onSubmit={handleAddTerm} className="flex flex-col gap-3">
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
                <label htmlFor="term_active" className="text-xs text-text-primary cursor-pointer">
                  Jadikan sebagai semester aktif saat ini
                </label>
              </div>

              <Button
                variant="primary"
                size="sm"
                type="submit"
                className="mt-2"
                isLoading={isSubmittingTerm}
                disabled={isSubmittingTerm}
              >
                Simpan Semester
              </Button>
            </form>
          </Card>

          <Card className="p-0 overflow-hidden">
            <div className="p-4 bg-surface-soft border-b border-border">
              <h3 className="font-heading font-bold text-xs text-text-primary">
                Daftar Semester ({initialTerms.length})
              </h3>
            </div>
            <div className="divide-y divide-border">
              {initialTerms.length === 0 ? (
                <p className="p-6 text-center text-xs text-text-muted">
                  Belum ada semester yang didaftarkan.
                </p>
              ) : (
                initialTerms.map((t) => (
                  <div key={t.id} className="p-4 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-text-primary block">{t.name}</span>
                      <span className="text-text-muted font-mono">{t.code}</span>
                    </div>
                    <Badge variant={t.isActive ? 'success' : 'neutral'} size="sm">
                      {t.isActive ? 'Aktif' : 'Arsip'}
                    </Badge>
                  </div>
                ))
              )}
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

            {courseError && (
              <div className="p-3 rounded-lg bg-danger-surface border border-danger-border text-danger-text text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{courseError}</span>
              </div>
            )}

            <form onSubmit={handleAddCourse} className="flex flex-col gap-3">
              <Input
                name="code"
                label="Kode Mata Kuliah"
                placeholder="Contoh: STK211"
                required
              />
              <Input
                name="name"
                label="Nama Mata Kuliah"
                placeholder="Contoh: Metode Statistika"
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

              <Button
                variant="primary"
                size="sm"
                type="submit"
                className="mt-2"
                isLoading={isSubmittingCourse}
                disabled={isSubmittingCourse}
              >
                Simpan Mata Kuliah
              </Button>
            </form>
          </Card>

          <Card className="p-0 overflow-hidden">
            <div className="p-4 bg-surface-soft border-b border-border">
              <h3 className="font-heading font-bold text-xs text-text-primary">
                Daftar Mata Kuliah ({initialCourses.length})
              </h3>
            </div>
            <div className="divide-y divide-border max-h-[300px] overflow-y-auto">
              {initialCourses.length === 0 ? (
                <p className="p-6 text-center text-xs text-text-muted">
                  Belum ada mata kuliah yang didaftarkan.
                </p>
              ) : (
                initialCourses.map((c) => (
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

      {/* CSV IMPORT MODAL (MODULE B: ACADEMIC MAPPING) */}
      <CsvImportModal
        isOpen={isCsvModalOpen}
        onClose={() => setIsCsvModalOpen(false)}
        title="Impor Pemetaan Akademik (Enrollment & Kelas)"
        description="Unggah pemetaan mahasiswa ke mata kuliah, kelas paralel, dan kelompok praktikum. Satu NIM dapat berada di banyak baris untuk mata kuliah berbeda."
        templateFileName="template_mapping_akademik_novarion.csv"
        templateHeaders={['nim', 'semester', 'kode_mata_kuliah', 'kelas', 'kelompok']}
        templateSampleRows={[
          ['G1401201001', '2026-GANJIL', 'STK211', 'A', 'Kelompok 1'],
          ['G1401201001', '2026-GANJIL', 'STK222', 'B', 'Kelompok 2'],
          ['G1401201002', '2026-GANJIL', 'STK211', 'A', 'Kelompok 1'],
        ]}
        onPreview={async (content, name) => {
          const res = await previewAcademicMappingCsvAction(content, name);
          return res;
        }}
        onExecute={async (content, name) => {
          const res = await executeAcademicMappingCsvAction(content, name);
          return res;
        }}
        onSuccessComplete={() => {
          router.refresh();
        }}
        renderPreviewTable={(preview) => (
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-soft border-b border-border text-[10px] uppercase font-bold text-text-muted">
              <tr>
                <th className="py-2.5 px-3">NIM</th>
                <th className="py-2.5 px-3">Nama Mahasiswa</th>
                <th className="py-2.5 px-3">Semester</th>
                <th className="py-2.5 px-3">Mata Kuliah</th>
                <th className="py-2.5 px-3">Kelas</th>
                <th className="py-2.5 px-3">Kelompok</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {preview.validRows.map((r: any, idx: number) => (
                <tr key={idx} className="hover:bg-surface-soft/40">
                  <td className="py-2 px-3 font-mono font-bold">{r.nim}</td>
                  <td className="py-2 px-3">{r.studentName}</td>
                  <td className="py-2 px-3 font-mono text-[11px] text-text-muted">{r.termCode}</td>
                  <td className="py-2 px-3">
                    <span className="font-mono font-bold text-teal-deep">{r.courseCode}</span>
                    <span className="text-text-muted text-[11px] block">{r.courseName}</span>
                  </td>
                  <td className="py-2 px-3 font-bold">{r.kelas}</td>
                  <td className="py-2 px-3 text-[11px] text-text-muted">{r.kelompok || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      />
    </div>
  );
}
