-- Nummi — menambah anak: satu transaksi, atau tidak terjadi apa pun.
--
-- Menambah anak sebenarnya EMPAT penulisan: `children`, wallet awal, `money_rules`, dan
-- `child_economy`. Ketiga yang terakhir bukan "nanti diisi" — mereka bagian dari apa artinya
-- seorang anak ada di sistem ini:
--
--   tanpa wallet awal   → anak tidak bisa menerima uang sama sekali
--   tanpa money_rules   → layar Sort anak kosong, auto-split tidak punya tujuan
--   tanpa child_economy → layar Me pecah
--
-- Dikerjakan lewat server action satu per satu, kegagalan di langkah ketiga meninggalkan anak
-- setengah jadi yang tidak bisa dipakai dan tidak bisa dihapus (ledger append-only bikin
-- pembersihan mustahil begitu ada baris pertama). Karena itu satu fungsi, satu transaksi.
--
-- Alasan kedua yang sama pentingnya: **PIN tidak boleh di-hash di sisi aplikasi.** Hash-nya
-- dibuat pgcrypto di sini, sumber yang sama dengan seed dan dengan verifikasi di 0006/0007.
-- Kalau app yang meng-hash, muncul kemungkinan dua algoritma untuk satu PIN.
--
-- Yang SENGAJA tidak ada di sini: daftar nama wallet awal. Ia datang sebagai parameter dari
-- `STARTER_WALLETS` di packages/core — kalau disalin ke SQL, ia jadi rumah kedua untuk aturan
-- yang sama, persis yang dihindari sejak 0009.

create or replace function create_child(
  p_family_id   uuid,
  p_name        text,
  p_birth_month int,
  p_birth_year  int,
  p_tier        tier,
  p_pin         text,
  p_wallets     jsonb   -- [{"name":"Unsorted","category":"unsorted","kind":"unsorted"}, …]
)
returns uuid
language plpgsql
security definer
-- `extensions` wajib: crypt() & gen_salt() milik pgcrypto, yang tidak dipasang di `public`.
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

  -- Rasio memakai default kolom (40/40/20 kanonik). Tujuan diselesaikan DI SINI karena id
  -- wallet-nya baru lahir sedetik lalu — mencocokkannya lewat `kind`, tidak pernah lewat nama.
  insert into money_rules (child_id, mode, auto_split_enabled, destinations)
  values (
    v_child,
    -- Strict DEFAULT MATI (ADR-0005). Riset literasi finansial memperingatkan bahaya
    -- mencabut pengambilan keputusan nyata dari anak.
    'flexible',
    true,
    jsonb_strip_nulls(jsonb_build_object(
      'spend', (select id::text from wallets where child_id = v_child and kind = 'envelope'     limit 1),
      'save',  (select id::text from wallets where child_id = v_child and kind = 'free_savings' limit 1),
      'give',  (select id::text from wallets where child_id = v_child and kind = 'give_pool'    limit 1)
    ))
  );

  insert into child_economy (child_id) values (v_child);

  return v_child;
end;
$$;

-- Hanya service role. Fungsi ini membuat anak dan menetapkan PIN-nya — tidak ada peran
-- ber-RLS yang boleh memanggilnya, sama seperti verify_child_pin (0006) dan
-- find_child_by_pin (0007). Ortu memanggilnya lewat server action, setelah identitasnya
-- terbukti dari token.
revoke execute on function create_child(uuid, text, int, int, tier, text, jsonb)
  from public, anon, authenticated;
grant execute on function create_child(uuid, text, int, int, tier, text, jsonb)
  to service_role;
