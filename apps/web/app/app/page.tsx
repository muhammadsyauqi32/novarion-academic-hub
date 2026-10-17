import React from 'react';
import Link from 'next/link';
import { requireAuth } from '@/lib/auth/guards';
import { getDb, academicTerms, agendas, personalTasks, agendaTargets, courses } from '@novarion/db';
import { eq, and, gte, desc } from 'drizzle-orm';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';
import { formatWIBShort, formatWIB } from '@novarion/shared';
import { getStudentAcademicScope } from '@/lib/academics/scoping';
import { hasPermission } from '@/lib/auth/permissions';
import {
  Calendar as CalendarIcon,
  CheckCircle2,
  Clock,
  Plus,
  ArrowRight,
  Send,
  BookOpen,
  FolderOpen,
  HelpCircle,
  ShieldCheck,
  CheckSquare,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';

export default async function StudentDashboardPage() {
  const user = await requireAuth();
  const db = getDb();

  const now = new Date();
  const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  // 1. Ambil Scope Mahasiswa, Izin Delegasi, Semester Aktif, Agenda & Tugas secara paralel
  const [studentScope, canPublishOfficial, activeTerms, allUpcomingAgendas, userTasks] =
    await Promise.all([
      getStudentAcademicScope(user.id),
      hasPermission(user, 'agenda.create'),
      db
        .select()
        .from(academicTerms)
        .where(eq(academicTerms.isActive, true))
        .limit(1),
      db
        .select({
          id: agendas.id,
          title: agendas.title,
          description: agendas.description,
          category: agendas.category,
          scope: agendas.scope,
          startTime: agendas.startTime,
          deadline: agendas.deadline,
          color: agendas.color,
          locationOrLink: agendas.locationOrLink,
          status: agendas.status,
          createdBy: agendas.createdBy,
          courseId: agendaTargets.courseId,
          classSectionId: agendaTargets.classSectionId,
          studyGroupId: agendaTargets.studyGroupId,
        })
        .from(agendas)
        .leftJoin(agendaTargets, eq(agendas.id, agendaTargets.agendaId))
        .where(
          and(
            eq(agendas.status, 'published'),
            gte(agendas.deadline, now)
          )
        )
        .orderBy(agendas.deadline)
        .limit(20),
      db
        .select({
          id: personalTasks.id,
          title: personalTasks.title,
          description: personalTasks.description,
          deadline: personalTasks.deadline,
          color: personalTasks.color,
          status: personalTasks.status,
        })
        .from(personalTasks)
        .where(eq(personalTasks.profileId, user.id))
        .orderBy(desc(personalTasks.deadline), desc(personalTasks.createdAt))
        .limit(6),
    ]);

  const activeTerm = activeTerms[0] || null;

  // 2. Filter agenda strictly sesuai kurikulum / kelas / kelompok mahasiswa
  const relevantAgendas = allUpcomingAgendas.filter((agenda) => {
    if (user.role === 'admin') return true;
    if (agenda.createdBy === user.id) return true;
    if (agenda.scope === 'angkatan') return true;
    if (agenda.scope === 'mata_kuliah' && agenda.courseId) {
      return studentScope.courseIds.includes(agenda.courseId);
    }
    if (agenda.scope === 'kelas' && agenda.classSectionId) {
      return studentScope.classSectionIds.includes(agenda.classSectionId);
    }
    if (agenda.scope === 'kelompok' && agenda.studyGroupId) {
      return studentScope.studyGroupIds.includes(agenda.studyGroupId);
    }
    return !agenda.courseId && !agenda.classSectionId && !agenda.studyGroupId;
  });

  // Ambil maksimal 5 terdekat
  const upcomingDeadlines = relevantAgendas.slice(0, 5);

  const completedTasksCount = userTasks.filter((t) => t.status === 'done').length;
  const pendingTasks = userTasks.filter((t) => t.status !== 'done');

  return (
    <div className="flex flex-col gap-6">
      {/* Header Workspace Mahasiswa */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-br from-brand-mint-soft/20 via-surface to-surface-soft border border-border shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-teal-deep/10 text-teal-deep border border-teal-deep/20">
              {activeTerm ? activeTerm.name : 'Semester Aktif'}
            </span>
            <span className="text-xs font-mono text-text-muted">NIM {user.nim}</span>
            {canPublishOfficial && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-orange/20 text-[#9E5507] border border-brand-orange/30 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Agenda Manager
              </span>
            )}
          </div>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-text-primary tracking-tight">
            Semangat Belajar, {user.fullName.split(' ')[0]}! 🌟
          </h1>
          <p className="text-xs sm:text-sm text-text-muted mt-1">
            Novarion 62 Statistika & Sains Data IPB • <em className="text-teal-deep font-semibold">&ldquo;Kita Satu, Kita Bisa!&rdquo;</em>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link href="/app/calendar">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs">
              <CalendarIcon className="w-3.5 h-3.5" />
              <span>Kalender</span>
            </Button>
          </Link>
          <Link href="/app/tasks">
            <Button variant="secondary" size="sm" className="gap-1.5 text-xs">
              <Plus className="w-3.5 h-3.5" />
              <span>Catat Tugas</span>
            </Button>
          </Link>
          <Link href="/app/agendas/new">
            <Button variant="primary" size="sm" className="gap-1.5 text-xs">
              <Send className="w-3.5 h-3.5" />
              <span>{canPublishOfficial ? 'Buat Agenda Resmi' : 'Ajukan Agenda'}</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Ringkasan Faktual Akademik */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 sm:p-5 flex items-center justify-between border-l-4 border-l-teal-deep">
          <div>
            <p className="text-xs font-semibold text-text-muted">Deadline Terdekat Anda</p>
            <p className="text-2xl font-heading font-black text-text-primary mt-1">
              {upcomingDeadlines.length}
            </p>
            <p className="text-[11px] text-text-muted mt-0.5">Sesuai kelas & kelompok Anda</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-teal-deep/10 text-teal-deep flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </Card>

        <Card className="p-4 sm:p-5 flex items-center justify-between border-l-4 border-l-purple-500">
          <div>
            <p className="text-xs font-semibold text-text-muted">Checklist Catatan Pribadi</p>
            <p className="text-2xl font-heading font-black text-text-primary mt-1">
              {completedTasksCount} / {userTasks.length}
            </p>
            <p className="text-[11px] text-text-muted mt-0.5">
              {pendingTasks.length > 0 ? `${pendingTasks.length} tugas belum selesai` : 'Semua tugas beres'}
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center">
            <CheckSquare className="w-5 h-5" />
          </div>
        </Card>

        <Card className="p-4 sm:p-5 flex items-center justify-between border-l-4 border-l-brand-orange">
          <div>
            <p className="text-xs font-semibold text-text-muted">Materi & Sumber Belajar</p>
            <Link href="/app/materials" className="text-xs font-bold text-teal-deep hover:underline mt-1 block">
              Buka Berkas Materi →
            </Link>
            <p className="text-[11px] text-text-muted mt-0.5">Slide, silabus, dan modul</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-brand-orange/15 text-[#9E5507] flex items-center justify-center">
            <BookOpen className="w-5 h-5" />
          </div>
        </Card>
      </div>

      {/* Grid Konten Utama Dua Kolom */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Kolom Kiri: Agenda & Deadline Mendatang (Targeted) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-teal-deep" />
              <h2 className="font-heading font-bold text-base text-text-primary">
                Agenda & Deadline Terdekat
              </h2>
            </div>
            <Link href="/app/agendas" className="text-xs font-semibold text-teal-deep hover:underline flex items-center gap-1">
              <span>Semua Agenda</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {upcomingDeadlines.length === 0 ? (
            <Card className="text-center py-12 flex flex-col items-center gap-3">
              <CheckCircle2 className="w-10 h-10 text-brand-mint" />
              <div>
                <p className="text-sm font-bold text-text-primary">Tidak Ada Deadline Terdekat</p>
                <p className="text-xs text-text-muted mt-0.5">
                  Semua agenda perkuliahan untuk kelas dan kelompok Anda telah terselesaikan atau belum dijadwalkan.
                </p>
              </div>
              <Link href="/app/calendar">
                <Button variant="outline" size="sm">
                  Lihat Seluruh Kalender
                </Button>
              </Link>
            </Card>
          ) : (
            <div className="flex flex-col gap-3">
              {upcomingDeadlines.map((item) => (
                <Card
                  key={item.id}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-teal-deep/40 transition-colors"
                  style={item.color ? { borderLeft: `4px solid ${item.color}` } : undefined}
                >
                  <div className="flex flex-col gap-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Badge variant="primary" size="sm">{item.category}</Badge>
                      <span className="text-[11px] text-text-muted capitalize">• Cakupan {item.scope}</span>
                    </div>
                    <h3 className="font-heading font-bold text-sm text-text-primary truncate">
                      {item.title}
                    </h3>
                    {item.description && (
                      <p className="text-xs text-text-muted line-clamp-1">{item.description}</p>
                    )}
                    <p className="text-xs font-semibold text-[#9E5507] mt-0.5">
                      Batas Pengumpulan: {item.deadline ? formatWIB(item.deadline) : 'Tidak ada'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {item.locationOrLink && (
                      <a
                        href={item.locationOrLink}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-lg text-text-muted hover:text-teal-deep hover:bg-surface-soft transition-colors"
                        title="Buka Tautan Tugas"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                    <Link href={`/app/agendas/${item.id}`}>
                      <Button variant="outline" size="sm">
                        Detail
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Kolom Kanan: Checklist Catatan Tugas Saya & Akses Cepat */}
        <div className="lg:col-span-5 flex flex-col gap-5">
          {/* Section Checklist Tugas Pribadi */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-purple-600" />
                <h2 className="font-heading font-bold text-base text-text-primary">
                  Catatan Tugas Saya
                </h2>
              </div>
              <Link href="/app/tasks" className="text-xs font-semibold text-teal-deep hover:underline">
                Kelola Semua
              </Link>
            </div>

            <Card className="p-0 overflow-hidden divide-y divide-border bg-surface border-border shadow-xs">
              {userTasks.length === 0 ? (
                <div className="text-center py-8 p-4">
                  <CheckCircle2 className="w-8 h-8 text-text-muted/40 mx-auto mb-2" />
                  <p className="text-xs text-text-muted">Belum ada catatan tugas pribadi.</p>
                  <Link href="/app/tasks" className="mt-3 inline-block">
                    <Button variant="secondary" size="sm">
                      + Buat Catatan Tugas
                    </Button>
                  </Link>
                </div>
              ) : (
                <>
                  <div className="p-3 bg-surface-soft text-[11px] font-semibold text-text-muted flex items-center justify-between">
                    <span>Daftar Checklist Mandiri</span>
                    <span className="font-mono">{completedTasksCount}/{userTasks.length} Selesai</span>
                  </div>
                  <div className="divide-y divide-border">
                    {userTasks.map((t) => (
                      <div key={t.id} className="p-3 flex items-center justify-between gap-3 text-xs hover:bg-surface-soft/40 transition-colors">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span
                            className={`w-2 h-2 rounded-full shrink-0 ${
                              t.status === 'done' ? 'bg-success-text' : 'bg-brand-orange'
                            }`}
                            style={t.color ? { backgroundColor: t.color } : undefined}
                          />
                          <span className={`truncate ${t.status === 'done' ? 'line-through text-text-muted' : 'font-medium text-text-primary'}`}>
                            {t.title}
                          </span>
                        </div>
                        <Badge variant={t.status === 'done' ? 'success' : 'neutral'} size="sm">
                          {t.status === 'done' ? 'Selesai' : 'Belum'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </Card>
          </div>

          {/* Section Akses Modul Akademik Penting */}
          <div className="flex flex-col gap-3">
            <h3 className="font-heading font-bold text-xs uppercase tracking-wider text-text-muted">
              Pusat Navigasi Mahasiswa
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <Link href="/app/calendar" className="p-3.5 rounded-xl border border-border bg-surface hover:border-teal-deep/50 hover:bg-teal-deep/5 transition-all flex flex-col gap-1.5 group">
                <CalendarIcon className="w-4 h-4 text-teal-deep group-hover:scale-110 transition-transform" />
                <span className="font-heading font-bold text-xs text-text-primary">Kalender Akademik</span>
                <span className="text-[10px] text-text-muted leading-tight">Lihat jadwal semester per bulan & minggu</span>
              </Link>
              <Link href="/app/materials" className="p-3.5 rounded-xl border border-border bg-surface hover:border-teal-deep/50 hover:bg-teal-deep/5 transition-all flex flex-col gap-1.5 group">
                <FolderOpen className="w-4 h-4 text-teal-deep group-hover:scale-110 transition-transform" />
                <span className="font-heading font-bold text-xs text-text-primary">Materi & Berkas</span>
                <span className="text-[10px] text-text-muted leading-tight">Unduh silabus, slide, dan diktat kuliah</span>
              </Link>
              <Link href="/app/knowledge" className="p-3.5 rounded-xl border border-border bg-surface hover:border-teal-deep/50 hover:bg-teal-deep/5 transition-all flex flex-col gap-1.5 group">
                <HelpCircle className="w-4 h-4 text-teal-deep group-hover:scale-110 transition-transform" />
                <span className="font-heading font-bold text-xs text-text-primary">Knowledge Hub & FAQ</span>
                <span className="text-[10px] text-text-muted leading-tight">Panduan akademik & tautan penting IPB</span>
              </Link>
              <Link href="/app/agendas/new" className="p-3.5 rounded-xl border border-border bg-surface hover:border-teal-deep/50 hover:bg-teal-deep/5 transition-all flex flex-col gap-1.5 group">
                <Send className="w-4 h-4 text-teal-deep group-hover:scale-110 transition-transform" />
                <span className="font-heading font-bold text-xs text-text-primary">
                  {canPublishOfficial ? 'Buat Agenda' : 'Ajukan Agenda'}
                </span>
                <span className="text-[10px] text-text-muted leading-tight">
                  {canPublishOfficial ? 'Publikasikan jadwal resmi' : 'Usulkan jadwal ke pengurus'}
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
