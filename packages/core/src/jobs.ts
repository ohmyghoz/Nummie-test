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

/* ── Entitas yang tersimpan ───────────────────────────────────────────────────
 *
 * `JobDraft`/`PrizeDraft` di atas adalah apa yang ORTU ISI di form. Yang di bawah adalah apa yang
 * TERSIMPAN — dan bedanya bukan formalitas: yang tersimpan punya id (dipakai request untuk
 * menyebut job mana yang diklaim) dan frekuensi (yang draft-nya belum pernah punya, padahal
 * handoff §246 dan mockup lama sama-sama menyebutnya).
 */

export type JobFrequency = 'once' | 'weekly';

export interface Job {
  id: string;
  childId: string;
  kind: JobKind;
  title: string;
  reward: RewardKind;
  /** 💎 kalau reward gems, rupiah kalau money */
  amount: number;
  frequency: JobFrequency;
}

export interface Prize {
  id: string;
  childId: string;
  title: string;
  gemCost: number;
}

/**
 * 💎 per minggu yang benar-benar bisa didapat — dijumlahkan dari job MINGGUAN ber-reward 💎.
 *
 * Handoff §250 menuntut angka ini "hidup": menambah job mingguan harus mengubah estimasi
 * "berapa lama sampai bisa menukar hadiah". Sebelumnya ortu MENGETIK angka ini sendiri di form,
 * yang artinya estimasinya bisa optimistis tanpa dasar apa pun.
 *
 * Selama UI hanya menawarkan job sekali-jalan, fungsi ini mengembalikan 0 — dan itu jawaban yang
 * benar, bukan bug: tanpa job mingguan memang tidak ada 💎 yang datang tiap minggu.
 */
export function gemsPerWeek(jobs: Job[]): number {
  return jobs
    .filter((j) => j.frequency === 'weekly' && j.reward === 'gems')
    .reduce((sum, j) => sum + j.amount, 0);
}

/**
 * Job mana yang boleh dikerjakan anak sekarang.
 *
 * Gerbang 1 (⭐ lifetime ≥ 100) membuka SISTEM chores-nya; gerbang 2 (Chapter 2) membuka jenis
 * `achievement`. Keduanya dari ADR-0004, dan keduanya soal APA YANG TAMPIL — job yang terkunci
 * tidak dirender sebagai baris mati di app anak (I3).
 */
export function availableJobs(jobs: Job[], choresOpen: boolean, achievementOpen: boolean): Job[] {
  if (!choresOpen) return [];
  return jobs.filter((j) => j.kind !== 'achievement' || achievementOpen);
}
