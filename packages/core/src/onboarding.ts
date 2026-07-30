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

/**
 * Tier yang benar-benar TERSEDIA di MVP — **Middle saja** (ADR-0020, menutup D5).
 *
 * Kenapa ini ada sebagai konstanta yang ditegakkan, bukan catatan di dokumen: D5 selama berbulan-bulan
 * *terasa* sudah dijawab karena sebuah kalimat di status/backlog menyebut pemilih tier "sudah dimatikan
 * lewat `harness()`". Fungsi itu hanya ada di mockup beku `legacy/`. Di app nyata tier dibaca dari
 * database dan layar "Add a child" menawarkan ketiganya — jadi tidak ada satu pun penegak. Pola yang
 * sama persis dengan `isPro()` sebelum ADR-0018: hidup di dokumen, tidak pernah dipanggil.
 *
 * ⚠️ **Ini batas CAKUPAN, bukan gerbang usia.** Catatan 2 di kepala berkas mengunci bahwa tier
 * disarankan dan boleh ditimpa ortu **tanpa dihakimi** — tidak ada peringatan, tidak ada "yakin?".
 * Memblokir ortu karena anaknya 7 tahun akan melanggar itu. Yang dilakukan: hanya tier yang tersedia
 * yang ditawarkan, dan kalau usia anak menyarankan tier di luar cakupan, ortu **diberi tahu apa
 * adanya** (uji tertutup untuk usia 9–12) — diberi tahu, bukan dihalangi.
 *
 * Menambah tier kembali = mengubah baris ini. Kode Little & Teen sengaja tidak dihapus.
 */
export const MVP_TIERS: readonly Tier[] = ['middle'];

export function isTierAvailable(tier: Tier): boolean {
  return MVP_TIERS.includes(tier);
}

/**
 * Rentang usia sebuah tier, diturunkan dari batas saran di atas — supaya layar tidak pernah menulis
 * "9–12" sebagai teks mati. `max: null` berarti tak berbatas atas.
 */
export function tierAgeRange(tier: Tier): { min: number; max: number | null } {
  if (tier === 'little') return { min: 0, max: LITTLE_MAX_AGE };
  if (tier === 'middle') return { min: LITTLE_MAX_AGE + 1, max: MIDDLE_MAX_AGE };
  return { min: MIDDLE_MAX_AGE + 1, max: null };
}

/**
 * Apakah usia anak menyarankan tier di luar cakupan MVP? Dipakai untuk memberi tahu ortu, **bukan**
 * untuk menolak. Lihat peringatan di `MVP_TIERS`.
 */
export function isAgeOutsideMvpScope(
  birthMonth: number,
  birthYear: number,
  todayISO: string,
): boolean {
  return !isTierAvailable(suggestTier(birthMonth, birthYear, todayISO));
}

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
  | 'child.pinTaken'
  | 'child.tierUnavailable';

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

  // Cakupan MVP (ADR-0020). Layar hanya menawarkan tier yang tersedia, jadi ini menangkap permintaan
  // yang tidak lewat layar — dan itu justru titik yang penting: penegaknya di sini, bukan di UI.
  if (!isTierAvailable(draft.tier)) return { ok: false, errorKey: 'child.tierUnavailable' };

  return validatePin(draft.pin, ctx);
}

export type PinErrorKey = Extract<
  ChildErrorKey, 'child.pinLength' | 'child.pinDigitsOnly' | 'child.pinTaken'
>;

/**
 * Aturan PIN, dipisah dari `validateChild` supaya **mengganti** PIN dan **membuat** anak memakai
 * pemeriksaan yang sama persis.
 *
 * Dipisah 30 Juli 2026 karena mengganti PIN ternyata tidak mungkin sama sekali: `pin_hash`
 * di-bcrypt dan sengaja tidak pernah keluar dari database (migrasi 0006), sementara PIN hanya
 * bisa diisi saat anak DIBUAT. Anak yang lupa PIN-nya terkunci permanen dari uangnya sendiri —
 * dan app justru menyuruhnya meminta bantuan ortu yang tidak bisa melihat apa pun.
 *
 * Kalau aturan ini disalin alih-alih dipakai bersama, "6 digit & unik per keluarga" punya dua
 * rumah, dan yang satu akan menyimpang. Keunikan itu bukan kerapian: login anak adalah
 * kode keluarga + PIN **tanpa memilih anak lebih dulu**, jadi dua PIN kembar membuat login tidak
 * punya jawaban tunggal (ADR-0012 §A1/§A2).
 */
export function validatePin(
  pin: string,
  ctx: ChildValidationContext = {},
): { ok: boolean; errorKey?: PinErrorKey } {
  if (!/^\d+$/.test(pin)) return { ok: false, errorKey: 'child.pinDigitsOnly' };
  if (pin.length !== PIN_LENGTH) return { ok: false, errorKey: 'child.pinLength' };

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
