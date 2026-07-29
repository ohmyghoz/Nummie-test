-- Nummi — pilihan anak saat Harvest punya tempat, jadi ia tidak bisa hilang di jalan.
--
-- `requests` hanya punya `source_wallet_id`. Untuk cash out dan Give itu cukup: uangnya keluar,
-- dan ke mana perginya urusan dunia nyata. Harvest berbeda — uangnya **tetap di dalam app**, dan
-- ia harus mendarat di salah satu kantong Save milik anak (ADR-0003: Harvest tidak boleh langsung
-- jadi jajan). Layar anak sudah menawarkan pilihan itu; yang tidak ada adalah tempat menyimpannya.
--
-- Tanpa kolom ini, satu-satunya jalan adalah ortu yang memilih saat menyetujui — dan itu berarti
-- anak memilih "BMX Bike", ortu menaruhnya di "Free savings", dan anak tidak pernah tahu bahwa
-- pilihannya diabaikan. ADR-0003 menjadikan ortu **bank**, bukan pemilik keputusan. Memilih dream
-- mana yang didekatkan adalah inti pelajarannya, jadi pilihan itu harus terekam.
--
-- Deposito yang jatuh tempo punya tiga jalan yang menghasilkan angka berbeda (`tdHarvestOutcome`
-- di packages/core/src/grow.ts). Itu juga keputusan anak, dan juga tidak punya tempat.

-- Cermin persis `HarvestChoice` di packages/core/src/grow.ts. Kalau salah satu berubah, yang
-- lain harus ikut — dan test di core menjaga sisi TypeScript-nya.
create type harvest_choice as enum ('cash_out', 'roll_over', 'take_profit');

alter table requests add column destination_wallet_id uuid references wallets(id);
alter table requests add column harvest_choice harvest_choice;

-- Harvest WAJIB punya tujuan. Request harvest tanpa tujuan adalah request yang tidak bisa
-- dieksekusi ortu tanpa menebak, dan menebak di app uang bukan pilihan.
alter table requests add constraint harvest_needs_destination check (
  kind <> 'harvest' or destination_wallet_id is not null
);

-- Arah sebaliknya: `harvest_choice` tidak punya arti di luar harvest. Membiarkannya terisi
-- di jalur lain akan melahirkan pertanyaan "ini artinya apa?" yang tidak punya jawaban.
alter table requests add constraint harvest_choice_only_on_harvest check (
  kind = 'harvest' or harvest_choice is null
);

-- CATATAN: bahwa tujuannya harus kantong **Save** TIDAK ditegakkan di sini. Check constraint
-- tidak boleh membaca tabel lain, dan menambah trigger untuk itu berarti menyalin aturan produk
-- ke SQL — persis yang dihindari saat memilih "server action + @nummi/core" (lihat 0009).
-- Penegaknya `canHarvestTo()` di core, dan `harvestDestinations()` yang membuat wallet Spend
-- tidak pernah dirender sama sekali.
