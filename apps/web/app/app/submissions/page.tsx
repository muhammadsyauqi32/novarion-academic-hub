import React from 'react';
import { requireAuth } from '@/lib/auth/guards';
import { getDb, agendas } from '@novarion/db';
import { eq, desc } from 'drizzle-orm';
import { Card } from '@/components/Card';
import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { Plus, Send, Clock, CheckCircle2, XCircle } from 'lucide-react';
import Link from 'next/link';
import { formatWIBShort } from '@novarion/shared';

export default async function SubmissionsPage() {
  const user = await requireAuth();
  const db = getDb();

  const mySubmissions = await db
    .select()
    .from(agendas)
    .where(eq(agendas.createdBy, user.id))
    .orderBy(desc(agendas.createdAt));

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
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-extrabold text-2xl text-text-primary tracking-tight">
            Pengajuan Saya
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Riwayat agenda bersama yang pernah kamu ajukan untuk kalender angkatan.
          </p>
        </div>

        <Link href="/app/agendas/new">
          <Button variant="primary" size="sm">
            <Plus className="w-3.5 h-3.5 mr-1" />
            <span>Ajukan Agenda Baru</span>
          </Button>
        </Link>
      </div>

      <Card className="p-0 overflow-hidden flex flex-col">
        <div className="p-4 bg-surface-soft border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Send className="w-4 h-4 text-teal-deep" />
            <span className="text-xs font-bold text-text-primary">Daftar Pengajuan</span>
          </div>
          <Badge variant="primary" size="sm">{mySubmissions.length} Pengajuan</Badge>
        </div>

        {mySubmissions.length === 0 ? (
          <div className="p-12 text-center text-xs text-text-muted">
            Kamu belum pernah mengajukan agenda.
          </div>
        ) : (
          <div className="divide-y divide-border">
            {mySubmissions.map((item) => (
              <div key={item.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-surface-soft/40 transition-colors">
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

                <div className="flex items-center gap-3">
                  {getStatusBadge(item.status)}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
