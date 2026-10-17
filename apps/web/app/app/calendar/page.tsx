import React from 'react';
import { requireAuth } from '@/lib/auth/guards';
import { getDb, agendas } from '@novarion/db';
import { eq, desc } from 'drizzle-orm';
import { InteractiveCalendar, CalendarEvent } from './InteractiveCalendar';

export default async function CalendarPage() {
  const user = await requireAuth();
  const db = getDb();

  const allAgendas = await db
    .select({
      id: agendas.id,
      title: agendas.title,
      description: agendas.description,
      category: agendas.category,
      scope: agendas.scope,
      deadline: agendas.deadline,
      locationOrLink: agendas.locationOrLink,
      sourceReference: agendas.sourceReference,
      status: agendas.status,
    })
    .from(agendas)
    .where(eq(agendas.status, 'published'))
    .orderBy(desc(agendas.deadline));

  const serializedEvents: CalendarEvent[] = allAgendas.map((item) => ({
    id: item.id,
    title: item.title,
    description: item.description,
    category: item.category,
    scope: item.scope,
    deadline: item.deadline ? item.deadline.toISOString() : null,
    locationOrLink: item.locationOrLink,
    sourceReference: item.sourceReference,
    status: item.status,
  }));

  return <InteractiveCalendar initialEvents={serializedEvents} userRole={user.role} />;
}
