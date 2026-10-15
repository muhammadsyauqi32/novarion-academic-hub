import { describe, it, expect } from 'vitest';
import { 
  computeReminderTriggers, 
  createWIBDate, 
  getWIBParts, 
  formatWIB 
} from '../packages/shared/src/time.js';

describe('Reminder Engine — Mandatory 4 Triggers Calculation', () => {
  // Skenario dari MASTER_PROMPT.md:
  // Deadline: 30 Oktober 2026 23.59 WIB
  // H-7: 23 Oktober 08.00 WIB
  // H-3: 27 Oktober 08.00 WIB
  // H-1: 29 Oktober 08.00 WIB
  // T-3 jam: 30 Oktober 20.59 WIB
  const deadline = createWIBDate(2026, 9, 30, 23, 59, 0); // Bulan 9 = Oktober (0-indexed)

  it('menghasilkan tepat 4 pemicu wajib ketika agenda dipublikasikan jauh hari sebelum deadline', () => {
    // Dipublikasikan pada 15 Oktober 2026
    const now = createWIBDate(2026, 9, 15, 10, 0, 0);
    const triggers = computeReminderTriggers(deadline, now);

    expect(triggers).toHaveLength(4);

    const [h7, h3, h1, tMinus3h] = triggers;

    // 1. Verifikasi H-7 (23 Oktober 2026 pukul 08.00 WIB)
    expect(h7.triggerType).toBe('h_7');
    const h7Parts = getWIBParts(h7.scheduledFor);
    expect(h7Parts.day).toBe(23);
    expect(h7Parts.month).toBe(9); // Oktober
    expect(h7Parts.hours).toBe(8);
    expect(h7Parts.minutes).toBe(0);

    // 2. Verifikasi H-3 (27 Oktober 2026 pukul 08.00 WIB)
    expect(h3.triggerType).toBe('h_3');
    const h3Parts = getWIBParts(h3.scheduledFor);
    expect(h3Parts.day).toBe(27);
    expect(h3Parts.hours).toBe(8);
    expect(h3Parts.minutes).toBe(0);

    // 3. Verifikasi H-1 (29 Oktober 2026 pukul 08.00 WIB)
    expect(h1.triggerType).toBe('h_1');
    const h1Parts = getWIBParts(h1.scheduledFor);
    expect(h1Parts.day).toBe(29);
    expect(h1Parts.hours).toBe(8);
    expect(h1Parts.minutes).toBe(0);

    // 4. Verifikasi T-3 Jam presisi (30 Oktober 2026 pukul 20.59 WIB)
    expect(tMinus3h.triggerType).toBe('t_minus_3h');
    const tParts = getWIBParts(tMinus3h.scheduledFor);
    expect(tParts.day).toBe(30);
    expect(tParts.hours).toBe(20);
    expect(tParts.minutes).toBe(59);
  });

  it('otomatis melewati (skip) pemicu yang sudah lewat tanpa catch-up spam', () => {
    // Skenario: Agenda baru dipublikasikan pada 28 Oktober 2026 pukul 10.00 WIB
    // H-7 (23 Okt) dan H-3 (27 Okt) sudah terlewat!
    const now = createWIBDate(2026, 9, 28, 10, 0, 0);
    const triggers = computeReminderTriggers(deadline, now);

    // Harus hanya tersisa 2 pemicu: H-1 dan T-3 Jam
    expect(triggers).toHaveLength(2);
    expect(triggers[0].triggerType).toBe('h_1');
    expect(triggers[1].triggerType).toBe('t_minus_3h');
  });

  it('hanya menghasilkan pemicu T-3 Jam jika dipublikasikan pada hari H beberapa jam sebelum deadline', () => {
    // Dipublikasikan pada 30 Oktober 2026 pukul 12.00 WIB
    // H-7, H-3, dan H-1 sudah lewat semua
    const now = createWIBDate(2026, 9, 30, 12, 0, 0);
    const triggers = computeReminderTriggers(deadline, now);

    expect(triggers).toHaveLength(1);
    expect(triggers[0].triggerType).toBe('t_minus_3h');
  });

  it('menghasilkan 0 pemicu jika agenda dipublikasikan setelah batas waktu T-3 jam', () => {
    // Dipublikasikan pada 30 Oktober 2026 pukul 22.00 WIB (kurang dari 2 jam menuju deadline)
    const now = createWIBDate(2026, 9, 30, 22, 0, 0);
    const triggers = computeReminderTriggers(deadline, now);

    expect(triggers).toHaveLength(0);
  });

  it('formatWIB menghasilkan teks tanggal Indonesia dengan zona WIB yang akurat', () => {
    const formatted = formatWIB(deadline);
    expect(formatted).toContain('Jumat, 30 Oktober 2026 — 23:59 WIB');
  });
});
