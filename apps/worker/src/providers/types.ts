import { WAConnectionStatus } from '@novarion/shared';

export interface SendMessageResult {
  status: 'submitted' | 'failed' | 'unknown';
  providerMessageId?: string;
  error?: string;
  rawResponse?: unknown;
}

export interface AccessibleGroup {
  jid: string;
  name: string;
  participantCount?: number;
}

export interface MessagingProvider {
  name: string;
  initialize(): Promise<void>;
  sendMessage(toJid: string, messageText: string): Promise<SendMessageResult>;
  getConnectionStatus(): Promise<WAConnectionStatus>;
  getAccessibleGroups(): Promise<AccessibleGroup[]>;
  disconnect(): Promise<void>;
}
