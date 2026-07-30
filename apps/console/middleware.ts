/**
 * Gerbang console — **gagal-tertutup.**
 *
 * ADR-0015 mengunci bahwa console tidak punya login karena ia dijalankan operator di lingkungan
 * yang dia kendalikan sendiri. Berkas ini tidak membatalkan itu; ia memasang jaring untuk saat
 * asumsi "lingkungan yang dikendalikan sendiri" ternyata tidak berlaku — laptop di WiFi kafe,
 * atau seseorang yang meng-import repo ini ke Vercel tanpa membaca ADR-nya.
 *
 * Kenapa jaringnya perlu ada, dengan angka: `apps/console` membaca **service role, lintas
 * keluarga, RLS dilewati**. Satu halaman berisi saldo setiap anak di setiap keluarga. Tanpa
 * gerbang, satu URL yang bocor = seluruh basis data uang anak.
 *
 * **Gagal-tertutup, bukan gagal-terbuka.** Tanpa `CONSOLE_PASSWORD`, console menolak semuanya —
 * bukan membuka semuanya. Pola ini sudah terbukti mahal kalau dibalik: rate limiting login anak
 * "menyala" berbulan-bulan tanpa pernah menghitung satu pun (ADR-0012 §A3), dan `isPro()` hidup
 * di dokumen tanpa pernah dipanggil (ADR-0018). Gerbang yang diam saat salah konfigurasi adalah
 * gerbang yang tidak ada.
 */
import { NextResponse, type NextRequest } from 'next/server';

/** Bandingan waktu-tetap. Panjang tetap bocor, dan itu diterima — yang dijaga isinya. */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function challenge(): NextResponse {
  return new NextResponse('Authentication required.', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Nummi Console", charset="UTF-8"',
      'Cache-Control': 'no-store',
    },
  });
}

export function middleware(req: NextRequest) {
  const expected = process.env.CONSOLE_PASSWORD;

  if (!expected) {
    // Sengaja 503 dan bukan 401: ini salah konfigurasi operator, bukan kredensial salah.
    // Membedakannya membuat penyebabnya kelihatan alih-alih terbaca "password saya salah".
    return new NextResponse(
      'Console terkunci: CONSOLE_PASSWORD belum diset. Lihat apps/console/README.md.',
      { status: 503, headers: { 'Cache-Control': 'no-store' } },
    );
  }

  const header = req.headers.get('authorization');
  if (!header?.startsWith('Basic ')) return challenge();

  let decoded: string;
  try {
    decoded = atob(header.slice('Basic '.length));
  } catch {
    return challenge();
  }

  // Username diabaikan — satu operator, dan menambah nama pengguna cuma menambah yang bisa lupa.
  const password = decoded.slice(decoded.indexOf(':') + 1);
  if (!safeEqual(password, expected)) return challenge();

  const res = NextResponse.next();
  // Console tidak boleh singgah di cache bersama mana pun (CDN Vercel termasuk).
  res.headers.set('Cache-Control', 'no-store, private');
  return res;
}

// Semuanya digerbang, termasuk aset. Basic auth dikirim ulang otomatis oleh browser, jadi tidak
// ada ongkos UX — dan tidak ada satu jalur pun yang perlu diingat untuk dikecualikan.
export const config = { matcher: '/(.*)' };
