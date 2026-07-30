/**
 * Gerbang console — **gagal-tertutup.**
 *
 * ADR-0021 mengamandemen ADR-0015: console boleh di-deploy, karena laptop dev berbeda dari
 * laptop & HP harian founder. Yang tidak berubah: ia membaca **service role, lintas keluarga,
 * RLS dilewati** — satu halamannya berisi saldo setiap anak di setiap keluarga.
 *
 * Middleware ini sengaja **tidak** memeriksa password. Ia hanya memverifikasi tanda tangan
 * cookie. Password diperiksa sekali di `app/api/login/route.ts`, tempat rate limiting bisa
 * memanggil database tanpa membebani setiap permintaan. Lihat `lib/session.ts`.
 *
 * Lapis kedua ada DI LUAR kode ini: **Vercel Deployment Protection** mencegat sebelum permintaan
 * menyentuh app. Dua lapis dari vendor berbeda, karena satu-satunya lapis yang gagal senyap
 * adalah lapis yang tidak punya pasangan.
 */
import { NextResponse, type NextRequest } from 'next/server';
import { SESSION_COOKIE, verifySession } from './lib/session';

export async function middleware(req: NextRequest) {
  if (!process.env.CONSOLE_PASSWORD) {
    // Sengaja 503 dan bukan halaman login: ini salah konfigurasi operator, bukan kredensial
    // salah. Membedakannya membuat penyebabnya kelihatan alih-alih terbaca "password saya salah".
    return new NextResponse(
      'Console terkunci: CONSOLE_PASSWORD belum diset. Lihat apps/console/README.md.',
      { status: 503, headers: { 'Cache-Control': 'no-store' } },
    );
  }

  const ok = await verifySession(req.cookies.get(SESSION_COOKIE)?.value, Date.now());
  if (!ok) {
    const back = new URL('/login', req.url);
    return NextResponse.redirect(back, { status: 303 });
  }

  const res = NextResponse.next();
  // Console tidak boleh singgah di cache bersama mana pun, CDN Vercel termasuk.
  res.headers.set('Cache-Control', 'no-store, private');
  return res;
}

export const config = {
  // `/login` dan jalur API-nya harus tetap terbuka — kalau ikut digerbang, tidak ada cara masuk.
  matcher: ['/((?!_next/static|_next/image|favicon|login|api/login|api/logout).*)'],
};
