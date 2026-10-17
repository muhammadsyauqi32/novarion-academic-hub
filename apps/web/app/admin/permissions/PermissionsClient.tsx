'use client';

import React, { useState } from 'react';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { 
  Shield, 
  ShieldAlert, 
  ShieldCheck, 
  UserCheck, 
  Plus, 
  Trash2, 
  Search, 
  AlertCircle, 
  CheckCircle2,
  Calendar,
  Layers,
  Sparkles
} from 'lucide-react';
import { 
  grantPermissionAction, 
  grantPresetAction, 
  revokePermissionAction, 
  getStudentsPermissionsListAction 
} from '@/actions/permissions';
import { PERMISSION_PRESETS } from '@/lib/auth/presets';
import { AppPermission } from '@novarion/shared';

interface PermissionsClientProps {
  initialStudents: any[];
  courses: any[];
  classSections: any[];
}

export function PermissionsClient({ initialStudents, courses, classSections }: PermissionsClientProps) {
  const [students, setStudents] = useState<any[]>(initialStudents);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);

  // Form state
  const [selectedPreset, setSelectedPreset] = useState<keyof typeof PERMISSION_PRESETS>('AGENDA_MANAGER');
  const [selectedCustomPerm, setSelectedCustomPerm] = useState<AppPermission>('agenda.create');
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [selectedClassId, setSelectedClassId] = useState<string>('');

  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const showFeedback = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const res = await getStudentsPermissionsListAction(searchQuery);
    setIsSubmitting(false);
    if (res.success && res.data) {
      setStudents(res.data);
    }
  };

  const handleGrantPreset = async () => {
    if (!selectedStudent) {
      showFeedback('error', 'Silakan pilih mahasiswa terlebih dahulu.');
      return;
    }
    setIsSubmitting(true);
    const res = await grantPresetAction({
      targetProfileId: selectedStudent.id,
      presetKey: selectedPreset,
      courseId: selectedCourseId || undefined,
      classSectionId: selectedClassId || undefined,
    });
    setIsSubmitting(false);

    if (res.success) {
      showFeedback('success', `Preset izin '${PERMISSION_PRESETS[selectedPreset].label}' berhasil diberikan!`);
      const refetch = await getStudentsPermissionsListAction(searchQuery);
      if (refetch.success && refetch.data) {
        setStudents(refetch.data);
        const updated = refetch.data.find((s) => s.id === selectedStudent.id);
        if (updated) setSelectedStudent(updated);
      }
    } else {
      showFeedback('error', res.error || 'Gagal memberikan preset.');
    }
  };

  const handleGrantCustom = async () => {
    if (!selectedStudent) {
      showFeedback('error', 'Silakan pilih mahasiswa terlebih dahulu.');
      return;
    }
    setIsSubmitting(true);
    const res = await grantPermissionAction({
      targetProfileId: selectedStudent.id,
      permission: selectedCustomPerm,
      courseId: selectedCourseId || undefined,
      classSectionId: selectedClassId || undefined,
    });
    setIsSubmitting(false);

    if (res.success) {
      showFeedback('success', `Izin '${selectedCustomPerm}' berhasil ditambahkan!`);
      const refetch = await getStudentsPermissionsListAction(searchQuery);
      if (refetch.success && refetch.data) {
        setStudents(refetch.data);
        const updated = refetch.data.find((s) => s.id === selectedStudent.id);
        if (updated) setSelectedStudent(updated);
      }
    } else {
      showFeedback('error', res.error || 'Gagal menambahkan izin.');
    }
  };

  const handleRevoke = async (permissionId: string) => {
    setIsSubmitting(true);
    const res = await revokePermissionAction(permissionId);
    setIsSubmitting(false);

    if (res.success) {
      showFeedback('success', 'Izin berhasil dicabut.');
      const refetch = await getStudentsPermissionsListAction(searchQuery);
      if (refetch.success && refetch.data) {
        setStudents(refetch.data);
        if (selectedStudent) {
          const updated = refetch.data.find((s) => s.id === selectedStudent.id);
          if (updated) setSelectedStudent(updated);
        }
      }
    } else {
      showFeedback('error', res.error || 'Gagal mencabut izin.');
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`p-4 rounded-xl flex items-center gap-3 text-xs sm:text-sm font-semibold animate-in fade-in ${
            feedback.type === 'success'
              ? 'bg-[#C9FBD4]/60 text-teal-deep border border-[#41C2A1]/40'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Preset Reference Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(PERMISSION_PRESETS).map(([key, preset]) => (
          <div
            key={key}
            className={`p-4 rounded-xl border bg-surface transition-all flex flex-col justify-between ${
              selectedPreset === key ? 'border-teal-deep ring-2 ring-[#41C2A1]/20' : 'border-border'
            }`}
          >
            <div>
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck className="w-4 h-4 text-teal-deep shrink-0" />
                <h4 className="font-heading font-bold text-xs sm:text-sm text-text-primary line-clamp-1">
                  {preset.label}
                </h4>
              </div>
              <p className="text-[11px] text-text-muted leading-relaxed line-clamp-2">
                {preset.description}
              </p>
            </div>
            <div className="pt-3 border-t border-border/60 mt-3 flex items-center justify-between text-[10px] text-teal-deep font-semibold">
              <span>{preset.permissions.length} wewenang terpaket</span>
              <button
                type="button"
                onClick={() => setSelectedPreset(key as any)}
                className="underline hover:text-text-primary"
              >
                Gunakan
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Student Search & List */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <form onSubmit={handleSearch} className="flex gap-2">
            <Input
              placeholder="Cari mahasiswa berdasarkan NIM, nama, atau email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
            <Button variant="primary" size="sm" type="submit" disabled={isSubmitting} className="font-bold text-xs">
              <Search className="w-4 h-4 mr-1.5" />
              <span>Cari</span>
            </Button>
          </form>

          <div className="flex flex-col gap-3">
            {students.length === 0 ? (
              <div className="p-8 rounded-xl bg-surface border border-dashed border-border text-center text-xs text-text-muted">
                Tidak ada mahasiswa yang cocok dengan pencarian.
              </div>
            ) : (
              students.map((student) => {
                const isSelected = selectedStudent?.id === student.id;
                const permsCount = (student.permissions || []).length;
                return (
                  <div
                    key={student.id}
                    onClick={() => setSelectedStudent(student)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs ${
                      isSelected
                        ? 'border-teal-deep bg-[#41C2A1]/5 ring-1 ring-teal-deep'
                        : 'border-border bg-surface hover:border-border-focus'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-teal-deep bg-surface-soft px-2 py-0.5 rounded border border-border">
                          {student.nim}
                        </span>
                        <span className="font-heading font-bold text-sm text-text-primary">
                          {student.fullName}
                        </span>
                        {student.role === 'admin' && (
                          <span className="text-[10px] font-bold text-white bg-teal-deep px-1.5 py-0.5 rounded">
                            Super Admin
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-text-muted mt-1">
                        {student.email}
                      </p>

                      {/* Display delegated permissions badges */}
                      {permsCount > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {(student.permissions || []).map((p: any) => (
                            <span
                              key={p.id}
                              className="text-[10px] font-semibold text-text-primary bg-surface border border-border px-2 py-0.5 rounded-full flex items-center gap-1"
                            >
                              <span>{p.permission}</span>
                              {p.courseId && <span className="text-teal-deep">• Matkul</span>}
                              {p.classSectionId && <span className="text-[#B54708]">• Kelas</span>}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs font-semibold text-text-muted">
                        {permsCount} Delegasi
                      </span>
                      <Button
                        variant={isSelected ? 'primary' : 'secondary'}
                        size="sm"
                        className="text-xs py-1.5 px-3"
                      >
                        {isSelected ? 'Terpilih' : 'Pilih'}
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Delegated Grant Controls & Active Permissions View */}
        <div className="lg:col-span-5 flex flex-col gap-6 sticky top-20">
          {selectedStudent ? (
            <div className="p-6 rounded-2xl bg-surface border border-border shadow-xs flex flex-col gap-5">
              <div className="border-b border-border/60 pb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-teal-deep">
                  Mahasiswa Terpilih
                </span>
                <h3 className="font-heading font-black text-lg text-text-primary mt-0.5">
                  {selectedStudent.fullName}
                </h3>
                <p className="text-xs text-text-muted font-mono mt-0.5">
                  NIM: {selectedStudent.nim} • Status: {selectedStudent.role}
                </p>
              </div>

              {/* Scope Selection */}
              <div className="flex flex-col gap-3">
                <span className="text-xs font-bold text-text-primary">
                  Cakupan Delegasi (Scope Opsional)
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] text-text-muted block mb-1">Mata Kuliah</label>
                    <select
                      value={selectedCourseId}
                      onChange={(e) => setSelectedCourseId(e.target.value)}
                      className="w-full text-xs p-2 rounded-lg border border-border bg-surface text-text-primary"
                    >
                      <option value="">Semua (Seluruh Angkatan)</option>
                      {courses.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.code} - {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] text-text-muted block mb-1">Kelas Spesifik</label>
                    <select
                      value={selectedClassId}
                      onChange={(e) => setSelectedClassId(e.target.value)}
                      className="w-full text-xs p-2 rounded-lg border border-border bg-surface text-text-primary"
                    >
                      <option value="">Semua Kelas</option>
                      {classSections.map((cs) => (
                        <option key={cs.id} value={cs.id}>
                          {cs.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Option A: Grant Preset */}
              <div className="p-4 rounded-xl bg-surface-soft border border-border flex flex-col gap-3">
                <span className="text-xs font-bold text-text-primary">
                  Metode 1: Berikan Paket Preset Peran
                </span>
                <select
                  value={selectedPreset}
                  onChange={(e) => setSelectedPreset(e.target.value as any)}
                  className="w-full text-xs p-2 rounded-lg border border-border bg-surface text-text-primary font-medium"
                >
                  {Object.entries(PERMISSION_PRESETS).map(([k, p]) => (
                    <option key={k} value={k}>
                      {p.label}
                    </option>
                  ))}
                </select>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleGrantPreset}
                  disabled={isSubmitting}
                  className="font-bold text-xs justify-center"
                >
                  Terapkan Preset Terpilih
                </Button>
              </div>

              {/* Option B: Grant Individual Permission */}
              <div className="p-4 rounded-xl bg-surface-soft border border-border flex flex-col gap-3">
                <span className="text-xs font-bold text-text-primary">
                  Metode 2: Tambahkan Izin Granular Khusus
                </span>
                <select
                  value={selectedCustomPerm}
                  onChange={(e) => setSelectedCustomPerm(e.target.value as any)}
                  className="w-full text-xs p-2 rounded-lg border border-border bg-surface text-text-primary font-medium"
                >
                  <option value="agenda.create">agenda.create (Buat Agenda Resmi Langsung)</option>
                  <option value="agenda.edit">agenda.edit (Edit Agenda)</option>
                  <option value="agenda.cancel">agenda.cancel (Batalkan Agenda)</option>
                  <option value="agenda.import">agenda.import (Impor Agenda CSV)</option>
                  <option value="materials.manage">materials.manage (Kelola Berkas Materi)</option>
                  <option value="knowledge.manage">knowledge.manage (Kelola Knowledge Hub)</option>
                  <option value="website.manage">website.manage (Kelola Website Publik)</option>
                  <option value="students.manage">students.manage (Kelola Akun Mahasiswa)</option>
                </select>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleGrantCustom}
                  disabled={isSubmitting}
                  className="font-semibold text-xs justify-center"
                >
                  + Tambahkan Izin Spesifik
                </Button>
              </div>

              {/* List of currently granted permissions for this student */}
              <div className="pt-2">
                <span className="text-xs font-bold text-text-primary block mb-2">
                  Daftar Wewenang yang Aktif ({(selectedStudent.permissions || []).length}):
                </span>
                {(selectedStudent.permissions || []).length === 0 ? (
                  <p className="text-xs text-text-muted italic">
                    Mahasiswa ini berstatus mahasiswa biasa tanpa wewenang delegasi khusus.
                  </p>
                ) : (
                  <div className="flex flex-col gap-2 max-h-56 overflow-y-auto">
                    {(selectedStudent.permissions || []).map((perm: any) => (
                      <div
                        key={perm.id}
                        className="p-2.5 rounded-lg border border-border bg-surface flex items-center justify-between text-xs"
                      >
                        <div>
                          <p className="font-semibold text-text-primary">{perm.permission}</p>
                          <p className="text-[10px] text-text-muted">
                            {perm.courseId ? 'Scoped Course' : 'All Courses'} •{' '}
                            {perm.classSectionId ? 'Scoped Class' : 'All Classes'}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRevoke(perm.id)}
                          disabled={isSubmitting}
                          className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Cabut izin"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-8 rounded-2xl bg-surface border border-dashed border-border text-center text-xs text-text-muted">
              Pilih seorang mahasiswa dari daftar di sebelah kiri untuk melihat dan mengelola wewenang granularnya.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
