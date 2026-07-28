import { describe, expect, it } from 'vitest';
import {
  SEED_LEDGER, SEED_RULES, SEED_WALLETS,
  movePlan, moveSources, moveTargets, walletBalances,
} from '../src/index.js';

const wallet = (id: string) => SEED_WALLETS.find((w) => w.id === id)!;
const balances = walletBalances(SEED_LEDGER);
const strict = { ...SEED_RULES, mode: 'strict' as const };
const plan = (from: string, to: string, amount: number, rules = SEED_RULES) =>
  movePlan(wallet(from), wallet(to), amount, rules, balances);

describe('dua pengecualian yang sengaja (backlog D)', () => {
  it('Grow tidak ikut flow generik — masuk lewat Create, keluar lewat Harvest', () => {
    expect(plan('w_snacks', 'w_gold', 10_000).errorKey).toBe('move.destinationNotAllowed');
    expect(plan('w_gold', 'w_snacks', 10_000).errorKey).toBe('move.sourceLocked');
  });

  it('Unsorted tidak ikut flow generik — disortir lewat layar Sort penuh', () => {
    expect(plan('w_unsorted', 'w_snacks', 10_000).errorKey).toBe('move.sourceLocked');
    expect(plan('w_snacks', 'w_unsorted', 10_000).errorKey).toBe('move.destinationNotAllowed');
  });

  it('Give boleh jadi TUJUAN, tidak pernah jadi SUMBER', () => {
    expect(plan('w_snacks', 'w_give', 10_000).ok).toBe(true);
    expect(plan('w_give', 'w_snacks', 10_000).errorKey).toBe('move.sourceLocked');
  });
});

describe('daftar wallet yang boleh dipilih', () => {
  it('sumber: tanpa Unsorted, Grow, Give, dan dream', () => {
    expect(moveSources(SEED_WALLETS, SEED_RULES).map((w) => w.id))
      .toEqual(['w_snacks', 'w_transport', 'w_games', 'w_free']);
  });

  it('Strict mengosongkan daftar sumber sepenuhnya', () => {
    expect(moveSources(SEED_WALLETS, strict)).toHaveLength(0);
  });

  it('tujuan: tanpa dirinya sendiri, Unsorted, dan Grow', () => {
    const ids = moveTargets(wallet('w_snacks'), SEED_WALLETS).map((w) => w.id);
    expect(ids).not.toContain('w_snacks');
    expect(ids).not.toContain('w_unsorted');
    expect(ids).not.toContain('w_gold');
    expect(ids).toContain('w_give');
    expect(ids).toContain('w_bmx');
  });
});

describe('mode Strict ditegakkan di perpindahan uang juga', () => {
  it('sumber terkunci di Strict', () => {
    expect(plan('w_snacks', 'w_games', 10_000, strict).errorKey).toBe('move.sourceLocked');
  });

  it('Flexible mengizinkan', () => {
    expect(plan('w_snacks', 'w_games', 10_000).ok).toBe(true);
  });
});

describe('peringatan ⭐ tampil SEBELUM konfirmasi, bukan hukuman diam-diam', () => {
  it('dream -> Spend: ditolak sebagai perpindahan langsung TAPI ongkosnya tetap diberitahukan', () => {
    const p = movePlan(wallet('w_bmx'), wallet('w_snacks'), 10_000, SEED_RULES, balances);
    // anak tidak bisa membatalkan dream sendirian (ADR-0005) — jalurnya pengajuan ke ortu
    expect(p.ok).toBe(false);
    expect(p.errorKey).toBe('move.sourceLocked');
    // tapi ongkosnya harus tampil SEBELUM ia mengajukan, bukan setelah ortu menyetujui
    expect(p.starPenalty).toBe(15);
  });

  it('dream -> dream lain tetap gratis, meski sama-sama perlu ortu', () => {
    const p = movePlan(wallet('w_bmx'), wallet('w_headphones'), 10_000, SEED_RULES, balances);
    expect(p.starPenalty).toBe(0);
  });

  it('perpindahan biasa tidak kena denda', () => {
    expect(plan('w_snacks', 'w_games', 10_000).starPenalty).toBe(0);
  });
});

describe('batas jumlah & preview', () => {
  it('menolak nol dan melebihi saldo', () => {
    expect(plan('w_snacks', 'w_games', 0).errorKey).toBe('move.amountRequired');
    expect(plan('w_snacks', 'w_games', 999_999).errorKey).toBe('move.notEnough');
  });

  it('menolak wallet yang sama', () => {
    expect(plan('w_snacks', 'w_snacks', 1_000).errorKey).toBe('move.sameWallet');
  });

  it('preview tidak menciptakan atau menghilangkan rupiah (I1)', () => {
    const p = plan('w_snacks', 'w_games', 15_000);
    const before = (balances['w_snacks'] ?? 0) + (balances['w_games'] ?? 0);
    expect(p.fromAfter + p.toAfter).toBe(before);
  });
});
