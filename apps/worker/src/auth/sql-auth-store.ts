import { getDb, whatsappAuthState } from '@novarion/db';
import { eq } from 'drizzle-orm';
import { AuthenticationCreds, AuthenticationState, SignalDataTypeMap, initAuthCreds, BufferJSON } from '@whiskeysockets/baileys';
import { encryptPayload, decryptPayload } from '../crypto.js';

export async function useSqlAuthState(
  encryptionKeyHex: string
): Promise<{ state: AuthenticationState; saveCreds: () => Promise<void> }> {
  const db = getDb();

  // Helper untuk membaca dari PostgreSQL dan mendekripsi
  const readData = async (key: string): Promise<unknown | null> => {
    try {
      const rows = await db
        .select()
        .from(whatsappAuthState)
        .where(eq(whatsappAuthState.key, key))
        .limit(1);

      if (rows.length === 0) return null;
      const row = rows[0];
      const decrypted = decryptPayload(row.encryptedData, row.iv, row.tag, encryptionKeyHex);
      return JSON.parse(decrypted, BufferJSON.reviver);
    } catch (err) {
      console.error(`[SqlAuthState] Gagal membaca key '${key}':`, err);
      return null;
    }
  };

  // Helper untuk mengenkripsi dan menyimpan ke PostgreSQL
  const writeData = async (key: string, data: unknown): Promise<void> => {
    try {
      const rawString = JSON.stringify(data, BufferJSON.replacer);
      const encrypted = encryptPayload(rawString, encryptionKeyHex);

      const existing = await db
        .select({ key: whatsappAuthState.key })
        .from(whatsappAuthState)
        .where(eq(whatsappAuthState.key, key))
        .limit(1);

      if (existing.length > 0) {
        await db
          .update(whatsappAuthState)
          .set({
            encryptedData: encrypted.ciphertext,
            iv: encrypted.iv,
            tag: encrypted.tag,
            updatedAt: new Date(),
          })
          .where(eq(whatsappAuthState.key, key));
      } else {
        await db.insert(whatsappAuthState).values({
          key,
          encryptedData: encrypted.ciphertext,
          iv: encrypted.iv,
          tag: encrypted.tag,
          updatedAt: new Date(),
        });
      }
    } catch (err) {
      console.error(`[SqlAuthState] Gagal menulis key '${key}':`, err);
      throw err;
    }
  };

  const removeData = async (key: string): Promise<void> => {
    try {
      await db.delete(whatsappAuthState).where(eq(whatsappAuthState.key, key));
    } catch (err) {
      console.error(`[SqlAuthState] Gagal menghapus key '${key}':`, err);
    }
  };

  // Inisialisasi Kredensial Awal (Ambil dari DB atau buat baru)
  const existingCreds = (await readData('creds')) as AuthenticationCreds | null;
  const creds: AuthenticationCreds = existingCreds || initAuthCreds();

  return {
    state: {
      creds,
      keys: {
        get: async <T extends keyof SignalDataTypeMap>(
          type: T,
          ids: string[]
        ): Promise<{ [id: string]: SignalDataTypeMap[T] }> => {
          const data: { [id: string]: SignalDataTypeMap[T] } = {};
          for (const id of ids) {
            const val = await readData(`${type}-${id}`);
            if (val) {
              data[id] = val as SignalDataTypeMap[T];
            }
          }
          return data;
        },
        set: async (data: Record<string, Record<string, unknown>>): Promise<void> => {
          for (const category of Object.keys(data)) {
            for (const id of Object.keys(data[category])) {
              const value = data[category][id];
              const key = `${category}-${id}`;
              if (value) {
                await writeData(key, value);
              } else {
                await removeData(key);
              }
            }
          }
        },
      },
    },
    saveCreds: () => writeData('creds', creds),
  };
}
