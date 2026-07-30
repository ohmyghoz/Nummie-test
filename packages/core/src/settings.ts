/**
 * Settings ortu (Fase 3): jadwal uang saku, rate bank, jatuh tempo deposito.
 *
 * Semua tanggal di berkas ini dikerjakan sebagai **tanggal saja** (YYYY-MM-DD) dengan
 * aritmetika UTC. Alasannya bukan kerapian: uang saku yang mendarat "Senin" tidak boleh
 * berpindah hari gara-gara zona waktu atau jam berapa ortu membuka app. Jam & WIB baru
 * relevan saat scheduler produksi dibangun (backlog T) — dan saat itu berkas ini tetap
 * berbicara dalam tanggal, bukan timestamp.
 */
import type { Prices, Tenor } from './grow.js';

export type AllowanceFrequency = 'weekly' | 'biweekly' | 'monthly';

export interface AllowanceSchedule {
  enabled: boolean;
  amount: number;
  frequency: AllowanceFrequency;
  /** weekly & biweekly: 0–6 (Minggu–Sabtu). monthly: 1–28. */
  day: number;
  /**
   * Titik awal kisi 14 hari — **wajib untuk biweekly**, tidak dipakai frekuensi lain.
   *
   * Tanpa ini, "dua mingguan" dihitung dari kapan layar dibuka, jadi jadwalnya bergeser satu
   * minggu tiap kali ada yang menyentuh setelannya. Cacat yang tercatat di handoff §232, dan
   * ditegakkan constraint `biweekly_needs_anchor` di migrasi 0013.
   */
  anchorDate?: string;
}

export type AllowanceErrorKey =
  | 'allowance.amountRequired'
  | 'allowance.dayOutOfRange';

/**
 * Batas tanggal bulanan di **28** disengaja: tanggal 29–31 tidak ada di setiap bulan, dan
 * "uang sakumu tidak turun bulan ini karena Februari pendek" adalah penjelasan yang tidak
 * bisa dipertanggungjawabkan ke anak.
 */
export const MONTHLY_MAX_DAY = 28;

export function validateAllowance(s: AllowanceSchedule): { ok: boolean; errorKey?: AllowanceErrorKey } {
  if (!s.enabled) return { ok: true };
  if (s.amount <= 0) return { ok: false, errorKey: 'allowance.amountRequired' };

  const max = s.frequency === 'monthly' ? MONTHLY_MAX_DAY : 6;
  const min = s.frequency === 'monthly' ? 1 : 0;
  if (!Number.isInteger(s.day) || s.day < min || s.day > max) {
    return { ok: false, errorKey: 'allowance.dayOutOfRange' };
  }
  return { ok: true };
}

function toUTC(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(Date.UTC(y ?? 1970, (m ?? 1) - 1, d ?? 1));
}

function toISO(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * 86_400_000);
}

/**
 * Tanggal-tanggal berikutnya uang saku akan mendarat, dihitung dari `fromISO` (eksklusif).
 *
 * Mengembalikan daftar, bukan satu tanggal, karena itulah yang membuat "dua mingguan" berarti
 * apa-apa di layar ortu: satu tanggal terlihat sama persis dengan mingguan.
 */
