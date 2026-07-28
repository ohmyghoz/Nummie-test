/**
 * Jobs builder & Prizes (Fase 4) — builder TERPANDU, bukan kotak kosong.
 *
 * Aturan paling penting di berkas ini, dan alasannya bukan estetika:
 * **kontribusi keluarga hanya boleh dibayar 💎, opsi uang TIDAK BOLEH MUNCUL.**
 * Riset motivasi yang mendasari produk ini menemukan bahwa membayar tugas dasar keluarga
 * dengan uang merusak motivasi intrinsik — anak berhenti membereskan kamar "karena itu
 * rumahnya juga" dan mulai menawar harga. Menyembunyikan opsinya, bukan sekadar
 * menyarankan, adalah bedanya antara app yang berpendapat dan app yang menonton.
 */
export type JobKind = 'family_contribution' | 'extra_work' | 'achievement';

export type RewardKind = 'gems' | 'money';

export interface JobDraft {
  kind: JobKind;
  title: string;
  reward: RewardKind;
  /** 💎 kalau reward gems, rupiah kalau money */
  amount: number;
}

export type JobErrorKey =
  | 'job.titleRequired'
  | 'job.amountRequired'
  | 'job.moneyNotAllowedForFamily';

/**
 * Pilihan reward yang boleh DITAMPILKAN untuk tiap jenis pekerjaan.
 * Kontribusi keluarga mengembalikan `['gems']` saja — layar tidak pernah merender uang.
 */
export function allowedRewards(kind: JobKind): RewardKind[] {
  if (kind === 'family_contribution') return ['gems'];
  return ['gems', 'money'];
}

/** Default yang disarankan builder. Pencapaian boleh uang, tapi bukan defaultnya (nudge, bukan larangan). */
export function defaultReward(kind: JobKind): RewardKind {
  return 'gems';
}

export function validateJob(draft: JobDraft): { ok: boolean; errorKey?: JobErrorKey } {
  if (!draft.title.trim()) return { ok: false, errorKey: 'job.titleRequired' };
  if (draft.amount <= 0) return { ok: false, errorKey: 'job.amountRequired' };
  // Sabuk pengaman kedua: walau UI-nya tidak pernah menampilkan opsi uang, data tetap ditolak.
  if (!allowedRewards(draft.kind).includes(draft.reward)) {
    return { ok: false, errorKey: 'job.moneyNotAllowedForFamily' };
  }
  return { ok: true };
}

export interface PrizeDraft {
  title: string;
  gemCost: number;
}

export type PrizeErrorKey = 'prize.titleRequired' | 'prize.costRequired';

export function validatePrize(draft: PrizeDraft): { ok: boolean; errorKey?: PrizeErrorKey } {
  if (!draft.title.trim()) return { ok: false, errorKey: 'prize.titleRequired' };
  if (draft.gemCost <= 0) return { ok: false, errorKey: 'prize.costRequired' };
  return { ok: true };
}

/**
 * "Berapa lama untuk dapat" — pratinjau yang membuat ortu berhenti memasang hadiah mustahil.
 * Mengembalikan jumlah minggu (dibulatkan ke atas); `null` kalau memang tidak akan pernah tercapai.
 */
export function weeksToEarn(gemCost: number, gemsPerWeek: number): number | null {
  if (gemCost <= 0) return 0;
  if (gemsPerWeek <= 0) return null;
  return Math.ceil(gemCost / gemsPerWeek);
}
