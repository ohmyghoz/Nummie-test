# Keputusan yang MASIH TERBUKA (D3–D5)

**Jangan menjawab salah satu dari ini lewat kode.** Kalau sebuah tugas memaksanya, hentikan dan tanyakan.

Rincian dan rekomendasi ada di `../nummi-status.md` §5.

---

## ~~D1 — Bahasa produk~~ ✅ DIPUTUSKAN

**Tetap Inggris.** Lihat [ADR-0016](0016-bahasa-produk-inggris.md).

Ringkasnya: rekomendasi awal (Indonesia) bersandar pada anak KG B–Grade 2 yang belum bisa membaca
Inggris — tapi cakupan prototipe saat ini **Middle saja** (D5), jadi argumen itu menjawab masalah
yang belum dimiliki. Semua string tetap lewat `copy/`, jadi keputusan ini tetap murah dibalik.

**Ditinjau ulang kalau** D5 memasukkan Little ke cakupan.

---

## ~~D2 — Satu tabel istilah final (kategori × tier)~~ ✅ DIPUTUSKAN

**Sama untuk ketiga tier.** Lihat [ADR-0017](0017-istilah-kategori-sama-lintas-tier.md).

`Unsorted · Spend · Save · Give · Grow` — pasangan Indonesia `Uang Baru · Pakai · Simpan · Berbagi ·
Bertumbuh`. Design system §13.1 sudah ditulis ulang mengikuti; ia satu-satunya sumber yang menyimpang.

Alasannya bersandar pada keputusan yang sudah ada: warna kategori dikunci sebagai alat belajar yang
tak pernah berubah, jadi namanya mengikuti logika yang sama. Risiko yang diambil sadar: Teen bisa
merasa "Save"/"Give" kekanak-kanakan.

**Aturan yang TETAP berlaku:** istilah diakses lewat lookup `[tier][kategori]`, tidak pernah teks
mati — ketiga nilainya identik, tapi bentuknya yang menjaga keputusan ini murah dibalik.

**Ditinjau ulang kalau** D5 memasukkan Teen dan uji pengguna menunjukkan penolakan nyata.

---

## D3 — Model harga

`premium-setting.md` mengunci one-time Rp399.000. Risiko struktural sekali-bayar sudah
teridentifikasi; usulan model hibrida (founding-member seumur hidup terbatas → langganan) belum final.

**Aturan sementara:** resolver `isPro()` sudah ada dan dipakai; bentuk paywall belum dibangun.

---

## D4 — Distribusi (native/Expo vs PWA)

Lihat [ADR-0013](0013-web-first-d4-tetap-terbuka.md). Web-first adalah alat validasi, bukan jawaban.

**Aturan sementara:** seluruh logika bisnis tinggal di `packages/core` tanpa dependency framework,
supaya pilihan apa pun tetap murah.

---

## D5 — Little & Teen masuk MVP atau tidak

Di app anak, pemilih tier sengaja dimatikan (`harness()` mengembalikan `null`) sehingga hanya Middle
yang bisa didemokan, walaupun logika Little & Teen ada di kodenya.

**Aturan sementara:** tier = feature flag. **Jangan menghapus kode Little/Teen** — biayanya besar
untuk dibangun ulang, kecil untuk dibiarkan mati sementara.
