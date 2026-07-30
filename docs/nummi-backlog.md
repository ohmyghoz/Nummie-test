# Nummi — Backlog (item tertunda untuk dikerjakan nanti)

Dokumen ini mencatat keputusan & fitur yang sudah didiskusikan tapi **belum dibangun**,
agar tidak hilang. Diurutkan kasar berdasarkan prioritas/ketergantungan.

*Diperbarui 30 Juli 2026 (D3 ditutup — ADR-0018). Status permukaan & register kontradiksi
lengkap ada di `nummi-status.md`.*

---

## ‼️ PALING ATAS — bersih-bersih hasil audit (murah, dan menghentikan angka yang saling bertentangan)

> ### ✅ Diaudit ulang 30 Juli 2026 — sebagian besar bagian ini sudah tidak berlaku
>
> Daftar X1–X10 lahir saat repo ini **hanya berisi mockup**. Audit lintas-berkas terhadap kode
> nyata (`apps/*`, `packages/core`, `copy/`, `supabase/`) menemukan bahwa **X1–X5 dan X10 sudah
> benar sejak kodenya ditulis** — yang salah adalah mockup beku di `legacy/`, dan itu memang tidak
> untuk diperbaiki.
>
> | Item | Keadaan di kode nyata |
> |---|---|
> | X1 format rupiah | ✅ `formatRp()` satu-satunya perender uang. Nol `toLocaleString`, nol literal `Rp` |
> | X2 target dream | ✅ `seed.ts` BMX 300.000 / Headphones 100.000, dan `supabase/seed.sql` setuju |
> | X3 request pending | ✅ satu-satunya: cash_out 25.000 dari Snacks |
> | X4 rasio auto-split | ✅ 40/40/20, ditegakkan `validateAutoSplit()`, default kolom SQL sama |
> | X5 badge streak | ✅ nol kemunculan `streak`/`🔥` di seluruh kode |
> | X10 Practice/Practise | ✅ "Practice" konsisten; "Practise" hanya tersisa di satu komentar |
>
> **Pelajarannya, dan ia berlaku ke seluruh dokumen ini:** backlog yang ditulis terhadap mockup
> tidak otomatis berlaku untuk kode. Sebelum mengerjakan item lama, **periksa dulu apakah ia masih
> nyata** — enam item di atas akan jadi enam pekerjaan yang mengubah kode yang sudah benar.
>
> Yang **masih nyata**: X6 (maskot — wordmark sudah ada, maskot belum), X8 (tiga judul `docs/`
> masih "Celengan"), X9.

- **X1. Format rupiah** → `Rp50.000` (brand §17). Sekarang semua mockup produk memakai `Rp 10,000`,
  bahkan antar-mockup anak beda (`Rp 900.000.` vs `Rp 900,000.`). Satu titik ubah per berkas:
  fungsi `rp()` di app anak, `fmt()` di app ortu. Console sudah benar — pakai itu sebagai contoh.
- **X2. Target dream tidak sinkron** → app anak BMX 300.000 / Headphones 100.000; app ortu 400.000 / 60.000.
  Pakai angka app anak (sesuai handoff), perbaiki sisi ortu.
- **X3. Request pending tidak sinkron** → anak Rp20.000, ortu Rp25.000. Samakan ke Rp25.000.
- **X4. Rasio auto-split seed 40/40/10** (total 90%) padahal default 40/40/20. Perbaiki seed.
- **X5. Badge "🔥 7-day streak" yatim** di app anak (HP + iPad) — streak sudah dihapus total di Fase 5,
  jadi badge ini mustahil didapat. Hapus, atau ganti badge berbasis perilaku
  (mis. "3 minggu berturut-turut menyortir dalam 2 hari").
- **X6. Maskot di app anak** — ⚠️ **separuh selesai.** Wordmark sudah ada (`apps/kid/components/ui.tsx`
  → komponen `Brand`, koin ber-"n" + kata "Nummi"), jadi app anak tidak lagi tanpa brand. **Maskot
  kancil masih belum.** Ikut selesai 30 Juli 2026: ikon PWA memakai symbol mark resmi (koin emas
  berwajah + kecambah, brand §2/§7) — jadi brand kini muncul di home screen, bukan cuma di dalam app.
- ~~**X7. Kontradiksi maskot di brand system**~~ ✅ **selesai 28 Juli 2026** — §8.2 ditulis ulang mengikuti
  lembar karakter yang disetujui (kancil emas, selendang ungu ber-monogram **n**, kecambah hijau), plus
  catatan agar §8.1/§8.2/lembar karakter tidak pernah lagi diubah sendiri-sendiri.
- **X8. Nama berkas & judul** masih memakai "Celengan" (`Celengan_iPad_…`, `celengan-*.md/html`).
  ✅ Sebagian selesai: `nummi-brand-system.md`, `nummi-handoff.md`, `nummi-backlog.md` sudah bernama bersih.
  Sisa: mockup iPad dan dua mockup arsip.
- **X9. Instruksi Project masih menunjuk mockup usang** (`celengan-home-mockup.html`) — ganti ke
  lima berkas aktif, kalau tidak setiap sesi baru mengedit berkas yang salah.
- **X10. Ejaan Inggris tidak konsisten** ("Practice" HP vs "Practise" iPad) — ⚠️ **naik prioritas,
  tidak gugur.** Asumsi lamanya: gugur sendiri kalau D1 jatuh ke Indonesia. D1 jatuh ke **Inggris**
  (ADR-0016), jadi ini harus benar-benar diperbaiki: pilih satu varian, tegakkan di `copy/en.ts`.

---

## A. Auto-split ratio editor — ✅ LEVEL 1 SELESAI (sisi ortu, Fase 6) · ⚠️ belum di sisi anak
**Sudah dibangun** di app ortu HP + web: sakelar on/off, rasio per kategori, pemilihan wallet tujuan
per kategori, validasi "Ratio is over 100%", sisa rasio boleh tersisa di mode Flexible (mendarat di
Unsorted) tapi wajib habis di mode Strict.
**Yang tersisa:**
- ~~**A-sisa-1 (mendesak).**~~ ✅ **selesai** — `apps/kid` layar Sort membaca rasio dari `money_rules`
  lewat `sortPlan()` (`packages/core/src/sort.ts`). Tidak ada lagi teks mati "40/40/20"; test
  membuktikannya dengan rasio non-default (10/70/20), bukan cuma dengan angka seed.
