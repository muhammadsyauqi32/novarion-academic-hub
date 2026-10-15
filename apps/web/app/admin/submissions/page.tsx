import React from 'react';
import { requireAdmin } from '@/lib/auth/guards';
import { getDb, agendas, profiles } from '@novarion/db';
import { eq, desc } from 'drizzle-orm';
import { Card } from '@/components/Card';
import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { CheckCircle2, XCircle, Clock, Calendar } from 'lucide-react';
import { approveAgendaAction, rejectAgendaAction } from '@/actions/moderation';
import { formatWIB } from '@novarion/shared';

export default async function AdminSubmissionsPage() {
  await requireAdmin();
  const db = getDb();

  const pendingList = await db
    .select({
      id: agendas.id,
      title: agendas.title,
      description: agendas.description,
      category: agendas.category,
      scope: agendas.scope,
      deadline: agendas.deadline,
      createdAt: agendas.createdAt,
      creatorName: profiles.fullName,
      creatorNim: profiles.nim,
    })
    .from(agendas)
    .leftJoin(profiles, eq(agendas.createdBy, profiles.id))
    .where(eq(agendas.status, 'pending'))
    .orderBy(desc(agendas.createdAt));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-extrabold text-2xl text-text-primary tracking-tight">
            Review Pengajuan Agenda Mahasiswa
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Verifikasi kelayakan dan jadwal sebelum diterbitkan ke kalender resmi dan pengingat WhatsApp.
          </p>
        </div>

        <Badge variant={pendingList.length > 0 ? 'warning' : 'success'} size="md">
          {pendingList.length} Menunggu Review
        </Badge>
      </div>

      {pendingList.length === 0 ? (
        <Card className="p-12 text-center text-xs text-text-muted">
          <CheckCircle2 className="w-10 h-10 text-teal-deep/50 mx-auto mb-3" />
          <p className="font-semibold text-text-primary text-sm">Semua Pengajuan Selesai Ditinjau</p>
          <p className="mt-1">Tidak ada pengajuan agenda mahasiswa yang tertunda saat ini.</p>
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          {pendingList.map((item) => (
            <Card key={item.id} className="p-6 flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-border">
                <div className="flex items-center gap-2">
                  <Badge variant="primary" size="sm">{item.category}</Badge>
                  <span className="text-xs text-text-muted capitalize">• Cakupan: {item.scope}</span>
                </div>
                <span className="text-xs text-text-muted">
                  Diajukan oleh: <strong className="text-text-primary">{item.creatorName || 'Mahasiswa'}</strong> ({item.creatorNim || '-'})
                </span>
              </div>

              <div>
                <h3 className="font-heading font-bold text-base text-text-primary">
                  {item.title}
                </h3>
                {item.description && (
                  <p className="text-xs text-text-muted mt-1.5 leading-relaxed">
                    {item.description}
                  </p>
                )}
                <p className="text-xs font-semibold text-[#9E5507] mt-2">
                  Batas Waktu: {item.deadline ? formatWIB(item.deadline) : 'Tidak ada deadline'}
                </p>
              </div>

              {/* Action Buttons: Setujui & Form Tolak */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-3 border-t border-border">
                <form
                  action={async (formData) => {
                    'use server';
                    await rejectAgendaAction(formData);
                  }}
                  className="flex items-center gap-2"
                >
                  <input type="hidden" name="agenda_id" value={item.id} />
                  <input
                    name="notes"
                    placeholder="Alasan penolakan..."
                    required
                    className="px-3 py-1.5 text-xs bg-surface-soft border border-border rounded-lg text-text-primary focus:outline-none"
                  />
                  <Button variant="danger" size="sm" type="submit">
                    <XCircle className="w-3.5 h-3.5 mr-1" />
                    <span>Tolak</span>
                  </Button>
                </form>

                <form
                  action={async () => {
                    'use server';
                    await approveAgendaAction(item.id);
                  }}
                >
                  <Button variant="primary" size="sm" type="submit">
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                    <span>Setujui & Publikasikan</span>
                  </Button>
                </form>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
