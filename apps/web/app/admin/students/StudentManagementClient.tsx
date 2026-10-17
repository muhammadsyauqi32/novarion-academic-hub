'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/Card';
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
} from 'lucide-react';
import {
  addWhitelistStudentAction,
  toggleWhitelistStatusAction,
  resetStudentPasswordAction,
} from '@/actions/whitelist';

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

  // Modal Password Sementara (One-Time Display)
  const [tempPasswordModal, setTempPasswordModal] = useState<{
    nim: string;
    fullName: string;
    password: string;
    isReset?: boolean;
  } | null>(null);

  const [copied, setCopied] = useState(false);
  const [isResetting, setIsResetting] = useState<string | null>(null);
  const [isToggling, setIsToggling] = useState<string | null>(null);

  // Sinkronkan state saat props data server diperbarui
  useEffect(() => {
    setStudents(initialStudents);
  }, [initialStudents]);

  const handleCopyPassword = () => {
    if (!tempPasswordModal) return;
    navigator.clipboard.writeText(tempPasswordModal.password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCloseModal = () => {
    setTempPasswordModal(null);
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

    try {
      const res = await addWhitelistStudentAction(formData);
      if (!res.success) {
        setFormError(res.error || 'Gagal menambahkan mahasiswa.');
        setIsAdding(false);
        return;
      }

      if (res.temporaryPassword) {
        setTempPasswordModal({
          nim,
          fullName,
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
        setTempPasswordModal({
          nim: student.nim,
          fullName: student.fullName,
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
      {/* Modal Password Sementara yang Aman (One-Time Display) */}
      {tempPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <Card className="w-full max-w-md p-6 bg-surface border-border shadow-2xl flex flex-col gap-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-teal-deep/15 text-teal-deep flex items-center justify-center">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-base text-text-primary">
                    {tempPasswordModal.isReset
                      ? 'Kata Sandi Berhasil Direset'
                      : 'Akun Mahasiswa Berhasil Dibuat'}
                  </h3>
                  <p className="text-xs text-text-muted">
                    {tempPasswordModal.fullName} ({tempPasswordModal.nim})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCloseModal}
                className="p-1 rounded-lg text-text-muted hover:text-text-primary transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-surface-soft border border-border flex flex-col gap-2">
              <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">
                Kata Sandi Sementara (One-Time Display)
              </span>
              <div className="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-surface border border-border">
                <code className="font-mono text-sm font-bold text-teal-deep tracking-wider select-all">
                  {tempPasswordModal.password}
                </code>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleCopyPassword}
                  className="gap-1.5 text-xs py-1 px-2.5"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-teal-deep" />
                      <span>Tersalin</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Salin</span>
                    </>
                  )}
                </Button>
              </div>
            </div>

            <div className="text-[11px] text-text-muted leading-relaxed">
              ⚠️ Berikan kata sandi ini kepada mahasiswa bersangkutan. Mahasiswa akan diwajibkan
              mengganti kata sandi ini pada saat pertama kali login sebelum dapat mengakses sistem.
            </div>

            <Button
              variant="primary"
              size="sm"
              onClick={handleCloseModal}
              className="w-full font-semibold"
            >
              Selesai & Tutup
            </Button>
          </Card>
        </div>
      )}

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
        </Card>

        {/* Tabel Data Whitelist */}
        <Card className="lg:col-span-8 p-0 overflow-hidden flex flex-col">
          <div className="p-4 bg-surface-soft border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 max-w-sm w-full">
              <div className="relative w-full">
                <Search className="w-3.5 h-3.5 text-text-muted absolute left-3 top-2.5" />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari NIM, Nama, atau Email..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-surface border border-border rounded-lg text-text-primary focus:outline-none focus:border-teal-deep"
                />
              </div>
            </div>

            <span className="text-xs text-text-muted shrink-0">
              Menampilkan {filtered.length} data
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
                      <td className="py-3 px-4 font-bold font-mono">{s.nim}</td>
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
        </Card>
      </div>
    </div>
  );
}
