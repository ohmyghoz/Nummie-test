/**
 * SATU-SATUNYA sumber data app ortu.
 *
 * ── Titik tukar S1b: SUDAH DITUKAR (30 Juli 2026) ────────────────────────────
 * Anak, wallet, ledger, request, dan aturan uang datang dari Supabase, dibaca dengan token
 * ORTU — jadi RLS yang memutuskan anak siapa yang terlihat, bukan kode di sini. Ortu yang
 * bukan anggota keluarga itu tidak melihat apa pun (sudah diuji per-role).
 *
 * **Masih dari seed, dan kenapa:** `today`/`tdStart` (tanggal acuan pratinjau) dan avatar anak
 * (`children` belum punya kolomnya).
 *
 * Uang saku, bunga bank, dan harga sudah punya tabelnya sendiri (migrasi 0013). Harga tetap
 * berisi **data dummy** sampai feed dibangun (backlog T) — tapi sumbernya sudah database, jadi
 * feed nanti tinggal menambah baris dan tidak ada kode yang perlu berubah.
 *
 * Saldo TIDAK diambil dari view `wallet_balances`: tetap dihitung `@nummi/core` dari baris
 * ledger, sama seperti app anak. Dua permukaan yang menghitung dengan kode yang sama tidak
 * bisa menampilkan angka yang berbeda — dan itu perbaikan K4/K5 di akarnya, bukan di layar.
 *
 * Jangan pernah mengetik ulang angka di sisi ortu; itu justru cara penyimpangan itu lahir dulu.
 */
import { redirect } from 'next/navigation';
import {
  POCKETS,
  SEED_PRICES,
  SEED_TD_START,
  SEED_TODAY,
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
  type Economy,
  type Job,
  type LedgerEntry,
  type Prize,
  type RuleMode,
  type Tier,
  type Wallet,
} from '@nummi/core';
import { clientWithToken, parentToken } from './supabase';

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
  /** job & hadiah yang sudah tersimpan (0015) — layar builder tidak pernah bisa menampilkannya */
  jobs: Job[];
  prizes: Prize[];
  /** 💎 dari ledger-nya sendiri, bukan penghitung */
  gems: number;
  /**
   * Ekonomi anak, supaya ortu bisa melihat status ketiga gerbang (handoff §82 — Learning
   * tracker). Sampai 30 Juli 2026 app ortu TIDAK PERNAH membaca `child_economy`, jadi kartu ini
   * tidak mungkin dibangun walau sudah lama ada di spec.
   */
  economy: Economy;
}

export interface ParentData {
  parentId: string;
  parentName: string;
  children: ChildView[];
  prices: Prices;
  /** "hari ini" dari seed — pratinjau tanggal tidak boleh bergantung jam mesin */
  today: string;
  tdStart: string;
}

/** Sementara, sampai `children` punya kolomnya (avatar shop Fase 4 belum persisten). */
const AVATAR_DEFAULT = '🦊';
/** Sementara, sampai kurikulum punya tabel — sama dengan `apps/kid/lib/data.ts`. */
const CHAPTERS_DONE = 1;