- **A-sisa-2.** Level 2 (rasio di dalam kategori) belum ada sama sekali — lihat rinciannya di bawah.
- **A-sisa-3.** Tier Teen boleh mengedit rasio dalam batas ortu — belum ada di app anak.

Rincian level 2 yang masih berlaku:
- **Level 1 — antar kategori** (Spend/Save/Give): diatur orang tua. Remaja boleh mengedit
  dalam batas ortu (mis. minimal 20% ke Save). **Grow dikecualikan** dari auto-split.
- **Level 2 — di dalam kategori** (aturan berbeda sesuai sifat):
  - Spend → rasio antar-envelope (mis. Jajan 60% / Transport 40%).
  - Save → **strategi**, bukan rasio mati: "fokus dream terdekat selesai" / "bagi rata semua dream" / "ikut prioritas".
  - Give → biasanya satu pool, tak perlu split.
  - Grow → manual + izin, tidak di-auto-split.
- **Prinsip UI**: selalu tampilkan **preview hasil** sebelum konfirmasi (bukan kotak hitam).
- **Lokasi**: kemungkinan di app orang tua, dengan cermin baca/edit-terbatas di app anak (tier Remaja).

## B. Sistem Poin / Rewards / Gamifikasi — SELESAI di Fase 4 + 5
- ✅ **Keputusan besar hybrid** (Fase 4): ⭐ lifetime (gerbang, tak berkurang) + ⭐ saldo (belanja) + 💎 (chores→hadiah nyata).
- ✅ Avatar shop, badges — dibangun Fase 4.
- ✅ **Minus-point raid dream** (Fase 5): ⭐ −15 flat saat dream→Spend/Give. Memotong SALDO saja, tak pernah
  lifetime (kalau lifetime ikut turun, anak bisa mengunci ulang chores-nya sendiri). Peringatan tampil
  sebelum konfirmasi, bukan hukuman diam-diam.
- ✅ **Bonus streak — DITOLAK** (Fase 5, bukan dibangun lalu dibuang tanpa alasan): streak menghukum jeda
  wajar (sakit/liburan) dan mendorong buka-app-harian kosong padahal keputusan uang bukan aktivitas harian.
  Streak lama yang sudah ada (dan sempat bertabrakan 🔥5 vs 🔥4 di layar berbeda) **dihapus total**, topbar
  ⭐ diganti nunjuk ke chapters progress. Kalau nanti ingin streak lagi, harus berbasis PERILAKU
  (mis. "3 minggu berturut-turut sortir dlm 2 hari"), bukan sekadar membuka app.

## C. Setelan "Strict vs Flexible" — ✅ SELESAI (sisi ortu, Fase 6) · ❌ BELUM DITEGAKKAN di sisi anak
**Sudah dibangun** di app ortu sebagai layar **"Money rules"** per anak: dua mode dengan konsekuensi
ditulis apa adanya (Flexible = anak bebas menyortir ulang Unsorted & Spend; Strict = pembagian terkunci,
uang tidak bisa keluar dari tugas yang sudah diberikan). Yang berlaku di kedua mode: cash-out selalu butuh
persetujuan, dream & Give tidak bisa dibatalkan tanpa ortu, Grow tidak bisa ditarik sepihak.

✅ **GAP INI SUDAH DITUTUP** (dulu gap paling mahal di seluruh backlog). App anak kini mengenal mode:
`sortPlan()` mengunci slot di Strict, `canChildMoveFrom()` menegakkan izin per-wallet, dan layar Sort
menampilkan pesan yang menjelaskan **kenapa** terkunci — bukan tombol mati.

**Yang tersisa:**
- Penegakan yang sama perlu ikut ke flow **Add/Move money** dan **Give** saat keduanya dibangun
  (belum ada di irisan `apps/kid` sekarang).
- Default per tier + kemampuan ortu meng-override. Catatan riset yang sudah dikunci:
  **Strict default mati** — riset literasi finansial memperingatkan bahaya mencabut pengambilan
  keputusan nyata dari anak.

## F. Penamaan "Free savings"
Ganti ke nama yang lebih ramah anak. Kandidat: **"Someday / Suatu Nanti"** (rekomendasi utama),
"Nabung Aja" (paling lugas), "Rainy Day / Dana Jaga-jaga". Wallet ini juga berperan sebagai
**default Save tak-terlihat** di mode Little, tujuan pulang saat dream dibatalkan, dan titik mendarat Harvest.

## G. Sisi Orang Tua — Fase 7 (Fase 1–6 sudah selesai)
Selesai: login, dashboard+switcher, approval inbox 5-jalur (Grow/Harvest instan, mission instan, prize→To do,
Give→To do+cerita wajib, cashout→To do), Send/Take money, Add a child, Settings nyata, Missions nyata
(Learning tracker, Jobs builder, Prizes), **dan Fase 6**: auto-split editor, Money rules Strict/Flexible,
undang ortu kedua, halaman Insight, Transactions dengan filter rentang. Sisa kandidat:
1. **Parent articles + conversation starters** — benihnya sudah ada di kartu Learning
   (*"Arthur just learned X — a good thing to ask about at dinner"*). Tinggal jadikan konten & jadwal mingguan.
2. **Progress markers** (§4.2 financial_literacy.md) — checklist observasi ortu + metrik otomatis dari ledger.
3. **Foto di cerita Give** — saat ini teks saja; foto perlu dipikirkan (upload? kamera? placeholder?).
4. **Edit data anak** (nama/tier/PIN) baru bisa create. ~~edit/hapus mission & prize~~ ✅ **hapus
   selesai 30 Juli 2026** — arsip, bukan DELETE (baris dirujuk `requests.job_id`, dan 💎 anak harus
   tetap punya asal). **Edit sengaja tidak disediakan**: mengubah nominal job yang sudah diklaim
   membuat sejarah berbohong. Job diganti, bukan diubah.
5. **Growth Reward** — bunga simulasi didanai ortu utk Little/Middle awal. Masih menunggu keputusan (M1).
6. **Rapor Literasi Finansial** (M2) — belum ada di permukaan mana pun.

