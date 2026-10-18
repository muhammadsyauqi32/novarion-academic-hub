import React from 'react';
import { requireAuth } from '@/lib/auth/guards';
import { getDb, agendas } from '@novarion/db';
import { eq, desc } from 'drizzle-orm';
import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { Plus, Send, Clock, Calendar } from 'lucide-react';
import Link from 'next/link';
import { formatWIBShort, formatWIB } from '@novarion/shared';

export default async function SubmissionsPage() {
  const user = await requireAuth();
  const db = getDb();

  const mySubmissions = await db
    .select()
    .from(agendas)
    .where(eq(agendas.createdBy, user.id))
    .orderBy(desc(agendas.createdAt))
    .limit(50);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <Badge variant="success" size="sm">Disetujui</Badge>;
      case 'rejected':
        return <Badge variant="danger" size="sm">Ditolak</Badge>;
      default:
        return <Badge variant="warning" size="sm">Menunggu Review</Badge>;
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-bold text-2xl text-text-primary tracking-tight">
            Pengajuan Saya
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Riwayat usulan agenda dan jadwal yang pernah Anda ajukan untuk kalender akademik bersama.
          </p>
        </div>

        <Link href="/app/agendas/new">
          <Button variant="primary" size="sm" className="gap-1.5 text-xs">
            <Plus className="w-3.5 h-3.5" />
            <span>Ajukan Agenda Baru</span>
          </Button>
        </Link>
      </div>

      <div className="rounded-card bg-surface border border-border overflow-hidden shadow-xs">
        <div className="px-4 py-3 bg-surface-soft/80 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Send className="w-4 h-4 text-teal-deep" />
            <span className="text-xs font-bold text-text-primary">Daftar Pengajuan</span>
          </div>
          <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-surface border border-border text-text-muted">
            {mySubmissions.length} Pengajuan
          </span>
        </div>

        {mySubmissions.length === 0 ? (
          <div className="p-12 text-center text-xs text-text-muted flex flex-col items-center gap-2">
            <Send className="w-8 h-8 text-text-muted/40" />
            <p className="font-bold text-text-primary">Belum Ada Pengajuan</p>
            <p className="max-w-sm">
              Anda belum pernah mengajukan agenda. Gunakan tombol di atas untuk mengusulkan agenda atau deadline kuliah.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {mySubmissions.map((item) => (
              <div
                key={item.id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-surface-soft/40 transition-colors"
              >
                <div className="flex flex-col gap-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="primary" size="sm">{item.category}</Badge>
                    <span className="text-[11px] font-mono text-text-muted capitalize">
                      Cakupan: {item.scope}
                    </span>
                    {getStatusBadge(item.status)}
                  </div>

                  <h3 className="font-heading font-bold text-sm sm:text-base text-text-primary">
                    {item.title}
                  </h3>

                  {item.description && (
                    <p className="text-xs text-text-muted line-clamp-1">{item.description}</p>
                  )}

                  <div className="flex flex-wrap items-center gap-3 text-xs text-text-muted mt-0.5">
                    {item.deadline && (
                      <span className="flex items-center gap-1 font-mono text-[#9E5507]">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Batas: {formatWIBShort(new Date(item.deadline))}</span>
                      </span>
                    )}
                    <span className="text-[11px] font-mono text-text-muted">
                      Diajukan: {formatWIBShort(new Date(item.createdAt))}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-border">
                  <Link href={`/app/agendas/${item.id}`}>
                    <Button variant="outline" size="sm" className="text-xs">
                      Detail
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
