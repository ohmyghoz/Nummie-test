-- Nummi — Jobs & Prizes punya tabel, dan 💎 berhenti jadi penghitung tanpa riwayat.
--
-- ADR-0004 🔒 sudah mengunci hampir semuanya: dua mata uang (⭐ kurikulum → kosmetik in-app;
-- 💎 chores → hadiah dunia nyata), ⭐ dipecah lifetime/saldo, tiga gerbang, `family_contribution`
-- hanya 💎, hadiah hanya 💎, anak yang menandai selesai, dan penukaran hadiah masuk jalur To-do
-- karena ortu harus benar-benar memberikannya.
--
-- Yang tidak pernah ada: tempat menyimpannya. Builder di app ortu memvalidasi lewat core dan
-- layarnya berdiri sejak Fase 4 — tapi tombolnya tidak pernah menyimpan apa pun, dan sisi anak
-- belum punya layarnya sama sekali.

-- ── Job ───────────────────────────────────────────────────────────────────────

create type job_kind      as enum ('family_contribution', 'extra_work', 'achievement');
create type reward_kind   as enum ('gems', 'money');
create type job_frequency as enum ('once', 'weekly');

create table jobs (
  id          uuid primary key default gen_random_uuid(),
  child_id    uuid not null references children(id) on delete cascade,
  kind        job_kind not null,
  title       text not null,
  reward      reward_kind not null default 'gems',
  /** 💎 kalau reward gems, rupiah kalau money */
  amount      bigint not null check (amount > 0),

  /*
   * Frekuensi dibuat SEKARANG walau UI hanya menawarkan 'once'.
   *
   * Reset mingguan adalah scheduler (backlog T), dan definisinya masih terbuka: awal minggu
   * (Senin? hari anak daftar?), zona waktu, dan apa yang terjadi kalau anak tak buka app
   * berminggu-minggu — "jangan menumpuk klaim retroaktif". Kolomnya murah; migrasi belakangan
   * tidak.
   */
  frequency   job_frequency not null default 'once',

  archived_at timestamptz,
  created_by  uuid references parents(id),
  created_at  timestamptz not null default now(),

  -- ADR-0004: kontribusi keluarga → 💎 SAJA, opsi uang tidak muncul. Membayar anak untuk
  -- merapikan tempat tidurnya sendiri mengubah kewajiban jadi transaksi.
  constraint family_contribution_gems_only check (
    kind <> 'family_contribution' or reward = 'gems'
  )
);

create index jobs_by_child on jobs (child_id) where archived_at is null;

-- ── Hadiah ────────────────────────────────────────────────────────────────────

create table prizes (
  id          uuid primary key default gen_random_uuid(),
  child_id    uuid not null references children(id) on delete cascade,
  title       text not null,
  -- Hadiah SELALU dibeli dengan 💎, tidak pernah rupiah (ADR-0004). Karena itu tidak ada
  -- kolom `reward` di sini — pilihannya tidak pernah ada.
  gem_cost    integer not null check (gem_cost > 0),
  archived_at timestamptz,
  created_at  timestamptz not null default now()
);

create index prizes_by_child on prizes (child_id) where archived_at is null;

-- ── 💎 sebagai LEDGER, bukan penghitung ──────────────────────────────────────
--
-- `child_economy.gems` hari ini `integer` yang di-update naik-turun tanpa riwayat, sementara
-- uang append-only (ADR-0014). Untuk 💎 itu tidak cukup: ia ditukar jadi **hadiah dunia nyata**,
-- jadi "💎-ku ke mana?" harus selalu terjawab. Penukaran yang gagal di tengah, atau ortu yang
-- menolak setelah 💎 terpotong, tidak boleh menghilangkan jejak.
--
-- ⭐ TETAP penghitung, dan itu bukan inkonsistensi: ⭐ hanya membeli kosmetik in-app. Pembedaan
-- yang persis sama dengan ADR-0004 — yang menyentuh dunia nyata dijaga lebih ketat.

create type gem_reason as enum ('mission_claim', 'prize', 'adjust');

create table gem_entries (
  id         uuid primary key default gen_random_uuid(),
  child_id   uuid not null references children(id) on delete cascade,
  -- Positif = didapat, negatif = ditukar. Nol tidak berarti apa-apa.
  delta      integer not null check (delta <> 0),
  reason     gem_reason not null,
  -- Request yang melahirkannya. Null hanya untuk 'adjust' (mis. saldo pembuka saat migrasi).
  request_id uuid references requests(id),
  created_at timestamptz not null default now()
);

create index gem_by_child on gem_entries (child_id, created_at desc);

create view gem_balances as
select child_id, sum(delta)::bigint as balance
from gem_entries
group by child_id;

