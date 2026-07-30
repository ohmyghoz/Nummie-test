/**
 * Ekonomi ⭐/💎 dan tiga gerbang (ADR-0004).
 *
 * ⭐ dari kurikulum → hanya kosmetik in-app. 💎 dari chores → hanya hadiah dunia nyata.
 * Logikanya: usaha di app → identitas di app; kerja dunia nyata → hak istimewa dunia nyata.
 */
import type { Wallet } from './types.js';
import { dreamRaidPenalty } from './rules.js';

/** Gerbang 1: sistem chores terbuka saat ⭐ lifetime mencapai ini. */
export const CHORES_GATE_LIFETIME_STARS = 100;
/** Gerbang 2: hadiah besar terbuka setelah chapter ini selesai. */
export const BIG_PRIZE_CHAPTER = 2;
/** Ambang "hadiah besar" dalam 💎. */
export const BIG_PRIZE_MIN_GEMS = 25;

export interface Economy {
  /** naik-turun — dipakai membeli avatar */
  starsBalance: number;
  /** TIDAK PERNAH turun — dipakai untuk gerbang */
  starsLifetime: number;
  gems: number;
  chaptersDone: number;
  /** materi minggu ini selesai — menggerbang PENUKARAN 💎, bukan perolehannya */
  weeklyMaterialDone?: boolean;
}

export type EconomyErrorKey =
  | 'stars.insufficient'
  | 'gems.insufficient'
  | 'gems.weeklyMaterialUnfinished'
  | 'gems.bigPrizeLocked';

export interface EconomyResult {
  ok: boolean;
  economy?: Economy;
  /** kunci copy, bukan kalimat jadi */
  errorKey?: EconomyErrorKey;
}

/** Dapat ⭐ dari kurikulum: saldo DAN lifetime naik bersama. */
export function earnStars(e: Economy, amount: number): Economy {
  if (amount <= 0) return e;
  return { ...e, starsBalance: e.starsBalance + amount, starsLifetime: e.starsLifetime + amount };
}

/**
 * Belanja ⭐ (avatar): memotong SALDO saja.
 *
 * Lifetime sengaja tidak ikut turun. Kalau ikut, anak yang membeli avatar akan MENGUNCI ULANG
 * chores-nya sendiri — dihukum karena memakai hadiahnya. ADR-0004 menyebutnya absurd, dan itu
 * sebabnya ⭐ dipecah jadi dua angka sejak awal.
 */
export function spendStars(e: Economy, amount: number): EconomyResult {
  if (amount <= 0) return { ok: true, economy: e };
  if (e.starsBalance < amount) return { ok: false, errorKey: 'stars.insufficient' };
  return { ok: true, economy: { ...e, starsBalance: e.starsBalance - amount } };
}

/** Gerbang 1 — memakai lifetime, bukan saldo. Itu seluruh alasan kedua angka ini ada. */
export function choresUnlocked(e: Economy): boolean {
  return e.starsLifetime >= CHORES_GATE_LIFETIME_STARS;
}

/** Gerbang 2 — hadiah besar & job achievement. */
export function bigPrizesUnlocked(e: Economy): boolean {
  return e.chaptersDone >= BIG_PRIZE_CHAPTER;
}

export function isBigPrize(gemCost: number): boolean {
  return gemCost >= BIG_PRIZE_MIN_GEMS;
}

/**
 * Gerbang 3 ada di PENUKARAN, bukan perolehan — maka dua fungsi terpisah, bukan satu.
 *
 * 💎 selalu boleh dikumpulkan. Kalau perolehannya yang dikunci, muncul pesan aneh
 * "kamu belum belajar, jadi tak perlu beresin kamar" — kontribusi keluarga jadi bersyarat.
 */
export function canEarnGems(): boolean {
  return true;
}

/**
 * Gerbang 3 — dan perhatikan `undefined` diperlakukan BERBEDA dari `false`.
 *
 *   true      → materi minggu ini selesai, silakan tukar
 *   false     → belum selesai, gerbang menutup (inilah gerbangnya)
 *   undefined → **belum ada materi mingguan sama sekali**, jadi tidak ada yang bisa digerbang
 *
 * Kenapa `undefined` membuka: kurikulum belum punya tabel, jadi `weeklyMaterialDone` tidak pernah
 * bisa bernilai apa pun. Memperlakukannya sebagai "belum selesai" akan menutup gerbang ini
 * **selamanya** — 💎 bisa dikumpulkan tapi tidak pernah bisa ditukar, dan seluruh ekonomi 💎 jadi
 * hiasan. Gerbang yang menjaga syarat yang tidak ada bukan penjagaan, ia cuma kebuntuan.
 *
 * ADR-0004 tidak dibalik: gerbangnya tetap ada dan tetap menutup begitu ada materi mingguan yang
 * bisa dinilai. Yang berubah cuma cara membaca "tidak ada data".
 *
 * ⚠️ Begitu kurikulum punya tabel, `weeklyMaterialDone` harus jadi boolean sungguhan — dan sejak
 * saat itu baris ini menutup gerbangnya sendiri tanpa perubahan kode.
 */
export function canRedeemGems(e: Economy): boolean {
  return e.weeklyMaterialDone !== false;
}

/** Menukar 💎 jadi hadiah nyata: melewati gerbang mingguan, gerbang hadiah besar, lalu saldo. */
export function redeemGems(e: Economy, gemCost: number): EconomyResult {
  if (!canRedeemGems(e)) return { ok: false, errorKey: 'gems.weeklyMaterialUnfinished' };
  if (isBigPrize(gemCost) && !bigPrizesUnlocked(e)) {
    return { ok: false, errorKey: 'gems.bigPrizeLocked' };
  }
  if (e.gems < gemCost) return { ok: false, errorKey: 'gems.insufficient' };
  return { ok: true, economy: { ...e, gems: e.gems - gemCost } };
}

/**
 * Minus ⭐ saat "merampok" dream. Besaran & pengecualiannya dihitung `dreamRaidPenalty`
 * di `rules.ts` — di sini hanya penerapannya, dan yang penting: kena SALDO saja.
 * Saldo tidak pernah menembus nol.
 */
export function applyDreamRaid(e: Economy, from: Wallet, to: Wallet): Economy {
  const penalty = dreamRaidPenalty(from, to);
  if (penalty === 0) return e;
  return { ...e, starsBalance: Math.max(0, e.starsBalance - penalty) };
}
