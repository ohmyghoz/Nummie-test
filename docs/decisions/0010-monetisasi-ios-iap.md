# ADR-0010 — iOS pasar utama, Apple IAP wajib, entitlement 4 tabel

**Status:** 🔒 terkunci untuk jalur & arsitektur · ⏳ **harga belum final (D3)**

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

## ⚠️ Yang masih terbuka (D3)
`premium-setting.md` mengunci one-time Rp399.000. Risiko struktural sekali-bayar (pendapatan sekali,
kewajiban seumur pemakaian) sudah teridentifikasi; usulan model hibrida (slot founding-member seumur
hidup terbatas → langganan) **belum diputuskan**.

## Catatan silang dengan ADR-0013
Kalau D4 nanti jatuh ke PWA, seluruh bab ini berubah bentuk: tanpa app store, tanpa potongan 15%,
dan QRIS/GoPay langsung menjadi mungkin lagi. **Itu bukan alasan memilih PWA** — tapi wajib dihitung
saat D4 diputuskan.
