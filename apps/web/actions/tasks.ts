'use server';

import { requireAuth } from '@/lib/auth/guards';
import { getDb, personalTasks } from '@novarion/db';
import { eq, and } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function addPersonalTaskAction(formData: FormData) {
  const user = await requireAuth();
  const db = getDb();

  const title = String(formData.get('title') || '').trim();
  const description = String(formData.get('description') || '').trim() || null;
  const deadlineRaw = formData.get('deadline');
  const deadline = deadlineRaw ? new Date(String(deadlineRaw)) : null;
  const startTimeRaw = formData.get('start_time');
  const startTime = startTimeRaw ? new Date(String(startTimeRaw)) : null;
  const color = String(formData.get('color') || '#41C2A1').trim();

  if (!title) {
    return { success: false, error: 'Judul tugas wajib diisi.' };
  }

  if (startTime && deadline && deadline.getTime() < startTime.getTime()) {
    return { success: false, error: 'Waktu tenggat tidak boleh lebih awal dari waktu mulai.' };
  }

  try {
    const inserted = await db.insert(personalTasks).values({
      profileId: user.id,
      title,
      description,
      startTime,
      deadline,
      color,
      status: 'todo',
    }).returning();

    revalidatePath('/app/tasks');
    revalidatePath('/app/calendar');
    revalidatePath('/app');
    return { success: true, id: inserted[0]?.id };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}

export async function deletePersonalTaskAction(taskId: string) {
  const user = await requireAuth();
  const db = getDb();

  try {
    await db
      .delete(personalTasks)
      .where(
        and(
          eq(personalTasks.id, taskId),
          eq(personalTasks.profileId, user.id) // Security: Strict ownership check against IDOR
        )
      );

    revalidatePath('/app/tasks');
    revalidatePath('/app/calendar');
    revalidatePath('/app');
    return { success: true };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}

export async function toggleTaskStatusAction(taskId: string, currentStatus: string) {
  const user = await requireAuth();
  const db = getDb();
  const nextStatus = currentStatus === 'done' ? 'todo' : 'done';

  try {
    await db
      .update(personalTasks)
      .set({
        status: nextStatus,
        completedAt: nextStatus === 'done' ? new Date() : null,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(personalTasks.id, taskId),
          eq(personalTasks.profileId, user.id) // Security: Student can ONLY toggle own task
        )
      );

    revalidatePath('/app/tasks');
    revalidatePath('/app/calendar');
    revalidatePath('/app');
    return { success: true };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}

export async function updatePersonalTaskAction(formData: FormData) {
  const user = await requireAuth();
  const db = getDb();

  const taskId = String(formData.get('task_id') || '').trim();
  const title = String(formData.get('title') || '').trim();
  const description = String(formData.get('description') || '').trim() || null;
  const deadlineRaw = formData.get('deadline');
  const deadline = deadlineRaw ? new Date(String(deadlineRaw)) : null;
  const startTimeRaw = formData.get('start_time');
  const startTime = startTimeRaw ? new Date(String(startTimeRaw)) : null;
  const color = String(formData.get('color') || '#41C2A1').trim();

  if (!taskId || !title) {
    return { success: false, error: 'ID tugas dan judul wajib diisi.' };
  }

  if (startTime && deadline && deadline.getTime() < startTime.getTime()) {
    return { success: false, error: 'Waktu tenggat tidak boleh lebih awal dari waktu mulai.' };
  }

  try {
    await db
      .update(personalTasks)
      .set({
        title,
        description,
        startTime,
        deadline,
        color,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(personalTasks.id, taskId),
          eq(personalTasks.profileId, user.id) // Security: Strict ownership check against IDOR
        )
      );

    revalidatePath('/app/tasks');
    revalidatePath('/app/calendar');
    revalidatePath('/app');
    return { success: true };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}


