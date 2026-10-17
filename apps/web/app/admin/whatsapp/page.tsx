import React from 'react';
import Link from 'next/link';
import { requireAdmin } from '@/lib/auth/guards';
import {
  getDb,
  whatsappConnections,
  messagingChannels,
  reminderJobs,
  reminderDeliveryAttempts,
} from '@novarion/db';
import { desc } from 'drizzle-orm';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';
import { formatWIB } from '@novarion/shared';
import {
  MessageSquare,
  QrCode,
  Power,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  RotateCw,
  Network,
  Clock,
  Send,
  HelpCircle,
  XCircle,
  Radio,
} from 'lucide-react';
import { toggleKillSwitchAction } from '@/actions/whatsapp';

export default async function WhatsAppConsolidatedAdminPage({
  searchParams,
}: {
  searchParams: { tab?: string };
}) {
  await requireAdmin();
  const db = getDb();

  const currentTab = searchParams.tab || 'gateway';

  // Fetch data in parallel
  const [connRows, channels, allJobs, attempts] = await Promise.all([
    db.select().from(whatsappConnections).limit(1),
    db.select().from(messagingChannels).orderBy(desc(messagingChannels.createdAt)),
    db.select().from(reminderJobs).orderBy(desc(reminderJobs.scheduledFor)).limit(25),
    db.select().from(reminderDeliveryAttempts).orderBy(desc(reminderDeliveryAttempts.attemptedAt)).limit(25),
  ]);

  const conn = connRows[0] || null;
  const isConnected = conn?.status === 'connected';
  const isPaused = conn?.isPaused ?? false;

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
    <div className="flex flex-col gap-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-extrabold text-2xl text-text-primary tracking-tight">
            WhatsApp & Reminder Gateway
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Pusat operasional bot WhatsApp Baileys, pemetaan grup angkatan, dan pengawasan reminder H-7 hingga H-3 jam.
          </p>
        </div>

        <form
          action={async () => {
            'use server';
            await toggleKillSwitchAction(isPaused);
          }}
        >
          <Button
            variant={isPaused ? 'primary' : 'danger'}
            size="sm"
            type="submit"
            className="font-bold text-xs"
          >
            {isPaused ? (
              <>
                <RotateCw className="w-3.5 h-3.5 mr-1.5" />
                <span>Resume Seluruh Pengiriman</span>
              </>
            ) : (
              <>
                <Power className="w-3.5 h-3.5 mr-1.5" />
                <span>Jeda Seluruh Pengiriman (Kill Switch)</span>
              </>
            )}
          </Button>
        </form>
      </div>

      {/* Emergency Kill Switch Banner if Active */}
      {isPaused && (
        <Card className="p-4 bg-danger-surface border-danger-border flex items-center justify-between gap-3 text-xs text-danger-text">
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="w-5 h-5 shrink-0" />
            <div>
              <p className="font-bold">Kill Switch Pengiriman Sedang AKTIF</p>
              <p className="text-text-muted mt-0.5">
                Seluruh antrean reminder WhatsApp dihentikan sementara hingga admin menekan Resume.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Consolidated Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-border">
        <Link
          href="/admin/whatsapp?tab=gateway"
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
            currentTab === 'gateway'
              ? 'border-teal-deep text-teal-deep'
              : 'border-transparent text-text-muted hover:text-text-primary'
          }`}
        >
          <Radio className="w-4 h-4" />
          <span>Gateway & Pairing</span>
        </Link>
        <Link
          href="/admin/whatsapp?tab=groups"
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
            currentTab === 'groups'
              ? 'border-teal-deep text-teal-deep'
              : 'border-transparent text-text-muted hover:text-text-primary'
          }`}
        >
          <Network className="w-4 h-4" />
          <span>Pemetaan Grup ({channels.length})</span>
        </Link>
        <Link
          href="/admin/whatsapp?tab=reminders"
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
            currentTab === 'reminders'
              ? 'border-teal-deep text-teal-deep'
              : 'border-transparent text-text-muted hover:text-text-primary'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Antrean & Log Reminder</span>
        </Link>
      </div>

      {/* TAB 1: GATEWAY & PAIRING */}
      {currentTab === 'gateway' && (
        <Card className="p-6 flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
            <div className="flex items-center gap-4">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                  isConnected ? 'bg-success-surface text-success-text' : 'bg-surface-soft text-text-muted'
                }`}
              >
                <MessageSquare className="w-6 h-6" />
              </div>
              <div>
                <h2 className="font-heading font-bold text-base text-text-primary">
                  Status Akun Worker WhatsApp
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <Badge
                    variant={
                      isConnected ? 'success' : conn?.status === 'connecting' ? 'warning' : 'danger'
                    }
                    size="sm"
                  >
                    {conn?.status?.toUpperCase() || 'DISCONNECTED'}
                  </Badge>
                  <span className="text-xs text-text-muted font-mono">
                    Nomor: {conn?.phoneNumber || 'Belum Terhubung'}
                  </span>
                </div>
              </div>
            </div>

            <div className="text-left sm:text-right text-xs text-text-muted">
              <p>Terakhir Terhubung:</p>
              <p className="font-semibold text-text-primary">
                {conn?.lastConnectedAt ? formatWIB(conn.lastConnectedAt) : 'Belum pernah'}
              </p>
            </div>
          </div>

          {/* State 1: Connected */}
          {isConnected && (
            <div className="p-5 rounded-2xl bg-brand-mint-soft/30 border border-brand-primary/30 flex items-start gap-4">
              <CheckCircle2 className="w-5 h-5 text-teal-deep shrink-0 mt-0.5" />
              <div className="text-xs text-text-primary space-y-1">
                <p className="font-bold text-teal-deep text-sm">Akun Terhubung & Sesi Tersimpan di Database</p>
                <p className="text-text-muted">
                  Kredensial dan Signal keys tersimpan secara terenkripsi (AES-256-GCM). Saat worker direstart, koneksi akan dipulihkan secara otomatis tanpa meminta scan QR ulang.
                </p>
              </div>
            </div>
          )}

          {/* State 2: QR Code Available for Pairing */}
          {!isConnected && conn?.tempQrCode && (
            <div className="flex flex-col items-center justify-center p-8 bg-surface-soft rounded-2xl border border-border text-center gap-4">
              <QrCode className="w-8 h-8 text-teal-deep" />
              <div>
                <h3 className="font-heading font-bold text-base text-text-primary">
                  Pindai QR Code untuk Pairing Sekali
                </h3>
                <p className="text-xs text-text-muted mt-1 max-w-sm">
                  Buka WhatsApp di ponsel khusus Novarion, pilih Perangkat Tertaut, lalu pindai kode di bawah.
                </p>
              </div>

              <div className="p-4 bg-white rounded-2xl border-2 border-border shadow-md">
                <div className="w-48 h-48 bg-slate-900 rounded-xl flex items-center justify-center text-white text-xs p-3 text-center font-mono break-all">
                  {conn.tempQrCode.substring(0, 80)}...
                </div>
              </div>

              <span className="text-[11px] text-warning-text font-medium">
                QR Code memiliki masa berlaku pendek (TTL 60 detik) dan akan diperbarui otomatis oleh worker.
              </span>
            </div>
          )}

          {/* State 3: Disconnected / Waiting for Worker */}
          {!isConnected && !conn?.tempQrCode && (
            <div className="p-6 rounded-2xl bg-surface-soft border border-border flex items-start gap-4 text-xs">
              <AlertTriangle className="w-5 h-5 text-warning-text shrink-0 mt-0.5" />
              <div className="space-y-1.5">
                <p className="font-bold text-text-primary">Worker Baileys Belum Menghasilkan Sesi Aktif</p>
                <p className="text-text-muted">
                  Pastikan container atau service worker di server sedang berjalan (`npm run dev:worker`). Saat worker aktif tanpa sesi tersimpan, QR code akan otomatis dimunculkan pada layar ini.
                </p>
                {conn?.lastError && (
                  <p className="p-2 rounded bg-danger-surface text-danger-text font-mono text-[11px]">
                    Error Terakhir: {conn.lastError}
                  </p>
                )}
              </div>
            </div>
          )}
        </Card>
      )}

      {/* TAB 2: PEMETAAN GRUP (GROUP MAPPING) */}
      {currentTab === 'groups' && (
        <Card className="p-0 overflow-hidden flex flex-col">
          <div className="p-4 bg-surface-soft border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Network className="w-4 h-4 text-teal-deep" />
              <span className="font-heading font-bold text-xs text-text-primary">
                Grup WhatsApp yang Terdaftar ({channels.length})
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
                      <td className="py-3 px-4 font-semibold">{ch.name}</td>
                      <td className="py-3 px-4 font-mono text-text-muted text-[11px]">{ch.jid}</td>
                      <td className="py-3 px-4">
                        <Badge variant={ch.verifiedByAdmin ? 'success' : 'warning'} size="sm">
                          {ch.verifiedByAdmin ? 'Terverifikasi' : 'Pending'}
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
      )}

      {/* TAB 3: LOG & ANTREAN REMINDER */}
      {currentTab === 'reminders' && (
        <div className="flex flex-col gap-6">
          {/* Card Reminder Jobs */}
          <Card className="p-0 overflow-hidden flex flex-col">
            <div className="p-4 bg-surface-soft border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-teal-deep" />
                <span className="font-heading font-bold text-xs text-text-primary">
                  Antrean Pekerjaan Pengingat (Reminder Jobs) — Non-negotiable H-7, H-3, H-1, T-3h
                </span>
              </div>
              <Badge variant="primary" size="sm">{allJobs.length} Jobs Terbaru</Badge>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-text-primary">
                <thead className="bg-surface-soft/60 border-b border-border text-text-muted uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-2.5 px-4">Pemicu</th>
                    <th className="py-2.5 px-4">Target Waktu Kirim</th>
                    <th className="py-2.5 px-4">Status</th>
                    <th className="py-2.5 px-4">Percobaan</th>
                    <th className="py-2.5 px-4">Dibuat Pada</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {allJobs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-text-muted">
                        Belum ada pekerjaan pengingat dalam antrean.
                      </td>
                    </tr>
                  ) : (
                    allJobs.map((job) => (
                      <tr key={job.id} className="hover:bg-surface-soft/40 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-teal-deep">
                          {job.triggerType.toUpperCase()}
                        </td>
                        <td className="py-3 px-4 font-mono text-[11px]">
                          {formatWIB(job.scheduledFor)}
                        </td>
                        <td className="py-3 px-4">{getStatusBadge(job.status)}</td>
                        <td className="py-3 px-4 font-mono text-[11px]">{job.attemptCount}x</td>
                        <td className="py-3 px-4 text-text-muted text-[11px]">
                          {formatWIB(job.createdAt)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Card Delivery Attempts Log */}
          <Card className="p-0 overflow-hidden flex flex-col">
            <div className="p-4 bg-surface-soft border-b border-border flex items-center justify-between">
              <span className="font-heading font-bold text-xs text-text-primary">
                Riwayat Pengiriman Pesan (Delivery Attempts)
              </span>
              <Badge variant="neutral" size="sm">{attempts.length} Log</Badge>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-text-primary">
                <thead className="bg-surface-soft/60 border-b border-border text-text-muted uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-2.5 px-4">Waktu Percobaan</th>
                    <th className="py-2.5 px-4">Status Pengiriman</th>
                    <th className="py-2.5 px-4">Keterangan Error</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {attempts.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="py-8 text-center text-text-muted">
                        Belum ada catatan riwayat pengiriman pesan WhatsApp.
                      </td>
                    </tr>
                  ) : (
                    attempts.map((att) => (
                      <tr key={att.id} className="hover:bg-surface-soft/40 transition-colors">
                        <td className="py-3 px-4 font-mono text-[11px]">
                          {formatWIB(att.attemptedAt)}
                        </td>
                        <td className="py-3 px-4">{getStatusBadge(att.status)}</td>
                        <td className="py-3 px-4 text-text-muted text-[11px] font-mono">
                          {att.errorMessage || '-'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
