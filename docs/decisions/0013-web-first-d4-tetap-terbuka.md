# ADR-0013 — Web = prototipe validasi. D4 TETAP TERBUKA.

**Status:** 🆕 diputuskan 28 Juli 2026

## Keputusan
Prototipe dibangun sebagai aplikasi web (Next.js + Supabase, deploy Vercel) supaya bisa diuji ke
pasangan ortu–anak sungguhan tanpa install, tanpa TestFlight, tanpa review App Store.

**Ini BUKAN jawaban atas D4.** Distribusi final masih terbuka.

## Kenapa ini perlu ditulis sebagai ADR tersendiri
Karena inilah cara keputusan besar mati diam-diam: dibangun di web, jalan di web, lalu setahun
kemudian tidak ada yang ingat pernah ada pilihan. D4 harus dijawab dengan **data**, bukan inersia.

## Yang berubah kalau nanti D4 jatuh ke PWA
- Apple IAP tidak berlaku → potongan 15% hilang → QRIS/GoPay/Xendit langsung jadi mungkin
  (`premium-setting.md` §8 yang sudah dikoreksi jadi berlaku lagi) — lihat ADR-0010
- **Hilang**: discovery App Store, kredibilitas "ada di App Store" (untuk produk uang-anak, di mata
  ortu Indonesia ini bukan hal kecil), push notification iOS yang andal (hanya jalan kalau ditambahkan
  ke Home Screen), dan onboarding anak jadi lebih rapuh

## Data yang harus dikumpulkan prototipe ini untuk menjawab D4
1. Berapa banyak ortu yang benar-benar melakukan **add-to-homescreen** setelah diminta
2. Sebaran perangkat sesungguhnya di keluarga target (iOS vs Android, HP vs iPad)
3. Apakah anak bisa login mandiri lewat browser tanpa bantuan
4. Apakah ortu keberatan "tidak ada di App Store" saat ditanya langsung

## Keuntungan arsitektural yang sudah dipetik
Di web, lima permukaan MVP runtuh jadi tiga: anak HP + iPad menjadi satu basis kode dengan dua
breakpoint, ortu HP + web juga. **Masalah paritas (G2) dan pajak perawatan mockup (H2) berubah dari
pekerjaan menjadi CSS.** Kontradiksi K4/K5/K6 (angka yang menyimpang antar permukaan) menjadi
mustahil terulang karena angkanya satu sumber.

## Penjaga supaya pilihan ini tidak mengunci
Seluruh logika bisnis wajib tinggal di `packages/core` sebagai TypeScript murni tanpa dependency
framework. Kalau D4 jatuh ke native/Expo, paket itu terbawa 100% dan hanya UI yang ditulis ulang.
**`packages/core` tidak boleh mengimpor React, Next, atau Supabase.**
