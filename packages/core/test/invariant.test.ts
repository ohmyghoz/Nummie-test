import { describe, expect, it } from 'vitest';
import {
  SEED_BALANCES, SEED_LEDGER, SEED_TOTAL, SEED_WALLETS,
  checkLedgerHealth, pocketBalances, pocketBalancesForTier, totalBalance, walletBalances,
} from '../src/index.js';

describe('I1 — Unsorted + Spend + Save + Give + Grow = Total', () => {
  it('seed kanonik menghasilkan Total yang benar', () => {
    expect(totalBalance(SEED_LEDGER, SEED_WALLETS)).toBe(SEED_TOTAL);
  });

  it('jumlah kantong sama dengan Total', () => {
    const p = pocketBalances(SEED_LEDGER, SEED_WALLETS);
    expect(p.unsorted + p.spend + p.save + p.give + p.grow).toBe(SEED_TOTAL);
  });

  it('perpindahan internal tidak pernah mengubah Total', () => {
    const moved = [...SEED_LEDGER, {
      id: 'l_move', childId: 'child_arthur',
      fromWalletId: 'w_snacks', toWalletId: 'w_bmx',
      amount: 10_000, reason: 'move' as const, createdAt: '2026-07-28T00:00:00.000Z',
    }];
    expect(totalBalance(moved, SEED_WALLETS)).toBe(SEED_TOTAL);
  });

  it('Little melebur Grow ke Save tanpa mengubah Total', () => {
    const p = pocketBalancesForTier(SEED_LEDGER, SEED_WALLETS, 'little');
    expect(p.grow).toBe(0);
    expect(p.unsorted + p.spend + p.save + p.give + p.grow).toBe(SEED_TOTAL);
    expect(p.save).toBe(299_711);
  });
});

describe('saldo seed sesuai daftar kanonik', () => {
  it('setiap wallet cocok dengan handoff', () => {
    const balances = walletBalances(SEED_LEDGER);
    for (const [walletId, expected] of Object.entries(SEED_BALANCES)) {
      expect(balances[walletId], `wallet ${walletId}`).toBe(expected);
    }
  });
});

describe('kesehatan ledger', () => {
  it('seed bersih — nol temuan', () => {
    expect(checkLedgerHealth(SEED_LEDGER, SEED_WALLETS)).toHaveLength(0);
  });

  it('menangkap saldo negatif', () => {
    const bad = [...SEED_LEDGER, {
      id: 'l_bad', childId: 'child_arthur',
      fromWalletId: 'w_games', toWalletId: 'w_bmx',
      amount: 999_999, reason: 'move' as const, createdAt: '2026-07-28T00:00:00.000Z',
    }];
    const issues = checkLedgerHealth(bad, SEED_WALLETS);
    expect(issues.some((i) => i.kind === 'negative_balance')).toBe(true);
  });
});

describe('instrumen Grow punya identitas sendiri', () => {
  // Cermin dari constraint `instrument_matches_kind` di 0008_wallet_instrument.sql.
  // Kalau kedua sisi tidak sepakat, yang pecah adalah UI — dan pecahnya diam-diam.
  it('instrument ada TEPAT saat kind instrument', () => {
    for (const w of SEED_WALLETS) {
      if (w.kind === 'instrument') {
        expect(w.instrument, `${w.name} instrumen tanpa jenis`).toBeDefined();
      } else {
        expect(w.instrument, `${w.name} bukan instrumen tapi punya jenis`).toBeUndefined();
      }
    }
  });

  it('ketiga jenis hadir dan tidak kembar — UI membedakan lewat ini, bukan lewat id', () => {
    const jenis = SEED_WALLETS.filter((w) => w.kind === 'instrument').map((w) => w.instrument);
    expect([...jenis].sort()).toEqual(['fx', 'gold', 'time_deposit']);
  });
});
