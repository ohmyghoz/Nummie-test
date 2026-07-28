/**
 * Lima jalur approval (ADR-0002) — "approve ≠ fulfil".
 *
 * Persetujuan ortu dan pelaksanaan di dunia nyata adalah DUA hal, dan itu hidup sebagai
 * DUA kolom: `status` dan `fulfilment`. Menggabungkannya jadi satu enum adalah kesalahan yang
 * sangat wajar — dan membunuh keputusan ini diam-diam. `nummi-status.md` mencatatnya sebagai K14.
 *
 * Skema Supabase sudah memisahkannya dengan benar, tapi sampai berkas ini ada, aturan lima
 * jalurnya hanya hidup di dokumen. Sekarang ia hidup sebagai kode yang dijaga test.
 */
import type { Fulfilment, MoneyRequest, RequestKind } from './types.js';

export type FulfilmentPath = 'instant' | 'todo';

/**
 * Jalur instan = tidak ada aksi dunia nyata yang tersisa setelah ortu menekan approve.
 * Grow & Harvest instan karena ortu ADALAH bank-nya (ADR-0003) — tak ada aset yang benar-benar
 * dibeli. Klaim mission instan karena reward-nya cuma angka di ledger.
 */
const INSTANT_KINDS: readonly RequestKind[] = ['grow_in', 'harvest', 'mission_claim'];

export function fulfilmentPath(kind: RequestKind): FulfilmentPath {
  return INSTANT_KINDS.includes(kind) ? 'instant' : 'todo';
}

/**
 * Kapan baris ledger boleh ditulis.
 * Cash out (dan jalur to-do lain) baru menggerakkan saldo saat **Done**, bukan saat approve —
 * kalau tidak, uang anak berkurang padahal ortu belum benar-benar menyerahkannya (ADR-0002).
 */
export function postsLedgerOn(kind: RequestKind): 'approve' | 'done' {
  return fulfilmentPath(kind) === 'instant' ? 'approve' : 'done';
}

export type RequestErrorKey =
  | 'request.notOpen'
  | 'request.notApproved'
  | 'request.nothingToFulfil'
  | 'request.giveNeedsStory';

export interface RequestTransition {
  ok: boolean;
  request?: MoneyRequest;
  /** kunci copy, bukan kalimat jadi — string UI tidak boleh hidup di core */
  errorKey?: RequestErrorKey;
}

/**
 * Masih menunggu keputusan ortu. "Talk about it" termasuk terbuka: ia jawaban KETIGA yang
 * sengaja ada supaya menolak-tanpa-penjelasan bukan satu-satunya jalan (ADR-0002) — setelah
 * dibicarakan, ortu tetap harus memutuskan.
 */
export function isOpen(req: MoneyRequest): boolean {
  return req.status === 'needs_ok' || req.status === 'talk_about_it';
}

export function approve(req: MoneyRequest, decidedByParentId?: string): RequestTransition {
  if (!isOpen(req)) return { ok: false, errorKey: 'request.notOpen' };

  // INI baris yang menjaga ADR-0002 hidup: approve menetapkan fulfilment sesuai jalur,
  // bukan menganggap approve = selesai.
  const fulfilment: Fulfilment = fulfilmentPath(req.kind) === 'instant' ? 'not_applicable' : 'todo';

  return { ok: true, request: { ...req, status: 'approved', fulfilment, decidedByParentId } };
}

export function decline(req: MoneyRequest, decidedByParentId?: string): RequestTransition {
  if (!isOpen(req)) return { ok: false, errorKey: 'request.notOpen' };
  // Ditolak = tidak ada apa pun yang harus dikerjakan di dunia nyata.
  return {
    ok: true,
    request: { ...req, status: 'declined', fulfilment: 'not_applicable', decidedByParentId },
  };
}

export function talkAboutIt(req: MoneyRequest, decidedByParentId?: string): RequestTransition {
  if (!isOpen(req)) return { ok: false, errorKey: 'request.notOpen' };
  return {
    ok: true,
    request: { ...req, status: 'talk_about_it', fulfilment: 'not_applicable', decidedByParentId },
  };
}

/**
 * Menutup lingkaran: ortu menandai bahwa ia benar-benar melakukannya.
 *
 * Give TIDAK punya "Mark as done" polos — yang ada form cerita WAJIB (ADR-0006).
 * Tanpa cerita, Give tak beda dari uang yang hilang.
 */
export function markDone(req: MoneyRequest, story?: string): RequestTransition {
  if (req.status !== 'approved') return { ok: false, errorKey: 'request.notApproved' };
  if (req.fulfilment !== 'todo') return { ok: false, errorKey: 'request.nothingToFulfil' };

  const trimmed = story?.trim();
  if (req.kind === 'give_away' && !trimmed) {
    return { ok: false, errorKey: 'request.giveNeedsStory' };
  }

  return {
    ok: true,
    request: { ...req, fulfilment: 'done', fulfilmentStory: trimmed ?? req.fulfilmentStory },
  };
}
