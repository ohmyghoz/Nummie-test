/**
 * Login ortu: form → sini → Supabase Auth → cookie httpOnly → Dashboard.
 *
 * Lewat route handler kita sendiri, bukan langsung dari browser, karena hanya server yang bisa
 * memasang cookie httpOnly. Password tidak pernah disimpan, di-log, atau ikut ke redirect.
 */
import { NextResponse } from 'next/server';
import { SESSION_COOKIE, signInEndpoint } from '../../../lib/supabase';

/** Sepadan dengan umur access token Supabase (~1 jam). Cookie tidak boleh hidup lebih lama. */
const SESSION_SECONDS = 60 * 60;

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
  out.cookies.set(SESSION_COOKIE, body.access_token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_SECONDS,
  });
  return out;
}
