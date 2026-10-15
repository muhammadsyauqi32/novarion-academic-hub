import React from 'react';
import { requireAdmin } from '@/lib/auth/guards';
import { getDb, messagingChannels, channelRoutes } from '@novarion/db';
import { desc } from 'drizzle-orm';
import { Card } from '@/components/Card';
import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { Network, Plus, CheckCircle2 } from 'lucide-react';

export default async function WhatsAppGroupsMappingPage() {
  await requireAdmin();
  const db = getDb();

  const channels = await db
    .select()
    .from(messagingChannels)
    .orderBy(desc(messagingChannels.createdAt));

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-extrabold text-2xl text-text-primary tracking-tight">
            Pemetaan Grup WhatsApp (Group Mapping)
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Petakan JID grup WhatsApp yang dapat diakses ke cakupan angkatan atau kelas tertentu.
          </p>
        </div>
      </div>

      <Card className="p-0 overflow-hidden flex flex-col">
        <div className="p-4 bg-surface-soft border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Network className="w-4 h-4 text-teal-deep" />
            <span className="font-heading font-bold text-xs text-text-primary">
              Grup yang Terdaftar ({channels.length})
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-text-primary">
            <thead className="bg-surface-soft/60 border-b border-border text-text-muted uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-2.5 px-4">Nama Grup</th>
                <th className="py-2.5 px-4">JID WhatsApp</th>
                <th className="py-2.5 px-4">Status Verifikasi</th>
                <th className="py-2.5 px-4">Status Pengiriman</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {channels.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-text-muted">
                    Belum ada grup yang dipetakan. Pastikan akun WhatsApp bot telah bergabung ke grup resmi angkatan.
                  </td>
                </tr>
              ) : (
                channels.map((ch) => (
                  <tr key={ch.id} className="hover:bg-surface-soft/40 transition-colors">
                    <td className="py-3 px-4 font-bold">{ch.name}</td>
                    <td className="py-3 px-4 font-mono text-[11px] text-text-muted">{ch.jid}</td>
                    <td className="py-3 px-4">
                      <Badge variant={ch.verifiedByAdmin ? 'success' : 'warning'} size="sm">
                        {ch.verifiedByAdmin ? 'Terverifikasi' : 'Belum Diverifikasi'}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={ch.isActive ? 'primary' : 'neutral'} size="sm">
                        {ch.isActive ? 'Aktif' : 'Nonaktif'}
                      </Badge>
                    </td>
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
