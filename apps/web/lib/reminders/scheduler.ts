import { getDb, reminderJobs, messagingChannels, channelRoutes, agendas } from '@novarion/db';
import { computeReminderTriggers } from '@novarion/shared';
import { eq, and, or, inArray } from 'drizzle-orm';

/**
 * Menyinkronkan antrean reminder jobs WhatsApp untuk agenda tertentu.
 * Menjamin:
 * 1. Tidak ada pekerjaan duplikat.
 * 2. Perubahan jadwal/deadline otomatis menjadwalkan ulang (reschedule) pemicu masa depan.
 * 3. Pembatalan agenda langsung membatalkan antrean jobs yang belum terkirim.
 */
export async function syncReminderJobsForAgenda(params: {
  agendaId: string;
  deadline: Date | null;
  status: string; // 'pending' | 'published' | 'rejected' | 'cancelled'
  scope?: string;
  courseId?: string | null;
  classSectionId?: string | null;
  studyGroupId?: string | null;
}) {
  const db = getDb();
  const { agendaId, deadline, status, scope, courseId, classSectionId, studyGroupId } = params;

  try {
    // 1. Batalkan semua job berstatus 'queued' yang belum dieksekusi untuk agenda ini
    await db
      .update(reminderJobs)
      .set({
        status: 'cancelled',
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(reminderJobs.agendaId, agendaId),
          eq(reminderJobs.status, 'queued')
        )
      );

    // 2. Jika status bukan 'published' atau tidak ada deadline, tidak ada reminder baru yang dijadwalkan
    if (status !== 'published' || !deadline) {
      return { success: true, count: 0 };
    }

    // 3. Cari channel WhatsApp yang sesuai berdasarkan cakupan sasaran (scope)
    let targetChannelId: string | null = null;

    if (scope && (courseId || classSectionId || studyGroupId)) {
      const routes = await db
        .select({ channelId: channelRoutes.channelId })
        .from(channelRoutes)
        .where(
          and(
            eq(channelRoutes.isActive, true),
            or(
              courseId ? eq(channelRoutes.courseId, courseId) : undefined,
              classSectionId ? eq(channelRoutes.classSectionId, classSectionId) : undefined,
              studyGroupId ? eq(channelRoutes.studyGroupId, studyGroupId) : undefined
            )
          )
        )
        .limit(1);

      if (routes.length > 0) {
        targetChannelId = routes[0].channelId;
      }
    }

    // Jika belum ada mapping spesifik, gunakan channel aktif utama (grup angkatan)
    if (!targetChannelId) {
      const defaultChannels = await db
        .select({ id: messagingChannels.id })
        .from(messagingChannels)
        .where(eq(messagingChannels.isActive, true))
        .limit(1);

      if (defaultChannels.length > 0) {
        targetChannelId = defaultChannels[0].id;
      }
    }

    if (!targetChannelId) {
      console.warn(`[syncReminderJobsForAgenda] Tidak ada channel WhatsApp aktif untuk agenda ${agendaId}.`);
      return { success: true, count: 0 };
    }

    // 4. Hitung 4 pemicu wajib (H-7, H-3, H-1, T-3 Jam) berdasarkan waktu Indonesia/Jakarta (WIB)
    const triggers = computeReminderTriggers(deadline, new Date());

    let insertedCount = 0;
    for (const trig of triggers) {
      await db.insert(reminderJobs).values({
        agendaId,
        channelId: targetChannelId,
        triggerType: trig.triggerType,
        scheduledFor: trig.scheduledFor,
        status: 'queued',
      });
      insertedCount++;
    }

    return { success: true, count: insertedCount };
  } catch (err) {
    console.error('[syncReminderJobsForAgenda] Error syncing reminders:', err);
    return { success: false, error: String(err) };
  }
}
