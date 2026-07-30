-- Nummi — Settings berhenti hidup di konstanta kode.
--
-- Sebelum ini, jadwal uang saku, bunga bank, dan harga harian semuanya dibaca dari `SEED_*` di
-- `packages/core`. Yang paling berbahaya bukan "belum persisten", melainkan ini:
-- `apps/parent/lib/data.ts` menyuntik **objek `SEED_ALLOWANCE` yang sama** di dalam
-- `children.map()`. Artinya setiap anak baru mewarisi jadwal uang saku keluarga Arthur —
-- Rp50.000 mingguan tiap Senin — tanpa ada yang pernah memutuskannya. Bug yang menunggu
-- keluarga kedua, dan keluarga kedua sudah ada (Sita, 30 Juli).
--
-- ── Kenapa TIGA tabel dan bukan satu tabel "settings" ────────────────────────
-- Karena pemiliknya berbeda, bukan karena kerapian:
--
--   allowance_schedules  ditulis ORTU,   per anak
--   bank_rates           ditulis ORTU,   per keluarga  (ortu = bank, ADR-0003)
--   daily_prices         ditulis MESIN,  global        (feed, backlog T)
--
-- Menggabungkannya akan mencampur baris yang ditulis manusia dengan baris yang ditulis
-- scheduler — dan itu yang membuat audit trail harga mustahil, padahal backlog T menuntutnya.

-- ── Uang saku ─────────────────────────────────────────────────────────────────

create type allowance_frequency as enum ('weekly', 'biweekly', 'monthly');

create table allowance_schedules (
  id         uuid primary key default gen_random_uuid(),
  child_id   uuid not null references children(id) on delete cascade,
  enabled    boolean not null default false,
  amount     bigint not null default 0 check (amount >= 0),
  frequency  allowance_frequency not null default 'weekly',
  -- weekly & biweekly: 0–6 (Minggu–Sabtu). monthly: 1–28.
  day        smallint not null default 1,

  /*
   * ANCHOR — kolom yang menutup cacat yang sudah tercatat di handoff §232:
   * "opsi 2-mingguan di mockup disederhanakan — tanpa anchor tanggal mulai."
   *
   * Tanpa anchor, "tiap dua minggu hari Senin" tidak bisa dibedakan dari "tiap Senin":
   * keduanya menghasilkan daftar tanggal yang sama. `nextAllowanceDates()` di core perlu ikut
   * menerimanya.
   */
  anchor_date date,

  updated_at timestamptz not null default now(),

  /*
   * SATU jadwal per anak — untuk sekarang.
   *
   * Sengaja unique constraint, BUKAN `child_id` sebagai primary key: paket Free memberi
   * "allowance 1 jadwal" sementara Pro tak terbatas (handoff §341/§347). Kalau nanti Pro
   * mengizinkan beberapa jadwal, constraint ini tinggal dilepas — tabelnya tidak perlu
   * ditulis ulang, dan baris yang sudah ada tidak perlu dipindah.
   */
  constraint one_schedule_per_child unique (child_id),

  -- Rentang `day` tergantung frekuensinya. 29–31 tidak ada di setiap bulan, dan "uang sakumu
  -- turun lebih kecil karena Februari pendek" tidak bisa dijelaskan ke anak
  -- (MONTHLY_MAX_DAY = 28 di packages/core/src/settings.ts).
  constraint day_matches_frequency check (
    (frequency = 'monthly' and day between 1 and 28)
    or (frequency in ('weekly', 'biweekly') and day between 0 and 6)
  ),

  -- Biweekly tanpa anchor adalah biweekly yang tidak bisa dihitung. Weekly & monthly tidak
  -- membutuhkannya, jadi tidak dipaksa punya.
  constraint biweekly_needs_anchor check (frequency <> 'biweekly' or anchor_date is not null)
);

create index allowance_by_child on allowance_schedules (child_id);

