/**
 * Ledger: saldo selalu DIHITUNG, tidak pernah disimpan (ADR-0014).
 *
 * Catatan penting soal invariant I1 (`Unsorted + Spend + Save + Give + Grow = Total`):
 * kalau perpindahan internal selalu satu baris dengan `from` DAN `to` terisi, invariant itu
 * BENAR SECARA KONSTRUKSI — melanggarnya butuh baris yang tidak sah, bukan sekadar salah hitung.
 * Jadi yang tersisa untuk diperiksa harian bukan I1 itu sendiri, melainkan hal-hal yang bisa
 * membuat baris tidak sah masuk. Itulah isi `checkLedgerHealth()`.
 */
import type { Category, LedgerEntry, Pocket, Wallet } from './types.js';

export const POCKETS: Pocket[] = ['unsorted', 'spend', 'save', 'give', 'grow'];
export const CATEGORIES: Category[] = ['spend', 'save', 'give', 'grow'];

/** Saldo per wallet, diturunkan dari ledger. */
export function walletBalances(entries: LedgerEntry[]): Record<string, number> {
  const balances: Record<string, number> = {};
  for (const e of entries) {
    if (e.fromWalletId) balances[e.fromWalletId] = (balances[e.fromWalletId] ?? 0) - e.amount;
    if (e.toWalletId) balances[e.toWalletId] = (balances[e.toWalletId] ?? 0) + e.amount;
  }
  return balances;
}

/** Saldo per kantong (kategori + unsorted). */
export function pocketBalances(entries: LedgerEntry[], wallets: Wallet[]): Record<Pocket, number> {
  const byWallet = walletBalances(entries);
  const totals = Object.fromEntries(POCKETS.map((p) => [p, 0])) as Record<Pocket, number>;
  for (const w of wallets) {
    totals[w.category] += byWallet[w.id] ?? 0;
  }
  return totals;
}

export function totalBalance(entries: LedgerEntry[], wallets: Wallet[]): number {
  const pockets = pocketBalances(entries, wallets);
  return POCKETS.reduce((sum, p) => sum + pockets[p], 0);
}

/**
 * Little (KG–Gr1) tidak punya Grow — nilainya dilebur ke Save di tampilan.
 * Model datanya tetap identik untuk ketiga tier (handoff: "beda hanya tampilan & izin").
 */
export function pocketBalancesForTier(
  entries: LedgerEntry[],
  wallets: Wallet[],
  tier: 'little' | 'middle' | 'teen',
): Record<Pocket, number> {
  const pockets = pocketBalances(entries, wallets);
  if (tier !== 'little') return pockets;
  return { ...pockets, save: pockets.save + pockets.grow, grow: 0 };
}

export interface LedgerHealthIssue {
  kind: 'negative_balance' | 'orphan_wallet' | 'nonpositive_amount' | 'entry_without_side';
  detail: string;
}

/**
 * Pemeriksa kesehatan ledger — dijalankan harian di produksi.
 * Temuan apa pun di sini adalah insiden P0 (backlog console).
 */
export function checkLedgerHealth(entries: LedgerEntry[], wallets: Wallet[]): LedgerHealthIssue[] {
  const issues: LedgerHealthIssue[] = [];
  const known = new Set(wallets.map((w) => w.id));

  for (const e of entries) {
    if (e.amount <= 0) {
      issues.push({ kind: 'nonpositive_amount', detail: `baris ${e.id} bernilai ${e.amount}` });
    }
    if (!e.fromWalletId && !e.toWalletId) {
      issues.push({ kind: 'entry_without_side', detail: `baris ${e.id} tidak punya sisi mana pun` });
    }
    for (const id of [e.fromWalletId, e.toWalletId]) {
      if (id && !known.has(id)) {
        issues.push({ kind: 'orphan_wallet', detail: `baris ${e.id} menunjuk wallet tak dikenal ${id}` });
      }
    }
  }

  const balances = walletBalances(entries);
  for (const [walletId, amount] of Object.entries(balances)) {
    if (amount < 0) {
      issues.push({ kind: 'negative_balance', detail: `wallet ${walletId} bersaldo ${amount}` });
    }
  }

  return issues;
}
