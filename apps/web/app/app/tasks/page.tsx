import React from 'react';
import { requireAuth } from '@/lib/auth/guards';
import { getDb, personalTasks } from '@novarion/db';
import { eq, desc } from 'drizzle-orm';
import { TaskManagerClient } from '@/components/hub/TaskManagerClient';

export default async function TasksPage() {
  const user = await requireAuth();
  const db = getDb();

  const tasks = await db
    .select({
      id: personalTasks.id,
      title: personalTasks.title,
      description: personalTasks.description,
      deadline: personalTasks.deadline,
      startTime: personalTasks.startTime,
      color: personalTasks.color,
      status: personalTasks.status,
      completedAt: personalTasks.completedAt,
      createdAt: personalTasks.createdAt,
    })
    .from(personalTasks)
    .where(eq(personalTasks.profileId, user.id))
    .orderBy(desc(personalTasks.createdAt))
    .limit(100);

  return <TaskManagerClient initialTasks={tasks} />;
}
