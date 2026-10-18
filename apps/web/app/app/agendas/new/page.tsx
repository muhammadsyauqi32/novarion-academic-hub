import React from 'react';
import { requireAuth } from '@/lib/auth/guards';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { submitAgendaAction } from '@/actions/agendas';
import { Info, Send, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default async function NewAgendaPage() {
  const user = await requireAuth();

  return (
    <div className="max-w-2xl mx-auto w-full flex flex-col gap-5">
      <div>
        <Link href="/app/agendas">
          <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-text-muted hover:text-text-primary px-2">
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Agenda</span>
          </Button>
        </Link>
      </div>

      {user.role === 'admin' && (
        <div className="p-3.5 rounded-card bg-teal-deep/10 border border-teal-deep/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-teal-deep">
            <Info className="w-4 h-4 shrink-0" />
            <span>
              Anda login sebagai Admin. Untuk langsung mempublikasikan agenda resmi tanpa antrean review, gunakan form di admin workspace.
            </span>
          </div>
          <Link href="/admin/agendas" className="shrink-0">
            <Button variant="primary" size="sm" className="text-xs">
              Buka Admin Agendas
            </Button>
          </Link>
        </div>
      )}

      <div>
        <h1 className="font-heading font-bold text-2xl text-text-primary tracking-tight">
          Ajukan Agenda Perkuliahan
        </h1>
        <p className="text-xs text-text-muted mt-1">
          Pengajuan akan ditinjau oleh pengurus angkatan sebelum dipublikasikan ke kalender akademik bersama.
        </p>
      </div>

      <div className="rounded-card bg-surface border border-border p-6 sm:p-7 flex flex-col gap-5 shadow-xs">
        <div className="p-3.5 rounded-lg bg-surface-soft border border-border flex items-start gap-2.5 text-xs text-text-muted">
          <Info className="w-4 h-4 text-teal-deep shrink-0 mt-0.5" />
          <span>
            Status awal pengajuan adalah <strong className="text-text-primary">Pending</strong>. Notifikasi pengingat WhatsApp otomatis baru aktif setelah pengajuan disetujui.
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
            placeholder="Contoh: Laporan Praktikum Modul 2 Komputasi Statistik"
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
                className="w-full px-3.5 py-2 text-xs bg-surface border border-border rounded-input text-text-primary focus:border-teal-deep focus:outline-none"
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
                className="w-full px-3.5 py-2 text-xs bg-surface border border-border rounded-input text-text-primary focus:border-teal-deep focus:outline-none"
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
            helperText="Kosongkan jika agenda bersifat fleksibel atau tidak memiliki batas waktu penyerahan."
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-text-primary tracking-wide">
              Deskripsi & Instruksi
            </label>
            <textarea
              name="description"
              rows={3}
              placeholder="Jelaskan detail tugas, format dokumen, atau arahan dosen..."
              className="w-full px-3.5 py-2 text-xs bg-surface border border-border rounded-input text-text-primary focus:border-teal-deep focus:outline-none"
            />
          </div>

          <Input
            name="location_or_link"
            label="Tautan Pengumpulan / Lokasi (Opsional)"
            placeholder="Contoh: https://classroom.google.com/c/..."
          />

          <Input
            name="source_reference"
            label="Sumber Rujukan (Opsional)"
            placeholder="Contoh: Pengumuman Dosen di Perkuliahan Sesi 4"
          />

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border">
            <Link href="/app/agendas">
              <Button variant="outline" size="sm" className="text-xs">
                Batal
              </Button>
            </Link>
            <Button variant="primary" size="sm" type="submit" className="text-xs">
              <Send className="w-3.5 h-3.5 mr-1.5" />
              <span>Kirim Pengajuan</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
