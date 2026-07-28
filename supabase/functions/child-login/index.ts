/**
 * Edge Function: login anak (ADR-0012).
 *
 * Anak tidak punya email. Alih-alih memaksa anak masuk lewat email sintetis, anak masuk dengan
 * KODE KELUARGA + PIN, dan fungsi ini menerbitkan JWT ber-claim yang dibaca RLS.
 *
 * Kenapa tidak diperiksa di sisi klien saja: backlog C-5 sudah menetapkan bahwa aturan akses
 * harus jadi kebijakan sisi server, bukan penyembunyian di sisi klien. Untuk app uang, model
 * kepercayaannya runtuh kalau anak yang tahu inspect element bisa membuka layar ortu.
 *
 * PIN 4–6 digit = ruang tebakan sangat kecil. RATE LIMITING DI BAWAH BUKAN OPSIONAL.
 */
import { createClient } from 'jsr:@supabase/supabase-js@2';
import { create, getNumericDate } from 'https://deno.land/x/djwt@v3.0.2/mod.ts';
import * as bcrypt from 'https://deno.land/x/bcrypt@v0.4.1/mod.ts';

const MAX_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;
const SESSION_HOURS = 12;

const admin = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);

  const { familyCode, childId, pin } = await req.json().catch(() => ({}));
  if (!familyCode || !childId || !pin) return json({ error: 'missing_fields' }, 400);

  // 1. Rate limit SEBELUM menyentuh hash.
  const ip = req.headers.get('x-forwarded-for') ?? 'unknown';
  if (await isRateLimited(childId, ip)) {
    return json({ error: 'too_many_attempts', retryAfterMinutes: LOCKOUT_MINUTES }, 429);
  }

  // 2. Kode keluarga DAN child id harus cocok.
  const { data: child } = await admin
    .from('children')
    .select('id, family_id, tier, pin_hash, families!inner(family_code)')
    .eq('id', childId)
    .single();

  const codeMatches = child?.families?.family_code === String(familyCode).toUpperCase();
  const pinMatches = child ? await bcrypt.compare(String(pin), child.pin_hash) : false;

  if (!child || !codeMatches || !pinMatches) {
    await recordFailure(childId, ip);
    // Pesan galat sengaja seragam — jangan bocorkan bagian mana yang salah.
    return json({ error: 'invalid_credentials' }, 401);
  }

  await clearFailures(childId, ip);

  // 3. Terbitkan JWT dengan claim yang dibaca auth_role_kind() / auth_child_id() / auth_family_id().
  // CATATAN: namanya BUKAN SUPABASE_JWT_SECRET. Supabase mereservasi prefix `SUPABASE_`
  // untuk secrets — `supabase secrets set SUPABASE_...` ditolak, dan JWT secret tidak
  // termasuk yang di-inject otomatis (hanya URL, ANON_KEY, SERVICE_ROLE_KEY, DB_URL).
  // Memakai nama berprefix itu membuat nilainya undefined saat runtime.
  //   supabase secrets set CHILD_JWT_SECRET=<jwt secret proyek>
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(Deno.env.get('CHILD_JWT_SECRET')!),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );

  const token = await create({ alg: 'HS256', typ: 'JWT' }, {
    aud: 'authenticated',
    role: 'authenticated',
    sub: child.id,
    exp: getNumericDate(SESSION_HOURS * 60 * 60),
    nummi_role: 'child',
    child_id: child.id,
    family_id: child.family_id,
    tier: child.tier,
  }, key);

  return json({ token, childId: child.id, tier: child.tier, expiresInHours: SESSION_HOURS });
});

async function isRateLimited(childId: string, ip: string): Promise<boolean> {
  const since = new Date(Date.now() - LOCKOUT_MINUTES * 60_000).toISOString();
  const { count } = await admin
    .from('child_login_attempts')
    .select('*', { count: 'exact', head: true })
    .eq('child_id', childId)
    .eq('ip', ip)
    .gte('created_at', since);
  return (count ?? 0) >= MAX_ATTEMPTS;
}

async function recordFailure(childId: string, ip: string) {
  await admin.from('child_login_attempts').insert({ child_id: childId, ip });
}

async function clearFailures(childId: string, ip: string) {
  await admin.from('child_login_attempts').delete().eq('child_id', childId).eq('ip', ip);
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}
