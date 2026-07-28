/**
 * SATU-SATUNYA sumber data app anak.
 *
 * ── Titik tukar S1b ──────────────────────────────────────────────────────────
 * Hari ini datanya dari seed kanonik `@nummi/core`. Saat migrasi Supabase dijalankan,
 * cukup ganti isi `getKidData()` dengan query — tidak ada berkas di `app/` yang berubah.
 *
 * Semua turunan dihitung `@nummi/core`. App anak tidak pernah menghitung ulang angka sendiri,
 * dan TIDAK PERNAH menulis nominal atau rasio sebagai teks mati (X1, A-sisa-1).
 */
import {
  CHILD_ARTHUR,
  POCKETS,
  SEED_ECONOMY,
  SEED_LEDGER,
  SEED_REQUESTS,
  SEED_RULES,
  SEED_WALLETS,
  pocketBalancesForTier,
  promiseDebt,
  sortPlan,
  totalBalance,
  walletBalances,
  type MoneyRequest,
  type MoneyRules,
  type Pocket,
  type RuleMode,
  type SortPlan,
  type Tier,
  type Wallet,
} from '@nummi/core';

export { POCKETS };
export type { MoneyRequest, Pocket, SortPlan, Wallet };

export interface WalletRow {
  wallet: Wallet;
  balance: number;
}

export interface KidData {
  child: { name: string; tier: Tier; avatar: string };
  total: number;
  pockets: Record<Pocket, number>;
  wallets: WalletRow[];
  unsortedBalance: number;
  requests: MoneyRequest[];
  openRequests: MoneyRequest[];
  promiseDebt: MoneyRequest[];
  rules: MoneyRules;
  plan: SortPlan;
  economy: typeof SEED_ECONOMY;
}

/**
 * `mode` hanya alat demo (query `?mode=strict`) supaya penegakan Strict bisa dilihat tanpa
 * app ortu. Di produksi mode datang dari `money_rules` milik ortu, bukan dari URL.
 */
export function getKidData(mode?: RuleMode): KidData {
  const wallets = SEED_WALLETS;
  const ledger = SEED_LEDGER;
  const rules: MoneyRules = mode ? { ...SEED_RULES, mode } : SEED_RULES;

  const byWallet = walletBalances(ledger);
  const pockets = pocketBalancesForTier(ledger, wallets, CHILD_ARTHUR.tier);
  const unsortedBalance = byWallet['w_unsorted'] ?? 0;

  return {
    child: { name: CHILD_ARTHUR.name, tier: CHILD_ARTHUR.tier, avatar: CHILD_ARTHUR.avatar },
    total: totalBalance(ledger, wallets),
    pockets,
    wallets: wallets.map((wallet) => ({ wallet, balance: byWallet[wallet.id] ?? 0 })),
    unsortedBalance,
    requests: SEED_REQUESTS,
    openRequests: SEED_REQUESTS.filter((r) => r.status === 'needs_ok' || r.status === 'talk_about_it'),
    promiseDebt: promiseDebt(SEED_REQUESTS),
    rules,
    plan: sortPlan(unsortedBalance, rules, wallets),
    economy: SEED_ECONOMY,
  };
}
