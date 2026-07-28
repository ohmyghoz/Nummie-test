import { describe, expect, it } from 'vitest';
import {
  SEED_REQUESTS,
  approve, decline, fulfilmentPath, isOpen, markDone, postsLedgerOn, promiseDebt, talkAboutIt,
} from '../src/index.js';
import type { MoneyRequest, RequestKind } from '../src/index.js';

const req = (over: Partial<MoneyRequest> = {}): MoneyRequest => ({
  id: 'r', childId: 'c', kind: 'cash_out', amount: 25_000,
  reason: 'alasan', status: 'needs_ok', fulfilment: 'todo', ...over,
});

describe('lima jalur approval (ADR-0002)', () => {
  it('Grow, Harvest, dan klaim mission = instan', () => {
    for (const k of ['grow_in', 'harvest', 'mission_claim'] as RequestKind[]) {
      expect(fulfilmentPath(k)).toBe('instant');
    }
  });

  it('prize, Give, dan cash out = to do (ada aksi dunia nyata)', () => {
    for (const k of ['prize', 'give_away', 'cash_out'] as RequestKind[]) {
      expect(fulfilmentPath(k)).toBe('todo');
    }
  });

  it('approve pada jalur instan TIDAK PERNAH menghasilkan todo', () => {
    const r = approve(req({ kind: 'harvest' })).request!;
    expect(r.status).toBe('approved');
    expect(r.fulfilment).toBe('not_applicable');
  });

  it('approve pada jalur to-do menyisakan pekerjaan — approve != fulfil', () => {
    const r = approve(req({ kind: 'cash_out' })).request!;
    expect(r.status).toBe('approved');
    expect(r.fulfilment).toBe('todo');
  });

  it('cash out baru menggerakkan ledger saat Done, bukan saat approve', () => {
    expect(postsLedgerOn('cash_out')).toBe('done');
    expect(postsLedgerOn('harvest')).toBe('approve');
  });
});

describe('jawaban ketiga & transisi ilegal', () => {
  it('"Talk about it" ada, dan request-nya tetap terbuka untuk diputuskan', () => {
    const r = talkAboutIt(req()).request!;
    expect(r.status).toBe('talk_about_it');
    expect(isOpen(r)).toBe(true);
    expect(approve(r).ok).toBe(true);
  });

  it('request yang sudah diputuskan tidak bisa diputuskan ulang', () => {
    const approved = approve(req()).request!;
    expect(approve(approved).errorKey).toBe('request.notOpen');
    expect(decline(approved).errorKey).toBe('request.notOpen');
  });

  it('tidak bisa lompat needs_ok -> done tanpa approve', () => {
    expect(markDone(req()).errorKey).toBe('request.notApproved');
  });

  it('ditolak = tidak ada yang perlu dikerjakan', () => {
    expect(decline(req()).request!.fulfilment).toBe('not_applicable');
  });
});

describe('Give tidak bisa ditutup tanpa cerita (ADR-0006)', () => {
  const approvedGive = () => approve(req({ kind: 'give_away', reason: undefined })).request!;

  it('menolak tutup tanpa cerita', () => {
    expect(markDone(approvedGive()).errorKey).toBe('request.giveNeedsStory');
  });

  it('cerita berisi spasi saja tetap ditolak', () => {
    expect(markDone(approvedGive(), '   ').errorKey).toBe('request.giveNeedsStory');
  });

  it('dengan cerita, lingkaran tertutup', () => {
    const done = markDone(approvedGive(), 'Dibelikan susu untuk panti  ').request!;
    expect(done.fulfilment).toBe('done');
    expect(done.fulfilmentStory).toBe('Dibelikan susu untuk panti');
  });

  it('cash out boleh ditutup tanpa cerita — jangan pajaki yang bukan Give', () => {
    expect(markDone(approve(req()).request!).ok).toBe(true);
  });
});

describe('utang janji lahir dari jalur to-do', () => {
  it('approve cash out langsung menciptakan utang janji', () => {
    const approved = approve(SEED_REQUESTS[0]!).request!;
    expect(promiseDebt([approved])).toHaveLength(1);
  });

  it('menandai Done melunasinya', () => {
    const done = markDone(approve(SEED_REQUESTS[0]!).request!).request!;
    expect(promiseDebt([done])).toHaveLength(0);
  });

  it('jalur instan tidak pernah menciptakan utang janji', () => {
    const approved = approve(req({ kind: 'grow_in' })).request!;
    expect(promiseDebt([approved])).toHaveLength(0);
  });
});
