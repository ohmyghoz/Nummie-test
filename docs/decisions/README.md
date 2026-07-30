# Keputusan Arsitektur (ADR)

Setiap berkas menjawab satu pertanyaan: **apa yang diputuskan, dan kenapa.**

Alasan lebih berharga daripada keputusannya. Keputusan bisa dibaca ulang dari kode; alasan tidak
bisa — dan alasan itulah yang hilang duluan. Kalau kamu tergoda mengubah salah satu keputusan di
bawah, baca dulu bagian *Kenapa*: hampir semuanya adalah hasil membatalkan versi pertama yang
kelihatannya lebih masuk akal.

## Terkunci

| # | Keputusan |
|---|---|
| [0001](0001-model-a-satu-tempat.md) | Model A — setiap rupiah di tepat satu tempat |
| [0002](0002-approve-bukan-fulfil.md) | "Approve ≠ fulfil" — dua kolom, bukan satu enum |
| [0003](0003-grow-simulasi-ortu-bank.md) | Grow = simulasi, ortu adalah bank-nya |
| [0004](0004-ekonomi-bintang-permata.md) | ⭐ dari kurikulum, 💎 dari kerja; ⭐ dipisah saldo & lifetime |
| [0005](0005-strict-default-mati.md) | Strict mode default mati |
| [0006](0006-give-punya-flow-sendiri.md) | Give punya flow sendiri + cerita wajib |
| [0007](0007-take-money-kantong-terlindungi.md) | Take money tidak pernah menyentuh dream/Give/Grow |
| [0008](0008-rapor-formula-bukan-llm.md) | Rapor = formula deterministik, LLM tak menyentuh angka |
| [0009](0009-iklan-hanya-app-ortu.md) | Iklan hanya di app ortu, nol slot di app anak |
| [0010](0010-monetisasi-ios-iap.md) | iOS pasar utama, Apple IAP wajib, entitlement 4 tabel |
| [0011](0011-streak-dihapus.md) | Streak dibuang, bukan diperbaiki |
| [0012](0012-auth-anak-kode-keluarga-pin.md) | Auth anak: kode keluarga + PIN, JWT ber-claim |
| [0013](0013-web-first-d4-tetap-terbuka.md) | Prototipe web = alat validasi, bukan jawaban distribusi |
| [0014](0014-ledger-append-only.md) | Ledger append-only, saldo diturunkan |
| [0015](0015-console-duluan-tipis.md) | Console dibangun duluan dan tipis |
| [0016](0016-bahasa-produk-inggris.md) | Bahasa produk tetap Inggris (menutup D1) |
| [0017](0017-istilah-kategori-sama-lintas-tier.md) | Istilah kategori sama lintas tier (menutup D2) |
| [0018](0018-harga-sekali-bayar.md) | Harga sekali bayar Rp399.000 (menutup D3) |
| [0019](0019-d4-pwa-untuk-mvp.md) | PWA untuk MVP — bisa dipasang, sengaja tidak offline (menjawab D4) |
| [0020](0020-d5-middle-saja-untuk-mvp.md) | Middle saja untuk MVP, kode Little & Teen tetap hidup (menutup D5) |
| [0021](0021-console-boleh-dideploy-dengan-syarat.md) | Console boleh di-deploy — hanya dengan tiga lapis sekaligus (mengamandemen 0015) |
| [0022](0022-auth-ortu-otp-tanpa-password.md) | Auth ortu: kode email sekali pakai, tanpa password · ganti PIN anak |

## Terbuka — jangan dijawab lewat kode

**Per 30 Juli 2026, D1–D5 sudah terjawab.** Yang tersisa satu, dan sengaja tidak dipaksakan:

**Distribusi v1** — ADR-0019 menjawab D4 hanya untuk **cakupan MVP**. Pertanyaan native-vs-PWA untuk
v1 dijawab oleh **hasil uji 30 keluarga**, memakai daftar data di
[ADR-0013](0013-web-first-d4-tetap-terbuka.md) §"Data yang harus dikumpulkan". Jangan menjawabnya
lewat inersia — itu peringatan utama ADR-0013.

[`OPEN-keputusan-tertunda.md`](OPEN-keputusan-tertunda.md) menyimpan riwayat kelimanya beserta
pemicu tinjau ulang masing-masing.

## Menambah ADR baru

Nomor berurut, nama berkas deskriptif, tiga bagian: **Keputusan · Kenapa · Konsekuensi**.
Kalau sebuah ADR membatalkan ADR lain, tulis di kedua berkas — jangan hapus yang lama.
Yang dibatalkan tetap berharga: ia menjelaskan kenapa jalan yang kelihatan wajar itu ditutup.
