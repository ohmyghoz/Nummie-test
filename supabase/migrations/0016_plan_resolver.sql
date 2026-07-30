-- Nummi — satu resolver plan yang bisa dipanggil identik dari semua permukaan (ADR-0010, ADR-0018).
--
-- `is_pro(family_id)` sudah ada sejak 0001, tapi ia menuntut pemanggil sudah tahu `family_id`-nya.
-- Di app itu berarti dua perjalanan: baca `parents` dulu, baru tanya plan-nya — dan permukaan yang
-- malas akan memotong jalan dengan `select` langsung ke `entitlements`. Padahal ADR-0010 menulis
-- dengan jelas: **"Semua permukaan memanggil resolver itu, tidak pernah memeriksa tabel langsung."**
--
-- Pembungkus tanpa argumen menutup jalan pintas itu. Ia bekerja untuk KEDUA jenis pengguna, karena
-- `auth_family_id()` sudah menangani keduanya: ortu lewat `auth.uid()`, anak lewat claim `family_id`
-- di JWT-nya (0002/0004).

create or replace function my_family_is_pro()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select is_pro(auth_family_id());
$$;

/*
 * SECURITY DEFINER dengan alasan yang sama seperti `auth_family_id()` di 0004: pembacaan di dalam
 * `is_pro()` menyentuh `entitlements`, yang punya policy sendiri. Tanpa definer, jawabannya akan
 * bergantung pada apakah pemanggil boleh membaca barisnya — padahal pertanyaannya bukan "apa isi
 * entitlement-mu", melainkan "apakah keluargamu Pro".
 *
 * Ia tidak membocorkan apa pun: nilainya boolean tentang keluarga si pemanggil sendiri.
 */

revoke execute on function my_family_is_pro() from public, anon;
grant execute on function my_family_is_pro() to authenticated, service_role;

/*
 * Keluarga uji diberi Pro lewat `source = 'grant'`.
 *
 * Bukan dengan mematikan gate-nya. Sejak ADR-0018 ditegakkan, Grow TIDAK tampil untuk keluarga Free
 * (C1/I3) — dan keluarga Arthur adalah keluarga uji yang justru harus bisa mendemokan Grow. Jalur
 * yang benar untuk itu memang `grant`, dan kolomnya sudah disiapkan sejak 0001.
 *
 * `source` juga yang membedakannya dari `school`: I5 melarang tombol upgrade tampil untuk sekolah,
 * dan keluarga yang diberi grant bukan sekolah.
 */
insert into entitlements (family_id, source, active)
select id, 'grant', true from families
on conflict do nothing;
