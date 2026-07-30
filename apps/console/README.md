# apps/console — console admin

**Dibangun duluan, dan tipis** (ADR-0015). Bukan produk; alat untuk melihat apakah model datamu
benar sebelum satu komponen anak atau ortu ditulis.

100% bahasa Indonesia, dan format rupiahnya sudah benar sejak awal — console tidak terhalang D1
maupun D2. Referensi: `legacy/console.html`.

## Cakupan sekarang: hanya C-1 — ✅ dibangun

Keluarga & anak · saldo wallet (dari view) · ledger mentah · antrean request dengan **utang janji**
· hasil pemeriksa invarian. **Baca saja** — console tidak pernah dipakai mengubah data keluarga
di fase ini.

Dibangun dengan Next.js (App Router, server component, tanpa JS klien). Semua angka dihitung oleh
`@nummi/core` (`walletBalances`, `pocketBalances`, `checkLedgerHealth`, `promiseDebt`) — console tidak
pernah menghitung ulang sendiri.

### Menjalankan

```
npm install
npm run console:dev     # http://localhost:3000
npm run console:build   # build produksi
```

### ⚠️ Gerbang wajib — `CONSOLE_PASSWORD`

Console membaca **service role, lintas keluarga, RLS dilewati.** Satu halamannya berisi saldo
setiap anak di setiap keluarga.

```
CONSOLE_PASSWORD=<rahasia panjang>
```

**Gagal-tertutup**: tanpa nilai itu, console menjawab `503` untuk semua permintaan — termasuk yang
membawa password benar. Lupa memasang env terlihat seketika, bukan membuka pintu diam-diam.

Bentuknya cookie httpOnly bertanda tangan HMAC (`lib/session.ts`), sama seperti login anak & ortu —
bukan basic auth. Alasannya di [ADR-0021](../../docs/decisions/0021-console-boleh-dideploy-dengan-syarat.md):
basic auth mengirim password di setiap permintaan, dan satu-satunya tempat memeriksanya adalah
middleware (Edge) — rate limiting di sana berarti satu round-trip database per aset.

**Mengganti `CONSOLE_PASSWORD` langsung membatalkan semua sesi**, karena kunci HMAC diturunkan
darinya. Itu disengaja.

### Boleh di-deploy? Ya — dengan tiga lapis sekaligus

[ADR-0021](../../docs/decisions/0021-console-boleh-dideploy-dengan-syarat.md) mengamandemen
ADR-0015. Console boleh punya URL, tapi **hanya** kalau ketiganya ada:

1. **Vercel Deployment Protection menyala** (lapis platform, sebelum kode app tersentuh)
2. **Gerbang aplikasi gagal-tertutup** (di atas)
3. **Rate limiting** — `console_login_attempts`, migrasi 0017. Dua lapis: 5 kegagalan / 15 menit
   per IP, 30 / 15 menit global

Kurang satu → kembali ke `npm run console:dev` di mesin sendiri.

**Kunci diperiksa sebelum password.** Kalau dibalik, IP yang sudah terkunci tetap mendapat oracle.
Diuji: percobaan ke-6 dijawab terkunci, dan password **benar** sesudahnya tetap ditolak.

### Tiga lubang yang ditutup 30 Juli 2026 — tidak satu pun terlihat sampai diuji

1. **Halaman ini diprerender jadi HTML statis saat build.** Console tidak memakai
   `cookies()`/`headers()`, jadi Next menganggapnya statis dan memanggil service role **di waktu
   build**, lalu menulis hasilnya ke `.next/server/app/index.html` — 58 KB berisi saldo nyata, siap
   di-cache CDN. Ditutup dengan `export const dynamic = 'force-dynamic'`. Ia sekaligus bug
   kebenaran: pemeriksa invarian yang membeku di waktu build tidak memeriksa apa pun.
2. **Tidak ada gerbang sama sekali.**
3. **Aturan keamanannya hidup di komentar kode**, mengatasnamakan ADR-0015 yang tidak pernah
   menulisnya. Sekarang ada di ADR-0021.

### Sumber data

**Supabase, lintas keluarga** (sejak 30 Juli 2026) — `lib/data.ts` → `getConsoleData()`, satu-satunya
tempat yang menyentuh database. Tidak ada berkas di `app/` yang perlu tahu asal datanya.

Taruhan desain itu terbayar persis seperti rencananya: saat sumbernya ditukar dari seed kanonik ke
query nyata, **tidak satu pun komponen berubah.**

## Masih di backlog, jangan dikerjakan sekarang

C-2 auth & peran sungguhan · C-3 samakan jendela metrik 7 vs 14 hari · C-4 ekspor CSV ·
C-5 mode dukungan sebagai kebijakan sisi server · C-6 jejak audit kebal-hapus ·
C-7 validasi ambang status 14/21/30 hari dengan data nyata.

## Metrik utara

**Keluarga aktif mingguan dengan siklus uang lengkap** — bukan DAU. Mengejar DAU bertentangan
dengan misi produk, dan console tidak boleh jadi alat yang menggodanya.

## Tersambung Supabase (30 Juli 2026) — lintas keluarga, baca-saja

Console memakai **service role**, dan di sini itu memang alatnya. Di app anak & ortu service role
adalah pengecualian yang dijaga ketat; console justru harus melihat semua keluarga sekaligus untuk
menjawab pertanyaan yang tidak bisa dijawab dari dalam satu keluarga: *"apakah ada invarian yang
pecah di suatu tempat?"*

Konsekuensinya: console **tidak punya login** dan **tidak boleh dipublikasikan** bersama app
produk. Operator menjalankannya di lingkungan yang dia kendalikan (ADR-0015). Tetap **baca-saja**
(C-1) — tidak ada satu pun penulisan.

### Pemeriksaan silang menggantikan rekonsiliasi seed

Dulu console memeriksa `total === SEED_TOTAL` — masuk akal selama datanya seed, tidak berarti
apa-apa begitu ada keluarga sungguhan. Sekarang ia membandingkan **dua perhitungan independen atas
angka yang sama**: `@nummi/core` menghitung dari baris ledger, view `wallet_balances` menghitung di
database. Berbeda = salah satu salah, dan itu dihitung sebagai insiden P0 apa pun penyebabnya.

Karena itu console TIDAK memakai angka database untuk kedua sisi. Kalau ia melakukan itu, ia cuma
membandingkan sesuatu dengan dirinya sendiri.

### Galat query melempar, tidak ditelan

Versi pertama saya memakai `?? []` untuk semua query. Hasilnya: saat query gagal, console
menampilkan **"0 keluarga · 0 insiden P0"** — melaporkan SEHAT justru ketika ia tidak tahu apa-apa.
Itu kebohongan paling berbahaya yang bisa dilakukan permukaan ini, jadi sekarang setiap galat
query melempar.
