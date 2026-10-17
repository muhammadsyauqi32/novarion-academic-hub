'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';
import { Input } from '@/components/Input';
import { 
  Plus, 
  Trash2, 
  CalendarCheck, 
  Search, 
  X, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  ExternalLink 
} from 'lucide-react';
import { createAdminAgendaAction, deleteAgendaAction } from '@/actions/agendas';
import { formatWIBShort } from '@novarion/shared';

interface AgendaItem {
  id: string;
  title: string;
  description: string | null;
  category: string;
  scope: string;
  deadline: Date | null;
  status: string;
  version: number;
  locationOrLink: string | null;
  createdAt: Date;
}

interface AdminAgendasClientProps {
  initialAgendas: AgendaItem[];
}

export function AdminAgendasClient({ initialAgendas }: AdminAgendasClientProps) {
  const router = useRouter();
  const [agendas, setAgendas] = useState<AgendaItem[]>(initialAgendas);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filteredAgendas = agendas.filter((item) => {
    const matchSearch =
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(search.toLowerCase()));
    const matchCategory = categoryFilter === 'all' || item.category === categoryFilter;
    return matchSearch && matchCategory;
  });

  const handleCreateAgenda = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setFormError(null);

    const formData = new FormData(e.currentTarget);

    try {
      const res = await createAdminAgendaAction(formData);
      if (!res.success) {
        setFormError(res.error || 'Gagal membuat agenda.');
        setIsSubmitting(false);
        return;
      }

      setIsModalOpen(false);
      setIsSubmitting(false);
      router.refresh();
    } catch (err) {
      setFormError(String(err));
      setIsSubmitting(false);
    }
  };

  const handleDeleteAgenda = async (id: string, title: string) => {
    if (!confirm(`Hapus agenda resmi "${title}"?`)) return;

    setDeletingId(id);
    try {
      const res = await deleteAgendaAction(id);
      if (res.success) {
        setAgendas((prev) => prev.filter((a) => a.id !== id));
        router.refresh();
      } else {
        alert('Gagal menghapus agenda.');
      }
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-extrabold text-2xl text-text-primary tracking-tight">
            Manajemen Agenda Akademik
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Agenda resmi perkuliahan angkatan, jadwal ujian, kuis, dan pengumuman.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => {
            setFormError(null);
            setIsModalOpen(true);
          }}
        >
          <Plus className="w-3.5 h-3.5 mr-1" />
          <span>Buat Agenda Baru</span>
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4 flex flex-col sm:flex-row items-center justify-between gap-3 bg-surface">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari judul atau keterangan agenda..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3.5 py-1.5 text-xs bg-surface-soft border border-border rounded-input text-text-primary focus:border-teal-deep focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-text-muted font-medium whitespace-nowrap">Kategori:</span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-1.5 text-xs bg-surface-soft border border-border rounded-input text-text-primary focus:outline-none"
          >
            <option value="all">Semua Kategori</option>
            <option value="tugas">Tugas Kuliah</option>
            <option value="praktikum">Praktikum</option>
            <option value="kuis">Kuis</option>
            <option value="ujian">Ujian (UTS / UAS)</option>
            <option value="kuliah">Jadwal Kuliah</option>
            <option value="kegiatan">Kegiatan Angkatan</option>
            <option value="pengumuman">Pengumuman</option>
          </select>
        </div>
      </Card>

      {/* Table of Agendas */}
      <Card className="p-0 overflow-hidden flex flex-col">
        <div className="p-4 bg-surface-soft border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarCheck className="w-4 h-4 text-teal-deep" />
            <span className="font-heading font-bold text-xs text-text-primary">
              Daftar Seluruh Agenda ({filteredAgendas.length})
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-text-primary">
            <thead className="bg-surface-soft/60 border-b border-border text-text-muted uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-2.5 px-4">Judul Agenda</th>
                <th className="py-2.5 px-4">Kategori</th>
                <th className="py-2.5 px-4">Cakupan</th>
                <th className="py-2.5 px-4">Batas Waktu</th>
                <th className="py-2.5 px-4">Status</th>
                <th className="py-2.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredAgendas.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-text-muted">
                    Tidak ada agenda yang cocok dengan pencarian atau filter.
                  </td>
                </tr>
              ) : (
                filteredAgendas.map((a) => (
                  <tr key={a.id} className="hover:bg-surface-soft/40 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-text-primary">{a.title}</span>
                        {a.description && (
                          <span className="text-[11px] text-text-muted line-clamp-1">{a.description}</span>
                        )}
                        {a.locationOrLink && (
                          <a
                            href={a.locationOrLink}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] text-teal-deep hover:underline mt-0.5"
                          >
                            <span>Tautan Sumber</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 capitalize">
                      <Badge variant="primary" size="sm">{a.category}</Badge>
                    </td>
                    <td className="py-3 px-4 capitalize text-text-muted">{a.scope.replace('_', ' ')}</td>
                    <td className="py-3 px-4 font-semibold text-[#9E5507]">
                      {a.deadline ? formatWIBShort(a.deadline) : '-'}
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        variant={
                          a.status === 'published'
                            ? 'success'
                            : a.status === 'rejected'
                            ? 'danger'
                            : a.status === 'cancelled'
                            ? 'neutral'
                            : 'warning'
                        }
                        size="sm"
                      >
                        {a.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleDeleteAgenda(a.id, a.title)}
                        disabled={deletingId === a.id}
                        className="p-1.5 rounded-lg text-text-muted hover:text-danger-text hover:bg-danger-surface transition-colors"
                        title="Hapus Agenda"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal Buat Agenda Baru (Stay inside Admin Workspace) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-surface rounded-modal border border-border shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
            <div className="p-4 sm:p-5 border-b border-border flex items-center justify-between bg-surface-soft">
              <div className="flex items-center gap-2">
                <CalendarCheck className="w-4 h-4 text-teal-deep" />
                <h3 className="font-heading font-bold text-sm text-text-primary">
                  Buat Agenda Resmi Angkatan
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-text-muted hover:bg-border/40 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateAgenda} className="p-5 flex flex-col gap-4">
              {formError && (
                <div className="p-3 rounded-lg bg-danger-surface border border-danger-border text-danger-text text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <Input
                name="title"
                label="Judul Agenda / Tugas Resmi"
                placeholder="Contoh: Modul 3 Praktikum Analisis Deret Waktu"
                required
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-text-primary">Kategori Agenda</label>
                  <select
                    name="category"
                    defaultValue="tugas"
                    className="w-full px-3 py-2 text-xs bg-surface border border-border rounded-input text-text-primary focus:border-teal-deep focus:outline-none"
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
                  <label className="text-xs font-semibold text-text-primary">Cakupan (Scope)</label>
                  <select
                    name="scope"
                    defaultValue="angkatan"
                    className="w-full px-3 py-2 text-xs bg-surface border border-border rounded-input text-text-primary focus:border-teal-deep focus:outline-none"
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
                helperText="Otomatis menjadwalkan reminder WhatsApp jika diisi."
              />

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-text-primary">Deskripsi & Instruksi</label>
                <textarea
                  name="description"
                  rows={3}
                  placeholder="Detail instruksi, format file pengumpulan, atau catatan dosen..."
                  className="w-full px-3 py-2 text-xs bg-surface border border-border rounded-input text-text-primary focus:border-teal-deep focus:outline-none"
                />
              </div>

              <Input
                name="location_or_link"
                label="Tautan Lokasi / Google Classroom (Opsional)"
                placeholder="https://..."
              />

              <Input
                name="source_reference"
                label="Sumber Referensi (Opsional)"
                placeholder="Contoh: Arahan Dosen saat perkuliahan sesi 5"
              />

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border mt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsModalOpen(false)}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Menyimpan...' : 'Publikasikan Agenda'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
