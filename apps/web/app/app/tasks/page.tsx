import React from 'react';
import { requireAuth } from '@/lib/auth/guards';
import { getDb, personalTasks } from '@novarion/db';
import { eq, desc } from 'drizzle-orm';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';
import { Input } from '@/components/Input';
import { CheckSquare, Plus, Check } from 'lucide-react';
import { addPersonalTaskAction, toggleTaskStatusAction } from '@/actions/tasks';
import { formatWIBShort } from '@novarion/shared';

export default async function TasksPage() {
  const user = await requireAuth();
  const db = getDb();

  const tasks = await db
    .select()
    .from(personalTasks)
    .where(eq(personalTasks.profileId, user.id))
    .orderBy(desc(personalTasks.createdAt))
    .limit(100);

  const completedCount = tasks.filter((t) => t.status === 'done').length;

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-extrabold text-2xl text-text-primary tracking-tight">
            Tugas & Checklist Saya
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Agenda pribadi dan daftar pekerjaan kuliah yang hanya dapat diakses olehmu.
          </p>
        </div>

        <Badge variant="primary" size="md">
          {completedCount} / {tasks.length} Selesai
        </Badge>
      </div>

      {/* Form Tambah Tugas Cepat */}
      <Card className="p-4 bg-surface">
        <form
          action={async (formData) => {
            'use server';
            await addPersonalTaskAction(formData);
          }}
          className="flex flex-col sm:flex-row items-center gap-3"
        >
          <input
            name="title"
            placeholder="Tulis tugas baru (misal: Kerjakan bab 2 tugas akhir)..."
            required
            className="flex-1 w-full px-3.5 py-2 text-xs bg-surface-soft border border-border rounded-input text-text-primary focus:border-teal-deep focus:outline-none"
          />
          <input
            name="deadline"
            type="datetime-local"
            className="w-full sm:w-auto px-3.5 py-2 text-xs bg-surface-soft border border-border rounded-input text-text-primary focus:border-teal-deep focus:outline-none"
          />
          <Button variant="primary" size="sm" type="submit" className="w-full sm:w-auto shrink-0">
            <Plus className="w-3.5 h-3.5 mr-1" />
            <span>Tambah</span>
          </Button>
        </form>
      </Card>

      {/* Daftar Tugas Pribadi */}
      <Card className="p-0 overflow-hidden flex flex-col">
        <div className="p-3.5 bg-surface-soft border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-teal-deep" />
            <span className="text-xs font-bold text-text-primary">Daftar Tugas</span>
          </div>
        </div>

        {tasks.length === 0 ? (
          <div className="p-10 text-center text-xs text-text-muted">
            Belum ada tugas pribadi. Tulis tugas pertamamu di atas!
          </div>
        ) : (
          <div className="divide-y divide-border">
            {tasks.map((t) => (
              <div key={t.id} className="p-4 flex items-center justify-between gap-4 hover:bg-surface-soft/40 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <form
                    action={async () => {
                      'use server';
                      await toggleTaskStatusAction(t.id, t.status);
                    }}
                  >
                    <button
                      type="submit"
                      className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                        t.status === 'done'
                          ? 'bg-teal-deep border-teal-deep text-white'
                          : 'border-border hover:border-teal-deep bg-surface'
                      }`}
                    >
                      {t.status === 'done' && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </button>
                  </form>

                  <div className="flex flex-col truncate">
                    <span className={`text-xs font-semibold truncate ${t.status === 'done' ? 'line-through text-text-muted' : 'text-text-primary'}`}>
                      {t.title}
                    </span>
                    {t.deadline && (
                      <span className="text-[11px] text-text-muted">
                        Batas: {formatWIBShort(t.deadline)}
                      </span>
                    )}
                  </div>
                </div>

                <Badge variant={t.status === 'done' ? 'success' : 'neutral'} size="sm">
                  {t.status === 'done' ? 'Selesai' : 'Belum'}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
