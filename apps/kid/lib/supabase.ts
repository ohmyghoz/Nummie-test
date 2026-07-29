/**
 * Klien Supabase untuk app anak — hanya sisi server.
 *
 * ── Kenapa token di cookie httpOnly, bukan localStorage ──────────────────────
 * Dua alasan, dan yang kedua lebih penting daripada kenyamanan:
 *
 *  1. Halaman app anak semuanya React Server Component. Server tidak bisa membaca
 *     localStorage, titik.
 *  2. App anak dipakai di perangkat berbagi — HP ortu, iPad keluarga. Token yang tidak
 *     bisa disentuh JavaScript adalah token yang tidak bisa dibaca kakak yang penasaran,
 *     ekstensi browser, atau skrip yang menyelinap lewat konten pihak ketiga.
 *
 * ── Yang TIDAK dikerjakan berkas ini ─────────────────────────────────────────
 * Tidak ada aturan akses di sini. Klien ini cuma membawa token; yang memutuskan anak
 * boleh melihat apa adalah RLS di database (backlog C-5, ADR-0012). Kalau suatu hari
 * berkas ini terlihat memfilter `child_id` sendiri, itu tanda ada yang salah paham.
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

export const SESSION_COOKIE = 'nummi_child';

function env(name: string): string {
  const value = process.env[name];
  if (!value) {
    // Sengaja melempar, BUKAN diam-diam jatuh ke data seed. App uang yang menampilkan
    // angka demo tanpa memberi tahu siapa pun adalah kegagalan yang lebih buruk
    // daripada halaman yang tidak mau terbuka.
    throw new Error(
      `${name} belum diset. Salin .env.example jadi apps/kid/.env.local dan isi nilainya.`,
    );
  }
  return value;
}

/** Token sesi anak, atau null kalau belum masuk. */
export async function childToken(): Promise<string | null> {
  const jar = await cookies();
  return jar.get(SESSION_COOKIE)?.value ?? null;
}

/**
 * Klien yang membawa identitas anak. RLS membaca claim di dalam token ini —
 * `nummi_role`, `child_id`, `family_id` — bukan apa pun yang dikirim kode kita.
 */
export function clientWithToken(token: string): SupabaseClient {
  return createClient(
    env('NEXT_PUBLIC_SUPABASE_URL'),
    env('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY'),
    {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: { persistSession: false, autoRefreshToken: false },
    },
  );
}

/**
 * Klien service role — **HANYA untuk menulis, hanya dari server action.**
 *
 * Ia melewati RLS sepenuhnya. Itu memang alasannya ada: sejak migrasi 0009, tidak ada peran
 * ber-RLS yang boleh menulis ke `ledger_entries`, dan penegakan aturan uang pindah ke
 * `@nummi/core` supaya aturannya cuma punya satu rumah.
 *
 * Konsekuensi yang harus selalu diingat siapa pun yang menyentuh berkas ini:
 * **RLS tidak lagi menahanmu di jalur ini.** Setiap penulisan wajib lebih dulu menentukan
 * anaknya lewat pembacaan ber-token (yang dijaga RLS), tidak pernah dari input klien.
 *
 * `SUPABASE_SECRET_KEY` sengaja TANPA prefix NEXT_PUBLIC_ — dengan begitu Next.js tidak akan
 * pernah memasukkannya ke bundle browser, bahkan kalau berkas ini salah diimpor.
 */
export function serviceClient(): SupabaseClient {
  return createClient(env('NEXT_PUBLIC_SUPABASE_URL'), env('SUPABASE_SECRET_KEY'), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/** URL Edge Function `child-login` + kunci publiknya, dipakai route handler login. */
export function loginEndpoint(): { url: string; key: string } {
  return {
    url: `${env('NEXT_PUBLIC_SUPABASE_URL')}/functions/v1/child-login`,
    key: env('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY'),
  };
}
