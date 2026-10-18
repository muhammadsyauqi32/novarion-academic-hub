'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import { Check, Plus, Loader2, ArrowRight } from 'lucide-react';
import { toggleTaskStatusAction, addPersonalTaskAction } from '@/actions/tasks';
import { formatWIBShort } from '@novarion/shared';

export interface TaskItem {
  id: string;
  title: string;
  description?: string | null;
  deadline?: Date | string | null;
  color?: string | null;
  status: string;
}

interface DashboardTaskListProps {
  initialTasks: TaskItem[];
}

export function DashboardTaskList({ initialTasks }: DashboardTaskListProps) {
  const [tasks, setTasks] = useState<TaskItem[]>(initialTasks);
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDeadline, setNewDeadline] = useState('');
  const [isPending, startTransition] = useTransition();

  const handleToggle = (taskId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'done' ? 'todo' : 'done';
    // Optimistic state update
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: nextStatus } : t))
    );

    startTransition(async () => {
      try {
        await toggleTaskStatusAction(taskId, currentStatus);
      } catch (err) {
        // Rollback on error
        setTasks((prev) =>
          prev.map((t) => (t.id === taskId ? { ...t, status: currentStatus } : t))
        );
      }
    });
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const optimisticId = 'temp-' + Date.now();
    const newTask: TaskItem = {
      id: optimisticId,
      title: newTitle.trim(),
      deadline: newDeadline ? new Date(newDeadline) : null,
      status: 'todo',
    };

    setTasks((prev) => [newTask, ...prev]);
    const titleToSubmit = newTitle.trim();
    const deadlineToSubmit = newDeadline;
    setNewTitle('');
    setNewDeadline('');
    setIsAdding(false);

    startTransition(async () => {
      const fd = new FormData();
      fd.append('title', titleToSubmit);
      if (deadlineToSubmit) {
        fd.append('deadline', deadlineToSubmit);
      }
      const res = await addPersonalTaskAction(fd);
      if (!res.success) {
        // Remove optimistic task if failed
        setTasks((prev) => prev.filter((t) => t.id !== optimisticId));
      } else if (res.id) {
        setTasks((prev) =>
          prev.map((t) => (t.id === optimisticId ? { ...t, id: res.id! } : t))
        );
      }
    });
  };

  const completedCount = tasks.filter((t) => t.status === 'done').length;

  return (
    <div className="flex flex-col rounded-card bg-surface border border-border overflow-hidden">
      {/* Header Bar */}
      <div className="px-4 py-3 bg-surface-soft/60 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-heading font-semibold text-xs text-text-primary tracking-tight">Tugas Mandiri</span>
          <span className="text-[11px] font-mono font-medium text-teal-deep bg-teal-deep/10 px-1.5 py-0.5 rounded border border-teal-deep/20">
            {completedCount}/{tasks.length}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsAdding(!isAdding)}
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-teal-deep hover:text-teal-deep/80 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah</span>
          </button>
          <span className="text-text-muted/40">•</span>
          <Link
            href="/app/tasks"
            className="text-[11px] font-semibold text-text-muted hover:text-text-primary transition-colors flex items-center gap-0.5"
          >
            <span>Semua</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Quick Add Form Drawer */}
      {isAdding && (
        <form onSubmit={handleAddTask} className="p-3 bg-surface border-b border-border flex flex-col gap-2 animate-in fade-in duration-150">
          <input
            type="text"
            placeholder="Tulis catatan tugas baru..."
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            autoFocus
            className="w-full px-3 py-1.5 text-xs bg-surface-soft border border-border rounded-input text-text-primary focus:border-teal-deep focus:outline-none"
          />
          <div className="flex items-center justify-between gap-2">
            <input
              type="datetime-local"
              value={newDeadline}
              onChange={(e) => setNewDeadline(e.target.value)}
              className="text-[11px] px-2.5 py-1 bg-surface-soft border border-border rounded-input text-text-muted focus:border-teal-deep focus:outline-none"
            />
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-2 py-1 text-[11px] text-text-muted hover:text-text-primary"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={!newTitle.trim()}
                className="px-3 py-1 text-[11px] font-semibold bg-teal-deep text-white rounded-input hover:bg-teal-deep/90 disabled:opacity-50"
              >
                Simpan
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Task List */}
      {tasks.length === 0 ? (
        <div className="p-6 text-center text-xs text-text-muted flex flex-col items-center gap-1.5">
          <p>Belum ada catatan tugas pribadi.</p>
          <button
            type="button"
            onClick={() => setIsAdding(true)}
            className="text-xs font-semibold text-teal-deep hover:underline"
          >
            + Buat tugas sekarang
          </button>
        </div>
      ) : (
        <div className="divide-y divide-border">
          {tasks.slice(0, 5).map((t) => {
            const isDone = t.status === 'done';
            return (
              <div
                key={t.id}
                className="px-4 py-2.5 flex items-center justify-between gap-3 text-xs hover:bg-surface-soft/40 transition-colors group"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <button
                    type="button"
                    onClick={() => handleToggle(t.id, t.status)}
                    className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                      isDone
                        ? 'bg-teal-deep border-teal-deep text-white'
                        : 'border-border hover:border-teal-deep bg-surface'
                    }`}
                    aria-label={isDone ? 'Tandai belum selesai' : 'Tandai selesai'}
                  >
                    {isDone && <Check className="w-3 h-3 stroke-[3]" />}
                  </button>
                  <span
                    className={`truncate text-xs ${
                      isDone
                        ? 'line-through text-text-muted/70'
                        : 'font-medium text-text-primary'
                    }`}
                  >
                    {t.title}
                  </span>
                </div>

                {t.deadline && (
                  <span className="text-[10px] text-text-muted font-mono shrink-0">
                    {formatWIBShort(new Date(t.deadline))}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
