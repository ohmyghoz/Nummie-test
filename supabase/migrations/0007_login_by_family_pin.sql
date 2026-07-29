-- Nummi — anak masuk dengan KODE KELUARGA + PIN saja (U-7, opsi 2).
--
-- Sebelum ini `child-login` menuntut `childId` berupa UUID. Itu mustahil diketik anak, dan
-- daftar anak per kode keluarga tidak punya jalur baca yang sah — RLS `children_read` menuntut
-- token yang justru belum terbit pada saat login. Lingkaran yang sama bentuknya dengan rekursi
-- di 0004, cuma pindah lapisan.
--
-- Jalan keluar yang dipilih: tidak ada daftar anak sama sekali. Anak mengetik kode keluarga +
-- PIN, server mencari sendiri anak mana yang cocok. Dua konsekuensi ikut terkunci:
--
--   1. PIN wajib UNIK per keluarga. Dua anak ber-PIN sama membuat "ini siapa?" tidak punya
--      jawaban. Tidak bisa dijaga unique constraint — bcrypt memberi salt berbeda tiap baris,
--      jadi dua PIN identik menghasilkan hash yang berbeda. Penegakannya di waktu tulis.
--   2. PIN dikunci 6 digit (K15). Setiap anak menambah satu PIN sah di ruang tebakan yang sama,
--      jadi ruangnya harus 1.000.000, bukan 10.000. Lihat packages/core/src/onboarding.ts.

-- ── Rate limiting: dikunci ulang ke keluarga, bukan anak ──────────────────────
-- `child_id` dulu NOT NULL. Sekarang justru anak itulah yang belum diketahui saat percobaan
-- gagal — kalau PIN salah, tidak ada anak yang bisa disebut. Kolomnya dibiarkan ada (nullable)
-- supaya sejarah lama tetap terbaca, tapi jalur baru selalu mengisi `family_id`.

alter table child_login_attempts alter column child_id drop not null;
alter table child_login_attempts add column if not exists family_id uuid references families(id) on delete cascade;

-- Untuk kode keluarga yang tidak ada sama sekali, `family_id` ikut null: penebak kode acak
-- tetap harus dibatasi, dan dibatasi per-IP.
create index if not exists login_attempts_by_family on child_login_attempts (family_id, ip, created_at desc);
create index if not exists login_attempts_by_ip     on child_login_attempts (ip, created_at desc);

-- ── Pencari anak: kode keluarga + PIN → satu anak, atau tidak sama sekali ─────
--
-- `(select count(*) from m) = 1` bukan hiasan. Kalau data lama sempat punya dua anak ber-PIN
-- sama, fungsi ini memilih GAGAL, bukan menebak. Masuk sebagai "salah satu dari dua anak"
-- adalah kegagalan yang jauh lebih buruk daripada tidak bisa masuk.

create or replace function find_child_by_pin(p_family_code text, p_pin text)
returns table (child_id uuid, family_id uuid, tier tier)
language sql
stable
security definer
-- `extensions` wajib: crypt() milik pgcrypto, dan pgcrypto tidak dipasang di `public`.
set search_path = public, extensions, pg_temp
as $$
  with m as (
    select c.id, c.family_id, c.tier
    from children c
    join families f on f.id = c.family_id
    where upper(f.family_code) = upper(p_family_code)
      and c.pin_hash = crypt(p_pin, c.pin_hash)
  )
  select m.id, m.family_id, m.tier
  from m
  where (select count(*) from m) = 1;
$$;

-- ── Penjaga keunikan, dipakai flow "Add a child" ──────────────────────────────
-- Pasangannya di sisi TypeScript: `validateChild(..., { pinTakenInFamily })`.

create or replace function family_pin_taken(p_family_id uuid, p_pin text)
returns boolean
language sql
stable
security definer
set search_path = public, extensions, pg_temp
as $$
  select exists (
    select 1 from children c
    where c.family_id = p_family_id
      and c.pin_hash = crypt(p_pin, c.pin_hash)
  );
$$;

-- Keduanya oracle PIN — siapa pun yang boleh memanggilnya boleh menebak sepuasnya, dan rate
-- limiting hidup di Edge Function, bukan di sini. Sama seperti verify_child_pin di 0006.
revoke execute on function find_child_by_pin(text, text) from public, anon, authenticated;
revoke execute on function family_pin_taken(uuid, text)  from public, anon, authenticated;
grant  execute on function find_child_by_pin(text, text) to service_role;
grant  execute on function family_pin_taken(uuid, text)  to service_role;

-- CATATAN: `verify_child_pin()` dari 0006 sengaja TIDAK dihapus. Ia masih jalur yang benar
-- untuk memverifikasi PIN anak yang identitasnya SUDAH diketahui — mis. konfirmasi ulang di
-- dalam app anak yang sudah login. Yang berubah cuma cara MASUK.
