import React from 'react';
import { requireAdmin } from '@/lib/auth/guards';
import { getDb, agendas } from '@novarion/db';
import { desc } from 'drizzle-orm';
import { AdminAgendasClient } from './AdminAgendasClient';

export default async function AdminAgendasPage() {
  await requireAdmin();
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
