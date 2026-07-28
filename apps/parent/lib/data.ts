/**
 * SATU-SATUNYA sumber data app ortu. Pola sama dengan console & app anak:
 * ganti isi `getParentData()` saat S1b jalan, `app/` tidak berubah.
 *
 * Angka diambil dari seed kanonik — X2/X3/X4 (target dream, request pending, rasio) sudah
 * benar di sana. Jangan pernah mengetik ulang angkanya di sisi ortu; itu justru cara ketiga
 * penyimpangan itu lahir dulu.
 */
import {
  CHILD_ARTHUR,
  POCKETS,
  SEED_ALLOWANCE,
  SEED_LEDGER,
  SEED_PRICES,
  SEED_REQUESTS,
  SEED_TD_START,
  SEED_TODAY,
  SEED_RULES,
  SEED_WALLETS,
  pocketBalances,
  promiseDebt,
  sendLandsIn,
  takeTargets,
  totalBalance,
  walletBalances,
  type AllowanceSchedule,
  type MoneyRequest,
  type MoneyRules,
  type Prices,
  type Pocket,
  type TakeTarget,
  type Tier,
  type Wallet,
} from '@nummi/core';

export { POCKETS };
export type { AllowanceSchedule, MoneyRequest, Pocket, Prices, TakeTarget, Wallet };

export interface ChildView {
  id: string;
  name: string;
  tier: Tier;
  avatar: string;
  total: number;
  pockets: Record<Pocket, number>;
  balances: Record<string, number>;
  wallets: Wallet[];
  requests: MoneyRequest[];
  /** menunggu keputusan ortu */
  openRequests: MoneyRequest[];
  /** sudah disetujui tapi belum ditepati — metrik kepercayaan */
  promiseDebt: MoneyRequest[];
  rules: MoneyRules;
  takeTargets: TakeTarget[];
  unsortedWallet?: Wallet;
  allowance: AllowanceSchedule;
  /** instrumen Grow + modal & nilai sekarang, keduanya dari ledger */
  investments: { wallet: Wallet; rupiahIn: number; valueNow: number }[];
}

export interface ParentData {
  parentName: string;
  children: ChildView[];
  prices: Prices;
  /** "hari ini" dari seed — pratinjau tanggal tidak boleh bergantung jam mesin */
  today: string;
  tdStart: string;
}

function buildChild(): ChildView {
  const wallets = SEED_WALLETS;
  const byWallet = walletBalances(SEED_LEDGER);

  return {
    id: CHILD_ARTHUR.id,
    name: CHILD_ARTHUR.name,
    tier: CHILD_ARTHUR.tier,
    avatar: CHILD_ARTHUR.avatar,
    total: totalBalance(SEED_LEDGER, wallets),
    pockets: pocketBalances(SEED_LEDGER, wallets),
    balances: byWallet,
    wallets,
    requests: SEED_REQUESTS,
    openRequests: SEED_REQUESTS.filter(
      (r) => r.status === 'needs_ok' || r.status === 'talk_about_it',
    ),
    promiseDebt: promiseDebt(SEED_REQUESTS),
    rules: SEED_RULES,
    takeTargets: takeTargets(wallets),
    unsortedWallet: sendLandsIn(wallets),
    allowance: SEED_ALLOWANCE,
    // Modal & nilai KEDUANYA dari ledger — harga hanya menjelaskan (lihat core/grow.ts).
    investments: wallets
      .filter((w) => w.category === 'grow')
      .map((wallet) => ({
        wallet,
        rupiahIn: SEED_LEDGER
          .filter((e) => e.reason === 'grow_in' && e.toWalletId === wallet.id)
          .reduce((sum, e) => sum + e.amount, 0),
        valueNow: byWallet[wallet.id] ?? 0,
      })),
  };
}

export function getParentData(): ParentData {
  // Multi-anak sudah jadi bentuk datanya sejak awal: strip pending harus PER-ANAK,
  // bukan gabungan semua anak (perbaikan lintas-app yang sudah dikunci).
  return {
    parentName: 'Ayah',
    children: [buildChild()],
    prices: SEED_PRICES,
    today: SEED_TODAY,
    tdStart: SEED_TD_START,
  };
}

export function findChild(data: ParentData, id?: string): ChildView {
  return data.children.find((c) => c.id === id) ?? data.children[0]!;
}
