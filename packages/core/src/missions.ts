/**
 * Kurikulum — 6 chapter, pasangan Learn → Practice (Fase 4).
 *
 * Gerbangnya bukan hiasan: tanpa kurikulum yang mengunci, ekonomi 💎 akan mengalahkan
 * pelajaran finansialnya dan anak mengejar screen time. Gerbang membalik arahnya —
 * belajar jadi kunci, bukan tugas tambahan (ADR-0004).
 */
import type { Tier } from './types.js';

export const CHAPTER_COUNT = 6;

/** Kunci chapter, bukan judul — teks UI hidup di `copy/`. */
export const CHAPTERS = [
  'money_is_choice', 'four_jobs', 'wants_vs_needs',
  'saving_takes_time', 'giving', 'growing',
] as const;

export type ChapterKey = (typeof CHAPTERS)[number];

export interface LessonMix {
  learn: number;
  practice: number;
}

/**
 * Jumlah pelajaran per chapter menurut tier (Fase 4).
 * Little paling ringan karena belum membaca lancar; Teen dapat practice terbanyak karena
 * porsi belajarnya memang lebih banyak berlatih daripada mendengarkan.
 */
export function lessonMix(tier: Tier): LessonMix {
  if (tier === 'little') return { learn: 2, practice: 1 };
  if (tier === 'teen') return { learn: 3, practice: 3 };
  return { learn: 3, practice: 2 };
}

export function lessonsPerChapter(tier: Tier): number {
  const mix = lessonMix(tier);
  return mix.learn + mix.practice;
}

/**
 * ⭐ per pelajaran.
 *
 * ⚠️ ANGKA SEMENTARA — belum pernah dikunci di dokumen mana pun.
 * Dipilih supaya konsisten dengan dua hal yang MEMANG terkunci: gerbang chores di
 * ⭐lifetime 100 (ADR-0004), dan seed Arthur (chapter 1 selesai, lifetime 120). Untuk tier
 * Middle, satu chapter = 5 pelajaran; 5 × 20 = 100, jadi menyelesaikan chapter 1 tepat
 * membuka sistem chores. Itu bacaan yang koheren, bukan angka yang dikunci — konfirmasikan
 * sebelum dipakai ke pengguna sungguhan.
 */
export const STARS_PER_LESSON = 20;

export type ChapterStatus = 'done' | 'current' | 'locked';

export function chapterStatus(chapterIndex: number, chaptersDone: number): ChapterStatus {
  if (chapterIndex < chaptersDone) return 'done';
  if (chapterIndex === chaptersDone) return 'current';
  return 'locked';
}

/**
 * Practice terkunci sampai Learn pasangannya selesai — itu inti pola Learn→Practice.
 * Membalik urutannya membuat practice jadi tebak-tebakan, bukan latihan.
 */
export function practiceUnlocked(learnDone: number, mix: LessonMix): boolean {
  return learnDone >= mix.learn;
}

/** Total ⭐ yang bisa diperoleh sampai chapter tertentu selesai. */
export function starsFromChapters(chaptersDone: number, tier: Tier): number {
  return chaptersDone * lessonsPerChapter(tier) * STARS_PER_LESSON;
}
