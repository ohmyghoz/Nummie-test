# Keputusan yang MASIH TERBUKA (D4–D5)

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
