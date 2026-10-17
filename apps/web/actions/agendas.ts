'use server';

import { requireAuth, requireAdmin } from '@/lib/auth/guards';
import { getDb, agendas, auditLogs } from '@novarion/db';
import { agendaSubmissionSchema } from '@novarion/shared';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function submitAgendaAction(formData: FormData) {
  const user = await requireAuth();
  const db = getDb();

  const deadlineRaw = formData.get('deadline');
  const deadline = deadlineRaw ? new Date(String(deadlineRaw)).toISOString() : null;

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
      deadline: deadline ? new Date(deadline) : null,
      locationOrLink: location_or_link,
      sourceReference: source_reference,
      createdBy: user.id,
      status: 'pending', // Wajib pending jika diajukan mahasiswa
    }).returning();

    await db.insert(auditLogs).values({
      actorId: user.id,
      action: 'AGENDA_PROPOSED',
      entityType: 'agendas',
      entityId: inserted[0].id,
      newValues: { title, category, scope },
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
      deadline: deadline ? new Date(deadline) : null,
      locationOrLink: location_or_link,
      sourceReference: source_reference,
      createdBy: admin.id,
      status: 'published', // Langsung publish oleh admin
    }).returning();

    await db.insert(auditLogs).values({
      actorId: admin.id,
      action: 'ADMIN_AGENDA_CREATED',
      entityType: 'agendas',
      entityId: inserted[0].id,
      newValues: { title, category, scope, publishedBy: admin.fullName },
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
