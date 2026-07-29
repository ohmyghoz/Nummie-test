/**
 * Login anak: form → sini → Edge Function `child-login` → cookie httpOnly → Home.
 *
 * Kenapa lewat route handler kita sendiri dan bukan langsung dari browser ke Edge Function:
 * hanya server yang bisa memasang cookie httpOnly. Kalau browser yang memanggil, tokennya
 * mendarat di JavaScript, dan itu persis yang ingin dihindari di perangkat berbagi.
 *
 * PIN TIDAK PERNAH disimpan, di-log, atau ikut ke redirect. Ia hidup selama satu permintaan.
 */
import { NextResponse } from 'next/server';
import { SESSION_COOKIE, loginEndpoint } from '../../../lib/supabase';

/** Sepadan dengan SESSION_HOURS di child-login. Cookie tidak boleh hidup lebih lama dari token. */
const SESSION_SECONDS = 12 * 60 * 60;

export async function POST(req: Request) {
  const form = await req.formData();
  const familyCode = String(form.get('familyCode') ?? '').trim();
  const pin = String(form.get('pin') ?? '').trim();

  const home = new URL('/', req.url);
  const back = new URL('/login', req.url);

  if (!familyCode || !pin) {
    back.searchParams.set('e', 'failed');
    return NextResponse.redirect(back, { status: 303 });
  }

  const { url, key } = loginEndpoint();

  let res: Response;
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({ familyCode, pin }),
    });
  } catch {
    // Jaringan mati bukan kredensial salah — tapi anak tidak perlu tahu bedanya, dan
    // membedakannya di layar akan membocorkan apa yang server sengaja samarkan.
    back.searchParams.set('e', 'failed');
    return NextResponse.redirect(back, { status: 303 });
  }

  if (res.status === 429) {
    const body = await res.json().catch(() => ({}));
    back.searchParams.set('e', 'locked');
    back.searchParams.set('m', String(body.retryAfterMinutes ?? 15));
    return NextResponse.redirect(back, { status: 303 });
  }

  if (!res.ok) {
    back.searchParams.set('e', 'failed');
    return NextResponse.redirect(back, { status: 303 });
  }

  const { token } = await res.json();
  if (!token) {
    back.searchParams.set('e', 'failed');
    return NextResponse.redirect(back, { status: 303 });
  }

  const out = NextResponse.redirect(home, { status: 303 });
  out.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_SECONDS,
  });
  return out;
}
