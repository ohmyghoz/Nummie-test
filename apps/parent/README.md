# apps/parent — app ortu

Responsif: **HP + web dalam satu basis kode.**

**Cakupan S3 dipersempit ke ortu HP dulu** (keputusan 28 Juli 2026). Halaman Insight versi web
adalah permukaan paling berat dan paling tidak mendesak untuk validasi — ia menunggu.

Referensi visual: `legacy/parent-mobile.html`, `legacy/parent-web.html`.

## Status: irisan penutup-siklus sudah dibangun

```
npm install
npm run parent:dev     # http://localhost:3200
npm run parent:build
```

**Sudah ada:** Dashboard (switcher + ring + strip pending **per-anak** + utang janji) ·
**Approval inbox 5-jalur** · Send money · Take money · Money rules ·
**Settings** (jadwal uang saku · bunga bank · harga hari ini · kelola investasi).

Nav: Dashboard / Requests / Send / Settings. **Money rules sengaja TIDAK di nav** — ia setelan
**per-anak**, dicapai dari kartu anak di Dashboard; Settings adalah setelan tingkat akun.

**Add a child** · **Jobs & Prizes builder**.

**Belum ada:** Insight · Transactions · undang ortu kedua · Learning tracker.

⚠️ **Hitung mundur deposito belum bisa dipercaya.** Setiap baris ledger di seed memakai
`createdAt` placeholder yang sama (`2026-07-01`), jadi tanggal bilang "153 hari lagi" sementara
bunga Rp750 sudah tercatat dan seed memang memaksudkan "sudah jatuh tempo". Sesuai prinsip
`core/grow.ts`, **ledger yang berwenang**: bunga tercatat = jatuh tempo. Hitung mundur berbasis
tanggal baru sahih setelah S1b memberi tanggal mulai sungguhan per instrumen.

**Belum persisten** — keputusan di inbox menampilkan hasilnya lewat `@nummi/core`, tapi belum
menulis ledger. Penulisan menunggu S1b.

⚠️ **Jalur cerita Give belum bisa dicoba dari seed.** Seed kanonik hanya berisi satu request
(cash out Rp25.000), jadi cabang "Give butuh cerita" ada di kodenya dan diuji di
`packages/core/test/give.test.ts`, tapi tidak muncul di layar sampai ada request Give sungguhan.

## Yang harus diperbaiki saat diport (mockup ortu menyimpang dari daftar kanonik)

| | Item |
|---|---|
| **X2** | Target dream: pakai **BMX 300.000 / Headphones 100.000** (angka app anak), bukan 400.000/60.000 |
| **X3** | Request pending: **Rp25.000** |
| **X4** | Rasio seed: **40/40/20**, bukan 40/40/10 |

Semua sudah benar di `packages/core/src/seed.ts` — ambil dari sana, jangan ketik ulang.

## Dua suara, satu produk

Login tetap hangat (satu-satunya layar yang ortu **dan** anak sama-sama berdiri di depannya).
Interior ringkas: ikon garis, angka tabular, hairline border. Ortu membuka app di sela kesibukan.

Yang **tidak pernah** berubah dari sisi anak: warna kategori dan warna status. Kalau ikut di-tema,
ortu dan anak berhenti membicarakan hal yang sama.
