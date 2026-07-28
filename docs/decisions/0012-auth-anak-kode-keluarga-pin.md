# ADR-0012 — Auth anak: kode keluarga + PIN → JWT ber-claim

**Status:** 🆕 diputuskan 28 Juli 2026

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
- **PIN 4 digit = 10.000 kombinasi. Rate limiting bukan opsional.** Kunci sementara setelah N
  percobaan gagal, per (kode keluarga + child).
- PIN disimpan **ter-hash**, tidak pernah plaintext. (Mockup Add-a-child memakai PIN 6 digit — kalau
  6 tetap dipakai, makin baik; putuskan saat build.)
- Claim `tier` di JWT hanya untuk kenyamanan UI. **Otorisasi tidak pernah bergantung pada tier** —
  hanya pada `child_id` dan `family_id`.
- Ortu tetap memakai Supabase Auth biasa (email + password / magic link).

## Privasi untuk fase uji
Data anak sungguhan, walau tidak ada uang riil bergerak. Untuk pengujian: **nama samaran**, **tanpa
foto** (sekaligus menunda item backlog "foto di cerita Give" dengan alasan yang baik), dan data
bisa dihapus atas permintaan. Region Supabase: **Singapore** (latensi Indonesia).
