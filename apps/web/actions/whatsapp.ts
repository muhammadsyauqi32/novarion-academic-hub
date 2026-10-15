'use server';

import { requireAdmin } from '@/lib/auth/guards';
import { getDb, whatsappConnections, auditLogs, messagingChannels } from '@novarion/db';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function toggleKillSwitchAction(currentPausedState: boolean) {
  const admin = await requireAdmin();
  const db = getDb();
  const nextState = !currentPausedState;

  try {
    const existing = await db.select().from(whatsappConnections).limit(1);
    if (existing.length > 0) {
      await db.update(whatsappConnections).set({
        isPaused: nextState,
        updatedAt: new Date(),
      });
    } else {
      await db.insert(whatsappConnections).values({
        isPaused: nextState,
        status: 'disconnected',
      });
    }

    await db.insert(auditLogs).values({
      actorId: admin.id,
      action: nextState ? 'WHATSAPP_MESSAGING_PAUSED' : 'WHATSAPP_MESSAGING_RESUMED',
      entityType: 'whatsapp_connections',
      newValues: { isPaused: nextState },
    });

    revalidatePath('/admin/whatsapp');
    return { success: true, isPaused: nextState };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}
