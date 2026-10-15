'use server';

import { requireAdmin } from '@/lib/auth/guards';
import { getDb, agendas, agendaReviews, reminderJobs, messagingChannels, auditLogs } from '@novarion/db';
import { computeReminderTriggers } from '@novarion/shared';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function approveAgendaAction(agendaId: string) {
  const admin = await requireAdmin();
  const db = getDb();

  try {
    const agendaRows = await db.select().from(agendas).where(eq(agendas.id, agendaId)).limit(1);
    if (agendaRows.length === 0) {
      return { success: false, error: 'Agenda tidak ditemukan.' };
    }

    const agenda = agendaRows[0];

    // 1. Update status agenda menjadi published
    await db
      .update(agendas)
      .set({
        status: 'published',
        version: 1,
        updatedAt: new Date(),
      })
      .where(eq(agendas.id, agendaId));

    // 2. Catat audit review
    await db.insert(agendaReviews).values({
      agendaId,
      reviewerId: admin.id,
      action: 'approved',
      notes: 'Disetujui oleh admin angkatan',
    });

    // 3. Jika agenda memiliki deadline, hitung 4 pemicu wajib (H-7, H-3, H-1, T-3 Jam)
    if (agenda.deadline) {
      const triggers = computeReminderTriggers(agenda.deadline, new Date());

      // Ambil channel WhatsApp aktif pertama (grup utama angkatan)
      const channels = await db
        .select()
        .from(messagingChannels)
        .where(eq(messagingChannels.isActive, true))
        .limit(1);

      if (channels.length > 0) {
        const channelId = channels[0].id;
        for (const trig of triggers) {
          await db.insert(reminderJobs).values({
            agendaId,
            channelId,
            triggerType: trig.triggerType,
            scheduledFor: trig.scheduledFor,
            status: 'queued',
          });
        }
      }
    }

    await db.insert(auditLogs).values({
      actorId: admin.id,
      action: 'AGENDA_APPROVED',
      entityType: 'agendas',
      entityId: agendaId,
      newValues: { status: 'published' },
    });

    revalidatePath('/admin/submissions');
    revalidatePath('/admin/agendas');
    revalidatePath('/app/agendas');
    revalidatePath('/app/calendar');
    return { success: true };
  } catch (err) {
    console.error('[approveAgendaAction] Error:', err);
    return { success: false, error: String(err) };
  }
}

export async function rejectAgendaAction(formData: FormData) {
  const admin = await requireAdmin();
  const db = getDb();

  const agendaId = String(formData.get('agenda_id'));
  const notes = String(formData.get('notes') || '').trim();

  if (!notes) {
    return { success: false, error: 'Alasan penolakan wajib disertakan.' };
  }

  try {
    await db
      .update(agendas)
      .set({
        status: 'rejected',
        updatedAt: new Date(),
      })
      .where(eq(agendas.id, agendaId));

    await db.insert(agendaReviews).values({
      agendaId,
      reviewerId: admin.id,
      action: 'rejected',
      notes,
    });

    await db.insert(auditLogs).values({
      actorId: admin.id,
      action: 'AGENDA_REJECTED',
      entityType: 'agendas',
      entityId: agendaId,
      newValues: { status: 'rejected', notes },
    });

    revalidatePath('/admin/submissions');
    return { success: true };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}
