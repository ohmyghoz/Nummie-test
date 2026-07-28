import { describe, expect, it } from 'vitest';
import {
  DATE_RANGES, SEED_LEDGER, SEED_TODAY, SEED_WALLETS,
  filterByRange, rangeStart, summarise, txnDirection, txnRows,
} from '../src/index.js';
import type { LedgerEntry } from '../src/index.js';

const entry = (over: Partial<LedgerEntry>): LedgerEntry => ({
  id: 'x', childId: 'c', fromWalletId: null, toWalletId: 'w_unsorted',
  amount: 1_000, reason: 'allowance', createdAt: '2026-07-01T00:00:00.000Z', ...over,
});

describe('rentang tanggal didefinisikan di SATU tempat (K13)', () => {
  it('empat rentang, dan "all" tidak punya batas mulai', () => {
    expect(DATE_RANGES).toEqual(['7d', '30d', '90d', 'all']);
    expect(rangeStart('all', SEED_TODAY)).toBeNull();
  });

  it('mundur tepat sesuai namanya', () => {
    expect(rangeStart('7d', '2026-07-28')).toBe('2026-07-21');
    expect(rangeStart('30d', '2026-07-28')).toBe('2026-06-28');
  });

  it('menyaring dengan batas inklusif', () => {
    const rows = [entry({ createdAt: '2026-07-21T00:00:00.000Z' }), entry({ createdAt: '2026-07-20T00:00:00.000Z' })];
    expect(filterByRange(rows, '7d', '2026-07-28')).toHaveLength(1);
  });
});

describe('arah uang dari sudut pandang anak', () => {
  it('masuk, keluar, dan pindah-pindah adalah tiga hal berbeda', () => {
    expect(txnDirection(entry({ fromWalletId: null, toWalletId: 'w_snacks' }))).toBe('in');
    expect(txnDirection(entry({ fromWalletId: 'w_snacks', toWalletId: null }))).toBe('out');
    expect(txnDirection(entry({ fromWalletId: 'w_snacks', toWalletId: 'w_games' }))).toBe('internal');
  });
});

describe('ringkasan tidak boleh berbohong soal I1', () => {
  it('perpindahan internal TIDAK dihitung sebagai masuk atau keluar', () => {
    const s = summarise([entry({ fromWalletId: 'w_snacks', toWalletId: 'w_games', amount: 5_000 })]);
    expect(s.moneyIn).toBe(0);
    expect(s.moneyOut).toBe(0);
    expect(s.moved).toBe(5_000);
    expect(s.net).toBe(0); // memindahkan uang tidak membuat anak lebih kaya atau miskin
  });

  it('seed: total masuk dikurangi keluar = total kanonik', () => {
    const s = summarise(SEED_LEDGER);
    expect(s.net).toBe(484_711);
    expect(s.count).toBe(SEED_LEDGER.length);
  });

  it('seed: sortir & grow_in adalah perpindahan internal, bukan uang masuk', () => {
    const s = summarise(SEED_LEDGER);
    expect(s.moneyIn).toBe(486_750);  // 486.000 uang saku + 750 bunga
    expect(s.moneyOut).toBe(2_039);   // 1.860 emas + 179 valas
  });
});

describe('baris siap tampil', () => {
  it('terbaru dulu', () => {
    const rows = txnRows(
      [entry({ id: 'lama', createdAt: '2026-07-01T00:00:00.000Z' }),
       entry({ id: 'baru', createdAt: '2026-07-20T00:00:00.000Z' })],
      SEED_WALLETS,
    );
    expect(rows[0]!.entry.id).toBe('baru');
  });

  it('nama wallet diselesaikan; sisi luar dibiarkan kosong', () => {
    const [row] = txnRows([entry({ fromWalletId: null, toWalletId: 'w_snacks' })], SEED_WALLETS);
    expect(row!.toName).toBe('Snacks');
    expect(row!.fromName).toBeUndefined();
  });
});
