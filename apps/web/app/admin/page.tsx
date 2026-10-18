import React from 'react';
import Link from 'next/link';
import { requireAdmin } from '@/lib/auth/guards';
import { getDb, studentWhitelist, courses, agendas, whatsappConnections, reminderJobs, profiles } from '@novarion/db';
import { eq, sql, desc } from 'drizzle-orm';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';
import { 
  Users, 
  ArrowRight, 
  ShieldCheck, 
  CalendarCheck, 
  CheckCircle2, 
  AlertCircle, 
  AlertTriangle,
  Globe, 
  History,
  MessageSquare
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-card bg-surface border border-border/80 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-mono font-semibold text-teal-deep uppercase tracking-wider mb-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Pusat Kendali Operasional</span>
            <span>•</span>
            <span className="text-text-muted">Statistika 62</span>
          </div>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-text-primary tracking-tight">
            Ringkasan Angkatan Statistika 62
          </h1>
          <p className="text-xs text-text-muted mt-0.5">
            Monitoring whitelist mahasiswa, gateway bot WhatsApp, dan peninjauan agenda perkuliahan.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link href="/admin/students">
            <Button variant="secondary" size="sm" className="gap-1.5 text-xs font-semibold">
              <Users className="w-3.5 h-3.5" />
              <span>Kelola Mahasiswa</span>
            </Button>
          </Link>
          <Link href="/admin/agendas">
            <Button variant="primary" size="sm" className="gap-1.5 text-xs font-bold">
              <CalendarCheck className="w-3.5 h-3.5" />
              <span>Buat Agenda Resmi</span>
            </Button>
          </Link>
          <Link href="/admin/whatsapp">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs font-semibold">
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
            <div className="p-3.5 rounded-lg bg-amber-50 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-amber-900">
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-700" />
                <span>
                  <strong>{pendingAgendas.length} Pengajuan Agenda Mahasiswa</strong> menunggu verifikasi dan persetujuan pengurus.
                </span>
              </div>
              <Link href="/admin/submissions" className="shrink-0">
                <Button variant="outline" size="sm" className="text-xs bg-surface gap-1 font-semibold">
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
                <Button variant="danger" size="sm" className="text-xs gap-1 font-semibold">
                  <span>Periksa Log Bot</span>
                  <ArrowRight className="w-3 h-3" />
                </Button>
              </Link>
            </div>
          )}

          {waConn?.status !== 'connected' && (
            <div className="p-3.5 rounded-lg bg-surface border border-border/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-text-muted shadow-2xs">
              <div className="flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shrink-0" />
                <span>
                  Gateway Baileys WhatsApp saat ini berstatus <strong className="text-text-primary uppercase font-mono">{waConn?.status || 'OFFLINE'}</strong>.
                </span>
              </div>
              <Link href="/admin/whatsapp" className="shrink-0">
                <Button variant="outline" size="sm" className="text-xs font-semibold">
                  Hubungkan Perangkat
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}

      {/* 3. Operational Metric Ledger (Sleek Single Surface with Hairline Dividers) */}
      <div className="rounded-card bg-surface border border-border/80 shadow-2xs overflow-hidden grid grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-border/60">
        <Link
          href="/admin/students"
          className="p-4 sm:p-5 flex flex-col gap-1 hover:bg-surface-soft/40 transition-colors group"
        >
          <span className="text-[11px] font-mono uppercase tracking-wider text-text-muted">
            Mahasiswa Terdaftar
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-heading font-extrabold text-text-primary tracking-tight">
              {totalStudents}
            </span>
            <span className="text-xs font-mono font-semibold text-teal-deep">
              {activeStudents} aktif
            </span>
          </div>
          <span className="text-[11px] text-text-muted mt-2 group-hover:text-teal-deep transition-colors flex items-center gap-1 font-medium">
            <span>Whitelist & Sandi</span>
            <span className="group-hover:translate-x-0.5 transition-transform">→</span>
          </span>
        </Link>

        <Link
          href="/admin/academics"
          className="p-4 sm:p-5 flex flex-col gap-1 hover:bg-surface-soft/40 transition-colors group"
        >
          <span className="text-[11px] font-mono uppercase tracking-wider text-text-muted">
            Katalog Mata Kuliah
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-heading font-extrabold text-text-primary tracking-tight">
              {totalCourses}
            </span>
            <span className="text-xs text-text-muted font-mono font-medium">Matkul</span>
          </div>
          <span className="text-[11px] text-text-muted mt-2 group-hover:text-teal-deep transition-colors flex items-center gap-1 font-medium">
            <span>Struktur Kelas & Dosen</span>
            <span className="group-hover:translate-x-0.5 transition-transform">→</span>
          </span>
        </Link>

        <Link
          href="/admin/whatsapp"
          className="p-4 sm:p-5 flex flex-col gap-1 hover:bg-surface-soft/40 transition-colors group"
        >
          <span className="text-[11px] font-mono uppercase tracking-wider text-text-muted">
            Gateway WhatsApp
          </span>
          <div className="flex items-center gap-2 mt-1">
            <span
              className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                waConn?.status === 'connected' ? 'bg-emerald-500' : 'bg-rose-500'
              }`}
            />
            <span className="font-heading font-bold text-base uppercase text-text-primary">
              {waConn?.status || 'OFFLINE'}
            </span>
          </div>
          <span className="text-[11px] text-text-muted font-mono mt-2 truncate">
            {waConn?.lastConnectedAt
              ? `Aktif: ${formatWIBShort(waConn.lastConnectedAt)}`
              : 'Belum terhubung'}
          </span>
        </Link>

        <Link
          href="/admin/whatsapp"
          className="p-4 sm:p-5 flex flex-col gap-1 hover:bg-surface-soft/40 transition-colors group"
        >
          <span className="text-[11px] font-mono uppercase tracking-wider text-text-muted">
            Antrean Reminder
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-heading font-extrabold text-text-primary tracking-tight">
              {queuedJobsCount}
            </span>
            <span className="text-xs font-mono text-text-muted">antrean</span>
          </div>
          <span className={`text-[11px] mt-2 font-mono ${failedJobsCount > 0 ? 'text-danger-text font-bold' : 'text-text-muted'}`}>
            {failedJobsCount > 0 ? `${failedJobsCount} reminder gagal` : '0 kendala pengiriman'}
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
              <h2 className="font-heading font-extrabold text-base text-text-primary">
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

          <div className="rounded-card bg-surface border border-border/80 overflow-hidden shadow-2xs">
            {pendingAgendas.length === 0 ? (
              <div className="p-10 text-center text-xs text-text-muted flex flex-col items-center gap-2">
                <CheckCircle2 className="w-7 h-7 text-teal-deep/50" />
                <p className="font-heading font-bold text-sm text-text-primary">Antrean Pengajuan Bersih</p>
                <p className="max-w-sm text-text-muted text-[11px]">
                  Tidak ada usulan agenda baru yang menunggu persetujuan dari mahasiswa.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border/60">
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

                    <div className="shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/60">
                      <Link href="/admin/submissions">
                        <Button variant="outline" size="sm" className="text-xs font-semibold">
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
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-text-muted">
              Pusat Manajemen Cepat
            </h2>
          </div>

          <div className="rounded-card bg-surface border border-border/80 shadow-2xs divide-y divide-border/60 overflow-hidden">
            <Link
              href="/admin/students"
              className="p-3.5 flex items-center justify-between gap-3 hover:bg-surface-soft/50 transition-colors group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <Users className="w-4 h-4 text-teal-deep shrink-0" />
                <div className="flex flex-col min-w-0">
                  <span className="font-heading font-bold text-xs text-text-primary">
                    Data Mahasiswa & Akses Akun
                  </span>
                  <span className="text-[11px] text-text-muted truncate">
                    Aktivasi akun, reset sandi, dan import CSV angkatan 62
                  </span>
                </div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-text-muted group-hover:text-teal-deep group-hover:translate-x-0.5 transition-all shrink-0" />
            </Link>

            <Link
              href="/admin/website"
              className="p-3.5 flex items-center justify-between gap-3 hover:bg-surface-soft/50 transition-colors group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <Globe className="w-4 h-4 text-teal-deep shrink-0" />
                <div className="flex flex-col min-w-0">
                  <span className="font-heading font-bold text-xs text-text-primary">
                    Kelola Website Publik (CMS)
                  </span>
                  <span className="text-[11px] text-text-muted truncate">
                    Update foto hero, warta kegiatan, galeri momen, dan prestasi
                  </span>
                </div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-text-muted group-hover:text-teal-deep group-hover:translate-x-0.5 transition-all shrink-0" />
            </Link>

            <Link
              href="/admin/permissions"
              className="p-3.5 flex items-center justify-between gap-3 hover:bg-surface-soft/50 transition-colors group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <ShieldCheck className="w-4 h-4 text-teal-deep shrink-0" />
                <div className="flex flex-col min-w-0">
                  <span className="font-heading font-bold text-xs text-text-primary">
                    Role & Delegasi Izin
                  </span>
                  <span className="text-[11px] text-text-muted truncate">
                    Delegasi izin agenda dan pengelola tanpa peran admin penuh
                  </span>
                </div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-text-muted group-hover:text-teal-deep group-hover:translate-x-0.5 transition-all shrink-0" />
            </Link>

            <Link
              href="/admin/audit"
              className="p-3.5 flex items-center justify-between gap-3 hover:bg-surface-soft/50 transition-colors group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <History className="w-4 h-4 text-teal-deep shrink-0" />
                <div className="flex flex-col min-w-0">
                  <span className="font-heading font-bold text-xs text-text-primary">
                    Log Audit & Aktivitas
                  </span>
                  <span className="text-[11px] text-text-muted truncate">
                    Rekam jejak perubahan data, publikasi agenda, dan login pengguna
                  </span>
                </div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-text-muted group-hover:text-teal-deep group-hover:translate-x-0.5 transition-all shrink-0" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