export function nextAllowanceDates(
  s: AllowanceSchedule,
  fromISO: string,
  count = 3,
): string[] {
  if (!s.enabled || count <= 0) return [];
  const from = toUTC(fromISO);
  const out: string[] = [];

  if (s.frequency === 'monthly') {
    let y = from.getUTCFullYear();
    let m = from.getUTCMonth();
    // mulai dari bulan ini kalau tanggalnya belum lewat, kalau sudah lewat bulan depan
    if (from.getUTCDate() >= s.day) m += 1;
    for (let i = 0; i < count; i += 1) {
      out.push(toISO(new Date(Date.UTC(y, m + i, s.day))));
    }
    return out;
  }

  // weekly & biweekly: cari kemunculan hari itu setelah `from`
  const step = s.frequency === 'biweekly' ? 14 : 7;
  let delta = (s.day - from.getUTCDay() + 7) % 7;
  if (delta === 0) delta = 7; // eksklusif — hari ini tidak dihitung
  let cursor = addDays(from, delta);

  /**
   * ANCHOR — yang membuat "dua mingguan" benar-benar dua mingguan.
   *
   * Tanpa ini, biweekly cuma "hari X berikutnya, lalu +14" — dan hari X berikutnya dihitung dari
   * KAPAN ORTU MEMBUKA LAYAR. Ortu yang membuka Settings di minggu yang berbeda melihat dua
   * jadwal berbeda untuk setelan yang sama persis, dan uang sakunya akan bergeser satu minggu
   * tiap kali ada yang menyentuh setelannya. Itu cacat yang sudah tercatat di handoff §232.
   *
   * Dengan anchor, jadwalnya milik ANCHOR-nya, bukan milik hari ini: yang dicari adalah
   * kemunculan berikutnya pada kisi 14 hari yang berawal di `anchorDate`.
   */
  if (s.frequency === 'biweekly' && s.anchorDate) {
    const anchor = toUTC(s.anchorDate);
    const daysSince = Math.round((cursor.getTime() - anchor.getTime()) / 86_400_000);
    // Geser ke kisi anchor. Sisa bagi bisa negatif kalau anchor di masa depan — `% step` di JS
    // mengikuti tanda pembilang, jadi ditambah `step` dulu sebelum dimodulo lagi.
    const offGrid = ((daysSince % step) + step) % step;
    if (offGrid !== 0) cursor = addDays(cursor, step - offGrid);
  }

  for (let i = 0; i < count; i += 1) {
    out.push(toISO(cursor));
    cursor = addDays(cursor, step);
  }
  return out;
}

/**
 * Uang saku mendarat di Unsorted, sama seperti Send money — dan **tanpa persetujuan**.
 * Ia sudah dijadwalkan ortu sendiri; meminta ortu menyetujui keputusannya sendiri tiap
 * minggu hanya melatih ortu menekan "ya" tanpa membaca.
 */
export const ALLOWANCE_NEEDS_APPROVAL = false;

export type RatesErrorKey = 'rates.negative' | 'rates.tooHigh';

/** Batas atas rate per tenor. Bukan aturan produk, cuma pagar agar salah ketik tidak lolos. */
export const MAX_RATE_PCT = 100;

export function validateBankRates(rates: Prices['bankRates']): { ok: boolean; errorKey?: RatesErrorKey } {
  const values = [rates.m3, rates.m6, rates.m12];
  if (values.some((r) => r < 0)) return { ok: false, errorKey: 'rates.negative' };
  if (values.some((r) => r > MAX_RATE_PCT)) return { ok: false, errorKey: 'rates.tooHigh' };
  return { ok: true };
}

/**
 * Apakah tenor lebih panjang membayar lebih besar?
 *
 * Ini **petunjuk, bukan larangan**. Ortu berhak menetapkan rate apa pun — dia bank-nya
 * (ADR-0003). Tapi tenor panjang yang membayar lebih kecil mengajari anak kebalikan dari
 * cara deposito bekerja di dunia nyata, jadi layar sebaiknya menyebutkannya.
 */
export function ratesRewardPatience(rates: Prices['bankRates']): boolean {
  return rates.m3 <= rates.m6 && rates.m6 <= rates.m12;
}

const TENOR_DAYS: Record<Tenor, number> = { 3: 90, 6: 180, 12: 365 };

export function maturityDate(startISO: string, tenor: Tenor): string {
  return toISO(addDays(toUTC(startISO), TENOR_DAYS[tenor]));
}

/** Sisa hari sampai jatuh tempo. 0 berarti sudah jatuh tempo (tidak pernah negatif di layar). */
export function daysUntilMaturity(startISO: string, tenor: Tenor, todayISO: string): number {
  const diff = toUTC(maturityDate(startISO, tenor)).getTime() - toUTC(todayISO).getTime();
  return Math.max(0, Math.round(diff / 86_400_000));
}

export function isMatured(startISO: string, tenor: Tenor, todayISO: string): boolean {
  return daysUntilMaturity(startISO, tenor, todayISO) === 0;
}
