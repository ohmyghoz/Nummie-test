/**
 * ANGKA KANONIK (nummi-handoff.md §"Angka contoh").
 *
 * Ini satu-satunya tempat angka contoh Nummi hidup. Kalau sebuah permukaan menampilkan angka
 * yang berbeda dari berkas ini, PERMUKAAN ITU YANG SALAH.
 *
 * Berkas ini lahir untuk menutup X2/X3/X4 secara permanen: audit 28 Juli 2026 menemukan target
 * dream, request pending, dan rasio auto-split sudah menyimpang antar lima mockup tanpa ada yang
 * menyadari — karena setiap mockup menyimpan angkanya sendiri.
 */
import type { LedgerEntry, MoneyRequest, MoneyRules, Wallet } from './types.js';

export const CHILD_ARTHUR = {
  id: 'child_arthur',
  name: 'Arthur',
  tier: 'middle' as const,
  avatar: '🦊',
};

export const SEED_WALLETS: Wallet[] = [
  { id: 'w_unsorted', childId: CHILD_ARTHUR.id, name: 'Unsorted', category: 'unsorted', kind: 'unsorted' },

  { id: 'w_snacks',    childId: CHILD_ARTHUR.id, name: 'Snacks',    category: 'spend', kind: 'envelope' },
  { id: 'w_transport', childId: CHILD_ARTHUR.id, name: 'Transport', category: 'spend', kind: 'envelope' },
  { id: 'w_games',     childId: CHILD_ARTHUR.id, name: 'Games',     category: 'spend', kind: 'envelope' },

  { id: 'w_bmx',        childId: CHILD_ARTHUR.id, name: 'BMX Bike',     category: 'save', kind: 'dream', targetAmount: 300_000 },
  { id: 'w_headphones', childId: CHILD_ARTHUR.id, name: 'Headphones',   category: 'save', kind: 'dream', targetAmount: 100_000 },
  { id: 'w_free',       childId: CHILD_ARTHUR.id, name: 'Free savings', category: 'save', kind: 'free_savings' },

  { id: 'w_give', childId: CHILD_ARTHUR.id, name: 'Give', category: 'give', kind: 'give_pool' },

  // `instrument` bukan hiasan: perilaku ketiganya berbeda (spread emas dijelaskan, deposito
  // punya jatuh tempo), dan UI membedakannya lewat kolom ini — TIDAK PERNAH lewat id atau nama.
  { id: 'w_td',   childId: CHILD_ARTHUR.id, name: 'Time Deposit', category: 'grow', kind: 'instrument', instrument: 'time_deposit' },
  { id: 'w_gold', childId: CHILD_ARTHUR.id, name: 'Gold',         category: 'grow', kind: 'instrument', instrument: 'gold' },
  { id: 'w_usd',  childId: CHILD_ARTHUR.id, name: 'US Dollar',    category: 'grow', kind: 'instrument', instrument: 'fx' },
];

/** Saldo target. Ledger seed di bawah harus menghasilkan angka-angka ini. */
export const SEED_BALANCES: Record<string, number> = {
  w_unsorted: 50_000,
  w_snacks: 45_000,
  w_transport: 30_000,
  w_games: 20_000,
  w_bmx: 150_000,
  w_headphones: 30_000,
  w_free: 60_000,
  w_give: 40_000,
  w_td: 30_750,   // pokok 30.000 + bunga 750, sudah jatuh tempo
  w_gold: 19_140, // beli 21.000 -> buyback hari ini (spread Antam ~9%)
  w_usd: 9_821,   // beli 10.000 -> kurs jual hari ini (spread round-trip ~2%)
};

/** Total kanonik: Rp484.711 */
export const SEED_TOTAL = 484_711;

/**
 * Ledger seed. Uang masuk = fromWalletId null. Perpindahan internal = keduanya terisi.
 * Nilai Grow sengaja dicatat sebagai selisih terpisah — nilainya bergerak mengikuti harga
 * (ADR-0003), bukan hasil transaksi anak.
 */
