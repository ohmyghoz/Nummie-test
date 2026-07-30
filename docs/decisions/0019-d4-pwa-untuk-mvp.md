# ADR-0019 — D4 dijawab untuk MVP: PWA. Bisa dipasang, sengaja tidak offline.

**Status:** ✅ diputuskan 30 Juli 2026 · menjawab **D4** untuk cakupan MVP ·
melanjutkan [ADR-0013](0013-web-first-d4-tetap-terbuka.md)

## Konteks

ADR-0013 sengaja menolak menjawab D4: web dipilih sebagai **alat validasi**, dan ADR itu memperingatkan
bahwa *"inilah cara keputusan besar mati diam-diam: dibangun di web, jalan di web, lalu setahun kemudian
tidak ada yang ingat pernah ada pilihan."*

Yang berubah hari ini bukan datanya, melainkan **cakupannya**. Satu-satunya hal yang benar-benar
memaksa native adalah **Apple IAP** ([ADR-0010](0010-monetisasi-ios-iap.md): iOS pasar utama, IAP wajib
untuk membuka fitur). MVP memutuskan **tidak menjual apa pun** — 30 keluarga pertama dipakai untuk
menguji apakah produknya bekerja, bukan apakah orang mau membayarnya. Begitu penjualan keluar dari
cakupan, fungsi pemaksanya hilang, dan tidak ada lagi alasan teknis untuk membayar ongkos native.

## Keputusan

**PWA untuk MVP.** Tiga app Next.js di Vercel, dipasang ke Home Screen lewat manifest.

**Bisa dipasang (installable), bukan offline.** Tidak ada service worker.

**Ini menjawab D4 untuk MVP, bukan untuk v1.** Daftar data di ADR-0013 §"Data yang harus dikumpulkan"
tidak gugur — justru deploy inilah cara mengumpulkannya. D4 versi v1 dijawab **oleh hasil uji ini**,
bukan oleh ADR ini.

## Kenapa installable tapi tidak offline

Ini pemisahan yang biasanya dilewat karena kata "PWA" terdengar seperti satu paket. Dua-duanya berdiri
sendiri, dan ongkosnya jauh berbeda:

**Installable butuh nol JavaScript** — manifest + ikon + meta, semuanya statis.

**Offline butuh service worker**, dan itu mahal di sini karena dua alasan yang saling menguatkan:

1. **Menyimpan saldo di cache berarti menampilkan angka uang yang basi.** Seluruh repo ini dibangun
   di sekitar satu janji bahwa angkanya benar — I1, `ledger_orphans`, pemeriksa invarian harian,
   trigger `no_overdraft`. Layar yang menunjukkan Rp484.711 padahal ortu baru menyetujui cash-out
   adalah kelas bug yang sama persis dengan yang sudah dibunuh berkali-kali, cuma dengan penyebab baru.
   Untuk aplikasi uang, offline bukan fitur netral.
2. **Repo ini hari ini punya nol komponen klien.** Setiap halaman RSC, setiap interaksi `<form>`
   (`apps/kid/app/login/page.tsx:11` menyebutnya eksplisit: *"Nol JavaScript klien"*). Service worker
   akan jadi JavaScript klien pertama, plus masalah invalidasi cache seumur hidup produk.

Jadi: ikonnya ada di Home Screen, membukanya terasa seperti app, tapi kalau tidak ada sinyal ia jujur
gagal alih-alih berbohong tentang uang.

## Konsekuensi

**Yang didapat:** nol friksi install untuk 30 keluarga (tidak ada TestFlight, tidak ada kuota tester),
iterasi tanpa review App Store — untuk founder yang bekerja akhir pekan ini bukan detail, dan satu
basis kode untuk HP + iPad (ADR-0013 sudah memetik keuntungan ini).

**Yang dibayar**, dan sudah dihargai ADR-0013: nol discovery App Store, hilangnya kredibilitas
*"ada di App Store"* di mata ortu Indonesia, dan **push notification iOS tidak andal** — di iOS push
menuntut service worker + sudah ditambahkan ke Home Screen. MVP tidak boleh punya alur yang bergantung
pada push.

**Terhadap D3 ([ADR-0018](0018-harga-sekali-bayar.md)):** ADR-0018 menulis pemicu tinjau ulang
*"kalau D4 jatuh ke PWA — tanpa potongan 15%, QRIS kembali mungkin."* Pemicu itu **menyala**, tapi tidak
mendesak: MVP tidak menjual apa pun. Yang dibuka kembali hanya **relnya** (Apple IAP vs QRIS/Xendit),
bukan **harganya** — Rp399.000 tetap berlaku. Dijawab saat pembayaran masuk cakupan, tidak sebelumnya.

**Bentuk deploy:** tiga project Vercel terpisah (`apps/kid`, `apps/parent`, `apps/console`), bukan satu.
Tidak ada satu pun tautan lintas-app di kode, jadi tiga origin adalah jalur paling murah; menyatukannya
justru butuh `basePath` di ketiga app plus menulis ulang ~70 `redirect()`.

**`packages/core` tetap dikunci tanpa dependency framework.** Penjaga dari ADR-0013 ini **tidak** gugur —
justru sekarang ia satu-satunya yang menjaga jalan kembali ke native tetap murah.

## Yang akan membalik keputusan ini

- Pembayaran sungguhan masuk cakupan → Apple IAP → native (ADR-0010 berlaku lagi)
- Uji membuktikan ortu tidak mau melakukan add-to-homescreen (ADR-0013 data #1)
- Ada alur produk yang benar-benar butuh push notification andal
