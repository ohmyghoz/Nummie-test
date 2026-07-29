/**
 * Add a child (Fase 2).
 *
 * Tiga keputusan yang hidup di berkas ini:
 *
 *  1. **Lahir hanya bulan + tahun.** Tanggal presisi tidak pernah diminta — ini sudah jadi
 *     constraint skema (`birth_month` + `birth_year`), bukan sekadar niat baik. Data anak
 *     sungguhan yang tidak dikumpulkan adalah data yang tidak bisa bocor.
 *
 *  2. **Tier DISARANKAN, tidak ditetapkan.** Usia cuma tebakan yang cukup baik; anak kelas 3
 *     yang sudah pegang uang sendiri dan anak kelas 3 yang belum pernah adalah dua anak yang
 *     berbeda. Ortu boleh menimpanya **tanpa dihakimi** — tidak ada peringatan, tidak ada
 *     "yakin?".
 *
 *  3. **PIN dicek panjang & isinya di sini**, bukan di layar. Layar boleh berubah; aturannya tidak.
 */
import type { Tier } from './types.js';

/**
 * PANJANG PIN: **6 digit, tetap** (K15 diputuskan 29 Juli 2026, ADR-0012 §Amandemen).
 *
 * Bukan sekadar merapikan tiga angka yang dulu bertentangan. Yang memaksa keputusannya adalah
 * cara anak masuk: anak mengetik **kode keluarga + PIN saja**, tanpa memilih dirinya lebih dulu,
 * lalu server mencari anak mana di keluarga itu yang PIN-nya cocok. Artinya setiap anak menambah
 * satu PIN yang sah di ruang tebakan yang sama — keluarga 3 anak = 3 kunci untuk satu gembok.
 *
 * 6 digit menjadikan ruang itu 1.000.000, bukan 10.000. Digabung rate limiting (ADR-0012),
 * itu selisih antara "bisa ditebak dalam hitungan hari" dan "tidak layak dicoba".
 *
 * Konsekuensi yang ikut terkunci: **PIN wajib unik dalam satu keluarga**. Ini tidak bisa dijaga
 * constraint — bcrypt memberi salt berbeda tiap baris, jadi dua PIN sama menghasilkan hash
 * berbeda. Penegakannya di waktu tulis: `pinTakenInFamily` di bawah, dan `family_pin_taken()`
 * di `supabase/migrations/0007_login_by_family_pin.sql` untuk sisi server.
 *
 * ⚠️ Ditinjau ulang kalau D5 memasukkan Little (KG B–Grade 2) — 6 digit untuk anak 5 tahun
 * adalah pertanyaan yang berbeda, dan jawabannya mungkin bukan PIN sama sekali.
 */
export const PIN_LENGTH = 6;

/** Batas usia untuk SARAN tier. Bisa ditimpa ortu — lihat catatan 2 di atas. */
export const LITTLE_MAX_AGE = 8;
export const MIDDLE_MAX_AGE = 12;

export interface ChildDraft {
  name: string;
  birthMonth: number;
  birthYear: number;
  tier: Tier;
  pin: string;
}

export type ChildErrorKey =
  | 'child.nameRequired'
  | 'child.birthMonthInvalid'
  | 'child.birthYearInvalid'
  | 'child.pinLength'
  | 'child.pinDigitsOnly'
  | 'child.pinTaken';

/**
 * Konteks yang hanya diketahui pemanggil. `pinTakenInFamily` sengaja berupa jawaban, bukan
 * daftar hash: perbandingan bcrypt milik database (`family_pin_taken()`), dan `packages/core`
 * tidak boleh tahu-menahu soal hashing.
 */
export interface ChildValidationContext {
  pinTakenInFamily?: boolean;
}

/** Usia dalam tahun penuh dari bulan+tahun lahir. Tanggal tidak pernah dipakai. */
export function ageFrom(birthMonth: number, birthYear: number, todayISO: string): number {
  const [y, m] = todayISO.split('-').map(Number);
  const years = (y ?? 0) - birthYear;
  // belum ulang tahun di tahun ini kalau bulannya belum lewat
  return (m ?? 1) >= birthMonth ? years : years - 1;
}

export function suggestTier(birthMonth: number, birthYear: number, todayISO: string): Tier {
  const age = ageFrom(birthMonth, birthYear, todayISO);
  if (age <= LITTLE_MAX_AGE) return 'little';
  if (age <= MIDDLE_MAX_AGE) return 'middle';
  return 'teen';
}

export function validateChild(
  draft: ChildDraft,
  todayISO: string,
  ctx: ChildValidationContext = {},
): { ok: boolean; errorKey?: ChildErrorKey } {
  if (!draft.name.trim()) return { ok: false, errorKey: 'child.nameRequired' };

  if (!Number.isInteger(draft.birthMonth) || draft.birthMonth < 1 || draft.birthMonth > 12) {
    return { ok: false, errorKey: 'child.birthMonthInvalid' };
  }

  const thisYear = Number(todayISO.slice(0, 4));
  // Batas bawah longgar & batas atas "tahun ini": yang dijaga cuma salah ketik, bukan usia.
  if (!Number.isInteger(draft.birthYear) || draft.birthYear < thisYear - 25 || draft.birthYear > thisYear) {
    return { ok: false, errorKey: 'child.birthYearInvalid' };
  }

  if (!/^\d+$/.test(draft.pin)) return { ok: false, errorKey: 'child.pinDigitsOnly' };
  if (draft.pin.length !== PIN_LENGTH) return { ok: false, errorKey: 'child.pinLength' };

  // Diperiksa TERAKHIR: kalau PIN-nya belum berbentuk sah, "sudah dipakai" cuma membingungkan.
  if (ctx.pinTakenInFamily) return { ok: false, errorKey: 'child.pinTaken' };

  return { ok: true };
}

/**
 * Wallet awal untuk anak baru — bentuknya sama untuk ketiga tier (model data identik;
 * yang berbeda hanya tampilan & izin). Grow ikut dibuat walaupun Little tidak menampilkannya,
 * supaya anak yang naik tier tidak perlu migrasi apa pun.
 */
export interface StarterWallet {
  name: string;
  category: 'unsorted' | 'spend' | 'save' | 'give';
  kind: 'unsorted' | 'envelope' | 'free_savings' | 'give_pool';
}

export const STARTER_WALLETS: StarterWallet[] = [
  { name: 'Unsorted', category: 'unsorted', kind: 'unsorted' },
  { name: 'Everyday', category: 'spend', kind: 'envelope' },
  { name: 'Free savings', category: 'save', kind: 'free_savings' },
  { name: 'Give', category: 'give', kind: 'give_pool' },
];
