/**
 * Sesi console — cookie bertanda tangan HMAC, tanpa state di server.
 *
 * Kenapa bukan basic auth (bentuk pertama berkas ini, 30 Juli 2026 pagi): basic auth mengirim
 * password di SETIAP permintaan, dan satu-satunya tempat memeriksanya adalah middleware — yang
 * berjalan di Edge. Menambahkan rate limiting di sana berarti satu round-trip ke database untuk
 * setiap gambar, setiap aset, setiap navigasi. Dengan cookie, password diperiksa **sekali** di
 * route handler Node (tempat rate limiting murah), dan middleware cuma memverifikasi tanda tangan.
 *
 * Bentuk ini juga sama dengan app anak & ortu — cookie httpOnly yang dipasang route handler.
 * Satu pola untuk tiga permukaan lebih murah dirawat daripada tiga pola.
 *
 * Web Crypto dipakai (bukan `node:crypto`) supaya berkas ini jalan di Edge maupun Node tanpa
 * dua versi. `crypto.subtle.verify` sekaligus memberi perbandingan waktu-tetap secara gratis.
 */
const enc = new TextEncoder();

export const SESSION_COOKIE = 'nummi_console';
/** Sesi operator, bukan sesi produk. Cukup panjang untuk satu hari kerja, tidak lebih. */
export const SESSION_SECONDS = 12 * 60 * 60;

/**
 * Kunci HMAC diturunkan dari `CONSOLE_PASSWORD` — sengaja, bukan karena malas menambah env.
 * Konsekuensinya justru diinginkan: **mengganti password langsung membatalkan semua sesi.**
 * Kalau kuncinya terpisah, password bisa diganti sementara cookie lama tetap sah, dan "sudah
 * saya ganti passwordnya" jadi kalimat yang tidak benar.
 */
function secret(): string | undefined {
  return process.env.CONSOLE_PASSWORD;
}

function b64url(buf: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(buf)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/**
 * Mengembalikan **view `Uint8Array` di atas `ArrayBuffer` eksplisit**, dan kedua bagian kalimat itu
 * ada karena alasan yang berbeda:
 *
 *  - **`Uint8Array`, bukan `ArrayBuffer`** — versi pertama mengembalikan `out.buffer`, dan
 *    `crypto.subtle.verify` di **Edge runtime** menolaknya secara diam-diam: tidak melempar galat,
 *    hanya mengembalikan `false`. Efeknya persis seperti "semua cookie tidak sah", jadi gerbangnya
 *    tampak bekerja sempurna — menolak penyusup DAN operatornya sendiri. Hanya ketahuan karena
 *    ada uji "cookie sah harus 200"; tanpa uji kontrol itu, ia lolos sebagai keamanan yang ketat.
 *  - **`ArrayBuffer` eksplisit sebagai dasarnya** — `new Uint8Array(n)` bertipe
 *    `Uint8Array<ArrayBufferLike>` sejak TypeScript 5.7, dan itu tidak memenuhi `BufferSource`.
 *    Membangunnya di atas buffer yang sudah pasti `ArrayBuffer` memuaskan tipe tanpa `as`.
 */
function fromB64url(s: string): Uint8Array<ArrayBuffer> {
  const b64 = s.replace(/-/g, '+').replace(/_/g, '/');
  const bin = atob(b64 + '='.repeat((4 - (b64.length % 4)) % 4));
  const out = new Uint8Array(new ArrayBuffer(bin.length));
  for (let i = 0; i < bin.length; i += 1) out[i] = bin.charCodeAt(i);
  return out;
}

async function hmacKey(k: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw', enc.encode(k), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify'],
  );
}

/** `<expEpochDetik>.<tandaTangan>` — tidak ada isi lain, karena tidak ada yang perlu dibawa. */
export async function signSession(nowMs: number): Promise<string | null> {
  const k = secret();
  if (!k) return null;
  const exp = String(Math.floor(nowMs / 1000) + SESSION_SECONDS);
  const sig = await crypto.subtle.sign('HMAC', await hmacKey(k), enc.encode(exp));
  return `${exp}.${b64url(sig)}`;
}

export async function verifySession(value: string | undefined, nowMs: number): Promise<boolean> {
  const k = secret();
  // Gagal-tertutup: tanpa CONSOLE_PASSWORD tidak ada cookie yang sah, bukan semua cookie sah.
  if (!k || !value) return false;

  const dot = value.lastIndexOf('.');
  if (dot <= 0) return false;

  const exp = value.slice(0, dot);
  const sig = value.slice(dot + 1);

  const expSeconds = Number(exp);
  if (!Number.isFinite(expSeconds) || expSeconds * 1000 <= nowMs) return false;

  try {
    return await crypto.subtle.verify('HMAC', await hmacKey(k), fromB64url(sig), enc.encode(exp));
  } catch {
    return false;
  }
}

/** Hop PERTAMA `x-forwarded-for`, tidak pernah rantai utuh — lihat ADR-0012 §A3. */
export function clientIp(headers: Headers): string {
  const first = (headers.get('x-forwarded-for') ?? '').split(',')[0]?.trim();
  return first || 'unknown';
}
