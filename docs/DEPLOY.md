# Deploy — PWA di Vercel

> Ditulis 30 Juli 2026, setelah D4 dijawab ([ADR-0019](decisions/0019-d4-pwa-untuk-mvp.md)):
> **PWA untuk MVP, bisa dipasang, sengaja tidak offline.**
>
> Berkas ini bukan tutorial Vercel. Isinya **yang khusus repo ini** — terutama jebakan yang sudah
> ditemukan sekali, supaya tidak ditemukan dua kali.

---

## Bentuknya: dua project, bukan satu

| Project Vercel | Root Directory | Siapa yang membukanya |
|---|---|---|
| `nummi-kid` | `apps/kid` | anak |
| `nummi-parent` | `apps/parent` | ortu |
| ~~`nummi-console`~~ | — | **tidak di-deploy** |

**Kenapa dua project, bukan satu.** Tidak ada satu pun tautan lintas-app di seluruh kode — app anak
tidak pernah menaut ke app ortu, dan sebaliknya. Menyatukannya di satu origin justru butuh `basePath`
di kedua `next.config.mjs` plus menulis ulang setiap `redirect()` dan setiap `action="/api/login"`.
Dua origin adalah jalur yang paling sedikit menyentuh kode.

**Kenapa console tidak ikut.** Ia membaca **service role, lintas keluarga, RLS dilewati** — satu
halamannya berisi saldo setiap anak di setiap keluarga. [ADR-0015](decisions/0015-console-duluan-tipis.md)
mengunci bahwa ia dijalankan operator di lingkungan yang dia kendalikan sendiri. Jalankan lokal:

```bash
npm run console:dev   # http://localhost:3000
```

Sejak 30 Juli 2026 ia butuh `CONSOLE_PASSWORD` (gagal-tertutup — tanpa itu semua permintaan dijawab
`503`). Kalau suatu saat console **memang** perlu di-deploy, gerbangnya sudah ada, tapi itu keputusan
tersendiri — bukan efek samping dari mengimpor repo.

---

## Langkah

### 1. Impor repo dua kali

Di Vercel: **Add New → Project → import repo yang sama**, dua kali. Untuk masing-masing, setel
**Root Directory** ke `apps/kid` / `apps/parent`.

⚠️ **"Include source files outside of the Root Directory" harus MENYALA.** Ini satu-satunya setelan
yang mengubah build ini dari "berhasil" jadi `Module not found: @copy`. Sebabnya: `copy/` bukan
package npm — ia dijangkau lewat alias tsconfig `"@copy": ["../../copy/index.ts"]`, dan
`copy/index.ts` sendiri masih menjangkau `../packages/core/src/types.js`. Jadi build butuh **dua
direktori di atas** Root Directory ada di disk. Vercel biasanya menyalakannya sendiri saat mendeteksi
monorepo, tapi ia sebuah toggle, dan tidak ada apa pun di repo ini yang bisa memaksanya.

Framework Preset terdeteksi otomatis (Next.js). Build Command dan Install Command biarkan default —
`vercel.json` di tiap app hanya menyetel header, tidak menyentuh build.

### 2. Environment variables

Setel di **kedua** project:

| Nama | Nilai | Catatan |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL project Supabase | |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | `sb_publishable_…` | ikut ke browser — wajar, RLS yang menjaga |
| `SUPABASE_SECRET_KEY` | `sb_secret_…` | **server saja.** Sejak migrasi 0009 ia satu-satunya jalan menulis ledger |

**JANGAN** setel `CHILD_JWT_SECRET` di Vercel. Ia dipakai Edge Function `child-login` yang berjalan
di **Supabase**, bukan di Vercel — memasangnya di sini cuma menambah satu tempat rahasia itu berada.

⚠️ **`NEXT_PUBLIC_*` harus ada SEBELUM build pertama, bukan sesudah.** `apps/parent/middleware.ts`
membacanya, middleware berjalan di Edge runtime, dan Next **menanamkan** nilai `NEXT_PUBLIC_*` saat
build. Kalau keduanya belum ada saat build, middleware menerima `undefined`, dan penukaran refresh
token **diam-diam tidak pernah terjadi** — ortu terlempar ke layar masuk tiap ~1 jam tanpa satu pun
galat muncul di mana pun. Ini kegagalan senyap; kalau env ditambahkan belakangan, **redeploy**.

### 3. Deployment Protection

Nyalakan untuk kedua project selama pengembangan. **Matikan (atau pakai password) untuk uji 30
keluarga** — kalau tidak, ortu dan anak tidak bisa masuk sama sekali.

