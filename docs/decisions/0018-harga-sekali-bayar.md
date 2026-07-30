# ADR-0018 — Harga: sekali bayar Rp399.000, menutup D3

**Status:** ✅ diputuskan 30 Juli 2026 · menutup **D3**

## Konteks

`premium-setting.md` §8 sudah menulis one-time Rp399.000 sejak awal, tapi ADR-0010 menandainya
**⏳ harga belum final (D3)** karena satu risiko struktural yang belum dijawab: **pendapatan sekali,
kewajiban seumur pemakaian** (KG B → Grade 9 ≈ 10 tahun hosting, dukungan, dan pengembangan).

Empat model dipertimbangkan: sekali-bayar apa adanya · langganan · hibrida (slot founding seumur
hidup terbatas → langganan) · sekali-bayar **per tahap** (Little/Middle/Teen).

## Keputusan

**Sekali bayar Rp399.000.** Satu produk IAP. Framing tetap: *"Sekali bayar. Dari KG B sampai
Grade 9."*

```
Rp399.000            harga tampil
  − 15% Apple        Program Usaha Kecil (ADR-0010)
= Rp339.150 net      per keluarga, sekali
  ÷ 108 bulan        ≈ Rp3.140/bulan pendapatan bersih
```

## Kenapa

**Kalimat pemasarannya tidak bisa ditandingi model lain.** *"Rp3.700 sebulan, di bawah jajan
sekali, sampai anakmu Grade 9"* adalah satu-satunya klaim di seluruh dokumen produk ini yang
langganan **secara struktural tidak bisa mengucapkannya.** Untuk produk yang menjual kesabaran
kepada orang tua, konsistensi antara pesan dan model harga bukan detail.

**Operasi paling ringan, dan itu kendala nyata.** Solo founder dengan waktu akhir pekan. Satu
produk IAP berarti nol churn, nol dunning, nol manajemen pembatalan, nol logika downgrade — dan
`premium-setting.md` §3 sudah menuliskannya: *"Downgrade tidak relevan (OTP — tak ada langganan yang
berakhir)."* Setiap jam yang tidak dipakai mengurus penagihan adalah jam untuk produk.

**Alasan menagih sudah jujur sejak awal.** Satu-satunya COGS riil adalah feed harga untuk Grow
(§2), dan Grow memang Pro. Kita tidak menagih untuk menyandera data — riwayat penuh selalu gratis.

## Risiko yang diterima sadar

**1. Kewajiban ~10 tahun dari satu kali bayar.** Tidak dimitigasi oleh model harga; dimitigasi oleh
biaya marjinal yang mendekati nol per keluarga (Supabase + Vercel), dan oleh keputusan menjaga feed
harga sebagai satu-satunya COGS.

**2. Tidak adil antar keluarga — dan ini yang paling tajam.** Keluarga yang masuk di KG B mendapat
~10 tahun; yang masuk di Grade 8 mendapat ~1,5 tahun. Harga sama. Dan yang masuk terlambat justru
yang paling mampu membayar.

Ini **tidak** dimitigasi sekarang. Yang membuatnya bisa ditanggung: sekali-bayar per tahap
(Little/Middle/Teen) sudah dipetakan sebagai jalan keluar yang tidak membutuhkan langganan, jadi
kalau ketidakadilan itu terbukti menyakitkan, perubahannya berupa **menambah produk IAP**, bukan
mengubah model.

## Ditinjau ulang kalau

- **Biaya marjinal per keluarga berhenti mendekati nol** — mis. Rapor Literasi memakai LLM berbayar,
  atau feed harga jadi berlangganan mahal;
- **keluarga yang masuk terlambat terbukti menolak harganya** (bukti dari uji, bukan dugaan) →
  jalannya sekali-bayar per tahap;
- **D4 jatuh ke PWA** → tanpa app store berarti tanpa potongan 15% dan QRIS/GoPay kembali mungkin.
  ADR-0010 sudah memperingatkan: **itu bukan alasan memilih PWA**, tapi wajib dihitung ulang di sini.

## Konsekuensi yang langsung mengikat

`LIMITS` di `premium-setting.md` §3 berhenti jadi spec dan jadi kode: `packages/core/src/plan.ts`.
Yang paling penting ditegakkan, karena hari ini **dilanggar**:

- **`isPro()` tidak pernah dipanggil satu app pun.** Nol baris `entitlements`, dan Grow tetap tampil
  penuh di app anak — jadi C1/I3 hidup hanya di dokumen.
- **Growth Reward BUKAN bagian dari flag `grow`.** `premium-setting.md` §3 menyebutnya *"kesalahan
  gating yang paling mungkin terjadi"* — dijaga test tersendiri, bukan komentar.
- **Tidak ada `<ProLock/>` di app anak.** Fitur yang tidak aktif tidak dirender (C1). Yang boleh
  tahu soal plan hanya app ortu.
- **Tombol upgrade tidak pernah tampil untuk pengguna sekolah** (I5) — `entitlements.source`
  membedakan `iap` dari `school`/`grant`.
