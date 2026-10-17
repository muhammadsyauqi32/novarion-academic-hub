import React from 'react';
import Link from 'next/link';
import { requireAdmin } from '@/lib/auth/guards';
import { getDb, studentWhitelist, courses, agendas, whatsappConnections, reminderJobs } from '@novarion/db';
import { eq, sql } from 'drizzle-orm';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';
import { 
  Users, 
  GraduationCap, 
  MessageSquare, 
  Clock, 
  Upload, 
  AlertTriangle,
  ArrowRight
} from 'lucide-react';
import { formatWIBShort } from '@novarion/shared';

export default async function AdminDashboardPage() {
  await requireAdmin();
  const db = getDb();

  // Eksekusi seluruh metrik operasional secara paralel tanpa waterfall
  const [
    whitelistRows,
    courseRows,
    pendingAgendas,
    waConns,
    queuedJobs,
    failedJobs,
  ] = await Promise.all([
    db.select({ id: studentWhitelist.id, isActive: studentWhitelist.isActive }).from(studentWhitelist),
    db.select({ id: courses.id }).from(courses),
    db
      .select({
        id: agendas.id,
        title: agendas.title,
        category: agendas.category,
        scope: agendas.scope,
      })
      .from(agendas)
      .where(eq(agendas.status, 'pending')),
    db.select().from(whatsappConnections).limit(1),
    db.select({ id: reminderJobs.id }).from(reminderJobs).where(eq(reminderJobs.status, 'queued')),
    db.select({ id: reminderJobs.id }).from(reminderJobs).where(eq(reminderJobs.status, 'failed')),
  ]);

  const totalStudents = whitelistRows.length;
  const activeStudents = whitelistRows.filter((s) => s.isActive).length;
  const totalCourses = courseRows.length;
  const waConn = waConns[0] || null;


  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-extrabold text-2xl text-text-primary tracking-tight">
            Ringkasan Operasional Angkatan
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Status sistem, data mahasiswa terverifikasi, dan monitoring gateway pengingat.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/admin/imports">
            <Button variant="primary" size="sm">
              <Upload className="w-3.5 h-3.5 mr-1" />
              <span>Impor Roster CSV</span>
            </Button>
          </Link>
          <Link href="/admin/whatsapp">
            <Button variant="dark" size="sm">
              <MessageSquare className="w-3.5 h-3.5 mr-1" />
              <span>Kontrol WhatsApp</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Grid Status Faktual */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-text-muted">Mahasiswa Terdaftar</p>
            <p className="text-2xl font-heading font-black text-text-primary mt-1">
              {totalStudents}
            </p>
            <span className="text-[11px] text-teal-deep font-medium">
              {activeStudents} akun aktif
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-brand-primary/20 text-teal-deep flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </Card>

        <Card className="p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-text-muted">Mata Kuliah</p>
            <p className="text-2xl font-heading font-black text-text-primary mt-1">
              {totalCourses}
            </p>
            <span className="text-[11px] text-text-muted">Semester Berjalan</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-brand-cream text-text-primary flex items-center justify-center">
            <GraduationCap className="w-5 h-5" />
          </div>
        </Card>

        <Card className="p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-text-muted">Status Baileys WA</p>
            <div className="mt-1">
              <Badge
                variant={
                  waConn?.status === 'connected'
                    ? 'success'
                    : waConn?.status === 'connecting'
                    ? 'warning'
                    : 'danger'
                }
                size="sm"
              >
                {waConn?.status?.toUpperCase() || 'OFFLINE'}
              </Badge>
            </div>
            <span className="text-[11px] text-text-muted block mt-1">
              {waConn?.lastConnectedAt
                ? `Terakhir: ${formatWIBShort(waConn.lastConnectedAt)}`
                : 'Belum pernah terhubung'}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-surface-soft text-text-muted flex items-center justify-center">
            <MessageSquare className="w-5 h-5" />
          </div>
        </Card>

        <Card className="p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-text-muted">Antrean Reminder</p>
            <p className="text-2xl font-heading font-black text-text-primary mt-1">
              {queuedJobs.length}
            </p>
            {failedJobs.length > 0 ? (
              <span className="text-[11px] text-danger-text font-bold">
                {failedJobs.length} gagal terkirim
              </span>
            ) : (
              <span className="text-[11px] text-teal-deep font-medium">0 kegagalan</span>
            )}
          </div>
          <div className="w-10 h-10 rounded-xl bg-surface-soft text-text-muted flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </Card>
      </div>

      {/* Actionable Cards: Pengajuan Pending & Masalah Gateway */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="font-heading font-bold text-sm text-text-primary">
              Pengajuan Agenda Perlu Ditinjau ({pendingAgendas.length})
            </h2>
            <Link href="/admin/submissions" className="text-xs font-semibold text-teal-deep hover:underline">
              Buka Panel Review →
            </Link>
          </div>

          {pendingAgendas.length === 0 ? (
            <p className="text-xs text-text-muted py-6 text-center">
              Tidak ada pengajuan agenda baru yang menunggu persetujuan.
            </p>
          ) : (
            <div className="divide-y divide-border">
              {pendingAgendas.slice(0, 3).map((item) => (
                <div key={item.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="truncate">
                    <span className="font-bold text-text-primary block truncate">{item.title}</span>
                    <span className="text-text-muted capitalize">{item.category} • {item.scope}</span>
                  </div>
                  <Badge variant="warning" size="sm">Pending</Badge>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="font-heading font-bold text-sm text-text-primary">
              Status Gateway WhatsApp
            </h2>
            <Link href="/admin/whatsapp" className="text-xs font-semibold text-teal-deep hover:underline">
              Kelola Gateway →
            </Link>
          </div>

          {waConn?.status !== 'connected' ? (
            <div className="p-4 rounded-xl bg-warning-surface border border-warning-border flex items-start gap-3 text-xs text-warning-text">
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Baileys Service Tidak Terhubung</p>
                <p className="mt-0.5 text-text-muted">
                  Worker WhatsApp saat ini offline atau memerlukan scan QR awal di menu WhatsApp Gateway.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-success-surface border border-success-border flex items-start gap-3 text-xs text-success-text">
              <div className="w-2 h-2 rounded-full bg-success-text mt-1.5" />
              <div>
                <p className="font-bold">Gateway Aktif dan Siap Mengirim</p>
                <p className="mt-0.5 text-text-muted">
                  Nomor pengirim: {waConn.phoneNumber || 'Akun Novarion'}
                </p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
