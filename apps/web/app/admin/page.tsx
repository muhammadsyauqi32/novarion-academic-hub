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
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  CalendarCheck,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { formatWIBShort } from '@novarion/shared';

export default async function AdminDashboardPage() {
  await requireAdmin();
  const db = getDb();

  // Eksekusi seluruh metrik operasional secara agregat (COUNT) tanpa full table scans
  const [
    totalStudentsRes,
    activeStudentsRes,
    totalCoursesRes,
    pendingAgendas,
    waConns,
    queuedJobsRes,
    failedJobsRes,
  ] = await Promise.all([
    db.select({ count: sql<number>`count(*)::int` }).from(studentWhitelist),
    db.select({ count: sql<number>`count(*)::int` }).from(studentWhitelist).where(eq(studentWhitelist.isActive, true)),
    db.select({ count: sql<number>`count(*)::int` }).from(courses),
    db
      .select({
        id: agendas.id,
        title: agendas.title,
        category: agendas.category,
        scope: agendas.scope,
      })
      .from(agendas)
      .where(eq(agendas.status, 'pending'))
      .limit(6),
    db.select().from(whatsappConnections).limit(1),
    db.select({ count: sql<number>`count(*)::int` }).from(reminderJobs).where(eq(reminderJobs.status, 'queued')),
    db.select({ count: sql<number>`count(*)::int` }).from(reminderJobs).where(eq(reminderJobs.status, 'failed')),
  ]);

  const totalStudents = totalStudentsRes[0]?.count ?? 0;
  const activeStudents = activeStudentsRes[0]?.count ?? 0;
  const totalCourses = totalCoursesRes[0]?.count ?? 0;
  const queuedJobsCount = queuedJobsRes[0]?.count ?? 0;
  const failedJobsCount = failedJobsRes[0]?.count ?? 0;
  const waConn = waConns[0] || null;

  return (
    <div className="flex flex-col gap-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-extrabold text-2xl text-text-primary tracking-tight">
            Ringkasan Operasional Angkatan
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Status sistem, data mahasiswa terverifikasi, dan monitoring gateway pengingat.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link href="/admin/students">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs">
              <Users className="w-3.5 h-3.5" />
              <span>Data Mahasiswa</span>
            </Button>
          </Link>
          <Link href="/admin/agendas">
            <Button variant="primary" size="sm" className="gap-1.5 text-xs">
              <CalendarCheck className="w-3.5 h-3.5" />
              <span>Kelola Agenda</span>
            </Button>
          </Link>
          <Link href="/admin/whatsapp">
            <Button variant="dark" size="sm" className="gap-1.5 text-xs">
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Kontrol WhatsApp</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Actionable Administrative Alerts */}
      <div className="flex flex-col gap-3">
        {pendingAgendas.length > 0 && (
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5 text-amber-800 dark:text-amber-300">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>
                <strong>{pendingAgendas.length} Pengajuan Agenda</strong> menunggu peninjauan dan persetujuan dari administrator.
              </span>
            </div>
            <Link href="/admin/submissions" className="shrink-0">
              <Button variant="outline" size="sm" className="gap-1 text-xs">
                <span>Tinjau Sekarang</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
        )}

        {failedJobsCount > 0 && (
          <div className="p-4 rounded-xl bg-danger-surface border border-danger-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-danger-text">
            <div className="flex items-center gap-2.5">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>
                <strong>{failedJobsCount} Pengingat WhatsApp</strong> gagal terkirim. Periksa koneksi bot atau status nomor tujuan.
              </span>
            </div>
            <Link href="/admin/whatsapp?tab=reminders" className="shrink-0">
              <Button variant="danger" size="sm" className="gap-1 text-xs">
                <span>Lihat Log Reminder</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Grid Status Faktual (Agregat Ringan) */}
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
            <span className="text-[11px] text-text-muted">Katalog Aktif</span>
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
              {queuedJobsCount}
            </p>
            {failedJobsCount > 0 ? (
              <span className="text-[11px] text-danger-text font-bold">
                {failedJobsCount} gagal terkirim
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

      {/* Daftar Pengajuan Agenda Pending */}
      <Card className="p-0 overflow-hidden flex flex-col">
        <div className="p-4 bg-surface-soft border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarCheck className="w-4 h-4 text-teal-deep" />
            <span className="font-heading font-bold text-xs text-text-primary">
              Pengajuan Agenda Mahasiswa yang Membutuhkan Verifikasi
            </span>
          </div>
          <Badge variant="primary" size="sm">{pendingAgendas.length} Antrean</Badge>
        </div>

        {pendingAgendas.length === 0 ? (
          <div className="p-10 text-center text-xs text-text-muted flex flex-col items-center gap-2">
            <CheckCircle2 className="w-8 h-8 text-teal-deep/50" />
            <span>Tidak ada pengajuan agenda yang menunggu review saat ini.</span>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {pendingAgendas.map((item) => (
              <div key={item.id} className="p-4 flex items-center justify-between gap-4 hover:bg-surface-soft/40 transition-colors">
                <div className="flex flex-col gap-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Badge variant="primary" size="sm">{item.category}</Badge>
                    <span className="text-[11px] text-text-muted capitalize">• Cakupan {item.scope}</span>
                  </div>
                  <h3 className="font-heading font-bold text-sm text-text-primary truncate">
                    {item.title}
                  </h3>
                </div>
                <Link href="/admin/submissions">
                  <Button variant="outline" size="sm">
                    Tinjau
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