export const SEED_LEDGER: LedgerEntry[] = [
  entry('l1',  null,         'w_unsorted',   486_000, 'allowance'),
  entry('l2',  'w_unsorted', 'w_snacks',      45_000, 'sort'),
  entry('l3',  'w_unsorted', 'w_transport',   30_000, 'sort'),
  entry('l4',  'w_unsorted', 'w_games',       20_000, 'sort'),
  entry('l5',  'w_unsorted', 'w_bmx',        150_000, 'sort'),
  entry('l6',  'w_unsorted', 'w_headphones',  30_000, 'sort'),
  entry('l7',  'w_unsorted', 'w_free',        60_000, 'sort'),
  entry('l8',  'w_unsorted', 'w_give',        40_000, 'sort'),
  entry('l9',  'w_unsorted', 'w_td',          30_000, 'grow_in'),
  entry('l10', 'w_unsorted', 'w_gold',        21_000, 'grow_in'),
  entry('l11', 'w_unsorted', 'w_usd',         10_000, 'grow_in'),
  // Pergerakan nilai instrumen (bukan transaksi anak — mengikuti harga & bunga)
  entry('l12', null,         'w_td',             750, 'harvest'),
  entry('l13', 'w_gold',     null,             1_860, 'harvest'),
  entry('l14', 'w_usd',      null,               179, 'harvest'),
];

function entry(
  id: string,
  fromWalletId: string | null,
  toWalletId: string | null,
  amount: number,
  reason: LedgerEntry['reason'],
): LedgerEntry {
  return {
    id,
    childId: CHILD_ARTHUR.id,
    fromWalletId,
    toWalletId,
    amount,
    reason,
    createdAt: '2026-07-01T00:00:00.000Z',
  };
}

/** Request pending kanonik: cash out Rp25.000 dari Snacks, dengan alasan yang ditulis anak. */
export const SEED_REQUESTS: MoneyRequest[] = [
  {
    id: 'req_cashout_1',
    childId: CHILD_ARTHUR.id,
    kind: 'cash_out',
    amount: 25_000,
    sourceWalletId: 'w_snacks',
    reason: 'Mau beli roti di kantin sama Fikri',
    status: 'needs_ok',
    fulfilment: 'todo',
  },
];

/** Rasio default kanonik: 40 / 40 / 20. Bukan 40/40/10 (X4). */
export const SEED_RULES: MoneyRules = {
  childId: CHILD_ARTHUR.id,
  mode: 'flexible', // Strict default MATI (ADR-0005)
  autoSplit: {
    enabled: true,
    ratios: { spend: 40, save: 40, give: 20 },
    destinations: { spend: 'w_snacks', save: 'w_free', give: 'w_give' },
  },
};

/** Ekonomi reward kanonik (ADR-0004). */
export const SEED_ECONOMY = {
  starsBalance: 120,
  starsLifetime: 120,
  gems: 12,
  chaptersDone: 1,
  chaptersTotal: 6,
};

/**
 * Jadwal uang saku kanonik. Mendarat di Unsorted, tanpa persetujuan (sudah dijadwalkan ortu).
 * Hari 1 = Senin.
 */
export const SEED_ALLOWANCE = {
  enabled: true,
  amount: 50_000,
  frequency: 'weekly' as const,
  day: 1,
};

/** "Hari ini" untuk seed — supaya pratinjau tanggal tidak bergantung jam mesin. */
export const SEED_TODAY = '2026-07-28';

/**
 * ⚠️ CATATAN: `createdAt` setiap baris ledger di atas memakai tanggal placeholder yang SAMA
 * (2026-07-01). Konsekuensinya, jatuh tempo deposito TIDAK bisa disimpulkan dari tanggal:
 * 6 bulan dari 1 Juli jatuh di Desember, padahal bunga Rp750 sudah tercatat dan saldo seed
 * memang dimaksudkan "sudah jatuh tempo".
 *
 * Aturan yang berlaku, sama dengan `grow.ts`: **ledger yang berwenang.** Bunga yang sudah
 * tercatat berarti jatuh tempo. Hitung mundur berbasis tanggal baru bisa dipercaya setelah
 * S1b memberi tanggal mulai yang sungguhan per instrumen.
 */
export const SEED_TD_START = '2026-07-01';

/** Harga contoh. Di produksi datang dari scheduler (backlog T), bukan dari sini. */
export const SEED_PRICES = {
  goldSellPerGram: 1_450_000,
  goldBuybackPerGram: 1_320_000,
  fxMid: { USD: 16_000, SGD: 12_000, EUR: 17_000 },
  fxSpread: 0.01,
  bankRates: { m3: 1.5, m6: 2.5, m12: 4.0 },
  updatedAt: '2026-07-28',
};
