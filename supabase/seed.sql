-- Nummi — seed kanonik untuk data uji.
--
-- Cerminan SQL dari `packages/core/src/seed.ts`. Kalau kedua sisi menghasilkan angka
-- yang sama, model datamu terbukti benar di dua tempat yang saling independen —
-- dan ITU tujuan sebenarnya berkas ini, bukan sekadar mengisi tabel.
--
-- Angka kanonik (nummi-handoff.md): total Arthur = Rp484.711.
--
-- Cara pakai: tempel seluruh berkas ini ke SQL Editor Supabase, jalankan.
-- Aman diulang: kalau family_code-nya sudah ada, seluruh blok dilewati.
-- Tidak butuh dependency apa pun — hash PIN memakai pgcrypto (sudah aktif di 0001_init.sql).
--
-- CATATAN: jalankan SETELAH 0001 → 0002 → 0003.

do $$
declare
  -- ── yang boleh kamu ubah ────────────────────────────────────────────────────
  v_family_code text := 'NUMMI1';       -- pendek & mudah diketik anak; dibandingkan huruf besar
  v_child_pin   text := '135790';       -- GANTI sebelum dipakai keluarga sungguhan
  -- ⚠️ Panjang PIN masih kontradiktif di repo: skema bilang 4 digit (0001_init.sql:42),
  --    Edge Function bilang 4–6 (index.ts:11), backlog bilang 6. Belum diputuskan.
  -- ────────────────────────────────────────────────────────────────────────────

  v_family  uuid;
  v_child   uuid;
  w_unsorted uuid; w_snacks uuid; w_transport uuid; w_games uuid;
  w_bmx uuid; w_headphones uuid; w_free uuid; w_give uuid;
  w_td uuid; w_gold uuid; w_usd uuid;
  v_total bigint;
