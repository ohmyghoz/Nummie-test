/**
 * Klien Supabase untuk console — **service role, lintas keluarga, hanya sisi server.**
 *
 * Di app anak dan app ortu, service role adalah pengecualian yang dijaga ketat. Di sini ia
 * memang alatnya: console adalah permukaan OPERATOR. Ia harus melihat semua keluarga sekaligus
 * untuk menjawab satu pertanyaan yang tidak bisa dijawab dari dalam satu keluarga —
 * *"apakah ada invarian yang pecah di suatu tempat?"*
 *
 * Karena itu console TIDAK boleh dipublikasikan bersama app produk. Ia dijalankan operator di
 * lingkungan yang dia kendalikan sendiri (ADR-0015).
 *
 * ⚠️ **Amandemen 30 Juli 2026.** Kalimat asli di sini berbunyi "console TIDAK punya login", dan
 * itu benar sebagai deskripsi — tapi terbaca sebagai izin. Sekarang ada `middleware.ts` yang
 * gagal-tertutup: tanpa `CONSOLE_PASSWORD` console menolak semua permintaan. Yang berubah bukan
 * keputusannya (console tetap alat operator, tetap tidak untuk publik), melainkan bahwa asumsi
 * "lingkungan yang dikendalikan sendiri" berhenti dijaga oleh harapan.
 *
 * Yang memaksanya: halaman ini pernah **diprerender jadi HTML statis saat build** dan berisi
 * saldo nyata seluruh keluarga. Lihat `app/page.tsx` — `force-dynamic` di sana bukan gaya.
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
