-- Nummi — verifikasi PIN pindah ke Postgres, dan bcrypt keluar dari jalur auth.
--
-- Pemicunya sebuah kegagalan runtime: `deno.land/x/bcrypt` versi async menjalankan
-- perbandingan di dalam Worker, dan Supabase Edge Runtime tidak menyediakan Worker.
-- `child-login` mengembalikan 500 dengan `ReferenceError: Worker is not defined`.
--
-- Ada tambalan satu kata (`compareSync`), tapi kesempatannya dipakai untuk memperbaiki
-- hal yang lebih penting: sebelumnya Edge Function men-SELECT `pin_hash` KELUAR dari
-- Postgres untuk dibandingkan di memori Deno. Sekarang hash tidak pernah meninggalkan
-- database, dan tidak ada dependency pihak ketiga di jalur autentikasi.
--
-- Hash-nya sendiri memang dibuat pgcrypto (`crypt` + `gen_salt('bf', 10)` di seed.sql),
-- jadi Postgres justru tempat paling wajar untuk memverifikasinya.

create or replace function verify_child_pin(p_child_id uuid, p_pin text)
returns boolean
language sql
stable
security definer
-- `extensions` WAJIB ada di sini: pgcrypto dipasang di schema itu, bukan di `public`.
-- Tanpa itu fungsi ini gagal dengan "function crypt(text, text) does not exist" —
-- persis jenis kegagalan yang baru terlihat saat anak sungguhan tidak bisa masuk.
set search_path = public, extensions, pg_temp
as $$
  select exists (
    select 1 from children c
    where c.id = p_child_id
      and c.pin_hash = crypt(p_pin, c.pin_hash)
  );
$$;

-- Hanya service role. Fungsi ini adalah oracle PIN: siapa pun yang boleh memanggilnya
-- boleh menebak PIN sebanyak-banyaknya, dan rate limiting kita hidup di Edge Function
-- (`child_login_attempts`), bukan di sini. Karena itu `authenticated` pun tidak diberi —
-- berbeda dari helper di 0005 yang memang harus dievaluasi sebagai role pemanggil.
revoke execute on function verify_child_pin(uuid, text) from public, anon, authenticated;
grant  execute on function verify_child_pin(uuid, text) to service_role;
