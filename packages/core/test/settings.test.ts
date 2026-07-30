import { describe, expect, it } from 'vitest';
import {
  MONTHLY_MAX_DAY, SEED_PRICES,
  daysUntilMaturity, isMatured, maturityDate, nextAllowanceDates,
  ratesRewardPatience, validateAllowance, validateBankRates,
} from '../src/index.js';
import type { AllowanceSchedule } from '../src/index.js';

const sched = (over: Partial<AllowanceSchedule> = {}): AllowanceSchedule => ({
  enabled: true, amount: 50_000, frequency: 'weekly', day: 1, ...over, // Senin
});

describe('jadwal uang saku', () => {
  // 2026-07-28 adalah hari Selasa.
  const tuesday = '2026-07-28';

  it('mingguan: Senin berikutnya, lalu tiap 7 hari', () => {
    expect(nextAllowanceDates(sched(), tuesday, 3))
      .toEqual(['2026-08-03', '2026-08-10', '2026-08-17']);
  });

  it('dua mingguan: tanggal pertama sama, bedanya baru terlihat setelahnya', () => {
    const weekly = nextAllowanceDates(sched(), tuesday, 3);
    const biweekly = nextAllowanceDates(sched({ frequency: 'biweekly' }), tuesday, 3);
    expect(biweekly[0]).toBe(weekly[0]);       // inilah kenapa preview butuh >1 tanggal
    expect(biweekly).toEqual(['2026-08-03', '2026-08-17', '2026-08-31']);
  });

  it('hari yang sama dengan hari ini dianggap minggu depan, bukan hari ini', () => {
    // 2026-07-28 Selasa; jadwal Selasa harus melompat ke 4 Agustus
    expect(nextAllowanceDates(sched({ day: 2 }), tuesday, 1)).toEqual(['2026-08-04']);
  });

  it('bulanan: tanggal yang sudah lewat pindah ke bulan berikutnya', () => {
    expect(nextAllowanceDates(sched({ frequency: 'monthly', day: 5 }), tuesday, 3))
      .toEqual(['2026-08-05', '2026-09-05', '2026-10-05']);
  });

  it('bulanan: tanggal yang belum lewat tetap di bulan ini', () => {
    expect(nextAllowanceDates(sched({ frequency: 'monthly', day: 5 }), '2026-07-01', 1))
      .toEqual(['2026-07-05']);
  });

  it('jadwal mati tidak menghasilkan tanggal apa pun', () => {
    expect(nextAllowanceDates(sched({ enabled: false }), tuesday)).toEqual([]);
  });
});

describe('validasi jadwal', () => {
  it('nominal wajib saat aktif', () => {
    expect(validateAllowance(sched({ amount: 0 })).errorKey).toBe('allowance.amountRequired');
    expect(validateAllowance(sched({ enabled: false, amount: 0 })).ok).toBe(true);
  });

  it('hari mingguan 0–6', () => {
    expect(validateAllowance(sched({ day: 6 })).ok).toBe(true);
    expect(validateAllowance(sched({ day: 7 })).errorKey).toBe('allowance.dayOutOfRange');
  });

  it('tanggal bulanan dibatasi 28 — Februari tidak boleh menghilangkan uang saku', () => {
    expect(validateAllowance(sched({ frequency: 'monthly', day: MONTHLY_MAX_DAY })).ok).toBe(true);
    expect(validateAllowance(sched({ frequency: 'monthly', day: 29 })).errorKey)
      .toBe('allowance.dayOutOfRange');
    expect(validateAllowance(sched({ frequency: 'monthly', day: 0 })).errorKey)
      .toBe('allowance.dayOutOfRange');
  });

  it('tanggal 28 tetap ada di Februari', () => {
    expect(nextAllowanceDates(sched({ frequency: 'monthly', day: 28 }), '2027-02-01', 1))
      .toEqual(['2027-02-28']);
  });
});

describe('rate bank ditetapkan ortu, bukan feed', () => {
  it('seed masuk akal dan menghargai kesabaran', () => {
    expect(validateBankRates(SEED_PRICES.bankRates).ok).toBe(true);
    expect(ratesRewardPatience(SEED_PRICES.bankRates)).toBe(true);
  });

  it('menolak rate negatif dan salah ketik ekstrem', () => {
    expect(validateBankRates({ m3: -1, m6: 2, m12: 3 }).errorKey).toBe('rates.negative');
    expect(validateBankRates({ m3: 1, m6: 2, m12: 5_000 }).errorKey).toBe('rates.tooHigh');
  });

  it('tenor panjang yang membayar lebih kecil TIDAK dilarang — hanya ditandai', () => {
    const upsideDown = { m3: 5, m6: 3, m12: 1 };
    expect(validateBankRates(upsideDown).ok).toBe(true);   // ortu tetap bank-nya
    expect(ratesRewardPatience(upsideDown)).toBe(false);   // tapi layar menyebutkannya
  });
});

describe('jatuh tempo deposito', () => {
  it('tenor menambah hari yang benar', () => {
    expect(maturityDate('2026-01-01', 3)).toBe('2026-04-01');
    expect(maturityDate('2026-01-01', 12)).toBe('2027-01-01');
  });

  it('hitung mundur, dan tidak pernah negatif', () => {
    expect(daysUntilMaturity('2026-07-01', 3, '2026-07-28')).toBe(63);
    expect(daysUntilMaturity('2026-01-01', 3, '2026-12-31')).toBe(0);
  });

  it('seed: deposito 1 Juli tenor 6 bulan belum jatuh tempo pada 28 Juli', () => {
    expect(isMatured('2026-07-01', 6, '2026-07-28')).toBe(false);
  });
});

describe('biweekly punya anchor — jadwalnya tidak bergeser tiap layar dibuka', () => {
  // Cacat yang ditutup: tanpa anchor, "dua mingguan hari Senin" dihitung dari HARI INI, jadi
  // ortu yang membuka Settings di minggu berbeda melihat dua jadwal berbeda untuk setelan yang
  // sama persis — dan uang saku anak bergeser satu minggu tiap kali setelannya disentuh.
  const biweekly = (anchorDate?: string): AllowanceSchedule => ({
    enabled: true, amount: 50_000, frequency: 'biweekly', day: 1, anchorDate,
  });

  it('jadwal sama walau dilihat dari minggu yang berbeda', () => {
    const anchor = '2026-07-06';   // Senin
    const dariMingguIni = nextAllowanceDates(biweekly(anchor), '2026-07-28', 3);
    const dariMingguDepan = nextAllowanceDates(biweekly(anchor), '2026-08-04', 3);

    // Tanggal yang masih di depan keduanya harus SAMA — bukan bergeser tujuh hari.
    for (const tanggal of dariMingguDepan) {
      if (dariMingguIni.includes(tanggal)) continue;
      expect(tanggal > dariMingguIni[dariMingguIni.length - 1]!).toBe(true);
    }
    expect(dariMingguIni.every((d) => d >= '2026-07-28')).toBe(true);
  });

  it('semua tanggal jatuh di kisi 14 hari dari anchor', () => {
    const anchor = '2026-07-06';
    for (const iso of nextAllowanceDates(biweekly(anchor), '2026-07-28', 4)) {
      const selisih = (Date.parse(iso) - Date.parse(anchor)) / 86_400_000;
      expect(selisih % 14).toBe(0);
    }
  });

  it('tanpa anchor tetap jalan — weekly & monthly tidak membutuhkannya', () => {
    expect(nextAllowanceDates(biweekly(undefined), '2026-07-28', 2)).toHaveLength(2);
  });
});