## G2. Paritas antar permukaan (BARU — hasil audit 28 Juli 2026)
Matriks lengkap ada di `nummi-status.md` §2. Yang perlu dikerjakan:

**Anak iPad tertinggal dari anak HP:**
- Tidak ada **toggle bahasa** 🌐.
- Tidak ada **"Write back"** (anak membalas cerita Give dari ortu) — padahal itu penutup lingkaran Fase 5.
- Aktivitas hanya punya rentang 3/7 hari, tanpa pemilih rentang tanggal penuh.
- Missions lebih ringkas: tidak ada progress "Chapter 1 of 6", event THR, atau panel "Your active lesson".

**Anak (kedua permukaan):**
- ~~**Pemilih tier dimatikan** — fungsi `harness()` diawali `return null;`~~ ⚠️ **kalimat ini keliru dan
  sudah dikoreksi** oleh [ADR-0020](decisions/0020-d5-middle-saja-untuk-mvp.md). `harness()` hanya ada di
  **mockup beku `legacy/`**. Di `apps/kid` yang nyata, tier dibaca dari kolom database, dan
  `apps/parent/app/children/new` menawarkan **ketiga tier** — jadi D5 tidak pernah benar-benar ditegakkan,
  ia cuma tampak begitu. ✅ **D5 sekarang diputuskan (Middle saja) dan ditegakkan** lewat `MVP_TIERS` +
  `validateChild()` di `packages/core`, dengan test.

**Ortu HP tertinggal dari ortu Web:** halaman Insight versi ringkas, tidak ada dashboard lintas-anak
(*"From all your children"*) dan *"Rules, per child"*. Sebagian ini mungkin memang benar — layar kecil
bukan tempat membaca tren. **Perlu diputuskan sengaja**, bukan dibiarkan sebagai kebetulan.

---

## T. BACKLOG TEKNIS — Scheduler & feed harga (BARU, konsekuensi model "ortu = bank")
Grow kini simulasi, tapi **harganya riil**. Mockup pakai harga statis + tombol demo; produksi butuh:

**Sumber data — hati-hati memilih:**
- **Valas**: JANGAN scraping Google Finance — melanggar ToS & rapuh. Pakai **kurs Bank Indonesia**
  (JISDOR utk USD; kurs transaksi BI utk SGD/EUR) — resmi, gratis, dan lebih kredibel untuk produk
  finansial anak Indonesia. Alternatif: API kurs berlisensi.
- **Emas**: Antam (logammulia.com) **tidak punya API** → perlu scraping, rapuh terhadap perubahan halaman.
  Butuh harga **jual DAN buyback** (spread ~9% adalah bagian dari pelajaran, jangan disederhanakan jadi satu harga).

**Yang harus ditangani scheduler:**
- Jadwal harian + zona waktu (WIB).
- **Akhir pekan & hari libur**: tidak ada harga baru → pakai harga terakhir + **tampilkan tanggalnya** ke user.
- **Kegagalan fetch**: jangan diam-diam pakai harga basi tanpa keterangan. Perlu status "terakhir diperbarui X".
- **Caching** + jangan panggil sumber per-request user.
- **Pembulatan**: emas skala anak = miligram (Rp 21.000 ≈ 14,5 mg). Format mg <1 g, gram ≥1 g.
- **Audit trail**: simpan harga historis — kalau harga berubah, nilai lama anak harus tetap bisa dijelaskan.

**Scheduler kedua — reset mingguan (Fase 4):**
- Job mingguan harus kembali "available" tiap awal minggu, dan flag "materi minggu ini" harus direset.
  Di mockup ini masih tombol demo "▶ Start a new week". Perlu: definisi awal minggu (Senin? hari anak daftar?),
  zona waktu, dan apa yang terjadi kalau anak tak buka app berminggu-minggu (jangan menumpuk klaim retroaktif).

**Catatan produk terkait:**
- Rate deposito TIDAK dari feed — ditetapkan ortu (dia bank-nya). Hanya emas & valas yang ikut feed.
- Risiko pasar ada di ortu (lihat handoff). Kalau nanti dianggap terlalu berisiko, opsi mitigasi:
  cap nominal Grow per anak, atau opsi "saya benar-benar membeli asetnya" (ter-hedge).

---

## U. BACKLOG TEKNIS — sisa Supabase setelah S1b selesai (29 Juli 2026)

Database berdiri, terisi seed kanonik, isolasi RLS diuji per-role, dan login anak sudah hidup
(`docs/nummi-status.md` §9). Yang tersisa, urut dari yang paling memblokir:

- **U-16 · Entitlement ditegakkan, tapi tiga hal masih terbuka.** ADR-0018 menutup D3, dan `LIMITS`
  sekarang benar-benar dijalankan. Sisanya:
  1. **Pembelian sungguhan** — Apple IAP butuh app native (D4). Tombol "Buka Pro" sengaja belum
     menjanjikan apa pun; checkout palsu di prototipe akan mengajari kesimpulan yang salah.
  2. **`customJobBuilder` / `customPrizeBuilder` belum ditegakkan.** Free seharusnya hanya memakai
     **template kurasi**, dan templatenya belum ada. Melarang builder sekarang membuat Jobs mati
     total di Free — bukan dibatasi, tapi hilang. Butuh template dulu.
  3. **`maxDreams` / `maxEnvelopes` belum ditegakkan** karena app anak belum bisa MEMBUAT dream atau
     envelope sama sekali. Batas untuk aksi yang belum ada tidak perlu ditulis.
  Yang sudah ditegakkan: `maxChildren`, `maxActiveJobs`, `maxPrizes`, `grow`, `strictFlexibleDial`,
  `autoSplitEditor`, dan I5 (sekolah tidak pernah melihat tombol beli).

