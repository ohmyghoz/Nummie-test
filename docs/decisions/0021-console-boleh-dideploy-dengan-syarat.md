# ADR-0021 — Console boleh di-deploy, dengan tiga syarat yang tidak bisa ditawar

**Status:** ✅ diputuskan 30 Juli 2026 · **mengamandemen [ADR-0015](0015-console-duluan-tipis.md)**

## Apa yang diamandemen

ADR-0015 memutuskan console dibangun duluan dan tipis, menaruh **C-2 (autentikasi & peran
sungguhan)** di backlog, dan menulis *"bukan produk; alat."*

Yang menarik: **aturan "tidak boleh dipublikasikan" tidak pernah ada di ADR-0015.** Ia hidup di
komentar `apps/console/lib/supabase.ts` — *"console TIDAK punya login dan TIDAK boleh dipublikasikan
bersama app produk. Ia dijalankan operator di lingkungan yang dia kendalikan sendiri (ADR-0015)"* —
yang mengatasnamakan ADR-0015 untuk kesimpulan yang ADR itu sendiri tidak pernah tulis.

Itu sendiri layak dicatat: **aturan paling penting tentang keamanan console hidup di komentar kode,
bukan di berkas keputusan.** Komentar tidak punya status, tidak muncul di daftar ADR, dan tidak ada
yang meninjaunya. ADR ini memindahkannya ke tempat yang benar sekaligus mengubahnya.

**Asumsi yang dipakai komentar itu ternyata tidak menggambarkan kenyataan.** Laptop yang dipakai
founder untuk
mengembangkan berbeda dari laptop dan HP yang dia pakai sehari-hari. "Lingkungan yang dikendalikan
sendiri" hanya ada di satu mesin, dan pemeriksaan invarian justru paling dibutuhkan saat sedang
tidak di depan mesin itu — founder ini bekerja kantoran, dan itu kendala yang sudah tercatat di
seluruh dokumen produk ini.

Asumsi yang tidak cocok dengan cara orangnya bekerja akan dilanggar, cepat atau lambat. Lebih baik
diamandemen terbuka daripada dilanggar diam-diam.

## Keputusan

**Console boleh di-deploy**, dan **hanya** kalau ketiganya terpasang bersamaan:

1. **Vercel Deployment Protection menyala** — mencegat di lapis platform, sebelum permintaan
   menyentuh kode app.
2. **Gerbang aplikasi gagal-tertutup** — cookie bertanda tangan HMAC; tanpa `CONSOLE_PASSWORD`
   console menjawab `503` untuk semuanya.
3. **Rate limiting yang terbukti menghitung** — `console_login_attempts` (migrasi 0017), dua lapis,
   diuji dengan percobaan sungguhan.

Kalau salah satu tidak ada, console kembali ke aturan ADR-0015: **lokal saja.**

## Kenapa tiga, bukan satu

**Karena satu lapis yang gagal senyap tidak bisa dibedakan dari lapis yang bekerja.** Repo ini sudah
membayar pelajaran itu empat kali — RLS rekursif, view yang melewati RLS, rate limit yang tak pernah
menghitung ([ADR-0012 §A3](0012-auth-anak-kode-keluarga-pin.md)), dan `isPro()` yang tak pernah
dipanggil ([ADR-0018](0018-harga-sekali-bayar.md)). Semuanya lolos review kode.

Deployment Protection dan gerbang aplikasi berasal dari **vendor yang berbeda dan gagal dengan cara
yang berbeda**. Salah konfigurasi di satu sisi tidak otomatis membuka sisi lain.

## Yang berubah di kode, dan kenapa bentuknya begitu

Bentuk pertama gerbang ini (pagi 30 Juli) adalah **basic auth di middleware**. Ia ditinggalkan
karena satu alasan yang menentukan: basic auth mengirim password di **setiap** permintaan, dan
satu-satunya tempat memeriksanya adalah middleware — yang berjalan di Edge. Menaruh rate limiting di
sana berarti satu round-trip database untuk setiap aset, setiap navigasi. Gerbang tanpa rate limit
bukan pilihan (satu password bersama = bisa ditebak paksa), jadi bentuknya yang harus berubah.

Bentuk sekarang sama dengan app anak & ortu: **cookie httpOnly yang dipasang route handler.**
Password diperiksa **sekali**, di Node runtime, tempat rate limiting murah. Middleware hanya
memverifikasi tanda tangan. Satu pola untuk tiga permukaan.

**Urutan di dalam login tidak boleh dibalik: kunci diperiksa sebelum password.** Kalau password
diperiksa lebih dulu, IP yang sudah terkunci tetap mendapat oracle. Bentuk yang benar sudah
ditetapkan ADR-0012 untuk login anak — *"PIN benar pun tetap ditolak selama terkunci"* — dan console
mengikutinya. Diuji: percobaan ke-6 dijawab `locked`, dan password **benar** sesudahnya tetap ditolak.

**Kunci HMAC diturunkan dari `CONSOLE_PASSWORD`**, bukan rahasia terpisah. Konsekuensinya
diinginkan: mengganti password **langsung membatalkan semua sesi**. Kalau kuncinya terpisah, cookie
lama tetap sah setelah password diganti, dan *"sudah saya ganti passwordnya"* jadi kalimat yang
tidak benar.

## Harga yang diambil sadar

**Lapis global rate limit (30 kegagalan / 15 menit) bisa dipakai mengunci console untuk
operatornya sendiri.** Penyerang yang merotasi IP palsu bisa memicunya. Diterima, karena console
punya jalan keluar yang tidak dimiliki app produk: **operator selalu bisa menjalankannya lokal.**

Trade-off yang sama akan **tidak** bisa diterima di app anak atau ortu — di sana tidak ada jalan
keluar, dan mengunci keluarga dari uangnya sendiri adalah kegagalan produk.

## Yang TIDAK berubah

- Console tetap **baca-saja** dan tetap **bukan produk**
- Console tetap **tidak ikut** di daftar deploy default — mengaktifkannya adalah keputusan sadar
  per-deploy, bukan efek samping mengimpor repo
- **C-2** (auth & peran sungguhan) dan **C-6** (jejak audit kebal-hapus) tetap di backlog. Yang
  dibangun di sini adalah gerbang untuk **satu** operator. Begitu ada operator kedua, "siapa yang
  melihat apa" jadi pertanyaan nyata, dan password bersama berhenti jadi jawaban.

## Yang membatalkan ADR ini

Operator kedua · console mulai bisa menulis · atau uji membuktikan Deployment Protection tidak
tersedia di plan yang dipakai — yang ketiga mengembalikannya ke aturan ADR-0015 tanpa negosiasi.
