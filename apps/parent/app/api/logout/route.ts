import { NextResponse } from 'next/server';
import { SESSION_COOKIE } from '../../../lib/supabase';

export async function POST(req: Request) {
  const out = NextResponse.redirect(new URL('/login', req.url), { status: 303 });
  out.cookies.set(SESSION_COOKIE, '', { httpOnly: true, path: '/', maxAge: 0 });
  return out;
}
