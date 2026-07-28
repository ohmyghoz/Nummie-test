import { describe, expect, it } from 'vitest';
import {
  AVATAR_ITEMS, CHAPTERS, CHAPTER_COUNT, SEED_ECONOMY, STARS_PER_LESSON, THEMES,
  buyAvatar, canAfford, chapterStatus, choresUnlocked, lessonMix, lessonsPerChapter,
  ownsItem, practiceUnlocked, starsFromChapters,
} from '../src/index.js';

describe('struktur kurikulum', () => {
  it('enam chapter, dan daftarnya konsisten dengan hitungannya', () => {
    expect(CHAPTER_COUNT).toBe(6);
    expect(CHAPTERS).toHaveLength(CHAPTER_COUNT);
  });

  it('campuran pelajaran per tier (Fase 4)', () => {
    expect(lessonMix('little')).toEqual({ learn: 2, practice: 1 });
    expect(lessonMix('middle')).toEqual({ learn: 3, practice: 2 });
    expect(lessonMix('teen')).toEqual({ learn: 3, practice: 3 });
  });

  it('Little paling ringan, Teen paling berat', () => {
    expect(lessonsPerChapter('little')).toBeLessThan(lessonsPerChapter('middle'));
    expect(lessonsPerChapter('teen')).toBeGreaterThan(lessonsPerChapter('middle'));
  });
});

describe('gembok', () => {
  it('chapter: selesai / sekarang / terkunci', () => {
    expect(chapterStatus(0, 1)).toBe('done');
    expect(chapterStatus(1, 1)).toBe('current');
    expect(chapterStatus(2, 1)).toBe('locked');
  });

  it('Practice terkunci sampai Learn pasangannya selesai', () => {
    const mix = lessonMix('middle');
    expect(practiceUnlocked(2, mix)).toBe(false);
    expect(practiceUnlocked(3, mix)).toBe(true);
  });
});

describe('⭐ dari kurikulum menyambung ke gerbang chores', () => {
  it('Middle: menyelesaikan chapter 1 tepat mencapai gerbang 100', () => {
    expect(starsFromChapters(1, 'middle')).toBe(100);
    expect(choresUnlocked({ ...SEED_ECONOMY, starsLifetime: starsFromChapters(1, 'middle') })).toBe(true);
  });

  it('belum selesai satu chapter pun = gerbang masih tertutup', () => {
    expect(choresUnlocked({ ...SEED_ECONOMY, starsLifetime: starsFromChapters(0, 'middle') })).toBe(false);
  });

  it('seed Arthur konsisten: chapter 1 selesai, lifetime di atas gerbang', () => {
    expect(SEED_ECONOMY.chaptersDone).toBe(1);
    expect(SEED_ECONOMY.starsLifetime).toBeGreaterThanOrEqual(starsFromChapters(1, 'middle'));
  });

  it('STARS_PER_LESSON dipakai konsisten', () => {
    expect(starsFromChapters(2, 'middle')).toBe(2 * lessonsPerChapter('middle') * STARS_PER_LESSON);
  });
});

describe('toko avatar — kosmetik saja', () => {
  it('lima tema, dan avatar dasar gratis', () => {
    expect(THEMES).toHaveLength(5);
    expect(ownsItem(AVATAR_ITEMS[0]!, [])).toBe(true);
  });

  it('avatar berbayar harus dibuka dulu', () => {
    const paid = AVATAR_ITEMS.find((i) => i.costStars > 0)!;
    expect(ownsItem(paid, [])).toBe(false);
    expect(ownsItem(paid, [paid.key])).toBe(true);
  });

  it('tidak mampu = tidak bisa beli', () => {
    const dragon = AVATAR_ITEMS.find((i) => i.key === 'dragon')!;
    expect(canAfford({ ...SEED_ECONOMY, starsBalance: 10 }, dragon)).toBe(false);
    expect(buyAvatar({ ...SEED_ECONOMY, starsBalance: 10 }, dragon).errorKey).toBe('stars.insufficient');
  });

  it('REGRESI ADR-0004: beli avatar tidak mengunci ulang chores', () => {
    const before = { ...SEED_ECONOMY, starsBalance: 120, starsLifetime: 120 };
    const after = buyAvatar(before, AVATAR_ITEMS.find((i) => i.key === 'dragon')!).economy!;
    expect(after.starsBalance).toBe(0);
    expect(choresUnlocked(after)).toBe(true);
  });
});