- ~~**U-1 · Deploy `child-login`**~~ ✅ **selesai 29 Juli 2026.** v2 ACTIVE, diuji ujung ke ujung.
- ~~**U-7 · Jalan masuk anak**~~ ✅ **selesai 29 Juli 2026 — opsi 2 dipilih**: kode keluarga + PIN
  saja, tanpa memilih anak lebih dulu. Ditolak: endpoint publik berisi nama anak (kode keluarga jadi
  bocoran daftar anak) dan QR dari app ortu (paling aman, terlalu berat untuk uji pertama). Server
  **gagal-tertutup** kalau dua anak sama-sama cocok — tidak menebak. Ikut terkunci: PIN 6 digit &
  unik per keluarga (K15), dan rate limiting dikunci ulang ke keluarga. Rinciannya di
  [ADR-0012 §Amandemen](decisions/0012-auth-anak-kode-keluarga-pin.md).
  **Yang tersisa dari U-7: layar login-nya sendiri belum dibangun** — itu bagian dari U-2.
- ~~**U-9 · Saldo negatif belum mustahil, baru dipantau.**~~ ✅ **selesai 29 Juli 2026 (0010).** Dua klik Confirm yang cepat di layar
  Sort sama-sama membaca Unsorted 50.000 dan sama-sama menulis — hasilnya Unsorted −50.000.
  Tidak ada constraint yang mencegahnya; `invariant_check.negative_wallets` hanya **melaporkan**
  setelah kejadian, dan ledger append-only berarti tidak bisa dibatalkan, hanya ditambal baris
  pembalik. Ini juga berlaku untuk Move/Give/Grow saat menyusul.
  **Usulan (butuh persetujuan — migrasi 0010):** trigger `after insert` di `ledger_entries` yang
  menghitung saldo `from_wallet_id` sesudah baris masuk dan `raise exception` kalau negatif.
  Menegakkan di database, bukan di app, karena inilah invariant — dan invariant yang dijaga app
  akan bocor lewat jalur tulis berikutnya yang lupa memeriksanya.

- **U-6 · Lunasi utang JWT HS256.** Login anak menumpang JWT secret legacy yang statusnya sudah
  `Previously used` (`9835f01e-…`); project sendiri sudah pindah ke ES256. **Jangan pernah revoke
  kunci itu** sebelum ini selesai — satu klik mematikan login semua anak serentak. Jalan keluar:
  `child-login` menerbitkan sesi lewat Admin API (bukan menandatangani sendiri) + claim disuntikkan
  lewat custom access token hook. `0002_rls.sql` tidak perlu disentuh — hook menaruh claim di tempat
  yang sama persis. Ongkos: satu kolom penghubung `children` → `auth.users`.
- **U-2 · Sambungkan app ke Supabase.** 🟢 **Irisan 1 selesai** (baca-saja: login kode keluarga +
  PIN, cookie httpOnly, Home/Wallets/Sort/Requests dari database). 🟡 **Irisan 2 sebagian** —
  **Semua flow tulis app anak sudah tersambung** lewat server action: Sort & Move ke ledger,
  Give & Harvest ke `requests` (ADR-0002). Harvest ikut menyimpan tujuan + pilihan deposito
  (migrasi 0011). 🟡 **Irisan 3 sebagian** — app ortu
  membaca dari Supabase, dan **approval inbox sudah menulis**: Approve/Decline/Talk/Mark-done
  benar-benar mengubah database, dengan ADR-0002 & ADR-0006 ditegakkan `@nummi/core`. Sisa:
  Send/Take/Rules/Settings/Add-a-child/Jobs masih pratinjau (baca nyata, tulis belum).
- ~~**U-12 · Settings ortu belum punya tabel.**~~ ✅ **selesai 30 Juli 2026 (migrasi 0013).**
  Tiga tabel, dipisah menurut PEMILIKNYA: `allowance_schedules` (per anak, ditulis ortu) ·
  `bank_rates` (per keluarga — ortu = bank) · `daily_prices` (global, ditulis mesin;
  `price_date` sebagai PK memberi audit trail yang dituntut backlog T). Harga masih **dummy**,
  tapi sumbernya sudah database — feed nanti cuma menambah baris.
  Ikut tertutup: **jadwal uang saku yang diwarisi diam-diam** (satu objek `SEED_ALLOWANCE`
  dipakai semua anak) dan **biweekly tanpa anchor** (handoff §232).
- ~~**U-13 · Jobs & Prizes belum punya tabel.**~~ ✅ **selesai 30 Juli 2026 (migrasi 0015).**
  `jobs` · `prizes` · **`gem_entries` append-only** + view `gem_balances`. Job **sekali-saja**
  dulu (kolom `frequency` sudah ada, UI belum menawarkan mingguan). Sisi anak akhirnya punya
  layarnya: "Jobs from home" di Missions, penukaran hadiah di Me.
  💎 pakai ledger, ⭐ tetap penghitung — ⭐ hanya membeli kosmetik, 💎 menyentuh dunia nyata
  (ADR-0004). Jumlah 💎 **tidak** disimpan di `requests.amount` (kolom itu rupiah); diturunkan
  lewat `job_id`/`prize_id` — menghindari peringatan K14.
- ~~**U-15 · "belum ada materi" vs "belum selesai"**~~ ✅ **dikonfirmasi 30 Juli 2026**, dicatat
  sebagai [ADR-0004 §A3](decisions/0004-ekonomi-bintang-permata.md). `undefined` berarti gerbang
  belum berlaku; `false` tetap menutupnya. Gerbangnya tidak dilonggarkan — ia menutup sendiri
  begitu ada materi mingguan yang bisa dinilai.
  **Yang masih terbuka: definisi minggu** (awal minggu · zona waktu · klaim retroaktif) — tercatat
  di §T, dan gerbang ini baru benar-benar bekerja setelah ketiganya dijawab.
- ~~**U-11 · Sesi ortu tidak diperbarui.**~~ ✅ **selesai 30 Juli 2026.** `apps/parent/middleware.ts`
  menukar refresh token 2 menit sebelum access token mati. Diuji dengan menanam access token
  kedaluwarsa + refresh token asli: dashboard tetap terbuka dan token baru dipasang. "Keluar"
  ikut menghapus refresh cookie — tanpa itu middleware akan membangkitkan sesi yang baru ditutup.
