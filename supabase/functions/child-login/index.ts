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
 * TIDAK ADA `childId` di sini, dan itu keputusan (U-7 opsi 2). Versi sebelumnya menuntutnya,
 * padahal anak tidak mungkin mengetik UUID — dan daftar anak per kode keluarga tak punya jalur
 * baca yang sah, karena RLS menuntut token yang justru belum terbit. Jadi tidak ada daftar sama
 * sekali: `find_child_by_pin()` mencari sendiri, dan MENOLAK kalau dua anak sama-sama cocok.
 *
 * PIN 6 digit = 1.000.000 kombinasi, tapi tiap anak menambah satu PIN yang sah di ruang itu.
 * RATE LIMITING DI BAWAH BUKAN OPSIONAL.
 */
import { createClient } from 'jsr:@supabase/supabase-js@2';
import { create, getNumericDate } from 'https://deno.land/x/djwt@v3.0.2/mod.ts';
// TIDAK ADA bcrypt di sini, dan itu disengaja — lihat migrasi 0006_verify_child_pin.sql.
// Ringkasnya: `deno.land/x/bcrypt` async memakai Worker, yang tidak ada di Edge Runtime
// (`ReferenceError: Worker is not defined` → 500). Perbandingan PIN sekarang dikerjakan
// Postgres lewat pgcrypto, sehingga `pin_hash` tidak pernah keluar dari database.

const MAX_ATTEMPTS = 5;          // per (keluarga, IP)
const MAX_ATTEMPTS_FAMILY = 20;  // per keluarga dari IP mana pun — lihat isRateLimited()
const LOCKOUT_MINUTES = 15;
const SESSION_HOURS = 12;

const admin = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);

  const { familyCode, pin } = await req.json().catch(() => ({}));
  if (!familyCode || !pin) return json({ error: 'missing_fields' }, 400);

  const ip = clientIp(req);

  // 1. Keluarganya dicari lebih dulu — BUKAN untuk memberi tahu penebak bahwa kodenya benar
  // (jawabannya tetap seragam), melainkan supaya rate limit punya kunci. Kode yang tidak ada
  // tetap dihitung, hanya saja per-IP: penebak kode acak juga harus dibatasi.
  const { data: family } = await admin
    .from('families')
    .select('id')
    .eq('family_code', String(familyCode).toUpperCase())
    .maybeSingle();

  // 2. Rate limit SEBELUM menyentuh hash.
  if (await isRateLimited(family?.id ?? null, ip)) {
    return json({ error: 'too_many_attempts', retryAfterMinutes: LOCKOUT_MINUTES }, 429);
  }

  // 3. Siapa anak yang PIN-nya cocok di keluarga itu? Perbandingan bcrypt dikerjakan Postgres
  // (0007), jadi `pin_hash` tidak pernah keluar dari database. Nol baris berarti salah satu
  // dari: kode salah, PIN salah, atau DUA anak sama-sama cocok — dan ketiganya memang harus
  // menghasilkan jawaban yang sama persis di sini.
  const { data: matches } = await admin
    .rpc('find_child_by_pin', { p_family_code: String(familyCode), p_pin: String(pin) });

  const child = Array.isArray(matches) ? matches[0] : null;

  if (!child) {
    await recordFailure(family?.id ?? null, ip);
    // Pesan galat sengaja seragam — jangan bocorkan bagian mana yang salah.
    return json({ error: 'invalid_credentials' }, 401);
  }

  await clearFailures(family?.id ?? null, ip);

  // 4. Terbitkan JWT dengan claim yang dibaca auth_role_kind() / auth_child_id() / auth_family_id().
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

  // Nama kolomnya datang dari find_child_by_pin(): child_id, family_id, tier.
  const token = await create({ alg: 'HS256', typ: 'JWT' }, {
    aud: 'authenticated',
    role: 'authenticated',
    sub: child.child_id,
    exp: getNumericDate(SESSION_HOURS * 60 * 60),
    nummi_role: 'child',
    child_id: child.child_id,
    family_id: child.family_id,
    tier: child.tier,
  }, key);

  return json({ token, childId: child.child_id, tier: child.tier, expiresInHours: SESSION_HOURS });
});

/**
 * `x-forwarded-for` adalah RANTAI: "klien, proxy1, proxy2". Hop terakhir adalah proxy Supabase
 * sendiri dan BERGANTI tiap permintaan (99.83.104.104, .107, .110, …). Memakai string utuh
 * sebagai kunci membuat setiap percobaan tampak datang dari IP baru — dan itulah sebabnya
 * rate limiting tidak pernah menyala sekali pun sampai 29 Juli 2026, walau kodenya ada.
 */
function clientIp(req: Request): string {
  const first = (req.headers.get('x-forwarded-for') ?? '').split(',')[0]?.trim();
  return first || 'unknown';
}

/**
 * Kuncinya sekarang KELUARGA + IP, bukan anak + IP (0007) — anak justru bagian yang belum
 * diketahui saat percobaan gagal.
 *
 * DUA lapis, karena hop pertama `x-forwarded-for` dikirim klien dan **bisa dipalsukan**:
 *
 *   (a) per (keluarga, IP)  — 5/15 menit. Menangkap penebak biasa.
 *   (b) per keluarga saja   — 20/15 menit. Menangkap yang merotasi IP palsu, karena kode
 *       keluarga tidak bisa ikut dipalsukan: ia harus benar agar tebakan ada gunanya.
 *
 * Harga lapis (b) diambil sadar: siapa pun yang tahu kode keluarga bisa mengunci keluarga itu
 * selama 15 menit. Untuk fase prototipe, satu keluarga terkunci sementara lebih murah daripada
 * satu keluarga yang PIN-nya benar-benar ditebak. Ditinjau ulang kalau ada laporan nyata.
 */
async function isRateLimited(familyId: string | null, ip: string): Promise<boolean> {
  const since = new Date(Date.now() - LOCKOUT_MINUTES * 60_000).toISOString();

  let perIp = admin
    .from('child_login_attempts')
    .select('*', { count: 'exact', head: true })
    .eq('ip', ip)
    .gte('created_at', since);
  perIp = familyId ? perIp.eq('family_id', familyId) : perIp.is('family_id', null);
  const { count: byIp } = await perIp;
  if ((byIp ?? 0) >= MAX_ATTEMPTS) return true;

  if (!familyId) return false;

  const { count: byFamily } = await admin
    .from('child_login_attempts')
    .select('*', { count: 'exact', head: true })
    .eq('family_id', familyId)
    .gte('created_at', since);
  return (byFamily ?? 0) >= MAX_ATTEMPTS_FAMILY;
}

async function recordFailure(familyId: string | null, ip: string) {
  await admin.from('child_login_attempts').insert({ family_id: familyId, ip });
}

async function clearFailures(familyId: string | null, ip: string) {
  let q = admin.from('child_login_attempts').delete().eq('ip', ip);
  q = familyId ? q.eq('family_id', familyId) : q.is('family_id', null);
  await q;
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}
