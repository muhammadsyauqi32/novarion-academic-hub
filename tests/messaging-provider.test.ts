import { describe, it, expect, beforeEach } from 'vitest';
import { MockMessagingProvider } from '../apps/worker/src/providers/mock.js';

describe('Messaging Provider Contract & Mock Verification', () => {
  let provider: MockMessagingProvider;

  beforeEach(async () => {
    provider = new MockMessagingProvider();
    await provider.initialize();
  });

  it('mengirim pesan pengingat berhasil dengan status submitted dan message ID', async () => {
    const toJid = '120363000000000001@g.us';
    const message = '📚 NOVARION — PENGINGAT DEADLINE H-1';

    const result = await provider.sendMessage(toJid, message);

    expect(result.status).toBe('submitted');
    expect(result.providerMessageId).toBeDefined();
    expect(result.providerMessageId).toContain('mock_wa_');
    expect(provider.sentMessages).toHaveLength(1);
    expect(provider.sentMessages[0].toJid).toBe(toJid);
    expect(provider.sentMessages[0].messageText).toBe(message);
  });

  it('menangani kegagalan jaringan sementara dengan status failed', async () => {
    provider.shouldFailNext = true;

    const result = await provider.sendMessage('120363000000000001@g.us', 'Pesan Test');

    expect(result.status).toBe('failed');
    expect(result.error).toContain('network failure');
    expect(provider.sentMessages).toHaveLength(0);
  });

  it('menangani socket timeout dengan status unknown (tidak di-retry buta)', async () => {
    provider.shouldTimeoutNext = true;

    const result = await provider.sendMessage('120363000000000001@g.us', 'Pesan Test Timeout');

    expect(result.status).toBe('unknown');
    expect(result.error).toContain('timeout');
    expect(provider.sentMessages).toHaveLength(0);
  });

  it('dapat mengambil daftar grup yang dapat diakses oleh bot', async () => {
    const groups = await provider.getAccessibleGroups();

    expect(groups.length).toBeGreaterThan(0);
    expect(groups[0].jid).toContain('@g.us');
    expect(groups[0].name).toContain('Statistika');
  });

  it('menolak pengiriman pesan saat status disconnected', async () => {
    await provider.disconnect();
    const result = await provider.sendMessage('120363000000000001@g.us', 'Pesan Disconnected');

    expect(result.status).toBe('failed');
    expect(result.error).toContain('disconnected');
  });
});
