-- Ganti PIN anak — satu-satunya jalan pulih dari PIN yang lupa.
--
-- Kenapa ini baru ada sekarang, dan kenapa ketiadaannya berbahaya: PIN hanya bisa diisi saat anak
-- DIBUAT (`create_child`, 0012). `pin_hash` di-bcrypt dan sengaja tidak pernah keluar dari database
-- (0006) — perbaikan keamanan yang benar, tapi tidak ada yang membangun jalur gantinya sesudahnya.
--
-- Akibatnya app anak menjanjikan sesuatu yang mustahil: *"Lupa PIN? Tanya orang tuamu — mereka bisa
-- MELIHATNYA di app mereka."* Ortu tidak bisa melihat apa pun. Anak yang lupa PIN-nya terkunci
-- permanen dari uangnya sendiri, dan satu-satunya jalan keluar adalah SQL manual oleh operator.
-- Untuk uji beberapa minggu dengan anak 9–12 memegang PIN 6 digit, itu bukan kemungkinan kecil.
--
-- Ortu boleh MENGGANTI, bukan MELIHAT. Bedanya penting dan sengaja dipertahankan: PIN tetap milik
-- anak. Ortu adalah jalur pemulihan, bukan pengintai.

create or replace function set_child_pin(
  p_family_id uuid,
  p_child_id  uuid,
  p_pin       text
)
returns void
language plpgsql
security definer
-- `extensions` wajib: crypt() & gen_salt() milik pgcrypto, tidak dipasang di `public`.
set search_path = public, extensions, pg_temp
as $$
declare
  v_family uuid;
begin
  -- Anak itu benar milik keluarga yang mengaku? Pemanggil sudah menurunkan `p_family_id` dari
  -- token, tapi fungsi ini tetap memeriksanya sendiri: ia berjalan `security definer`, jadi ia
  -- tidak boleh mempercayai satu pun argumennya. Pelajaran 0009 — setiap jalur tulis harus diuji
  -- dengan mencoba menyalahgunakannya, bukan dengan membaca ulang kalimatnya.
  select family_id into v_family from children where id = p_child_id;
  if v_family is null or v_family <> p_family_id then
    raise exception 'set_child_pin: anak tidak ada di keluarga itu';
  end if;

  -- Bentuk PIN ditegakkan DI SINI juga, walau `validatePin()` di core sudah memeriksanya.
  -- Aturan yang hanya dijaga app akan bocor lewat jalur tulis berikutnya yang lupa memanggilnya.
  if p_pin !~ '^\d{6}$' then
    raise exception 'set_child_pin: PIN harus 6 digit';
  end if;

  -- Keunikan per keluarga (ADR-0012 §A2). Tidak bisa jadi constraint: salt bcrypt berbeda tiap
  -- baris, jadi dua PIN sama menghasilkan hash berbeda. Anak ini sendiri dikecualikan — mengganti
  -- PIN ke nilai yang sama bukan tabrakan.
  if exists (
    select 1 from children c
    where c.family_id = p_family_id
      and c.id <> p_child_id
      and c.pin_hash = crypt(p_pin, c.pin_hash)
  ) then
    raise exception 'set_child_pin: PIN sudah dipakai anggota keluarga lain';
  end if;

  -- Cost 10, sama dengan `create_child` — kalau berbeda, dua PIN yang sah akan punya biaya
  -- verifikasi berbeda dan itu bisa terukur dari luar.
  update children set pin_hash = crypt(p_pin, gen_salt('bf', 10)) where id = p_child_id;
end;
$$;

-- Oracle PIN: siapa pun yang boleh memanggilnya boleh menimpa PIN anak mana pun yang keluarganya
-- dia tahu. Hanya service role — sama seperti find_child_by_pin (0007) dan verify_child_pin (0006).
revoke execute on function set_child_pin(uuid, uuid, text) from public, anon, authenticated;

-- ── Pemeriksa keunikan versi "anak lain" ─────────────────────────────────────
--
-- `family_pin_taken()` (0007) menjawab *"ada anak di keluarga ini yang PIN-nya X?"* dan itu benar
-- untuk **menambah** anak. Untuk **mengganti** PIN ia salah: anak yang sedang diganti ikut
-- terhitung, jadi ortu yang mengetik ulang PIN yang sama ditolak dengan alasan yang keliru.
--
-- Dipisah jadi fungsi sendiri alih-alih menambah parameter opsional ke yang lama: yang lama sudah
-- dipanggil `addChild` dan dijaga test, dan mengubah tanda tangannya berarti menyentuh jalur yang
-- sudah bekerja demi jalur yang baru.
create or replace function family_pin_taken_for_other(
  p_family_id uuid,
  p_child_id  uuid,
  p_pin       text
)
returns boolean
language sql
stable
security definer
set search_path = public, extensions, pg_temp
as $$
  select exists (
    select 1 from children c
    where c.family_id = p_family_id
      and c.id <> p_child_id
      and c.pin_hash = crypt(p_pin, c.pin_hash)
  );
$$;

revoke execute on function family_pin_taken_for_other(uuid, uuid, text)
  from public, anon, authenticated;
