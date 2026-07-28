/**
 * SATU-SATUNYA sumber data console.
 *
 * ── Titik tukar S1b ──────────────────────────────────────────────────────────
 * Hari ini datanya berasal dari seed kanonik `@nummi/core` (SEED_*). Ketika migrasi
 * Supabase dijalankan (S1b), CUKUP ganti isi fungsi `getConsoleData()` di berkas ini
 * dengan query ke view SQL — komponen UI tidak menyentuh seed langsung, jadi tidak ada
 * satu pun berkas di `app/` yang perlu diubah. Console tetap BACA-SAJA (C-1).
 *
 * Semua turunan (saldo, kantong, total, utang janji, kesehatan ledger) dihitung oleh
 * fungsi `@nummi/core` — console tidak pernah menghitung ulang angka sendiri.
 */
import {
  CHILD_ARTHUR,
  POCKETS,
  SEED_LEDGER,
  SEED_REQUESTS,
  SEED_TOTAL,
  SEED_WALLETS,
  checkLedgerHealth,
  pocketBalances,
  promiseDebt,
  totalBalance,
  walletBalances,
  type LedgerEntry,
  type LedgerHealthIssue,
  type MoneyRequest,
  type Pocket,
  type Tier,
  type Wallet,
} from '@nummi/core';

export { POCKETS };
export type { LedgerEntry, LedgerHealthIssue, MoneyRequest, Pocket, Wallet };

export interface WalletBalance {
  wallet: Wallet;
  balance: number;
}

export interface InvariantResult {
  /** rincian per kantong: Unsorted + Spend + Save + Give + Grow */
  pockets: Record<Pocket, number>;
  /** jumlah kantong = jumlah seluruh saldo wallet (benar secara konstruksi, ADR-0014) */
  pocketSum: number;
  /** total uang riil = jumlah seluruh saldo wallet */
  total: number;
  /** I1 terpenuhi: jumlah kantong == total */
  i1Holds: boolean;
  /** rekonsiliasi dengan angka kanonik handoff (Rp484.711) */
  reconcilesCanonical: boolean;
  canonicalTotal: number;
  /** temuan pemeriksa kesehatan ledger — apa pun di sini = insiden P0 */
  health: LedgerHealthIssue[];
}

export interface ChildView {
  id: string;
  name: string;
  tier: Tier;
  avatar: string;
  walletBalances: WalletBalance[];
  pockets: Record<Pocket, number>;
  total: number;
  ledger: LedgerEntry[];
  requests: MoneyRequest[];
  promiseDebt: MoneyRequest[];
  invariant: InvariantResult;
}

export interface FamilyView {
  id: string;
  name: string;
  children: ChildView[];
}

export interface ConsoleData {
  families: FamilyView[];
  /** ringkasan lintas-keluarga untuk header operator */
  totals: {
    families: number;
    children: number;
    openRequests: number;
    promiseDebt: number;
    p0Incidents: number;
  };
}

function buildChildView(): ChildView {
  const wallets = SEED_WALLETS;
  const ledger = SEED_LEDGER;
  const requests = SEED_REQUESTS;

  const byWallet = walletBalances(ledger);
  const pockets = pocketBalances(ledger, wallets);
  const total = totalBalance(ledger, wallets);
  const pocketSum = POCKETS.reduce((sum, p) => sum + pockets[p], 0);
  const health = checkLedgerHealth(ledger, wallets);

  const invariant: InvariantResult = {
    pockets,
    pocketSum,
    total,
    i1Holds: pocketSum === total,
    reconcilesCanonical: total === SEED_TOTAL,
    canonicalTotal: SEED_TOTAL,
    health,
  };

  return {
    id: CHILD_ARTHUR.id,
    name: CHILD_ARTHUR.name,
    tier: CHILD_ARTHUR.tier,
    avatar: CHILD_ARTHUR.avatar,
    walletBalances: wallets.map((wallet) => ({ wallet, balance: byWallet[wallet.id] ?? 0 })),
    pockets,
    total,
    ledger,
    requests,
    promiseDebt: promiseDebt(requests),
    invariant,
  };
}

/**
 * Titik tukar S1b: ganti isi fungsi ini dengan query view Supabase saat migrasi dijalankan.
 * Bentuk kembaliannya (ConsoleData) yang dijaga stabil, bukan sumbernya.
 */
export function getConsoleData(): ConsoleData {
  const arthur = buildChildView();
  const families: FamilyView[] = [
    { id: 'fam_arthur', name: 'Keluarga Arthur', children: [arthur] },
  ];

  const children = families.flatMap((f) => f.children);
  return {
    families,
    totals: {
      families: families.length,
      children: children.length,
      openRequests: children.reduce(
        (n, c) => n + c.requests.filter((r) => r.status === 'needs_ok').length,
        0,
      ),
      promiseDebt: children.reduce((n, c) => n + c.promiseDebt.length, 0),
      p0Incidents: children.reduce((n, c) => n + c.invariant.health.length, 0),
    },
  };
}
