/**
 * Give punya flow sendiri (ADR-0006) — bukan varian Cash out.
 *
 * Dua konsekuensi yang gampang hilang kalau Give diperlakukan sebagai cash out biasa:
 *  1. **Alasan OPSIONAL.** Cash out mewajibkan alasan; Give tidak. Jangan pajaki kemurahan hati.
 *  2. **Cerita WAJIB saat menutup.** Lingkarannya baru tertutup ketika ortu bercerita ke mana
 *     uangnya pergi (ditegakkan `markDone` di `requests.ts`). Tanpa cerita, Give tak beda dari
 *     uang yang hilang.
 */
import type { MoneyRequest, Wallet } from './types.js';

/**
 * Kunci sebab, BUKAN kalimat jadi — labelnya hidup di `copy/`, karena teks UI tidak boleh
 * hidup di core. `own` = anak menuliskan sendiri.
 */
export const GIVE_CAUSES = [
  'worship', 'orphanage', 'disaster', 'friend', 'animals', 'school', 'own',
] as const;

export type GiveCause = (typeof GIVE_CAUSES)[number];

export interface GiveDraft {
  amount: number;
  sourceWalletId: string;
  cause: GiveCause;
  /** teks bebas anak — Indonesia apa adanya, tidak terpengaruh D1 */
  note?: string;
}

export type GiveErrorKey =
  | 'give.amountRequired'
  | 'give.notEnough'
  | 'give.ownCauseNeedsNote';

export interface GiveValidation {
  ok: boolean;
  errorKey?: GiveErrorKey;
}

export function validateGive(draft: GiveDraft, giveBalance: number): GiveValidation {
  if (draft.amount <= 0) return { ok: false, errorKey: 'give.amountRequired' };
  if (draft.amount > giveBalance) return { ok: false, errorKey: 'give.notEnough' };
  // Satu-satunya kasus di mana teks anak wajib: ia memilih menulis sebabnya sendiri.
  if (draft.cause === 'own' && !draft.note?.trim()) {
    return { ok: false, errorKey: 'give.ownCauseNeedsNote' };
  }
  return { ok: true };
}

/**
 * Draft → request. Selalu lahir `needs_ok` + `todo`: anak mengajukan, tidak pernah memutuskan,
 * dan menyetujui belum berarti uangnya sudah disalurkan (ADR-0002).
 */
export function toGiveRequest(draft: GiveDraft, childId: string, id: string): MoneyRequest {
  return {
    id,
    childId,
    kind: 'give_away',
    amount: draft.amount,
    sourceWalletId: draft.sourceWalletId,
    // opsional — sengaja tidak diwajibkan
    reason: draft.note?.trim() || undefined,
    status: 'needs_ok',
    fulfilment: 'todo',
  };
}

/** Wallet yang boleh jadi sumber Give: hanya kantong Give. */
export function giveSources(wallets: Wallet[]): Wallet[] {
  return wallets.filter((w) => w.category === 'give');
}

/** Sudah ditutup lingkarannya = ortu sudah bercerita. Isi "Where my giving went". */
export function closedGiving(requests: MoneyRequest[]): MoneyRequest[] {
  return requests.filter(
    (r) => r.kind === 'give_away' && r.fulfilment === 'done' && !!r.fulfilmentStory,
  );
}
