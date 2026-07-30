import { describe, expect, it } from 'vitest';
import {
  BIG_PRIZE_MIN_GEMS, CHORES_GATE_LIFETIME_STARS,
  allowedRewards, availableJobs, bigPrizesUnlocked, canRedeemGems, choresUnlocked,
  defaultReward, gemsPerWeek, isBigPrize, redeemGems, validateJob, validatePrize, weeksToEarn,
} from '../src/index.js';
import type { Economy, Job, JobDraft } from '../src/index.js';

/**
 * Berkas ini BARU (30 Juli 2026). Sampai hari ini `validateJob`, `validatePrize`, dan
 * `weeksToEarn` tidak punya satu pun test — padahal ketiganya yang menegakkan ADR-0004 di form
 * ortu.
 */

const job = (over: Partial<Job> = {}): Job => ({
  id: 'j1', childId: 'c1', kind: 'family_contribution',
  title: 'Make your bed', reward: 'gems', amount: 2, frequency: 'once', ...over,
});

const draft = (over: Partial<JobDraft> = {}): JobDraft => ({
  kind: 'family_contribution', title: 'Make your bed', reward: 'gems', amount: 2, ...over,
});

describe('kontribusi keluarga dibayar 💎 saja (ADR-0004)', () => {
  it('opsi uang tidak pernah ditawarkan untuk kontribusi keluarga', () => {
    expect(allowedRewards('family_contribution')).toEqual(['gems']);
    expect(allowedRewards('extra_work')).toContain('money');
    expect(allowedRewards('achievement')).toContain('money');
  });

  it('uang untuk kontribusi keluarga ditolak validator, bukan cuma disembunyikan UI', () => {
    // Membayar anak untuk merapikan tempat tidurnya sendiri mengubah kewajiban jadi transaksi.
    expect(validateJob(draft({ reward: 'money', amount: 15_000 })).errorKey)
      .toBe('job.moneyNotAllowedForFamily');
  });

  it('💎 selalu default, apa pun jenisnya — uang boleh tapi bukan bawaan', () => {
    expect(defaultReward('extra_work')).toBe('gems');
    expect(defaultReward('achievement')).toBe('gems');
  });

  it('judul & nominal wajib', () => {
    expect(validateJob(draft({ title: '  ' })).errorKey).toBe('job.titleRequired');
    expect(validateJob(draft({ amount: 0 })).errorKey).toBe('job.amountRequired');
  });
});

describe('hadiah dibeli 💎, dan estimasinya jujur', () => {
  it('judul & biaya wajib', () => {
    expect(validatePrize({ title: '', gemCost: 8 }).errorKey).toBe('prize.titleRequired');
    expect(validatePrize({ title: 'Screen time', gemCost: 0 }).errorKey).toBe('prize.costRequired');
  });

  it('tanpa job mingguan, estimasinya "tidak akan pernah" — bukan angka optimistis', () => {
    expect(gemsPerWeek([job(), job({ id: 'j2' })])).toBe(0);
    expect(weeksToEarn(8, 0)).toBeNull();
  });

  it('💎/minggu dijumlahkan dari job MINGGUAN ber-💎 saja', () => {
    const jobs = [
      job({ id: 'a', frequency: 'weekly', amount: 2 }),
      job({ id: 'b', frequency: 'weekly', amount: 3 }),
      job({ id: 'c', frequency: 'once', amount: 50 }),                       // sekali → tidak dihitung
      job({ id: 'd', frequency: 'weekly', kind: 'extra_work', reward: 'money', amount: 15_000 }),
    ];
    expect(gemsPerWeek(jobs)).toBe(5);
    expect(weeksToEarn(8, 5)).toBe(2);
  });
});

describe('tiga gerbang ADR-0004', () => {
  const eco = (over: Partial<Economy> = {}): Economy => ({
    starsBalance: 120, starsLifetime: 120, gems: 12, chaptersDone: 1, ...over,
  });

  it('gerbang 1: sistem chores tertutup sebelum ⭐ lifetime 100', () => {
    expect(choresUnlocked(eco({ starsLifetime: CHORES_GATE_LIFETIME_STARS - 1 }))).toBe(false);
    expect(choresUnlocked(eco({ starsLifetime: CHORES_GATE_LIFETIME_STARS }))).toBe(true);
  });

  it('gerbang 1 tertutup = TIDAK ADA job yang dirender (I3, bukan baris mati)', () => {
    expect(availableJobs([job()], false, false)).toHaveLength(0);
  });

  it('gerbang 2: jenis achievement tertutup sampai Chapter 2 selesai', () => {
    const jobs = [job(), job({ id: 'j2', kind: 'achievement', amount: 50 })];
    expect(availableJobs(jobs, true, false).map((j) => j.id)).toEqual(['j1']);
    expect(availableJobs(jobs, true, true)).toHaveLength(2);
    expect(bigPrizesUnlocked(eco({ chaptersDone: 2 }))).toBe(true);
  });

  it('gerbang 2 juga menjaga hadiah besar (≥25 💎)', () => {
    expect(isBigPrize(BIG_PRIZE_MIN_GEMS)).toBe(true);
    expect(redeemGems(eco({ gems: 60, chaptersDone: 1 }), 30).errorKey).toBe('gems.bigPrizeLocked');
    expect(redeemGems(eco({ gems: 60, chaptersDone: 2 }), 30).ok).toBe(true);
  });

  /**
   * `undefined` ≠ `false`. Kurikulum belum punya tabel, jadi memperlakukan "tidak ada data"
   * sebagai "belum selesai" akan menutup gerbang ini selamanya dan membuat 💎 jadi hiasan.
   */
  it('gerbang 3 menutup saat materi mingguan BELUM selesai, tapi tidak saat ia belum ada', () => {
    expect(canRedeemGems(eco({ weeklyMaterialDone: false }))).toBe(false);
    expect(canRedeemGems(eco({ weeklyMaterialDone: true }))).toBe(true);
    expect(canRedeemGems(eco())).toBe(true);   // undefined → belum ada materi mingguan
  });

  it('menukar lebih banyak dari yang dimiliki ditolak', () => {
    expect(redeemGems(eco({ gems: 5 }), 8).errorKey).toBe('gems.insufficient');
  });
});
