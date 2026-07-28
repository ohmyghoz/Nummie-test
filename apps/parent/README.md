# apps/parent — app ortu

Responsif: **HP + web dalam satu basis kode.**

**Cakupan S3 dipersempit ke ortu HP dulu** (keputusan 28 Juli 2026). Halaman Insight versi web
adalah permukaan paling berat dan paling tidak mendesak untuk validasi — ia menunggu.

Referensi visual: `legacy/parent-mobile.html`, `legacy/parent-web.html`.

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
