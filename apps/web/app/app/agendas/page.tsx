import React from 'react';
import { requireAuth } from '@/lib/auth/guards';
import { Card } from '@/components/Card';
import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { Plus, ListTodo, ShieldAlert, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { getDb, agendas } from '@novarion/db';
import { eq, desc } from 'drizzle-orm';
import { formatWIBShort } from '@novarion/shared';

export default async function AgendasListPage() {
  const user = await requireAuth();
  const db = getDb();

  const allAgendas = await db
    .select()
    .from(agendas)
    .where(eq(agendas.status, 'published'))
    .orderBy(desc(agendas.deadline));

  return (
    <div className="flex flex-col gap-6">
      {user.role === 'admin' && (
        <div className="p-4 rounded-xl bg-teal-deep/10 border border-teal-deep/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 text-teal-deep">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>
              Anda login sebagai Administrator. Untuk menambah, menyunting, atau menghapus agenda resmi secara langsung, buka workspace admin.
            </span>
          </div>
          <Link href="/admin/agendas" className="shrink-0">
            <Button variant="primary" size="sm" className="gap-1.5 text-xs">
              <span>Buka Kelola Agenda Admin</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-extrabold text-2xl text-text-primary tracking-tight">
            Daftar Agenda Akademik
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Agenda perkuliahan resmi yang telah diverifikasi dan dipublikasikan.
          </p>
        </div>

        <Link href="/app/agendas/new">
          <Button variant="primary" size="sm">
            <Plus className="w-3.5 h-3.5 mr-1" />
            <span>Ajukan Agenda</span>
          </Button>
        </Link>
      </div>

      <Card className="p-0 overflow-hidden flex flex-col">
        <div className="p-4 bg-surface-soft border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ListTodo className="w-4 h-4 text-teal-deep" />
            <span className="text-xs font-bold text-text-primary">Agenda Terpublikasi</span>
          </div>
          <Badge variant="primary" size="sm">{allAgendas.length} Agenda</Badge>
        </div>

        {allAgendas.length === 0 ? (
          <div className="p-12 text-center text-xs text-text-muted">
            Belum ada agenda terpublikasi.
          </div>
        ) : (
          <div className="divide-y divide-border">
            {allAgendas.map((item) => (
              <div key={item.id} className="p-4 flex items-center justify-between gap-4 hover:bg-surface-soft/40 transition-colors">
                <div className="flex flex-col gap-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Badge variant="primary" size="sm">{item.category}</Badge>
                    <span className="text-[11px] text-text-muted capitalize">• {item.scope}</span>
                  </div>
                  <h3 className="font-heading font-bold text-sm text-text-primary">
                    {item.title}
                  </h3>
                  <p className="text-xs text-text-muted">
                    Batas: {item.deadline ? formatWIBShort(item.deadline) : 'Tidak ada deadline'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