-- ── Bunga bank yang ditetapkan ortu ──────────────────────────────────────────

create table bank_rates (
  family_id  uuid primary key references families(id) on delete cascade,
  -- persen, bukan pecahan: 1.5 berarti 1,5%. Sama dengan `Prices['bankRates']` di core.
  m3         numeric(5,2) not null default 1.5,
  m6         numeric(5,2) not null default 2.5,
  m12        numeric(5,2) not null default 4.0,
  updated_at timestamptz not null default now(),

  -- Pagar salah ketik saja (MAX_RATE_PCT = 100), bukan aturan produk.
  constraint rates_sane check (
    m3 between 0 and 100 and m6 between 0 and 100 and m12 between 0 and 100
  )
);

/*
 * YANG SENGAJA TIDAK ADA DI SINI: constraint m3 <= m6 <= m12.
 *
 * `ratesRewardPatience()` (packages/core/src/settings.ts:122) memang cuma PETUNJUK, dan
 * komentarnya menyebut alasannya: "Ortu berhak menetapkan rate apa pun — dia bank-nya
 * (ADR-0003)." Ortu yang memberi bunga lebih besar untuk tenor pendek sedang membuat keputusan
 * aneh, bukan keputusan ilegal. App menunjukkan bahwa itu terbalik; app tidak melarangnya.
 */

-- ── Harga harian (feed) ──────────────────────────────────────────────────────

create table daily_prices (
  /*
   * Tanggal sebagai primary key = audit trail gratis, dan backlog T menuntutnya dengan
   * kata-kata sendiri: "simpan harga historis — kalau harga berubah, nilai lama anak harus
   * tetap bisa dijelaskan."
   *
   * Tampilan membaca baris terbaru; feed nanti cuma menambah satu baris per hari.
   */
  price_date              date primary key,

  gold_sell_per_gram      bigint not null check (gold_sell_per_gram > 0),
  gold_buyback_per_gram   bigint not null check (gold_buyback_per_gram > 0),

  -- { "USD": 16000, "SGD": 12000, "EUR": 17000 }
  fx_mid                  jsonb not null,
  -- pecahan, bukan persen: 0.01 = 1%
  fx_spread               numeric(6,4) not null default 0.01 check (fx_spread >= 0),

  /*
   * Dari mana harga ini datang. 'dummy' sekarang, 'antam' / 'bi_jisdor' saat feed hidup.
   *
   * Ini yang menjawab syarat backlog T: "Kegagalan fetch: jangan diam-diam pakai harga basi
   * tanpa keterangan." Tanpa kolom ini, harga dummy dan harga sungguhan tidak bisa dibedakan
   * setelah beberapa bulan.
   */
  source                  text not null default 'dummy',

  created_at              timestamptz not null default now(),

  -- Buyback selalu di bawah harga jual — spread ~9% itu BAGIAN DARI PELAJARAN (ADR-0003),
  -- bukan detail yang boleh disederhanakan jadi satu harga.
  constraint buyback_below_sell check (gold_buyback_per_gram <= gold_sell_per_gram)
);

-- ── RLS ──────────────────────────────────────────────────────────────────────
-- Pola sama dengan 0009: policy SELECT saja. Penulisan lewat server action ber-service-role,
-- jadi ketiadaan policy INSERT/UPDATE-lah yang menegakkannya.

alter table allowance_schedules enable row level security;
alter table bank_rates          enable row level security;
alter table daily_prices        enable row level security;

-- Anak BOLEH melihat jadwal uang sakunya. Kapan uang saku berikutnya datang bukan rahasia —
-- justru itu bahan pelajaran merencanakan.
create policy allowance_read on allowance_schedules for select
  using (can_see_child(child_id));

create policy rates_family_read on bank_rates for select
  using (family_id = auth_family_id());

-- Harga tidak dimiliki keluarga mana pun: siapa pun yang sudah masuk boleh membacanya.
create policy prices_read on daily_prices for select
  using (auth.role() = 'authenticated');

