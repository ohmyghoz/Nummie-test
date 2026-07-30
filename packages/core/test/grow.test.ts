import { describe, expect, it } from 'vitest';
import {
  SEED_LEDGER, SEED_PRICES, SEED_WALLETS,
  canChildMoveFrom, canHarvestTo, fxRoundTripPct, fxUnits, formatGoldWeight,
  goldSpreadPct, goldWeightGrams, growPosition, harvestDestinations, SEED_RULES,
  tdHarvestOutcome, tdInterest, tenorRate,
  canGrowInFrom,
  growInPlan,
  growInSources,
  growInTargets,
  walletBalances,
} from '../src/index.js';
import type { Tenor } from '../src/index.js';

const wallet = (id: string) => SEED_WALLETS.find((w) => w.id === id)!;

describe('emas dalam skala uang anak (ADR-0003)', () => {
  it('Rp21.000 ≈ 14,5 mg — miligram, bukan gram', () => {
    const grams = goldWeightGrams(21_000, SEED_PRICES);
    expect(formatGoldWeight(grams)).toBe('14,5 mg');
  });

  it('spread Antam ~9% — pelajaran, bukan biaya tersembunyi', () => {
    expect(goldSpreadPct(SEED_PRICES)).toBeCloseTo(8.97, 1);
  });
});

describe('valas', () => {
  it('dibeli di kurs jual, bukan kurs tengah', () => {
    expect(fxUnits(10_000, 'USD', SEED_PRICES)).toBeCloseTo(0.6188, 3);
  });

  it('bolak-balik memakan ~2% pada spread 1%', () => {
    expect(fxRoundTripPct(SEED_PRICES)).toBeCloseTo(1.98, 1);
  });

  it('mata uang tak dikenal tidak meledak', () => {
    expect(fxUnits(10_000, 'JPY', SEED_PRICES)).toBe(0);
  });
});

describe('deposito — rate ditetapkan ortu, bukan dari feed', () => {
  it('tenor memetakan ke rate ortu', () => {
    expect(tenorRate(3, SEED_PRICES)).toBe(1.5);
    expect(tenorRate(6, SEED_PRICES)).toBe(2.5);
    expect(tenorRate(12, SEED_PRICES)).toBe(4.0);
  });

  it('bunga seed Rp750 = pokok 30.000 pada tenor 6 bulan', () => {
    expect(tdInterest(30_000, 6, SEED_PRICES)).toBe(750);
  });

  it('tiga pilihan saat jatuh tempo', () => {
    expect(tdHarvestOutcome(30_000, 750, 'cash_out')).toMatchObject({ toSave: 30_750, staysInvested: 0 });
    expect(tdHarvestOutcome(30_000, 750, 'roll_over')).toMatchObject({ toSave: 0, staysInvested: 30_750 });
    // ambil bunganya, pokok lanjut bekerja
    expect(tdHarvestOutcome(30_000, 750, 'take_profit')).toMatchObject({ toSave: 750, staysInvested: 30_000 });
  });
});

describe('nilai datang dari LEDGER, bukan dihitung ulang dari harga', () => {
  it('posisi emas seed: masuk 21.000, nilai 19.140, turun ~8,9%', () => {
    const pos = growPosition(21_000, 19_140);
    expect(pos.valueNow).toBe(19_140);       // persis saldo ledger, bukan 19.117 hasil hitung harga
    expect(pos.below).toBe(true);
    expect(pos.deltaPct).toBeCloseTo(-8.86, 1);
  });

  it('deposito naik', () => {
    expect(growPosition(30_000, 30_750).below).toBe(false);
  });
});

describe('Harvest satu-satunya jalan keluar, dan tujuannya dikunci ke Save', () => {
  it('anak tidak pernah bisa memindahkan uang dari Grow sendiri', () => {
    for (const mode of ['flexible', 'strict'] as const) {
      expect(canChildMoveFrom(wallet('w_gold'), { ...SEED_RULES, mode })).toBe(false);
    }
  });

  it('tujuan Harvest hanya wallet Save', () => {
    expect(harvestDestinations(SEED_WALLETS).map((w) => w.id))
      .toEqual(['w_bmx', 'w_headphones', 'w_free']);
    expect(canHarvestTo(wallet('w_snacks'))).toBe(false);
    expect(canHarvestTo(wallet('w_free'))).toBe(true);
  });
});

