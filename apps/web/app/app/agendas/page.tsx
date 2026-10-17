import React from 'react';
import { requireAuth } from '@/lib/auth/guards';
import { Card } from '@/components/Card';
import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { Plus, ListTodo, ShieldAlert, ArrowRight, ShieldCheck, Send, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { getDb, agendas, agendaTargets } from '@novarion/db';
import { eq, desc } from 'drizzle-orm';
import { formatWIBShort, formatWIB } from '@novarion/shared';
import { getStudentAcademicScope } from '@/lib/academics/scoping';
import { hasPermission } from '@/lib/auth/permissions';

export default async function AgendasListPage() {
  const user = await requireAuth();
  const db = getDb();

  const [studentScope, canPublishOfficial, allAgendas] = await Promise.all([
    getStudentAcademicScope(user.id),
    hasPermission(user, 'agenda.create'),
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
      .where(eq(agendas.status, 'published'))
      .orderBy(desc(agendas.deadline)),
  ]);

  // Filter agendas strictly by student academic scope
  const filteredAgendas = allAgendas.filter((agenda) => {
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

  return (
    <div className="flex flex-col gap-6">
      {user.role === 'admin' && (
        <div className="p-4 rounded-xl bg-teal-deep/10 border border-teal-deep/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 text-teal-deep">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>
              Anda login sebagai Administrator. Untuk menambah, menyunting, atau menghapus agenda resmi secara langsung, buka workspace admin.
            </span>
          </div>
          <Link href="/admin/agendas" className="shrink-0">
            <Button variant="primary" size="sm" className="gap-1.5 text-xs">
              <span>Buka Kelola Agenda Admin</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-extrabold text-2xl text-text-primary tracking-tight">
            Daftar Agenda Akademik
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Agenda perkuliahan resmi sesuai kurikulum, kelas paralel, dan kelompok praktikum Anda.
          </p>
        </div>

        <Link href="/app/agendas/new">
          <Button variant="primary" size="sm" className="gap-1.5">
            {canPublishOfficial ? (
              <>
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Buat Agenda Resmi</span>
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>Ajukan Agenda</span>
              </>
            )}
          </Button>
        </Link>
      </div>

      <Card className="p-0 overflow-hidden flex flex-col">
        <div className="p-4 bg-surface-soft border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ListTodo className="w-4 h-4 text-teal-deep" />
            <span className="text-xs font-bold text-text-primary">Agenda Terpublikasi</span>
          </div>
          <Badge variant="primary" size="sm">{filteredAgendas.length} Agenda Terkait</Badge>
        </div>

        {filteredAgendas.length === 0 ? (
          <div className="p-12 text-center text-xs text-text-muted">
            Belum ada agenda terpublikasi yang relevan dengan kelas dan kelompok Anda.
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filteredAgendas.map((item) => (
              <div
                key={item.id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-surface-soft/40 transition-colors"
                style={item.color ? { borderLeft: `4px solid ${item.color}` } : undefined}
              >
                <div className="flex flex-col gap-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Badge variant="primary" size="sm">{item.category}</Badge>
                    <span className="text-[11px] text-text-muted capitalize">• Cakupan {item.scope}</span>
                  </div>
                  <h3 className="font-heading font-bold text-sm text-text-primary">
                    {item.title}
                  </h3>
                  {item.description && (
                    <p className="text-xs text-text-muted line-clamp-1">{item.description}</p>
                  )}
                  <p className="text-xs font-semibold text-[#9E5507]">
                    Batas: {item.deadline ? formatWIB(item.deadline) : 'Tidak ada deadline'}
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
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
