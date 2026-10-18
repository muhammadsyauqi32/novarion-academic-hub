import React from 'react';
import Link from 'next/link';
import { requireAdmin } from '@/lib/auth/guards';
import { getDb, studentWhitelist, courses, agendas, whatsappConnections, reminderJobs, profiles } from '@novarion/db';
import { eq, sql, desc } from 'drizzle-orm';
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
  Plus,
  Globe,
  Settings,
  History,
} from 'lucide-react';
import { formatWIBShort, formatWIB } from '@novarion/shared';

export default async function AdminDashboardPage() {
  await requireAdmin();
  const db = getDb();

  // Aggregate operational metrics without full table scans
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
        deadline: agendas.deadline,
        createdAt: agendas.createdAt,
        createdBy: agendas.createdBy,
        creatorName: profiles.fullName,
      })
      .from(agendas)
      .leftJoin(profiles, eq(agendas.createdBy, profiles.id))
      .where(eq(agendas.status, 'pending'))
      .orderBy(desc(agendas.createdAt))
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
    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full">
      {/* 1. Header & Quick Operational Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-card bg-surface border border-border">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-teal-deep uppercase tracking-wider mb-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Pusat Kendali Operasional</span>
          </div>
          <h1 className="font-heading font-bold text-xl sm:text-2xl text-text-primary tracking-tight">
            Ringkasan Angkatan Statistika 62
          </h1>
          <p className="text-xs text-text-muted mt-0.5">
            Monitoring whitelist mahasiswa, gateway bot WhatsApp, dan peninjauan agenda.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link href="/admin/students">
            <Button variant="secondary" size="sm" className="gap-1.5 text-xs">
              <Users className="w-3.5 h-3.5" />
              <span>Kelola Mahasiswa</span>
            </Button>
          </Link>
          <Link href="/admin/agendas">
            <Button variant="primary" size="sm" className="gap-1.5 text-xs">
              <CalendarCheck className="w-3.5 h-3.5" />
              <span>Buat Agenda Resmi</span>
            </Button>
          </Link>
          <Link href="/admin/whatsapp">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs">
              <MessageSquare className="w-3.5 h-3.5" />
              <span>WhatsApp Bot</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. Actionable Health Alerts */}
      {(pendingAgendas.length > 0 || failedJobsCount > 0 || waConn?.status !== 'connected') && (
        <div className="flex flex-col gap-2.5">
          {pendingAgendas.length > 0 && (
            <div className="p-3.5 rounded-lg bg-amber-500/10 border border-amber-500/25 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-amber-900">
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-700" />
                <span>
                  <strong>{pendingAgendas.length} Pengajuan Agenda Mahasiswa</strong> menunggu verifikasi dan persetujuan pengurus.
                </span>
              </div>
              <Link href="/admin/submissions" className="shrink-0">
                <Button variant="outline" size="sm" className="text-xs bg-surface gap-1">
                  <span>Tinjau Pengajuan</span>
                  <ArrowRight className="w-3 h-3" />
                </Button>
              </Link>
            </div>
          )}

          {failedJobsCount > 0 && (
            <div className="p-3.5 rounded-lg bg-danger-surface border border-danger-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-danger-text">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>
                  <strong>{failedJobsCount} Pengingat WhatsApp</strong> gagal terkirim. Silakan periksa status gateway atau nomor tujuan.
                </span>
              </div>
              <Link href="/admin/whatsapp" className="shrink-0">
                <Button variant="danger" size="sm" className="text-xs gap-1">
                  <span>Periksa Log Bot</span>
                  <ArrowRight className="w-3 h-3" />
                </Button>
              </Link>
            </div>
          )}

          {waConn?.status !== 'connected' && (
            <div className="p-3.5 rounded-lg bg-surface-soft border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-text-muted">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 shrink-0 text-text-muted" />
                <span>
                  Gateway Baileys WhatsApp saat ini berstatus <strong className="text-text-primary uppercase">{waConn?.status || 'OFFLINE'}</strong>.
                </span>
              </div>
              <Link href="/admin/whatsapp" className="shrink-0">
                <Button variant="outline" size="sm" className="text-xs">
                  Hubungkan Perangkat
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}

      {/* 3. Operational Strip (Clean Workspace Layout, Anti-AI-slop) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Link
          href="/admin/students"
          className="p-4 rounded-card bg-surface border border-border hover:border-border-strong transition-colors flex flex-col gap-1 group"
        >
          <span className="text-[11px] font-semibold text-text-muted">Mahasiswa Terdaftar</span>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="text-2xl font-heading font-bold text-text-primary">
              {totalStudents}
            </span>
            <span className="text-xs text-teal-deep font-semibold">
              {activeStudents} aktif
            </span>
          </div>
          <span className="text-[10px] text-text-muted mt-1 group-hover:text-teal-deep transition-colors">
            Kelola Whitelist & Sandi →
          </span>
        </Link>

        <Link
          href="/admin/academics"
          className="p-4 rounded-card bg-surface border border-border hover:border-border-strong transition-colors flex flex-col gap-1 group"
        >
          <span className="text-[11px] font-semibold text-text-muted">Katalog Mata Kuliah</span>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="text-2xl font-heading font-bold text-text-primary">
              {totalCourses}
            </span>
            <span className="text-xs text-text-muted font-medium">Matkul</span>
          </div>
          <span className="text-[10px] text-text-muted mt-1 group-hover:text-teal-deep transition-colors">
            Struktur Kelas & Dosen →
          </span>
        </Link>

        <Link
          href="/admin/whatsapp"
          className="p-4 rounded-card bg-surface border border-border hover:border-border-strong transition-colors flex flex-col gap-1 group"
        >
          <span className="text-[11px] font-semibold text-text-muted">Status Bot WhatsApp</span>
          <div className="flex items-center gap-2 mt-1">
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
          <span className="text-[10px] text-text-muted font-mono mt-1 truncate">
            {waConn?.lastConnectedAt
              ? `Aktif: ${formatWIBShort(waConn.lastConnectedAt)}`
              : 'Belum terhubung'}
          </span>
        </Link>

        <Link
          href="/admin/whatsapp"
          className="p-4 rounded-card bg-surface border border-border hover:border-border-strong transition-colors flex flex-col gap-1 group"
        >
          <span className="text-[11px] font-semibold text-text-muted">Antrean Reminder</span>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="text-2xl font-heading font-bold text-text-primary">
              {queuedJobsCount}
            </span>
            <span className="text-xs text-text-muted">pekerjaan</span>
          </div>
          <span className={`text-[10px] mt-1 ${failedJobsCount > 0 ? 'text-danger-text font-bold' : 'text-text-muted'}`}>
            {failedJobsCount > 0 ? `${failedJobsCount} reminder gagal` : '0 kendala reminder'}
          </span>
        </Link>
      </div>

      {/* 4. Two-Column Operational Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Kolom Kiri (7 Cols): Pending Agenda Proposals */}
        <div className="lg:col-span-7 flex flex-col gap-3">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <CalendarCheck className="w-4 h-4 text-teal-deep" />
              <h2 className="font-heading font-bold text-sm sm:text-base text-text-primary">
                Pengajuan Agenda Mahasiswa
              </h2>
            </div>
            <Link
              href="/admin/submissions"
              className="text-xs font-semibold text-teal-deep hover:underline flex items-center gap-1"
            >
              <span>Semua Pengajuan</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="rounded-card bg-surface border border-border overflow-hidden shadow-xs">
            {pendingAgendas.length === 0 ? (
              <div className="p-8 text-center text-xs text-text-muted flex flex-col items-center gap-2">
                <CheckCircle2 className="w-8 h-8 text-teal-deep/50" />
                <p className="font-bold text-text-primary">Antrean Pengajuan Bersih</p>
                <p className="max-w-sm">
                  Tidak ada usulan agenda baru yang menunggu persetujuan dari mahasiswa.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {pendingAgendas.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-surface-soft/40 transition-colors"
                  >
                    <div className="flex flex-col gap-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Badge variant="primary" size="sm">{item.category}</Badge>
                        <span className="text-[11px] font-mono text-text-muted capitalize">
                          Cakupan {item.scope}
                        </span>
                      </div>

                      <h3 className="font-heading font-bold text-sm text-text-primary truncate">
                        {item.title}
                      </h3>

                      <div className="flex items-center gap-2 text-[11px] text-text-muted">
                        <span>Pengusul: <strong>{item.creatorName || 'Mahasiswa'}</strong></span>
                        {item.deadline && (
                          <>
                            <span>•</span>
                            <span className="font-mono text-[#9E5507]">
                              Batas: {formatWIBShort(new Date(item.deadline))}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-border">
                      <Link href="/admin/submissions">
                        <Button variant="outline" size="sm" className="text-xs">
                          Tinjau
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Kolom Kanan (5 Cols): Shortcuts to Management Portals */}
        <div className="lg:col-span-5 flex flex-col gap-3">
          <div className="px-1">
            <h2 className="text-xs font-bold uppercase tracking-wider text-text-muted">
              Pusat Manajemen Cepat
            </h2>
          </div>

          <div className="flex flex-col gap-2.5">
            <Link
              href="/admin/students"
              className="p-3.5 rounded-card bg-surface border border-border hover:border-teal-deep/40 hover:bg-surface-soft/40 transition-all flex items-start gap-3 group"
            >
              <div className="p-2 rounded-lg bg-surface-soft shrink-0 group-hover:scale-105 transition-transform">
                <Users className="w-4 h-4 text-teal-deep" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-heading font-bold text-xs text-text-primary">
                  Data Mahasiswa & Akses Akun
                </span>
                <span className="text-[11px] text-text-muted leading-tight mt-0.5">
                  Aktivasi akun, reset sandi, dan import CSV mahasiswa angkatan 62.
                </span>
              </div>
            </Link>

            <Link
              href="/admin/website"
              className="p-3.5 rounded-card bg-surface border border-border hover:border-teal-deep/40 hover:bg-surface-soft/40 transition-all flex items-start gap-3 group"
            >
              <div className="p-2 rounded-lg bg-surface-soft shrink-0 group-hover:scale-105 transition-transform">
                <Globe className="w-4 h-4 text-teal-deep" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-heading font-bold text-xs text-text-primary">
                  Kelola Website Publik (CMS)
                </span>
                <span className="text-[11px] text-text-muted leading-tight mt-0.5">
                  Update foto hero, warta kegiatan, galeri momen, dan prestasi angkatan.
                </span>
              </div>
            </Link>

            <Link
              href="/admin/permissions"
              className="p-3.5 rounded-card bg-surface border border-border hover:border-teal-deep/40 hover:bg-surface-soft/40 transition-all flex items-start gap-3 group"
            >
              <div className="p-2 rounded-lg bg-surface-soft shrink-0 group-hover:scale-105 transition-transform">
                <ShieldCheck className="w-4 h-4 text-teal-deep" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-heading font-bold text-xs text-text-primary">
                  Role & Delegasi Izin
                </span>
                <span className="text-[11px] text-text-muted leading-tight mt-0.5">
                  Delegasi izin pembuatan agenda dan akses pengelola tanpa peran admin penuh.
                </span>
              </div>
            </Link>

            <Link
              href="/admin/audit"
              className="p-3.5 rounded-card bg-surface border border-border hover:border-teal-deep/40 hover:bg-surface-soft/40 transition-all flex items-start gap-3 group"
            >
              <div className="p-2 rounded-lg bg-surface-soft shrink-0 group-hover:scale-105 transition-transform">
                <History className="w-4 h-4 text-teal-deep" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-heading font-bold text-xs text-text-primary">
                  Log Audit & Aktivitas
                </span>
                <span className="text-[11px] text-text-muted leading-tight mt-0.5">
                  Rekam jejak perubahan data, publikasi agenda, dan login pengguna.
                </span>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
