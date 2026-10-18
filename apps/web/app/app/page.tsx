import React from 'react';
import Link from 'next/link';
import { requireAuth } from '@/lib/auth/guards';
import { getDb, academicTerms, agendas, personalTasks, agendaTargets, courses } from '@novarion/db';
import { eq, and, gte, desc, or } from 'drizzle-orm';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';
import { formatWIBShort, formatWIB } from '@novarion/shared';
import { getStudentAcademicScope } from '@/lib/academics/scoping';
import { hasPermission } from '@/lib/auth/permissions';
import { DashboardTaskList } from '@/components/hub/DashboardTaskList';
import {
  Calendar as CalendarIcon,
  Clock,
  Plus,
  ArrowRight,
  Send,
  BookOpen,
  FolderOpen,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  CalendarDays,
  FileText,
} from 'lucide-react';

export default async function StudentDashboardPage() {
  const user = await requireAuth();
  const db = getDb();

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  // Parallel data fetching for instant response time
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
          courseCode: courses.code,
          courseName: courses.name,
        })
        .from(agendas)
        .leftJoin(agendaTargets, eq(agendas.id, agendaTargets.agendaId))
        .leftJoin(courses, eq(agendaTargets.courseId, courses.id))
        .where(
          and(
            eq(agendas.status, 'published'),
            or(gte(agendas.deadline, startOfToday), gte(agendas.startTime, startOfToday))
          )
        )
        .orderBy(agendas.deadline, agendas.startTime)
        .limit(25),
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
        .orderBy(desc(personalTasks.createdAt))
        .limit(8),
    ]);

  const activeTerm = activeTerms[0] || null;

  // Filter agendas strictly based on student academic scoping
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

  // Split into upcoming deadlines and this week's schedule
  const upcomingDeadlines = relevantAgendas
    .filter((a) => a.deadline && new Date(a.deadline) >= now)
    .slice(0, 5);

  const thisWeekAgendas = relevantAgendas
    .filter((a) => {
      const targetTime = a.startTime ? new Date(a.startTime) : a.deadline ? new Date(a.deadline) : null;
      if (!targetTime) return false;
      return targetTime >= startOfToday && targetTime <= sevenDaysFromNow;
    })
    .slice(0, 4);

  // Helper for urgency formatting
  const getUrgencyBadge = (deadlineDate: Date) => {
    const diffMs = deadlineDate.getTime() - now.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffHours < 0) {
      return <Badge variant="neutral" size="sm">Tenggat Berakhir</Badge>;
    }
    if (diffHours <= 12) {
      return <Badge variant="danger" size="sm">Hari Ini ({diffHours} jam lagi)</Badge>;
    }
    if (diffDays === 0) {
      return <Badge variant="warning" size="sm">Hari Ini</Badge>;
    }
    if (diffDays === 1) {
      return <Badge variant="orange" size="sm">Besok</Badge>;
    }
    if (diffDays <= 3) {
      return <Badge variant="mint" size="sm">{diffDays} hari lagi</Badge>;
    }
    return <Badge variant="neutral" size="sm">{diffDays} hari lagi</Badge>;
  };

  const firstName = user.fullName.split(' ')[0];

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full">
      {/* 1. Above the fold: Focused Academic Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-card bg-surface border border-border">
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded text-[11px] font-heading font-bold bg-teal-deep/10 text-teal-deep border border-teal-deep/20 uppercase tracking-wider">
              {activeTerm ? activeTerm.name : 'Semester Aktif'}
            </span>
            <span className="text-xs font-mono text-text-muted">NIM {user.nim}</span>
            {canPublishOfficial && (
              <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-brand-orange/15 text-[#9E5507] flex items-center gap-1 border border-brand-orange/20">
                <ShieldCheck className="w-3.5 h-3.5" /> Delegasi Agenda
              </span>
            )}
          </div>
          <h1 className="font-heading font-bold text-2xl sm:text-3xl text-text-primary tracking-tight">
            Halo, {firstName}
          </h1>
          <p className="text-xs text-text-muted">
            Workspace akademik angkatan Statistika dan Sains Data 62 IPB University.
          </p>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <Link href="/app/tasks">
            <Button variant="secondary" size="sm" className="gap-1.5 text-xs font-medium">
              <Plus className="w-3.5 h-3.5" />
              <span>Catat Tugas</span>
            </Button>
          </Link>
          <Link href="/app/calendar">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs font-medium">
              <CalendarIcon className="w-3.5 h-3.5" />
              <span>Kalender</span>
            </Button>
          </Link>
          <Link href="/app/agendas/new">
            <Button variant="primary" size="sm" className="gap-1.5 text-xs font-medium">
              <Send className="w-3.5 h-3.5" />
              <span>{canPublishOfficial ? 'Buat Agenda' : 'Ajukan Agenda'}</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Kolom Kiri (7 Cols): Prioritas Deadline & Jadwal Pekan Ini */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* Priority Area: Upcoming Deadlines */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-teal-deep" />
                <h2 className="font-heading font-bold text-base text-text-primary tracking-tight">
                  Tenggat Waktu Terdekat
                </h2>
              </div>
              <Link
                href="/app/agendas"
                className="text-xs font-semibold text-teal-deep hover:underline flex items-center gap-1"
              >
                <span>Lihat Semua</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {upcomingDeadlines.length === 0 ? (
              <div className="p-8 rounded-card bg-surface border border-border text-center flex flex-col items-center gap-2">
                <CheckCircle2 className="w-8 h-8 text-teal-deep/50" />
                <p className="text-xs font-bold text-text-primary">Tidak Ada Tenggat Mendatang</p>
                <p className="text-[11px] text-text-muted max-w-sm">
                  Seluruh agenda perkuliahan untuk kelas dan kelompok praktikum Anda sudah terselesaikan.
                </p>
              </div>
            ) : (
              <div className="rounded-card bg-surface border border-border divide-y divide-border overflow-hidden">
                {upcomingDeadlines.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 hover:bg-surface-soft/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex flex-col gap-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="primary" size="sm">{item.category}</Badge>
                        {item.courseCode && (
                          <span className="text-[11px] font-mono font-semibold text-teal-deep bg-teal-deep/10 px-1.5 py-0.5 rounded border border-teal-deep/20">
                            {item.courseCode}
                          </span>
                        )}
                        {item.deadline && getUrgencyBadge(new Date(item.deadline))}
                      </div>

                      <h3 className="font-heading font-semibold text-sm text-text-primary truncate">
                        {item.title}
                      </h3>

                      {item.courseName && (
                        <p className="text-[11px] text-teal-deep font-medium truncate">
                          {item.courseName}
                        </p>
                      )}

                      <p className="text-[11px] text-text-muted font-mono">
                        Batas: <span className="font-semibold text-text-primary">{item.deadline ? formatWIB(item.deadline) : 'Fleksibel'}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-border">
                      {item.locationOrLink && (
                        <a
                          href={item.locationOrLink}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2 rounded-lg text-text-muted hover:text-teal-deep hover:bg-surface-soft transition-colors"
                          title="Buka Tautan"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                      <Link href={`/app/agendas/${item.id}`}>
                        <Button variant="outline" size="sm" className="text-xs font-medium">
                          Detail
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Schedule Preview: Today / This Week */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-teal-deep" />
                <h2 className="font-heading font-bold text-base text-text-primary tracking-tight">
                  Jadwal 7 Hari ke Depan
                </h2>
              </div>
              <Link
                href="/app/calendar"
                className="text-xs font-semibold text-teal-deep hover:underline flex items-center gap-1"
              >
                <span>Buka Kalender</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {thisWeekAgendas.length === 0 ? (
              <div className="p-6 rounded-card bg-surface border border-border text-center text-xs text-text-muted">
                Tidak ada agenda terjadwal untuk 7 hari ke depan.
              </div>
            ) : (
              <div className="rounded-card bg-surface border border-border divide-y divide-border overflow-hidden">
                {thisWeekAgendas.map((agenda) => (
                  <div key={agenda.id} className="p-3.5 flex items-center justify-between gap-3 text-xs hover:bg-surface-soft/40 transition-colors">
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-surface-soft text-text-muted font-bold border border-border">
                          {agenda.category}
                        </span>
                        {agenda.courseCode && (
                          <span className="text-[11px] font-mono text-teal-deep font-semibold">
                            {agenda.courseCode}
                          </span>
                        )}
                      </div>
                      <span className="font-heading font-semibold text-text-primary truncate">{agenda.title}</span>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[11px] font-mono text-text-muted block">
                        {agenda.startTime ? formatWIBShort(agenda.startTime) : agenda.deadline ? formatWIBShort(agenda.deadline) : '-'}
                      </span>
                      <Link href={`/app/agendas/${agenda.id}`} className="text-[10px] font-bold text-teal-deep hover:underline">
                        Lihat →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Kolom Kanan (5 Cols): Interactive Personal Tasks & Learning Shortcuts */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Interactive Personal Task Checklist */}
          <DashboardTaskList initialTasks={userTasks} />

          {/* Academic Resource Shortcuts */}
          <div className="flex flex-col gap-2.5">
            <h3 className="text-[11px] font-heading font-bold uppercase tracking-wider text-text-muted px-1">
              Pusat Sumber Belajar
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <Link
                href="/app/materials"
                className="p-4 rounded-card bg-surface border border-border hover:border-teal-deep/50 hover:bg-surface-soft/40 transition-all flex flex-col gap-2 group"
              >
                <div className="w-8 h-8 rounded-lg bg-teal-deep/10 text-teal-deep flex items-center justify-center group-hover:scale-105 transition-transform">
                  <FolderOpen className="w-4 h-4" />
                </div>
                <span className="font-heading font-bold text-xs text-text-primary">File Materi</span>
                <span className="text-[10px] text-text-muted leading-tight">
                  Slide kuliah, modul lab, dan silabus
                </span>
              </Link>

              <Link
                href="/app/knowledge"
                className="p-4 rounded-card bg-surface border border-border hover:border-teal-deep/50 hover:bg-surface-soft/40 transition-all flex flex-col gap-2 group"
              >
                <div className="w-8 h-8 rounded-lg bg-teal-deep/10 text-teal-deep flex items-center justify-center group-hover:scale-105 transition-transform">
                  <BookOpen className="w-4 h-4" />
                </div>
                <span className="font-heading font-bold text-xs text-text-primary">Knowledge Hub</span>
                <span className="text-[10px] text-text-muted leading-tight">
                  FAQ akademik & tautan resmi IPB
                </span>
              </Link>

              <Link
                href="/app/calendar"
                className="p-4 rounded-card bg-surface border border-border hover:border-teal-deep/50 hover:bg-surface-soft/40 transition-all flex flex-col gap-2 group"
              >
                <div className="w-8 h-8 rounded-lg bg-teal-deep/10 text-teal-deep flex items-center justify-center group-hover:scale-105 transition-transform">
                  <CalendarIcon className="w-4 h-4" />
                </div>
                <span className="font-heading font-bold text-xs text-text-primary">Kalender Semester</span>
                <span className="text-[10px] text-text-muted leading-tight">
                  Tampilan bulan, pekan, dan filter matkul
                </span>
              </Link>

              <Link
                href="/app/agendas/new"
                className="p-4 rounded-card bg-surface border border-border hover:border-teal-deep/50 hover:bg-surface-soft/40 transition-all flex flex-col gap-2 group"
              >
                <div className="w-8 h-8 rounded-lg bg-teal-deep/10 text-teal-deep flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Send className="w-4 h-4" />
                </div>
                <span className="font-heading font-bold text-xs text-text-primary">
                  {canPublishOfficial ? 'Buat Agenda' : 'Ajukan Agenda'}
                </span>
                <span className="text-[10px] text-text-muted leading-tight">
                  {canPublishOfficial ? 'Publikasikan ke angkatan' : 'Usulkan jadwal kegiatan'}
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
