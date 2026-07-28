/**
 * Satu-satunya cara menampilkan nominal di seluruh Nummi.
 * Format terkunci di brand system §17: `Rp50.000` — tanpa spasi, titik sebagai pemisah ribuan.
 * JANGAN pernah `Rp 50,000`, `IDR 50K`, atau `50 ribu rupiah`.
 */
export function formatRp(amount: number): string {
  const negative = amount < 0;
  const digits = Math.round(Math.abs(amount)).toString();
  const grouped = digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${negative ? '-' : ''}Rp${grouped}`;
}

/**
 * Pemisah ribuan hidup untuk input nominal (mis. saat mengetik "50000" -> "50.000").
 * Parsing selalu membuang semua non-digit lebih dulu, jadi aman dari kesalahan baca.
 */
export function parseRp(input: string): number {
  const digits = input.replace(/\D/g, '');
  return digits === '' ? 0 : Number(digits);
}

export function formatRpInput(input: string): string {
  const value = parseRp(input);
  return value === 0 ? '' : value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

/**
 * Berat emas di skala uang anak. Rp21.000 ≈ 14,5 mg — bukan 1,05 g (ADR-0003).
 * Aturan: mg kalau <1 g, gram kalau >=1 g.
 */
export function formatGoldWeight(grams: number): string {
  if (grams < 1) {
    const mg = grams * 1000;
    return `${mg.toFixed(1).replace('.', ',')} mg`;
  }
  return `${grams.toFixed(2).replace('.', ',')} g`;
}
