import { describe, expect, it } from 'vitest';
import { SEED_RULES, SEED_WALLETS, canOpenSort, sortPlan } from '../src/index.js';

const strict = { ...SEED_RULES, mode: 'strict' as const };

describe('A-sisa-1 — rasio ortu benar-benar berlaku, bukan teks mati', () => {
  it('rencana memakai rasio dari money_rules, bukan angka hardcode', () => {
    const plan = sortPlan(100_000, SEED_RULES, SEED_WALLETS);
    expect(plan.ratios).toEqual({ spend: 40, save: 40, give: 20 });
    const byCat = Object.fromEntries(plan.slots.map((s) => [s.category, s.amount]));
    expect(byCat).toEqual({ spend: 40_000, save: 40_000, give: 20_000 });
  });

  it('mengikuti rasio ortu yang BERBEDA dari default — bukti tidak ada angka mati', () => {
    const custom = {
      ...SEED_RULES,
      autoSplit: { ...SEED_RULES.autoSplit, ratios: { spend: 10, save: 70, give: 20 } },
    };
    const byCat = Object.fromEntries(
      sortPlan(100_000, custom, SEED_WALLETS).slots.map((s) => [s.category, s.amount]),
    );
    expect(byCat).toEqual({ spend: 10_000, save: 70_000, give: 20_000 });
  });

  it('mendarat di wallet tujuan yang ditunjuk ortu', () => {
    const plan = sortPlan(100_000, SEED_RULES, SEED_WALLETS);
    const ids = plan.slots.map((s) => s.wallet.id).sort();
    expect(ids).toEqual(['w_free', 'w_give', 'w_snacks']);
  });

  it('tidak menciptakan atau menghilangkan rupiah (I1)', () => {
    for (const amount of [999, 50_000, 33_333]) {
      const plan = sortPlan(amount, SEED_RULES, SEED_WALLETS);
      const placed = plan.slots.reduce((s, x) => s + x.amount, 0);
      expect(placed + plan.remainderToUnsorted).toBe(amount);
    }
  });

  it('tujuan yang menunjuk wallet tak dikenal tidak menelan uang diam-diam', () => {
    const broken = {
      ...SEED_RULES,
      autoSplit: { ...SEED_RULES.autoSplit, destinations: { spend: 'w_hantu', save: 'w_free', give: 'w_give' } },
    };
    const plan = sortPlan(100_000, broken, SEED_WALLETS);
    const placed = plan.slots.reduce((s, x) => s + x.amount, 0);
    expect(placed + plan.remainderToUnsorted).toBe(100_000);
    expect(plan.remainderToUnsorted).toBe(40_000); // porsi Spend kembali ke Unsorted
  });
});

describe('C — mode Strict akhirnya ditegakkan di sisi anak', () => {
  it('Flexible: anak boleh menggeser angkanya', () => {
    const plan = sortPlan(100_000, SEED_RULES, SEED_WALLETS);
    expect(plan.locked).toBe(false);
    expect(plan.slots.every((s) => s.editable)).toBe(true);
  });

  it('Strict: terkunci — anak hanya melihat & mengonfirmasi', () => {
    const plan = sortPlan(100_000, strict, SEED_WALLETS);
    expect(plan.locked).toBe(true);
    expect(plan.slots.every((s) => !s.editable)).toBe(true);
  });

  it('Strict dengan rasio sah tidak menyisakan apa pun di Unsorted', () => {
    expect(sortPlan(100_000, strict, SEED_WALLETS).remainderToUnsorted).toBe(0);
  });
});

describe('auto-split mati', () => {
  it('semua uang tinggal di Unsorted, tidak ada slot', () => {
    const off = { ...SEED_RULES, autoSplit: { ...SEED_RULES.autoSplit, enabled: false } };
    const plan = sortPlan(50_000, off, SEED_WALLETS);
    expect(plan.slots).toHaveLength(0);
    expect(plan.remainderToUnsorted).toBe(50_000);
    expect(plan.autoSplitEnabled).toBe(false);
  });
});

describe('kapan layar Sort ada isinya', () => {
  it('hanya kalau Unsorted berisi', () => {
    expect(canOpenSort(50_000)).toBe(true);
    expect(canOpenSort(0)).toBe(false);
  });
});
