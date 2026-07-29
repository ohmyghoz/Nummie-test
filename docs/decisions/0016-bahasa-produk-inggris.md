# ADR-0016 — Bahasa produk: tetap Inggris (menutup D1)

**Status:** 🔒 terkunci
**Menutup:** D1 di `OPEN-keputusan-tertunda.md`

## Keputusan

**String UI produk tetap berbahasa Inggris.** Kamus `copy/en.ts` adalah kamus aktif;
`DEFAULT_LANG` tetap `'en'`.

Yang **tidak** berubah oleh keputusan ini:

- **Console tetap 100% Indonesia.** Ia permukaan operator, bukan produk — tidak pernah dilihat
  anak maupun ortu. (ADR-0015)
- **Percakapan & dokumen tetap Indonesia.** D1 soal string UI, bukan soal bahasa kerja.
- **Teks bebas yang ditulis anak** (alasan cash-out, alasan & cerita Give) memang Indonesia.
  Itu tulisan pengguna, bukan copy.
- **Semua string tetap lewat `copy/`.** Tidak ada string yang boleh di-hardcode di komponen.
  Aturan ini lahir untuk membuat D1 murah, dan tetap berlaku setelah D1 dijawab.

## Kenapa

Rekomendasi awal di `nummi-status.md` §5 adalah Indonesia, dengan argumen terkuat: **anak
KG B–Grade 2 belum bisa membaca Inggris**, dan tier Little paling bergantung pada label.

Argumen itu benar — tapi **tidak berlaku untuk cakupan yang sedang diuji.** Pemilih tier di app
anak sengaja dimatikan (`harness()` mengembalikan `null`, lihat D5), sehingga satu-satunya tier
yang bisa didemokan adalah **Middle**. Little tidak ada di meja. Jadi alasan utama untuk pindah
ke Indonesia menjawab masalah yang belum dimiliki prototipe ini.

Yang tersisa kemudian adalah pertimbangan biaya, dan arahnya jelas:

- lima mockup sudah Inggris — pindah bahasa sekarang berarti menulis ulang copy untuk
  permukaan yang bahkan belum divalidasi;
- pertanyaan yang membuat prototipe ini ada adalah **"apakah pasangan ortu–anak sungguhan
  memakai siklus uangnya sampai tutup"** (ROADMAP), dan itu pertanyaan tentang mekanik,
  bukan tentang bahasa;
- karena semua string sudah lewat `copy/`, keputusan ini **tetap murah untuk dibalik** —
  biayanya mengganti isi kamus, bukan menulis ulang UI.

## Konsekuensi

- `copy/id.ts` **tidak dihapus dan tidak dibiarkan busuk.** `Dictionary` mewajibkan kedua bahasa
  memenuhi bentuk yang sama, jadi ia tetap dijaga tipe. Itu yang membuat pembalikan tetap murah.
- Toggle bahasa EN/ID di app anak tetap placeholder — bukan fitur MVP.
- **K12 gugur sebagian, tidak seluruhnya.** Ejaan Inggris yang tidak konsisten
  ("Practice" di HP vs "Practise" di iPad) tadinya diasumsikan gugur sendiri kalau D1 jatuh ke
  Indonesia. Karena D1 jatuh ke Inggris, **inkonsistensi itu sekarang harus benar-benar
  diperbaiki** — pilih satu varian dan tegakkan di kamus.
- **D2 jadi lebih ringan, dan akhirnya ditutup 29 Juli 2026 oleh ADR-0017.** Sisi Inggris dari lembar karakter
  (SPEND · SAVE · GIVE · GROW) sudah cocok dengan mockup dan brand system §5.2. Yang masih perlu
  diputuskan tinggal: **apakah istilah berubah menurut tier.** Lookup `[tier][kategori]` tetap wajib.

## Kapan ini harus ditinjau ulang

**Kalau D5 memasukkan Little (KG B–Grade 2) ke dalam cakupan.** Saat itu argumen "anak belum bisa
membaca Inggris" berlaku penuh, dan ADR ini harus dibuka kembali — bukan dipertahankan karena
sudah terlanjur tertulis.

Sinyal kedua: kalau uji ke pasangan ortu–anak sungguhan menunjukkan anak tersendat pada label,
bukan pada mekaniknya.
