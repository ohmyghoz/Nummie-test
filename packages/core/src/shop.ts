/**
 * Toko avatar & tema — belanja ⭐ (ADR-0004).
 *
 * ⭐ dari kurikulum hanya boleh jadi **kosmetik**. Tidak ada satu pun barang di sini yang
 * memberi keuntungan uang, membuka fitur, atau mempercepat apa pun: usaha di app → identitas
 * di app. Begitu ⭐ bisa dibelanjakan jadi keuntungan nyata, ia berhenti jadi alat belajar.
 */
import type { Economy } from './economy.js';
import { spendStars, type EconomyResult } from './economy.js';

export interface ShopItem {
  /** kunci, bukan label — teks UI hidup di `copy/` */
  key: string;
  costStars: number;
}

export const AVATAR_ITEMS: ShopItem[] = [
  { key: 'fox', costStars: 0 },
  { key: 'deer', costStars: 40 },
  { key: 'cat', costStars: 60 },
  { key: 'owl', costStars: 80 },
  { key: 'dragon', costStars: 120 },
];

/**
 * Lima tema. Yang berubah HANYA warna brand/aksen.
 * **Warna kategori tidak pernah ikut berubah** — ia alat belajar yang dikunci, dan anak yang
 * mengganti tema tidak boleh jadi harus belajar ulang arti warnanya.
 */
export const THEMES = ['violet', 'sun', 'coral', 'sky', 'mint'] as const;
export type Theme = (typeof THEMES)[number];

export function ownsItem(item: ShopItem, unlocked: string[]): boolean {
  return item.costStars === 0 || unlocked.includes(item.key);
}

export function canAfford(economy: Economy, item: ShopItem): boolean {
  return economy.starsBalance >= item.costStars;
}

/**
 * Membeli avatar hanya memotong SALDO ⭐. Lifetime tidak ikut turun, sehingga gerbang chores
 * tidak pernah terkunci ulang gara-gara anak memakai hadiahnya (ADR-0004).
 */
export function buyAvatar(economy: Economy, item: ShopItem): EconomyResult {
  return spendStars(economy, item.costStars);
}
