import { describe, expect, it } from 'vitest';
import {
  SEED_RULES, SEED_WALLETS,
  applyAutoSplit, canChildMoveFrom, canParentTakeFrom, dreamRaidPenalty, ratioTotal, validateAutoSplit,
} from '../src/index.js';

const wallet = (id: string) => SEED_WALLETS.find((w) => w.id === id)!;

describe('auto-split', () => {
  it('rasio default kanonik 40/40/20, bukan 40/40/10 (X4)', () => {
    expect(ratioTotal(SEED_RULES.autoSplit)).toBe(100);
  });

  it('membagi tanpa menciptakan atau menghilangkan rupiah', () => {
    const result = applyAutoSplit(50_000, SEED_RULES);
    const allocated = result.targets.reduce((s, t) => s + t.amount, 0);
    expect(allocated + result.remainderToUnsorted).toBe(50_000);
  });

  it('sisa pembulatan jatuh ke Unsorted', () => {
    const result = applyAutoSplit(999, SEED_RULES);
    const allocated = result.targets.reduce((s, t) => s + t.amount, 0);
    expect(allocated + result.remainderToUnsorted).toBe(999);
    expect(result.remainderToUnsorted).toBeGreaterThan(0);
  });

  it('auto-split mati = semua ke Unsorted', () => {
    const off = { ...SEED_RULES, autoSplit: { ...SEED_RULES.autoSplit, enabled: false } };
    expect(applyAutoSplit(50_000, off).remainderToUnsorted).toBe(50_000);
  });

  it('menolak rasio di atas 100%', () => {
    const over = { ...SEED_RULES, autoSplit: { ...SEED_RULES.autoSplit, ratios: { spend: 70, save: 40, give: 20 } } };
    expect(validateAutoSplit(over)).toEqual({ ok: false, errorKey: 'ratio.over100' });
  });

  it('mode Strict mewajibkan rasio habis 100%', () => {
    const strict = { ...SEED_RULES, mode: 'strict' as const, autoSplit: { ...SEED_RULES.autoSplit, ratios: { spend: 40, save: 40 } } };
    expect(validateAutoSplit(strict).errorKey).toBe('ratio.strictMustBeExact');
  });
});

describe('izin memindahkan uang', () => {
  it('Flexible: anak boleh mengubah Unsorted & Spend', () => {
    expect(canChildMoveFrom(wallet('w_unsorted'), SEED_RULES)).toBe(true);
    expect(canChildMoveFrom(wallet('w_snacks'), SEED_RULES)).toBe(true);
  });

  it('Strict: terkunci — dan INILAH yang belum ditegakkan di app anak', () => {
    const strict = { ...SEED_RULES, mode: 'strict' as const };
    expect(canChildMoveFrom(wallet('w_snacks'), strict)).toBe(false);
  });

  it('Grow, dream, dan Give tidak pernah bisa dipindah anak di kedua mode', () => {
    for (const mode of ['flexible', 'strict'] as const) {
      const rules = { ...SEED_RULES, mode };
      expect(canChildMoveFrom(wallet('w_gold'), rules)).toBe(false);
      expect(canChildMoveFrom(wallet('w_bmx'), rules)).toBe(false);
      expect(canChildMoveFrom(wallet('w_give'), rules)).toBe(false);
    }
  });
});

describe('I7 — Take money tidak pernah menyentuh dream, Give, Grow (ADR-0007)', () => {
  it('kantong terlindungi', () => {
    expect(canParentTakeFrom(wallet('w_bmx'))).toBe(false);
    expect(canParentTakeFrom(wallet('w_give'))).toBe(false);
    expect(canParentTakeFrom(wallet('w_gold'))).toBe(false);
  });

  it('kantong yang boleh', () => {
    expect(canParentTakeFrom(wallet('w_unsorted'))).toBe(true);
    expect(canParentTakeFrom(wallet('w_snacks'))).toBe(true);
    expect(canParentTakeFrom(wallet('w_free'))).toBe(true);
  });
});

describe('minus ⭐ saat merampok dream', () => {
  it('dream -> Spend kena 15', () => {
    expect(dreamRaidPenalty(wallet('w_bmx'), wallet('w_snacks'))).toBe(15);
  });
  it('dream -> dream lain gratis', () => {
    expect(dreamRaidPenalty(wallet('w_bmx'), wallet('w_headphones'))).toBe(0);
  });
  it('dream -> Grow gratis (menunda lebih lama = perilaku baik)', () => {
    expect(dreamRaidPenalty(wallet('w_bmx'), wallet('w_gold'))).toBe(0);
  });
});
