import { NextResponse } from 'next/server';
import { SESSION_COOKIE } from '../../../lib/session';

export async function POST(req: Request) {
  const out = NextResponse.redirect(new URL('/login', req.url), { status: 303 });
  out.cookies.set(SESSION_COOKIE, '', { path: '/', maxAge: 0 });
  return out;
}