- ~~**U-14 · "Add money to Grow"**~~ ✅ **selesai 30 Juli 2026.** Sumber: **Spend · Free savings ·
  Unsorted**; dream tidak pernah. **Strict tidak memblokir** — setiap setoran sudah wajib disetujui
  ortu, jadi tidak ada yang unilateral untuk dikunci (ada test yang menjaga keputusan ini).
  Anak memilih **tenor**, dan approval **membekukan rate + tanggal mulai** ke wallet (0014) —
  ADR-0003 §"bunganya terkunci di kesepakatan" akhirnya punya rumah. Satu deposito aktif per
  wallet TD: setoran kedua ditolak (`growIn.depositBusy`) karena ia akan memperpanjang jatuh tempo
  dan mengubah rate untuk uang yang sudah masuk.
  Ikut ditutup: approval `grow_in` yang **tidak memindahkan uang sama sekali** tanpa galat.
- **U-11-lama · (dipindah)** Access token Supabase berumur ~1 jam dan
  `apps/parent/lib/supabase.ts` tidak me-refresh-nya — ortu terlempar ke layar masuk setelah satu
  jam. Refresh token perlu ditukar di middleware (server component tidak bisa memasang cookie).
  Cukup untuk uji prototipe; jadi menyakitkan begitu ada ortu sungguhan yang memakainya seharian.
- **U-10 · Request tidak "memesan" saldo.** Dua pengajuan Give yang masing-masing sah bisa
  melebihi isi kantong Give kalau digabung. Secara uang tidak bahaya — trigger `no_overdraft`
  (0010) menolak yang kedua saat ortu menyetujuinya. Yang belum dipikirkan adalah **pengalaman
  ortunya**: ia menekan Approve dan mendapat kegagalan yang bukan salahnya. Diputuskan saat
  irisan 3 (app ortu), bukan sekarang. Sisa: irisan 3 (app ortu, terhalang U-3).
- **U-8 · Anak bisa mencetak uang — DITUTUP 29 Juli 2026 (migrasi 0009).** Dicatat karena
  pelajarannya berlaku ke setiap policy berikutnya: `ledger_insert` menjawab *"baris ini milik
  anak itu?"* tapi tidak pernah *"uangnya dari mana?"*. Baris ber-`from_wallet_id = null` = uang
  masuk dari luar, dan anak boleh menulisnya sendiri. Diuji: total 484.711 → 10.484.710 dengan
  satu permintaan. **Setiap policy INSERT harus diuji dengan mencoba menyalahgunakannya**, bukan
  dengan membaca ulang kalimatnya. Klien + `.env`, lalu `lib/data.ts` ditukar query nyata
  permukaan demi permukaan. Ini pekerjaan S2/S3 yang sebenarnya, bukan permukaan baru.
- ~~**U-3 · Tautkan ortu pertama.**~~ ✅ **selesai 30 Juli 2026.** Akun dibuat lewat Admin API
  (bukan dashboard — service key sudah ada di mesin, jadi `POST /auth/v1/admin/users` cukup),
  lalu ditautkan sebagai "Ayah" primary di `NUMMI1`. Sekaligus jadi uji pertama RLS sisi ortu
  dengan baris `parents` yang nyata: jalur yang dulu `stack depth limit exceeded` sebelum 0004.
- **U-4 · Penghapusan data (privasi).** `delete from families` mustahil karena trigger append-only.
  **Butuh keputusan produk, bukan tambalan** — menyentuh ADR-0014. Usulan paling ringan (purge yang
  harus dinyalakan sadar per-transaksi) ada di `supabase/README.md`.
- **U-5 · Helper auth ke schema non-publik.** `auth_family_id()` & `can_see_child()` terekspos sebagai
  RPC karena berada di `public`. `anon` sudah dicabut (`0005`); `authenticated` tidak bisa dicabut
  tanpa mematikan RLS. Menghilangkannya sepenuhnya butuh pindah schema + tulis ulang semua policy —
  kebersihan, bukan kebocoran. Kerjakan kalau ada waktu luang, bukan sebelum uji pengguna.

---

## H2. Pajak perawatan mockup — masih berlaku, malah membesar
*(Catatan ini lahir saat masih ada 2 mockup. Sekarang ada 5. Isinya jadi lebih penting, bukan kurang.)*
- **Tidak ada yang live-linked** — lima berkas terpisah, angka disamakan manual. Audit 28 Juli 2026
  membuktikan biayanya nyata: target dream, request pending, dan rasio auto-split sudah menyimpang
  antar permukaan tanpa ada yang menyadari (lihat X2–X4). Daftar angka **kanonik** kini ada di
  `nummi-handoff.md` — kalau ada permukaan yang berbeda, permukaan itu yang salah.
- **Design system untuk lima permukaan** — tiap komponen baru berpotensi butuh versi anak-HP, anak-iPad,
  ortu-HP, ortu-web, dan console. Untuk solo founder ini pajak yang menumpuk cepat. Sebagian sudah terasa:
  iPad tertinggal dari HP anak (lihat G2). **Sebelum menambah fitur baru, kejar paritas dulu** — kalau tidak,
  jarak antar permukaan melebar lebih cepat daripada kemampuan merawatnya.
- **Riwayat**: `celengan-home-mockup.html` & `celengan-parent-mockup.html` sudah digantikan lima mockup
  aktif. Simpan sebagai arsip keputusan, jangan diedit lagi.
- **Pola bug CSS berulang 3×** — akar yang sama, muncul tiga kali:
  1. *Login berantakan*: mengganti blok CSS login ikut menghapus definisi dasar `.field` (label kehilangan
     `display:block`, input kehilangan `width:100%`).
  2. *Tombol Send/Take/Create account polos*: definisi dasar `.cta` ikut terhapus dari blok yang sama;
     plus `.cta.disabled` kalah urutan dari `.cta.danger` (tombol nonaktif tampil merah seolah aktif).
  3. *Topbar Home anak rusak*: halaman Me memakai nama class `.badges` yang **sudah dipakai** pil
     streak/bintang di topbar → pil dipaksa jadi grid 3 kolom. Diperbaiki jadi `.badgegrid`.
  **Pelajaran**: catatan pengingat saja terbukti tidak cukup (kejadian ke-3 terjadi SETELAH catatan ini dibuat).
  Yang berhasil: **audit otomatis** — scan semua base class rule yang terdefinisi ganda di tiap file.
  Jadikan ini langkah verifikasi rutin, bukan niat baik. Juga: sebelum menimpa blok CSS besar, grep dulu
  selector-nya dipakai di mana; setelah edit, cek computed style & urutan cascade untuk kombinasi class.

