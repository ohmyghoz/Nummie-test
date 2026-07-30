import { describe, expect, it } from 'vitest';
import {
  SEED_REQUESTS, SEED_RULES, SEED_WALLETS,
  applyAutoSplit, canChildMoveFrom, canParentTakeFrom, dreamRaidPenalty, promiseDebt, ratioTotal, validateAutoSplit,
} from '../src/index.js';
import type { MoneyRequest, MoneyRules } from '../src/index.js';

const wallet = (id: string) => SEED_WALLETS.find((w) => w.id === id)!;

const req = (over: Partial<MoneyRequest>): MoneyRequest => ({
  id: 'r', childId: 'c', kind: 'cash_out', amount: 1_000,
  status: 'needs_ok', fulfilment: 'todo', ...over,
});

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

describe('utang janji — metrik kepercayaan console (backlog §R)', () => {
  it('hanya approved + todo yang dihitung utang janji', () => {
    const debt = promiseDebt([
      req({ id: 'a', status: 'approved', fulfilment: 'todo' }),   // utang
      req({ id: 'b', status: 'needs_ok', fulfilment: 'todo' }),   // belum di-approve
      req({ id: 'c', status: 'approved', fulfilment: 'done' }),   // sudah ditepati
      req({ id: 'd', status: 'declined', fulfilment: 'todo' }),   // ditolak
      req({ id: 'e', status: 'approved', fulfilment: 'not_applicable' }), // Grow/Harvest instan
    ]);
    expect(debt.map((r) => r.id)).toEqual(['a']);
  });

  it('seed kanonik belum punya utang janji (request masih needs_ok)', () => {
    expect(promiseDebt(SEED_REQUESTS)).toHaveLength(0);
  });
});

describe('Grow dikecualikan dari auto-split (backlog A, ADR-0003)', () => {
  const withRatios = (ratios: MoneyRules['autoSplit']['ratios']): MoneyRules => ({
    childId: 'c1',
    mode: 'flexible',
    autoSplit: { enabled: true, ratios, destinations: { spend: 'w1', save: 'w2', give: 'w3', grow: 'w4' } },
  });

  it('rasio Grow ditolak, walaupun tujuannya ada', () => {
    // Tanpa penjagaan ini, uang saku mingguan bisa otomatis jadi investasi — padahal
    // memasukkan uang ke instrumen SELALU lewat pengajuan yang disetujui ortu (ADR-0003).
    const check = validateAutoSplit(withRatios({ spend: 30, save: 30, give: 20, grow: 20 }));
    expect(check.ok).toBe(false);
    expect(check.errorKey).toBe('ratio.growExcluded');
  });

  it('rasio Grow tidak ikut dihitung dalam total', () => {
    // 40+40+20 = 100 walaupun ada grow: 50 tertulis. Kalau grow ikut, ini akan tampak 150%.
    expect(ratioTotal({ enabled: true, ratios: { spend: 40, save: 40, give: 20, grow: 50 }, destinations: {} }))
      .toBe(100);
  });

  it('uang tidak pernah dialokasikan ke Grow oleh auto-split', () => {
    const split = applyAutoSplit(100_000, withRatios({ spend: 40, save: 40, give: 20, grow: 100 }));
    expect(split.targets.some((t) => t.category === 'grow')).toBe(false);
  });
});
