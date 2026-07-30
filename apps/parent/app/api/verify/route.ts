/**
 * Langkah 2 dari 2 — tukar kode 6 digit jadi sesi (ADR-0022).
 *
 * Cookie dipasang di sini, bukan di browser, karena hanya server yang bisa memasang httpOnly.
 * Kode tidak pernah disimpan, di-log, atau ikut ke redirect.
 *
 * Pembatas percobaan ada di **Supabase**, bukan di kode ini — berbeda dengan gerbang console yang
 * kita bangun sendiri (migrasi 0017), karena di sini kita tidak memegang jalur verifikasinya.
 * Konsekuensinya harus diketahui: batas itu milik vendor, jadi ia wajib **dibuktikan menyala**
 * saat uji pertama, bukan diasumsikan. Umur kode juga perlu dipendekkan dari default 1 jam —
 * lihat `docs/DEPLOY.md`.
 */
import { NextResponse } from 'next/server';
import { REFRESH_COOKIE, SESSION_COOKIE, verifyOtpEndpoint } from '../../../lib/supabase';

/** Sepadan dengan umur access token Supabase (~1 jam). Cookie tidak boleh hidup lebih lama. */
const SESSION_SECONDS = 60 * 60;
/** Refresh token hidup jauh lebih lama — ia yang membuat sesi bertahan seharian. */
const REFRESH_SECONDS = 30 * 24 * 60 * 60;

export async function POST(req: Request) {
  const form = await req.formData();
  const email = String(form.get('email') ?? '').trim().toLowerCase();
  const token = String(form.get('code') ?? '').replace(/\D/g, '');

  const back = new URL('/login', req.url);
  back.searchParams.set('sent', '1');
  back.searchParams.set('email', email);

  if (!email || !token) {
    back.searchParams.set('e', 'badCode');
    return NextResponse.redirect(back, { status: 303 });
  }

  const { url, key } = verifyOtpEndpoint();

  let body: { access_token?: string; refresh_token?: string } = {};
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { apikey: key, 'content-type': 'application/json' },
      body: JSON.stringify({ email, token, type: 'email' }),
    });
    if (res.status === 429) {
      back.searchParams.set('e', 'tooMany');
      return NextResponse.redirect(back, { status: 303 });
    }
    body = await res.json().catch(() => ({}));
  } catch {
    back.searchParams.set('e', 'badCode');
    return NextResponse.redirect(back, { status: 303 });
  }

  if (!body.access_token) {
    back.searchParams.set('e', 'badCode');
    return NextResponse.redirect(back, { status: 303 });
  }

  const out = NextResponse.redirect(new URL('/', req.url), { status: 303 });
  const base = {
    httpOnly: true as const,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  };
  out.cookies.set(SESSION_COOKIE, body.access_token, { ...base, maxAge: SESSION_SECONDS });
  // Tanpa ini, ortu terlempar ke layar masuk setiap jam (U-11). Middleware yang menukarnya.
  if (body.refresh_token) {
    out.cookies.set(REFRESH_COOKIE, body.refresh_token, { ...base, maxAge: REFRESH_SECONDS });
  }
  return out;
}