---

### Sudah selesai / terkunci (bukan backlog, sekadar catatan)
- Model A: uang selalu di satu tempat; kategori = label; sub-wallet nyata.
- Grow mendanai dream lewat Harvest (pindah beneran), bukan tag.
- 3 tier usia (Little / Middle / Teen) dengan model data identik; beda tampilan & izin.
- Sort tier-aware; auto-split = aturan ortu (remaja edit dalam batas).
- Nav: Home / Wallets / (+) / Missions / **Me**; hub aksi di tombol tengah. *("Trophies" diganti "Me" — nama lama menjanjikan piala padahal isinya avatar+badge+tema+bahasa+buddies.)*
- Wallets: pocket-grid collapsible (accordion), header kategori kartu besar.
- Home mode Little: blok "My dreams" DAN "Today's mission" sama-sama disembunyikan (mengikuti aturan tanpa sub-wallet/dream di Little). *(sebelumnya Backlog E)*
- Money-movement matrix *(sebelumnya Backlog D)*: flow **Add money** & **Move money** sudah dibangun dari
  Detail sub-wallet Spend/Save/Give — pilih wallet lawan → isi jumlah (ketik manual atau stepper +/− Rp 10.000)
  → konfirmasi → saldo update live di Wallets, Detail, dan Home. Grow otomatis tidak ikut (exception asimetris,
  masih via Create/Harvest terpisah). **Refinement dari draft awal**: Unsorted sengaja **tidak** disertakan
  di flow generic ini — tetap khusus lewat Sort penuh.
- **Flow Grow lengkap** *(menutup Backlog H)*: Move dihapus dari semua Grow (Harvest satu-satunya jalan keluar).
  Time Deposit harvest 3-opsi (cash out / roll over / take profit, dgn tenor 3/6/12 bln); Gold harvest dgn layar
  konfirmasi naik/turun + Cancel; Forex per-mata-uang (USD/SGD/EUR, maks 3 wallet) dgn Add money (beli, sumber
  rupiah bebas termasuk Unsorted) + Harvest. Tujuan Harvest dikunci ke wallet Save. Semua submit → state pending
  "⏳ Waiting for grown-up" yang bisa di-tap untuk simulasi approval (uang pindah beneran saat approved).
  Kurs & Gold spot masih statis (placeholder, nanti backend harian).
- **Cash out + infrastruktur pending**: flow Cash out (sumber non-Grow & non-Unsorted, nominal via stepper +/− Rp 10.000,
  3 metode opsional [Transfer e-wallet / Give me cash / Buy it for me] yang disembunyikan di Little, alasan **wajib**).
  Semua request (Cash out/Grow/Harvest) masuk store `REQUESTS` terpusat → 3 lapis awareness: badge kartu Grow,
  banner "N requests waiting" di Home (semua tier), dan layar **Requests** (antrean penuh, tap baris = simulasi approval).
  Ini sekaligus fondasi sisi-anak untuk Approval Inbox ortu (Backlog G).
- **Halaman Missions** (kerangka UI, konten sampel): daily state-aware + event (THR) + 6 chapter,
  pasangan Learn→Practice dgn gembok, lesson flow (panel → kuis interaktif → kalimat kunci → stars),
  tier-aware (Little 2+1 / Middle 3+2 / Teen 3+3), Practice "Sort" deep-link ke flow Sort asli lalu auto-selesai.
- **Halaman Me** (rename dari "Trophies"): avatar+tier pill, stats, badges grid, **theme picker 5 warna**
  (brand/aksen saja — warna kategori tetap, karena itu alat belajar), toggle bahasa EN/ID (placeholder), buddies.
- **Sisi Orang Tua Fase 1** (`celengan-parent-mockup.html`, file terpisah): Login 2-pintu (ortu email+password,
  anak email-ortu+PIN 6-digit), Dashboard dgn switcher multi-anak (ring+legend sama bahasa dgn kid app),
  **Requests** = approval inbox 2-langkah (Needs OK → To do → Done, approve ≠ payment) + jawaban ketiga
  "Talk about it". Aturan potong uang dikunci: Spend/Unsorted/Free savings boleh, dream/Give/Grow terlindungi.
  Nada visual: login hangat/playful (sama dgn kid app), interior ringkas/padat (ikon garis, angka tabular,
  legend %+nominal) dgn palet tetap cerah (bukan abu/gelap) — warna kategori & status identik kid app.
  Missions & Settings = placeholder roadmap (bukan kosong).
- **Sisi Orang Tua Fase 2**: **Send money** (nominal + tag sumber wajib: Allowance/THR/Birthday/Prize/
  From family/Other + catatan opsional — selalu mendarat di Unsorted, bukan langsung ke kategori).
  **Take money** (kantong terlindungi tetap terlihat tapi digembok dgn sebab spesifik, bukan disembunyikan;
  alasan wajib simetris dgn anak; pratinjau notifikasi kata-per-kata yang akan anak terima). **Add a child**
  (nama, bulan+tahun lahir saja, tier disarankan otomatis dari usia tapi bisa di-override tanpa
  menghakimi, PIN 6-digit). Data model direfactor jadi sub-wallet per anak (bukan cuma total kategori)
  supaya aturan proteksi Take money bisa ditegakkan per-wallet.
- **Perbaikan lintas-app**: notifikasi/strip pending di Dashboard ortu jadi per-anak (bukan gabungan semua
  anak); pemisah ribuan ("50,000") di semua input nominal, di kid app maupun parent app.
- **Sisi Orang Tua Fase 3**: Settings jadi nyata — **Allowance schedule** (auto-credit tanpa konfirmasi,
  frekuensi + hari, pratinjau tanggal berikutnya, tombol demo), **Your bank rates** (ortu tetapkan bunga
  per tenor → request deposito bisa di-approve 1 tap), **Today's prices** (emas jual/buyback + 3 kurs +
  tombol simulasi hari berikutnya), **Manage investments** (detail per instrumen + countdown TD).
