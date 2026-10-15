import React from 'react';
import { requireAdmin } from '@/lib/auth/guards';
import { getDb, reminderJobs, reminderDeliveryAttempts, agendas, messagingChannels } from '@novarion/db';
import { desc } from 'drizzle-orm';
import { Card } from '@/components/Card';
import { Badge } from '@/components/Badge';
import { formatWIB } from '@novarion/shared';
import { Clock, CheckCircle, AlertOctagon, HelpCircle, XCircle } from 'lucide-react';

export default async function AdminRemindersPage() {
  await requireAdmin();
  const db = getDb();

  const allJobs = await db
    .select()
    .from(reminderJobs)
    .orderBy(desc(reminderJobs.scheduledFor))
    .limit(20);

  const attempts = await db
    .select()
    .from(reminderDeliveryAttempts)
    .orderBy(desc(reminderDeliveryAttempts.attemptedAt))
    .limit(20);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'submitted':
        return <Badge variant="success" size="sm">Submitted</Badge>;
      case 'processing':
        return <Badge variant="mint" size="sm">Processing</Badge>;
      case 'failed':
        return <Badge variant="danger" size="sm">Failed</Badge>;
      case 'unknown':
        return <Badge variant="warning" size="sm">Unknown</Badge>;
      case 'cancelled':
        return <Badge variant="neutral" size="sm">Cancelled</Badge>;
      default:
        return <Badge variant="primary" size="sm">Queued</Badge>;
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading font-extrabold text-2xl text-text-primary tracking-tight">
          Antrean & Riwayat Reminder
        </h1>
        <p className="text-xs text-text-muted mt-1">
          Monitoring 4 pemicu wajib (H-7, H-3, H-1, T-3 Jam) dan log pengiriman ke grup WhatsApp.
        </p>
      </div>

      {/* Tabel Reminder Jobs */}
      <Card className="p-0 overflow-hidden flex flex-col">
        <div className="p-4 bg-surface-soft border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-teal-deep" />
            <span className="font-heading font-bold text-xs text-text-primary">
              Antrean Pekerjaan Pengingat (Reminder Jobs)
            </span>
          </div>
          <span className="text-xs text-text-muted">{allJobs.length} Record</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-text-primary">
            <thead className="bg-surface-soft/60 border-b border-border text-text-muted uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-2.5 px-4">Pemicu</th>
                <th className="py-2.5 px-4">Jadwal Eksekusi (WIB)</th>
                <th className="py-2.5 px-4">Status</th>
                <th className="py-2.5 px-4">Percobaan</th>
                <th className="py-2.5 px-4">Keterangan / Error</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {allJobs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-text-muted">
                    Belum ada reminder job yang dijadwalkan.
                  </td>
                </tr>
              ) : (
                allJobs.map((j) => (
                  <tr key={j.id} className="hover:bg-surface-soft/40 transition-colors">
                    <td className="py-3 px-4 font-bold uppercase">{j.triggerType}</td>
                    <td className="py-3 px-4">{formatWIB(j.scheduledFor)}</td>
                    <td className="py-3 px-4">{getStatusBadge(j.status)}</td>
                    <td className="py-3 px-4">{j.attemptCount}x</td>
                    <td className="py-3 px-4 text-text-muted">{j.lastError || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Tabel Delivery Attempts */}
      <Card className="p-0 overflow-hidden flex flex-col">
        <div className="p-4 bg-surface-soft border-b border-border flex items-center justify-between">
          <span className="font-heading font-bold text-xs text-text-primary">
            Log Percobaan Pengiriman Terakhir
          </span>
          <span className="text-xs text-text-muted">{attempts.length} Percobaan</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-text-primary">
            <thead className="bg-surface-soft/60 border-b border-border text-text-muted uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-2.5 px-4">Waktu Percobaan</th>
                <th className="py-2.5 px-4">Provider</th>
                <th className="py-2.5 px-4">Provider Message ID</th>
                <th className="py-2.5 px-4">Status</th>
                <th className="py-2.5 px-4">Pesan Error</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {attempts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-text-muted">
                    Belum ada riwayat pengiriman tercatat.
                  </td>
                </tr>
              ) : (
                attempts.map((a) => (
                  <tr key={a.id} className="hover:bg-surface-soft/40 transition-colors">
                    <td className="py-3 px-4">{formatWIB(a.attemptedAt)}</td>
                    <td className="py-3 px-4 capitalize font-semibold">{a.provider}</td>
                    <td className="py-3 px-4 font-mono text-[11px] text-text-muted">
                      {a.providerMessageId || '-'}
                    </td>
                    <td className="py-3 px-4">{getStatusBadge(a.status)}</td>
                    <td className="py-3 px-4 text-text-muted">{a.errorMessage || '-'}</td>
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
