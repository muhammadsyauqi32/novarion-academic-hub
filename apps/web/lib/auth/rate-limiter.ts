/**
 * In-memory sliding window rate limiter untuk autentikasi dan server actions sensitif.
 * Menyediakan proteksi terhadap brute-force attack pada NIM dan password.
 */

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

class MemoryRateLimiter {
  private store = new Map<string, RateLimitRecord>();
  private readonly cleanupIntervalMs = 60 * 1000; // Bersihkan entri expired setiap 1 menit

  constructor() {
    // Schedule periodic memory cleanup
    if (typeof setInterval !== 'undefined') {
      const timer = setInterval(() => {
        const now = Date.now();
        for (const [key, record] of this.store.entries()) {
          if (now >= record.resetAt) {
            this.store.delete(key);
          }
        }
      }, this.cleanupIntervalMs);
      if (timer.unref) {
        timer.unref();
      }
    }
  }

  /**
   * Memeriksa apakah suatu action diizinkan.
   * @param key Identifikasi unik (misal IP address atau NIM)
   * @param maxAttempts Jumlah percobaan maksimum yang diizinkan dalam window
   * @param windowMs Durasi window dalam milidetik (default 15 menit)
   */
  public check(
    key: string,
    maxAttempts: number = 5,
    windowMs: number = 15 * 60 * 1000
  ): { allowed: boolean; remainingAttempts: number; retryAfterSeconds: number } {
    const now = Date.now();
    const record = this.store.get(key);

    if (!record || now >= record.resetAt) {
      return {
        allowed: true,
        remainingAttempts: maxAttempts,
        retryAfterSeconds: 0,
      };
    }

    if (record.count >= maxAttempts) {
      const retryAfterSeconds = Math.ceil((record.resetAt - now) / 1000);
      return {
        allowed: false,
        remainingAttempts: 0,
        retryAfterSeconds: Math.max(1, retryAfterSeconds),
      };
    }

    return {
      allowed: true,
      remainingAttempts: maxAttempts - record.count,
      retryAfterSeconds: 0,
    };
  }

  /**
   * Mencatat kegagalan percobaan untuk key tertentu.
   */
  public recordFailure(key: string, windowMs: number = 15 * 60 * 1000): void {
    const now = Date.now();
    const record = this.store.get(key);

    if (!record || now >= record.resetAt) {
      this.store.set(key, {
        count: 1,
        resetAt: now + windowMs,
      });
    } else {
      record.count += 1;
    }
  }

  /**
   * Mereset counter setelah keberhasilan (misal login berhasil).
   */
  public reset(key: string): void {
    this.store.delete(key);
  }
}

// Singleton global rate limiter instance
const globalForLimiter = global as unknown as { authRateLimiter?: MemoryRateLimiter };

export const authRateLimiter = globalForLimiter.authRateLimiter || new MemoryRateLimiter();

if (process.env.NODE_ENV !== 'production') {
  globalForLimiter.authRateLimiter = authRateLimiter;
}
