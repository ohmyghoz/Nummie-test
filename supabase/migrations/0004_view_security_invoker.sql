-- Nummi — menutup dua lubang yang lahir dari cara Postgres, bukan dari cara kita menulis aturan.
--
-- 0002_rls.sql sudah menulis policy yang benar. Yang salah adalah ASUMSI di dua tempat:
--
--   (1) View mewarisi RLS tabel di bawahnya  → TIDAK. Default view = hak PEMILIK view.
--   (2) Fungsi helper aman membaca tabel ber-RLS → TIDAK, kalau tabel itu policy-nya
--       memanggil fungsi tersebut. Itu lingkaran.
--
-- Keduanya tidak terlihat selama tabel kosong dan belum ada klien. Justru karena itu
-- berkas ini ditulis SEBELUM app disambungkan, bukan sesudah.

-- ── (1) View: hak pemanggil, bukan hak pemilik ────────────────────────────────
--
-- `wallet_balances` adalah SATU-SATUNYA sumber saldo (0001_init.sql:104). Tanpa baris di
-- bawah ini, JWT keluarga mana pun yang menembak /rest/v1/wallet_balances membaca saldo
-- SELURUH keluarga — RLS di `wallets` & `ledger_entries` dilewati begitu saja lewat view.
--
-- Konsekuensi yang disengaja untuk tiga view pemeriksa: ortu hanya melihat anaknya
-- sendiri. Console memakai service role, jadi tetap melihat lintas keluarga.

alter view wallet_balances set (security_invoker = on);
alter view invariant_check set (security_invoker = on);
alter view ledger_orphans  set (security_invoker = on);
alter view promise_debt    set (security_invoker = on);

-- ── (2) Helper identitas: definer, supaya lingkarannya putus ──────────────────
--
-- Terbukti, bukan dugaan: `select count(*) from parents` sebagai role `authenticated`
-- mengembalikan `54001 stack depth limit exceeded`, dengan `auth_family_id` berulang
-- ratusan kali di CONTEXT. Rantainya:
--
--   parents_read  →  auth_family_id()  →  select … from parents  →  parents_read  →  ⟳
--
-- Artinya SELURUH sisi ortu mati, bukan cuma tabel `parents`: `children_read`,
-- `wallets_read`, `ledger_read`, `requests_read` — semuanya lewat auth_family_id().
--
-- SECURITY DEFINER memutus lingkaran karena pembacaan DI DALAM fungsi tidak lagi
-- memicu policy. Ini tidak melonggarkan apa pun: kedua fungsi hanya menjawab
-- "siapa pemanggilnya", selalu dipagari `auth.uid()` atau claim JWT-nya sendiri.
--
-- search_path dikunci karena SECURITY DEFINER tanpa itu bisa dibajak lewat schema
-- bayangan milik pemanggil (advisor 0011).

create or replace function auth_family_id()
returns uuid
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select coalesce(
    nullif(current_setting('request.jwt.claims', true)::jsonb ->> 'family_id', '')::uuid,
    (select family_id from parents where id = auth.uid())
  );
$$;

create or replace function can_see_child(p_child_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select case auth_role_kind()
    when 'child'  then p_child_id = auth_child_id()
    else exists (
      select 1 from children c
      where c.id = p_child_id and c.family_id = auth_family_id()
    )
  end;
$$;

-- ── Sisanya: cukup search_path-nya dikunci ────────────────────────────────────
-- Keempat ini SECURITY INVOKER dan memang harus tetap begitu — is_pro() dibaca ortu
-- untuk keluarganya sendiri, dan RLS `entitlements_read` sudah menjaganya.

alter function auth_role_kind()             set search_path = public, pg_temp;
alter function auth_child_id()              set search_path = public, pg_temp;
alter function is_pro(uuid)                 set search_path = public, pg_temp;
alter function is_school_family(uuid)       set search_path = public, pg_temp;
alter function reject_ledger_mutation()     set search_path = public, pg_temp;
alter function purge_old_login_attempts()   set search_path = public, pg_temp;

-- CATATAN: `public.rls_auto_enable()` juga muncul di advisor. Itu BUKAN milik kita —
-- event trigger bawaan platform Supabase yang menyalakan RLS otomatis di tabel baru.
-- Jangan diubah dari repo ini.
