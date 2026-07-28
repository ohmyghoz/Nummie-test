-- Percobaan login anak — bahan rate limiting (ADR-0012).
-- PIN 4 digit = 10.000 kombinasi. Tanpa tabel ini, PIN bukan pengaman, cuma formalitas.

create table child_login_attempts (
  id         bigserial primary key,
  child_id   uuid not null references children(id) on delete cascade,
  ip         text not null,
  created_at timestamptz not null default now()
);
create index on child_login_attempts (child_id, ip, created_at desc);

alter table child_login_attempts enable row level security;
-- Tanpa policy sama sekali: hanya service role (Edge Function) yang boleh menyentuhnya.

-- Bersih-bersih otomatis; jadwalkan lewat pg_cron kalau sudah tersedia.
create or replace function purge_old_login_attempts()
returns void language sql as $$
  delete from child_login_attempts where created_at < now() - interval '7 days';
$$;
