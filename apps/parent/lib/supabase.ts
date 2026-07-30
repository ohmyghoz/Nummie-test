/**
 * Klien Supabase untuk app ortu — hanya sisi server.
 *
 * Bentuknya sengaja dibuat KEMBAR dengan `apps/kid/lib/supabase.ts`: token di cookie httpOnly,
 * pembacaan pakai token (RLS yang memutuskan), penulisan pakai service key di server action.
 * Dua app dengan dua pola auth berbeda berarti dua tempat untuk salah.
 *
 * Bedanya cuma sumber tokennya: anak lewat Edge Function `child-login` (kode keluarga + PIN),
 * ortu lewat Supabase Auth biasa (email + password) — ADR-0012.
 *
 * ⚠️ BATAS YANG DIKETAHUI: access token Supabase berumur ~1 jam dan berkas ini TIDAK
 * memperbaruinya. Sesi ortu yang lewat satu jam akan dilempar ke layar masuk. Untuk uji
 * prototipe itu cukup; refresh token otomatis dicatat sebagai U-11.
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

export const SESSION_COOKIE = 'nummi_parent';

function env(name: string): string {
  const value = process.env[name];
  if (!value) {
    // Melempar, BUKAN diam-diam jatuh ke data seed. App uang yang menampilkan angka demo
    // tanpa memberi tahu siapa pun lebih buruk daripada halaman yang tidak mau terbuka.
    throw new Error(
      `${name} belum diset. Salin .env.example jadi apps/parent/.env.local dan isi nilainya.`,
    );
  }
  return value;
}

export async function parentToken(): Promise<string | null> {
  const jar = await cookies();
  return jar.get(SESSION_COOKIE)?.value ?? null;
}

/** Klien yang membawa identitas ortu. RLS membaca `auth.uid()` dari token ini. */
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
 * Service role — **hanya untuk menulis, hanya dari server action.** Melewati RLS sepenuhnya.
 *
 * Sejak migrasi 0009 tidak ada peran ber-RLS yang boleh menulis ke `ledger_entries`, jadi ini
 * satu-satunya jalan. Konsekuensinya sama seperti di app anak: **RLS tidak menahanmu di jalur
 * ini.** Setiap penulisan wajib lebih dulu memastikan requestnya memang milik keluarga si ortu,
 * lewat pembacaan ber-token — tidak pernah dari id yang dikirim klien.
 */
export function serviceClient(): SupabaseClient {
  return createClient(env('NEXT_PUBLIC_SUPABASE_URL'), env('SUPABASE_SECRET_KEY'), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/** Endpoint sign-in Supabase Auth + kunci publiknya, dipakai route handler login. */
export function signInEndpoint(): { url: string; key: string } {
  return {
    url: `${env('NEXT_PUBLIC_SUPABASE_URL')}/auth/v1/token?grant_type=password`,
    key: env('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY'),
  };
}
