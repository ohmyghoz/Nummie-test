import { describe, expect, it } from 'vitest';
import {
  PIN_LENGTH, STARTER_WALLETS, MVP_TIERS,
  ageFrom, allowedRewards, defaultReward, suggestTier,
  isTierAvailable, isAgeOutsideMvpScope, tierAgeRange, validatePin,
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

  it('ortu boleh menimpanya, dan itu tidak pernah ditolak KARENA USIA', () => {
    // anak 7 tahun disetel Middle: aneh, tapi sah — tidak ada penghakiman usia di validasi.
    // Dulu test ini memakai tier 'teen'; dipisah setelah ADR-0020 karena kalimat aslinya
    // mencampur dua hal — "usia tidak menghakimi" dan "tier apa saja boleh".
    expect(validateChild(child({ birthYear: 2019, tier: 'middle' }), TODAY).ok).toBe(true);
    expect(validateChild(child({ birthYear: 2005, tier: 'middle' }), TODAY).ok).toBe(true);
  });
});

describe('validatePin — aturan yang sama untuk MEMBUAT dan MENGGANTI', () => {
  it('6 digit, angka saja', () => {
    expect(validatePin('135790').ok).toBe(true);
    expect(validatePin('1234').errorKey).toBe('child.pinLength');
    expect(validatePin('1234567').errorKey).toBe('child.pinLength');
    expect(validatePin('12a456').errorKey).toBe('child.pinDigitsOnly');
    expect(validatePin('').errorKey).toBe('child.pinDigitsOnly');
  });

  it('bentuk diperiksa SEBELUM "sudah dipakai"', () => {
    // PIN cacat yang kebetulan bentrok harus mengeluh soal bentuknya dulu — "sudah dipakai"
    // untuk PIN 4 digit cuma membingungkan.
    expect(validatePin('12', { pinTakenInFamily: true }).errorKey).toBe('child.pinLength');
  });

  it('unik per keluarga — konsekuensi login tanpa memilih anak (ADR-0012 §A1)', () => {
    expect(validatePin('135790', { pinTakenInFamily: true }).errorKey).toBe('child.pinTaken');
  });

  it('validateChild memakai aturan yang SAMA, bukan salinannya', () => {
    // Kalau keduanya menyimpang, "6 digit & unik" punya dua rumah dan yang satu akan busuk.
    for (const pin of ['1234', '12a456', '1234567']) {
      expect(validateChild(child({ pin }), TODAY).errorKey).toBe(validatePin(pin).errorKey);
    }
  });
});

describe('cakupan MVP: Middle saja (ADR-0020 menutup D5)', () => {
  it('hanya tier yang tersedia yang lolos — dan penegaknya di core, bukan di layar', () => {
    expect(MVP_TIERS).toEqual(['middle']);
    expect(validateChild(child({ tier: 'middle' }), TODAY).ok).toBe(true);
    expect(validateChild(child({ tier: 'little' }), TODAY).errorKey).toBe('child.tierUnavailable');
    expect(validateChild(child({ tier: 'teen' }), TODAY).errorKey).toBe('child.tierUnavailable');
  });

  it('yang ditolak adalah CAKUPAN, bukan usianya', () => {
    // anak 15 tahun pun ditolak untuk Teen — alasannya tier itu belum dibuka, bukan umurnya.
    expect(validateChild(child({ birthYear: 2011, tier: 'teen' }), TODAY).errorKey)
      .toBe('child.tierUnavailable');
  });

  it('logika Little & Teen tetap hidup — dibatasi, bukan dihapus (aturan CLAUDE.md)', () => {
    // `suggestTier` masih tahu ketiganya. Kalau ini mati, menambah tier kembali jadi mahal.
    expect(suggestTier(1, 2019, TODAY)).toBe('little');
    expect(suggestTier(1, 2011, TODAY)).toBe('teen');
    expect(isTierAvailable('little')).toBe(false);
    expect(isTierAvailable('middle')).toBe(true);
  });

  it('usia di luar cakupan diberi tahu, bukan dihalangi', () => {
    expect(isAgeOutsideMvpScope(1, 2019, TODAY)).toBe(true);   // 7 → little
    expect(isAgeOutsideMvpScope(1, 2011, TODAY)).toBe(true);   // 15 → teen
    expect(isAgeOutsideMvpScope(1, 2015, TODAY)).toBe(false);  // 11 → middle
    // ...dan tetap boleh dibuat, selama tier-nya yang tersedia.
    expect(validateChild(child({ birthYear: 2019, tier: 'middle' }), TODAY).ok).toBe(true);
  });

  it('rentang usia diturunkan dari konstanta, tidak ditulis mati di layar', () => {
    expect(tierAgeRange('middle')).toEqual({ min: 9, max: 12 });
    expect(tierAgeRange('little')).toEqual({ min: 0, max: 8 });
    expect(tierAgeRange('teen')).toEqual({ min: 13, max: null });
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

  it('PIN tepat 6 digit — K15 dikunci, 4 dan 5 digit sekarang DITOLAK', () => {
    expect(PIN_LENGTH).toBe(6);
    expect(validateChild(child({ pin: '1'.repeat(PIN_LENGTH) }), TODAY).ok).toBe(true);
    expect(validateChild(child({ pin: '1234' }), TODAY).errorKey).toBe('child.pinLength');
    expect(validateChild(child({ pin: '12345' }), TODAY).errorKey).toBe('child.pinLength');
    expect(validateChild(child({ pin: '1234567' }), TODAY).errorKey).toBe('child.pinLength');
  });

  // Konsekuensi login "kode keluarga + PIN" tanpa memilih anak: dua anak ber-PIN sama membuat
  // pertanyaan "ini siapa?" tidak punya jawaban. Server menolak login yang ambigu; layar ini
  // mencegahnya lahir sejak awal.
  it('PIN kembar dalam satu keluarga ditolak', () => {
    expect(validateChild(child(), TODAY, { pinTakenInFamily: true }).errorKey).toBe('child.pinTaken');
    expect(validateChild(child(), TODAY, { pinTakenInFamily: false }).ok).toBe(true);
  });

  it('PIN cacat bentuk dilaporkan sebagai cacat bentuk, bukan sebagai "sudah dipakai"', () => {
    // urutan pemeriksaan penting: "PIN sudah dipakai" untuk PIN 3 digit cuma membingungkan ortu
    expect(validateChild(child({ pin: '123' }), TODAY, { pinTakenInFamily: true }).errorKey)
      .toBe('child.pinLength');
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
