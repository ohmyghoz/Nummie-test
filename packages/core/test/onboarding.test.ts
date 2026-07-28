import { describe, expect, it } from 'vitest';
import {
  PIN_MAX_LENGTH, PIN_MIN_LENGTH, STARTER_WALLETS,
  ageFrom, allowedRewards, defaultReward, suggestTier,
  validateChild, validateJob, validatePrize, weeksToEarn,
} from '../src/index.js';
import type { ChildDraft, JobDraft } from '../src/index.js';

const TODAY = '2026-07-28';
const child = (over: Partial<ChildDraft> = {}): ChildDraft => ({
  name: 'Arthur', birthMonth: 5, birthYear: 2015, tier: 'middle', pin: '135790', ...over,
});

describe('privasi: bulan + tahun saja', () => {
  it('usia dihitung tanpa tanggal', () => {
    expect(ageFrom(5, 2015, TODAY)).toBe(11);   // Mei sudah lewat
    expect(ageFrom(12, 2015, TODAY)).toBe(10);  // Desember belum
  });
});

describe('tier DISARANKAN, tidak ditetapkan', () => {
  it('saran mengikuti usia', () => {
    expect(suggestTier(1, 2019, TODAY)).toBe('little');  // 7
    expect(suggestTier(1, 2015, TODAY)).toBe('middle');  // 11
    expect(suggestTier(1, 2011, TODAY)).toBe('teen');    // 15
  });

  it('ortu boleh menimpanya, dan itu tidak pernah ditolak', () => {
    // anak 7 tahun disetel Teen: aneh, tapi sah — tidak ada penghakiman di validasi
    expect(validateChild(child({ birthYear: 2019, tier: 'teen' }), TODAY).ok).toBe(true);
  });
});

describe('validasi anak baru', () => {
  it('nama wajib', () => {
    expect(validateChild(child({ name: '  ' }), TODAY).errorKey).toBe('child.nameRequired');
  });

  it('bulan lahir 1–12', () => {
    expect(validateChild(child({ birthMonth: 0 }), TODAY).errorKey).toBe('child.birthMonthInvalid');
    expect(validateChild(child({ birthMonth: 13 }), TODAY).errorKey).toBe('child.birthMonthInvalid');
  });

  it('tahun lahir menjaga salah ketik, bukan usia', () => {
    expect(validateChild(child({ birthYear: 1899 }), TODAY).errorKey).toBe('child.birthYearInvalid');
    expect(validateChild(child({ birthYear: 2030 }), TODAY).errorKey).toBe('child.birthYearInvalid');
  });

  it('PIN hanya digit', () => {
    expect(validateChild(child({ pin: '12ab56' }), TODAY).errorKey).toBe('child.pinDigitsOnly');
  });

  it('PIN menerima 4 sampai 6 digit — ketiga angka di repo lolos, tidak ada yang diputuskan', () => {
    expect(validateChild(child({ pin: '1'.repeat(PIN_MIN_LENGTH) }), TODAY).ok).toBe(true);
    expect(validateChild(child({ pin: '1'.repeat(PIN_MAX_LENGTH) }), TODAY).ok).toBe(true);
    expect(validateChild(child({ pin: '123' }), TODAY).errorKey).toBe('child.pinLength');
    expect(validateChild(child({ pin: '1234567' }), TODAY).errorKey).toBe('child.pinLength');
  });
});

describe('wallet awal identik untuk ketiga tier', () => {
  it('selalu punya tepat satu Unsorted', () => {
    expect(STARTER_WALLETS.filter((w) => w.kind === 'unsorted')).toHaveLength(1);
  });

  it('mencakup Spend, Save, dan Give', () => {
    const cats = STARTER_WALLETS.map((w) => w.category);
    expect(cats).toEqual(expect.arrayContaining(['spend', 'save', 'give']));
  });
});

const job = (over: Partial<JobDraft> = {}): JobDraft => ({
  kind: 'family_contribution', title: 'Beresin kamar', reward: 'gems', amount: 2, ...over,
});

describe('kontribusi keluarga TIDAK PERNAH dibayar uang', () => {
  it('opsi uang tidak boleh muncul di layar', () => {
    expect(allowedRewards('family_contribution')).toEqual(['gems']);
  });

  it('dan datanya tetap ditolak walau UI dilewati', () => {
    expect(validateJob(job({ reward: 'money', amount: 10_000 })).errorKey)
      .toBe('job.moneyNotAllowedForFamily');
  });

  it('kerja ekstra & pencapaian boleh uang', () => {
    expect(allowedRewards('extra_work')).toEqual(['gems', 'money']);
    expect(validateJob(job({ kind: 'extra_work', reward: 'money', amount: 10_000 })).ok).toBe(true);
  });

  it('tapi 💎 tetap defaultnya — nudge, bukan larangan', () => {
    expect(defaultReward('achievement')).toBe('gems');
    expect(defaultReward('extra_work')).toBe('gems');
  });

  it('judul & nominal wajib', () => {
    expect(validateJob(job({ title: ' ' })).errorKey).toBe('job.titleRequired');
    expect(validateJob(job({ amount: 0 })).errorKey).toBe('job.amountRequired');
  });
});

describe('prize: "berapa lama untuk dapat"', () => {
  it('membulatkan ke atas', () => {
    expect(weeksToEarn(25, 6)).toBe(5);
    expect(weeksToEarn(12, 6)).toBe(2);
  });

  it('hadiah yang mustahil ditandai, bukan disembunyikan', () => {
    expect(weeksToEarn(25, 0)).toBeNull();
  });

  it('validasi dasar', () => {
    expect(validatePrize({ title: '', gemCost: 5 }).errorKey).toBe('prize.titleRequired');
    expect(validatePrize({ title: 'Main game 1 jam', gemCost: 0 }).errorKey).toBe('prize.costRequired');
    expect(validatePrize({ title: 'Main game 1 jam', gemCost: 5 }).ok).toBe(true);
  });
});
