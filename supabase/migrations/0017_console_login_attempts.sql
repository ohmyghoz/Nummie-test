-- Percobaan login console — bahan rate limiting (ADR-0021 mengamandemen ADR-0015).
--
-- Kenapa tabel ini ada: console dipindah dari "hanya lokal" ke "boleh di-deploy", karena laptop
-- dev founder berbeda dari laptop & HP hariannya. Begitu ia punya URL publik, SATU password
-- bersama tanpa pembatas percobaan bukan pengaman — cuma formalitas. Ini kalimat yang sama
-- persis dengan yang ditulis 0003 untuk PIN anak, dan ia benar untuk alasan yang sama.
--
-- Pelajaran yang diwarisi dari ADR-0012 §A3, dan ia tidak boleh diulang: rate limit login anak
-- "ada" berbulan-bulan tanpa pernah menghitung satu tebakan pun, karena kuncinya memakai
-- `x-forwarded-for` UTUH — rantai yang hop terakhirnya proxy dan berganti tiap permintaan.
-- Pemanggil fungsi ini WAJIB memakai hop PERTAMA saja.

create table if not exists console_login_attempts (
  id         bigserial primary key,
  ip         text not null,
  ok         boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists console_attempts_by_ip on console_login_attempts (ip, created_at desc);
create index if not exists console_attempts_recent on console_login_attempts (created_at desc);

alter table console_login_attempts enable row level security;
-- Tanpa policy sama sekali: hanya service role yang boleh menyentuhnya. Sama seperti 0003.

-- ── Pemeriksa kunci — dipanggil SEBELUM password diperiksa ────────────────────
--
-- Urutannya penting dan bukan selera: kalau password diperiksa lebih dulu, IP yang sudah
-- terkunci tetap mendapat oracle. ADR-0012 sudah menetapkan bentuk yang benar — "PIN benar pun
-- tetap ditolak selama terkunci" — dan console mengikutinya.
--
-- DUA lapis, karena hop pertama `x-forwarded-for` dikirim klien dan BISA DIPALSUKAN:
--
--   (a) per IP   — 5 / 15 menit. Menangkap penebak biasa.
--   (b) global   — 30 / 15 menit. Menangkap yang merotasi IP palsu.
--
-- Harga lapis (b) diambil sadar: penyerang yang merotasi IP bisa mengunci console untuk
-- operatornya sendiri. Itu diterima karena console PUNYA jalan keluar yang tidak dimiliki app
-- produk — operator selalu bisa menjalankannya lokal (`npm run console:dev`). Trade-off yang
-- sama akan TIDAK bisa diterima di app anak atau ortu.
create or replace function console_login_locked(p_ip text)
returns table (locked boolean, retry_after_minutes int)
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
declare
  v_window   interval := interval '15 minutes';
  v_per_ip   int := 5;
  v_global   int := 30;
  v_ip_fails int;
  v_all_fails int;
  v_oldest   timestamptz;
begin
  select count(*), min(created_at) into v_ip_fails, v_oldest
  from console_login_attempts
  where ip = p_ip and not ok and created_at > now() - v_window;

  if v_ip_fails >= v_per_ip then
    return query select true, greatest(1,
      ceil(extract(epoch from (v_oldest + v_window - now())) / 60)::int);
    return;
  end if;

  select count(*), min(created_at) into v_all_fails, v_oldest
  from console_login_attempts
  where not ok and created_at > now() - v_window;

  if v_all_fails >= v_global then
    return query select true, greatest(1,
      ceil(extract(epoch from (v_oldest + v_window - now())) / 60)::int);
    return;
  end if;

  return query select false, 0;
end;
$$;

-- ── Pencatat hasil — dipanggil SESUDAH password diperiksa ─────────────────────
--
-- Sukses menghapus kegagalan IP itu: operator yang salah ketik dua kali lalu benar tidak boleh
-- membawa sisa hitungan itu ke sesi berikutnya.
create or replace function console_login_record(p_ip text, p_ok boolean)
returns void
language plpgsql
volatile
security definer
set search_path = public, pg_temp
as $$
begin
  insert into console_login_attempts (ip, ok) values (p_ip, p_ok);
  if p_ok then
    delete from console_login_attempts where ip = p_ip and not ok;
  end if;
end;
$$;

-- Bersih-bersih; jadwalkan lewat pg_cron kalau sudah tersedia. Baris lama tidak berbahaya,
-- tapi tabel percobaan login yang tumbuh selamanya adalah tabel yang akhirnya dilupakan.
create or replace function purge_old_console_attempts()
returns void language sql
security definer
set search_path = public, pg_temp
as $$
  delete from console_login_attempts where created_at < now() - interval '7 days';
$$;

-- Keduanya hanya untuk service role. Fungsi yang boleh dipanggil siapa saja adalah fungsi yang
-- bisa dipakai memetakan kapan console terkunci — dan itu informasi yang tidak perlu dibagi.
revoke execute on function console_login_locked(text)  from public, anon, authenticated;
revoke execute on function console_login_record(text, boolean) from public, anon, authenticated;
revoke execute on function purge_old_console_attempts() from public, anon, authenticated;
