/**
 * Riwayat transaksi dengan filter rentang (Fase 6).
 *
 * Rentangnya didefinisikan **di sini saja**. K13 di `nummi-status.md` mencatat console pernah
 * memakai jendela 7 hari di satu tempat dan 14 hari di tempat lain — dua angka untuk hal yang
 * sama, dan tidak ada yang menyadarinya sampai audit. Satu daftar konstanta menutup itu.
 */
import type { LedgerEntry, Wallet } from './types.js';

export const DATE_RANGES = ['7d', '30d', '90d', 'all'] as const;
export type DateRange = (typeof DATE_RANGES)[number];

const RANGE_DAYS: Record<Exclude<DateRange, 'all'>, number> = { '7d': 7, '30d': 30, '90d': 90 };

/** Tanggal mulai rentang (inklusif), atau `null` untuk 'all'. */
export function rangeStart(range: DateRange, todayISO: string): string | null {
  if (range === 'all') return null;
  const [y, m, d] = todayISO.split('-').map(Number);
  const start = new Date(Date.UTC(y ?? 1970, (m ?? 1) - 1, d ?? 1) - RANGE_DAYS[range] * 86_400_000);
  return start.toISOString().slice(0, 10);
}

/**
 * Arah uang dari sudut pandang anak.
 *
 * `internal` penting punya nama sendiri: perpindahan antar-wallet TIDAK mengubah total
 * (I1), jadi menghitungnya sebagai "masuk" atau "keluar" akan membuat ringkasan bohong.
 */
export type TxnDirection = 'in' | 'out' | 'internal';

export function txnDirection(entry: LedgerEntry): TxnDirection {
  if (entry.fromWalletId && entry.toWalletId) return 'internal';
  return entry.toWalletId ? 'in' : 'out';
}

export function filterByRange(
  entries: LedgerEntry[],
  range: DateRange,
  todayISO: string,
): LedgerEntry[] {
  const start = rangeStart(range, todayISO);
  if (!start) return entries;
  return entries.filter((e) => e.createdAt.slice(0, 10) >= start);
}

export interface TxnSummary {
  moneyIn: number;
  moneyOut: number;
  /** perpindahan antar-wallet — sengaja DIPISAH, tidak dijumlahkan ke in/out */
  moved: number;
  net: number;
  count: number;
}

export function summarise(entries: LedgerEntry[]): TxnSummary {
  let moneyIn = 0;
  let moneyOut = 0;
  let moved = 0;

  for (const e of entries) {
    const dir = txnDirection(e);
    if (dir === 'in') moneyIn += e.amount;
    else if (dir === 'out') moneyOut += e.amount;
    else moved += e.amount;
  }

  return { moneyIn, moneyOut, moved, net: moneyIn - moneyOut, count: entries.length };
}

export interface TxnRow {
  entry: LedgerEntry;
  direction: TxnDirection;
  fromName?: string;
  toName?: string;
}

/** Baris siap tampil, terbaru dulu. Nama wallet diselesaikan di sini supaya UI tidak perlu. */
export function txnRows(entries: LedgerEntry[], wallets: Wallet[]): TxnRow[] {
  const name = new Map(wallets.map((w) => [w.id, w.name]));
  return [...entries]
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : a.createdAt > b.createdAt ? -1 : 0))
    .map((entry) => {
      const row: TxnRow = { entry, direction: txnDirection(entry) };
      const from = entry.fromWalletId ? name.get(entry.fromWalletId) : undefined;
      const to = entry.toWalletId ? name.get(entry.toWalletId) : undefined;
      if (from) row.fromName = from;
      if (to) row.toName = to;
      return row;
    });
}
