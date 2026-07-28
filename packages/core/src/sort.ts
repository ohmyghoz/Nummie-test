/**
 * Layar Sort — tempat dua gap termahal di backlog akhirnya ditutup.
 *
 * **A-sisa-1**: app anak selama ini menulis teks mati "40% Spend / 40% Save / 20% Give default".
 * Rasio yang diatur ortu harus benar-benar MUNCUL dan BERLAKU di sini, diambil dari `money_rules`.
 *
 * **C**: app anak tidak mengenal konsep mode sama sekali — ortu bisa menyalakan Strict dan tidak
 * terjadi apa-apa. Aturan yang tidak ditegakkan lebih buruk daripada aturan yang belum ada, karena
 * ortu mengira anaknya dibatasi padahal tidak.
 *
 * Prinsip UI yang diwarisi backlog A: **selalu tampilkan preview hasil sebelum konfirmasi** —
 * bukan kotak hitam. Karena itu berkas ini mengembalikan rencana yang bisa dilihat, bukan langsung
 * menulis ledger.
 */
import type { Category, MoneyRules, Wallet } from './types.js';
import { applyAutoSplit, canChildMoveFrom } from './rules.js';

export interface SortSlot {
  wallet: Wallet;
  category: Category;
  /** usulan dari auto-split ortu */
  amount: number;
  /**
   * Bolehkah anak mengubah angka ini sendiri?
   * Strict = false: pembagian terkunci, uang tidak bisa keluar dari tugas yang sudah diberikan.
   */
  editable: boolean;
}

export interface SortPlan {
  slots: SortSlot[];
  /** sisa yang tetap tinggal di Unsorted. Selalu 0 kalau Strict + rasio sah (100%). */
  remainderToUnsorted: number;
  /** true = anak hanya bisa mengonfirmasi, tidak bisa menggeser angka */
  locked: boolean;
  /**
   * Rasio yang benar-benar berlaku, untuk ditampilkan apa adanya.
   * JANGAN pernah menulis "40/40/20" sebagai teks mati di komponen (A-sisa-1).
   */
  ratios: Partial<Record<Category, number>>;
  /** auto-split mati → semua mendarat di Unsorted, anak menyortir manual */
  autoSplitEnabled: boolean;
}

/**
 * Menyusun rencana Sort untuk sejumlah uang di Unsorted.
 *
 * Catatan soal Strict: `canChildMoveFrom` mengembalikan false untuk SEMUA wallet di mode Strict,
 * termasuk Unsorted — dan itu benar. Di Strict anak memang tidak memilih; auto-split ortu yang
 * menentukan, dan rasio wajib habis 100% (`validateAutoSplit`). Yang dilihat anak adalah hasilnya,
 * bukan kotak isian.
 */
export function sortPlan(amount: number, rules: MoneyRules, wallets: Wallet[]): SortPlan {
  const { autoSplit } = rules;
  const split = applyAutoSplit(amount, rules);
  const byId = new Map(wallets.map((w) => [w.id, w]));

  const unsorted = wallets.find((w) => w.category === 'unsorted');
  // Satu titik kebenaran untuk "boleh digeser": aturan yang sama dengan perpindahan uang biasa.
  const editable = unsorted ? canChildMoveFrom(unsorted, rules) : false;

  const slots: SortSlot[] = [];
  for (const target of split.targets) {
    const wallet = byId.get(target.walletId);
    // Tujuan yang menunjuk wallet tak dikenal tidak boleh diam-diam menelan uang.
    if (!wallet) continue;
    slots.push({ wallet, category: target.category, amount: target.amount, editable });
  }

  // Rupiah yang tujuannya tidak ketemu tetap harus ada di suatu tempat (I1).
  const placed = slots.reduce((sum, s) => sum + s.amount, 0);
  const remainderToUnsorted = amount - placed;

  return {
    slots,
    remainderToUnsorted,
    locked: !editable,
    ratios: autoSplit.ratios,
    autoSplitEnabled: autoSplit.enabled,
  };
}

/**
 * Bolehkah anak membuka layar Sort sama sekali?
 * Selalu boleh — bahkan di Strict, karena melihat ke mana uangnya pergi adalah pelajarannya.
 * Yang berbeda hanya apakah ia boleh menggeser angkanya.
 */
export function canOpenSort(unsortedBalance: number): boolean {
  return unsortedBalance > 0;
}
