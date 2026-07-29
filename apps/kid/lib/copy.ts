/**
 * Jembatan ke kamus `copy/`. SATU-SATUNYA cara komponen mendapat teks.
 *
 * Tidak boleh ada string UI yang di-hardcode di komponen (CLAUDE.md), dan nama kategori
 * tidak pernah ditulis mati — selalu lewat lookup `[tier][kategori]`. D2 sudah dijawab
 * (sama lintas tier, ADR-0017), tapi bentuk lookup-nya tetap: itu yang menjaga keputusan
 * itu murah dibalik.
 */
import { DEFAULT_LANG, categoryLabel as lookupCategory, t } from '@copy';
import type { Pocket, Tier } from '@nummi/core';

export const lang = DEFAULT_LANG;
export const dict = t(lang);

/** Isi placeholder `{nama}`. Nominal harus SUDAH lewat formatRp sebelum masuk sini. */
export function fill(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (whole, key: string) =>
    key in vars ? String(vars[key]) : whole,
  );
}

export function categoryLabel(tier: Tier, category: Pocket): string {
  return lookupCategory(lang, tier, category);
}
