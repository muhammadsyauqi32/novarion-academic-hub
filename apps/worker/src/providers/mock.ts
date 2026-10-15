import { MessagingProvider, SendMessageResult, AccessibleGroup } from './types.js';
import { WAConnectionStatus } from '@novarion/shared';

export interface SentMockMessage {
  toJid: string;
  messageText: string;
  sentAt: Date;
  providerMessageId: string;
}

export class MockMessagingProvider implements MessagingProvider {
  name = 'mock';
  public sentMessages: SentMockMessage[] = [];
  public currentStatus: WAConnectionStatus = 'connected';
  public shouldFailNext = false;
  public shouldTimeoutNext = false;

  async initialize(): Promise<void> {
    console.log('[MockMessagingProvider] Inisialisasi Mock WhatsApp Provider berhasil.');
    this.currentStatus = 'connected';
  }

  async sendMessage(toJid: string, messageText: string): Promise<SendMessageResult> {
    if (this.currentStatus !== 'connected') {
      return {
        status: 'failed',
        error: `Provider status is ${this.currentStatus}`,
      };
    }

    if (this.shouldFailNext) {
      this.shouldFailNext = false;
      return {
        status: 'failed',
        error: 'Simulated network failure on WhatsApp gateway',
      };
    }

    if (this.shouldTimeoutNext) {
      this.shouldTimeoutNext = false;
      return {
        status: 'unknown',
        error: 'Simulated socket timeout while awaiting provider acknowledgment',
      };
    }

    const providerMessageId = `mock_wa_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const record: SentMockMessage = {
      toJid,
      messageText,
      sentAt: new Date(),
      providerMessageId,
    };
    this.sentMessages.push(record);

    console.log(`[MockMessagingProvider] Pesan terkirim ke ${toJid} (ID: ${providerMessageId})`);
    return {
      status: 'submitted',
      providerMessageId,
      rawResponse: { jid: toJid, timestamp: record.sentAt.toISOString() },
    };
  }

  async getConnectionStatus(): Promise<WAConnectionStatus> {
    return this.currentStatus;
  }

  async getAccessibleGroups(): Promise<AccessibleGroup[]> {
    return [
      { jid: '120363000000000001@g.us', name: 'Statistika 2024 — Angkatan Utama', participantCount: 145 },
      { jid: '120363000000000002@g.us', name: 'Analisis Regresi — Kelas A', participantCount: 48 },
      { jid: '120363000000000003@g.us', name: 'Analisis Regresi — Kelas B', participantCount: 46 },
    ];
  }

  async disconnect(): Promise<void> {
    this.currentStatus = 'disconnected';
    console.log('[MockMessagingProvider] Terputus.');
  }
}
