import React from 'react';
import { requireAdmin } from '@/lib/auth/guards';
import { getDb, auditLogs, profiles } from '@novarion/db';
import { desc, eq } from 'drizzle-orm';
import { Card } from '@/components/Card';
import { Badge } from '@/components/Badge';
import { formatWIB } from '@novarion/shared';
import { History } from 'lucide-react';

export default async function AdminAuditPage() {
  await requireAdmin();
  const db = getDb();

  const logs = await db
    .select({
      id: auditLogs.id,
      action: auditLogs.action,
      entityType: auditLogs.entityType,
      newValues: auditLogs.newValues,
      createdAt: auditLogs.createdAt,
      actorName: profiles.fullName,
    })
    .from(auditLogs)
    .leftJoin(profiles, eq(auditLogs.actorId, profiles.id))
    .orderBy(desc(auditLogs.createdAt))
    .limit(30);

  return (
    <div className="flex flex-col gap-6 max-w-5xl">
      <div>
        <h1 className="font-heading font-extrabold text-2xl text-text-primary tracking-tight">
          Audit Trail Keamanan & Aktivitas
        </h1>
        <p className="text-xs text-text-muted mt-1">
          Riwayat seluruh tindakan administratif krusial yang dilakukan oleh pengurus.
        </p>
      </div>

      <Card className="p-0 overflow-hidden flex flex-col">
        <div className="p-4 bg-surface-soft border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-teal-deep" />
            <span className="font-heading font-bold text-xs text-text-primary">
              Log Perubahan Sistem
            </span>
          </div>
          <span className="text-xs text-text-muted">{logs.length} Aktivitas Terakhir</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-text-primary">
            <thead className="bg-surface-soft/60 border-b border-border text-text-muted uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-2.5 px-4">Waktu (WIB)</th>
                <th className="py-2.5 px-4">Pelaku (Actor)</th>
                <th className="py-2.5 px-4">Aksi</th>
                <th className="py-2.5 px-4">Entitas</th>
                <th className="py-2.5 px-4">Detail Perubahan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-text-muted">
                    Belum ada audit log tercatat.
                  </td>
                </tr>
              ) : (
                logs.map((l) => (
                  <tr key={l.id} className="hover:bg-surface-soft/40 transition-colors">
                    <td className="py-3 px-4">{formatWIB(l.createdAt)}</td>
                    <td className="py-3 px-4 font-semibold">{l.actorName || 'Sistem / Seed'}</td>
                    <td className="py-3 px-4 font-mono text-[11px]">
                      <Badge variant="primary" size="sm">{l.action}</Badge>
                    </td>
                    <td className="py-3 px-4 capitalize text-text-muted">{l.entityType}</td>
                    <td className="py-3 px-4 font-mono text-[11px] text-text-muted max-w-xs truncate">
                      {l.newValues ? JSON.stringify(l.newValues) : '-'}
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
