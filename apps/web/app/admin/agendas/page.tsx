import React from 'react';
import { requireAdmin } from '@/lib/auth/guards';
import { getDb, agendas } from '@novarion/db';
import { desc } from 'drizzle-orm';
import { Card } from '@/components/Card';
import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { CalendarCheck, Plus, Trash2 } from 'lucide-react';
import { formatWIBShort } from '@novarion/shared';
import Link from 'next/link';

export default async function AdminAgendasPage() {
  await requireAdmin();
  const db = getDb();

  const allAgendas = await db
    .select()
    .from(agendas)
    .orderBy(desc(agendas.createdAt));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-extrabold text-2xl text-text-primary tracking-tight">
            Manajemen Agenda Akademik
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Seluruh agenda perkuliahan angkatan, revisi, dan pembatalan resmi.
          </p>
        </div>

        <Link href="/app/agendas/new">
          <Button variant="primary" size="sm">
            <Plus className="w-3.5 h-3.5 mr-1" />
            <span>Buat Agenda Baru</span>
          </Button>
        </Link>
      </div>

      <Card className="p-0 overflow-hidden flex flex-col">
        <div className="p-4 bg-surface-soft border-b border-border flex items-center justify-between">
          <span className="font-heading font-bold text-xs text-text-primary">
            Daftar Seluruh Agenda ({allAgendas.length})
          </span>
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
                <th className="py-2.5 px-4">Versi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {allAgendas.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-text-muted">
                    Belum ada agenda yang tersimpan.
                  </td>
                </tr>
              ) : (
                allAgendas.map((a) => (
                  <tr key={a.id} className="hover:bg-surface-soft/40 transition-colors">
                    <td className="py-3 px-4 font-bold">{a.title}</td>
                    <td className="py-3 px-4 capitalize">{a.category}</td>
                    <td className="py-3 px-4 capitalize">{a.scope}</td>
                    <td className="py-3 px-4">
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
                    <td className="py-3 px-4 text-text-muted font-mono">v{a.version}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
