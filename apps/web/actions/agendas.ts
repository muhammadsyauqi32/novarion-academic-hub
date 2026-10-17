'use server';

import { requireAuth, requireAdmin } from '@/lib/auth/guards';
import { hasPermission, isSuperAdmin } from '@/lib/auth/permissions';
import { getDb, agendas, agendaTargets, auditLogs } from '@novarion/db';
import { agendaSubmissionSchema } from '@novarion/shared';
import { eq, and } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { syncReminderJobsForAgenda } from '@/lib/reminders/scheduler';

/**
 * Pembuatan agenda oleh Mahasiswa atau Agenda Manager.
 * CONFIRMED PRODUCT DECISION:
 * Jika user memiliki izin 'agenda.create' (Agenda Manager) atau role 'admin' (Super Admin),
 * agenda langsung berstatus 'published' dan reminder WhatsApp otomatis dijadwalkan!
 * Jika user adalah mahasiswa biasa, agenda berstatus 'pending' (proposal).
 */
export async function submitAgendaAction(formData: FormData) {
  const user = await requireAuth();
  const db = getDb();

  const deadlineRaw = formData.get('deadline');
  const deadline = deadlineRaw ? new Date(String(deadlineRaw)) : null;

  const startTimeRaw = formData.get('start_time');
  const startTime = startTimeRaw ? new Date(String(startTimeRaw)) : null;

  const courseId = String(formData.get('course_id') || '').trim() || null;
  const classSectionId = String(formData.get('class_section_id') || '').trim() || null;
  const color = String(formData.get('color') || '#41C2A1').trim();
  const externalId = String(formData.get('external_id') || '').trim() || null;

  // Validasi urutan waktu
  if (startTime && deadline && deadline.getTime() < startTime.getTime()) {
    return { success: false, error: 'Waktu tenggat (deadline) tidak boleh lebih awal dari waktu mulai.' };
  }

  const rawData = {
    title: formData.get('title'),
    description: formData.get('description') || undefined,
    category: formData.get('category'),
    scope: formData.get('scope'),
    deadline: deadline ? deadline.toISOString() : undefined,
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

  // Evaluasi wewenang Agenda Manager
  const isAuthorizedManager = await hasPermission(user, 'agenda.create', {
    courseId: courseId || undefined,
    classSectionId: classSectionId || undefined,
  });

  const status = isAuthorizedManager ? 'published' : 'pending';

  try {
    const inserted = await db
      .insert(agendas)
      .values({
        title,
        description,
        category,
        scope,
        startTime,
        deadline,
        color,
        externalId,
        locationOrLink: location_or_link,
        sourceReference: source_reference,
        createdBy: user.id,
        status,
      })
      .returning();

    const newAgenda = inserted[0];

    // Simpan relasi target scope
    if (courseId || classSectionId) {
      await db.insert(agendaTargets).values({
        agendaId: newAgenda.id,
        courseId: courseId || null,
        classSectionId: classSectionId || null,
      });
    }

    // Jika agenda langsung terbit (published), jadwalkan reminder jobs secara otomatis
    if (status === 'published') {
      await syncReminderJobsForAgenda({
        agendaId: newAgenda.id,
        deadline,
        status: 'published',
        scope,
        courseId,
        classSectionId,
      });
    }

    await db.insert(auditLogs).values({
      actorId: user.id,
      action: status === 'published' ? 'AGENDA_PUBLISHED_DIRECT' : 'AGENDA_PROPOSED',
      entityType: 'agendas',
      entityId: newAgenda.id,
      newValues: {
        title,
        category,
        scope,
        status,
        publishedImmediately: isAuthorizedManager,
        courseId,
        color,
      },
    });

    revalidatePath('/admin/agendas');
    revalidatePath('/app/agendas');
    revalidatePath('/app/calendar');
    revalidatePath('/app');

    if (formData.get('no_redirect') === 'true') {
      return { success: true, agendaId: newAgenda.id, status };
    }
  } catch (err: any) {
    return { success: false, error: err.message || String(err) };
  }

  if (isAuthorizedManager) {
    redirect('/app/calendar');
  } else {
    redirect('/app/submissions');
  }
}

/**
 * Pembuatan agenda resmi langsung oleh administrator.
 */
export async function createAdminAgendaAction(formData: FormData) {
  const admin = await requireAdmin();
  const db = getDb();

  const deadlineRaw = formData.get('deadline');
  const deadline = deadlineRaw ? new Date(String(deadlineRaw)) : null;

  const startTimeRaw = formData.get('start_time');
  const startTime = startTimeRaw ? new Date(String(startTimeRaw)) : null;

  const courseId = String(formData.get('course_id') || '').trim() || null;
  const classSectionId = String(formData.get('class_section_id') || '').trim() || null;
  const color = String(formData.get('color') || '#41C2A1').trim();
  const externalId = String(formData.get('external_id') || '').trim() || null;

  if (startTime && deadline && deadline.getTime() < startTime.getTime()) {
    return { success: false, error: 'Waktu tenggat tidak boleh lebih awal dari waktu mulai.' };
  }

  const rawData = {
    title: formData.get('title'),
    description: formData.get('description') || undefined,
    category: formData.get('category'),
    scope: formData.get('scope'),
    deadline: deadline ? deadline.toISOString() : undefined,
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
    const inserted = await db
      .insert(agendas)
      .values({
        title,
        description,
        category,
        scope,
        startTime,
        deadline,
        color,
        externalId,
        locationOrLink: location_or_link,
        sourceReference: source_reference,
        createdBy: admin.id,
        status: 'published',
      })
      .returning();

    const newAgenda = inserted[0];

    if (courseId || classSectionId) {
      await db.insert(agendaTargets).values({
        agendaId: newAgenda.id,
        courseId: courseId || null,
        classSectionId: classSectionId || null,
      });
    }

    // Jadwalkan pengingat WhatsApp
    await syncReminderJobsForAgenda({
      agendaId: newAgenda.id,
      deadline,
      status: 'published',
      scope,
      courseId,
      classSectionId,
    });

    await db.insert(auditLogs).values({
      actorId: admin.id,
      action: 'ADMIN_AGENDA_CREATED',
      entityType: 'agendas',
      entityId: newAgenda.id,
      newValues: { title, category, scope, publishedBy: admin.fullName, courseId, color },
    });

    revalidatePath('/admin/agendas');
    revalidatePath('/app/agendas');
    revalidatePath('/app/calendar');
    revalidatePath('/app');

    return { success: true, agendaId: newAgenda.id };
  } catch (err: any) {
    return { success: false, error: err.message || String(err) };
  }
}

/**
 * Menghapus atau membatalkan agenda oleh Super Admin atau pembuat yang berwenang.
 */
export async function deleteAgendaAction(agendaId: string) {
  const user = await requireAuth();
  const db = getDb();

  try {
    const existing = await db.select().from(agendas).where(eq(agendas.id, agendaId)).limit(1);
    if (existing.length === 0) {
      return { success: false, error: 'Agenda tidak ditemukan.' };
    }

    const agenda = existing[0];
    const superAdmin = await isSuperAdmin(user);
    const canCancel = await hasPermission(user, 'agenda.cancel');
    const isOwner = agenda.createdBy === user.id;

    if (!superAdmin && !canCancel && !isOwner) {
      return { success: false, error: 'Akses ditolak: Anda tidak memiliki wewenang membatalkan agenda ini.' };
    }

    // Batalkan reminder jobs
    await syncReminderJobsForAgenda({
      agendaId,
      deadline: null,
      status: 'cancelled',
    });

    await db.delete(agendas).where(eq(agendas.id, agendaId));

    await db.insert(auditLogs).values({
      actorId: user.id,
      action: 'AGENDA_DELETED',
      entityType: 'agendas',
      entityId: agendaId,
      newValues: { deletedBy: user.fullName, title: agenda.title },
    });

    revalidatePath('/admin/agendas');
    revalidatePath('/app/agendas');
    revalidatePath('/app/calendar');
    revalidatePath('/app');

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || String(err) };
  }
}

