import { describe, it, expect } from 'vitest';
import { encryptPayload, decryptPayload } from '../apps/worker/src/crypto.js';
import crypto from 'crypto';

describe('AES-256-GCM Session Key Encryption & Recovery', () => {
  const validKeyHex = crypto.randomBytes(32).toString('hex'); // 32 bytes = 64 hex chars

  it('berhasil mengenkripsi dan mendekripsi data kredensial / Signal keys tanpa kehilangan integritas', () => {
    const originalSignalData = JSON.stringify({
      creds: {
        registrationId: 10452,
        noiseKey: { private: 'dGhpcy1pcy1hLXByaXZhdGUta2V5', public: 'dGhpcy1pcy1hLXB1YmxpYy1rZXk=' },
        signedIdentityKey: { private: 'c2lnbmVkLXByaXZhdGU=', public: 'c2lnbmVkLXB1YmxpYw==' },
      },
      accountSettings: { unarchiveChats: false },
    });

    const encrypted = encryptPayload(originalSignalData, validKeyHex);

    expect(encrypted.ciphertext).toBeDefined();
    expect(encrypted.iv).toHaveLength(24); // 12 bytes = 24 hex chars
    expect(encrypted.tag).toHaveLength(32); // 16 bytes = 32 hex chars
    expect(encrypted.ciphertext).not.toContain('registrationId');

    const decrypted = decryptPayload(
      encrypted.ciphertext,
      encrypted.iv,
      encrypted.tag,
      validKeyHex
    );

    expect(decrypted).toBe(originalSignalData);
    const parsed = JSON.parse(decrypted);
    expect(parsed.creds.registrationId).toBe(10452);
  });

  it('menolak kunci enkripsi yang panjangnya bukan 32 bytes (64 karakter hex)', () => {
    const invalidShortKeyHex = '1234567890abcdef'; // hanya 8 bytes
    expect(() => encryptPayload('test data', invalidShortKeyHex)).toThrow(
      'Master encryption key must be 32 bytes'
    );
  });

  it('gagal mendekripsi jika authentication tag dirusak (tampered tag)', () => {
    const encrypted = encryptPayload('sensitif session data', validKeyHex);
    // Ganti tag dengan tag palsu
    const tamperedTag = crypto.randomBytes(16).toString('hex');

    expect(() =>
      decryptPayload(encrypted.ciphertext, encrypted.iv, tamperedTag, validKeyHex)
    ).toThrow();
  });
});
