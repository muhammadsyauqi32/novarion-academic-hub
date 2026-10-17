import React from 'react';
import { requireAuth } from '@/lib/auth/guards';
import { getDb, agendas, personalTasks, courses, agendaTargets } from '@novarion/db';
import { eq, desc, and } from 'drizzle-orm';
import { InteractiveCalendar, CalendarEvent } from './InteractiveCalendar';
import { getStudentAcademicScope } from '@/lib/academics/scoping';
import { hasPermission } from '@/lib/auth/permissions';

export default async function CalendarPage() {
  const user = await requireAuth();
  const db = getDb();

  const [studentScope, canCreateOfficial, allAgendas, userPersonalTasks, proposals, allCourses] = await Promise.all([
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
        sourceReference: agendas.sourceReference,
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

    db
      .select({
        id: personalTasks.id,
        title: personalTasks.title,
        description: personalTasks.description,
        startTime: personalTasks.startTime,
        deadline: personalTasks.deadline,
        color: personalTasks.color,
        status: personalTasks.status,
      })
      .from(personalTasks)
      .where(eq(personalTasks.profileId, user.id))
      .orderBy(desc(personalTasks.deadline)),

    user.role === 'admin'
      ? db
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
            sourceReference: agendas.sourceReference,
            status: agendas.status,
            createdBy: agendas.createdBy,
            courseId: agendaTargets.courseId,
            classSectionId: agendaTargets.classSectionId,
            studyGroupId: agendaTargets.studyGroupId,
          })
          .from(agendas)
          .leftJoin(agendaTargets, eq(agendas.id, agendaTargets.agendaId))
          .where(eq(agendas.status, 'pending'))
          .orderBy(desc(agendas.createdAt))
      : db
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
            sourceReference: agendas.sourceReference,
            status: agendas.status,
            createdBy: agendas.createdBy,
            courseId: agendaTargets.courseId,
            classSectionId: agendaTargets.classSectionId,
            studyGroupId: agendaTargets.studyGroupId,
          })
          .from(agendas)
          .leftJoin(agendaTargets, eq(agendas.id, agendaTargets.agendaId))
          .where(and(eq(agendas.createdBy, user.id), eq(agendas.status, 'pending')))
          .orderBy(desc(agendas.createdAt)),

    db
      .select({
        id: courses.id,
        code: courses.code,
        name: courses.name,
      })
      .from(courses),
  ]);

  // Filter agendas strictly based on student enrollment targeting
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
    // Jika tidak ada target spesifik terpasang, anggap berlaku umum
    return !agenda.courseId && !agenda.classSectionId && !agenda.studyGroupId;
  });

  const serializedEvents: CalendarEvent[] = [
    ...filteredAgendas.map((item) => ({
      id: item.id,
      title: item.title,
      description: item.description,
      category: item.category,
      scope: item.scope,
      startTime: item.startTime ? item.startTime.toISOString() : null,
      deadline: item.deadline ? item.deadline.toISOString() : null,
      color: item.color || '#41C2A1',
      courseId: item.courseId || null,
      locationOrLink: item.locationOrLink,
      sourceReference: item.sourceReference,
      status: item.status,
      eventType: 'official' as const,
      isOwner: item.createdBy === user.id,
    })),
    ...userPersonalTasks.map((item) => ({
      id: item.id,
      title: item.title,
      description: item.description,
      category: 'pribadi',
      scope: 'pribadi',
      startTime: item.startTime ? item.startTime.toISOString() : null,
      deadline: item.deadline ? item.deadline.toISOString() : null,
      color: item.color || '#3B82F6',
      courseId: null,
      locationOrLink: null,
      sourceReference: null,
      status: item.status,
      eventType: 'personal' as const,
      isOwner: true,
    })),
    ...proposals.map((item) => ({
      id: item.id,
      title: item.title,
      description: item.description,
      category: item.category,
      scope: item.scope,
      startTime: item.startTime ? item.startTime.toISOString() : null,
      deadline: item.deadline ? item.deadline.toISOString() : null,
      color: item.color || '#FFAE5D',
      courseId: item.courseId || null,
      locationOrLink: item.locationOrLink,
      sourceReference: item.sourceReference,
      status: 'pending',
      eventType: 'proposal' as const,
      isOwner: item.createdBy === user.id,
    })),
  ];

  return (
    <InteractiveCalendar
      initialEvents={serializedEvents}
      userRole={user.role}
      userId={user.id}
      canCreateOfficialAgenda={canCreateOfficial || user.role === 'admin'}
      courses={allCourses}
    />
  );
}
