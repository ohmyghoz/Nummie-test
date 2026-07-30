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

/* ── Masuk ke Grow ────────────────────────────────────────────────────────────
 *
 * Asimetris dengan Harvest, dan itu memang kebijakan ortu-sebagai-bank (ADR-0003): keluar hanya
 * lewat Harvest ke Save, masuk hanya lewat pengajuan yang disetujui ortu.
 *
 * Move sengaja MELARANG Grow sebagai tujuan (`move.destinationNotAllowed`), jadi ini jalur
 * sendiri — bukan `movePlan` dengan tujuan lain.
 */

/**
 * Kantong yang boleh mendanai Grow. **Dream tidak pernah ada di sini.**
 *
 * Kalau dream diizinkan, anak bisa menguras "BMX Bike" ke emas — dan itu melewati DUA penjaga
 * sekaligus: gerbang ortu untuk membatalkan dream (ADR-0005) dan denda ⭐ raid-dream (Fase 5).
 * Menabung untuk sepeda lalu memindahkannya ke emas bukan "menunda lebih lama", ia membatalkan
 * dream lewat pintu belakang.
 */
export const GROW_IN_SOURCES: readonly Wallet['category'][] = ['unsorted', 'spend', 'save'];

/**
 * Bolehkah kantong ini mendanai Grow?
 *
 * ⚠️ SENGAJA TIDAK memakai `canChildMoveFrom()`, dan itu bukan kelalaian.
 *
 * `canChildMoveFrom` mengembalikan `false` untuk **setiap** wallet di mode Strict — kalau dipakai
 * di sini, keluarga yang memakai Strict tidak akan pernah bisa memakai Grow sama sekali.
 *
 * Dan Strict tidak dilanggar dengan mengizinkannya: yang dijaga Strict adalah anak memindahkan
 * uang **sendiri**, sementara SETIAP pengajuan Grow wajib disetujui ortu (`grow_in` di
 * ADR-0002). Tidak ada yang unilateral di sini, jadi tidak ada yang perlu dikunci.
 *
 * Kalau suatu saat ada yang "merapikan" fungsi ini supaya konsisten dengan `canChildMoveFrom`,
 * ia akan mematikan Grow untuk keluarga Strict tanpa satu pun test gagal. Karena itu ada test
 * yang menjaganya secara eksplisit.
 */
export function canGrowInFrom(wallet: Wallet): boolean {
  // Dream: dilarang mutlak — lihat GROW_IN_SOURCES.
  if (wallet.kind === 'dream') return false;
  // Grow tidak mendanai Grow: pindah antar instrumen bukan setoran, dan Harvest satu-satunya
  // jalan keluar.
  if (wallet.category === 'grow') return false;
  // Give sudah dijanjikan untuk orang lain (ADR-0006).
  if (wallet.category === 'give') return false;
  return GROW_IN_SOURCES.includes(wallet.category);
}

export function growInSources(wallets: Wallet[]): Wallet[] {
  return wallets.filter(canGrowInFrom);
}

/**
 * Instrumen yang boleh menerima setoran sekarang.
 *
 * Deposito yang kesepakatannya masih berjalan TIDAK ditawarkan: setoran kedua akan memperpanjang
 * jatuh tempo dan mengubah rate yang sudah dijanjikan untuk uang yang sudah masuk (0014).
 */
export function growInTargets(wallets: Wallet[]): Wallet[] {
  return wallets.filter(
    (w) => w.category === 'grow' && !(w.instrument === 'time_deposit' && w.startedAt),
  );
}

export type GrowInErrorKey =
  | 'growIn.amountRequired'
  | 'growIn.notEnough'
  | 'growIn.sourceNotAllowed'
  | 'growIn.instrumentRequired'
  | 'growIn.tenorRequired'
  | 'growIn.depositBusy';

export interface GrowInPlan {
  ok: boolean;
  errorKey?: GrowInErrorKey;
  amount: number;
  /** saldo sumber setelah setoran, untuk pratinjau */
  fromAfter: number;
  /** bunga yang dijanjikan kalau ini deposito — nol untuk emas & valas */
  promisedInterest: number;
}

/**
 * Rencana setoran ke instrumen. Bentuknya mengikuti `movePlan`: mengembalikan `ok`/`errorKey`,
 * tidak pernah melempar — supaya layar bisa menampilkan alasannya, bukan cuma menolak.
 */
export function growInPlan(
  from: Wallet,
  to: Wallet,
  amount: number,
  balances: Record<string, number>,
  prices: Prices,
  tenor?: Tenor,
): GrowInPlan {
  const fromBalance = balances[from.id] ?? 0;
  const base = { amount, fromAfter: fromBalance, promisedInterest: 0 };

  if (to.category !== 'grow' || !to.instrument) {
    return { ...base, ok: false, errorKey: 'growIn.instrumentRequired' };
  }
  if (!canGrowInFrom(from)) {
    return { ...base, ok: false, errorKey: 'growIn.sourceNotAllowed' };
  }
  if (to.instrument === 'time_deposit' && to.startedAt) {
    return { ...base, ok: false, errorKey: 'growIn.depositBusy' };
  }
  // Deposito tanpa tenor adalah kesepakatan tanpa jangka — tidak bisa dihitung bunga maupun
  // jatuh tempo, jadi ia bukan kesepakatan.
  if (to.instrument === 'time_deposit' && !tenor) {
    return { ...base, ok: false, errorKey: 'growIn.tenorRequired' };
  }
  if (amount <= 0) return { ...base, ok: false, errorKey: 'growIn.amountRequired' };
  if (amount > fromBalance) return { ...base, ok: false, errorKey: 'growIn.notEnough' };

  return {
    ok: true,
    amount,
    fromAfter: fromBalance - amount,
    // Ditampilkan SEBELUM anak mengajukan. Bunga yang baru terlihat setelah disetujui adalah
    // janji yang tidak pernah dibaca.
    promisedInterest: tenor ? tdInterest(amount, tenor, prices) : 0,
  };
}

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
