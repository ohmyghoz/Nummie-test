/**
 * Auto-split dan Money rules (Strict / Flexible).
 *
 * Ini bagian yang PALING MENDESAK diturunkan ke app anak. Saat ini aturan hanya diatur di sisi
 * ortu dan tidak ditegakkan di sisi anak sama sekali — ortu bisa menyalakan Strict dan tidak
 * terjadi apa-apa. Aturan yang tidak ditegakkan lebih buruk daripada aturan yang belum ada,
 * karena ortu mengira anaknya dibatasi padahal tidak. (backlog A-sisa-1 & C)
 */
import type { AutoSplit, Category, MoneyRules, Wallet } from './types.js';
import { CATEGORIES } from './ledger.js';

export interface SplitTarget {
  walletId: string;
  category: Category;
  amount: number;
}

export interface SplitResult {
  targets: SplitTarget[];
  /** sisa yang mendarat di Unsorted. Selalu 0 di mode Strict. */
  remainderToUnsorted: number;
}

export function ratioTotal(split: AutoSplit): number {
  return CATEGORIES.reduce((sum, c) => sum + (split.ratios[c] ?? 0), 0);
}

export interface SplitValidation {
  ok: boolean;
  /** kunci copy, bukan kalimat jadi — string UI tidak boleh hidup di core (lihat CLAUDE.md) */
  errorKey?: 'ratio.over100' | 'ratio.strictMustBeExact' | 'ratio.missingDestination';
}

export function validateAutoSplit(rules: MoneyRules): SplitValidation {
  const { autoSplit, mode } = rules;
  if (!autoSplit.enabled) return { ok: true };

  const total = ratioTotal(autoSplit);
  if (total > 100) return { ok: false, errorKey: 'ratio.over100' };
  if (mode === 'strict' && total !== 100) return { ok: false, errorKey: 'ratio.strictMustBeExact' };

  for (const c of CATEGORIES) {
    const ratio = autoSplit.ratios[c] ?? 0;
    if (ratio > 0 && !autoSplit.destinations[c]) {
      return { ok: false, errorKey: 'ratio.missingDestination' };
    }
  }
  return { ok: true };
}

/**
 * Membagi uang masuk sesuai aturan ortu.
 * Kalau auto-split mati, SEMUA uang mendarat di Unsorted — persis seperti sebelum Fase 6.
 * Pembulatan: sisa pembagian selalu jatuh ke Unsorted, tidak pernah menciptakan atau
 * menghilangkan rupiah (I1).
 */
export function applyAutoSplit(amount: number, rules: MoneyRules): SplitResult {
  const { autoSplit } = rules;
  if (!autoSplit.enabled || amount <= 0) {
    return { targets: [], remainderToUnsorted: Math.max(0, amount) };
  }

  const targets: SplitTarget[] = [];
  let allocated = 0;

  for (const category of CATEGORIES) {
    const ratio = autoSplit.ratios[category] ?? 0;
    const walletId = autoSplit.destinations[category];
    if (ratio <= 0 || !walletId) continue;

    const share = Math.floor((amount * ratio) / 100);
    if (share <= 0) continue;

    targets.push({ walletId, category, amount: share });
    allocated += share;
  }

  return { targets, remainderToUnsorted: amount - allocated };
}

/**
 * Bolehkah anak memindahkan uang dari wallet ini sendiri?
 *
 * Yang berlaku di KEDUA mode (tidak pernah berubah):
 *  - cash out selalu butuh persetujuan ortu
 *  - dream & Give tidak bisa dibatalkan tanpa ortu
 *  - Grow tidak bisa ditarik sepihak — satu-satunya jalan keluar adalah Harvest (ADR-0003)
 */
export function canChildMoveFrom(wallet: Wallet, rules: MoneyRules): boolean {
  if (wallet.category === 'grow') return false;
  if (wallet.kind === 'dream') return false;
  if (wallet.category === 'give') return false;
  if (rules.mode === 'strict') {
    // Strict: pembagian terkunci — uang tidak bisa keluar dari tugas yang sudah diberikan.
    return false;
  }
  return wallet.category === 'unsorted' || wallet.category === 'spend' || wallet.kind === 'free_savings';
}

/**
 * Aturan Take money (ADR-0007): ortu TIDAK PERNAH boleh menarik dari dream, Give, dan Grow.
 * Kantong terlindungi tetap DITAMPILKAN tapi digembok — menyembunyikan membuat ortu bingung,
 * menampilkan-digembok mengajari ortu aturannya.
 */
export function canParentTakeFrom(wallet: Wallet): boolean {
  if (wallet.category === 'grow') return false;
  if (wallet.category === 'give') return false;
  if (wallet.kind === 'dream') return false;
  return true; // tersisa: unsorted, envelope (spend), free_savings
}

/** Minus ⭐ saat "merampok" dream (Fase 5). Memotong SALDO saja, tidak pernah lifetime (ADR-0004). */
export const DREAM_RAID_STAR_PENALTY = 15;

export function dreamRaidPenalty(from: Wallet, to: Wallet): number {
  if (from.kind !== 'dream') return 0;
  // dream -> dream lain = menata ulang prioritas. dream -> Grow = menunda lebih lama. Keduanya gratis.
  if (to.kind === 'dream' || to.category === 'grow') return 0;
  if (to.category === 'spend' || to.category === 'give') return DREAM_RAID_STAR_PENALTY;
  return 0;
}
