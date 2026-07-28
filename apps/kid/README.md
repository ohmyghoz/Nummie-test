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

**Belum persisten.** Semua flow berhenti di layar "menunggu orang tua" dan belum menulis ledger —
penulisan menunggu S1b (Supabase). Yang sudah nyata: aturannya, validasinya, dan angkanya.

Sumber data: seed kanonik `@nummi/core`, dibungkus di `lib/data.ts` → `getKidData()`.
Itu titik tukar S1b; UI tidak menyentuh seed langsung.

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
