/**
 * SATU-SATUNYA sumber data console.
 *
 * ── Titik tukar S1b: SUDAH DITUKAR (30 Juli 2026) ────────────────────────────
 * Datanya sekarang dari Supabase, LINTAS KELUARGA, lewat service role — dan itu memang alat
 * yang tepat di sini: console harus melihat semua keluarga sekaligus untuk menjawab pertanyaan
 * yang tidak bisa dijawab dari dalam satu keluarga ("apakah ada invarian yang pecah di suatu
 * tempat?"). Console tetap **BACA-SAJA** (C-1) — tidak ada satu pun penulisan di berkas ini.
 *
 * Semua turunan (saldo, kantong, total, utang janji, kesehatan ledger) tetap dihitung
 * `@nummi/core`, bukan oleh SQL. Itu yang membuat pemeriksaan silang di bawah punya arti:
 * core menghitung dari baris ledger, database menghitung lewat view `wallet_balances`, dan
 * console membandingkan keduanya. Kalau console memakai angka database untuk KEDUA sisi,
 * ia cuma membandingkan sesuatu dengan dirinya sendiri.
 */
import {
  POCKETS,
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
import { operatorClient } from './supabase';

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
  /**
   * Apakah total yang dihitung `@nummi/core` dari baris ledger COCOK dengan yang dihitung
   * view `wallet_balances` di database.
   *
   * Dulu bidang ini membandingkan total ke konstanta seed — masuk akal selama datanya memang
   * seed, tidak berarti apa-apa begitu ada keluarga sungguhan. Sekarang ia memeriksa hal yang
   * jauh lebih berguna: **dua perhitungan independen atas angka yang sama.** Kalau keduanya
   * berbeda, salah satu salah — dan itu insiden P0 apa pun penyebabnya.
   */
  matchesDbView: boolean;
  dbViewTotal: number;
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

/** Sementara, sampai `children` punya kolomnya (avatar shop Fase 4 belum persisten). */
const AVATAR_DEFAULT = '🦊';

function buildChildView(
  row: { id: string; name: string; tier: string },
  wallets: Wallet[],
  ledger: LedgerEntry[],
  requests: MoneyRequest[],
  dbViewTotal: number,
): ChildView {
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
    // Dua perhitungan independen atas angka yang sama: core dari baris ledger, database
    // lewat view. Berbeda = salah satu salah, dan itu P0 apa pun penyebabnya.
    matchesDbView: total === dbViewTotal,
    dbViewTotal,
    health,
  };

  return {
    id: row.id,
    name: row.name,
    tier: row.tier as Tier,
    avatar: AVATAR_DEFAULT,
    walletBalances: wallets.map((wallet) => ({ wallet, balance: byWallet[wallet.id] ?? 0 })),
    pockets,
    total,
    ledger,
    requests,
    promiseDebt: promiseDebt(requests),
    invariant,
  };
}

export async function getConsoleData(): Promise<ConsoleData> {
  const db = operatorClient();

  const [familyRes, childRes, walletRes, ledgerRes, requestRes, viewRes] = await Promise.all([
    db.from('families').select('id, name, family_code').order('created_at'),
    db.from('children').select('id, family_id, name, tier').order('created_at'),
    db.from('wallets').select('id, child_id, name, category, kind, target_amount, instrument, tenor_months, locked_rate_pct, started_at')
      .is('archived_at', null).order('created_at'),
    db.from('ledger_entries')
      .select('id, child_id, from_wallet_id, to_wallet_id, amount, reason, created_at')
      .order('created_at'),
    db.from('requests')
      .select('id, child_id, kind, amount, source_wallet_id, reason, status, fulfilment, fulfilment_story')
      .order('created_at', { ascending: false }),
    db.from('wallet_balances').select('child_id, balance'),
  ]);

  // Galat query TIDAK boleh ditelan `?? []`. Console yang menampilkan "0 keluarga · 0 insiden"
  // karena querynya gagal adalah kebohongan paling berbahaya yang bisa dilakukan permukaan ini:
  // ia melaporkan SEHAT justru ketika ia tidak tahu apa-apa.
  for (const [name, res] of Object.entries({
    families: familyRes, children: childRes, wallets: walletRes,
    ledger: ledgerRes, requests: requestRes, wallet_balances: viewRes,
  })) {
    if (res.error) {
      throw new Error(`console: query ${name} gagal — ${res.error.message}`);
    }
  }

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
  }));

  // Total per anak MENURUT DATABASE — sisi kedua dari pemeriksaan silang.
  const dbTotals = new Map<string, number>();
  for (const row of viewRes.data ?? []) {
    dbTotals.set(row.child_id, (dbTotals.get(row.child_id) ?? 0) + Number(row.balance));
  }

  const families: FamilyView[] = (familyRes.data ?? []).map((f) => ({
    id: f.id,
    name: f.name,
    children: (childRes.data ?? [])
      .filter((c) => c.family_id === f.id)
      .map((c) => buildChildView(
        c,
        allWallets.filter((w) => w.childId === c.id),
        allLedger.filter((e) => e.childId === c.id),
        allRequests.filter((r) => r.childId === c.id),
        dbTotals.get(c.id) ?? 0,
      )),
  }));

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
      // Ketidakcocokan antara core dan database ikut dihitung sebagai P0 — kalau dua sumber
      // tidak sepakat soal uang anak, itu sama seriusnya dengan ledger yang rusak.
      p0Incidents: children.reduce(
        (n, c) => n + c.invariant.health.length + (c.invariant.matchesDbView ? 0 : 1),
        0,
      ),
    },
  };
}
