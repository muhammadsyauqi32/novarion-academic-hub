import React from 'react';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { requireAuth } from '@/lib/auth/guards';
import { getDb, agendas, agendaTargets, courses, classSections, studyGroups, profiles } from '@novarion/db';
import { eq } from 'drizzle-orm';
import { formatWIB } from '@novarion/shared';
import { getStudentAcademicScope } from '@/lib/academics/scoping';
import { Card } from '@/components/Card';
import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import {
  ArrowLeft,
  Calendar,
  Clock,
  ExternalLink,
  MapPin,
  Tag,
  Users,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';

interface AgendaDetailPageProps {
  params: {
    id: string;
  };
}

export default async function AgendaDetailPage({ params }: AgendaDetailPageProps) {
  const user = await requireAuth();
  const db = getDb();
  const { id } = params;

  if (!id) {
    notFound();
  }

  const [studentScope, agendaRows] = await Promise.all([
    getStudentAcademicScope(user.id),
    db
      .select({
        id: agendas.id,
        title: agendas.title,
        description: agendas.description,
        category: agendas.category,
        scope: agendas.scope,
        startTime: agendas.startTime,
        deadline: agendas.deadline,
        locationOrLink: agendas.locationOrLink,
        sourceReference: agendas.sourceReference,
        status: agendas.status,
        color: agendas.color,
        createdAt: agendas.createdAt,
        createdBy: agendas.createdBy,
        creatorName: profiles.fullName,
        courseId: agendaTargets.courseId,
        courseName: courses.name,
        courseCode: courses.code,
        classSectionId: agendaTargets.classSectionId,
        className: classSections.name,
        studyGroupId: agendaTargets.studyGroupId,
        studyGroupName: studyGroups.name,
      })
      .from(agendas)
      .leftJoin(agendaTargets, eq(agendas.id, agendaTargets.agendaId))
      .leftJoin(courses, eq(agendaTargets.courseId, courses.id))
      .leftJoin(classSections, eq(agendaTargets.classSectionId, classSections.id))
      .leftJoin(studyGroups, eq(agendaTargets.studyGroupId, studyGroups.id))
      .leftJoin(profiles, eq(agendas.createdBy, profiles.id))
      .where(eq(agendas.id, id))
      .limit(1),
  ]);

  if (agendaRows.length === 0) {
    notFound();
  }

  const agenda = agendaRows[0];

  // Verifikasi otorisasi data isolation mahasiswa
  const isAllowed =
    user.role === 'admin' ||
    agenda.createdBy === user.id ||
    agenda.scope === 'angkatan' ||
    (agenda.scope === 'mata_kuliah' && agenda.courseId && studentScope.courseIds.includes(agenda.courseId)) ||
    (agenda.scope === 'kelas' && agenda.classSectionId && studentScope.classSectionIds.includes(agenda.classSectionId)) ||
    (agenda.scope === 'kelompok' && agenda.studyGroupId && studentScope.studyGroupIds.includes(agenda.studyGroupId)) ||
    (!agenda.courseId && !agenda.classSectionId && !agenda.studyGroupId);

  if (!isAllowed) {
    redirect('/app/agendas');
  }

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Link href="/app/agendas">
          <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-text-muted hover:text-text-primary">
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Daftar Agenda</span>
          </Button>
        </Link>
      </div>

      <Card className="p-6 md:p-8 flex flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-5">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="primary" size="md">
              {agenda.category}
            </Badge>
            <Badge variant="neutral" size="sm" className="capitalize">
              Cakupan: {agenda.scope}
            </Badge>
            {agenda.status === 'published' ? (
              <Badge variant="success" size="sm">
                Dipublikasikan
              </Badge>
            ) : (
              <Badge variant="warning" size="sm">
                Status: {agenda.status}
              </Badge>
            )}
          </div>

          <div className="text-xs text-text-muted">
            Diposting: {formatWIB(agenda.createdAt)}
          </div>
        </div>

        <div>
          <h1 className="font-heading font-extrabold text-2xl md:text-3xl text-text-primary tracking-tight">
            {agenda.title}
          </h1>
          {agenda.creatorName && (
            <p className="text-xs text-text-muted mt-1.5 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-deep" />
              <span>Oleh: {agenda.creatorName}</span>
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl bg-surface-soft border border-border/60">
          <div className="flex items-start gap-3">
            <Calendar className="w-4 h-4 text-teal-deep mt-0.5 shrink-0" />
            <div>
              <span className="text-xs text-text-muted block">Waktu Mulai:</span>
              <span className="text-sm font-semibold text-text-primary">
                {agenda.startTime ? formatWIB(agenda.startTime) : 'Langsung / Fleksibel'}
              </span>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Clock className="w-4 h-4 text-[#FFAE5D] mt-0.5 shrink-0" />
            <div>
              <span className="text-xs text-text-muted block">Batas Waktu (Deadline):</span>
              <span className="text-sm font-bold text-[#9E5507]">
                {agenda.deadline ? formatWIB(agenda.deadline) : 'Tidak ada deadline'}
              </span>
            </div>
          </div>

          {(agenda.courseName || agenda.courseCode) && (
            <div className="flex items-start gap-3">
              <Tag className="w-4 h-4 text-teal-deep mt-0.5 shrink-0" />
              <div>
                <span className="text-xs text-text-muted block">Mata Kuliah:</span>
                <span className="text-sm font-semibold text-text-primary">
                  {agenda.courseCode ? `[${agenda.courseCode}] ` : ''}{agenda.courseName}
                </span>
              </div>
            </div>
          )}

          {(agenda.className || agenda.studyGroupName) && (
            <div className="flex items-start gap-3">
              <Users className="w-4 h-4 text-teal-deep mt-0.5 shrink-0" />
              <div>
                <span className="text-xs text-text-muted block">Target Kelas / Kelompok:</span>
                <span className="text-sm font-semibold text-text-primary">
                  {agenda.className ? `Kelas ${agenda.className}` : ''}
                  {agenda.className && agenda.studyGroupName ? ' • ' : ''}
                  {agenda.studyGroupName ? `Kelompok ${agenda.studyGroupName}` : ''}
                </span>
              </div>
            </div>
          )}
        </div>

        {agenda.description && (
          <div className="flex flex-col gap-2">
            <h2 className="font-heading font-bold text-sm text-text-primary uppercase tracking-wider text-xs">
              Deskripsi & Instruksi
            </h2>
            <div className="text-sm text-text-secondary leading-relaxed whitespace-pre-wrap p-4 rounded-xl bg-surface border border-border">
              {agenda.description}
            </div>
          </div>
        )}

        {agenda.locationOrLink && (
          <div className="flex flex-col gap-2">
            <h2 className="font-heading font-bold text-sm text-text-primary uppercase tracking-wider text-xs">
              Lokasi / Tautan Referensi
            </h2>
            <div className="p-4 rounded-xl bg-teal-deep/5 border border-teal-deep/20 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 overflow-hidden text-xs text-text-primary">
                <MapPin className="w-4 h-4 text-teal-deep shrink-0" />
                <span className="truncate font-mono">{agenda.locationOrLink}</span>
              </div>
              <a
                href={agenda.locationOrLink}
                target="_blank"
                rel="noreferrer"
                className="shrink-0"
              >
                <Button variant="primary" size="sm" className="gap-1.5 text-xs">
                  <span>Buka Tautan</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Button>
              </a>
            </div>
          </div>
        )}

        {agenda.sourceReference && (
          <p className="text-xs text-text-muted italic">
            Sumber rujukan: {agenda.sourceReference}
          </p>
        )}

        <div className="pt-4 border-t border-border flex items-center justify-between">
          <Link href="/app/calendar">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs">
              <Calendar className="w-3.5 h-3.5" />
              <span>Lihat di Kalender</span>
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
