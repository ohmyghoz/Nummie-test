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
 * ⚠️ PANJANG PIN BELUM DIPUTUSKAN — repo menyebut tiga angka berbeda:
 *   - `supabase/migrations/0001_init.sql` : "4 digit = 10.000 kombinasi"
 *   - `supabase/functions/child-login`    : "PIN 4–6 digit"
 *   - `docs/nummi-backlog.md` (Add a child): "PIN 6-digit"
 *
 * Rentang di bawah menerima ketiganya, jadi tidak ada yang diputuskan diam-diam di sini.
 * Yang benar-benar penting sudah pasti apa pun jawabannya: **rate limiting wajib** (ADR-0012),
 * karena 4 digit hanya 10.000 kombinasi.
 */
export const PIN_MIN_LENGTH = 4;
export const PIN_MAX_LENGTH = 6;

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
  | 'child.pinDigitsOnly';

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
  if (draft.pin.length < PIN_MIN_LENGTH || draft.pin.length > PIN_MAX_LENGTH) {
    return { ok: false, errorKey: 'child.pinLength' };
  }

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
