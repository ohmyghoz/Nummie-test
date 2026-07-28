import { describe, expect, it } from 'vitest';
import {
  SEED_LEDGER, SEED_WALLETS,
  sendLandsIn, takeTargets, validateSend, validateTake, walletBalances,
} from '../src/index.js';

const wallet = (id: string) => SEED_WALLETS.find((w) => w.id === id)!;
const balances = walletBalances(SEED_LEDGER);
const targetFor = (id: string) => takeTargets(SEED_WALLETS).find((t) => t.wallet.id === id)!;

describe('Send money selalu mendarat di Unsorted', () => {
  it('tujuannya Unsorted, bukan kategori yang dipilih ortu', () => {
    expect(sendLandsIn(SEED_WALLETS)?.id).toBe('w_unsorted');
  });

  it('asal uang wajib ditandai', () => {
    expect(validateSend({ amount: 50_000, source: 'thr' })).toEqual({ ok: true });
    expect(validateSend({ amount: 0, source: 'thr' }).errorKey).toBe('send.amountRequired');
    // @ts-expect-error — tag di luar daftar memang harus ditolak
    expect(validateSend({ amount: 50_000, source: 'gaji' }).errorKey).toBe('send.sourceRequired');
  });
});

describe('I7 / ADR-0007 — kantong terlindungi TAMPIL tapi digembok', () => {
  it('dream, Give, dan Grow ikut ditampilkan — tidak disembunyikan', () => {
    const ids = takeTargets(SEED_WALLETS).map((t) => t.wallet.id);
    expect(ids).toContain('w_bmx');
    expect(ids).toContain('w_give');
    expect(ids).toContain('w_gold');
  });

  it('masing-masing digembok dengan sebab spesifik, bukan gembok bisu', () => {
    expect(targetFor('w_bmx')).toMatchObject({ locked: true, reasonKey: 'take.dreamProtected' });
    expect(targetFor('w_give')).toMatchObject({ locked: true, reasonKey: 'take.giveProtected' });
    expect(targetFor('w_gold')).toMatchObject({ locked: true, reasonKey: 'take.growProtected' });
  });

  it('kantong yang boleh tidak digembok', () => {
    expect(targetFor('w_snacks').locked).toBe(false);
    expect(targetFor('w_free').locked).toBe(false);
  });

  it('Unsorted bukan kantong — tidak muncul di daftar Take', () => {
    expect(takeTargets(SEED_WALLETS).map((t) => t.wallet.id)).not.toContain('w_unsorted');
  });

  it('menarik dari kantong terlindungi ditolak walau alasannya lengkap', () => {
    expect(validateTake(wallet('w_bmx'), 10_000, 150_000, 'butuh').errorKey).toBe('take.protected');
    expect(validateTake(wallet('w_give'), 10_000, 40_000, 'butuh').errorKey).toBe('take.protected');
  });
});

describe('alasan wajib — simetris dengan anak', () => {
  const snacks = () => wallet('w_snacks');
  const saldo = () => balances['w_snacks'] ?? 0;

  it('tanpa alasan ditolak', () => {
    expect(validateTake(snacks(), 10_000, saldo(), undefined).errorKey).toBe('take.reasonRequired');
    expect(validateTake(snacks(), 10_000, saldo(), '   ').errorKey).toBe('take.reasonRequired');
  });

  it('dengan alasan diterima', () => {
    expect(validateTake(snacks(), 10_000, saldo(), 'Dipakai bayar buku').ok).toBe(true);
  });

  it('batas jumlah tetap berlaku', () => {
    expect(validateTake(snacks(), 0, saldo(), 'x').errorKey).toBe('take.amountRequired');
    expect(validateTake(snacks(), 999_999, saldo(), 'x').errorKey).toBe('take.notEnough');
  });
});
