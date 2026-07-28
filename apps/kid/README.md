# apps/kid — app anak

Responsif: **HP + iPad dalam satu basis kode.** Ini bukan detail teknis, ini alasan utama
memilih web lebih dulu — di lima mockup terpisah, paritas iPad adalah pekerjaan yang tak pernah
selesai; di sini ia berhenti jadi pekerjaan dan jadi breakpoint.

Referensi visual: `legacy/kid-mobile.html` dan `legacy/kid-ipad.html`. **Referensi, bukan sumber
kebenaran** — angka diambil dari `packages/core/src/seed.ts`.

## Yang harus ditutup saat dibangun (jangan diport apa adanya)

| | Item |
|---|---|
| **A-sisa-1** | Rasio auto-split ortu harus **muncul & berlaku** di layar Sort. Mockup masih menulis teks mati "40% Spend / 40% Save / 20% Give default" |
| **C** | Mode **Strict harus ditegakkan**. App anak sekarang tidak mengenal konsep mode sama sekali — ortu bisa menyalakan Strict dan tidak terjadi apa-apa. Gap paling mahal di seluruh backlog |
| **X5** | Hapus badge "🔥 7-day streak" — streak sudah dihapus total, badge itu mustahil didapat |
| **X6** | App anak satu-satunya permukaan **tanpa brand**. Bawa masuk wordmark + maskot |
| **X1** | Semua nominal lewat `formatRp()` — `Rp50.000`, bukan `Rp 10,000` |

## Batas yang tidak boleh dilanggar

- **Nol gembok Pro.** Fitur Pro non-aktif = **tidak tampil**, bukan tampil-terkunci. Grow tidak
  muncul di nav kalau non-Pro.
- **Nol slot iklan.**
- Semua upsell hanya hidup di app ortu.

Produk ini mengajari anak menahan impuls konsumtif. Memakai impuls anak untuk berjualan akan
membunuh premisnya.
