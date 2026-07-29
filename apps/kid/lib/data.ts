/**
 * SATU-SATUNYA sumber data app anak.
 *
 * ── Titik tukar S1b: SUDAH DITUKAR (29 Juli 2026) ─────────────────────────────
 * Dulu berkas ini membaca seed kanonik `@nummi/core`. Sekarang wallet, ledger, aturan uang,
 * request, dan ekonomi datang dari Supabase — dibaca dengan token anak, jadi RLS yang
 * memutuskan apa yang terlihat, bukan kode di sini.
 *
 * **Yang MASIH dari seed, dan kenapa:**
 *   - `prices`   — feed harga sengaja di luar cakupan S1–S3 (backlog T). Belum ada tabelnya.
 *   - `economy.chaptersDone/Total` — kurikulum Missions belum punya tabel sama sekali.
 *   - `child.avatar` — `children` belum punya kolomnya; avatar shop (Fase 4) belum persisten.
 * Artinya Home/Wallets/Sort menampilkan angka sungguhan, sementara Grow dan Missions masih
 * setengah demo. Itu keadaan yang disengaja untuk irisan pertama, bukan yang terlewat.
 *
 * ── Yang TIDAK berubah, dan itu disengaja ────────────────────────────────────
 * Saldo TIDAK diambil dari view `wallet_balances`. Ia tetap dihitung `@nummi/core` dari baris
 * ledger, persis seperti sebelumnya. Dengan begitu I1 dijaga kode yang sama yang diuji 176 test,
 * dan view di database jadi **pemeriksa silang yang independen** — bukan sumber kebenaran kedua
 * yang bisa menyimpang diam-diam.
 *
 * App anak juga tetap tidak pernah menghitung ulang angka sendiri dan tidak pernah menulis
 * nominal atau rasio sebagai teks mati (X1, A-sisa-1).
 */
import { redirect } from 'next/navigation';
import {
  POCKETS,
  SEED_PRICES,
  closedGiving,
  growPosition,
  harvestDestinations,
  pocketBalancesForTier,
  promiseDebt,
  sortPlan,
  totalBalance,
  walletBalances,
  type GrowPosition,
  type LedgerEntry,
  type MoneyRequest,
  type MoneyRules,
  type Pocket,
  type Prices,
  type RuleMode,
  type SortPlan,
  type Tier,
  type Wallet,
} from '@nummi/core';
import { childToken, clientWithToken } from './supabase';

export { POCKETS };
export type { GrowPosition, MoneyRequest, Pocket, Prices, SortPlan, Wallet };

export interface WalletRow {
  wallet: Wallet;
  balance: number;
}

export interface GrowRow {
  wallet: Wallet;
  position: GrowPosition;
}

export interface KidData {
  child: { id: string; name: string; tier: Tier; avatar: string };
  total: number;
  pockets: Record<Pocket, number>;
  wallets: WalletRow[];
  unsortedBalance: number;
  requests: MoneyRequest[];
  openRequests: MoneyRequest[];
  promiseDebt: MoneyRequest[];
  rules: MoneyRules;
  plan: SortPlan;
  economy: { starsBalance: number; starsLifetime: number; gems: number; chaptersDone: number; chaptersTotal: number };
  grow: GrowRow[];
  harvestTargets: Wallet[];
  giveBalance: number;
  /** id wallet Give — dicari lewat `kind`, tidak pernah ditulis mati (id kini UUID) */
  giveWalletId: string;
  /** id wallet Unsorted — asal semua baris Sort. Sama alasannya: id kini UUID */
  unsortedWalletId: string;
  givingStories: MoneyRequest[];
  prices: Prices;
  /** saldo per wallet — dipakai flow Move untuk pratinjau */
  balances: Record<string, number>;
}

/** Sementara, sampai `children` punya kolomnya dan avatar shop jadi persisten (Fase 4). */
const AVATAR_DEFAULT = '🦊';
/** Sementara, sampai kurikulum Missions punya tabel. */
const CHAPTERS_TOTAL = 6;
const CHAPTERS_DONE = 1;

/**
 * `mode` hanya alat demo (query `?mode=strict`) supaya penegakan Strict bisa dilihat tanpa
 * app ortu. Di produksi mode datang dari `money_rules` milik ortu, bukan dari URL.
 */
