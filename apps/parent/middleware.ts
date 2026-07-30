/**
 * Memperbarui sesi ortu (U-11).
 *
 * Access token Supabase berumur ~1 jam. Tanpa berkas ini, ortu yang membuka app pagi hari akan
 * dilempar ke layar masuk sebelum tengah hari — dan bukan karena ada yang salah.
 *
 * Kenapa di middleware dan bukan di `lib/supabase.ts`: **server component tidak bisa memasang
 * cookie.** Middleware adalah satu-satunya tempat di Next yang boleh menulis cookie sebelum
 * halaman dirender, jadi penukaran refresh token harus terjadi di sini.
 *
 * `exp` dibaca dari payload token TANPA memverifikasi tanda tangannya, dan itu sengaja: yang
 * memverifikasi adalah Supabase saat token dipakai. Di sini kita cuma perlu tahu "sudah waktunya
 * ditukar atau belum" — token palsu paling banter memicu satu penukaran yang gagal.
 */
import { NextResponse, type NextRequest } from 'next/server';

const SESSION_COOKIE = 'nummi_parent';
const REFRESH_COOKIE = 'nummi_parent_refresh';

/** Ditukar 2 menit sebelum kedaluwarsa — bukan tepat saat mati, supaya tidak ada celah balapan. */
const RENEW_BEFORE_SECONDS = 120;

function secondsLeft(token: string): number | null {
  const payload = token.split('.')[1];
  if (!payload) return null;
  try {
    const json = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    return typeof json.exp === 'number' ? json.exp - Math.floor(Date.now() / 1000) : null;
  } catch {
    return null;
  }
}

export async function middleware(req: NextRequest) {
  const access = req.cookies.get(SESSION_COOKIE)?.value;
  const refresh = req.cookies.get(REFRESH_COOKIE)?.value;

  // Belum masuk, atau tidak ada yang bisa ditukar: biarkan halaman memutuskan (ia akan
  // melempar ke /login sendiri lewat `getParentData()`).
  if (!refresh) return NextResponse.next();

  const left = access ? secondsLeft(access) : null;
  if (access && left !== null && left > RENEW_BEFORE_SECONDS) return NextResponse.next();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return NextResponse.next();

  let body: { access_token?: string; refresh_token?: string } = {};
  try {
    const res = await fetch(`${url}/auth/v1/token?grant_type=refresh_token`, {
      method: 'POST',
      headers: { apikey: key, 'content-type': 'application/json' },
      body: JSON.stringify({ refresh_token: refresh }),
    });
    if (!res.ok) throw new Error(String(res.status));
    body = await res.json();
  } catch {
    // Refresh token mati (dicabut, atau kedaluwarsa). Bersihkan supaya tidak mencoba
    // menukarnya di setiap permintaan berikutnya.
    const out = NextResponse.next();
    out.cookies.set(REFRESH_COOKIE, '', { httpOnly: true, path: '/', maxAge: 0 });
    return out;
  }

  if (!body.access_token) return NextResponse.next();

  const out = NextResponse.next();
  const base = {
    httpOnly: true as const,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  };
  out.cookies.set(SESSION_COOKIE, body.access_token, { ...base, maxAge: 60 * 60 });
  if (body.refresh_token) {
    out.cookies.set(REFRESH_COOKIE, body.refresh_token, { ...base, maxAge: 30 * 24 * 60 * 60 });
  }

  // Halaman yang dirender setelah ini harus MEMBACA token baru, bukan yang lama dari
  // permintaan. Tanpa baris ini, permintaan pertama sesudah penukaran masih memakai token mati.
  req.cookies.set(SESSION_COOKIE, body.access_token);
  return out;
}

export const config = {
  // Aset statis tidak perlu sesi; menukar token untuk setiap gambar itu pemborosan.
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
