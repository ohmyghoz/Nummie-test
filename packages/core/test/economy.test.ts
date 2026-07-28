import { describe, expect, it } from 'vitest';
import {
  CHORES_GATE_LIFETIME_STARS, SEED_ECONOMY, SEED_WALLETS,
  applyDreamRaid, bigPrizesUnlocked, canEarnGems, canRedeemGems, choresUnlocked,
  earnStars, redeemGems, spendStars,
} from '../src/index.js';
import type { Economy } from '../src/index.js';

const wallet = (id: string) => SEED_WALLETS.find((w) => w.id === id)!;
const eco = (over: Partial<Economy> = {}): Economy => ({
  starsBalance: 120, starsLifetime: 120, gems: 12, chaptersDone: 1, ...over,
});

describe('dua angka ⭐, bukan satu (ADR-0004)', () => {
  it('dapat ⭐ menaikkan saldo DAN lifetime', () => {
    const e = earnStars(eco(), 30);
    expect(e.starsBalance).toBe(150);
    expect(e.starsLifetime).toBe(150);
  });

  it('belanja ⭐ memotong saldo saja, lifetime tidak pernah turun', () => {
    const e = spendStars(eco(), 50).economy!;
    expect(e.starsBalance).toBe(70);
    expect(e.starsLifetime).toBe(120);
  });

  it('REGRESI ADR-0004: beli avatar tidak boleh mengunci ulang chores', () => {
    const before = eco({ starsBalance: 100, starsLifetime: 100 });
    expect(choresUnlocked(before)).toBe(true);
    // habiskan seluruh saldo untuk avatar
    const after = spendStars(before, 100).economy!;
    expect(after.starsBalance).toBe(0);
    expect(choresUnlocked(after)).toBe(true); // gerbang tetap terbuka — inilah alasan dua angka
  });

  it('tidak bisa belanja melebihi saldo', () => {
    expect(spendStars(eco({ starsBalance: 10 }), 50).errorKey).toBe('stars.insufficient');
  });

  it('invarian lifetime >= saldo bertahan setelah rangkaian aksi', () => {
    let e = eco({ starsBalance: 0, starsLifetime: 0 });
    e = earnStars(e, 40);
    e = spendStars(e, 25).economy!;
    e = earnStars(e, 10);
    expect(e.starsLifetime).toBeGreaterThanOrEqual(e.starsBalance);
  });
});

describe('tiga gerbang', () => {
  it('gerbang 1 — chores terbuka di ⭐ lifetime 100, memakai lifetime bukan saldo', () => {
    expect(choresUnlocked(eco({ starsLifetime: CHORES_GATE_LIFETIME_STARS - 1 }))).toBe(false);
    expect(choresUnlocked(eco({ starsBalance: 0, starsLifetime: CHORES_GATE_LIFETIME_STARS }))).toBe(true);
  });

  it('gerbang 2 — hadiah besar terkunci sampai Chapter 2 selesai', () => {
    const e = eco({ chaptersDone: 1, gems: 100, weeklyMaterialDone: true });
    expect(bigPrizesUnlocked(e)).toBe(false);
    expect(redeemGems(e, 25).errorKey).toBe('gems.bigPrizeLocked');
    expect(redeemGems({ ...e, chaptersDone: 2 }, 25).ok).toBe(true);
  });

  it('gerbang 3 ada di PENUKARAN, bukan perolehan — 💎 selalu boleh dikumpulkan', () => {
    const belumBelajar = eco({ weeklyMaterialDone: false });
    expect(canEarnGems()).toBe(true);              // kontribusi keluarga tak pernah bersyarat
    expect(canRedeemGems(belumBelajar)).toBe(false);
    expect(redeemGems(belumBelajar, 5).errorKey).toBe('gems.weeklyMaterialUnfinished');
  });

  it('penukaran kecil lolos setelah materi mingguan selesai', () => {
    const e = eco({ weeklyMaterialDone: true });
    expect(redeemGems(e, 5).economy!.gems).toBe(7);
  });

  it('💎 tidak cukup tetap ditolak', () => {
    expect(redeemGems(eco({ gems: 2, weeklyMaterialDone: true }), 5).errorKey).toBe('gems.insufficient');
  });
});

describe('minus ⭐ saat merampok dream', () => {
  it('dream -> Spend memotong saldo 15, lifetime utuh', () => {
    const e = applyDreamRaid(eco(), wallet('w_bmx'), wallet('w_snacks'));
    expect(e.starsBalance).toBe(105);
    expect(e.starsLifetime).toBe(120);
  });

  it('dream -> dream lain dan dream -> Grow tidak kena', () => {
    expect(applyDreamRaid(eco(), wallet('w_bmx'), wallet('w_headphones')).starsBalance).toBe(120);
    expect(applyDreamRaid(eco(), wallet('w_bmx'), wallet('w_gold')).starsBalance).toBe(120);
  });

  it('saldo tidak pernah menembus nol', () => {
    const e = applyDreamRaid(eco({ starsBalance: 5 }), wallet('w_bmx'), wallet('w_snacks'));
    expect(e.starsBalance).toBe(0);
  });
});

describe('seed kanonik tetap sah', () => {
  it('SEED_ECONOMY memenuhi bentuk Economy dan invariannya', () => {
    expect(SEED_ECONOMY.starsLifetime).toBeGreaterThanOrEqual(SEED_ECONOMY.starsBalance);
    expect(choresUnlocked(SEED_ECONOMY)).toBe(true);
    expect(bigPrizesUnlocked(SEED_ECONOMY)).toBe(false); // baru chapter 1 dari 6
  });
});
