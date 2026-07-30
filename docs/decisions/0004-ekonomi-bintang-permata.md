# ADR-0004 — Dua mata uang, dua angka ⭐, tiga gerbang

**Status:** 🔒 terkunci · **diamandemen 30 Juli 2026** saat dibangun (lihat bawah)

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
- **Minus-point raid dream**: dream → Spend/Give kena **⭐ −15 flat**; dream → dream lain tidak kena.
  **Wajib memotong saldo saja, tidak pernah lifetime.** Peringatan tampil **sebelum** konfirmasi.
  ⚠️ Klausa "dream → Grow tidak kena" **dihapus 30 Juli 2026**: dream tidak lagi bisa mendanai Grow
  sama sekali (U-14), jadi cabang itu mustahil terjadi. Lihat §A2 di bawah.
- Reward uang mendarat di Unsorted (konsisten dengan Send money).

---

## Amandemen — 30 Juli 2026 (saat dibangun)

Keputusan inti tidak berubah: dua mata uang, dua angka ⭐, tiga gerbang, dan pembedaan
"usaha di app → identitas di app; kerja dunia nyata → hak istimewa dunia nyata". Tiga hal di bawah
ditetapkan saat implementasinya benar-benar dijalankan.

### A1. 💎 disimpan sebagai LEDGER, ⭐ tetap penghitung

`gem_entries` append-only + view `gem_balances` (migrasi 0015). ⭐ tetap dua kolom integer di
`child_economy`.

Terlihat tidak simetris, tapi justru mengikuti kalimat pertama ADR ini: **💎 menyentuh dunia nyata,
⭐ tidak.** 💎 ditukar jadi 1 jam main atau jalan-jalan keluarga, jadi *"💎-ku ke mana?"* harus
selalu bisa dijawab — termasuk saat penukaran gagal di tengah atau ortu menolak setelah 💎 terpotong.
⭐ hanya membeli avatar; riwayat yang bisa diedit tidak merugikan siapa pun di situ.

Konsekuensi yang ikut: 💎 mendapat penjagaan kembar dengan uang — append-only (`no_gem_update` /
`no_gem_delete`) dan tidak boleh negatif (`no_gem_overdraft`, yang **mengunci dulu baru menghitung**
karena `raise exception` saja tidak menyelesaikan write skew).

**Jumlah 💎 tidak pernah disimpan di `requests.amount`** — kolom itu rupiah. Ia diturunkan dari
`jobs.amount` / `prizes.gem_cost` lewat `job_id`/`prize_id`. Satu kolom dengan dua arti adalah persis
cara keputusan mati diam-diam (peringatan K14 di `nummi-status.md`).

### A2. 💎 masuk saat DISETUJUI, keluar saat DIAJUKAN

Asimetris, dan disengaja:

| | Kapan 💎 bergerak | Kenapa |
|---|---|---|
| Klaim job | saat ortu **menyetujui** | 💎 yang belum disetujui belum menjadi milik anak |
| Tukar hadiah | saat anak **mengajukan** | kalau tidak, anak bisa mengajukan tiga hadiah dengan 💎 yang cukup untuk satu, dan ortu yang menemukan kegagalannya |

Kalau ortu menolak penukaran, yang mengembalikan 💎 adalah **baris pembalik** — dan ledger membuat
pengembalian itu punya jejak, bukan diam-diam.

### A3. Gerbang mingguan: "belum ada materi" ≠ "belum selesai"

`canRedeemGems()` memperlakukan tiga keadaan, bukan dua:

```
weeklyMaterialDone === true       → boleh menukar
weeklyMaterialDone === false      → gerbang MENUTUP   ← inilah gerbangnya
weeklyMaterialDone === undefined  → gerbang belum berlaku
```

Kurikulum belum punya tabel, jadi nilai itu tidak pernah bisa terisi. Memperlakukan "tidak ada data"
sebagai "belum selesai" akan menutup gerbang ini **selamanya** — 💎 bisa dikumpulkan tapi tidak
pernah bisa ditukar, dan seluruh ekonomi 💎 yang dikunci ADR ini jadi hiasan. Gerbang yang menjaga
syarat yang tidak ada bukan penjagaan, ia kebuntuan.

Gerbangnya **tidak dilonggarkan**: ia menutup begitu ada materi mingguan yang bisa dinilai, tanpa
perubahan kode. Yang berubah hanya cara membaca ketiadaan data.

⚠️ **Yang masih terbuka, dan bukan bagian dari amandemen ini:** definisi minggu itu sendiri — awal
minggu (Senin? hari anak daftar?), zona waktu, dan apa yang terjadi kalau anak tidak membuka app
berminggu-minggu (jangan menumpuk klaim retroaktif). Semuanya tercatat di backlog T, dan gerbang ini
baru benar-benar bekerja setelah ketiganya dijawab.
