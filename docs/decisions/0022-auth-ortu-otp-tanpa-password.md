# ADR-0022 — Auth ortu: kode sekali pakai lewat email, tanpa password

**Status:** ✅ diputuskan 30 Juli 2026 · menggantikan sign-in password di app ortu ·
melengkapi [ADR-0012](0012-auth-anak-kode-keluarga-pin.md) (yang mengatur sisi anak)

## Konteks — apa yang sebenarnya rusak

Pertanyaan yang memulai ini sederhana: *"ini ada halaman register akun baru dan mekanisme reset
password kan?"* Jawabannya **tidak, dan tidak** — dan pemeriksaannya menemukan tiga lubang, bukan dua:

| | Keadaan sebelum 30 Juli 2026 |
|---|---|
| Halaman daftar akun ortu | tidak ada — hanya `/login` |
| Reset password ortu | tidak ada — nol jejak `resetPasswordForEmail`, tidak ada tautan "lupa password" |
| Undang ortu kedua | matriks status menandainya ✅; **kodenya tidak pernah ada** |
| Ganti PIN anak | tidak ada — PIN hanya bisa diisi saat anak DIBUAT |

Database mengonfirmasi bentuknya: **1 akun auth, 1 baris `parents`** — semuanya dibuat tangan lewat
Admin API saat U-3.

Konsekuensi untuk uji 30 keluarga bukan teoretis: setiap ortu yang lupa password, dan setiap anak
yang lupa PIN, menjadi **tiket dukungan manual** untuk satu founder yang bekerja kantoran.

## Keputusan

**Auth ortu = kode sekali pakai lewat email. Password dihapus dari jalurnya.**

Dua langkah di satu halaman: email → kode → sesi. Cookie httpOnly dipasang server, sama seperti
sebelumnya dan sama seperti app anak.

## Kenapa OTP, bukan "bangun halaman daftar + reset"

**Satu layar menghapus dua masalah.** Tidak ada password berarti tidak ada yang bisa dilupakan,
jadi tidak ada yang perlu direset. Halaman daftar dan halaman lupa-password sama-sama tidak perlu
dibangun — bukan ditunda, tidak perlu ada.

**Tidak perlu halaman daftar sama sekali, dan itu justru gerbangnya.** Permintaan kode dikirim
dengan `create_user: false`, jadi hanya email yang akunnya sudah dibuat lebih dulu yang bisa masuk.
Uji tertutup ditegakkan oleh **jawaban server**, bukan dengan menyembunyikan tautan daftar. Diuji:
email asing tidak membuat akun apa pun.

**Jawabannya seragam.** Email terdaftar dan email asing mendapat respons yang identik. Kalau layar
ini membedakan keduanya, ia jadi alat memeriksa siapa saja yang ikut uji ini — dan daftar keluarga
yang anaknya memakai app uang adalah daftar yang tidak boleh bisa ditanyakan.

## Kenapa KODE, bukan magic link — ini keputusan PWA

Bagian yang paling mudah salah pilih.

**Magic link membuka browser bawaan aplikasi email**, yang sering bukan browser tempat PWA dipasang.
Cookie httpOnly mendarat di konteks yang salah, dan ortu tetap terkunci di luar app yang barusan
dia pasang ke Home Screen. Kode yang diketik ke layar yang **sudah terbuka** tidak punya masalah itu.

Ini konsekuensi langsung dari [ADR-0019](0019-d4-pwa-untuk-mvp.md) (D4 = PWA). Kalau distribusi
berubah jadi native, pilihan ini layak ditinjau ulang — bukan karena kode jadi salah, tapi karena
alasan terkuatnya menghilang.

## Harga yang diambil sadar

**Email jadi jalur kritis.** Sebelumnya ortu bisa masuk tanpa email berfungsi; sekarang tidak.
Pengirim bawaan Supabase dibatasi ketat dan memang ditujukan untuk pengembangan — **uji 30 keluarga
butuh SMTP sendiri.** Ini syarat operasional, dan ia dicatat di `docs/DEPLOY.md`.

**Pembatas percobaan milik Supabase, bukan milik kita.** Berbeda dengan gerbang console
([ADR-0021](0021-console-boleh-dideploy-dengan-syarat.md)) yang rate limiter-nya kita bangun dan
buktikan sendiri (migrasi 0017), di sini kita tidak memegang jalur verifikasinya. Konsekuensinya
harus diketahui, bukan diasumsikan: batas itu **wajib dibuktikan menyala saat uji pertama.**

**Panjang kode adalah setelan dashboard, bukan konstanta kode.** Saat diuji ia keluar **8 digit**,
padahal copy-nya semula menjanjikan "6-digit code". Copy sekarang tidak menyebut angka sama sekali —
kalimat yang menyebut angka akan berbohong diam-diam begitu setelannya diubah.

**Jalan darurat kalau terkunci:** Supabase dashboard bisa membuat magic link manual untuk sebuah
akun. Tanpa jalan ini, satu kesalahan konfigurasi email mengunci founder dari app-nya sendiri.

## Yang ikut dibangun: ganti PIN anak

Ditemukan di pemeriksaan yang sama, dan lebih buruk daripada ketiadaan biasa — **app menjanjikan
sesuatu yang mustahil.** `copy/en.ts` berbunyi: *"Forgot your PIN? Ask your grown-up — **they can
see it in their app**."*

Ortu tidak bisa melihat apa pun. `pin_hash` di-bcrypt dan sengaja tidak pernah keluar dari database
(migrasi 0006) — perbaikan keamanan yang benar, tapi tidak ada yang membangun jalur gantinya
sesudahnya, dan tidak ada yang memperbarui kalimatnya. Anak yang lupa PIN terkunci **permanen** dari
uangnya sendiri, sementara app menyuruhnya meminta bantuan yang tidak bisa diberikan.

Yang dibangun: `set_child_pin()` (migrasi 0018) + layar "PIN baru" di app ortu.

**Ortu MENGGANTI, tidak pernah MELIHAT.** Bedanya dipertahankan dengan sengaja: PIN tetap milik
anak, ortu adalah jalur pemulihan — bukan pengintai. Layarnya mengatakannya apa adanya
(*"Nobody can look up the old PIN — not even you"*), karena ortu yang mengira bisa melihatnya akan
mencari dan tidak menemukan apa pun.

`family_pin_taken_for_other()` ditambahkan karena versi lama menjawab pertanyaan yang salah untuk
kasus ini: ia menghitung anak yang sedang diganti, jadi ortu yang mengetik ulang PIN yang sama
ditolak dengan alasan yang keliru.

## Yang membatalkan ADR ini

Distribusi berubah ke native (magic link berhenti bermasalah) · uji membuktikan ortu Indonesia
menolak login tanpa password · atau operator kedua masuk dan "siapa melihat apa" jadi pertanyaan
nyata.
