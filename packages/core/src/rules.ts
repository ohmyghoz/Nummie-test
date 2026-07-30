/**
 * Auto-split dan Money rules (Strict / Flexible).
 *
 * Ini bagian yang PALING MENDESAK diturunkan ke app anak. Saat ini aturan hanya diatur di sisi
 * ortu dan tidak ditegakkan di sisi anak sama sekali — ortu bisa menyalakan Strict dan tidak
 * terjadi apa-apa. Aturan yang tidak ditegakkan lebih buruk daripada aturan yang belum ada,
 * karena ortu mengira anaknya dibatasi padahal tidak. (backlog A-sisa-1 & C)
 */
import type { AutoSplit, Category, MoneyRequest, MoneyRules, Wallet } from './types.js';

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

/**
 * Kategori yang boleh menerima auto-split. **Grow SENGAJA tidak ada di sini** (backlog A:
 * "Grow dikecualikan dari auto-split").
 *
 * Alasannya ADR-0003: memasukkan uang ke instrumen selalu lewat pengajuan yang disetujui ortu,
 * karena ortulah bank-nya dan risiko pasarnya ada di dia. Auto-split yang boleh mengalir ke Grow
 * akan membuat uang saku mingguan otomatis jadi investasi tanpa satu pun keputusan sadar.
 *
 * Dulu ini cuma tertulis di backlog. `applyAutoSplit()` mengiterasi seluruh `CATEGORIES`, jadi
 * begitu ada editor tujuan yang menyetel destinasi Grow, aturan itu akan bocor tanpa suara —
 * satu-satunya yang menahannya adalah kebetulan bahwa tujuan Grow belum pernah diisi.
 */
export const SPLITTABLE: readonly Category[] = ['spend', 'save', 'give'];

export function ratioTotal(split: AutoSplit): number {
  return SPLITTABLE.reduce((sum, c) => sum + (split.ratios[c] ?? 0), 0);
}

export interface SplitValidation {
  ok: boolean;
  /** kunci copy, bukan kalimat jadi — string UI tidak boleh hidup di core (lihat CLAUDE.md) */
  errorKey?: 'ratio.over100' | 'ratio.strictMustBeExact' | 'ratio.missingDestination'
    | 'ratio.growExcluded';
}

export function validateAutoSplit(rules: MoneyRules): SplitValidation {
  const { autoSplit, mode } = rules;
  if (!autoSplit.enabled) return { ok: true };

  const total = ratioTotal(autoSplit);
  if (total > 100) return { ok: false, errorKey: 'ratio.over100' };
  if (mode === 'strict' && total !== 100) return { ok: false, errorKey: 'ratio.strictMustBeExact' };

  // Rasio Grow bukan "sah tapi tanpa tujuan" — ia tidak pernah sah. Ditolak eksplisit supaya
  // pesannya benar, bukan menyamar sebagai tujuan yang lupa diisi.
  if ((autoSplit.ratios.grow ?? 0) > 0) {
    return { ok: false, errorKey: 'ratio.growExcluded' };
  }

  for (const c of SPLITTABLE) {
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

  for (const category of SPLITTABLE) {
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
 * Sumber yang sah untuk Cash out.
 *
 * **Give sengaja TIDAK termasuk** — sejak Fase 5, Give punya flow sendiri ("Give it away",
 * ADR-0006) dan dicabut dari sumber cash out biasa. Kalau Give tetap bisa di-cash-out lewat
 * jalur biasa, anak bisa melewati cerita wajib yang justru menutup lingkarannya.
 *
 * Grow juga tidak: satu-satunya jalan keluar dari Grow adalah Harvest (ADR-0003).
 * Unsorted tidak: uang yang belum diberi tugas disortir dulu, bukan langsung dicairkan.
 */
export function canCashOutFrom(wallet: Wallet): boolean {
  if (wallet.category === 'grow') return false;
  if (wallet.category === 'give') return false;
  if (wallet.category === 'unsorted') return false;
  return true; // tersisa: envelope (spend), dream, free_savings
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

/**
 * Utang janji (promise debt) — metrik kepercayaan console (backlog §R).
 *
 * Sebuah request masuk "utang janji" ketika ortu SUDAH menyetujuinya (`status === 'approved'`)
 * tapi penyelesaian dunia-nyata BELUM ditandai selesai (`fulfilment === 'todo'`). Ini konsekuensi
 * langsung ADR-0002 (approve ≠ fulfil): approve hanya membuka izin, uang riil berpindah di dunia
 * nyata. Utang janji yang menumpuk = ortu berjanji lalu lupa menepati — sinyal kepercayaan yang
 * lebih penting daripada DAU. Grow/Harvest tidak pernah muncul di sini: approve = selesai seketika
 * sehingga fulfilment-nya `not_applicable`, bukan `todo`.
 */
export function promiseDebt(requests: MoneyRequest[]): MoneyRequest[] {
  return requests.filter((r) => r.status === 'approved' && r.fulfilment === 'todo');
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
