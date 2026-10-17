'use server';

import { requireAuth, requireAdmin } from '@/lib/auth/guards';
import { getDb, agendas, agendaTargets, auditLogs } from '@novarion/db';
import { agendaSubmissionSchema } from '@novarion/shared';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function submitAgendaAction(formData: FormData) {
  const user = await requireAuth();
  const db = getDb();

  const deadlineRaw = formData.get('deadline');
  const deadline = deadlineRaw ? new Date(String(deadlineRaw)).toISOString() : null;

  const startTimeRaw = formData.get('start_time');
  const startTime = startTimeRaw ? new Date(String(startTimeRaw)) : null;

  const courseId = String(formData.get('course_id') || '').trim() || null;

  const rawData = {
    title: formData.get('title'),
    description: formData.get('description') || undefined,
    category: formData.get('category'),
    scope: formData.get('scope'),
    deadline: deadline || undefined,
    location_or_link: formData.get('location_or_link') || undefined,
    source_reference: formData.get('source_reference') || undefined,
  };

  const parsed = agendaSubmissionSchema.safeParse(rawData);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors.map((e) => e.message).join(', '),
    };
  }

  const { title, description, category, scope, location_or_link, source_reference } = parsed.data;

  try {
    const inserted = await db.insert(agendas).values({
      title,
      description,
      category,
      scope,
      startTime,
      deadline: deadline ? new Date(deadline) : null,
      locationOrLink: location_or_link,
      sourceReference: source_reference,
      createdBy: user.id,
      status: 'pending', // Wajib pending jika diajukan mahasiswa
    }).returning();

    if (courseId && scope === 'mata_kuliah') {
      await db.insert(agendaTargets).values({
        agendaId: inserted[0].id,
        courseId,
      });
    }

    await db.insert(auditLogs).values({
      actorId: user.id,
      action: 'AGENDA_PROPOSED',
      entityType: 'agendas',
      entityId: inserted[0].id,
      newValues: { title, category, scope, courseId },
    });

    revalidatePath('/app/submissions');
    revalidatePath('/app/agendas');
    revalidatePath('/app/calendar');
    revalidatePath('/app');

    if (formData.get('no_redirect') === 'true') {
      return { success: true, agendaId: inserted[0].id };
    }
  } catch (err) {
    return { success: false, error: String(err) };
  }

  redirect('/app/submissions');
}

/**
 * Pembuatan agenda resmi langsung oleh administrator.
 * Status langsung 'published' tanpa melalui antrean moderasi mahasiswa.
 * Tetap berada dalam workspace admin (/admin/agendas).
 */
export async function createAdminAgendaAction(formData: FormData) {
  const admin = await requireAdmin();
  const db = getDb();

  const deadlineRaw = formData.get('deadline');
  const deadline = deadlineRaw ? new Date(String(deadlineRaw)).toISOString() : null;

  const startTimeRaw = formData.get('start_time');
  const startTime = startTimeRaw ? new Date(String(startTimeRaw)) : null;

  const courseId = String(formData.get('course_id') || '').trim() || null;

  const rawData = {
    title: formData.get('title'),
    description: formData.get('description') || undefined,
    category: formData.get('category'),
    scope: formData.get('scope'),
    deadline: deadline || undefined,
    location_or_link: formData.get('location_or_link') || undefined,
    source_reference: formData.get('source_reference') || undefined,
  };

  const parsed = agendaSubmissionSchema.safeParse(rawData);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors.map((e) => e.message).join(', '),
    };
  }

  const { title, description, category, scope, location_or_link, source_reference } = parsed.data;

  try {
    const inserted = await db.insert(agendas).values({
      title,
      description,
      category,
      scope,
      startTime,
      deadline: deadline ? new Date(deadline) : null,
      locationOrLink: location_or_link,
      sourceReference: source_reference,
      createdBy: admin.id,
      status: 'published', // Langsung publish oleh admin
    }).returning();

    if (courseId && scope === 'mata_kuliah') {
      await db.insert(agendaTargets).values({
        agendaId: inserted[0].id,
        courseId,
      });
    }

    await db.insert(auditLogs).values({
      actorId: admin.id,
      action: 'ADMIN_AGENDA_CREATED',
      entityType: 'agendas',
      entityId: inserted[0].id,
      newValues: { title, category, scope, publishedBy: admin.fullName, courseId },
    });

    revalidatePath('/admin/agendas');
    revalidatePath('/app/agendas');
    revalidatePath('/app/calendar');
    revalidatePath('/app');

    return { success: true, agendaId: inserted[0].id };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}

/**
 * Menghapus atau membatalkan agenda oleh administrator.
 */
export async function deleteAgendaAction(agendaId: string) {
  const admin = await requireAdmin();
  const db = getDb();

  try {
    await db.delete(agendas).where(eq(agendas.id, agendaId));

    await db.insert(auditLogs).values({
      actorId: admin.id,
      action: 'ADMIN_AGENDA_DELETED',
      entityType: 'agendas',
      entityId: agendaId,
      newValues: { deletedBy: admin.fullName },
    });

    revalidatePath('/admin/agendas');
    revalidatePath('/app/agendas');
    revalidatePath('/app/calendar');
    revalidatePath('/app');

    return { success: true };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}

/**
 * Memperbarui agenda resmi oleh administrator.
 */
export async function updateAdminAgendaAction(formData: FormData) {
  const admin = await requireAdmin();
  const db = getDb();

  const agendaId = String(formData.get('agenda_id') || '').trim();
  const title = String(formData.get('title') || '').trim();
  const description = String(formData.get('description') || '').trim() || null;
  const category = String(formData.get('category') || 'tugas').trim();
  const scope = String(formData.get('scope') || 'angkatan').trim();
  const locationOrLink = String(formData.get('location_or_link') || '').trim() || null;
  const sourceReference = String(formData.get('source_reference') || '').trim() || null;
  const courseId = String(formData.get('course_id') || '').trim() || null;

  const deadlineRaw = formData.get('deadline');
  const deadline = deadlineRaw ? new Date(String(deadlineRaw)) : null;

  const startTimeRaw = formData.get('start_time');
  const startTime = startTimeRaw ? new Date(String(startTimeRaw)) : null;

  if (!agendaId || !title) {
    return { success: false, error: 'ID agenda dan judul wajib diisi.' };
  }

  try {
    await db
      .update(agendas)
      .set({
        title,
        description,
        category,
        scope,
        startTime,
        deadline,
        locationOrLink,
        sourceReference,
        updatedAt: new Date(),
      })
      .where(eq(agendas.id, agendaId));

    // Update or insert course target if scope is mata_kuliah
    if (scope === 'mata_kuliah' && courseId) {
      await db.delete(agendaTargets).where(eq(agendaTargets.agendaId, agendaId));
      await db.insert(agendaTargets).values({
        agendaId,
        courseId,
      });
    }

    await db.insert(auditLogs).values({
      actorId: admin.id,
      action: 'ADMIN_AGENDA_UPDATED',
      entityType: 'agendas',
      entityId: agendaId,
      newValues: { title, category, scope, updatedBy: admin.fullName, courseId },
    });

    revalidatePath('/admin/agendas');
    revalidatePath('/app/agendas');
    revalidatePath('/app/calendar');
    revalidatePath('/app');

    return { success: true };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}

