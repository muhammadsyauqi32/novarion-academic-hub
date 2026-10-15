import * as dotenv from 'dotenv';
dotenv.config({ path: '../../.env' });

import { MessagingProvider } from './providers/types.js';
import { MockMessagingProvider } from './providers/mock.js';
import { BaileysMessagingProvider } from './providers/baileys.js';
import { ReminderJobRunner } from './runner/job-runner.js';

async function main() {
  console.log('====================================================');
  console.log('🤖 NOVARION ACADEMIC HUB — BAILEYS & REMINDER WORKER');
  console.log('====================================================');

  const providerType = process.env.WA_PROVIDER || 'mock';
  const workerId = process.env.WORKER_ID || `worker-${Math.random().toString(36).substring(7)}`;
  const pollIntervalMs = Number(process.env.POLL_INTERVAL_MS) || 30000;
  const encryptionKeyHex = process.env.WA_SESSION_ENCRYPTION_KEY;

  let provider: MessagingProvider;

  if (providerType === 'baileys') {
    if (!encryptionKeyHex) {
      console.error('❌ FATAL: WA_SESSION_ENCRYPTION_KEY belum dikonfigurasi di environment!');
      process.exit(1);
    }
    console.log('📡 Menggunakan provider: Baileys (@whiskeysockets/baileys)');
    provider = new BaileysMessagingProvider(encryptionKeyHex);
  } else {
    console.log('🧪 Menggunakan provider: MockMessagingProvider (Testing / Staging)');
    provider = new MockMessagingProvider();
  }

  try {
    await provider.initialize();
  } catch (err) {
    console.error('❌ Gagal menginisialisasi provider pesan:', err);
    process.exit(1);
  }

  const runner = new ReminderJobRunner(provider, workerId, pollIntervalMs);
  runner.start();

  // Graceful shutdown handling
  const shutdown = async (signal: string) => {
    console.log(`\n[Worker] Menerima sinyal ${signal}. Menutup service secara aman...`);
    runner.stop();
    await provider.disconnect();
    console.log('[Worker] Service berhenti. Sampai jumpa!');
    process.exit(0);
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

main().catch((err) => {
  console.error('❌ Fatal error di worker utama:', err);
  process.exit(1);
});
