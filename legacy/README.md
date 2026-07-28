# legacy/ — DIBEKUKAN

Lima mockup HTML yang membawa proyek ini sampai ke titik sekarang. **Jangan diedit lagi.**

| Berkas | Permukaan | Nama lama |
|---|---|---|
| `kid-mobile.html` | anak, HP | `Nummi_Middle__App_standalone_.html` |
| `kid-ipad.html` | anak, iPad | `Celengan_iPad__Standalone_.html` |
| `parent-mobile.html` | ortu, HP | `Nummi_Parent_App__Standalone_.html` |
| `parent-web.html` | ortu, web | `Nummi_Parent_Web__Standalone_.html` |
| `console.html` | admin | `nummi-console.html` |

Rename sekaligus menuntaskan X8/K11 — jejak nama kerja lama "Celengan" hilang dari nama berkas.

## Cara memakainya

**Sebagai referensi visual dan referensi flow: ya.** Lima berkas ini adalah spesifikasi UI paling
detail yang dimiliki proyek ini, dan jauh lebih akurat daripada deskripsi tekstual mana pun.

**Sebagai sumber kebenaran angka: TIDAK PERNAH.** Angka di sini sudah terbukti saling bertentangan
— audit 28 Juli 2026 menemukan target dream, request pending, dan rasio auto-split menyimpang antar
permukaan tanpa ada yang menyadari (K4, K5, K6).

> Sumber kebenaran angka: `packages/core/src/seed.ts`.

## Kontradiksi yang diketahui ada di dalam berkas ini

Jangan ikut menyalinnya ke kode:

| # | Masalah |
|---|---|
| X1/K3 | format rupiah `Rp 10,000` — seharusnya `Rp50.000` (brand §17) |
| X2/K4 | target dream berbeda antara app anak & ortu |
| X3/K5 | request pending Rp20.000 vs Rp25.000 |
| X4/K6 | rasio auto-split seed 40/40/10, total hanya 90% |
| X5/K7 | badge "🔥 7-day streak" — mustahil didapat, streak sudah dihapus |
| X6 | app anak tidak menyebut "Nummi" sama sekali dan tidak memuat maskot |
| X10/K12 | "Practice" (HP) vs "Practise" (iPad) |