- **REVISI BESAR — Grow jadi simulasi, ortu = bank** *(mengubah asumsi awal; detail lengkap di handoff)*:
  tak ada kewajiban ortu benar-benar beli aset (mustahil di skala uang anak: deposito min. jutaan, emas
  Antam min. 0,5 g). Harga tetap riil dari feed (Antam jual/buyback, kurs harian ±1% spread); rate deposito
  ditetapkan ortu. **Konsekuensi**: (a) "Approve ≠ Fulfilled" kini hanya untuk Cash out — Grow/Harvest
  approve = selesai seketika, tahap "To do" & form "Record what you did" dihapus; (b) nilai ditandai di
  harga jual → emas mulai ~-9%, valas ~-2% (spread = pelajaran, ada kartu penjelas di layar Harvest emas);
  (c) emas skala realistis dlm mg (Rp 21.000 ≈ 14,5 mg); (d) risiko pasar ditanggung ortu → ada disclosure;
  (e) alasan asimetri Grow berubah dari "fisika aset riil" jadi "kebijakan ortu-sebagai-bank".
  Angka contoh direkalkulasi: total Arthur **484.711** (dulu 485.750), disamakan di kedua mockup.
- **Fase 4 — Missions, Prizes & ekonomi reward** *(detail lengkap di handoff)*:
  **Dua mata uang** (⭐ kurikulum→kosmetik, 💎 chores→hadiah nyata) + **tiga gerbang** (⭐lifetime≥100 buka
  sistem chores; Chapter 2 buka achievement & hadiah besar ≥25💎; materi mingguan buka **penukaran** — bukan
  perolehan, supaya kontribusi keluarga tetap tak bersyarat). **⭐ dipisah lifetime vs saldo** (konsekuensi paksa:
  kalau tidak, beli avatar akan mengunci ulang chores). Sisi anak: "Jobs from home", Prizes, avatar shop.
  Sisi ortu: kartu **Learning** (tracker + status gerbang + benih conversation starter), **Jobs builder terpandu**
  (3 jenis; kontribusi = 💎 saja, opsi uang tak muncul), **Prizes** + pratinjau "berapa lama untuk dapat".
- **Bug lama diperbaiki**: kartu "Rp 50.000 just arrived!" di Home anak ternyata **teks statis** — tak ikut
  berubah saat Unsorted berubah, padahal ring-nya berubah, jadi kartu & ring bisa saling bertentangan.
  Sekarang sinkron dari `UNSORTED` dan otomatis hilang saat nol.
- **Bug CSS ke-3 diperbaiki**: `.badges` halaman Me bentrok dgn `.badges` topbar Home → pil streak/bintang
  dipaksa jadi grid 3 kolom. Rename jadi `.badgegrid`. **Audit class ganda otomatis kini jadi langkah rutin.**
- **Fase 5 — Give flow, minus-point, & bersih-bersih bug** *(detail lengkap di handoff)*:
  **Give dapat flow sendiri** — "Cash out" diganti "Give it away" (6 causes kultural + tulis sendiri),
  Give dihapus dari sumber Cash out biasa, dan lingkaran ditutup lewat state machine ke-5: approve → To do
  **+ form cerita wajib** sebelum bisa ditutup, anak bisa membalas di "Where my giving went".
  **Minus-point raid dream** akhirnya dibangun: ⭐−15 flat, memotong SALDO saja (bukan lifetime — supaya
  tak mengunci ulang chores), peringatan tampil sebelum konfirmasi.
  **Streak dihapus total** (bukan diperbaiki — ditolak sbg konsep, lihat Backlog B).
  **2 bug lama ditemukan & diperbaiki**: kartu "Rp 50,000 just arrived!" di Home ternyata teks statis,
  tak ikut UNSORTED (bisa bertentangan dgn ring) — sekarang sinkron & hilang otomatis saat 0; topbar ⭐
  hardcoded "240" sementara halaman Me bilang "120" — sekarang disambungkan ke STARS asli.

---

## M. Monetisasi & Premium — item tertunda (spec utama di `premium-setting.md`)

Keputusan pembagian Free/Pro sudah **disepakati & ditulis di `premium-setting.md`**. Yang tersisa di backlog:

