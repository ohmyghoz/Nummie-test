# ADR-0012 — Auth anak: kode keluarga + PIN → JWT ber-claim

**Status:** ✅ diputuskan 28 Juli 2026 · **diamandemen 29 Juli 2026** saat dibangun (lihat bawah)

## Konteks
Anak tidak punya email. Supabase Auth tidak punya konsep "PIN di bawah akun ortu". Prototipe akan
diuji ke pasangan ortu–anak sungguhan di dua perangkat berbeda, jadi ini harus benar sejak awal.

## Opsi yang dipertimbangkan
| Opsi | Cara kerja | Kenapa tidak dipilih |
|---|---|---|
| A | Anak = user Supabase dengan email sintetis | RLS penuh, tapi paling banyak kerja dan janggal bagi ortu |
| B | Satu sesi keluarga, PIN diperiksa di klien | **melanggar C-5 langsung** — anak yang tahu inspect element bisa membuka layar ortu. Untuk app uang, model kepercayaannya runtuh |
| **C ✅** | Kode keluarga + PIN → Edge Function verifikasi → JWT dengan claim `child_id` + `tier` | dipilih |

## Keputusan
Opsi **C**. Anak masuk dengan **kode keluarga + PIN**. Edge Function memverifikasi dan mengeluarkan
JWT ber-claim `child_id`, `family_id`, `tier`, `role='child'`. Seluruh RLS membaca claim tersebut.

## Kenapa
Backlog console **C-5** sudah menetapkan bahwa mode dukungan harus jadi kebijakan sisi server
(row-level security), **bukan penyembunyian di sisi klien**. Memilih opsi C sekarang berarti prinsip
itu berlaku sejak baris pertama, bukan ditambal belakangan.

## Konsekuensi wajib
- **Rate limiting bukan opsional.** Kunci sementara setelah N percobaan gagal — lihat amandemen
  di bawah untuk kuncinya yang sekarang.
- PIN disimpan **ter-hash**, tidak pernah plaintext.
- Claim `tier` di JWT hanya untuk kenyamanan UI. **Otorisasi tidak pernah bergantung pada tier** —
  hanya pada `child_id` dan `family_id`.
- Ortu tetap memakai Supabase Auth biasa (email + password / magic link).

---

## Amandemen — 29 Juli 2026 (saat dibangun)

Keputusan inti (opsi C) tidak berubah. Tiga hal di bawah ini ditetapkan saat implementasinya
benar-benar dijalankan, dan dua di antaranya mengoreksi asumsi ADR ini sendiri.

### A1. Login TIDAK memakai `child_id` — kode keluarga + PIN saja

Versi pertama Edge Function menuntut `childId` berupa UUID. Anak jelas tidak mengetiknya, dan
langkah "pilih anak" lebih dulu tidak punya jalur baca yang sah: RLS `children_read` menuntut token
yang justru belum terbit pada saat login. Lingkaran yang sama bentuknya dengan rekursi RLS di
migrasi `0004`, hanya pindah lapisan.

Dipilih **tanpa daftar anak sama sekali**: `find_child_by_pin()` mencari anak mana di keluarga itu
yang PIN-nya cocok. Opsi yang ditolak: endpoint publik berisi nama anak per kode keluarga (membuat
kode keluarga jadi bocoran daftar anak), dan QR dari app ortu (paling aman, tapi terlalu berat untuk
uji pertama). Riwayat pilihannya di `docs/nummi-backlog.md` U-7.

**Kalau dua anak ber-PIN sama, login GAGAL** — server tidak menebak. Masuk sebagai "salah satu dari
dua anak" jauh lebih buruk daripada tidak bisa masuk.

### A2. PIN = 6 digit tetap, dan wajib unik dalam satu keluarga

Menutup **K15** (repo sempat menyebut 4, 4–6, dan 6 di tiga tempat). Yang memaksa keputusannya
adalah A1: karena anak tidak memilih dirinya lebih dulu, **setiap anak menambah satu PIN yang sah
di ruang tebakan yang sama**. Keluarga 3 anak = 3 kunci untuk satu gembok. 6 digit menjadikan ruang
itu 1.000.000, bukan 10.000.

Keunikan **tidak bisa dijaga constraint** — bcrypt memberi salt berbeda tiap baris, jadi dua PIN
identik menghasilkan hash berbeda. Penegakannya di waktu tulis: `family_pin_taken()` (migrasi `0007`)
dan `validateChild(..., { pinTakenInFamily })` di `packages/core`.

⚠️ **Ditinjau ulang kalau D5 memasukkan Little (KG B–Grade 2).** 6 digit untuk anak 5 tahun adalah
pertanyaan yang berbeda, dan jawabannya mungkin bukan PIN sama sekali.

### A3. Rate limiting: dua lapis, dan sebelumnya TIDAK PERNAH menyala

Kunci lamanya `(child_id, ip)` — padahal `child_id` justru bagian yang belum diketahui saat
percobaan gagal. Lebih buruk lagi, `ip` diambil dari `x-forwarded-for` **utuh**, padahal header itu
sebuah rantai yang hop terakhirnya adalah proxy Supabase sendiri dan **berganti tiap permintaan**.
Akibatnya setiap percobaan tampak datang dari IP baru: tujuh tebakan berturut-turut semuanya lolos.
Kode rate limiting-nya ada sejak awal; yang tidak ada adalah efeknya.

Sekarang dua lapis, karena hop pertama `x-forwarded-for` dikirim klien dan bisa dipalsukan:

| Lapis | Kunci | Ambang |
|---|---|---|
| a | (keluarga, IP klien) | 5 / 15 menit |
| b | keluarga, dari IP mana pun | 20 / 15 menit |

Lapis (b) menangkap rotasi IP palsu — kode keluarga tidak bisa ikut dipalsukan, karena harus benar
agar tebakannya ada gunanya. **Harganya diambil sadar:** siapa pun yang tahu kode keluarga bisa
mengunci keluarga itu 15 menit. Untuk fase prototipe, satu keluarga terkunci sementara lebih murah
daripada satu keluarga yang PIN-nya benar-benar ditebak.

### Yang masih menumpang utang

Token anak ditandatangani **HS256** dengan JWT secret legacy project (status `Previously used`),
karena project sudah pindah ke signing key ES256 yang privat-nya tidak diberikan ke Edge Function.
**Jangan me-revoke kunci itu** sebelum backlog U-6 selesai.

## Privasi untuk fase uji
Data anak sungguhan, walau tidak ada uang riil bergerak. Untuk pengujian: **nama samaran**, **tanpa
foto** (sekaligus menunda item backlog "foto di cerita Give" dengan alasan yang baik), dan data
bisa dihapus atas permintaan. Region Supabase: **Singapore** (latensi Indonesia).
