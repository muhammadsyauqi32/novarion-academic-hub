import { getDb, reminderJobs, reminderDeliveryAttempts, agendas, messagingChannels, whatsappConnections } from '@novarion/db';
import { eq, and, lte, sql } from 'drizzle-orm';
import { MessagingProvider } from '../providers/types.js';
import { formatWIB } from '@novarion/shared';

export class ReminderJobRunner {
  private provider: MessagingProvider;
  private workerId: string;
  private pollIntervalMs: number;
  private isRunning = false;
  private timer: NodeJS.Timeout | null = null;

  constructor(provider: MessagingProvider, workerId: string, pollIntervalMs = 30000) {
    this.provider = provider;
    this.workerId = workerId;
    this.pollIntervalMs = pollIntervalMs;
  }

  start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    console.log(`[JobRunner] Engine dimulai. Polling setiap ${this.pollIntervalMs}ms (Worker ID: ${this.workerId})`);
    this.scheduleNextTick();
  }

  stop(): void {
    this.isRunning = false;
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    console.log('[JobRunner] Engine dihentikan.');
  }

  private scheduleNextTick(): void {
    if (!this.isRunning) return;
    this.timer = setTimeout(async () => {
      try {
        await this.processPendingJobs();
      } catch (err) {
        console.error('[JobRunner] Error pada loop pemrosesan job:', err);
      } finally {
        this.scheduleNextTick();
      }
    }, this.pollIntervalMs);
  }

  public async processPendingJobs(): Promise<number> {
    const db = getDb();

    // 1. Cek Emergency Kill Switch
    const connState = await db.select({ isPaused: whatsappConnections.isPaused }).from(whatsappConnections).limit(1);
    if (connState.length > 0 && connState[0].isPaused) {
      console.log('[JobRunner] ⏸️ Emergency Kill Switch AKTIF. Seluruh pengiriman dijeda.');
      return 0;
    }

    // 2. Ambil job yang siap dieksekusi menggunakan lock FOR UPDATE SKIP LOCKED
    const now = new Date();
    const candidateJobs = await db.transaction(async (tx) => {
      const rows = await tx
        .select()
        .from(reminderJobs)
        .where(
          and(
            eq(reminderJobs.status, 'queued'),
            lte(reminderJobs.scheduledFor, now)
          )
        )
        .orderBy(reminderJobs.scheduledFor)
        .limit(10)
        .for('update', { skipLocked: true });

      if (rows.length === 0) return [];

      const jobIds = rows.map((r) => r.id);
      // Kunci job dengan lease 5 menit
      const leaseExpiry = new Date(Date.now() + 5 * 60 * 1000);
      await tx
        .update(reminderJobs)
        .set({
          status: 'processing',
          lockedUntil: leaseExpiry,
          lockedBy: this.workerId,
          updatedAt: new Date(),
        })
        .where(sql`${reminderJobs.id} IN ${jobIds}`);

      return rows;
    });

    if (candidateJobs.length === 0) {
      return 0;
    }

    console.log(`[JobRunner] Memproses ${candidateJobs.length} reminder job...`);

    for (const job of candidateJobs) {
      await this.executeJob(job);
    }

    return candidateJobs.length;
  }

  private async executeJob(job: typeof reminderJobs.$inferSelect): Promise<void> {
    const db = getDb();

    try {
      // 1. Ambil detail agenda dan channel tujuan
      const agendaRows = await db.select().from(agendas).where(eq(agendas.id, job.agendaId)).limit(1);
      const channelRows = await db.select().from(messagingChannels).where(eq(messagingChannels.id, job.channelId)).limit(1);

      if (agendaRows.length === 0 || channelRows.length === 0) {
        await db
          .update(reminderJobs)
          .set({ status: 'cancelled', lastError: 'Agenda atau channel tujuan tidak ditemukan.', updatedAt: new Date() })
          .where(eq(reminderJobs.id, job.id));
        return;
      }

      const agenda = agendaRows[0];
      const channel = channelRows[0];

      // 2. Cek apakah agenda masih published dan belum dibatalkan
      if (agenda.status !== 'published') {
        console.log(`[JobRunner] Agenda #${agenda.id} berstatus '${agenda.status}'. Membatalkan reminder job.`);
        await db
          .update(reminderJobs)
          .set({ status: 'cancelled', lastError: `Agenda berstatus '${agenda.status}'`, updatedAt: new Date() })
          .where(eq(reminderJobs.id, job.id));
        return;
      }

      // 3. Susun teks pesan reminder
      const triggerLabel = this.getTriggerLabel(job.triggerType);
      const deadlineText = agenda.deadline ? formatWIB(agenda.deadline) : '-';
      const webBaseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://novarion.hub';

      const messageText = [
        '📚 *NOVARION — PENGINGAT AKADEMIK*',
        `[${triggerLabel}]`,
        '',
        `*Agenda:* ${agenda.title}`,
        `*Kategori:* ${agenda.category.toUpperCase()}`,
        `*Batas Waktu:* ${deadlineText}`,
        agenda.description ? `*Keterangan:* ${agenda.description}` : null,
        '',
        `*Detail & Instruksi:*`,
        `${webBaseUrl}/app/agendas/${agenda.id}`,
        '',
        'Semangat menyelesaikan sebelum batas waktu! 🚀',
      ]
        .filter(Boolean)
        .join('\n');

      // 4. Kirim pesan ke WhatsApp Provider
      const result = await this.provider.sendMessage(channel.jid, messageText);

      // 5. Catat log pengiriman di reminder_delivery_attempts
      await db.insert(reminderDeliveryAttempts).values({
        jobId: job.id,
        provider: this.provider.name,
        providerMessageId: result.providerMessageId,
        status: result.status,
        responsePayload: result.rawResponse ? JSON.stringify(result.rawResponse) : null,
        errorMessage: result.error,
      });

      // 6. Update status akhir job
      if (result.status === 'submitted') {
        await db
          .update(reminderJobs)
          .set({
            status: 'submitted',
            attemptCount: job.attemptCount + 1,
            lockedUntil: null,
            lockedBy: null,
            lastError: null,
            updatedAt: new Date(),
          })
          .where(eq(reminderJobs.id, job.id));
        console.log(`[JobRunner] ✅ Reminder #${job.id} berhasil dikirim ke ${channel.name} (${channel.jid})`);
      } else if (result.status === 'unknown') {
        // Status ambigu, jangan auto-retry buta
        await db
          .update(reminderJobs)
          .set({
            status: 'unknown',
            attemptCount: job.attemptCount + 1,
            lockedUntil: null,
            lockedBy: null,
            lastError: result.error,
            updatedAt: new Date(),
          })
          .where(eq(reminderJobs.id, job.id));
        console.warn(`[JobRunner] ⚠️ Reminder #${job.id} outcome ambigu: ${result.error}`);
      } else {
        // Status failed: exponential backoff jika percobaan < 3
        const nextAttempt = job.attemptCount + 1;
        if (nextAttempt < 3) {
          const backoffMinutes = Math.pow(2, nextAttempt); // 2 menit, 4 menit
          const retryTime = new Date(Date.now() + backoffMinutes * 60 * 1000);

          await db
            .update(reminderJobs)
            .set({
              status: 'queued',
              attemptCount: nextAttempt,
              scheduledFor: retryTime,
              lockedUntil: null,
              lockedBy: null,
              lastError: result.error,
              updatedAt: new Date(),
            })
            .where(eq(reminderJobs.id, job.id));
          console.log(`[JobRunner] 🔁 Reminder #${job.id} dijadwalkan ulang pada ${retryTime.toISOString()} (${result.error})`);
        } else {
          await db
            .update(reminderJobs)
            .set({
              status: 'failed',
              attemptCount: nextAttempt,
              lockedUntil: null,
              lockedBy: null,
              lastError: `Gagal setelah 3 percobaan: ${result.error}`,
              updatedAt: new Date(),
            })
            .where(eq(reminderJobs.id, job.id));
          console.error(`[JobRunner] ❌ Reminder #${job.id} gagal permanen: ${result.error}`);
        }
      }
    } catch (err) {
      console.error(`[JobRunner] Kesalahan saat memproses job #${job.id}:`, err);
      await db
        .update(reminderJobs)
        .set({
          status: 'failed',
          lastError: String(err),
          lockedUntil: null,
          lockedBy: null,
          updatedAt: new Date(),
        })
        .where(eq(reminderJobs.id, job.id));
    }
  }

  private getTriggerLabel(type: string): string {
    switch (type) {
      case 'h_7':
        return 'H-7 | DEADLINE 7 HARI LAGI';
      case 'h_3':
        return 'H-3 | DEADLINE 3 HARI LAGI';
      case 'h_1':
        return 'H-1 | DEADLINE BESOK';
      case 't_minus_3h':
        return '3 JAM LAGI | DEADLINE SEGERA BERAKHIR';
      default:
        return 'PENGINGAT DEADLINE';
    }
  }
}