export async function getKidData(mode?: RuleMode): Promise<KidData> {
  const token = await childToken();
  if (!token) redirect('/login');

  const db = clientWithToken(token);

  // Satu perjalanan, bukan enam berurutan. Kelimanya tidak saling bergantung.
  const [childRes, walletRes, ledgerRes, rulesRes, requestRes, economyRes] = await Promise.all([
    db.from('children').select('id, name, tier').limit(1).maybeSingle(),
    db.from('wallets').select('id, child_id, name, category, kind, target_amount, instrument')
      .is('archived_at', null).order('created_at'),
    db.from('ledger_entries').select('id, child_id, from_wallet_id, to_wallet_id, amount, reason, created_at')
      .order('created_at'),
    db.from('money_rules').select('child_id, mode, auto_split_enabled, ratios, destinations').maybeSingle(),
    db.from('requests').select('id, child_id, kind, amount, source_wallet_id, reason, status, fulfilment, fulfilment_story')
      .order('created_at', { ascending: false }),
    db.from('child_economy').select('stars_balance, stars_lifetime, gems').maybeSingle(),
  ]);

  // Token kedaluwarsa (12 jam) tampak sebagai "tidak ada anak yang terlihat", bukan sebagai
  // galat. Perlakukan sebagai belum masuk — jangan tampilkan layar kosong yang membingungkan.
  if (childRes.error || !childRes.data) redirect('/login');

  const child = childRes.data;
  const wallets: Wallet[] = (walletRes.data ?? []).map((w) => ({
    id: w.id,
    childId: w.child_id,
    name: w.name,
    category: w.category as Pocket,
    kind: w.kind,
    targetAmount: w.target_amount ?? undefined,
    instrument: w.instrument ?? undefined,
  }));

  const ledger: LedgerEntry[] = (ledgerRes.data ?? []).map((l) => ({
    id: l.id,
    childId: l.child_id,
    fromWalletId: l.from_wallet_id,
    toWalletId: l.to_wallet_id,
    amount: Number(l.amount),   // bigint datang sebagai string
    reason: l.reason,
    createdAt: l.created_at,
  }));

  const requests: MoneyRequest[] = (requestRes.data ?? []).map((r) => ({
    id: r.id,
    childId: r.child_id,
    kind: r.kind,
    amount: Number(r.amount ?? 0),
    sourceWalletId: r.source_wallet_id ?? undefined,
    reason: r.reason ?? undefined,
    status: r.status,
    fulfilment: r.fulfilment,
    fulfilmentStory: r.fulfilment_story ?? undefined,
  }));

  const dbRules = rulesRes.data;
  const rules: MoneyRules = {
    childId: child.id,
    // `mode` dari URL hanya menimpa untuk demo; sumber sebenarnya tetap money_rules.
    mode: mode ?? (dbRules?.mode as RuleMode) ?? 'flexible',
    autoSplit: {
      enabled: dbRules?.auto_split_enabled ?? true,
      ratios: (dbRules?.ratios ?? {}) as MoneyRules['autoSplit']['ratios'],
      destinations: (dbRules?.destinations ?? {}) as MoneyRules['autoSplit']['destinations'],
    },
  };

  // Wallet dicari lewat KIND, bukan id. Id sekarang UUID; menuliskannya mati akan gagal
  // diam-diam, bukan meledak — jenis kegagalan yang paling mahal.
  const unsortedWallet = wallets.find((w) => w.kind === 'unsorted');
  const giveWallet = wallets.find((w) => w.kind === 'give_pool');

  const byWallet = walletBalances(ledger);
  const pockets = pocketBalancesForTier(ledger, wallets, child.tier as Tier);
  const unsortedBalance = unsortedWallet ? byWallet[unsortedWallet.id] ?? 0 : 0;

  // Modal yang dimasukkan anak ke tiap instrumen = jumlah baris `grow_in` ke wallet itu.
  // Nilai SEKARANG tetap saldo ledger — tidak pernah dihitung ulang dari harga (lihat grow.ts).
  const grow: GrowRow[] = wallets
    .filter((w) => w.category === 'grow')
    .map((wallet) => {
      const rupiahIn = ledger
        .filter((e) => e.reason === 'grow_in' && e.toWalletId === wallet.id)
        .reduce((sum, e) => sum + e.amount, 0);
      return { wallet, position: growPosition(rupiahIn, byWallet[wallet.id] ?? 0) };
    });

  const economy = economyRes.data;

  return {
    grow,
    balances: byWallet,
    harvestTargets: harvestDestinations(wallets),
    giveBalance: giveWallet ? byWallet[giveWallet.id] ?? 0 : 0,
    giveWalletId: giveWallet?.id ?? '',
    unsortedWalletId: unsortedWallet?.id ?? '',
    givingStories: closedGiving(requests),
    prices: SEED_PRICES,
    child: { id: child.id, name: child.name, tier: child.tier as Tier, avatar: AVATAR_DEFAULT },
    total: totalBalance(ledger, wallets),
    pockets,
    wallets: wallets.map((wallet) => ({ wallet, balance: byWallet[wallet.id] ?? 0 })),
    unsortedBalance,
    requests,
    openRequests: requests.filter((r) => r.status === 'needs_ok' || r.status === 'talk_about_it'),
    promiseDebt: promiseDebt(requests),
    rules,
    plan: sortPlan(unsortedBalance, rules, wallets),
    economy: {
      starsBalance: economy?.stars_balance ?? 0,
      starsLifetime: economy?.stars_lifetime ?? 0,
      gems: economy?.gems ?? 0,
      chaptersDone: CHAPTERS_DONE,
      chaptersTotal: CHAPTERS_TOTAL,
    },
  };
}
