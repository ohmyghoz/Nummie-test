# apps/kid — app anak

Responsif: **HP + iPad dalam satu basis kode.** Ini bukan detail teknis, ini alasan utama
memilih web lebih dulu — di lima mockup terpisah, paritas iPad adalah pekerjaan yang tak pernah
selesai; di sini ia berhenti jadi pekerjaan dan jadi breakpoint.

Referensi visual: `legacy/kid-mobile.html` dan `legacy/kid-ipad.html`. **Referensi, bukan sumber
kebenaran** — angka diambil dari `packages/core/src/seed.ts`.

## Status: irisan siklus uang sudah dibangun

```
npm install
npm run kid:dev     # http://localhost:3100
npm run kid:build
```

**Nav kanonik sudah terpasang** (handoff): Home / Wallets / **(+)** / Missions / Me —
dengan **(+) sebagai hub aksi** di `/add`. Sort, Move, Give, Grow, dan Requests hidup di dalam
hub itu, bukan berebut tempat di bar bawah.

**Sudah ada:** Home · Wallets · **Sort** · **Move money** · **Give** (+ "Where my giving went") ·
**Grow** (+ Harvest) · Requests · **Missions** · **Me**.

Di hub aksi, aksi yang belum bisa dilakukan **tidak dirender** — aturan yang sama dengan I3
(fitur non-aktif = tidak tampil, bukan tampil-terkunci). Tombol mati mengajari anak bahwa
app-nya bohong.

**Belum ada:** isi pelajaran (kuis Learn→Practice) · Prizes/Jobs · Forex "Add money" per mata uang.

## Sumber data — SUDAH tersambung Supabase (29 Juli 2026, U-2 irisan 1)

`lib/data.ts` → `getKidData()` tetap satu-satunya pintu; **tidak ada halaman yang berubah selain
menambah `await`.** Yang berubah isinya:

| Dari Supabase (nyata) | Masih dari seed, dan kenapa |
|---|---|
| wallet · ledger · `money_rules` · request · `child_economy` | **harga Grow** — feed harga di luar cakupan S1–S3 (backlog T), tabelnya belum ada |
| | **Missions chapter** — kurikulum belum punya tabel sama sekali |
| | **avatar anak** — `children` belum punya kolomnya; avatar shop (Fase 4) belum persisten |

Artinya **Home, Wallets, Sort, dan Requests menampilkan angka sungguhan**, sementara **Grow dan
Missions masih setengah demo.** Itu keadaan yang disengaja untuk irisan pertama, bukan yang terlewat.

**Saldo tetap dihitung `@nummi/core` dari baris ledger**, bukan diambil dari view `wallet_balances`.
Dengan begitu I1 dijaga kode yang sama yang diuji 176 test, dan view di database jadi pemeriksa
silang yang independen — bukan sumber kebenaran kedua yang bisa menyimpang diam-diam.

## Menulis (irisan 2 — Sort saja, sejauh ini)

**Sort sudah benar-benar menulis ledger**, dan sudah dibuktikan dari app yang jalan: Unsorted
50.000 → 0, Spend +20k, Save +20k, Give +10k, total tetap **484.711** (Sort itu perpindahan
internal — kalau totalnya berubah, itu justru bug). Ketiga baris ber-`created_at` identik, bukti
mereka lahir dari satu pernyataan. Klik kedua saat Unsorted kosong tidak menulis apa pun.

Tombol Confirm dulu `<a href="/">` — layar yang berpura-pura sudah menyimpan. Sekarang ia server
action `applySort()` di `lib/actions.ts`.

⚠️ **Yang BELUM dijaga: dua klik cepat.** Keduanya membaca Unsorted 50.000, keduanya menulis, dan
saldo Unsorted jadi negatif. Tidak ada constraint yang mencegahnya — `negative_wallets` cuma
dipantau view, tidak ditegakkan. Lihat backlog U-9.