begin
  if exists (select 1 from families where family_code = v_family_code) then
    raise notice 'Seed dilewati: family_code % sudah ada.', v_family_code;
    return;
  end if;

  -- ── keluarga & anak ─────────────────────────────────────────────────────────
  -- Ortu SENGAJA tidak dibuat di sini: `parents.id` mereferensi auth.users, jadi ortu
  -- harus mendaftar lewat Supabase Auth dulu. Perintah penautannya ada di bawah berkas ini.
  insert into families (name, family_code)
  values ('Keluarga Arthur', v_family_code)
  returning id into v_family;

  insert into children (family_id, name, birth_month, birth_year, tier, pin_hash)
  values (v_family, 'Arthur', 5, 2015, 'middle', crypt(v_child_pin, gen_salt('bf', 10)))
  returning id into v_child;

  -- ── wallet (Model A: setiap rupiah di tepat satu wallet) ────────────────────
  insert into wallets (child_id, name, category, kind) values (v_child, 'Unsorted', 'unsorted', 'unsorted') returning id into w_unsorted;
  insert into wallets (child_id, name, category, kind) values (v_child, 'Snacks', 'spend', 'envelope') returning id into w_snacks;
  insert into wallets (child_id, name, category, kind) values (v_child, 'Transport', 'spend', 'envelope') returning id into w_transport;
  insert into wallets (child_id, name, category, kind) values (v_child, 'Games', 'spend', 'envelope') returning id into w_games;

  insert into wallets (child_id, name, category, kind, target_amount) values (v_child, 'BMX Bike', 'save', 'dream', 300000) returning id into w_bmx;
  insert into wallets (child_id, name, category, kind, target_amount) values (v_child, 'Headphones', 'save', 'dream', 100000) returning id into w_headphones;
  insert into wallets (child_id, name, category, kind) values (v_child, 'Free savings', 'save', 'free_savings') returning id into w_free;

  insert into wallets (child_id, name, category, kind) values (v_child, 'Give', 'give', 'give_pool') returning id into w_give;

  insert into wallets (child_id, name, category, kind) values (v_child, 'Time Deposit', 'grow', 'instrument') returning id into w_td;
  insert into wallets (child_id, name, category, kind) values (v_child, 'Gold', 'grow', 'instrument') returning id into w_gold;
  insert into wallets (child_id, name, category, kind) values (v_child, 'US Dollar', 'grow', 'instrument') returning id into w_usd;

  -- ── ledger (append-only, ADR-0014) ──────────────────────────────────────────
  -- Uang masuk = from null. Perpindahan internal = satu baris ber-from DAN to,
  -- sehingga I1 benar secara konstruksi, bukan dijaga belakangan.
  insert into ledger_entries (child_id, from_wallet_id, to_wallet_id, amount, reason) values
    (v_child, null,       w_unsorted,   486000, 'allowance'),
    (v_child, w_unsorted, w_snacks,      45000, 'sort'),
    (v_child, w_unsorted, w_transport,   30000, 'sort'),
    (v_child, w_unsorted, w_games,       20000, 'sort'),
    (v_child, w_unsorted, w_bmx,        150000, 'sort'),
    (v_child, w_unsorted, w_headphones,  30000, 'sort'),
    (v_child, w_unsorted, w_free,        60000, 'sort'),
    (v_child, w_unsorted, w_give,        40000, 'sort'),
    (v_child, w_unsorted, w_td,          30000, 'grow_in'),
    (v_child, w_unsorted, w_gold,        21000, 'grow_in'),
    (v_child, w_unsorted, w_usd,         10000, 'grow_in'),
    -- pergerakan nilai instrumen: mengikuti harga & bunga, bukan transaksi anak (ADR-0003)
    (v_child, null,       w_td,             750, 'harvest'),
    (v_child, w_gold,     null,            1860, 'harvest'),
    (v_child, w_usd,      null,             179, 'harvest');

  -- ── request pending: cash out Rp25.000 dari Snacks, dengan alasan tulisan anak ──
  insert into requests (child_id, kind, amount, source_wallet_id, reason, status, fulfilment)
  values (v_child, 'cash_out', 25000, w_snacks, 'Mau beli roti di kantin sama Fikri', 'needs_ok', 'todo');

  -- ── aturan uang: 40/40/20, Strict DEFAULT MATI (ADR-0005) ───────────────────
  insert into money_rules (child_id, mode, auto_split_enabled, ratios, destinations)
  values (
    v_child, 'flexible', true,
    '{"spend":40,"save":40,"give":20}'::jsonb,
    jsonb_build_object('spend', w_snacks::text, 'save', w_free::text, 'give', w_give::text)
  );

  -- ── ekonomi ⭐/💎 (ADR-0004: lifetime terpisah dari saldo) ───────────────────
  insert into child_economy (child_id, stars_balance, stars_lifetime, gems)
  values (v_child, 120, 120, 12);

  -- ── verifikasi langsung: harus 484711, kalau tidak seed ini dibatalkan ───────
  select total into v_total from invariant_check where child_id = v_child;

  if v_total is distinct from 484711 then
    raise exception 'Seed GAGAL rekonsiliasi: total % != 484711 kanonik. Dibatalkan.', v_total;
  end if;

  raise notice 'Seed OK. Keluarga %, anak Arthur %, total Rp484.711 cocok dengan packages/core.', v_family_code, v_child;
end $$;

-- ── Hasil: bandingkan dengan console (@nummi/core) ────────────────────────────
select * from invariant_check;

-- Harus KOSONG. Ada isi = insiden P0.
select * from ledger_orphans;

-- Harus kosong untuk seed ini (request masih needs_ok, belum approved).
select * from promise_debt;


-- ─────────────────────────────────────────────────────────────────────────────
-- MENAUTKAN ORTU (jalankan setelah ortu mendaftar lewat Supabase Auth)
--
-- `parents.id` mereferensi auth.users(id), jadi akun Auth harus ada lebih dulu.
-- Ganti alamat emailnya, lalu jalankan:
--
--   insert into parents (id, family_id, display_name, is_primary)
--   select u.id, f.id, 'Ayah', true
--   from auth.users u, families f
--   where u.email = 'ganti@emailmu.com' and f.family_code = 'NUMMI1'
--   on conflict (id) do nothing;
-- ─────────────────────────────────────────────────────────────────────────────
