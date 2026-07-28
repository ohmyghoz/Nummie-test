# Keputusan yang MASIH TERBUKA (D2–D5)

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

## D2 — Satu tabel istilah final (kategori × tier)

**Ini lebih ringan dari kelihatannya — dua dari tiga sumber sudah sepakat.** Lembar karakter yang
sudah disetujui memberi label dwibahasa berpasangan (SPEND/PAKAI · SAVE/SIMPAN · GIVE/BERBAGI ·
GROW/BERTUMBUH), persis sama dengan brand system §5.2 dan persis sama dengan kalimat posisi resmi.
Yang menyimpang hanya design system §13.1.

**Menyempit setelah ADR-0016.** Karena bahasa produk = Inggris, yang perlu dikunci tinggal sisi
Inggrisnya (SPEND · SAVE · GIVE · GROW), dan itu sudah cocok antara lembar karakter, brand system
§5.2, dan mockup. Sisi Indonesia tetap dijaga tipe di `copy/id.ts` supaya pembalikan tetap murah.

Yang benar-benar perlu diputuskan tinggal: **apakah istilahnya berubah menurut tier atau tidak.**
Argumen untuk tidak berubah: warna kategori sudah dikunci sebagai alat belajar yang tak pernah
berubah — istilahnya sebaiknya mengikuti logika yang sama, kalau tidak anak yang naik tier harus
belajar ulang nama benda yang sama.

**Aturan sementara di repo:** istilah diakses lewat lookup `[tier][kategori]`, tidak pernah teks mati.

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