describe('masuk ke Grow: asimetris dengan Harvest, dan dream tidak pernah boleh', () => {
  const balances = walletBalances(SEED_LEDGER);
  const plan = (from: string, to: string, amount: number, tenor?: Tenor) =>
    growInPlan(wallet(from), wallet(to), amount, balances, SEED_PRICES, tenor);

  it('sumber: Unsorted, Spend, dan Free savings — dream & Give & Grow tidak', () => {
    expect(growInSources(SEED_WALLETS).map((w) => w.id))
      .toEqual(['w_unsorted', 'w_snacks', 'w_transport', 'w_games', 'w_free']);
  });

  it('dream ditolak — menguras dream ke emas melewati gerbang ortu DAN denda ⭐', () => {
    expect(plan('w_bmx', 'w_gold', 10_000).errorKey).toBe('growIn.sourceNotAllowed');
  });

  it('Give ditolak — uangnya sudah dijanjikan untuk orang lain (ADR-0006)', () => {
    expect(plan('w_give', 'w_gold', 10_000).errorKey).toBe('growIn.sourceNotAllowed');
  });

  it('Grow tidak mendanai Grow — Harvest satu-satunya jalan keluar (ADR-0003)', () => {
    expect(plan('w_gold', 'w_td', 5_000, 3).errorKey).toBe('growIn.sourceNotAllowed');
  });

  /**
   * Test ini menjaga keputusan, bukan perilaku. `canGrowInFrom` SENGAJA tidak memakai
   * `canChildMoveFrom` — kalau ada yang "merapikannya" supaya konsisten, Grow akan mati untuk
   * keluarga Strict tanpa satu pun test lain gagal.
   */
  it('mode Strict TIDAK memblokir pendanaan Grow — setiap setoran sudah butuh izin ortu', () => {
    for (const mode of ['flexible', 'strict'] as const) {
      const rules = { ...SEED_RULES, mode };
      // dibandingkan langsung: Move terkunci di Strict, Grow tidak
      expect(canChildMoveFrom(wallet('w_snacks'), rules)).toBe(mode === 'flexible');
      expect(canGrowInFrom(wallet('w_snacks'))).toBe(true);
    }
  });

  it('deposito wajib punya tenor, dan bunganya ditampilkan SEBELUM diajukan', () => {
    expect(plan('w_snacks', 'w_td', 10_000).errorKey).toBe('growIn.tenorRequired');
    const p = plan('w_snacks', 'w_td', 10_000, 12);
    expect(p.ok).toBe(true);
    // 4% dari 10.000 pada tenor 12 bulan (SEED_PRICES.bankRates.m12)
    expect(p.promisedInterest).toBe(400);
  });

  it('emas & valas tidak punya tenor, jadi tidak menjanjikan bunga', () => {
    expect(plan('w_snacks', 'w_gold', 10_000).promisedInterest).toBe(0);
  });

  it('deposito yang kesepakatannya sedang berjalan tidak menerima setoran kedua', () => {
    const busy = { ...wallet('w_td'), startedAt: '2026-07-01', tenorMonths: 6 as Tenor, lockedRatePct: 2.5 };
    const p = growInPlan(wallet('w_snacks'), busy, 5_000, balances, SEED_PRICES, 3);
    expect(p.errorKey).toBe('growIn.depositBusy');
    // dan ia tidak ditawarkan sebagai tujuan
    expect(growInTargets([busy, wallet('w_gold')]).map((w) => w.id)).toEqual(['w_gold']);
  });

  it('melebihi saldo ditolak, dan pratinjau menunjukkan sisa sumbernya', () => {
    expect(plan('w_snacks', 'w_gold', 999_999).errorKey).toBe('growIn.notEnough');
    expect(plan('w_snacks', 'w_gold', 5_000).fromAfter).toBe((balances['w_snacks'] ?? 0) - 5_000);
  });
});
