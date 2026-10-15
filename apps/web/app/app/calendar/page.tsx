import React from 'react';
import { requireAuth } from '@/lib/auth/guards';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';
import { Calendar as CalendarIcon, Filter, Plus } from 'lucide-react';
import Link from 'next/link';
import { getDb, agendas } from '@novarion/db';
import { eq, desc } from 'drizzle-orm';
import { formatWIBShort } from '@novarion/shared';

export default async function CalendarPage() {
  await requireAuth();
  const db = getDb();

  const allAgendas = await db
    .select()
    .from(agendas)
    .where(eq(agendas.status, 'published'))
    .orderBy(desc(agendas.deadline))
    .limit(20);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-extrabold text-2xl text-text-primary tracking-tight">
            Kalender Akademik
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Agenda perkuliahan resmi dan batas pengumpulan tugas semester ini.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/app/agendas/new">
            <Button variant="primary" size="sm">
              <Plus className="w-3.5 h-3.5 mr-1" />
              <span>Ajukan Agenda</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Calendar List View */}
      <Card className="p-0 overflow-hidden">
        <div className="p-4 border-b border-border bg-surface-soft flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-text-primary">
            <CalendarIcon className="w-4 h-4 text-teal-deep" />
            <span>Daftar Agenda Terpublikasi</span>
          </div>
          <Badge variant="primary" size="sm">{allAgendas.length} Agenda Aktif</Badge>
        </div>

        {allAgendas.length === 0 ? (
          <div className="p-12 text-center text-xs text-text-muted">
            Belum ada agenda akademik yang dipublikasikan.
          </div>
        ) : (
          <div className="divide-y divide-border">
            {allAgendas.map((item) => (
              <div key={item.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-surface-soft/50 transition-colors">
                <div className="flex flex-col gap-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Badge variant="primary" size="sm">{item.category}</Badge>
                    <span className="text-[11px] text-text-muted capitalize">• {item.scope}</span>
                  </div>
                  <h3 className="font-heading font-bold text-sm text-text-primary">
                    {item.title}
                  </h3>
                  {item.description && (
                    <p className="text-xs text-text-muted line-clamp-1">{item.description}</p>
                  )}
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 shrink-0">
                  <div className="text-right">
                    <span className="text-[11px] font-semibold text-text-muted block">Batas Waktu:</span>
                    <span className="text-xs font-bold text-[#9E5507]">
                      {item.deadline ? formatWIBShort(item.deadline) : 'Tidak ada deadline'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
