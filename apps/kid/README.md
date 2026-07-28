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

**Sudah ada:** Home (ring kantong + total + kartu "uang baru" + progres dream) · Wallets
(dikelompokkan per kantong) · **Sort** · Requests.

**Belum ada di irisan ini:** Missions · Me · flow Add/Move money · flow Give · flow Grow/Harvest.
Nav sengaja **tidak** merender tombol untuk layar yang belum ada — tombol yang tidak melakukan
apa-apa mengajari anak hal yang salah.

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