-- ── Data dummy ───────────────────────────────────────────────────────────────
-- Angkanya dikunci di handoff §63, dan sama dengan SEED_PRICES di packages/core.

insert into daily_prices (
  price_date, gold_sell_per_gram, gold_buyback_per_gram, fx_mid, fx_spread, source
) values (
  '2026-07-28', 1450000, 1320000,
  '{"USD": 16000, "SGD": 12000, "EUR": 17000}'::jsonb, 0.01, 'dummy'
) on conflict (price_date) do nothing;

-- Bunga bank untuk keluarga yang sudah ada (default kanonik 1,5 / 2,5 / 4,0).
insert into bank_rates (family_id) select id from families
on conflict (family_id) do nothing;

/*
 * Jadwal uang saku untuk anak yang sudah ada.
 *
 * Arthur mendapat angka kanonik seed (Rp50.000 mingguan, Senin) karena itu memang jadwal yang
 * sudah dipakai semua dokumen dan test. Anak lain mendapat baris NONAKTIF — bukan warisan
 * jadwal Arthur. Itu justru bug yang ditutup migrasi ini.
 */
insert into allowance_schedules (child_id, enabled, amount, frequency, day)
select c.id,
       c.name = 'Arthur',
       case when c.name = 'Arthur' then 50000 else 0 end,
       'weekly',
       1
from children c
on conflict (child_id) do nothing;

-- ── create_child ikut tahu soal jadwal ───────────────────────────────────────
-- Anak baru lahir dengan baris jadwal NONAKTIF. Alasannya sama dengan money_rules dan
-- child_economy di 0012: kalau barisnya tidak ada, layar Settings ortu tidak punya apa pun
-- untuk ditampilkan — dan "nanti diisi" adalah cara bug itu lahir.
--
-- Nonaktif, bukan aktif: menyalakan uang saku adalah keputusan ortu, bukan default sistem.

create or replace function create_child(
  p_family_id   uuid,
  p_name        text,
  p_birth_month int,
  p_birth_year  int,
  p_tier        tier,
  p_pin         text,
  p_wallets     jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public, extensions, pg_temp
as $$
declare
  v_child uuid;
begin
  insert into children (family_id, name, birth_month, birth_year, tier, pin_hash)
  values (p_family_id, p_name, p_birth_month, p_birth_year, p_tier,
          crypt(p_pin, gen_salt('bf', 10)))
  returning id into v_child;

  insert into wallets (child_id, name, category, kind)
  select v_child, w->>'name', (w->>'category')::pocket, (w->>'kind')::wallet_kind
  from jsonb_array_elements(p_wallets) as w;

  insert into money_rules (child_id, mode, auto_split_enabled, destinations)
  values (
    v_child, 'flexible', true,
    jsonb_strip_nulls(jsonb_build_object(
      'spend', (select id::text from wallets where child_id = v_child and kind = 'envelope'     limit 1),
      'save',  (select id::text from wallets where child_id = v_child and kind = 'free_savings' limit 1),
      'give',  (select id::text from wallets where child_id = v_child and kind = 'give_pool'    limit 1)
    ))
  );

  insert into child_economy (child_id) values (v_child);

  -- BARU di 0013.
  insert into allowance_schedules (child_id) values (v_child);

  -- Bunga bank milik KELUARGA, jadi cuma dibuat kalau belum ada — anak kedua tidak boleh
  -- menimpa rate yang sudah ditetapkan ortu untuk anak pertama.
  insert into bank_rates (family_id) values (p_family_id)
  on conflict (family_id) do nothing;

  return v_child;
end;
$$;

revoke execute on function create_child(uuid, text, int, int, tier, text, jsonb)
  from public, anon, authenticated;
grant execute on function create_child(uuid, text, int, int, tier, text, jsonb)
  to service_role;