- **M1. Growth Reward (`GROW_REWARD`) — `[BLOCKED — butuh build]`.** SATU-satunya keputusan premium yang menambah
  scope nyata (mekanik bunga tabungan simulasi + scheduler bulanan "Hari Tumbuh" + layar rate ortu di "Your bank
  rates"). Free, COGS nol, tier-aware (Little ~5%/bln; Middle/Teen ~1–2%/bln, TD wajib > GR). Berperan sebagai
  **penyebut** yang membuat Time Deposit punya arti (menutup bug: uang diam di Save saat ini menghasilkan nol).
  Mendarat proporsional ke wallet Save penghasil (bukan Someday/Unsorted). Aturan tangga + cap wajib. Detail §5.
- **M2. Rapor Literasi Finansial (Pro) — formula-first.** 3 lapis (angka deterministik → rubrik konstanta 5 dimensi
  → narasi template; LLM maksimal lapis 3, tak pernah sentuh angka — C3). Cadence per-semester. Metrik sumber sudah
  ada di `financial_literacy.md` §7. Detail §6.
- **M3. Akun ortu kedua = kolom `sender_id`/`actor_id` + `parent.displayName` (free text).** Cost ~nol, tapi belum
  dibangun di mockup. Jual identitas, bukan akses (§4).
- **M4. Gating flags** `PLAN`/`isPro`/`LIMITS` di app ortu (§3). **Constraint C1**: app anak render dari kapabilitas
  aktif, BUKAN dari plan — tidak ada `<ProLock/>` di app anak. GR bukan bagian flag `grow`.
- **M5. Slot iklan (app ortu saja, C2)** P1–P4 + daftar-tidak (§7). Belum ada inventory/komponen.
- **M6. Paywall flow + pembayaran — ⚠️ DIKOREKSI.** Rencana lama ("QRIS/GoPay/transfer via checkout web")
  **batal untuk iOS**: storefront Indonesia tidak dapat pengecualian anti-steering, pengecualian Reader App
  tidak berlaku, dan jalur pembayaran luar membawa risiko terminasi akun. Yang berlaku: **Apple IAP** (Program
  Usaha Kecil 15%) untuk iOS — **pasar utama**; **Google Play Billing + User Choice Billing** untuk Android
  (Xendit/Mayar sah, hemat ~4%). Momen paywall tetap: setelah Sort pertama berhasil (§8).
- **M7. Arsitektur entitlement (BARU).** Empat tabel — `entitlements`, `iap_receipts`, `schools`,
  `school_members` — dengan satu resolver `isPro(user)`. Aturan UX yang sudah dikunci: **tombol upgrade
  tidak pernah tampil untuk pengguna sekolah**, dan kolom kode sekolah dikubur di Settings.
- ~~**M8. Model harga belum final.**~~ ✅ **selesai 30 Juli 2026** — [ADR-0018](decisions/0018-harga-sekali-bayar.md)
  menutup D3: sekali bayar Rp 399.000, bukan hibrida. Risiko struktural (pendapatan sekali vs kewajiban
  seumur pemakaian) diterima sadar, bukan diselesaikan — dicatat, ditinjau ulang kalau D4 jatuh ke PWA.

## N. Family Circle (ditunda — pernah diusulkan, ditolak untuk v1)
Undang keluarga besar (kakek/nenek/om/tante) untuk lihat dream & ikut nyumbang (tetap butuh konfirmasi ortu,
jangan rusak Model A). Growth loop + kultural. **Keputusan v1: TIDAK** — Ghozy menilai keluarga besar mungkin
kurang peduli & menambah kompleksitas. Simpan kalau nanti data bilang sebaliknya.

## O. B2B sekolah — ⚠️ DILURUSKAN (dulu terbaca bertentangan dengan console)
Dua pernyataan yang tampak bertabrakan sebenarnya menjawab pertanyaan berbeda. Versi yang benar:

**Strategi go-to-market: JANGAN dikejar aktif.** Kurikulum (`financial_literacy*.md`) sudah ~80% siap jadi
bahan B2B dan "Rapor Literasi Finansial" adalah bahasa yang sekolah paham — tapi Ghozy pegawai kantoran tanpa
waktu untuk sales cycle. Masuk hanya kalau partner datang sendiri. Ganti strategi: **webinar/paket edukasi**
(B2B versi solo — rekam sekali, jual selamanya; puncak Ramadan/THR & Juli/tahun-ajaran). Ini juga mesin
revenue berulang yang menutup lubang sekali-bayar.

**Jalur teknis: SIAP, dan itu tidak bertentangan.** Console sudah memodelkan plan Sekolah, tabel kursi, dan
peran Admin sekolah; arsitektur entitlement sudah punya tabel `schools` & `school_members` (lihat M7). Jalurnya
**Enterprise Services (Pedoman App Store 3.1.3(c))** — diprovisikan sepenuhnya di luar app store, jadi tidak
melanggar aturan IAP. Aturan UX yang sudah dikunci: **tombol upgrade tidak pernah tampil untuk pengguna
sekolah**, kolom kode sekolah dikubur di Settings.

*Ringkasnya: pintunya dibuat dan dipasang, tapi tidak ada yang berdiri di depannya menawarkan.*

## P. OTP berbasis versi (opsi cadangan, jangan dipikirkan sekarang)
Kalau lubang revenue front-loaded OTP jadi masalah: "Celengan Pro 2026" milik selamanya, versi major berikutnya
beli lagi dgn diskon upgrade (pola Sketch/Fantastical). Catat saja.

## Q. Affiliate versi aman (kalau tetap mau — ditolak untuk sekarang)
BUKAN di dream anak (membunuh premis: sabar/menunda/butuh-vs-ingin). Hanya di **momen fulfilment ortu** (app ortu,
setelah cash-out di-approve, saat ortu sudah pasti beli). Ekonomi kecil (komisi 1–5%). Sudah tercakup sbg slot P2 di §7.

---

## R. Backlog Console (rincian di `nummi_console.md`)
Console punya backlog sendiri karena permukaannya berbeda sifat (operator, lintas-keluarga, bukan produk):
**C-1** sambungkan ke data nyata · **C-2** autentikasi & peran sungguhan · **C-3** samakan jendela metrik
7 vs 14 hari · **C-4** ekspor CSV · **C-5** mode dukungan harus jadi kebijakan sisi server (row-level
security), bukan penyembunyian di sisi klien · **C-6** jejak audit kebal-hapus · **C-7** validasi ambang
status 14/21/30 hari dengan data nyata.

Yang perlu diketahui dari console **oleh sisi produk**: metrik utara = keluarga aktif mingguan dengan
**siklus uang lengkap** (bukan DAU — mengejar DAU bertentangan dengan misi), metrik kepercayaan =
**utang janji** (`approve → belum ditandai Done`), dan **pemeriksa invarian harian** yang menegakkan
janji produk: `Unsorted + Spend + Save + Give + Grow = Total`, nol gembok Pro di app anak, nol slot iklan
di app anak, nol tombol upgrade untuk pengguna sekolah. Baris ledger yang tidak nol = **insiden P0**.

---

## D. Keputusan yang menunggu (bukan pekerjaan build — tapi memblokir yang lain)
Rincian & rekomendasi ada di `nummi-status.md` §5. Ringkasnya:

| # | Keputusan | Kenapa memblokir |
|---|---|---|
| ~~D1~~ | ~~Bahasa produk~~ | ✅ **diputuskan: Inggris** (ADR-0016) — tidak lagi memblokir |
| ~~D2~~ | ~~Tabel istilah final kategori × tier~~ | ✅ **sama lintas tier** (ADR-0017) |
| ~~D3~~ | ~~Model harga~~ | ✅ **diputuskan: sekali bayar Rp399.000** (ADR-0018) — `LIMITS` ditegakkan di `packages/core/src/plan.ts` |
| ~~D4~~ | ~~Distribusi (native/Expo vs PWA)~~ | ✅ **PWA untuk MVP** (ADR-0019) — bisa dipasang, sengaja tidak offline. **Distribusi v1 tetap terbuka**, dijawab oleh data uji |
| ~~D5~~ | ~~Little & Teen masuk MVP atau tidak~~ | ✅ **Middle saja** (ADR-0020) — ditegakkan lewat `MVP_TIERS`, kode Little/Teen tidak dihapus |
