import React from 'react';
import Link from 'next/link';
import { requireAuth } from '@/lib/auth/guards';
import { getDb, academicTerms, agendas, personalTasks } from '@novarion/db';
import { eq, and, gte, desc, lte } from 'drizzle-orm';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';
import { formatWIBShort } from '@novarion/shared';
import { 
  Calendar as CalendarIcon, 
  CheckCircle2, 
  Clock, 
  Plus, 
  ArrowRight, 
  Send, 
  BookOpen
} from 'lucide-react';

export default async function StudentDashboardPage() {
  const user = await requireAuth();
  const db = getDb();

  // 1. Ambil Semester Aktif
  const activeTerms = await db
    .select()
    .from(academicTerms)
    .where(eq(academicTerms.isActive, true))
    .limit(1);
  const activeTerm = activeTerms[0] || null;

  // 2. Ambil Agenda Mendatang (Published)
  const now = new Date();
  const upcomingAgendas = await db
    .select()
    .from(agendas)
    .where(
      and(
        eq(agendas.status, 'published'),
        gte(agendas.deadline, now)
      )
    )
    .orderBy(agendas.deadline)
    .limit(5);

  // 3. Ambil Tugas Pribadi (Todo & Done)
  const userTasks = await db
    .select()
    .from(personalTasks)
    .where(eq(personalTasks.profileId, user.id))
    .orderBy(desc(personalTasks.createdAt))
    .limit(5);

  const completedTasksCount = userTasks.filter((t) => t.status === 'done').length;

  return (
    <div className="flex flex-col gap-6">
      {/* Sapaan & Info Semester */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-text-primary tracking-tight">
            Halo, {user.fullName.split(' ')[0]} 👋
          </h1>
          <p className="text-xs sm:text-sm text-text-muted mt-1">
            {activeTerm ? activeTerm.name : 'Semester Aktif Belum Diatur'} • NIM: {user.nim}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/app/agendas/new">
            <Button variant="primary" size="sm">
              <Send className="w-3.5 h-3.5 mr-1" />
              <span>Ajukan Agenda</span>
            </Button>
          </Link>
          <Link href="/app/tasks">
            <Button variant="secondary" size="sm">
              <Plus className="w-3.5 h-3.5 mr-1" />
              <span>Tambah Tugas</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Ringkasan Statistik Faktual */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card variant="mint" className="p-4 sm:p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-text-muted">Deadline Terdekat</p>
            <p className="text-2xl font-heading font-black text-text-primary mt-1">
              {upcomingAgendas.length}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-brand-primary/20 text-teal-deep flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </Card>

        <Card variant="soft" className="p-4 sm:p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-text-muted">Tugas Selesai</p>
            <p className="text-2xl font-heading font-black text-text-primary mt-1">
              {completedTasksCount} / {userTasks.length}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-teal-deep/10 text-teal-deep flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </Card>

        <Card variant="default" className="p-4 sm:p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-text-muted">Kalender Akademik</p>
            <Link href="/app/calendar" className="text-xs font-bold text-teal-deep hover:underline mt-1 block">
              Buka Kalender →
            </Link>
          </div>
          <div className="w-10 h-10 rounded-xl bg-surface-soft text-text-muted flex items-center justify-center">
            <CalendarIcon className="w-5 h-5" />
          </div>
        </Card>
      </div>

      {/* Grid Dua Kolom: Deadline Mendatang & Tugas Saya */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Kolom Kiri: Deadline Terdekat */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="font-heading font-bold text-base text-text-primary">
              Agenda & Deadline Mendatang
            </h2>
            <Link href="/app/agendas" className="text-xs font-semibold text-teal-deep hover:underline">
              Lihat Semua
            </Link>
          </div>

          {upcomingAgendas.length === 0 ? (
            <Card className="text-center py-10 flex flex-col items-center gap-2">
              <CalendarIcon className="w-8 h-8 text-text-muted/40" />
              <p className="text-xs font-medium text-text-muted">Belum ada agenda atau deadline terdekat.</p>
            </Card>
          ) : (
            <div className="flex flex-col gap-3">
              {upcomingAgendas.map((item) => (
                <Card key={item.id} className="p-4 flex items-center justify-between gap-4 hover:border-brand-primary/40 transition-colors">
                  <div className="flex flex-col gap-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Badge variant="primary" size="sm">{item.category}</Badge>
                      <span className="text-[11px] text-text-muted capitalize">• {item.scope}</span>
                    </div>
                    <h3 className="font-heading font-bold text-sm text-text-primary truncate">
                      {item.title}
                    </h3>
                    <p className="text-xs text-text-muted">
                      Batas: {item.deadline ? formatWIBShort(item.deadline) : 'Tidak ada'}
                    </p>
                  </div>
                  <Link href={`/app/agendas/${item.id}`}>
                    <Button variant="outline" size="sm">
                      Detail
                    </Button>
                  </Link>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Kolom Kanan: Checklist Tugas Saya */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="font-heading font-bold text-base text-text-primary">
              Tugas Saya
            </h2>
            <Link href="/app/tasks" className="text-xs font-semibold text-teal-deep hover:underline">
              Kelola Tugas
            </Link>
          </div>

          <Card className="flex flex-col gap-3 p-4">
            {userTasks.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle2 className="w-8 h-8 text-text-muted/40 mx-auto mb-2" />
                <p className="text-xs text-text-muted">Belum ada tugas pribadi.</p>
                <Link href="/app/tasks" className="mt-2 inline-block">
                  <Button variant="secondary" size="sm">
                    Buat Tugas Baru
                  </Button>
                </Link>
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {userTasks.map((t) => (
                  <li key={t.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5 truncate">
                      <span className={`w-2 h-2 rounded-full ${t.status === 'done' ? 'bg-success-text' : 'bg-brand-orange'}`} />
                      <span className={`truncate ${t.status === 'done' ? 'line-through text-text-muted' : 'font-medium text-text-primary'}`}>
                        {t.title}
                      </span>
                    </div>
                    <Badge variant={t.status === 'done' ? 'success' : 'neutral'} size="sm">
                      {t.status === 'done' ? 'Selesai' : 'Belum'}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