`vercel.json` tiap app sudah memasang, tanpa bergantung dashboard:

- `X-Robots-Tag: noindex, nofollow` — produk anak belum boleh terindeks
- `Content-Security-Policy: frame-ancestors 'none'` — app ortu berisi tombol **Approve** yang
  memindahkan uang. Tanpa ini, halamannya bisa di-iframe dan tombol itu jadi sasaran clickjacking
- `X-Content-Type-Options: nosniff` · `Referrer-Policy: no-referrer`

### 4. Setelah deploy — yang harus benar-benar dicoba

Bukan dibaca, dicoba. Repo ini sudah tiga kali kena fitur yang "ada" tapi tidak pernah menyala
(RLS rekursif, view yang melewati RLS, rate limit yang tak pernah menghitung).

1. **Anak masuk** dengan kode keluarga + PIN → Home menampilkan saldo
2. **Ortu masuk**, lalu **tunggu lewat 1 jam** (atau tanam access token kedaluwarsa) → dashboard
   tetap terbuka. Ini yang membuktikan `NEXT_PUBLIC_*` benar-benar ada saat build
3. **Pasang ke Home Screen** di iPhone → ikon muncul, app terbuka tanpa address bar, dan **nav bawah
   tidak tertutup home indicator**. Yang terakhir itu yang diperbaiki `viewportFit: 'cover'`, dan ia
   hanya kelihatan salah dalam mode standalone — tidak pernah di tab Safari
4. **Satu siklus uang penuh**: anak minta cash out → ortu approve → saldo turun tepat sejumlah itu

---

## Yang sudah ditemukan, dan sudah ditutup

Dicatat karena semuanya adalah kelas kesalahan yang akan kembali di deploy berikutnya.

| Temuan | Keadaan sebelumnya | Ditutup di |
|---|---|---|
| **Console memprerender saldo semua keluarga jadi HTML statis** | `apps/console/app/page.tsx` tidak memakai `cookies()`, jadi Next menganggapnya statis dan memanggil service role **saat build**. `.next/server/app/index.html` berisi 58 KB saldo nyata, siap di-cache CDN | `export const dynamic = 'force-dynamic'` |
| **Console tanpa gerbang apa pun** | tidak ada login, tidak ada middleware | `apps/console/middleware.ts`, gagal-tertutup |
| **`vercel.json` root menunjuk `legacy/`** | mengimpor repo root akan mem-publikasikan lima mockup beku, bukan app | berkasnya dihapus |
| **CI tidak pernah mem-build satu app pun** | hanya `packages/core`. Build Next yang rusak lolos sampai Vercel | job `apps` di `.github/workflows/ci.yml` |
| **Akar workspace ditebak dari lockfile terdekat** | `package-lock.json` nyasar di direktori home membuat Next memilih home sebagai akar | `outputFileTracingRoot` di ketiga `next.config.mjs` |
| **`env(safe-area-inset-bottom)` selalu 0** | CSS sudah memakainya sejak awal, tapi tanpa `viewportFit: 'cover'` ia tidak pernah bernilai apa pun di iOS | `viewport` di kedua layout |
| **Font brand tidak pernah dimuat** | `--ui: 'Plus Jakarta Sans'` disebut CSS, tidak ada yang memuatnya — semua permukaan diam-diam `system-ui` | `next/font/google`, di-self-host saat build |
| **Middleware ortu akan menggerbang aset PWA** | matcher hanya mengecualikan `_next/*`; tiap fetch ikon berpotensi memicu penukaran refresh token | matcher diperluas |

---

## Yang TIDAK ada, dan itu disengaja

**Tidak ada service worker. Tidak ada mode offline.** Lihat
[ADR-0019](decisions/0019-d4-pwa-untuk-mvp.md) §"Kenapa installable tapi tidak offline". Ringkasnya:
menyimpan saldo di cache berarti menampilkan angka uang yang basi, dan repo ini punya **nol
JavaScript klien** hari ini — service worker akan jadi yang pertama, beserta invalidasi cache seumur
hidup produk. App-nya bisa dipasang; kalau tidak ada sinyal ia jujur gagal alih-alih berbohong soal uang.

**Tidak ada push notification.** Konsekuensi yang sudah dihargai ADR-0013: di iOS push menuntut
service worker. Jangan bangun alur MVP yang bergantung padanya.

**Tidak ada pembelian.** Apple IAP butuh app native, dan MVP tidak menjual apa pun
([ADR-0018](decisions/0018-harga-sekali-bayar.md) tetap berlaku untuk harganya). Checkout palsu di
prototipe uji akan mengajari kesimpulan yang salah tentang minat membeli.
