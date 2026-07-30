# Deploy — PWA di Vercel

> Ditulis 30 Juli 2026, setelah D4 dijawab ([ADR-0019](decisions/0019-d4-pwa-untuk-mvp.md)):
> **PWA untuk MVP, bisa dipasang, sengaja tidak offline.**
>
> Berkas ini bukan tutorial Vercel. Isinya **yang khusus repo ini** — terutama jebakan yang sudah
> ditemukan sekali, supaya tidak ditemukan dua kali.

---

## Bentuknya: project terpisah per app, bukan satu

| Project Vercel | Root Directory | Siapa yang membukanya |
|---|---|---|
| `nummi-kid` | `apps/kid` | anak |
| `nummi-parent` | `apps/parent` | ortu |
| `nummi-console` | `apps/console` | **operator saja — bersyarat, lihat §Console** |

**Kenapa project terpisah, bukan satu.** Tidak ada satu pun tautan lintas-app di seluruh kode — app
anak tidak pernah menaut ke app ortu, dan sebaliknya. Menyatukannya di satu origin justru butuh
`basePath` di ketiga `next.config.mjs` plus menulis ulang setiap `redirect()` dan setiap
`action="/api/login"`. Origin terpisah adalah jalur yang paling sedikit menyentuh kode.

---

## Keadaan nyata per 30 Juli 2026 — sudah naik

| | URL | Bukti |
|---|---|---|
| `nummi-kid` | https://nummi-kid.vercel.app | login anak `NUMMI1` + PIN → Home menampilkan saldo |
| `nummi-parent` | https://nummi-parent.vercel.app | OTP → dashboard `Rp484.711`, inbox & layar PIN terbuka |
| `nummi-console` | — | tetap lokal (ADR-0021 belum terpenuhi) |

Scope Vercel: tim `ohmyghozs-projects`. `rootDirectory` diset per project (`apps/kid`, `apps/parent`),
env terpasang **sebelum** build pertama.

⚠️ **Deploy masih MANUAL, bukan otomatis dari git.** Koneksi GitHub↔Vercel gagal dibuat lewat API —
kredensial GitHub di sisi Vercel menjawab `Bad credentials`, artinya GitHub App Vercel belum pernah
terpasang untuk akun ini. Selama itu belum dibereskan di browser (Vercel → project → Settings → Git),
**push ke `main` tidak men-deploy apa pun.** Deploy dilakukan dengan:

```bash
vercel deploy --prod --yes     # dari root repo, memakai .vercel/project.json
```

`.vercel/project.json` menentukan project mana yang dituju — ia gitignored, dan **saat ini menunjuk
`nummi-parent`**. Tukar `projectId`-nya untuk men-deploy kid.

Konsekuensi yang perlu diketahui: tanpa koneksi git tidak ada preview deployment per-PR, dan tidak
ada jejak commit di dashboard Vercel. Untuk uji 30 keluarga itu bisa diterima; untuk jangka panjang
tidak.

⚠️ **Deployment Protection MATI** — memang harus, supaya keluarga bisa masuk. Artinya kedua URL bisa
dijangkau siapa pun yang tahu alamatnya. Yang menjaga datanya adalah auth + RLS, bukan kerahasiaan
URL; `X-Robots-Tag: noindex` mencegah terindeks, bukan diakses.

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

### 3. Email — sekarang jalur kritis (ADR-0022)

Ortu masuk dengan **kode sekali pakai lewat email, tanpa password**. Konsekuensinya: kalau email
tidak terkirim, **tidak ada satu pun ortu yang bisa masuk.** Tiga hal wajib dibereskan di dashboard
Supabase sebelum keluarga pertama diundang:

| Setelan | Kenapa |
|---|---|
| **SMTP sendiri** (Resend/Postmark/sejenis) | Pengirim bawaan Supabase dibatasi ketat & ditujukan untuk pengembangan. 30 keluarga yang mendaftar berbarengan akan menabraknya |
| **Template email memuat `{{ .Token }}`** | Default Supabase mengirim **magic link**. Kalau template tidak diubah, ortu menerima tautan yang tidak bisa diketik ke layar kode |
| **Umur OTP dipendekkan** (~10 menit) | Default 1 jam terlalu panjang untuk kode sekali pakai |

⚠️ **Panjang kode adalah setelan dashboard, bukan konstanta kode.** Saat diuji ia keluar **8 digit**.
Copy sengaja tidak menyebut angka — jangan tambahkan.

⚠️ **Pembatas percobaan OTP milik Supabase, bukan milik kita.** Berbeda dengan gerbang console yang
rate limiter-nya kita bangun dan buktikan sendiri. Ia **wajib dibuktikan menyala** saat uji pertama —
minta kode berulang-ulang sampai dijawab `429`.

**Jalan darurat kalau kamu sendiri terkunci:** Supabase dashboard bisa membuat magic link manual
untuk sebuah akun. Ketahui ini sebelum butuh.

**Membuat 30 akun ortu:** tidak ada halaman daftar, dan itu disengaja — permintaan kode memakai
`create_user: false`, jadi hanya email yang sudah dibuat lebih dulu yang bisa masuk. Buat akunnya
lewat Admin API (`POST /auth/v1/admin/users`), lalu tautkan ke `parents`. Uji tertutup ditegakkan
oleh jawaban server, bukan dengan menyembunyikan tautan daftar.

### 4. Deployment Protection

