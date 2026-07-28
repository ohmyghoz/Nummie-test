-- Nummi — skema awal
-- Keputusan yang hidup di berkas ini:
--   ADR-0001 Model A: setiap rupiah di satu wallet, kategori = label
--   ADR-0002 approve != fulfil: DUA kolom, bukan satu enum
--   ADR-0007 dream/Give/Grow terlindungi dari Take money
--   ADR-0014 ledger append-only, saldo diturunkan
--
-- Region yang direncanakan: Singapore (latensi Indonesia).

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------- keluarga & orang

create table families (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  -- dipakai anak untuk login bersama PIN (ADR-0012). Pendek, mudah diketik anak.
  family_code  text not null unique,
  created_at   timestamptz not null default now()
);

create table parents (
  id          uuid primary key references auth.users(id) on delete cascade,
  family_id   uuid not null references families(id) on delete cascade,
  -- Free = 1 akun "Parent" anonim. Pro = 2 akun personal (jual identitas, bukan akses).
  display_name text,
  is_primary  boolean not null default false,
  created_at  timestamptz not null default now()
);

create type tier as enum ('little', 'middle', 'teen');

create table children (
  id           uuid primary key default gen_random_uuid(),
  family_id    uuid not null references families(id) on delete cascade,
  name         text not null,
  -- privasi: bulan + tahun saja, tanpa tanggal presisi
  birth_month  smallint not null check (birth_month between 1 and 12),
  birth_year   smallint not null,
  tier         tier not null,
  pin_hash     text not null,
  -- rate limiting PIN wajib: 4 digit = 10.000 kombinasi (ADR-0012)
  failed_pin_attempts smallint not null default 0,
  locked_until timestamptz,
  created_at   timestamptz not null default now()
);

-- ---------------------------------------------------------------- wallet & ledger

create type pocket   as enum ('unsorted', 'spend', 'save', 'give', 'grow');
create type wallet_kind as enum
  ('unsorted', 'envelope', 'dream', 'free_savings', 'give_pool', 'instrument');

create table wallets (
  id         uuid primary key default gen_random_uuid(),
  child_id   uuid not null references children(id) on delete cascade,
  name       text not null,
  category   pocket not null,
  kind       wallet_kind not null,
  target_amount bigint check (target_amount is null or target_amount > 0),
  archived_at timestamptz,
  created_at timestamptz not null default now(),

  -- Model A: hanya dream yang boleh punya target
  constraint target_only_on_dream check (kind = 'dream' or target_amount is null),
  -- kind harus konsisten dengan kategorinya
  constraint kind_matches_category check (
    (category = 'unsorted' and kind = 'unsorted')
    or (category = 'spend' and kind = 'envelope')
    or (category = 'save'  and kind in ('dream', 'free_savings'))
    or (category = 'give'  and kind = 'give_pool')
    or (category = 'grow'  and kind = 'instrument')
  )
);

-- tepat satu wallet Unsorted per anak
create unique index one_unsorted_per_child on wallets (child_id) where kind = 'unsorted';

create type ledger_reason as enum (
  'allowance', 'send_money', 'take_money', 'reward_money',
  'sort', 'move', 'cash_out', 'grow_in', 'harvest', 'give_away'
);

-- APPEND-ONLY (ADR-0014). UPDATE & DELETE diblokir oleh trigger di 0002_rls.sql.
create table ledger_entries (
  id             uuid primary key default gen_random_uuid(),
  child_id       uuid not null references children(id) on delete cascade,
  from_wallet_id uuid references wallets(id),
  to_wallet_id   uuid references wallets(id),
  amount         bigint not null check (amount > 0),
  reason         ledger_reason not null,
  request_id     uuid,
  created_by     uuid,
  created_at     timestamptz not null default now(),

  -- baris tanpa asal DAN tanpa tujuan tidak punya makna
  constraint has_endpoint check (from_wallet_id is not null or to_wallet_id is not null),
  constraint not_self check (from_wallet_id is distinct from to_wallet_id)
);

create index ledger_by_child on ledger_entries (child_id, created_at desc);

-- Saldo TIDAK PERNAH disimpan sebagai kolom. Ini satu-satunya sumbernya.
create view wallet_balances as
select
  w.id as wallet_id,
  w.child_id,
  w.category,
  coalesce(sum(case when l.to_wallet_id   = w.id then  l.amount else 0 end), 0)
  - coalesce(sum(case when l.from_wallet_id = w.id then l.amount else 0 end), 0) as balance
from wallets w
left join ledger_entries l on l.to_wallet_id = w.id or l.from_wallet_id = w.id
group by w.id, w.child_id, w.category;

-- ---------------------------------------------------------------- request & approval

create type request_kind   as enum ('cash_out','give_away','prize','mission_claim','grow_in','harvest');
create type request_status as enum ('needs_ok','approved','declined','talk_about_it');
-- DUA KOLOM, BUKAN SATU ENUM (ADR-0002). Menggabungkannya membunuh "approve != fulfil".
create type fulfilment     as enum ('not_applicable','todo','done');

create table requests (
  id              uuid primary key default gen_random_uuid(),
  child_id        uuid not null references children(id) on delete cascade,
  kind            request_kind not null,
  amount          bigint check (amount is null or amount > 0),
  source_wallet_id uuid references wallets(id),
  -- wajib untuk cash_out, OPSIONAL untuk give_away: jangan pajaki kemurahan hati (ADR-0006)
  reason          text,
  status          request_status not null default 'needs_ok',
  fulfilment      fulfilment not null default 'not_applicable',
  -- Give tidak bisa ditutup tanpa cerita (ADR-0006)
  fulfilment_story text,
  decided_by      uuid references parents(id),
  decided_at      timestamptz,
  created_at      timestamptz not null default now(),

  constraint cash_out_needs_reason check (kind <> 'cash_out' or reason is not null),
  constraint give_needs_story_when_done check (
    not (kind = 'give_away' and fulfilment = 'done' and fulfilment_story is null)
  )
);

