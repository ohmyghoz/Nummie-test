/**
 * Plan keluarga & batas Free/Pro — cerminan `docs/premium-setting.md` §3.
 *
 * Harga dikunci ADR-0018: **sekali bayar Rp399.000**, satu produk IAP. Karena tidak ada langganan
 * yang berakhir, **tidak ada logika downgrade** di berkas ini — dan itu keputusan, bukan kelalaian.
 *
 * ── Tiga hal yang paling mudah salah, dan kenapa masing-masing dijaga test ───
 *
 *  1. **Growth Reward BUKAN bagian dari flag `grow`.** `premium-setting.md` §3 menyebutnya dengan
 *     kata-kata sendiri: *"Ini kesalahan gating yang paling mungkin terjadi — cegah eksplisit."*
 *     `grow: false` hanya mematikan Time Deposit / Gold / Forex. Bunga simulasi kecil selalu aktif
 *     untuk semua plan, karena COGS-nya nol dan ia penyebut yang membuat TD bisa dijelaskan.
 *
 *  2. **Batas berlaku saat MENAMBAH, tidak pernah mengambil yang sudah ada.** Keluarga yang turun
 *     ke Free (atau yang datanya lahir sebelum batas ada) tidak boleh kehilangan dream keduanya.
 *     `premium-setting.md` §2: *"Jangan pernah sandera data/riwayat."* Karena itu `canAdd()`
 *     membandingkan jumlah SEKARANG, dan tidak ada fungsi apa pun di sini yang menghapus.
 *
 *  3. **App anak tidak pernah membaca plan untuk memasang gembok (C1).** Ia membaca KAPABILITAS
 *     yang aktif, dan yang tidak aktif **tidak dirender**. Tidak ada `<ProLock/>` di app anak.
 *     Alasannya bukan estetika: produk ini mengajari anak menahan impuls konsumtif, jadi memakai
 *     impuls anak untuk berjualan akan membunuh premisnya sendiri.
 */

export type Plan = 'free' | 'pro';

export interface PlanLimits {
  maxChildren: number;
  maxDreams: number;
  maxEnvelopes: number;
  maxAllowanceSchedules: number;
  maxActiveJobs: number;
  maxPrizes: number;
  /** Time Deposit / Gold / Forex. **BUKAN** Growth Reward — lihat catatan 1 di atas. */
  grow: boolean;
  customJobBuilder: boolean;
  customPrizeBuilder: boolean;
  autoSplitEditor: boolean;
  strictFlexibleDial: boolean;
  /** jumlah akun ortu PERSONAL (premium-setting §4) — dijual sebagai identitas, bukan akses */
  parentAccounts: number;
  web: boolean;
  /** Rapor Literasi Finansial */
  report: boolean;
  /** Pro = true = tidak melihat iklan brand */
  brandAdsFree: boolean;
}

export const LIMITS: Record<Plan, PlanLimits> = {
  free: {
    maxChildren: 1,
    maxDreams: 1,
    maxEnvelopes: 1,
    maxAllowanceSchedules: 1,
    maxActiveJobs: 3,
    maxPrizes: 1,
    grow: false,
    customJobBuilder: false,
    customPrizeBuilder: false,
    autoSplitEditor: false,
    strictFlexibleDial: false,
    parentAccounts: 1,
    web: false,
    report: false,
    brandAdsFree: false,
  },
  pro: {
    maxChildren: 4,
    maxDreams: Infinity,
    maxEnvelopes: Infinity,
    maxAllowanceSchedules: Infinity,
    maxActiveJobs: Infinity,
    maxPrizes: Infinity,
    grow: true,
    customJobBuilder: true,
    customPrizeBuilder: true,
    autoSplitEditor: true,
    strictFlexibleDial: true,
    parentAccounts: 2,
    web: true,
    report: true,
    brandAdsFree: true,
  },
};

export function limitsFor(plan: Plan): PlanLimits {
  return LIMITS[plan];
}

/**
 * Bolehkah menambah satu lagi?
 *
 * Membandingkan jumlah SEKARANG, jadi data yang sudah melebihi batas tetap utuh — ia cuma tidak
 * bisa ditambah. Itu perbedaan antara membatasi dan menyandera.
 */
export function canAdd(plan: Plan, key: keyof PlanLimits, current: number): boolean {
  const max = LIMITS[plan][key];
  if (typeof max !== 'number') return false;
  return current < max;
}

/**
 * Growth Reward — selalu aktif, apa pun plannya.
 *
 * Fungsi terpisah walau isinya konstanta, supaya pertanyaan "apakah ini kena gate Grow?" punya satu
 * jawaban yang bisa dibaca, bukan tersembunyi di percabangan pemanggil.
 */
export function growthRewardEnabled(): boolean {
  return true;
}

/** Harga yang ditampilkan (ADR-0018). Nominal SELALU lewat `formatRp()` sebelum masuk layar. */
export const ONE_TIME_PRICE_RP = 399_000;

/**
 * Bolehkah menampilkan tombol upgrade?
 *
 * I5: **tidak pernah** untuk pengguna sekolah. Sekolah diprovisikan sepenuhnya di luar app store
 * (ADR-0010), jadi tombol beli di sana bukan cuma tidak relevan — ia menyalahi jalur pengadaannya.
 */
export function canShowUpgrade(plan: Plan, source?: 'iap' | 'school' | 'grant'): boolean {
  if (source === 'school') return false;
  return plan === 'free';
}
