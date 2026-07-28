# apps/

Tiga permukaan. Di web, lima permukaan MVP runtuh jadi tiga — anak HP + iPad menjadi satu basis
kode dengan dua breakpoint, ortu HP + web juga (ADR-0013).

| App | Permukaan | Status |
|---|---|---|
| `console/` | admin, lintas keluarga | **dibangun pertama** — jendela ke skema |
| `kid/` | anak, HP + iPad | kedua |
| `parent/` | ortu, HP *(web ditunda)* | ketiga |

## Kenapa console lebih dulu

Console adalah satu-satunya permukaan yang **sudah 100% bahasa Indonesia**, format rupiahnya
**sudah benar** (backlog X1 menyebutnya sebagai contoh yang benar), dan isinya **murni pembacaan
data**. Begitu skema hidup, console adalah cara tercepat melihat apakah model datanya benar —
sebelum satu komponen anak atau ortu ditulis.

Cakupannya sengaja tipis: **C-1 saja** (sambungkan ke data nyata). C-2 sampai C-7 tetap di backlog.

## Aturan yang berlaku di ketiganya

- Semua string lewat `copy/`. Tidak ada teks yang di-hardcode.
- Semua nominal lewat `formatRp()` dari `@nummi/core`.
- Semua logika bisnis dipanggil dari `@nummi/core`, tidak pernah ditulis ulang di komponen.
- **App anak**: nol gembok Pro, nol slot iklan (invariant I3 & I4).
