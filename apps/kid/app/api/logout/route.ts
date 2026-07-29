/**
 * Keluar. Ada karena app anak dipakai di perangkat berbagi — kalau tidak ada jalan keluar,
 * sesi 12 jam itu artinya siapa pun yang memegang HP berikutnya adalah "anak itu".
 */
import { NextResponse } from 'next/server';
import { SESSION_COOKIE } from '../../../lib/supabase';

export async function POST(req: Request) {
  const out = NextResponse.redirect(new URL('/login', req.url), { status: 303 });
  out.cookies.set(SESSION_COOKIE, '', { httpOnly: true, path: '/', maxAge: 0 });
  return out;
}