export async function getParentData(): Promise<ParentData> {
  const token = await parentToken();
  if (!token) redirect('/login');

  const db = clientWithToken(token);

  const [
    meRes, childRes, walletRes, ledgerRes, requestRes, rulesRes,
    allowanceRes, ratesRes, jobRes, prizeRes, gemRes, economyRes, pricesRes,
  ] = await Promise.all([
    db.from('parents').select('id, display_name').limit(1).maybeSingle(),
    db.from('children').select('id, name, tier').order('created_at'),
    db.from('wallets').select('id, child_id, name, category, kind, target_amount, instrument, tenor_months, locked_rate_pct, started_at')
      .is('archived_at', null).order('created_at'),
    db.from('ledger_entries')
      .select('id, child_id, from_wallet_id, to_wallet_id, amount, reason, created_at')
      .order('created_at'),
    db.from('requests')
      .select('id, child_id, kind, amount, source_wallet_id, destination_wallet_id, harvest_choice, reason, status, fulfilment, fulfilment_story, job_id, prize_id')
      .order('created_at', { ascending: false }),
    db.from('money_rules').select('child_id, mode, auto_split_enabled, ratios, destinations'),
    db.from('allowance_schedules')
      .select('child_id, enabled, amount, frequency, day, anchor_date'),
    db.from('bank_rates').select('m3, m6, m12').maybeSingle(),
    db.from('jobs').select('id, child_id, kind, title, reward, amount, frequency')
      .is('archived_at', null).order('created_at'),
    db.from('prizes').select('id, child_id, title, gem_cost')
      .is('archived_at', null).order('gem_cost'),
    db.from('gem_balances').select('child_id, balance'),
    db.from('child_economy').select('child_id, stars_balance, stars_lifetime'),
    // Baris terbaru = harga hari ini. Riwayatnya tetap ada (price_date jadi PK di 0013), jadi
    // nilai lama anak masih bisa dijelaskan kalau harga berubah — syarat backlog T.
    db.from('daily_prices')
      .select('price_date, gold_sell_per_gram, gold_buyback_per_gram, fx_mid, fx_spread')
      .order('price_date', { ascending: false }).limit(1).maybeSingle(),
  ]);

  // Token kedaluwarsa (~1 jam, U-11) tampak sebagai "tidak ada ortu yang terlihat".
  // Perlakukan sebagai belum masuk, bukan sebagai layar kosong yang membingungkan.
  if (meRes.error || !meRes.data) redirect('/login');

  /**
   * `Prices` di core mencampur harga feed DAN bunga bank yang ditetapkan ortu. Di database
   * keduanya sengaja dipisah (0013) karena penulisnya berbeda — mesin vs manusia. Di sini
   * keduanya disusun kembali jadi satu bentuk baca, supaya UI dan `@nummi/core` tidak perlu
   * tahu-menahu soal pemisahan itu.
   */
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

  const allWallets: Wallet[] = (walletRes.data ?? []).map((w) => ({
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

  const allLedger: LedgerEntry[] = (ledgerRes.data ?? []).map((l) => ({
    id: l.id,
    childId: l.child_id,
    fromWalletId: l.from_wallet_id,
    toWalletId: l.to_wallet_id,
    amount: Number(l.amount),   // bigint datang sebagai string
    reason: l.reason,
    createdAt: l.created_at,
  }));

  const allRequests: MoneyRequest[] = (requestRes.data ?? []).map((r) => ({
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

  /**
   * Jadwal uang saku PER ANAK — dan itu inti dari migrasi 0013.
   *
   * Sebelumnya baris ini `allowance: SEED_ALLOWANCE`, satu objek yang sama untuk setiap anak di
   * dalam `children.map()`. Anak kedua otomatis mewarisi Rp50.000 mingguan tiap Senin tanpa ada
   * yang pernah memutuskannya.
   */
  const allowanceFor = (childId: string): AllowanceSchedule => {
    const row = (allowanceRes.data ?? []).find((a) => a.child_id === childId);
    return {
      enabled: row?.enabled ?? false,
      amount: Number(row?.amount ?? 0),
      frequency: (row?.frequency as AllowanceSchedule['frequency']) ?? 'weekly',
      day: Number(row?.day ?? 1),
      anchorDate: row?.anchor_date ?? undefined,
    };
  };

  /**
   * `chaptersDone` masih tetap 1 di sini, sama seperti di app anak — kurikulum belum punya tabel.
   * Konstanta yang sama disebut di dua tempat memang bau, tapi menyembunyikannya di core akan
   * membuatnya tampak seperti keputusan; ia sementara, dan lebih baik terlihat sementara.
   *
   * `weeklyMaterialDone` sengaja TIDAK diset: `undefined` berarti "belum ada materi mingguan",
   * bukan "belum selesai" (ADR-0004 §A3).
   */
  const economyFor = (childId: string): Economy => {
    const row = (economyRes.data ?? []).find((e) => e.child_id === childId);
    return {
      starsBalance: row?.stars_balance ?? 0,
      starsLifetime: row?.stars_lifetime ?? 0,
      gems: Number((gemRes.data ?? []).find((g) => g.child_id === childId)?.balance ?? 0),
      chaptersDone: CHAPTERS_DONE,
    };
  };

  // Multi-anak sudah jadi bentuk datanya sejak awal: strip pending harus PER-ANAK,
  // bukan gabungan semua anak (perbaikan lintas-app yang sudah dikunci).
  const children: ChildView[] = (childRes.data ?? []).map((c) => {
    const wallets = allWallets.filter((w) => w.childId === c.id);
    const ledger = allLedger.filter((e) => e.childId === c.id);
    const requests = allRequests.filter((r) => r.childId === c.id);
    const byWallet = walletBalances(ledger);
    const dbRules = (rulesRes.data ?? []).find((r) => r.child_id === c.id);

    const rules: MoneyRules = {
      childId: c.id,
      mode: (dbRules?.mode as RuleMode) ?? 'flexible',
      autoSplit: {
        enabled: dbRules?.auto_split_enabled ?? true,
        ratios: (dbRules?.ratios ?? {}) as MoneyRules['autoSplit']['ratios'],
        destinations: (dbRules?.destinations ?? {}) as MoneyRules['autoSplit']['destinations'],
      },
    };

    return {
      id: c.id,
      name: c.name,
      tier: c.tier as Tier,
      avatar: AVATAR_DEFAULT,
      total: totalBalance(ledger, wallets),
      pockets: pocketBalances(ledger, wallets),
      balances: byWallet,
      wallets,
      requests,
      openRequests: requests.filter(
        (r) => r.status === 'needs_ok' || r.status === 'talk_about_it',
      ),
      promiseDebt: promiseDebt(requests),
      rules,
      takeTargets: takeTargets(wallets),
      unsortedWallet: sendLandsIn(wallets),
      allowance: allowanceFor(c.id),
      jobs: (jobRes.data ?? []).filter((j) => j.child_id === c.id).map((j) => ({
        id: j.id, childId: j.child_id, kind: j.kind, title: j.title,
        reward: j.reward, amount: Number(j.amount), frequency: j.frequency,
      })),
      prizes: (prizeRes.data ?? []).filter((pr) => pr.child_id === c.id).map((pr) => ({
        id: pr.id, childId: pr.child_id, title: pr.title, gemCost: pr.gem_cost,
      })),
      gems: Number((gemRes.data ?? []).find((g) => g.child_id === c.id)?.balance ?? 0),
      economy: economyFor(c.id),
      // Modal & nilai KEDUANYA dari ledger — harga hanya menjelaskan (lihat core/grow.ts).
      investments: wallets
        .filter((w) => w.category === 'grow')
        .map((wallet) => ({
          wallet,
          rupiahIn: ledger
            .filter((e) => e.reason === 'grow_in' && e.toWalletId === wallet.id)
            .reduce((sum, e) => sum + e.amount, 0),
          valueNow: byWallet[wallet.id] ?? 0,
        })),
    };
  });

  return {
    parentId: meRes.data.id,
    parentName: meRes.data.display_name ?? 'Parent',
    children,
    prices,
    today: SEED_TODAY,
    tdStart: SEED_TD_START,
  };
}

export function findChild(data: ParentData, id?: string): ChildView {
  return data.children.find((c) => c.id === id) ?? data.children[0]!;
}
