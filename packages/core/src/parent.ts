/**
 * Sisi ortu: Send money & Take money (Fase 2).
 *
 * Dua keputusan yang mudah "disederhanakan" jadi salah:
 *
 *  1. **Send money SELALU mendarat di Unsorted**, tidak pernah langsung ke kategori.
 *     Kalau ortu bisa menaruh uang langsung ke Spend, anak kehilangan momen menyortir —
 *     dan menyortir adalah pelajarannya, bukan langkah administratif.
 *
 *  2. **Take money menampilkan kantong terlindungi, digembok, dengan sebab spesifik.**
 *     Menyembunyikannya membuat ortu bingung ("ke mana Give-nya?"); menampilkannya-digembok
 *     mengajari ortu aturannya (ADR-0007). Jadi `takeTargets` mengembalikan SEMUA wallet.
 */
import type { Wallet } from './types.js';
import { canParentTakeFrom } from './rules.js';

/** Asal uang wajib ditandai — anak melihat label ini, jadi "uang dari mana" tidak pernah kabur. */
export const SEND_SOURCES = [
  'allowance', 'thr', 'birthday', 'prize', 'from_family', 'other',
] as const;

export type SendSource = (typeof SEND_SOURCES)[number];

export interface SendDraft {
  amount: number;
  source: SendSource;
  note?: string;
}

export type SendErrorKey = 'send.amountRequired' | 'send.sourceRequired';

export function validateSend(draft: SendDraft): { ok: boolean; errorKey?: SendErrorKey } {
  if (draft.amount <= 0) return { ok: false, errorKey: 'send.amountRequired' };
  if (!SEND_SOURCES.includes(draft.source)) return { ok: false, errorKey: 'send.sourceRequired' };
  return { ok: true };
}

/** Tujuan Send money — selalu Unsorted, tidak pernah bisa dipilih. */
export function sendLandsIn(wallets: Wallet[]): Wallet | undefined {
  return wallets.find((w) => w.category === 'unsorted');
}

export type TakeLockReason =
  | 'take.dreamProtected'
  | 'take.giveProtected'
  | 'take.growProtected';

export interface TakeTarget {
  wallet: Wallet;
  locked: boolean;
  /** kunci copy yang menjelaskan KENAPA, bukan gembok bisu */
  reasonKey?: TakeLockReason;
}

function lockReason(wallet: Wallet): TakeLockReason | undefined {
  if (wallet.category === 'grow') return 'take.growProtected';
  if (wallet.category === 'give') return 'take.giveProtected';
  if (wallet.kind === 'dream') return 'take.dreamProtected';
  return undefined;
}

/**
 * SEMUA wallet dikembalikan — yang terlindungi ikut, dengan `locked: true` dan sebabnya.
 * Unsorted tidak termasuk: ia bukan kantong, ia ruang tunggu.
 */
export function takeTargets(wallets: Wallet[]): TakeTarget[] {
  return wallets
    .filter((w) => w.category !== 'unsorted')
    .map((wallet) => {
      const locked = !canParentTakeFrom(wallet);
      return locked ? { wallet, locked, reasonKey: lockReason(wallet) } : { wallet, locked };
    });
}

export type TakeErrorKey =
  | 'take.amountRequired'
  | 'take.notEnough'
  | 'take.protected'
  | 'take.reasonRequired';

/**
 * Alasan WAJIB, simetris dengan anak: anak harus menjelaskan saat mau mengeluarkan uang,
 * jadi ortu pun harus menjelaskan saat menariknya. Aturan yang berlaku satu arah saja
 * mengajari anak bahwa aturan itu soal kekuasaan, bukan soal alasan.
 */
export function validateTake(
  wallet: Wallet,
  amount: number,
  balance: number,
  reason: string | undefined,
): { ok: boolean; errorKey?: TakeErrorKey } {
  if (!canParentTakeFrom(wallet)) return { ok: false, errorKey: 'take.protected' };
  if (amount <= 0) return { ok: false, errorKey: 'take.amountRequired' };
  if (amount > balance) return { ok: false, errorKey: 'take.notEnough' };
  if (!reason?.trim()) return { ok: false, errorKey: 'take.reasonRequired' };
  return { ok: true };
}
