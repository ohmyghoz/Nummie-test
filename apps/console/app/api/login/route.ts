/**
 * Login console: form → sini → cookie httpOnly bertanda tangan → `/`.
 *
 * Rate limiting hidup DI SINI, bukan di middleware, dan itu keseluruhan alasan bentuk ini dipilih:
 * di sini ia berjalan sekali per percobaan masuk, sementara di middleware ia akan berjalan sekali
 * per permintaan — termasuk setiap aset.
 *
 * Urutannya tidak boleh dibalik: **kunci diperiksa sebelum password.** Kalau password diperiksa
 * lebih dulu, IP yang sudah terkunci tetap mendapat oracle — dan "PIN benar pun tetap ditolak
 * selama terkunci" sudah jadi bentuk yang ditetapkan ADR-0012 untuk login anak.
 */
import { NextResponse } from 'next/server';
import { operatorClient } from '../../../lib/supabase';
import { SESSION_COOKIE, SESSION_SECONDS, clientIp, signSession } from '../../../lib/session';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  const expected = process.env.CONSOLE_PASSWORD;
  const back = new URL('/login', req.url);

  if (!expected) {
    back.searchParams.set('e', 'unset');
    return NextResponse.redirect(back, { status: 303 });
  }

  const ip = clientIp(req.headers);
  const db = operatorClient();

  // 1. Terkunci? Diperiksa lebih dulu, apa pun isi passwordnya.
  const gate = await db.rpc('console_login_locked', { p_ip: ip });
  if (gate.error) {
    // Rate limiter yang tidak bisa dijawab database membuat gerbang ini buta. Menolak lebih
    // aman daripada melanjutkan tanpa pembatas — itu bedanya gagal-tertutup dan gagal-terbuka.
    back.searchParams.set('e', 'failed');
    return NextResponse.redirect(back, { status: 303 });
  }

  const row = Array.isArray(gate.data) ? gate.data[0] : gate.data;
  if (row?.locked) {
    back.searchParams.set('e', 'locked');
    back.searchParams.set('m', String(row.retry_after_minutes ?? 15));
    return NextResponse.redirect(back, { status: 303 });
  }

  // 2. Baru sekarang passwordnya.
  const form = await req.formData();
  const password = String(form.get('password') ?? '');
  const ok = password.length === expected.length && timingSafeEqual(password, expected);

  await db.rpc('console_login_record', { p_ip: ip, p_ok: ok });

  if (!ok) {
    back.searchParams.set('e', 'failed');
    return NextResponse.redirect(back, { status: 303 });
  }

  const token = await signSession(Date.now());
  if (!token) {
    back.searchParams.set('e', 'unset');
    return NextResponse.redirect(back, { status: 303 });
  }

  const out = NextResponse.redirect(new URL('/', req.url), { status: 303 });
  out.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_SECONDS,
  });
  return out;
}

/** Panjang tetap bocor lewat pemeriksaan di atas; yang dijaga isinya. */
function timingSafeEqual(a: string, b: string): boolean {
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