Nyalakan untuk kedua project selama pengembangan. **Matikan (atau pakai password) untuk uji 30
keluarga** — kalau tidak, ortu dan anak tidak bisa masuk sama sekali.

`vercel.json` tiap app sudah memasang, tanpa bergantung dashboard:

- `X-Robots-Tag: noindex, nofollow` — produk anak belum boleh terindeks
- `Content-Security-Policy: frame-ancestors 'none'` — app ortu berisi tombol **Approve** yang
  memindahkan uang. Tanpa ini, halamannya bisa di-iframe dan tombol itu jadi sasaran clickjacking
- `X-Content-Type-Options: nosniff` · `Referrer-Policy: no-referrer`

### 5. Setelah deploy — yang harus benar-benar dicoba

Bukan dibaca, dicoba. Repo ini sudah tiga kali kena fitur yang "ada" tapi tidak pernah menyala
(RLS rekursif, view yang melewati RLS, rate limit yang tak pernah menghitung).

1. **Anak masuk** dengan kode keluarga + PIN → Home menampilkan saldo
2. **Ortu minta kode → email BENAR-BENAR sampai → masuk.** Ini yang membuktikan SMTP hidup. Kalau
   gagal, tidak ada satu pun ortu yang bisa masuk (ADR-0022)
3. **Email asing minta kode** → tidak ada akun baru terbuat, dan jawabannya identik dengan email
   terdaftar. Itu gerbang uji tertutupnya
4. **Minta kode berulang-ulang** sampai dijawab `429` → membuktikan pembatas Supabase menyala.
   Ia milik vendor, jadi ia harus dilihat, bukan diasumsikan
5. **Ortu masuk**, lalu **tunggu lewat 1 jam** (atau tanam access token kedaluwarsa) → dashboard
   tetap terbuka. Ini yang membuktikan `NEXT_PUBLIC_*` benar-benar ada saat build
6. **Ganti PIN anak** dari Settings → PIN lama berhenti berlaku, PIN baru bisa dipakai masuk.
   Tanpa jalur ini, anak yang lupa PIN terkunci permanen
7. **Pasang ke Home Screen** di iPhone → ikon muncul, app terbuka tanpa address bar, dan **nav bawah
   tidak tertutup home indicator**. Yang terakhir itu yang diperbaiki `viewportFit: 'cover'`, dan ia
   hanya kelihatan salah dalam mode standalone — tidak pernah di tab Safari
8. **Satu siklus uang penuh**: anak minta cash out → ortu approve → saldo turun tepat sejumlah itu

---

## Console — project ketiga, dan satu-satunya yang bersyarat

[ADR-0021](decisions/0021-console-boleh-dideploy-dengan-syarat.md) mengamandemen ADR-0015: console
boleh punya URL, karena laptop dev berbeda dari laptop & HP harian, dan pemeriksaan invarian justru
paling dibutuhkan saat sedang tidak di depan mesin dev.

Tapi ia membaca **service role, lintas keluarga, RLS dilewati** — satu halamannya berisi saldo setiap
anak di setiap keluarga. Jadi ia hanya boleh naik dengan **tiga lapis sekaligus.** Kurang satu →
kembali ke `npm run console:dev` di mesin sendiri.

### 1. Vercel Deployment Protection — WAJIB, dan cek dulu plan-mu

Lapis platform: Vercel mencegat sebelum permintaan menyentuh kode app. **Verifikasi dulu bahwa
plan Vercel-mu menyediakannya untuk domain produksi** — di sebagian plan, proteksi otomatis hanya
berlaku untuk deployment preview, bukan produksi. Kalau ternyata tidak tersedia, **jangan
deploy console.** Itu syarat, bukan saran.

### 2. Env — satu lagi dari app produk

| Nama | Catatan |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | sama dengan app lain |
| `SUPABASE_SECRET_KEY` | sama dengan app lain |
| `CONSOLE_PASSWORD` | **hanya console.** Rahasia panjang & acak — ini satu-satunya kredensial |

`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` **tidak** dipakai console.

Kunci HMAC sesi diturunkan dari `CONSOLE_PASSWORD`, jadi **menggantinya langsung membatalkan semua
sesi.** Itu perilaku yang diinginkan, bukan efek samping.

### 3. Rate limiting sudah ada, tapi butuh migrasinya

Migrasi **0017** (`console_login_attempts`) harus sudah jalan di project Supabase — dua lapis,
5 kegagalan / 15 menit per IP dan 30 / 15 menit global. Tanpa tabel itu, route login **menolak
semua percobaan** (rate limiter yang tidak bisa dijawab database membuat gerbang buta, dan menolak
lebih aman daripada melanjutkan tanpa pembatas).

### Yang harus dicoba setelah console naik

1. Buka URL-nya **tanpa login** → dialihkan ke `/login`, nol nominal di respons
2. Password salah **6×** → percobaan ke-6 dijawab terkunci
3. Lalu masukkan password **benar** → **tetap ditolak** selama terkunci. Kalau ia lolos, urutan
   periksa terbalik dan gerbangnya jadi oracle
4. Hapus `CONSOLE_PASSWORD` di Vercel lalu redeploy → **semuanya** `503`. Kalau malah terbuka,
   gerbangnya gagal-terbuka dan harus dihentikan sebelum dipakai

> Poin 3 dan 4 yang paling mudah dilewat, dan justru keduanya yang membedakan gerbang sungguhan
> dari gerbang yang cuma terpasang.

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
