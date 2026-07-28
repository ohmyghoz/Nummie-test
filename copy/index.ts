import { id } from './id.js';
import { en } from './en.js';
import type { Dictionary } from './types.js';
import type { Tier, Pocket } from '../packages/core/src/types.js';

export type Lang = 'id' | 'en';

/**
 * Bahasa produk = Inggris (ADR-0016, menutup D1).
 *
 * `id` sengaja tetap dipelihara: `Dictionary` mewajibkan kedua bahasa memenuhi bentuk yang sama,
 * jadi sisi Indonesia dijaga tipe dan tidak membusuk. Itu yang membuat keputusan ini tetap murah
 * dibalik kalau D5 memasukkan Little (KG B–Grade 2) ke cakupan.
 */
export const DEFAULT_LANG: Lang = 'en';

export const dictionaries: Record<Lang, Dictionary> = { id, en };

export function t(lang: Lang): Dictionary {
  return dictionaries[lang];
}

/** Satu-satunya cara menampilkan nama kategori. Jangan pernah menulisnya sebagai teks mati. */
export function categoryLabel(lang: Lang, tier: Tier, category: Pocket): string {
  return dictionaries[lang].category[tier][category];
}

export type { Dictionary };
