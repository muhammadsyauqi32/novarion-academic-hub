import React from 'react';
import { requireAuth } from '@/lib/auth/guards';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { submitAgendaAction } from '@/actions/agendas';
import { Info, Send } from 'lucide-react';
import Link from 'next/link';

export default async function NewAgendaPage() {
  await requireAuth();

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6">
      <div>
        <h1 className="font-heading font-extrabold text-2xl text-text-primary tracking-tight">
          Ajukan Agenda Baru
        </h1>
        <p className="text-xs text-text-muted mt-1">
          Pengajuan akan ditinjau dan diverifikasi oleh admin angkatan sebelum dipublikasikan ke kalender dan reminder grup.
        </p>
      </div>

      <Card className="p-6 sm:p-8 flex flex-col gap-5">
        <div className="p-3.5 rounded-xl bg-brand-mint-soft/50 border border-brand-primary/30 flex items-start gap-2.5 text-xs text-text-primary">
          <Info className="w-4 h-4 text-teal-deep shrink-0 mt-0.5" />
          <span>
            Status awal pengajuan adalah <strong className="text-teal-deep">Pending</strong>. Notifikasi grup WhatsApp hanya dijadwalkan setelah pengajuan disetujui admin.
          </span>
        </div>

        <form
          action={async (formData) => {
            'use server';
            await submitAgendaAction(formData);
          }}
          className="flex flex-col gap-4"
        >
          <Input
            name="title"
            label="Judul Agenda / Tugas"
            placeholder="Contoh: Laporan Praktikum Modul 2"
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-text-primary tracking-wide">
                Kategori Agenda
              </label>
              <select
                name="category"
                defaultValue="tugas"
                className="w-full px-3.5 py-2 text-sm bg-surface border border-border rounded-input text-text-primary focus:border-teal-deep focus:outline-none"
              >
                <option value="tugas">Tugas Kuliah</option>
                <option value="praktikum">Praktikum</option>
                <option value="kuis">Kuis</option>
                <option value="ujian">Ujian (UTS / UAS)</option>
                <option value="kuliah">Jadwal Kuliah</option>
                <option value="kegiatan">Kegiatan Angkatan</option>
                <option value="pengumuman">Pengumuman</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-text-primary tracking-wide">
                Cakupan Penerima (Scope)
              </label>
              <select
                name="scope"
                defaultValue="angkatan"
                className="w-full px-3.5 py-2 text-sm bg-surface border border-border rounded-input text-text-primary focus:border-teal-deep focus:outline-none"
              >
                <option value="angkatan">Seluruh Angkatan</option>
                <option value="mata_kuliah">Mata Kuliah Tertentu</option>
                <option value="kelas">Kelas Paralel</option>
                <option value="kelompok">Kelompok Praktikum</option>
              </select>
            </div>
          </div>

          <Input
            name="deadline"
            type="datetime-local"
            label="Batas Waktu Pengumpulan (Deadline WIB)"
            helperText="Jika dikosongkan, agenda tidak menghasilkan pengingat batas waktu."
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-text-primary tracking-wide">
              Deskripsi & Instruksi
            </label>
            <textarea
              name="description"
              rows={3}
              placeholder="Jelaskan detail tugas, format file, atau instruksi dosen..."
              className="w-full px-3.5 py-2 text-sm bg-surface border border-border rounded-input text-text-primary focus:border-teal-deep focus:outline-none"
            />
          </div>

          <Input
            name="location_or_link"
            label="Tautan Pengumpulan / Lokasi (Opsional)"
            placeholder="Contoh: https://classroom.google.com/c/..."
          />

          <Input
            name="source_reference"
            label="Sumber Referensi Resmi (Opsional)"
            placeholder="Contoh: Pengumuman Dosen di Perkuliahan Sesi 4"
          />

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
            <Link href="/app">
              <Button variant="outline" size="md">
                Batal
              </Button>
            </Link>
            <Button variant="primary" size="md" type="submit">
              <Send className="w-3.5 h-3.5 mr-1.5" />
              <span>Kirim Pengajuan</span>
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