-- Hak PEMANGGIL, bukan hak pemilik view — pelajaran dari 0004, di mana `wallet_balances`
-- melewati RLS dan membocorkan saldo seluruh keluarga.
alter view gem_balances set (security_invoker = on);

-- Append-only, alasan yang sama dengan ledger: riwayat yang bisa diedit bukan riwayat.
create or replace function reject_gem_mutation()
returns trigger language plpgsql
set search_path = public, pg_temp
as $$
begin
  raise exception '💎 bersifat append-only. Pakai baris pembalik (delta negatif), jangan ubah sejarah.';
end;
$$;

create trigger no_gem_update before update on gem_entries
  for each row execute function reject_gem_mutation();
create trigger no_gem_delete before delete on gem_entries
  for each row execute function reject_gem_mutation();

/*
 * 💎 tidak boleh negatif — penjagaan yang sama bentuknya dengan `no_overdraft` (0010), termasuk
 * MENGUNCI DULU sebelum menghitung. Tanpa kunci, dua penukaran bersamaan sama-sama melihat saldo
 * yang masih sehat dan keduanya lolos (write skew), dan anak bisa menukar dua hadiah dengan 💎
 * yang cuma cukup untuk satu.
 */
create or replace function reject_gem_overdraft()
returns trigger language plpgsql
set search_path = public, pg_temp
as $$
declare
  v_balance bigint;
begin
  perform 1 from children where id = new.child_id for update;

  select coalesce(sum(delta), 0) into v_balance from gem_entries where child_id = new.child_id;

  if v_balance < 0 then
    raise exception '💎 anak jadi % — tidak bisa menukar lebih banyak daripada yang dimilikinya.',
      v_balance using errcode = 'check_violation';
  end if;
  return null;
end;
$$;

create trigger no_gem_overdraft after insert on gem_entries
  for each row execute function reject_gem_overdraft();

-- ── Menghubungkan request ke job/hadiahnya ───────────────────────────────────
-- Hari ini `requests` tidak punya kolom apa pun yang menghubungkannya ke job atau hadiah, jadi
-- "klaim mission" tidak bisa menyebut mission yang mana.

alter table requests add column job_id   uuid references jobs(id);
alter table requests add column prize_id uuid references prizes(id);

alter table requests add constraint mission_claim_needs_job check (
  kind <> 'mission_claim' or job_id is not null
);
alter table requests add constraint prize_needs_prize check (
  kind <> 'prize' or prize_id is not null
);
-- Arah sebaliknya: kolom yang terisi di jalur yang salah melahirkan pertanyaan tak berjawab.
alter table requests add constraint job_id_only_on_mission_claim check (
  kind = 'mission_claim' or job_id is null
);
alter table requests add constraint prize_id_only_on_prize check (
  kind = 'prize' or prize_id is null
);

/*
 * CATATAN yang menghindarkan peringatan K14 (nummi-status.md): jumlah 💎 TIDAK disimpan di
 * `requests.amount`. Kolom itu rupiah — `amount bigint check (amount > 0)` dipakai cash out,
 * Give, dan grow_in. Jumlah 💎 diturunkan dari `jobs.amount` / `prizes.gem_cost` lewat
 * `job_id`/`prize_id`. Satu kolom dengan dua arti adalah persis cara keputusan mati diam-diam.
 */

-- ── RLS ──────────────────────────────────────────────────────────────────────
-- Baca saja; penulisan lewat server action ber-service-role (pola 0009).

alter table jobs        enable row level security;
alter table prizes      enable row level security;
alter table gem_entries enable row level security;

-- Anak HARUS bisa melihat job & hadiahnya — kalau tidak, tidak ada yang bisa dikerjakan.
create policy jobs_read   on jobs        for select using (can_see_child(child_id));
create policy prizes_read on prizes      for select using (can_see_child(child_id));
create policy gems_read   on gem_entries for select using (can_see_child(child_id));

-- ── Pindahkan 💎 yang sudah ada, lalu buang kolomnya ─────────────────────────
-- Arthur punya 12 💎 di `child_economy`. Ia jadi satu baris pembuka, bukan hilang: kalau
-- angkanya berubah tanpa jejak di migrasi ini, seluruh alasan memakai ledger sudah dilanggar
-- sejak baris pertamanya.

insert into gem_entries (child_id, delta, reason)
select child_id, gems, 'adjust' from child_economy where gems <> 0;

alter table child_economy drop column gems;

-- ── create_child ikut tahu (tidak ada yang perlu ditambah) ───────────────────
-- 💎 anak baru = nol, dan nol adalah **tidak ada baris**. Itu keuntungan ledger: keadaan awal
-- tidak perlu dibuat, ia sudah benar dengan sendirinya.
