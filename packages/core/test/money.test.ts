import { describe, expect, it } from 'vitest';
import { formatGoldWeight, formatRp, formatRpInput, parseRp } from '../src/index.js';

describe('format rupiah (brand §17)', () => {
  it('memakai titik, tanpa spasi', () => {
    expect(formatRp(50_000)).toBe('Rp50.000');
    expect(formatRp(1_250_000)).toBe('Rp1.250.000');
    expect(formatRp(484_711)).toBe('Rp484.711');
    expect(formatRp(0)).toBe('Rp0');
  });

  it('tidak pernah memakai format yang dilarang', () => {
    const output = formatRp(50_000);
    expect(output).not.toContain(',');
    expect(output).not.toContain('Rp ');
    expect(output).not.toContain('IDR');
  });
});

describe('input nominal', () => {
  it('membubuhkan pemisah ribuan saat mengetik', () => {
    expect(formatRpInput('50000')).toBe('50.000');
    expect(formatRpInput('')).toBe('');
  });

  it('parsing membuang semua non-digit', () => {
    expect(parseRp('Rp50.000')).toBe(50_000);
    expect(parseRp('50,000')).toBe(50_000);
  });
});

describe('berat emas skala anak (ADR-0003)', () => {
  it('mg kalau di bawah 1 gram', () => {
    expect(formatGoldWeight(0.0145)).toBe('14,5 mg');
  });
  it('gram kalau 1 gram ke atas', () => {
    expect(formatGoldWeight(1.5)).toBe('1,50 g');
  });
});
