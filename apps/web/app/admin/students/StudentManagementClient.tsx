'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';
import { Input } from '@/components/Input';
import {
  Plus,
  Power,
  KeyRound,
  Check,
  Copy,
  AlertCircle,
  X,
  Search,
  FileSpreadsheet,
} from 'lucide-react';
import {
  addWhitelistStudentAction,
  toggleWhitelistStatusAction,
  resetStudentPasswordAction,
} from '@/actions/whitelist';
import { CsvImportModal } from '@/components/csv/CsvImportModal';
import { previewStudentCsvAction, executeStudentCsvAction } from '@/actions/csv-imports';

interface StudentItem {
  id: string;
  nim: string;
  fullName: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: Date;
}

interface StudentManagementClientProps {
  initialStudents: StudentItem[];
  query: string;
}

export function StudentManagementClient({
  initialStudents,
  query,
}: StudentManagementClientProps) {
  const router = useRouter();
  const [students, setStudents] = useState<StudentItem[]>(initialStudents);
  const [searchQuery, setSearchQuery] = useState(query);

  // Form state
  const [isAdding, setIsAdding] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Modal Password Sementara (One-Time Display dengan persistensi sessionStorage)
  const [tempPasswordModal, setTempPasswordModal] = useState<{
    nim: string;
    fullName: string;
    email?: string;
    password: string;
    isReset?: boolean;
  } | null>(null);

  const [copiedType, setCopiedType] = useState<'password' | 'message' | null>(null);
  const [isResetting, setIsResetting] = useState<string | null>(null);
  const [isToggling, setIsToggling] = useState<string | null>(null);

  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);

  // Helper untuk modal password sementara (in-memory only, no insecure browser storage)
  const updateTempPasswordModal = (
    data: {
      nim: string;
      fullName: string;
      email?: string;
      password: string;
      isReset?: boolean;
    } | null
  ) => {
    setTempPasswordModal(data);
  };

  // Sinkronkan state saat props data server diperbarui
  useEffect(() => {
    setStudents(initialStudents);
  }, [initialStudents]);

  const handleCopyPassword = () => {
    if (!tempPasswordModal) return;
    navigator.clipboard.writeText(tempPasswordModal.password);
    setCopiedType('password');
    setTimeout(() => setCopiedType(null), 2500);
  };

  const handleCopyBroadcastMessage = () => {
    if (!tempPasswordModal) return;
    const loginUrl = 'https://hub.novarion.web.id/login';
    const msg = `*AKUN NOVARION ACADEMIC HUB*
Halo *${tempPasswordModal.fullName}*, akun Anda telah ${tempPasswordModal.isReset ? 'direset' : 'diaktifkan'}:

• *NIM:* ${tempPasswordModal.nim}
• *Kata Sandi Sementara:* ${tempPasswordModal.password}
• *Tautan Masuk:* ${loginUrl}

*Instruksi Login Pertama:*
1. Buka ${loginUrl} lalu masuk dengan NIM & kata sandi sementara di atas.
2. Anda akan otomatis dialihkan ke halaman pengaturan kata sandi baru.
3. Buat kata sandi pribadi yang aman (minimal 8 karakter).
4. Setelah berhasil disimpan, Anda langsung dapat mengakses seluruh agenda, tugas, dan materi kuliah.

_Penting: Jangan bagikan kata sandi sementara ini kepada pihak lain._`;

    navigator.clipboard.writeText(msg);
    setCopiedType('message');
    setTimeout(() => setCopiedType(null), 2500);
  };

  const handleCloseModal = () => {
    updateTempPasswordModal(null);
    router.refresh();
  };

  const handleAddStudent = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isAdding) return;

    setIsAdding(true);
    setFormError(null);

    const formElement = e.currentTarget;
    const formData = new FormData(formElement);
    const nim = (formData.get('nim') as string || '').trim().toUpperCase();
    const fullName = (formData.get('full_name') as string || '').trim();
    const email = (formData.get('email') as string || '').trim();

    try {
      const res = await addWhitelistStudentAction(formData);
      if (!res.success) {
        setFormError(res.error || 'Gagal menambahkan mahasiswa.');
        setIsAdding(false);
        return;
      }

      if (res.temporaryPassword) {
        updateTempPasswordModal({
          nim,
          fullName,
          email,
          password: res.temporaryPassword,
          isReset: false,
        });
      }

      formElement.reset();
      router.refresh();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsAdding(false);
    }
  };

  const handleResetPassword = async (student: StudentItem) => {
    if (isResetting) return;
    if (!confirm(`Reset kata sandi untuk ${student.fullName} (${student.nim})?`)) {
      return;
    }

    setIsResetting(student.nim);
    try {
      const res = await resetStudentPasswordAction(student.nim);
      if (!res.success) {
        alert(res.error || 'Gagal mereset kata sandi.');
        return;
      }

      if (res.temporaryPassword) {
        updateTempPasswordModal({
          nim: student.nim,
          fullName: student.fullName,
          email: student.email,
          password: res.temporaryPassword,
          isReset: true,
        });
      }
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : String(err));
    } finally {
      setIsResetting(null);
    }
  };

  const handleToggleStatus = async (student: StudentItem) => {
    if (isToggling) return;
    const actionName = student.isActive ? 'nonaktifkan' : 'aktifkan';
    if (!confirm(`Yakin ingin ${actionName} akses ${student.fullName} (${student.nim})?`)) {
      return;
    }

    setIsToggling(student.id);
    try {
      const res = await toggleWhitelistStatusAction(student.id, student.isActive);
      if (!res.success) {
        alert(res.error || 'Gagal mengubah status akses.');
        return;
      }
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : String(err));
    } finally {
      setIsToggling(null);
    }
  };

  const filtered = students.filter(
    (s) =>
      !searchQuery ||
      s.nim.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Modal Password Sementara (One-Time Display & Persistent across refresh) */}
      {tempPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg p-6 rounded-card bg-surface border border-border shadow-2xl flex flex-col gap-5 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-deep/15 text-teal-deep flex items-center justify-center shrink-0">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-heading font-bold text-base text-text-primary">
                      {tempPasswordModal.isReset
                        ? 'Kata Sandi Berhasil Direset'
                        : 'Akun Mahasiswa Berhasil Dibuat'}
                    </h3>
                    <Badge variant={tempPasswordModal.isReset ? 'orange' : 'success'} size="sm">
                      {tempPasswordModal.isReset ? 'Reset' : 'Baru'}
                    </Badge>
                  </div>
                  <p className="text-xs text-text-muted mt-0.5">
                    Data kredensial login awal mahasiswa
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCloseModal}
                className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-soft transition-colors"
                title="Tutup dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Identitas Mahasiswa Card */}
            <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-surface-soft border border-border text-xs">
              <div>
                <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider block">
                  Nomor Induk Mahasiswa
                </span>
                <span className="font-mono font-bold text-text-primary text-sm mt-0.5 block">
                  {tempPasswordModal.nim}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider block">
                  Nama Mahasiswa
                </span>
                <span className="font-medium text-text-primary truncate block mt-0.5">
                  {tempPasswordModal.fullName}
                </span>
              </div>
              {tempPasswordModal.email && (
                <div className="col-span-2 pt-2 border-t border-border/60">
                  <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider block">
                    Email Resmi
                  </span>
                  <span className="font-mono text-text-muted text-[11px]">
                    {tempPasswordModal.email}
                  </span>
                </div>
              )}
            </div>

            {/* Password Display Card */}
            <div className="p-4 rounded-xl bg-surface-soft border border-border flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">
                  Kata Sandi Sementara (One-Time Display)
                </span>
                <Badge variant="orange" size="sm">
                  Wajib Ganti
                </Badge>
              </div>

              <div className="flex items-center justify-between gap-2 p-3 rounded-lg bg-surface border border-border shadow-inner">
                <code className="font-mono text-base font-bold text-teal-deep tracking-wider select-all">
                  {tempPasswordModal.password}
                </code>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleCopyPassword}
                  className="gap-1.5 text-xs py-1.5 px-3 shrink-0"
                >
                  {copiedType === 'password' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-teal-deep" />
                      <span className="text-teal-deep font-semibold">Tersalin</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Salin Password</span>
                    </>
                  )}
                </Button>
              </div>

              {/* Tombol Salin Format Lengkap untuk WhatsApp */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyBroadcastMessage}
                className="w-full gap-2 text-xs py-2 mt-1 border-dashed justify-center text-text-primary hover:border-teal-deep"
              >
                {copiedType === 'message' ? (
                  <>
                    <Check className="w-4 h-4 text-teal-deep" />
                    <span className="text-teal-deep font-semibold">Format Pesan WhatsApp Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-text-muted" />
                    <span>Salin Format Pesan Lengkap (WhatsApp / Email)</span>
                  </>
                )}
              </Button>
            </div>

            {/* Instruksi Alur Login Pertama */}
            <div className="p-3.5 rounded-xl bg-surface-soft/60 border border-border flex flex-col gap-2 text-xs">
              <span className="font-semibold text-text-primary flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-teal-deep" />
                Alur Akses Login Pertama Mahasiswa:
              </span>
              <ol className="list-decimal list-inside space-y-1 text-text-muted text-[11px] leading-relaxed">
                <li>Berikan NIM & kata sandi sementara kepada mahasiswa bersangkutan.</li>
                <li>Mahasiswa mengakses portal <span className="font-mono text-text-primary">hub.novarion.web.id/login</span>.</li>
                <li>Sistem secara otomatis mengarahkan ke formulir perubahan kata sandi pertama.</li>
                <li>Setelah kata sandi baru disimpan, mahasiswa dapat langsung mengakses dashboard akademik.</li>
              </ol>
            </div>

            {/* Warning Catatan */}
            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-700 dark:text-amber-400 leading-relaxed">
              <strong>Catatan Keamanan:</strong> Kata sandi sementara ini hanya ditampilkan satu kali demi melindungi privasi akun. Pastikan Anda telah menyalinnya sebelum menutup jendela ini.
            </div>

            <Button
              variant="primary"
              size="sm"
              onClick={handleCloseModal}
              className="w-full font-semibold py-2.5"
            >
              Saya Telah Menyalin Kredensial & Tutup
            </Button>
          </div>
        </div>
      )}

      {/* Grid: Form Tambah Mahasiswa & Tabel Roster */}
      {/* Grid: Form Tambah Mahasiswa & Tabel Roster */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Form Tambah Satuan */}
        <div className="lg:col-span-4 p-5 rounded-card bg-surface border border-border flex flex-col gap-4">
          <div className="flex items-center gap-2 pb-3 border-b border-border">
            <Plus className="w-4 h-4 text-teal-deep" />
            <h2 className="font-heading font-bold text-sm text-text-primary">
              Tambah Mahasiswa ke Whitelist
            </h2>
          </div>

          {formError && (
            <div className="p-3 rounded-xl bg-danger-surface border border-danger-border flex items-start gap-2 text-xs text-danger-text">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{formError}</span>
            </div>
          )}

          <form onSubmit={handleAddStudent} className="flex flex-col gap-3">
            <Input
              name="nim"
              label="Nomor Induk Mahasiswa (NIM)"
              placeholder="Contoh: M0401251083 / TEST001"
              disabled={isAdding}
              required
            />
            <Input
              name="full_name"
              label="Nama Lengkap"
              placeholder="Contoh: Budi Santoso"
              disabled={isAdding}
              required
            />
            <Input
              name="email"
              type="email"
              label="Email Kampus Resmi"
              placeholder="Contoh: budi.s@apps.ipb.ac.id"
              disabled={isAdding}
              required
            />

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-text-primary tracking-wide">
                Peran Hak Akses
              </label>
              <select
                name="role"
                defaultValue="student"
                disabled={isAdding}
                className="w-full px-3.5 py-2 text-sm bg-surface border border-border rounded-input text-text-primary focus:border-teal-deep focus:outline-none disabled:opacity-50"
              >
                <option value="student">Mahasiswa (Student)</option>
                <option value="admin">Administrator Angkatan</option>
              </select>
            </div>

            <p className="text-[11px] text-text-muted mt-1">
              * Akun akan dibuatkan kata sandi awal dan diwajibkan ganti password saat login pertama.
            </p>

            <Button
              variant="primary"
              size="sm"
              type="submit"
              className="mt-2 w-full font-semibold"
              isLoading={isAdding}
              disabled={isAdding}
            >
              Simpan & Buat Akun
            </Button>
          </form>
        </div>

        {/* Tabel Data Whitelist */}
        <div className="lg:col-span-8 rounded-card bg-surface border border-border overflow-hidden flex flex-col">
          <div className="p-4 bg-surface-soft/60 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 max-w-lg w-full">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="w-3.5 h-3.5 text-text-muted absolute left-3 top-2.5" />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari NIM, Nama, atau Email..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-surface border border-border rounded-lg text-text-primary focus:outline-none focus:border-teal-deep"
                />
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsCsvModalOpen(true)}
                className="gap-1.5 text-xs shrink-0"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-teal-deep" />
                <span>Impor CSV Mahasiswa</span>
              </Button>
            </div>

            <span className="text-xs font-mono text-text-muted shrink-0">
              Menampilkan {filtered.length} data
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-text-primary">
              <thead className="bg-surface-soft/60 border-b border-border text-[10px] font-heading font-bold uppercase tracking-wider text-text-muted">
                <tr>
                  <th className="py-3 px-4">NIM</th>
                  <th className="py-3 px-4">Nama Lengkap</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Aksi & Akses</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-text-muted">
                      Tidak ada mahasiswa yang cocok dengan kriteria pencarian.
                    </td>
                  </tr>
                ) : (
                  filtered.map((s) => (
                    <tr key={s.id} className="hover:bg-surface-soft/40 transition-colors">
                      <td className="py-3 px-4 font-bold font-mono text-teal-deep">{s.nim}</td>
                      <td className="py-3 px-4 font-medium">{s.fullName}</td>
                      <td className="py-3 px-4 font-mono text-text-muted text-[11px]">{s.email}</td>
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
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Tombol Reset Kata Sandi */}
                          <button
                            type="button"
                            onClick={() => handleResetPassword(s)}
                            disabled={isResetting === s.nim}
                            title="Reset Kata Sandi"
                            className="p-1.5 rounded-md text-text-muted hover:text-teal-deep hover:bg-surface-soft transition-colors disabled:opacity-50"
                          >
                            <KeyRound className="w-3.5 h-3.5" />
                          </button>

                          {/* Tombol Toggle Aktif/Nonaktif */}
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(s)}
                            disabled={isToggling === s.id}
                            title={s.isActive ? 'Nonaktifkan Akun' : 'Aktifkan Akun'}
                            className={`p-1.5 rounded-md text-xs font-semibold transition-colors disabled:opacity-50 ${
                              s.isActive
                                ? 'text-text-muted hover:text-danger-text hover:bg-danger-surface'
                                : 'text-teal-deep hover:bg-success-surface'
                            }`}
                          >
                            <Power className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* CSV IMPORT MODAL (MODULE A: DATA MAHASISWA) */}
      <CsvImportModal
        isOpen={isCsvModalOpen}
        onClose={() => setIsCsvModalOpen(false)}
        title="Impor Data Mahasiswa (Whitelist)"
        description="Unggah berkas CSV berisi NIM, Nama Lengkap, dan Email untuk pendaftaran whitelist secara massal."
        templateFileName="template_data_mahasiswa_novarion.csv"
        templateHeaders={['nim', 'nama', 'email']}
        templateSampleRows={[
          ['G1401201001', 'Ahmad Fadillah', 'ahmad.f@apps.ipb.ac.id'],
          ['G1401201002', 'Budi Pratama Santoso', 'budi.p@apps.ipb.ac.id'],
          ['G1401201003', 'Citra Dewi Lestari', 'citra.d@apps.ipb.ac.id'],
        ]}
        onPreview={async (content, name) => {
          const res = await previewStudentCsvAction(content, name);
          return res;
        }}
        onExecute={async (content, name) => {
          const res = await executeStudentCsvAction(content, name);
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
                <th className="py-2.5 px-3">Nama</th>
                <th className="py-2.5 px-3">Email</th>
                <th className="py-2.5 px-3">Aksi</th>
                <th className="py-2.5 px-3">Keterangan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {preview.validRows.map((r: any, idx: number) => (
                <tr key={idx} className="hover:bg-surface-soft/40">
                  <td className="py-2 px-3 font-mono font-bold">{r.nim}</td>
                  <td className="py-2 px-3">{r.nama}</td>
                  <td className="py-2 px-3 font-mono text-[11px] text-text-muted">{r.email}</td>
                  <td className="py-2 px-3">
                    <Badge variant={r.action === 'insert' ? 'success' : 'orange'} size="sm">
                      {r.action === 'insert' ? 'Tambah Baru' : 'Perbarui'}
                    </Badge>
                  </td>
                  <td className="py-2 px-3 text-[11px] text-text-muted">{r.note || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      />
    </div>
  );
}
