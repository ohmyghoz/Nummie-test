/**
 * Klien Supabase untuk console — **service role, lintas keluarga, hanya sisi server.**
 *
 * Di app anak dan app ortu, service role adalah pengecualian yang dijaga ketat. Di sini ia
 * memang alatnya: console adalah permukaan OPERATOR. Ia harus melihat semua keluarga sekaligus
 * untuk menjawab satu pertanyaan yang tidak bisa dijawab dari dalam satu keluarga —
 * *"apakah ada invarian yang pecah di suatu tempat?"*
 *
 * ⚠️ **Amandemen 30 Juli 2026 — [ADR-0021](../../../docs/decisions/0021-console-boleh-dideploy-dengan-syarat.md).**
 *
 * Komentar ini dulu berbunyi: *"console TIDAK punya login dan TIDAK boleh dipublikasikan bersama
 * app produk. Ia dijalankan operator di lingkungan yang dia kendalikan sendiri (ADR-0015)."*
 * Dua hal salah dengan kalimat itu, dan keduanya layak diingat:
 *
 *  1. **ADR-0015 tidak pernah menulisnya.** Aturan paling penting tentang keamanan console hidup
 *     di komentar ini, mengatasnamakan sebuah ADR — dan komentar tidak pernah ditinjau siapa pun.
 *  2. **Asumsinya tidak cocok dengan cara orangnya bekerja.** Laptop dev founder berbeda dari
 *     laptop & HP hariannya, dan pemeriksaan invarian justru paling dibutuhkan saat sedang tidak
 *     di depan mesin dev. Asumsi seperti itu akan dilanggar, cepat atau lambat.
 *
 * Yang berlaku sekarang: console **boleh** di-deploy, tapi hanya dengan **tiga lapis sekaligus** —
 * Vercel Deployment Protection · gerbang cookie gagal-tertutup (`middleware.ts` + `lib/session.ts`)
 * · rate limiting yang terbukti menghitung (migrasi 0017). Kurang satu, kembali ke lokal saja.
 *
 * Yang memaksa semua ini ditinjau: halaman console pernah **diprerender jadi HTML statis saat
 * build** dan berisi saldo nyata seluruh keluarga. Lihat `app/page.tsx` — `force-dynamic` di sana
 * bukan gaya.
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
