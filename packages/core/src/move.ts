/**
 * Add money & Move money — matriks perpindahan uang (backlog D).
 *
 * Dua pengecualian yang sengaja, dan gampang "diperbaiki" jadi salah:
 *
 *  1. **Grow tidak ikut flow generik.** Masuk lewat Create, keluar lewat Harvest saja
 *     (ADR-0003). Asimetris, dan itu memang kebijakan ortu-sebagai-bank.
 *  2. **Unsorted tidak ikut flow generik.** Uang yang belum diberi tugas disortir lewat
 *     layar Sort penuh, bukan digeser diam-diam satu per satu.
 *
 * Soal Give: ia boleh jadi TUJUAN, tidak pernah jadi SUMBER. `canChildMoveFrom` sudah
 * mengunci itu, dan artinya masuk akal — begitu uang dijanjikan untuk berbagi, ia keluar
 * lewat flow Give (beserta ceritanya), bukan ditarik balik diam-diam.
 */
import type { MoneyRules, Wallet } from './types.js';
import { canChildMoveFrom, dreamRaidPenalty } from './rules.js';

export type MoveErrorKey =
  | 'move.amountRequired'
  | 'move.notEnough'
  | 'move.sourceLocked'
  | 'move.sameWallet'
  | 'move.destinationNotAllowed';

export interface MovePlan {
  ok: boolean;
  errorKey?: MoveErrorKey;
  amount: number;
  /**
   * ⭐ yang hilang kalau ini dikonfirmasi. WAJIB ditampilkan SEBELUM konfirmasi —
   * peringatan, bukan hukuman diam-diam (Fase 5).
   */
  starPenalty: number;
  /** saldo setelah perpindahan, untuk preview */
  fromAfter: number;
  toAfter: number;
}

/** Wallet yang boleh jadi sumber flow generik ini. */
export function moveSources(wallets: Wallet[], rules: MoneyRules): Wallet[] {
  return wallets.filter(
    (w) => w.category !== 'unsorted' && w.category !== 'grow' && canChildMoveFrom(w, rules),
  );
}

/** Wallet yang boleh jadi tujuan. Give boleh diterima; Grow & Unsorted tidak. */
export function moveTargets(from: Wallet, wallets: Wallet[]): Wallet[] {
  return wallets.filter(
    (w) => w.id !== from.id && w.category !== 'unsorted' && w.category !== 'grow',
  );
}

export function movePlan(
  from: Wallet,
  to: Wallet,
  amount: number,
  rules: MoneyRules,
  balances: Record<string, number>,
): MovePlan {
  const fromBalance = balances[from.id] ?? 0;
  const toBalance = balances[to.id] ?? 0;

  /**
   * Denda dihitung SEKALIPUN rencananya ditolak — dan itu disengaja.
   *
   * Merampok dream selalu berakhir `sourceLocked`, karena anak tidak bisa membatalkan dream
   * sendirian: "dream & Give tidak bisa dibatalkan TANPA ORTU" (ADR-0005). Jalurnya adalah
   * pengajuan ke ortu, bukan perpindahan langsung. Tapi anak tetap harus tahu ongkosnya
   * SEBELUM ia mengajukan — kalau denda baru muncul setelah ortu menyetujui, ia jadi hukuman
   * diam-diam, persis yang ditolak Fase 5.
   */
  const starPenalty = dreamRaidPenalty(from, to);
  const base = { amount, starPenalty, fromAfter: fromBalance, toAfter: toBalance };

  if (from.id === to.id) return { ...base, ok: false, errorKey: 'move.sameWallet' };

  // Mode Strict & kantong terlindungi ditegakkan di sini, bukan disembunyikan di UI.
  if (from.category === 'unsorted' || from.category === 'grow' || !canChildMoveFrom(from, rules)) {
    return { ...base, ok: false, errorKey: 'move.sourceLocked' };
  }
  if (to.category === 'unsorted' || to.category === 'grow') {
    return { ...base, ok: false, errorKey: 'move.destinationNotAllowed' };
  }
  if (amount <= 0) return { ...base, ok: false, errorKey: 'move.amountRequired' };
  if (amount > fromBalance) return { ...base, ok: false, errorKey: 'move.notEnough' };

  return {
    ok: true,
    amount,
    starPenalty,
    fromAfter: fromBalance - amount,
    toAfter: toBalance + amount,
  };
}
