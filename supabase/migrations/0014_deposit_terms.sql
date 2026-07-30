-- Nummi — kesepakatan deposito punya tempat, jadi ia bisa dibekukan.
--
-- ADR-0003 menutup dengan satu kalimat yang selama ini tidak punya rumah:
-- **"TD tidak ikut pasar — bunganya terkunci di kesepakatan."**
--
-- Hari ini tidak ada tempat menyimpan tenor, rate, maupun tanggal mulai. Akibatnya nyata dan
-- sudah tercatat di `apps/parent/README.md`: hitung mundur jatuh tempo di Manage investments
-- memakai `daysUntilMaturity(data.tdStart, 6, …)` — tenor 6 **hardcoded** dan tanggal mulai dari
-- konstanta seed. README-nya sendiri menyebut hitung mundur itu tidak bisa dipercaya.
--
-- Lebih penting dari hitung mundur: tanpa rate yang dibekukan, mengubah bunga di Settings akan
-- mengubah bunga deposito yang SUDAH BERJALAN. Anak yang menyetor karena dijanjikan 4% bisa
-- menemukan bunganya jadi 1% karena ortu mengubah setelan bulan depan. Itu bukan bug hitung —
-- itu janji yang dibatalkan diam-diam.

-- ── Pilihan anak, dititipkan di request ──────────────────────────────────────
-- Sejajar dengan `harvest_choice` (0011): keputusan anak ikut tercatat di pengajuannya, bukan
-- ditebak ortu saat menyetujui.

alter table requests add column grow_tenor_months smallint;

alter table requests add constraint grow_tenor_valid check (
  grow_tenor_months is null or grow_tenor_months in (3, 6, 12)
);

-- Tenor tidak punya arti di luar pengajuan Grow. Arah kedua ini yang menjaga agar kolomnya
-- tidak terisi di jalur lain lalu melahirkan pertanyaan yang tak berjawab.
alter table requests add constraint grow_tenor_only_on_grow_in check (
  kind = 'grow_in' or grow_tenor_months is null
);

-- Pengajuan Grow WAJIB menyebut instrumen tujuannya. Tanpa itu, ortu tidak bisa
-- mengeksekusinya tanpa menebak — dan menebak di app uang bukan pilihan.
-- (Bandingkan `harvest_needs_destination` di 0011: aturan yang sama, arah berlawanan.)
alter table requests add constraint grow_in_needs_destination check (
  kind <> 'grow_in' or destination_wallet_id is not null
);

-- ── Kesepakatan yang dibekukan, disimpan di wallet instrumennya ──────────────

alter table wallets add column tenor_months   smallint;
alter table wallets add column locked_rate_pct numeric(5,2);
alter table wallets add column started_at     date;

alter table wallets add constraint deposit_terms_valid check (
  tenor_months is null or tenor_months in (3, 6, 12)
);

/*
 * Ketiganya sekaligus, atau tidak satu pun.
 *
 * Deposito dengan tenor tapi tanpa tanggal mulai tidak bisa dihitung jatuh temponya; dengan
 * tanggal mulai tapi tanpa rate tidak bisa dihitung bunganya. Separuh-terisi adalah keadaan yang
 * tidak berarti apa-apa, jadi dibuat mustahil daripada dijaga belakangan.
 */
alter table wallets add constraint deposit_terms_all_or_none check (
  (tenor_months is null and locked_rate_pct is null and started_at is null)
  or (tenor_months is not null and locked_rate_pct is not null and started_at is not null)
);

-- Hanya deposito punya kesepakatan berjangka. Emas dan valas tidak punya tenor — nilainya
-- mengikuti harga, dan itu justru pelajaran yang berbeda (ADR-0003).
alter table wallets add constraint deposit_terms_only_on_time_deposit check (
  tenor_months is null or instrument = 'time_deposit'
);

/*
 * SATU DEPOSITO AKTIF PER WALLET — penyederhanaan yang diambil sadar.
 *
 * Tidak ditegakkan constraint (butuh membaca ledger untuk tahu sudah dipanen atau belum), tapi
 * ditegakkan di `canGrowInFrom`/`growInPlan` di `packages/core`: wallet deposito yang `started_at`
 * -nya terisi dan belum dipanen TIDAK ditawarkan sebagai tujuan pendanaan.
 *
 * Alternatifnya — mengizinkan setoran kedua — akan memperpanjang jatuh tempo dan mengubah rate
 * yang sudah dijanjikan untuk uang yang sudah masuk. Persis hal yang migrasi ini ada untuk
 * mencegahnya. Kalau nanti butuh banyak deposito sekaligus, bentuk yang benar adalah satu wallet
 * per deposito, bukan banyak kesepakatan di satu wallet.
 */
