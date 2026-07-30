/**
 * Login ortu: form → sini → Supabase Auth → cookie httpOnly → Dashboard.
 *
 * Lewat route handler kita sendiri, bukan langsung dari browser, karena hanya server yang bisa
 * memasang cookie httpOnly. Password tidak pernah disimpan, di-log, atau ikut ke redirect.
 */
import { NextResponse } from 'next/server';
import { REFRESH_COOKIE, SESSION_COOKIE, signInEndpoint } from '../../../lib/supabase';

/** Sepadan dengan umur access token Supabase (~1 jam). Cookie tidak boleh hidup lebih lama. */
const SESSION_SECONDS = 60 * 60;
/** Refresh token hidup jauh lebih lama — ia yang membuat sesi bertahan seharian. */
const REFRESH_SECONDS = 30 * 24 * 60 * 60;

export async function POST(req: Request) {
  const form = await req.formData();
  const email = String(form.get('email') ?? '').trim();
  const password = String(form.get('password') ?? '');

  const back = new URL('/login', req.url);
  if (!email || !password) {
    back.searchParams.set('e', 'failed');
    return NextResponse.redirect(back, { status: 303 });
  }

  const { url, key } = signInEndpoint();

  let res: Response;
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: { apikey: key, 'content-type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
  } catch {
    back.searchParams.set('e', 'failed');
    return NextResponse.redirect(back, { status: 303 });
  }

  const body = await res.json().catch(() => ({}));

  // Pesan seragam, apa pun sebabnya — email tidak terdaftar dan password salah harus
  // tidak bisa dibedakan, kalau tidak layar ini jadi alat memeriksa siapa yang punya akun.
  if (!res.ok || !body.access_token) {
    back.searchParams.set('e', 'failed');
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
