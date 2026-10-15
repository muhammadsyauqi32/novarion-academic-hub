import { CalculatedTrigger, TriggerType } from './types.js';

// WIB adalah UTC+7 (tetap, tanpa daylight saving time)
export const WIB_OFFSET_HOURS = 7;
export const WIB_OFFSET_MS = WIB_OFFSET_HOURS * 60 * 60 * 1000;

export interface WIBDateParts {
  year: number;
  month: number; // 0-indexed (0 = Januari, 11 = Desember)
  day: number;
  hours: number;
  minutes: number;
  seconds: number;
}

/**
 * Mengambil komponen tanggal dan waktu dalam zona WIB (Asia/Jakarta)
 */
export function getWIBParts(date: Date): WIBDateParts {
  const wibTime = new Date(date.getTime() + WIB_OFFSET_MS);
  return {
    year: wibTime.getUTCFullYear(),
    month: wibTime.getUTCMonth(),
    day: wibTime.getUTCDate(),
    hours: wibTime.getUTCHours(),
    minutes: wibTime.getUTCMinutes(),
    seconds: wibTime.getUTCSeconds(),
  };
}

/**
 * Membuat objek Date (UTC) dari kalender WIB
 */
export function createWIBDate(
  year: number,
  month: number,
  day: number,
  hours = 0,
  minutes = 0,
  seconds = 0
): Date {
  return new Date(Date.UTC(year, month, day, hours - WIB_OFFSET_HOURS, minutes, seconds));
}

/**
 * Menghitung empat pemicu reminder wajib:
 * 1. H-7: Pukul 08.00 WIB, 7 hari kalender sebelum tanggal deadline
 * 2. H-3: Pukul 08.00 WIB, 3 hari kalender sebelum tanggal deadline
 * 3. H-1: Pukul 08.00 WIB, 1 hari kalender sebelum tanggal deadline
 * 4. T-3 JAM: Tepat 3 jam sebelum deadline presisi
 *
 * Catatan: Pemicu yang waktunya sudah terlewat (<= now) otomatis dilewati (skipped).
 */
export function computeReminderTriggers(
  deadline: Date,
  now: Date = new Date()
): CalculatedTrigger[] {
  const deadlineParts = getWIBParts(deadline);
  const nowMs = now.getTime();

  const candidates: { triggerType: TriggerType; date: Date; label: string }[] = [
    {
      triggerType: 'h_7',
      date: createWIBDate(deadlineParts.year, deadlineParts.month, deadlineParts.day - 7, 8, 0, 0),
      label: 'H-7 (08:00 WIB)',
    },
    {
      triggerType: 'h_3',
      date: createWIBDate(deadlineParts.year, deadlineParts.month, deadlineParts.day - 3, 8, 0, 0),
      label: 'H-3 (08:00 WIB)',
    },
    {
      triggerType: 'h_1',
      date: createWIBDate(deadlineParts.year, deadlineParts.month, deadlineParts.day - 1, 8, 0, 0),
      label: 'H-1 (08:00 WIB)',
    },
    {
      triggerType: 't_minus_3h',
      date: new Date(deadline.getTime() - 3 * 60 * 60 * 1000),
      label: 'T-3 Jam',
    },
  ];

  // Hanya ambil trigger yang belum lewat dari waktu 'now'
  return candidates
    .filter((c) => c.date.getTime() > nowMs)
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .map((c) => ({
      triggerType: c.triggerType,
      scheduledFor: c.date,
      label: c.label,
    }));
}

const NAMA_HARI = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const NAMA_BULAN = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

/**
 * Format tanggal ramah pengguna dalam Bahasa Indonesia dan zona WIB
 * Contoh: "Jumat, 30 Oktober 2026 — 23:59 WIB"
 */
export function formatWIB(dateInput: Date | string | number): string {
  const date = typeof dateInput === 'string' || typeof dateInput === 'number' ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return '-';

  const parts = getWIBParts(date);
  const wibTime = new Date(date.getTime() + WIB_OFFSET_MS);
  const dayName = NAMA_HARI[wibTime.getUTCDay()];
  const monthName = NAMA_BULAN[parts.month];
  const hh = String(parts.hours).padStart(2, '0');
  const mm = String(parts.minutes).padStart(2, '0');

  return `${dayName}, ${parts.day} ${monthName} ${parts.year} — ${hh}:${mm} WIB`;
}

/**
 * Format tanggal pendek untuk kalender/tabel
 * Contoh: "30 Okt 2026, 23:59 WIB"
 */
export function formatWIBShort(dateInput: Date | string | number): string {
  const date = typeof dateInput === 'string' || typeof dateInput === 'number' ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return '-';

  const parts = getWIBParts(date);
  const bulanPendek = NAMA_BULAN[parts.month]?.slice(0, 3) ?? '';
  const hh = String(parts.hours).padStart(2, '0');
  const mm = String(parts.minutes).padStart(2, '0');

  return `${parts.day} ${bulanPendek} ${parts.year}, ${hh}:${mm} WIB`;
}