/**
 * Memperbarui agenda resmi oleh Super Admin atau Agenda Manager yang berwenang.
 */
export async function updateAdminAgendaAction(formData: FormData) {
  const user = await requireAuth();
  const db = getDb();

  const agendaId = String(formData.get('agenda_id') || '').trim();
  const title = String(formData.get('title') || '').trim();
  const description = String(formData.get('description') || '').trim() || null;
  const category = String(formData.get('category') || 'tugas').trim();
  const scope = String(formData.get('scope') || 'angkatan').trim();
  const locationOrLink = String(formData.get('location_or_link') || '').trim() || null;
  const sourceReference = String(formData.get('source_reference') || '').trim() || null;
  const courseId = String(formData.get('course_id') || '').trim() || null;
  const classSectionId = String(formData.get('class_section_id') || '').trim() || null;
  const color = String(formData.get('color') || '#41C2A1').trim();

  const deadlineRaw = formData.get('deadline');
  const deadline = deadlineRaw ? new Date(String(deadlineRaw)) : null;

  const startTimeRaw = formData.get('start_time');
  const startTime = startTimeRaw ? new Date(String(startTimeRaw)) : null;

  if (!agendaId || !title) {
    return { success: false, error: 'ID agenda dan judul wajib diisi.' };
  }

  if (startTime && deadline && deadline.getTime() < startTime.getTime()) {
    return { success: false, error: 'Waktu tenggat tidak boleh lebih awal dari waktu mulai.' };
  }

  try {
    const existing = await db.select().from(agendas).where(eq(agendas.id, agendaId)).limit(1);
    if (existing.length === 0) {
      return { success: false, error: 'Agenda tidak ditemukan.' };
    }

    const agenda = existing[0];
    const superAdmin = await isSuperAdmin(user);
    const canEdit = await hasPermission(user, 'agenda.edit', {
      courseId: courseId || undefined,
      classSectionId: classSectionId || undefined,
    });
    const isOwner = agenda.createdBy === user.id;

    if (!superAdmin && !canEdit && !isOwner) {
      return { success: false, error: 'Akses ditolak: Anda tidak memiliki hak mengedit agenda ini.' };
    }

    await db
      .update(agendas)
      .set({
        title,
        description,
        category,
        scope,
        startTime,
        deadline,
        color,
        locationOrLink,
        sourceReference,
        version: agenda.version + 1,
        updatedAt: new Date(),
      })
      .where(eq(agendas.id, agendaId));

    // Update targets
    await db.delete(agendaTargets).where(eq(agendaTargets.agendaId, agendaId));
    if (courseId || classSectionId) {
      await db.insert(agendaTargets).values({
        agendaId,
        courseId: courseId || null,
        classSectionId: classSectionId || null,
      });
    }

    // Jadwalkan ulang (reschedule) reminder jobs dengan deadline dan scope baru
    if (agenda.status === 'published') {
      await syncReminderJobsForAgenda({
        agendaId,
        deadline,
        status: 'published',
        scope,
        courseId,
        classSectionId,
      });
    }

    await db.insert(auditLogs).values({
      actorId: user.id,
      action: 'AGENDA_UPDATED',
      entityType: 'agendas',
      entityId: agendaId,
      newValues: { title, category, scope, updatedBy: user.fullName, courseId, color },
    });

    revalidatePath('/admin/agendas');
    revalidatePath('/app/agendas');
    revalidatePath('/app/calendar');
    revalidatePath('/app');

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || String(err) };
  }
}
