'use client';

import React, { useState, useTransition } from 'react';
import { Check, Plus, Trash2, Calendar, Clock, Search, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';
import { addPersonalTaskAction, toggleTaskStatusAction, deletePersonalTaskAction } from '@/actions/tasks';
import { formatWIBShort, formatWIB } from '@novarion/shared';
import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';

export interface TaskRecord {
  id: string;
  title: string;
  description: string | null;
  deadline: Date | string | null;
  startTime?: Date | string | null;
  color?: string | null;
  status: string;
  completedAt?: Date | string | null;
  createdAt?: Date | string | null;
}

interface TaskManagerClientProps {
  initialTasks: TaskRecord[];
}

export function TaskManagerClient({ initialTasks }: TaskManagerClientProps) {
  const [tasks, setTasks] = useState<TaskRecord[]>(initialTasks);
  const [search, setSearch] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newDeadline, setNewDeadline] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [showExtendedForm, setShowExtendedForm] = useState(false);
  const [showCompleted, setShowCompleted] = useState(true);
  const [isPending, startTransition] = useTransition();

  const handleToggle = (taskId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'done' ? 'todo' : 'done';
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: nextStatus } : t))
    );

    startTransition(async () => {
      try {
        await toggleTaskStatusAction(taskId, currentStatus);
      } catch (err) {
        setTasks((prev) =>
          prev.map((t) => (t.id === taskId ? { ...t, status: currentStatus } : t))
        );
      }
    });
  };

  const handleDelete = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));

    startTransition(async () => {
      try {
        await deletePersonalTaskAction(taskId);
      } catch (err) {
        setTasks(initialTasks);
      }
    });
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const optimisticId = 'temp-' + Date.now();
    const newTask: TaskRecord = {
      id: optimisticId,
      title: newTitle.trim(),
      description: newDescription.trim() || null,
      deadline: newDeadline ? new Date(newDeadline) : null,
      status: 'todo',
      createdAt: new Date(),
    };

    setTasks((prev) => [newTask, ...prev]);
    const titleVal = newTitle.trim();
    const descVal = newDescription.trim();
    const deadlineVal = newDeadline;

    setNewTitle('');
    setNewDescription('');
    setNewDeadline('');
    setShowExtendedForm(false);

    startTransition(async () => {
      const fd = new FormData();
      fd.append('title', titleVal);
      if (descVal) fd.append('description', descVal);
      if (deadlineVal) fd.append('deadline', deadlineVal);

      const res = await addPersonalTaskAction(fd);
      if (!res.success) {
        setTasks((prev) => prev.filter((t) => t.id !== optimisticId));
      } else if (res.id) {
        setTasks((prev) =>
          prev.map((t) => (t.id === optimisticId ? { ...t, id: res.id! } : t))
        );
      }
    });
  };

  const filteredTasks = tasks.filter((t) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      t.title.toLowerCase().includes(q) ||
      (t.description && t.description.toLowerCase().includes(q))
    );
  });

  const pendingTasks = filteredTasks.filter((t) => t.status !== 'done');
  const completedTasks = filteredTasks.filter((t) => t.status === 'done');

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full">
      {/* 1. Header & Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-card bg-surface border border-border">
        <div>
          <h1 className="font-heading font-bold text-2xl sm:text-3xl text-text-primary tracking-tight">
            Tugas & Checklist Saya
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Daftar pekerjaan pribadi dan catatan akademik mandiri yang hanya dapat diakses oleh Anda.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded bg-teal-deep/10 text-teal-deep border border-teal-deep/20">
            {completedTasks.length} / {tasks.length} Selesai
          </span>
        </div>
      </div>

      {/* 2. Quick Task Creation Card */}
      <div className="p-4 sm:p-5 rounded-card bg-surface border border-border flex flex-col gap-3">
        <form onSubmit={handleCreate} className="flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row items-center gap-2.5">
            <input
              type="text"
              name="title"
              placeholder="Tulis tugas baru (misal: Laporan Analisis Regresi Bab 3)..."
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-surface-soft border border-border rounded-input text-text-primary focus:border-teal-deep focus:outline-none"
              required
            />
            <input
              type="datetime-local"
              name="deadline"
              value={newDeadline}
              onChange={(e) => setNewDeadline(e.target.value)}
              title="Batas waktu tugas (Opsional)"
              className="w-full sm:w-auto px-3.5 py-2 text-xs bg-surface-soft border border-border rounded-input text-text-muted focus:border-teal-deep focus:outline-none font-mono"
            />
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={!newTitle.trim()}
              className="w-full sm:w-auto shrink-0 text-xs font-medium"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              <span>Tambah</span>
            </Button>
          </div>

          <div className="flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={() => setShowExtendedForm(!showExtendedForm)}
              className="text-text-muted hover:text-text-primary text-[11px] font-medium"
            >
              {showExtendedForm ? '— Sembunyikan catatan tambahan' : '+ Tambah catatan / instruksi'}
            </button>
          </div>

          {showExtendedForm && (
            <textarea
              placeholder="Catatan tambahan, tautan file, atau petunjuk pengerjaan..."
              rows={2}
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-surface-soft border border-border rounded-input text-text-primary focus:border-teal-deep focus:outline-none"
            />
          )}
        </form>
      </div>

      {/* 3. Search Toolbar (shown if list has items) */}
      {tasks.length > 3 && (
        <div className="relative">
          <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari dalam daftar tugas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-surface border border-border rounded-input text-text-primary focus:border-teal-deep focus:outline-none"
          />
        </div>
      )}

      {/* 4. Section: Tugas Berjalan (Pending) */}
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-heading font-bold uppercase tracking-wider text-text-muted">
              Tugas Berjalan
            </h2>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-surface-soft text-text-muted font-bold border border-border">
              {pendingTasks.length}
            </span>
          </div>
        </div>

        {pendingTasks.length === 0 ? (
          <div className="p-8 rounded-card bg-surface border border-border text-center flex flex-col items-center gap-2">
            <CheckCircle2 className="w-8 h-8 text-teal-deep/50" />
            <p className="text-xs font-bold text-text-primary">Tidak Ada Tugas Berjalan</p>
            <p className="text-[11px] text-text-muted">
              Semua tugas pribadi telah diselesaikan atau belum ada yang ditambahkan.
            </p>
          </div>
        ) : (
          <div className="rounded-card bg-surface border border-border divide-y divide-border overflow-hidden">
            {pendingTasks.map((t) => (
              <div
                key={t.id}
                className="p-3.5 sm:p-4 flex items-start justify-between gap-3 hover:bg-surface-soft/40 transition-colors group"
              >
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <button
                    type="button"
                    onClick={() => handleToggle(t.id, t.status)}
                    className="w-4 h-4 rounded border border-border hover:border-teal-deep bg-surface flex items-center justify-center shrink-0 mt-0.5 transition-colors"
                    aria-label="Tandai selesai"
                  />
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <span className="text-xs font-medium text-text-primary">
                      {t.title}
                    </span>
                    {t.description && (
                      <p className="text-[11px] text-text-muted whitespace-pre-wrap">
                        {t.description}
                      </p>
                    )}
                    {t.deadline && (
                      <div className="flex items-center gap-1.5 mt-1 text-[11px] text-[#9E5507] font-medium font-mono">
                        <Clock className="w-3 h-3 shrink-0" />
                        <span>Batas: {formatWIBShort(new Date(t.deadline))}</span>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleDelete(t.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-text-muted hover:text-danger-text rounded transition-all"
                  title="Hapus tugas"
                  aria-label="Hapus tugas"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 5. Section: Telah Selesai (Completed) */}
      {completedTasks.length > 0 && (
        <div className="flex flex-col gap-2.5 mt-2">
          <div className="flex items-center justify-between px-1">
            <button
              type="button"
              onClick={() => setShowCompleted(!showCompleted)}
              className="flex items-center gap-2 text-xs font-heading font-bold uppercase tracking-wider text-text-muted hover:text-text-primary"
            >
              <span>Telah Selesai ({completedTasks.length})</span>
              {showCompleted ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

          {showCompleted && (
            <div className="rounded-card bg-surface border border-border divide-y divide-border overflow-hidden opacity-90">
              {completedTasks.map((t) => (
                <div
                  key={t.id}
                  className="p-3.5 sm:p-4 flex items-center justify-between gap-3 hover:bg-surface-soft/40 transition-colors group"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <button
                      type="button"
                      onClick={() => handleToggle(t.id, t.status)}
                      className="w-4 h-4 rounded bg-teal-deep border border-teal-deep text-white flex items-center justify-center shrink-0 transition-colors"
                      aria-label="Tandai belum selesai"
                    >
                      <Check className="w-3 h-3 stroke-[3]" />
                    </button>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs line-through text-text-muted truncate">
                        {t.title}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant="success" size="sm">Selesai</Badge>
                    <button
                      type="button"
                      onClick={() => handleDelete(t.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-text-muted hover:text-danger-text rounded transition-all"
                      title="Hapus tugas"
                      aria-label="Hapus tugas"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
