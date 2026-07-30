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
 * Access token Supabase berumur ~1 jam. Yang memperbaruinya `middleware.ts`, bukan berkas ini —
 * server component tidak bisa memasang cookie, jadi penukaran refresh token HARUS terjadi di
 * middleware (satu-satunya tempat di Next yang boleh menulis cookie sebelum halaman dirender).
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

export const SESSION_COOKIE = 'nummi_parent';
/** Refresh token — ditukar jadi access token baru oleh `middleware.ts` (U-11). */
export const REFRESH_COOKIE = 'nummi_parent_refresh';

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
/**
 * ── Auth ortu = OTP email, tanpa password (ADR-0022) ─────────────────────────
 *
 * `signInEndpoint()` (grant_type=password) dihapus 30 Juli 2026. Alasannya bukan keamanan
 * password, melainkan bahwa **tidak ada halaman daftar dan tidak ada reset password** — jadi
 * ortu yang lupa passwordnya jadi tiket dukungan manual untuk founder yang bekerja kantoran.
 * OTP menghapus dua masalah dengan satu layar: tidak ada yang bisa dilupakan, jadi tidak ada
 * yang perlu direset.
 *
 * **Kode 6 digit, BUKAN magic link** — dan ini keputusan PWA, bukan selera. Magic link membuka
 * browser bawaan aplikasi email, yang sering bukan browser tempat PWA dipasang. Cookie httpOnly
 * mendarat di konteks yang salah dan ortu tetap terkunci di luar app-nya sendiri. Kode yang
 * diketik ke layar yang sudah terbuka tidak punya masalah itu.
 */
export function sendOtpEndpoint(): { url: string; key: string } {
  return {
    url: `${env('NEXT_PUBLIC_SUPABASE_URL')}/auth/v1/otp`,
    key: env('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY'),
  };
}

export function verifyOtpEndpoint(): { url: string; key: string } {
  return {
    url: `${env('NEXT_PUBLIC_SUPABASE_URL')}/auth/v1/verify`,
    key: env('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY'),
  };
}
