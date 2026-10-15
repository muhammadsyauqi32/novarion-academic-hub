import crypto from 'crypto';

export interface EncryptedResult {
  ciphertext: string;
  iv: string;
  tag: string;
}

/**
 * Enkripsi payload data menggunakan AES-256-GCM
 */
export function encryptPayload(data: string, masterKeyHex: string): EncryptedResult {
  const key = Buffer.from(masterKeyHex, 'hex');
  if (key.length !== 32) {
    throw new Error('Master encryption key must be 32 bytes (64 hex characters)');
  }

  const iv = crypto.randomBytes(12); // 96-bit IV recommended for GCM
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

  let ciphertext = cipher.update(data, 'utf8', 'hex');
  ciphertext += cipher.final('hex');

  const tag = cipher.getAuthTag();

  return {
    ciphertext,
    iv: iv.toString('hex'),
    tag: tag.toString('hex'),
  };
}

/**
 * Dekripsi payload data menggunakan AES-256-GCM
 */
export function decryptPayload(
  ciphertext: string,
  ivHex: string,
  tagHex: string,
  masterKeyHex: string
): string {
  const key = Buffer.from(masterKeyHex, 'hex');
  if (key.length !== 32) {
    throw new Error('Master encryption key must be 32 bytes (64 hex characters)');
  }

  const iv = Buffer.from(ivHex, 'hex');
  const tag = Buffer.from(tagHex, 'hex');

  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);

  let decrypted = decipher.update(ciphertext, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}
