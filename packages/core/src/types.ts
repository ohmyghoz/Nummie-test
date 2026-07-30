/** Tipe domain Nummi. Tidak ada logika di sini — hanya bentuk data. */
import type { Tenor } from './grow.js';

export type Category = 'spend' | 'save' | 'give' | 'grow';
export type Tier = 'little' | 'middle' | 'teen';

/** Unsorted bukan kategori — ia tempat mendarat sebelum anak memberi tugas pada uangnya. */
export type Pocket = Category | 'unsorted';

export type WalletKind =
  | 'unsorted'
  | 'envelope'      // di bawah spend
  | 'dream'         // di bawah save, punya target
  | 'free_savings'  // di bawah save, catch-all. Nama sementara (backlog F)
  | 'give_pool'
  | 'instrument';   // di bawah grow — jenisnya di `GrowInstrument`

/**
 * Jenis instrumen Grow. Dulu ini cuma komentar di `WalletKind`, dan UI membedakan ketiganya
 * lewat id seed yang ditulis mati (`w_gold`, `w_td`). Begitu id jadi UUID dari database,
 * tebakan itu berhenti bekerja **tanpa melempar galat** — penjelas spread emas hilang diam-diam.
 * Sekarang ia data, ditegakkan constraint di `supabase/migrations/0008_wallet_instrument.sql`.
 */
export type GrowInstrument = 'time_deposit' | 'gold' | 'fx';

export interface Wallet {
  id: string;
  childId: string;
  name: string;
  category: Pocket;
  kind: WalletKind;
  /** hanya untuk kind 'dream' */
  targetAmount?: number;
  /** WAJIB saat kind 'instrument', dan tidak boleh ada selain itu. */
  instrument?: GrowInstrument;

  /**
   * Kesepakatan deposito yang **dibekukan saat ortu menyetujui** (migrasi 0014).
   *
   * Ketiganya sekaligus atau tidak satu pun. Alasan membekukannya: ADR-0003 menutup dengan
   * "TD tidak ikut pasar — bunganya terkunci di kesepakatan". Tanpa ini, ortu yang mengubah
   * bunga di Settings ikut mengubah bunga deposito yang sudah berjalan — janji yang dibatalkan
   * diam-diam untuk uang yang sudah masuk.
   */
  tenorMonths?: Tenor;
  lockedRatePct?: number;
  startedAt?: string;
}

/**
 * Baris ledger. APPEND-ONLY (ADR-0014) — tidak pernah di-UPDATE atau DELETE.
 * `fromWalletId === null` berarti uang masuk dari luar (allowance, Send money, reward).
 */
export interface LedgerEntry {
  id: string;
  childId: string;
  fromWalletId: string | null;
  toWalletId: string | null;
  amount: number;
  reason: LedgerReason;
  createdAt: string;
}

export type LedgerReason =
  | 'allowance' | 'send_money' | 'take_money' | 'reward_money'
  | 'sort' | 'move' | 'cash_out'
  | 'grow_in' | 'harvest' | 'give_away';

export type RequestKind =
  | 'cash_out' | 'give_away' | 'prize' | 'mission_claim'
  | 'grow_in' | 'harvest';

export type RequestStatus = 'needs_ok' | 'approved' | 'declined' | 'talk_about_it';

/**
 * DUA KOLOM, BUKAN SATU ENUM (ADR-0002).
 * Menggabungkannya adalah kesalahan yang sangat wajar — dan membunuh keputusan "approve ≠ fulfil".
 */
export type Fulfilment = 'not_applicable' | 'todo' | 'done';

export interface MoneyRequest {
  id: string;
  childId: string;
  kind: RequestKind;
  amount: number;
  sourceWalletId?: string;
  /** wajib untuk cash_out, opsional untuk give_away — jangan pajaki kemurahan hati (ADR-0006) */
  reason?: string;
  status: RequestStatus;
  fulfilment: Fulfilment;
  /** wajib sebelum request Give bisa ditutup (ADR-0006) */
  fulfilmentStory?: string;
  decidedByParentId?: string;

  /**
   * Job / hadiah yang dirujuk (migrasi 0015). Jumlah 💎 TIDAK disimpan di `amount` — kolom itu
   * rupiah — melainkan diturunkan dari `jobs.amount` / `prizes.gemCost` lewat id ini. Satu kolom
   * dengan dua arti adalah cara keputusan mati diam-diam (peringatan K14).
   */
  jobId?: string;
  prizeId?: string;
}

export type RuleMode = 'flexible' | 'strict';

export interface AutoSplit {
  enabled: boolean;
  /** persen per kategori, 0-100 */
  ratios: Partial<Record<Category, number>>;
  /** wallet tujuan per kategori, mis. spend -> Snacks */
  destinations: Partial<Record<Category, string>>;
}

export interface MoneyRules {
  childId: string;
  /** Strict DEFAULT MATI (ADR-0005) */
  mode: RuleMode;
  autoSplit: AutoSplit;
}
