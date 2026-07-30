# Keputusan D1–D5 — semuanya sudah terjawab (30 Juli 2026)

**Berkas ini sekarang arsip, bukan daftar tugas.** Ia dipertahankan karena yang berharga bukan
keputusannya melainkan **pemicu tinjau ulang** masing-masing: itu yang memberi tahu kapan sebuah
keputusan harus dibuka lagi, dan tanpanya keputusan lama membeku jadi kebenaran.

Satu pertanyaan tetap terbuka dan sengaja tidak dipaksakan: **distribusi v1** (native vs PWA).
ADR-0019 menjawab D4 hanya untuk cakupan MVP; versi v1 dijawab oleh **data uji 30 keluarga**
(daftar datanya di [ADR-0013](0013-web-first-d4-tetap-terbuka.md)).

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

## ~~D3 — Model harga~~ ✅ DIPUTUSKAN

**Sekali bayar Rp399.000.** Lihat [ADR-0018](0018-harga-sekali-bayar.md).

`LIMITS` di `premium-setting.md` §3 sekarang jadi kode (`packages/core/src/plan.ts`) dan
**ditegakkan** — sebelum ini `isPro()` tidak pernah dipanggil satu app pun.

**Ditinjau ulang kalau** biaya marjinal per keluarga berhenti mendekati nol · keluarga yang masuk
terlambat terbukti menolak harganya · atau **D4 jatuh ke PWA** (tanpa potongan 15%, QRIS kembali
mungkin).

**Yang BELUM dibangun, dan sengaja tidak dipalsukan:** pembelian sungguhan. Apple IAP butuh app
native, dan D4 belum dijawab — jadi tombol "Buka Pro" belum menjanjikan apa pun. Checkout palsu di
prototipe uji akan mengajari kesimpulan yang salah tentang minat membeli.

---

## ~~D4 — Distribusi (native/Expo vs PWA)~~ ✅ DIJAWAB UNTUK MVP

**PWA — bisa dipasang, sengaja tidak offline.** Lihat [ADR-0019](0019-d4-pwa-untuk-mvp.md).

Yang membuatnya bisa dijawab bukan data baru melainkan **cakupan**: satu-satunya hal yang memaksa
native adalah Apple IAP (ADR-0010), dan MVP tidak menjual apa pun. Tanpa penjualan, pemaksanya hilang.

Tidak ada service worker — menyimpan saldo di cache berarti menampilkan angka uang yang basi, dan
repo ini punya nol JavaScript klien hari ini.

**Ditinjau ulang kalau** pembayaran sungguhan masuk cakupan · ortu terbukti tidak mau
add-to-homescreen · ada alur yang benar-benar butuh push notification andal.

**Yang masih terbuka:** distribusi **v1**. ADR-0013 tetap berlaku sebagai penjaga — jawabannya harus
datang dari data uji, bukan dari inersia karena "sudah jalan di web".

---

## ~~D5 — Little & Teen masuk MVP atau tidak~~ ✅ DIPUTUSKAN

**Middle saja.** Lihat [ADR-0020](0020-d5-middle-saja-untuk-mvp.md).

⚠️ **Kalimat lama di berkas ini keliru** dan sempat membuat D5 tampak sudah beres: *"pemilih tier
sudah dimatikan, `harness()` mengembalikan `null`."* Itu menggambarkan mockup beku di `legacy/`.
Di app nyata tier dibaca dari database dan **ketiga tier ditawarkan** saat menambah anak. D5 sekarang
ditegakkan lewat `MVP_TIERS` + `validateChild()` di `packages/core`, dengan test.

**Aturan yang TETAP berlaku:** tier = feature flag. **Jangan menghapus kode Little/Teen.**

Ikut tertutup: pemicu tinjau ulang ADR-0016 (bahasa) dan ADR-0017 (istilah) keduanya bergantung pada
D5 memasukkan Little/Teen — keduanya tidak menyala di MVP.

**Ditinjau ulang kalau** cakupan diperlebar setelah MVP. Kalau yang ditambahkan Little, tinjau
ADR-0016 **lebih dulu**, sebelum layarnya dibangun.
