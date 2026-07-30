import { describe, expect, it } from 'vitest';
import {
  LIMITS, ONE_TIME_PRICE_RP,
  canAdd, canShowUpgrade, growthRewardEnabled, limitsFor,
} from '../src/index.js';

describe('batas Free/Pro mencerminkan premium-setting §3', () => {
  it('Free membatasi, Pro tidak', () => {
    expect(limitsFor('free').maxChildren).toBe(1);
    expect(limitsFor('pro').maxChildren).toBe(4);          // satu harga sampai 4 anak
    expect(limitsFor('free').maxDreams).toBe(1);
    expect(limitsFor('pro').maxDreams).toBe(Infinity);
    expect(limitsFor('free').maxActiveJobs).toBe(3);
    expect(limitsFor('free').maxPrizes).toBe(1);
  });

  it('harga sekali bayar terkunci di satu tempat (ADR-0018)', () => {
    expect(ONE_TIME_PRICE_RP).toBe(399_000);
  });
});

/**
 * Test ini menjaga kalimat `premium-setting.md` §3: "Ini kesalahan gating yang paling mungkin
 * terjadi — cegah eksplisit." Kalau suatu hari ada yang menggabungkan Growth Reward ke flag `grow`,
 * bunga simulasi akan hilang untuk semua keluarga Free — dan bersamanya penyebut yang membuat Time
 * Deposit bisa dijelaskan ke anak.
 */
describe('Growth Reward BUKAN bagian dari flag grow', () => {
  it('grow mati di Free, tapi Growth Reward tetap hidup', () => {
    expect(limitsFor('free').grow).toBe(false);
    expect(growthRewardEnabled()).toBe(true);
  });

  it('Growth Reward tidak pernah bergantung pada plan — tidak ada parameter plan sama sekali', () => {
    expect(growthRewardEnabled.length).toBe(0);
  });
});

describe('batas berlaku saat MENAMBAH, tidak pernah mengambil yang sudah ada', () => {
  it('Free menolak dream kedua', () => {
    expect(canAdd('free', 'maxDreams', 0)).toBe(true);
    expect(canAdd('free', 'maxDreams', 1)).toBe(false);
  });

  it('data yang sudah melebihi batas tetap boleh ada — hanya tidak bisa ditambah', () => {
    // Keluarga dengan 3 dream di plan Free (mis. lahir sebelum batas ada, atau pernah Pro).
    // Yang benar: TIDAK bisa menambah. Yang salah: kehilangan dream. Tidak ada fungsi di `plan.ts`
    // yang bisa menghapus apa pun — "jangan pernah sandera data" (premium-setting §2).
    expect(canAdd('free', 'maxDreams', 3)).toBe(false);
    expect(Object.keys(LIMITS.free)).not.toContain('removeExcess');
  });

  it('Pro tidak pernah menolak', () => {
    expect(canAdd('pro', 'maxActiveJobs', 999)).toBe(true);
  });

  it('flag boolean bukan batas jumlah, jadi canAdd menolaknya', () => {
    // `grow` bukan kuota. Memanggil canAdd untuknya adalah salah pakai, dan jawabannya harus
    // "tidak", bukan angka yang menyesatkan.
    expect(canAdd('pro', 'grow', 0)).toBe(false);
  });
});

describe('I5 — tombol upgrade tidak pernah tampil untuk pengguna sekolah', () => {
  it('sekolah tidak pernah melihat tombol beli, walau plannya free', () => {
    expect(canShowUpgrade('free', 'school')).toBe(false);
  });

  it('keluarga Free biasa melihatnya; yang sudah Pro tidak', () => {
    expect(canShowUpgrade('free')).toBe(true);
    expect(canShowUpgrade('free', 'iap')).toBe(true);
    expect(canShowUpgrade('pro', 'iap')).toBe(false);
    expect(canShowUpgrade('pro', 'grant')).toBe(false);
  });
});