-- ---------------------------------------------------------------- aturan uang

create type rule_mode as enum ('flexible','strict');

create table money_rules (
  child_id         uuid primary key references children(id) on delete cascade,
  -- Strict DEFAULT MATI (ADR-0005)
  mode             rule_mode not null default 'flexible',
  auto_split_enabled boolean not null default true,
  -- {"spend":40,"save":40,"give":20} — default kanonik 40/40/20
  ratios           jsonb not null default '{"spend":40,"save":40,"give":20}'::jsonb,
  destinations     jsonb not null default '{}'::jsonb,
  updated_at       timestamptz not null default now()
);

-- ---------------------------------------------------------------- ekonomi bintang & permata

-- DUA angka bintang, bukan satu (ADR-0004): lifetime untuk gerbang, saldo untuk belanja avatar.
create table child_economy (
  child_id      uuid primary key references children(id) on delete cascade,
  stars_balance integer not null default 0 check (stars_balance >= 0),
  stars_lifetime integer not null default 0 check (stars_lifetime >= 0),
  gems          integer not null default 0 check (gems >= 0),
  constraint lifetime_never_below_balance check (stars_lifetime >= stars_balance)
);

-- ---------------------------------------------------------------- entitlement (ADR-0010)

create table entitlements (
  id         uuid primary key default gen_random_uuid(),
  family_id  uuid not null references families(id) on delete cascade,
  source     text not null check (source in ('iap','school','grant')),
  active     boolean not null default true,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

create table iap_receipts (
  id          uuid primary key default gen_random_uuid(),
  family_id   uuid not null references families(id) on delete cascade,
  platform    text not null check (platform in ('apple','google')),
  raw_receipt text not null,
  verified_at timestamptz,
  created_at  timestamptz not null default now()
);

create table schools (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  school_code text not null unique,
  seats      integer not null default 0,
  created_at timestamptz not null default now()
);

create table school_members (
  school_id uuid not null references schools(id) on delete cascade,
  family_id uuid not null references families(id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (school_id, family_id)
);

-- Satu-satunya resolver. Semua permukaan memanggil ini, tidak pernah membaca tabel langsung.
-- Konsekuensi UX terkunci: tombol upgrade TIDAK PERNAH tampil untuk pengguna sekolah,
-- jadi pemanggil juga perlu tahu sumbernya (lihat is_school_family di bawah).
create or replace function is_pro(p_family_id uuid) returns boolean
language sql stable as $$
  select exists (
    select 1 from entitlements e
    where e.family_id = p_family_id
      and e.active
      and (e.expires_at is null or e.expires_at > now())
  );
$$;

create or replace function is_school_family(p_family_id uuid) returns boolean
language sql stable as $$
  select exists (select 1 from school_members m where m.family_id = p_family_id);
$$;

-- ---------------------------------------------------------------- pemeriksa invarian (I1)

-- CATATAN PENTING.
-- Dengan saldo yang diturunkan dari ledger (ADR-0014), I1 tidak bisa lagi menyimpang
-- "by construction" — Total memang dijumlahkan dari kantong yang sama. Itu bukan kelemahan
-- pemeriksa ini, itu justru hasil yang kita kejar: invariant berubah dari sesuatu yang dijaga
-- menjadi sesuatu yang mustahil dilanggar.
--
-- Karena itu yang perlu diawasi bergeser ke hal lain, dan tiga hal inilah yang benar-benar
-- masih bisa gagal. Baris mana pun yang muncul di sini = INSIDEN P0. Jalankan sebagai cron harian.

create or replace view invariant_check as
select
  c.id   as child_id,
  c.name as child_name,
  coalesce(sum(b.balance) filter (where b.category = 'unsorted'), 0) as unsorted,
  coalesce(sum(b.balance) filter (where b.category = 'spend'), 0)    as spend,
  coalesce(sum(b.balance) filter (where b.category = 'save'), 0)     as save,
  coalesce(sum(b.balance) filter (where b.category = 'give'), 0)     as give,
  coalesce(sum(b.balance) filter (where b.category = 'grow'), 0)     as grow,
  coalesce(sum(b.balance), 0) as total,
  -- (1) saldo negatif: uang keluar dari kantong yang tidak memilikinya
  count(*) filter (where b.balance < 0) as negative_wallets
from children c
left join wallet_balances b on b.child_id = c.id
group by c.id, c.name;

-- (2) baris ledger yang menyeberang antar anak — uang bocor lintas keluarga
create or replace view ledger_orphans as
select l.id, l.child_id, l.from_wallet_id, l.to_wallet_id, l.created_at
from ledger_entries l
left join wallets wf on wf.id = l.from_wallet_id
left join wallets wt on wt.id = l.to_wallet_id
where (wf.id is not null and wf.child_id <> l.child_id)
   or (wt.id is not null and wt.child_id <> l.child_id);

-- (3) utang janji: sudah di-approve tapi belum benar-benar dilakukan ortu (ADR-0002).
--     Bukan bug — ini metrik kepercayaan utama console. Yang berbahaya adalah usianya.
create or replace view promise_debt as
select
  r.id, r.child_id, r.kind, r.amount, r.decided_at,
  extract(day from now() - r.decided_at)::int as days_outstanding
from requests r
where r.status = 'approved' and r.fulfilment = 'todo'
order by r.decided_at;
