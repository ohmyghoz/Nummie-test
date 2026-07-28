import { id } from './id.js';
import { en } from './en.js';
import type { Dictionary } from './types.js';
import type { Tier, Pocket } from '../packages/core/src/types.js';

export type Lang = 'id' | 'en';

/** D1 belum diputuskan. Sampai diputuskan, default mengikuti mockup yang ada. */
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
