import { MessagingProvider, SendMessageResult, AccessibleGroup } from './types.js';
import { WAConnectionStatus } from '@novarion/shared';
import { getDb, whatsappConnections } from '@novarion/db';
import { useSqlAuthState } from '../auth/sql-auth-store.js';
import makeWASocket, {
  DisconnectReason,
  WASocket,
  fetchLatestBaileysVersion,
} from '@whiskeysockets/baileys';
import pino from 'pino';

export class BaileysMessagingProvider implements MessagingProvider {
  name = 'baileys';
  private sock: WASocket | null = null;
  private currentStatus: WAConnectionStatus = 'disconnected';
  private encryptionKeyHex: string;

  constructor(encryptionKeyHex: string) {
    this.encryptionKeyHex = encryptionKeyHex;
  }

  async initialize(): Promise<void> {
    console.log('[BaileysProvider] Memulai inisialisasi Baileys socket...');
    this.currentStatus = 'connecting';
    await this.updateConnectionDbStatus('connecting');

    const { state, saveCreds } = await useSqlAuthState(this.encryptionKeyHex);
    const { version } = await fetchLatestBaileysVersion();

    const logger = pino({ level: 'silent' });

    this.sock = makeWASocket({
      version,
      auth: state,
      logger,
      printQRInTerminal: false,
      connectTimeoutMs: 60000,
      defaultQueryTimeoutMs: 60000,
    });

    this.sock.ev.on('creds.update', saveCreds);

    this.sock.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        console.log('[BaileysProvider] QR Code baru diterima. Menyimpan ke database dengan TTL 60s...');
        const expiresAt = new Date(Date.now() + 60 * 1000);
        await this.updateTempQr(qr, expiresAt);
      }

      if (connection === 'open') {
        console.log('[BaileysProvider] ✅ Koneksi WhatsApp BERHASIL terhubung!');
        this.currentStatus = 'connected';
        await this.clearTempQr();
        await this.updateConnectionDbStatus('connected', new Date());
      } else if (connection === 'close') {
        const statusCode = (lastDisconnect?.error as { output?: { statusCode?: number } })?.output?.statusCode;
        const shouldReconnect = statusCode !== DisconnectReason.loggedOut;

        console.log(`[BaileysProvider] Koneksi tertutup. Status Code: ${statusCode}, Reconnect: ${shouldReconnect}`);

        if (statusCode === DisconnectReason.loggedOut) {
          this.currentStatus = 'requires_repair';
          await this.updateConnectionDbStatus('requires_repair', undefined, 'Sesi WhatsApp telah dicabut/logout.');
        } else {
          this.currentStatus = 'disconnected';
          await this.updateConnectionDbStatus('disconnected');
          if (shouldReconnect) {
            console.log('[BaileysProvider] Menjadwalkan reconnect otomatis dalam 5 detik...');
            setTimeout(() => this.initialize().catch(console.error), 5000);
          }
        }
      }
    });
  }

  async sendMessage(toJid: string, messageText: string): Promise<SendMessageResult> {
    if (!this.sock || this.currentStatus !== 'connected') {
      return {
        status: 'failed',
        error: `Baileys socket tidak terhubung (Status saat ini: ${this.currentStatus})`,
      };
    }

    try {
      const res = await this.sock.sendMessage(toJid, { text: messageText });
      const messageId = res?.key?.id || undefined;

      return {
        status: 'submitted',
        providerMessageId: messageId,
        rawResponse: res,
      };
    } catch (err: unknown) {
      const errorStr = String(err);
      console.error(`[BaileysProvider] Gagal mengirim pesan ke ${toJid}:`, err);

      // Tangani kemungkinan timeout socket (outcome ambigu)
      if (errorStr.includes('timed out') || errorStr.includes('Timeout')) {
        return {
          status: 'unknown',
          error: 'Socket timeout saat menunggu respons konfirmasi WhatsApp',
        };
      }

      return {
        status: 'failed',
        error: errorStr,
      };
    }
  }

  async getConnectionStatus(): Promise<WAConnectionStatus> {
    return this.currentStatus;
  }

  async getAccessibleGroups(): Promise<AccessibleGroup[]> {
    if (!this.sock || this.currentStatus !== 'connected') {
      return [];
    }

    try {
      const groups = await this.sock.groupFetchAllParticipating();
      return Object.values(groups).map((g) => ({
        jid: g.id,
        name: g.subject,
        participantCount: g.participants?.length ?? 0,
      }));
    } catch (err) {
      console.error('[BaileysProvider] Gagal mengambil daftar grup:', err);
      return [];
    }
  }

  async disconnect(): Promise<void> {
    if (this.sock) {
      this.sock.end(undefined);
      this.sock = null;
    }
    this.currentStatus = 'disconnected';
    await this.updateConnectionDbStatus('disconnected');
    console.log('[BaileysProvider] Socket diputus secara teratur.');
  }

  private async updateConnectionDbStatus(
    status: WAConnectionStatus,
    lastConnected?: Date,
    lastError?: string
  ) {
    try {
      const db = getDb();
      const existing = await db.select().from(whatsappConnections).limit(1);
      const updateData = {
        status,
        lastHeartbeatAt: new Date(),
        ...(lastConnected ? { lastConnectedAt: lastConnected } : {}),
        ...(lastError !== undefined ? { lastError } : {}),
        updatedAt: new Date(),
      };

      if (existing.length > 0) {
        await db.update(whatsappConnections).set(updateData);
      } else {
        await db.insert(whatsappConnections).values({
          ...updateData,
          status,
        });
      }
    } catch (err) {
      console.error('[BaileysProvider] Gagal memperbarui status koneksi di DB:', err);
    }
  }

  private async updateTempQr(qr: string, expiresAt: Date) {
    try {
      const db = getDb();
      const existing = await db.select().from(whatsappConnections).limit(1);
      if (existing.length > 0) {
        await db.update(whatsappConnections).set({
          tempQrCode: qr,
          qrExpiresAt: expiresAt,
          updatedAt: new Date(),
        });
      } else {
        await db.insert(whatsappConnections).values({
          tempQrCode: qr,
          qrExpiresAt: expiresAt,
          status: 'connecting',
        });
      }
    } catch (err) {
      console.error('[BaileysProvider] Gagal menyimpan QR ke DB:', err);
    }
  }

  private async clearTempQr() {
    try {
      const db = getDb();
      await db.update(whatsappConnections).set({
        tempQrCode: null,
        qrExpiresAt: null,
        updatedAt: new Date(),
      });
    } catch (err) {
      console.error('[BaileysProvider] Gagal membersihkan QR di DB:', err);
    }
  }
}
