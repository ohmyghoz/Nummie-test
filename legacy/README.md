# legacy/ — lima mockup asli, DIBEKUKAN

Berkas di sini adalah lima permukaan MVP dalam bentuk HTML mandiri. **Jangan diedit lagi.**
Mereka adalah referensi visual dan riwayat keputusan, bukan sumber kebenaran.

| Berkas | Permukaan | Nama lama |
|---|---|---|
| `kid-mobile.html` | anak, HP | `Nummi_Middle__App_standalone_.html` |
| `kid-ipad.html` | anak, iPad | `Celengan_iPad__Standalone_.html` (X8/K11 — nama lama akhirnya hilang) |
| `parent-mobile.html` | ortu, HP | `Nummi_Parent_App__Standalone_.html` |
| `parent-web.html` | ortu, web | `Nummi_Parent_Web__Standalone_.html` |
| `console.html` | admin | `nummi-console.html` |

## Kenapa dibekukan

Kelima berkas tidak live-linked satu sama lain — angkanya disamakan manual. Audit 28 Juli 2026
membuktikan biayanya nyata: target dream, request pending, dan rasio auto-split sudah menyimpang
antar-permukaan tanpa ada yang menyadari (X2, X3, X4).

Itu bukan kelalaian, itu sifat lima berkas terpisah. Karena itu angka kanonik sekarang hidup di
satu tempat: **`packages/core/src/seed.ts`**, dengan test yang gagal kalau totalnya tidak cocok.

## Dua mockup yang sengaja tidak dibawa

`celengan-home-mockup.html` dan `celengan-parent-mockup.html` — sudah digantikan, dan membawanya
hanya menambah peluang sesi baru mengedit berkas yang salah (X9).
