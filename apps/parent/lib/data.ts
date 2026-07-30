/**
 * SATU-SATUNYA sumber data app ortu.
 *
 * ── Titik tukar S1b: SUDAH DITUKAR (30 Juli 2026) ────────────────────────────
 * Anak, wallet, ledger, request, dan aturan uang datang dari Supabase, dibaca dengan token
 * ORTU — jadi RLS yang memutuskan anak siapa yang terlihat, bukan kode di sini. Ortu yang
 * bukan anggota keluarga itu tidak melihat apa pun (sudah diuji per-role).
 *
 * **Masih dari seed, dan kenapa:** harga Grow (feed di luar cakupan S1–S3, backlog T),
 * jadwal uang saku (`SEED_ALLOWANCE` — belum ada tabelnya), `today`/`tdStart`, dan avatar anak.
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
  SEED_ALLOWANCE,
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
  type LedgerEntry,
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

export async function getParentData(): Promise<ParentData> {
  const token = await parentToken();
  if (!token) redirect('/login');

  const db = clientWithToken(token);

  const [meRes, childRes, walletRes, ledgerRes, requestRes, rulesRes] = await Promise.all([
    db.from('parents').select('id, display_name').limit(1).maybeSingle(),
    db.from('children').select('id, name, tier').order('created_at'),
    db.from('wallets').select('id, child_id, name, category, kind, target_amount, instrument')
      .is('archived_at', null).order('created_at'),
    db.from('ledger_entries')
      .select('id, child_id, from_wallet_id, to_wallet_id, amount, reason, created_at')
      .order('created_at'),
    db.from('requests')
      .select('id, child_id, kind, amount, source_wallet_id, destination_wallet_id, harvest_choice, reason, status, fulfilment, fulfilment_story')
      .order('created_at', { ascending: false }),
    db.from('money_rules').select('child_id, mode, auto_split_enabled, ratios, destinations'),
  ]);

  // Token kedaluwarsa (~1 jam, U-11) tampak sebagai "tidak ada ortu yang terlihat".
  // Perlakukan sebagai belum masuk, bukan sebagai layar kosong yang membingungkan.
  if (meRes.error || !meRes.data) redirect('/login');

  const allWallets: Wallet[] = (walletRes.data ?? []).map((w) => ({
    id: w.id,
    childId: w.child_id,
    name: w.name,
    category: w.category as Pocket,
    kind: w.kind,
    targetAmount: w.target_amount ?? undefined,
    instrument: w.instrument ?? undefined,
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
      allowance: SEED_ALLOWANCE,
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
    prices: SEED_PRICES,
    today: SEED_TODAY,
    tdStart: SEED_TD_START,
  };
}

export function findChild(data: ParentData, id?: string): ChildView {
  return data.children.find((c) => c.id === id) ?? data.children[0]!;
}
