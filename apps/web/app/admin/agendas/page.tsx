import React from 'react';
import { requireAuth } from '@/lib/auth/guards';
import { hasPermission } from '@/lib/auth/permissions';
import { getDb, agendas } from '@novarion/db';
import { desc } from 'drizzle-orm';
import { AdminAgendasClient } from './AdminAgendasClient';
import { redirect } from 'next/navigation';

export default async function AdminAgendasPage() {
  const user = await requireAuth();

  const canManageAgenda =
    user.role === 'admin' ||
    (await hasPermission(user, 'agenda.create')) ||
    (await hasPermission(user, 'agenda.import'));

  if (!canManageAgenda) {
    redirect('/app');
  }

  const db = getDb();

  const allAgendas = await db
    .select({
      id: agendas.id,
      title: agendas.title,
      description: agendas.description,
      category: agendas.category,
      scope: agendas.scope,
      deadline: agendas.deadline,
      status: agendas.status,
      version: agendas.version,
      locationOrLink: agendas.locationOrLink,
      createdAt: agendas.createdAt,
    })
    .from(agendas)
    .orderBy(desc(agendas.createdAt));

  return <AdminAgendasClient initialAgendas={allAgendas} />;
}
