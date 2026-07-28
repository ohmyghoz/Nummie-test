/**
 * Grow — simulasi, ortu adalah bank-nya (ADR-0003).
 *
 * ATURAN PALING PENTING DI BERKAS INI: **nilai selalu datang dari ledger, tidak pernah
 * dihitung ulang dari harga.** Saldo diturunkan dari ledger (ADR-0014); harga di sini hanya
 * untuk MENJELASKAN kenapa nilainya begitu.
 *
 * Kenapa ini bukan sekadar kerapian: saldo emas seed (Rp19.140) adalah angka yang dibulatkan,
 * sedangkan hitungan eksak dari harga memberi Rp19.117 — beda Rp23. Kalau layar anak
 * menghitung ulang sendiri, ia akan menampilkan dua angka berbeda untuk hal yang sama, di app
 * yang justru mengajari anak bahwa angka uang bisa dipercaya. Jadi: ledger untuk NILAI,
 * harga untuk PENJELASAN.
 */
import type { Wallet } from './types.js';

export interface Prices {
  goldSellPerGram: number;
  goldBuybackPerGram: number;
  fxMid: Record<string, number>;
  fxSpread: number;
  bankRates: { m3: number; m6: number; m12: number };
  updatedAt: string;
}

export type Tenor = 3 | 6 | 12;

/** Berat emas yang dimiliki anak dari sejumlah rupiah yang dibelanjakan (di harga JUAL). */
export function goldWeightGrams(rupiahIn: number, prices: Prices): number {
  if (rupiahIn <= 0 || prices.goldSellPerGram <= 0) return 0;
  return rupiahIn / prices.goldSellPerGram;
}

/**
 * Selisih harga beli vs harga buyback Antam — inilah "kenapa nilaiku langsung turun".
 * Spread BUKAN kerugian tersembunyi yang harus disederhanakan; ia bagian dari pelajaran,
 * dan app punya kartu penjelas khusus untuknya.
 */
export function goldSpreadPct(prices: Prices): number {
  if (prices.goldSellPerGram <= 0) return 0;
  return (1 - prices.goldBuybackPerGram / prices.goldSellPerGram) * 100;
}

/** Unit mata uang asing yang dimiliki dari sejumlah rupiah (dibeli di kurs jual = mid + spread). */
export function fxUnits(rupiahIn: number, currency: string, prices: Prices): number {
  const mid = prices.fxMid[currency];
  if (!mid || rupiahIn <= 0) return 0;
  return rupiahIn / (mid * (1 + prices.fxSpread));
}

/** Biaya bolak-balik beli→jual valas. ~2% pada spread 1%. */
export function fxRoundTripPct(prices: Prices): number {
  const s = prices.fxSpread;
  return (1 - (1 - s) / (1 + s)) * 100;
}

export function tenorRate(tenor: Tenor, prices: Prices): number {
  return tenor === 3 ? prices.bankRates.m3 : tenor === 6 ? prices.bankRates.m6 : prices.bankRates.m12;
}

/** Bunga deposito. Rate ditetapkan ORTU, tidak pernah dari feed harga (backlog T). */
export function tdInterest(principal: number, tenor: Tenor, prices: Prices): number {
  if (principal <= 0) return 0;
  return Math.floor((principal * tenorRate(tenor, prices)) / 100);
}

export interface GrowPosition {
  /** total rupiah yang dimasukkan anak — dari ledger */
  rupiahIn: number;
  /** nilai sekarang — dari ledger, BUKAN dihitung ulang dari harga */
  valueNow: number;
  deltaRp: number;
  deltaPct: number;
  /** true = sedang di bawah modal. Wajar untuk emas/valas yang baru dibeli (spread). */
  below: boolean;
}

export function growPosition(rupiahIn: number, valueNow: number): GrowPosition {
  const deltaRp = valueNow - rupiahIn;
  return {
    rupiahIn,
    valueNow,
    deltaRp,
    deltaPct: rupiahIn > 0 ? (deltaRp / rupiahIn) * 100 : 0,
    below: deltaRp < 0,
  };
}

/**
 * Harvest adalah SATU-SATUNYA jalan keluar dari Grow (ADR-0003) — Move sudah dihapus dari
 * semua instrumen. Dan tujuannya dikunci ke wallet Save, bukan bebas: uang yang keluar dari
 * Grow tidak boleh langsung jadi jajan.
 */
export const HARVEST_DESTINATION: Wallet['category'] = 'save';

export function harvestDestinations(wallets: Wallet[]): Wallet[] {
  return wallets.filter((w) => w.category === HARVEST_DESTINATION);
}

export function canHarvestTo(wallet: Wallet): boolean {
  return wallet.category === HARVEST_DESTINATION;
}

/** Tiga pilihan saat deposito jatuh tempo (Fase 3). */
export type HarvestChoice = 'cash_out' | 'roll_over' | 'take_profit';

export interface TdHarvestOutcome {
  choice: HarvestChoice;
  /** yang pindah ke wallet Save sekarang */
  toSave: number;
  /** yang tetap tinggal di deposito */
  staysInvested: number;
}

export function tdHarvestOutcome(
  principal: number, interest: number, choice: HarvestChoice,
): TdHarvestOutcome {
  switch (choice) {
    case 'cash_out':
      return { choice, toSave: principal + interest, staysInvested: 0 };
    case 'roll_over':
      return { choice, toSave: 0, staysInvested: principal + interest };
    case 'take_profit':
      // ambil bunganya, pokoknya lanjut bekerja
      return { choice, toSave: interest, staysInvested: principal };
  }
}
