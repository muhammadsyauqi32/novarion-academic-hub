import React from 'react';
import { requireAuth } from '@/lib/auth/guards';
import { getDb, agendas, personalTasks, courses, agendaTargets } from '@novarion/db';
import { eq, desc, and } from 'drizzle-orm';
import { InteractiveCalendar, CalendarEvent } from './InteractiveCalendar';

export default async function CalendarPage() {
  const user = await requireAuth();
  const db = getDb();

  const [allAgendas, userPersonalTasks, proposals, allCourses] = await Promise.all([
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
        createdBy: agendas.createdBy,
        courseId: agendaTargets.courseId,
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
        deadline: personalTasks.deadline,
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
            locationOrLink: agendas.locationOrLink,
            sourceReference: agendas.sourceReference,
            status: agendas.status,
            createdBy: agendas.createdBy,
            courseId: agendaTargets.courseId,
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
            locationOrLink: agendas.locationOrLink,
            sourceReference: agendas.sourceReference,
            status: agendas.status,
            createdBy: agendas.createdBy,
            courseId: agendaTargets.courseId,
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

  const serializedEvents: CalendarEvent[] = [
    ...allAgendas.map((item) => ({
      id: item.id,
      title: item.title,
      description: item.description,
      category: item.category,
      scope: item.scope,
      startTime: item.startTime ? item.startTime.toISOString() : null,
      deadline: item.deadline ? item.deadline.toISOString() : null,
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
      startTime: null,
      deadline: item.deadline ? item.deadline.toISOString() : null,
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
      courses={allCourses}
    />
  );
}

