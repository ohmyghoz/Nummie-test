import { describe, expect, it } from 'vitest';
import {
  SEED_WALLETS,
  approve, canCashOutFrom, closedGiving, giveSources, markDone, toGiveRequest, validateGive,
} from '../src/index.js';
import type { GiveDraft } from '../src/index.js';

const wallet = (id: string) => SEED_WALLETS.find((w) => w.id === id)!;
const draft = (over: Partial<GiveDraft> = {}): GiveDraft => ({
  amount: 10_000, sourceWalletId: 'w_give', cause: 'orphanage', ...over,
});

describe('Give punya flow sendiri (ADR-0006)', () => {
  it('Give TIDAK boleh jadi sumber cash out biasa — kalau boleh, cerita wajib bisa dilewati', () => {
    expect(canCashOutFrom(wallet('w_give'))).toBe(false);
  });

  it('Grow & Unsorted juga bukan sumber cash out; Spend/dream/free savings boleh', () => {
    expect(canCashOutFrom(wallet('w_gold'))).toBe(false);
    expect(canCashOutFrom(wallet('w_unsorted'))).toBe(false);
    expect(canCashOutFrom(wallet('w_snacks'))).toBe(true);
    expect(canCashOutFrom(wallet('w_bmx'))).toBe(true);
    expect(canCashOutFrom(wallet('w_free'))).toBe(true);
  });

  it('sumber Give hanya kantong Give', () => {
    expect(giveSources(SEED_WALLETS).map((w) => w.id)).toEqual(['w_give']);
  });
});

describe('alasan opsional — jangan pajaki kemurahan hati', () => {
  it('sah tanpa catatan sama sekali', () => {
    expect(validateGive(draft(), 40_000)).toEqual({ ok: true });
  });

  it('request lahir tanpa reason, dan itu benar', () => {
    expect(toGiveRequest(draft(), 'c', 'r1').reason).toBeUndefined();
  });

  it('kecuali anak memilih menulis sebabnya sendiri', () => {
    expect(validateGive(draft({ cause: 'own' }), 40_000).errorKey).toBe('give.ownCauseNeedsNote');
    expect(validateGive(draft({ cause: 'own', note: 'Buat kucing di sekolah' }), 40_000).ok).toBe(true);
  });
});

describe('batas jumlah', () => {
  it('menolak nol dan melebihi saldo Give', () => {
    expect(validateGive(draft({ amount: 0 }), 40_000).errorKey).toBe('give.amountRequired');
    expect(validateGive(draft({ amount: 40_001 }), 40_000).errorKey).toBe('give.notEnough');
  });
});

describe('lingkaran baru tertutup lewat cerita', () => {
  const submitted = () => toGiveRequest(draft(), 'c', 'r1');

  it('lahir needs_ok + todo — anak mengajukan, tidak memutuskan', () => {
    const r = submitted();
    expect(r.status).toBe('needs_ok');
    expect(r.fulfilment).toBe('todo');
  });

  it('disetujui saja belum menutup apa pun', () => {
    const approved = approve(submitted()).request!;
    expect(approved.fulfilment).toBe('todo');
    expect(closedGiving([approved])).toHaveLength(0);
  });

  it('tanpa cerita tidak bisa ditutup', () => {
    expect(markDone(approve(submitted()).request!).errorKey).toBe('request.giveNeedsStory');
  });

  it('dengan cerita, masuk "Where my giving went"', () => {
    const done = markDone(approve(submitted()).request!, 'Dibelikan beras untuk panti').request!;
    expect(closedGiving([done])).toHaveLength(1);
  });
});
