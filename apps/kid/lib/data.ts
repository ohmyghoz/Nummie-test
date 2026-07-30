/**
 * SATU-SATUNYA sumber data app anak.
 *
 * ── Titik tukar S1b: SUDAH DITUKAR (29 Juli 2026) ─────────────────────────────
 * Dulu berkas ini membaca seed kanonik `@nummi/core`. Sekarang wallet, ledger, aturan uang,
 * request, dan ekonomi datang dari Supabase — dibaca dengan token anak, jadi RLS yang
 * memutuskan apa yang terlihat, bukan kode di sini.
 *
 * **Yang MASIH dari seed, dan kenapa:**
 *   - `prices`   — SUDAH dari `daily_prices` (0013), tapi isinya masih **data dummy** sampai
 *                  feed dibangun (backlog T). Sumbernya database, jadi feed nanti tinggal
 *                  menambah baris tanpa mengubah kode di sini.
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
  availableJobs,
  bigPrizesUnlocked,
  limitsFor,
  choresUnlocked,
  closedGiving,
  growPosition,
  growInSources,
  growInTargets,
  harvestDestinations,
  pocketBalancesForTier,
  promiseDebt,
  sortPlan,
  totalBalance,
  walletBalances,
  type Economy,
  type GrowPosition,
  type Job,
  type LedgerEntry,
  type Prize,
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
  economy: Economy & { chaptersTotal: number };
  /** job yang boleh dikerjakan sekarang — yang tergerbang tidak ikut (I3) */
  jobs: Job[];
  prizes: Prize[];
  grow: GrowRow[];
  harvestTargets: Wallet[];
  /** kantong yang boleh mendanai Grow — dream TIDAK PERNAH ada di sini (ADR-0005) */
  growInSources: Wallet[];
  /** instrumen yang siap menerima setoran; deposito yang sedang berjalan tidak ikut (0014) */
  growInTargets: Wallet[];
  /**
   * KAPABILITAS yang aktif — bukan plan.
   *
   * App anak tidak pernah tahu keluarganya "Free" atau "Pro", dan itu disengaja (C1). Ia hanya
   * tahu apa yang ada. Fitur yang tidak aktif **tidak dirender**; tidak ada gembok, tidak ada
   * "upgrade untuk membuka". Produk ini mengajari anak menahan impuls konsumtif — memakai impuls
   * anak untuk berjualan akan membunuh premisnya.
   */
  can: { grow: boolean };
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
  const [
    childRes, walletRes, ledgerRes, rulesRes, requestRes, economyRes,
    gemRes, proRes, jobRes, prizeRes, ratesRes, pricesRes,
  ] = await Promise.all([
    db.from('children').select('id, name, tier').limit(1).maybeSingle(),
    db.from('wallets').select('id, child_id, name, category, kind, target_amount, instrument, tenor_months, locked_rate_pct, started_at')
      .is('archived_at', null).order('created_at'),
    db.from('ledger_entries').select('id, child_id, from_wallet_id, to_wallet_id, amount, reason, created_at')
      .order('created_at'),
    db.from('money_rules').select('child_id, mode, auto_split_enabled, ratios, destinations').maybeSingle(),
    db.from('requests').select('id, child_id, kind, amount, source_wallet_id, destination_wallet_id, reason, status, fulfilment, fulfilment_story, job_id, prize_id')
      .order('created_at', { ascending: false }),
    db.from('child_economy').select('stars_balance, stars_lifetime').maybeSingle(),
    // 💎 diturunkan dari ledger-nya (0015), bukan dibaca dari penghitung — pola sama dengan uang.
    db.from('gem_balances').select('balance').maybeSingle(),
    /*
     * Resolver yang SAMA yang dipakai app ortu (ADR-0010). App anak memakainya untuk memutuskan
     * apa yang DIRENDER, bukan untuk memasang gembok — C1: fitur yang tidak aktif tidak tampil,
     * dan tidak ada `<ProLock/>` di app anak.
     */
    db.rpc('my_family_is_pro'),
    db.from('jobs').select('id, child_id, kind, title, reward, amount, frequency')
      .is('archived_at', null).order('created_at'),
    db.from('prizes').select('id, child_id, title, gem_cost')
      .is('archived_at', null).order('gem_cost'),
    // Bunga bank tidak dipakai layar anak, tapi `Prices` di core satu bentuk — jadi ikut dibaca
    // supaya angka yang dilihat anak dan ortu berasal dari baris yang sama.
    db.from('bank_rates').select('m3, m6, m12').maybeSingle(),
    db.from('daily_prices')
      .select('price_date, gold_sell_per_gram, gold_buyback_per_gram, fx_mid, fx_spread')
      .order('price_date', { ascending: false }).limit(1).maybeSingle(),
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
    // Kesepakatan deposito yang dibekukan saat approval (0014). Dibaca semua permukaan supaya
    // hitung mundur & bunga berasal dari baris yang sama, bukan dari tenor yang ditebak.
    tenorMonths: (w.tenor_months ?? undefined) as Wallet['tenorMonths'],
    lockedRatePct: w.locked_rate_pct === null ? undefined : Number(w.locked_rate_pct),
    startedAt: w.started_at ?? undefined,
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
    jobId: r.job_id ?? undefined,
    prizeId: r.prize_id ?? undefined,
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

  /**
   * ⭐ tetap penghitung, 💎 dari ledger. Bukan inkonsistensi: ⭐ hanya membeli kosmetik in-app,
   * 💎 ditukar jadi hadiah dunia nyata — pembedaan yang sama dengan ADR-0004.
   *
   * `weeklyMaterialDone` sengaja TIDAK diset: kurikulum belum punya tabel, dan `undefined`
   * berarti "belum ada materi mingguan", bukan "belum selesai" (lihat canRedeemGems di core).
   */
  const economy: Economy & { chaptersTotal: number } = {
    starsBalance: economyRes.data?.stars_balance ?? 0,
    starsLifetime: economyRes.data?.stars_lifetime ?? 0,
    gems: Number(gemRes.data?.balance ?? 0),
    chaptersDone: CHAPTERS_DONE,
    chaptersTotal: CHAPTERS_TOTAL,
  };

  const allJobs: Job[] = (jobRes.data ?? []).map((j) => ({
    id: j.id, childId: j.child_id, kind: j.kind, title: j.title,
    reward: j.reward, amount: Number(j.amount), frequency: j.frequency,
  }));

  // Disusun dari dua tabel (0013 memisahkan harga-feed dari bunga-yang-ditetapkan-ortu), lalu
  // dikembalikan sebagai satu bentuk `Prices` supaya core & UI tidak perlu tahu pemisahannya.
  const dbPrices = pricesRes.data;
  const dbRates = ratesRes.data;
  const prices: Prices = {
    goldSellPerGram: Number(dbPrices?.gold_sell_per_gram ?? SEED_PRICES.goldSellPerGram),
    goldBuybackPerGram: Number(dbPrices?.gold_buyback_per_gram ?? SEED_PRICES.goldBuybackPerGram),
    fxMid: (dbPrices?.fx_mid ?? SEED_PRICES.fxMid) as Record<string, number>,
    fxSpread: Number(dbPrices?.fx_spread ?? SEED_PRICES.fxSpread),
    bankRates: {
      m3: Number(dbRates?.m3 ?? SEED_PRICES.bankRates.m3),
      m6: Number(dbRates?.m6 ?? SEED_PRICES.bankRates.m6),
      m12: Number(dbRates?.m12 ?? SEED_PRICES.bankRates.m12),
    },
    updatedAt: String(dbPrices?.price_date ?? SEED_PRICES.updatedAt),
  };

  return {
    grow,
    balances: byWallet,
    harvestTargets: harvestDestinations(wallets),
    growInSources: growInSources(wallets),
    growInTargets: growInTargets(wallets),
    can: { grow: limitsFor(proRes.data === true ? 'pro' : 'free').grow },
    giveBalance: giveWallet ? byWallet[giveWallet.id] ?? 0 : 0,
    giveWalletId: giveWallet?.id ?? '',
    unsortedWalletId: unsortedWallet?.id ?? '',
    givingStories: closedGiving(requests),
    prices,
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
    economy,
    jobs: availableJobs(allJobs, choresUnlocked(economy), bigPrizesUnlocked(economy)),
    prizes: (prizeRes.data ?? []).map((p) => ({
      id: p.id, childId: p.child_id, title: p.title, gemCost: p.gem_cost,
    })),
  };
}
