import React from 'react';
import { requireAdmin } from '@/lib/auth/guards';
import { getDb, whatsappConnections, messagingChannels } from '@novarion/db';
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
  Send
} from 'lucide-react';
import { toggleKillSwitchAction } from '@/actions/whatsapp';

export default async function WhatsAppGatewayPage() {
  await requireAdmin();
  const db = getDb();

  const connRows = await db.select().from(whatsappConnections).limit(1);
  const conn = connRows[0] || null;

  const isConnected = conn?.status === 'connected';
  const isPaused = conn?.isPaused ?? false;

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-extrabold text-2xl text-text-primary tracking-tight">
            WhatsApp Gateway & Pairing
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Status bot pengirim resmi Novarion dan kontrol pengiriman pengingat grup.
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
            className="font-bold"
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
              <p className="text-text-muted mt-0.5">Seluruh reminder WhatsApp dihentikan sementara hingga admin menekan Resume.</p>
            </div>
          </div>
        </Card>
      )}

      {/* Status Koneksi Card */}
      <Card className="p-6 flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
              isConnected ? 'bg-success-surface text-success-text' : 'bg-surface-soft text-text-muted'
            }`}>
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-heading font-bold text-base text-text-primary">
                Koneksi Akun WhatsApp
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
                <span className="text-xs text-text-muted">
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
              {/* Temp QR Code placeholder representation */}
              <div className="w-48 h-48 bg-slate-900 rounded-xl flex items-center justify-center text-white text-xs p-3 text-center font-mono break-all">
                {conn.tempQrCode.substring(0, 80)}...
              </div>
            </div>

            <span className="text-[11px] text-warning-text font-medium">
              QR Code memiliki masa berlaku pendek (TTL 60 detik) dan akan diperbarui otomatis.
            </span>
          </div>
        )}

        {/* State 3: Disconnected / Requires Repair */}
        {!isConnected && !conn?.tempQrCode && (
          <div className="p-6 rounded-2xl bg-surface-soft border border-border flex items-start gap-4 text-xs">
            <AlertTriangle className="w-5 h-5 text-warning-text shrink-0 mt-0.5" />
            <div className="space-y-1.5">
              <p className="font-bold text-text-primary">Worker Baileys Belum Menghasilkan Sesi Aktif</p>
              <p className="text-text-muted">
                Pastikan container atau service worker di homelab sedang berjalan (`npm run dev:worker` atau `docker compose up -d`). Saat worker aktif tanpa sesi tersimpan, QR code akan otomatis dimunculkan pada layar ini.
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
    </div>
  );
}
