-- Nummi — Row Level Security
--
-- Prinsip: TIDAK ADA aturan akses yang hidup di sisi klien (backlog C-5).
-- Anak yang tahu inspect element tidak boleh bisa membuka apa pun milik ortu.
--
-- Dua jenis pengguna, dua sumber identitas:
--   ortu → auth.uid() (pengguna Supabase Auth sungguhan)
--   anak → claim di JWT yang diterbitkan Edge Function `child-login` (ADR-0012)

-- ── Helper ─────────────────────────────────────────────────────────────────────

create or replace function auth_role_kind()
returns text language sql stable as $$
  select coalesce(current_setting('request.jwt.claims', true)::jsonb ->> 'nummi_role', 'parent');
$$;

create or replace function auth_child_id()
returns uuid language sql stable as $$
  select nullif(current_setting('request.jwt.claims', true)::jsonb ->> 'child_id', '')::uuid;
$$;

create or replace function auth_family_id()
returns uuid language sql stable as $$
  select coalesce(
    nullif(current_setting('request.jwt.claims', true)::jsonb ->> 'family_id', '')::uuid,
    (select family_id from parents where id = auth.uid())
  );
$$;

-- Apakah pemanggil boleh melihat anak ini?
create or replace function can_see_child(p_child_id uuid)
returns boolean language sql stable as $$
  select case auth_role_kind()
    when 'child'  then p_child_id = auth_child_id()
    else exists (
      select 1 from children c
      where c.id = p_child_id and c.family_id = auth_family_id()
    )
  end;
$$;

-- ── Aktifkan RLS di semua tabel ────────────────────────────────────────────────

alter table families       enable row level security;
alter table parents        enable row level security;
alter table children       enable row level security;
alter table wallets        enable row level security;
alter table ledger_entries enable row level security;
alter table requests       enable row level security;
alter table money_rules    enable row level security;
alter table child_economy        enable row level security;
alter table entitlements   enable row level security;
alter table iap_receipts   enable row level security;
alter table schools        enable row level security;
alter table school_members enable row level security;

-- ── Keluarga & anggota ─────────────────────────────────────────────────────────

create policy family_read on families for select
  using (id = auth_family_id());

create policy parents_read on parents for select
  using (family_id = auth_family_id());

-- Anak TIDAK boleh melihat baris ortu — hanya nama tampilan, lewat view terpisah nanti.
create policy parents_read_child_blocked on parents as restrictive for select
  using (auth_role_kind() <> 'child');

create policy children_read on children for select
  using (family_id = auth_family_id() or id = auth_child_id());

create policy children_write on children for all
  using (auth_role_kind() = 'parent' and family_id = auth_family_id())
  with check (auth_role_kind() = 'parent' and family_id = auth_family_id());

-- ── Wallet ─────────────────────────────────────────────────────────────────────

create policy wallets_read on wallets for select
  using (can_see_child(child_id));

create policy wallets_write on wallets for all
  using (can_see_child(child_id))
  with check (can_see_child(child_id));

-- ── Ledger: APPEND-ONLY (ADR-0014) ─────────────────────────────────────────────
-- Perhatikan yang TIDAK ada di bawah ini: policy untuk update dan delete.
-- Ketiadaannya disengaja dan merupakan penegak utama ADR-0014.

create policy ledger_read on ledger_entries for select
  using (can_see_child(child_id));

create policy ledger_insert on ledger_entries for insert
  with check (can_see_child(child_id));

-- Sabuk pengaman kedua: bahkan peran dengan hak lebih tinggi pun ditolak.
create or replace function reject_ledger_mutation()
returns trigger language plpgsql as $$
begin
  raise exception 'ledger_entries bersifat append-only (ADR-0014). Pakai baris pembalik, jangan ubah sejarah.';
end;
$$;

create trigger no_ledger_update before update on ledger_entries
  for each row execute function reject_ledger_mutation();

create trigger no_ledger_delete before delete on ledger_entries
  for each row execute function reject_ledger_mutation();

-- ── Request ────────────────────────────────────────────────────────────────────

create policy requests_read on requests for select
  using (can_see_child(child_id));

-- Anak boleh mengajukan, tidak pernah boleh memutuskan.
create policy requests_child_insert on requests for insert
  with check (
    auth_role_kind() = 'child'
    and child_id = auth_child_id()
    and status = 'needs_ok'
    and decided_by is null
  );

create policy requests_parent_all on requests for all
  using (auth_role_kind() = 'parent' and can_see_child(child_id))
  with check (auth_role_kind() = 'parent' and can_see_child(child_id));

-- ── Aturan uang: anak membaca, ortu menulis ────────────────────────────────────
-- Anak HARUS bisa membaca — kalau tidak, mode Strict mustahil ditegakkan di sisi anak,
-- dan itu justru gap paling mahal di seluruh backlog.

create policy rules_read on money_rules for select
  using (can_see_child(child_id));

create policy rules_write on money_rules for all
  using (auth_role_kind() = 'parent' and can_see_child(child_id))
  with check (auth_role_kind() = 'parent' and can_see_child(child_id));

-- ── Ekonomi ────────────────────────────────────────────────────────────────────

create policy economy_read on child_economy for select
  using (can_see_child(child_id));

create policy economy_write on child_economy for all
  using (auth_role_kind() = 'parent' and can_see_child(child_id))
  with check (auth_role_kind() = 'parent' and can_see_child(child_id));

-- ── Entitlement: dibaca, tidak pernah ditulis dari klien ───────────────────────
-- Penulisan hanya lewat service role (verifikasi resi IAP / provisioning sekolah).

create policy entitlements_read on entitlements for select
  using (family_id = auth_family_id());

create policy school_members_read on school_members for select
  using (family_id = auth_family_id());

create policy schools_read on schools for select
  using (exists (select 1 from school_members m
                 where m.school_id = schools.id and m.family_id = auth_family_id()));

-- iap_receipts sengaja tanpa policy sama sekali: hanya service role yang boleh menyentuhnya.
