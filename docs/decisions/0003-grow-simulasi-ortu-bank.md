# ADR-0003 — Grow = simulasi, ortu adalah bank-nya

**Status:** 🔒 terkunci *(merevisi asumsi awal)*

## Keputusan
Tidak ada kewajiban ortu benar-benar membuka deposito, membeli emas, atau membeli valas.
Grow **disimulasikan** — tapi **harganya riil**.

- **Emas** ikut harga Antam (jual & buyback, spread ~9%)
- **Valas** ikut kurs harian ± spread 1%
- **Rate deposito ditetapkan ortu sendiri** (dia bank-nya) per tenor 3/6/12 bln

## Kenapa
Desain lama ("ortu benar-benar eksekusi di dunia nyata") **mustahil di skala uang anak**:
deposito bank minimum jutaan, emas Antam minimum 0,5 g, money changer punya minimum transaksi.
Anak dengan Rp30.000 tidak bisa membeli apa pun dari semuanya. Simulasi bukan jalan pintas —
itu satu-satunya cara Grow bisa hidup.

## Konsekuensi yang harus disadari
- **Risiko pasar ditanggung ORTU.** Kalau emas naik 30%, ortu berutang 30% lebih banyak. Di skala
  uang anak ini kecil dan wajar dianggap biaya mendidik, **tapi ortu harus tahu di depan, bukan
  menemukannya belakangan.** Disclosure wajib tampil di kartu request Grow & di Manage investments.
- **Nilai ditandai di harga jual** (buyback / kurs jual) — yang benar-benar bisa anak dapat hari ini.
  Akibatnya emas selalu mulai di ~−9% dan valas ~−2%. Ini jujur, dan justru itu pelajarannya.
  Layar Harvest emas punya kartu *"Why is it less than you paid?"* → *"gold is for waiting, not for flipping"*.
- **Skala emas realistis**: Rp21.000 ≈ 14,5 mg. Format: mg kalau <1 g, gram kalau ≥1 g.
- **Asimetri Grow tetap** (masuk butuh izin, keluar hanya lewat Harvest) — tapi alasannya berubah:
  bukan lagi "aset riil butuh waktu dicairkan", melainkan "ortu-sebagai-bank yang menetapkan
  aturannya, meniru cara instrumen sungguhan bekerja" — dan supaya anak tidak jadi day-trader
  sementara ortu menanggung volatilitasnya.
- **Move dihapus dari semua Grow.** Satu-satunya jalan keluar adalah Harvest.
- **Tujuan Harvest dikunci ke wallet Save** (default "Free savings"). Hasil investasi kembali jadi
  tabungan, bukan langsung jajan.
- TD tidak ikut pasar — bunganya terkunci di kesepakatan.
