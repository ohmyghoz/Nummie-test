import { describe, expect, it } from 'vitest';
import {
  SEED_PRICES, SEED_WALLETS,
  canChildMoveFrom, canHarvestTo, fxRoundTripPct, fxUnits, formatGoldWeight,
  goldSpreadPct, goldWeightGrams, growPosition, harvestDestinations, SEED_RULES,
  tdHarvestOutcome, tdInterest, tenorRate,
} from '../src/index.js';

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
