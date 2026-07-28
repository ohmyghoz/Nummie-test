# ADR-0004 — Dua mata uang, dua angka ⭐, tiga gerbang

**Status:** 🔒 terkunci

## Keputusan
- **⭐ Stars** — didapat dari **kurikulum** (Learn/Practice) → hanya untuk **kosmetik in-app** (avatar)
- **💎 Gems** — didapat dari **chores/mission ortu** → hanya untuk **hadiah dunia nyata**

Logikanya: *usaha di app → identitas di app; kerja dunia nyata → hak istimewa dunia nyata.*

### ⭐ wajib dipecah jadi dua angka
- `STARS_EARNED` — **lifetime**, tak pernah berkurang → dipakai untuk **gerbang**
- `STARS` — **saldo**, naik-turun → dipakai untuk **beli avatar**

Ini konsekuensi paksa, bukan pilihan gaya: kalau gerbang memakai saldo, anak yang membeli avatar
akan **mengunci ulang chores-nya sendiri** — dihukum karena memakai hadiahnya. Absurd.

### Tiga gerbang
1. **Sistem chores** terbuka saat `⭐ lifetime ≥ 100`
2. **Job achievement + hadiah besar (≥25 💎)** terbuka saat Chapter 2 selesai
3. **Gerbang mingguan ada di PENUKARAN, bukan perolehan** — 💎 selalu bisa dikumpulkan; yang butuh
   "materi minggu ini selesai" adalah **menukarnya**

## Kenapa gerbang mingguan di penukaran
Kalau perolehan yang dikunci, muncul pesan aneh: *"kamu belum belajar, jadi tak perlu beresin kamar"*
— kontribusi keluarga jadi bersyarat. Gerbang di penukaran menjaga kontribusi tetap tak bersyarat,
tapi tetap memaksa loop belajar. Psikologisnya juga lebih kuat: 💎 sudah di tangan, tinggal 2 menit
belajar untuk memakainya.

## Kenapa gerbang ada sama sekali
Tanpa gerbang, ekonomi 💎 akan **mengalahkan kurikulum** — anak mengejar screen time dan melewati
materi finansial. Gerbang membalik arahnya: **belajar jadi kunci**, bukan tugas tambahan.

## Turunan
- **Mission ortu 3 jenis, reward-nya dipandu** (builder mengajari ortu, bukan kotak kosong):
  kontribusi keluarga → **💎 saja, opsi uang tidak muncul** (riset: membayar tugas dasar keluarga
  merusak motivasi intrinsik) · kerja ekstra → 💰 atau 💎 · pencapaian → default 💎, uang boleh tapi
  bukan default (app memberi nudge, bukan larangan).
- **Minus-point raid dream**: dream → Spend/Give kena **⭐ −15 flat**; dream → dream lain atau
  dream → Grow tidak kena. **Wajib memotong saldo saja, tidak pernah lifetime.** Peringatan tampil
  **sebelum** konfirmasi.
- Reward uang mendarat di Unsorted (konsisten dengan Send money).
