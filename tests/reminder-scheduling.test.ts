import { describe, it, expect } from 'vitest';
import { computeReminderTriggers, createWIBDate } from '@novarion/shared';

describe('Non-Negotiable WhatsApp Reminder Rules', () => {
  it('calculates exact 4 triggers: H-7, H-3, H-1, and T-3 Jam before deadline', () => {
    // Deadline set to 10 days in the future (at 23:59 WIB)
    const now = createWIBDate(2026, 9, 20, 8, 0, 0); // 20 Okt 2026 08:00 WIB
    const deadline = createWIBDate(2026, 9, 30, 23, 59, 0); // 30 Okt 2026 23:59 WIB

    const triggers = computeReminderTriggers(deadline, now);

    expect(triggers).toHaveLength(4);

    const triggerTypes = triggers.map((t) => t.triggerType);
    expect(triggerTypes).toContain('h_7');
    expect(triggerTypes).toContain('h_3');
    expect(triggerTypes).toContain('h_1');
    expect(triggerTypes).toContain('t_minus_3h');
  });

  it('deliberately skips past reminder times when agenda is created near deadline', () => {
    // Current time is 2 days before deadline (28 Okt 2026)
    const now = createWIBDate(2026, 9, 28, 12, 0, 0);
    const deadline = createWIBDate(2026, 9, 30, 23, 59, 0);

    const triggers = computeReminderTriggers(deadline, now);

    // H-7 (23 Okt) and H-3 (27 Okt) are already in the past relative to now (28 Okt)
    const triggerTypes = triggers.map((t) => t.triggerType);
    expect(triggerTypes).toEqual(['h_1', 't_minus_3h']);
  });

  it('returns empty triggers when deadline is already in the past', () => {
    const now = createWIBDate(2026, 9, 31, 8, 0, 0);
    const deadline = createWIBDate(2026, 9, 30, 23, 59, 0);

    const triggers = computeReminderTriggers(deadline, now);
    expect(triggers).toHaveLength(0);
  });
});
