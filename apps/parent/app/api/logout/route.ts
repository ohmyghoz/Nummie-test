import { NextResponse } from 'next/server';
import { REFRESH_COOKIE, SESSION_COOKIE } from '../../../lib/supabase';

export async function POST(req: Request) {
  const out = NextResponse.redirect(new URL('/login', req.url), { status: 303 });
  out.cookies.set(SESSION_COOKIE, '', { httpOnly: true, path: '/', maxAge: 0 });
  // Refresh token WAJIB ikut dihapus. Kalau tidak, middleware akan menukarnya jadi sesi baru
  // di permintaan berikutnya — dan "keluar" berubah jadi tidak melakukan apa-apa.
  out.cookies.set(REFRESH_COOKIE, '', { httpOnly: true, path: '/', maxAge: 0 });
  return out;
}
