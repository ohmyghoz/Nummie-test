# ADR-0010 — iOS pasar utama, Apple IAP wajib, entitlement 4 tabel

**Status:** 🔒 terkunci untuk jalur & arsitektur · ✅ **harga final 30 Juli 2026** ([ADR-0018](0018-harga-sekali-bayar.md))

## Keputusan
- **iOS adalah pasar utama.** Ini membalik asumsi awal dan mempengaruhi semua keputusan monetisasi.
- **Apple IAP wajib** untuk membuka fitur di iOS. Storefront Indonesia **tidak** mendapat pengecualian
  anti-steering seperti AS/UE, dan pengecualian Reader App tidak berlaku untuk Nummi. Jalur pembayaran
  luar membawa **risiko terminasi akun yang nyata**.
- Program Usaha Kecil Apple: **15%**.
- **Android**: Google Play Billing + **User Choice Billing** (Indonesia termasuk) → Xendit/Mayar sah,
  hemat ~4%.
- **Sekolah**: Enterprise Services (Pedoman App Store 3.1.3(c)), diprovisikan **sepenuhnya di luar
  app store**.

## Arsitektur entitlement
Empat tabel — `entitlements`, `iap_receipts`, `schools`, `school_members` — dengan **satu** resolver
`isPro(user)`. Semua permukaan memanggil resolver itu, tidak pernah memeriksa tabel langsung.

## Konsekuensi UX yang sudah dikunci
- **Tombol upgrade tidak pernah tampil untuk pengguna sekolah.**
- Kolom kode sekolah **dikubur di Settings**, bukan dipamerkan di onboarding.
- **Tidak ada gembok Pro di app anak.** Fitur Pro yang belum aktif = **tidak tampil**, bukan
  tampil-terkunci. Grow tidak muncul di nav anak kalau non-Pro. Semua upsell hanya di app ortu.
  Alasannya: produk ini mengajari anak menahan impuls konsumtif — memakai impuls anak untuk menjual
  akan membunuh premisnya.
- Momen paywall terbaik: **setelah Sort pertama berhasil** — puncak emosi produk, bukan saat onboarding.

## Yang membatalkan rencana lama
`premium-setting.md` §8 masih menulis *"QRIS/GoPay/transfer via checkout web bukan opsional"*.
Untuk iOS itu **sudah tidak berlaku**. Dicatat sebagai K9.

## ~~⚠️ Yang masih terbuka (D3)~~ ✅ ditutup
**Sekali bayar Rp399.000** — [ADR-0018](0018-harga-sekali-bayar.md). Empat model dipertimbangkan;
yang menentukan bukan angkanya melainkan bahwa *"Rp3.700 sebulan sampai Grade 9"* adalah satu-satunya
klaim yang langganan **secara struktural tidak bisa mengucapkannya**, ditambah nol churn/dunning
untuk founder yang bekerja akhir pekan.

Risiko yang diterima sadar, dan dicatat di ADR-nya: kewajiban ~10 tahun dari satu kali bayar, serta
**ketidakadilan antar keluarga** (KG B dapat 10 tahun, Grade 8 dapat 1,5 tahun, harga sama). Jalan
keluarnya kalau terbukti menyakitkan adalah sekali-bayar **per tahap**, yang berarti menambah produk
IAP — bukan mengubah model.

## Catatan silang dengan ADR-0013
Kalau D4 nanti jatuh ke PWA, seluruh bab ini berubah bentuk: tanpa app store, tanpa potongan 15%,
dan QRIS/GoPay langsung menjadi mungkin lagi. **Itu bukan alasan memilih PWA** — tapi wajib dihitung
saat D4 diputuskan.