Move · Give · Grow **masih berhenti di "menunggu orang tua"**. Polanya sudah ada; tinggal diikuti.

Tiga hal yang dikunci di `lib/actions.ts` dan tidak boleh dilonggarkan:

1. **Identitas anak tidak pernah dari input klien** — selalu dari pembacaan ber-token yang
   dijaga RLS. `childId` yang datang dari `formData` adalah bug keamanan, bukan kemudahan.
2. **Aturan uang tidak ditulis ulang di server action** — rencananya dari `sortPlan()` yang
   sama dengan yang dipakai pratinjau. Kalau keduanya berbeda, anak belajar app-nya berbohong.
3. **`?mode=` demo tidak pernah ikut ke jalur tulis.** Kalau ikut, anak tinggal menambahkan
   `?mode=flexible` di URL untuk keluar dari mode Strict yang dipasang ortunya.

Satu `insert` berisi banyak baris = satu pernyataan SQL = **atomik**. Bukan detail gaya: ledger
append-only (ADR-0014) berarti Sort yang separuh tertulis tidak bisa dibatalkan, hanya ditambal
baris pembalik. Separuh-jadi harus mustahil, bukan sekadar jarang.

Butuh `SUPABASE_SECRET_KEY` di `apps/kid/.env.local` — sejak migrasi 0009 tidak ada peran
ber-RLS yang boleh menulis ledger, jadi service key adalah satu-satunya jalan, dan ia hanya
hidup di server action.

## Masuk

Anak mengetik **kode keluarga + PIN** (ADR-0012 §A1) — tidak ada daftar anak, dan tidak ada
`childId` yang harus diketik. Server yang mencari siapa dia, dan **menolak kalau dua anak
ber-PIN sama** daripada menebak.

Token disimpan di **cookie httpOnly**, bukan localStorage: server component tidak bisa membaca
localStorage, dan app anak dipakai di perangkat berbagi. Ada tombol keluar di layar **Me** —
tanpa itu, sesi 12 jam berarti siapa pun yang memegang HP berikutnya adalah anak ini.

Butuh `apps/kid/.env.local` (contoh di `.env.example` root). Kalau kosong, app **melempar galat**
dan tidak diam-diam jatuh ke data seed — app uang yang menampilkan angka demo tanpa memberi tahu
siapa pun lebih buruk daripada halaman yang tidak mau terbuka.

Mode Strict/Flexible bisa dicoba lewat `?mode=strict` — **alat demo**, bukan fitur produk.
Di produksi mode datang dari `money_rules` milik ortu.

## Yang harus ditutup saat dibangun (jangan diport apa adanya)

| | Item |
|---|---|
| | Item | Status |
|---|---|---|
| **A-sisa-1** | Rasio auto-split ortu harus **muncul & berlaku** di layar Sort | ✅ rasio dibaca dari `money_rules` lewat `sortPlan()`; tidak ada angka mati. Test membuktikannya dengan rasio non-default (10/70/20) |
| **C** | Mode **Strict harus ditegakkan** | ✅ `sortPlan().locked` mengunci slot dan menampilkan **kenapa**, bukan tombol mati |
| **X5** | Hapus badge "🔥 7-day streak" | ✅ tidak pernah dirender |
| **X6** | Bawa masuk wordmark + maskot | 🟡 wordmark + koin sudah ada; **maskot kancil belum** (butuh aset dari `docs/assets/`) |
| **X1** | Semua nominal lewat `formatRp()` | ✅ nol nominal hardcode |

## Batas yang tidak boleh dilanggar

- **Nol gembok Pro.** Fitur Pro non-aktif = **tidak tampil**, bukan tampil-terkunci. Grow tidak
  muncul di nav kalau non-Pro.
- **Nol slot iklan.**
- Semua upsell hanya hidup di app ortu.

Produk ini mengajari anak menahan impuls konsumtif. Memakai impuls anak untuk berjualan akan
membunuh premisnya.
