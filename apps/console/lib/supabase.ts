/**
 * Klien Supabase untuk console — **service role, lintas keluarga, hanya sisi server.**
 *
 * Di app anak dan app ortu, service role adalah pengecualian yang dijaga ketat. Di sini ia
 * memang alatnya: console adalah permukaan OPERATOR. Ia harus melihat semua keluarga sekaligus
 * untuk menjawab satu pertanyaan yang tidak bisa dijawab dari dalam satu keluarga —
 * *"apakah ada invarian yang pecah di suatu tempat?"*
 *
 * Karena itu console TIDAK punya login dan TIDAK boleh dipublikasikan bersama app produk.
 * Ia dijalankan operator di lingkungan yang dia kendalikan sendiri (ADR-0015).
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

export function operatorClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) {
    throw new Error(
      'NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SECRET_KEY belum diset di apps/console/.env.local',
    );
  }
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}
