# copy/

**Seluruh string UI hidup di sini. Tidak boleh ada satu pun yang di-hardcode di komponen.**

Alasannya bukan kerapian — melainkan **D1 dan D2 belum diputuskan**
(lihat `../docs/decisions/OPEN-keputusan-tertunda.md`).

Kondisi sekarang: mockup berbahasa Inggris, console berbahasa Indonesia, pasar Indonesia.
Rekomendasi yang belum disetujui: Indonesia sebagai bahasa produk. Selama semua string lewat berkas
ini, biaya keputusan itu tinggal mengganti isi kamus — bukan menyisir puluhan komponen.

## Aturan

1. Istilah kategori **selalu** lewat lookup `[tier][category]`, tidak pernah teks mati.
   D2 belum memutuskan apakah istilah berubah menurut tier. Bentuk ini menampung kedua jawaban.
2. Nominal **tidak pernah** ada di kamus. Selalu lewat `formatRp()` dari `@nummi/core`.
3. Teks bebas yang ditulis anak (alasan cash-out, alasan Give) memang berbahasa Indonesia apa adanya
   dan tidak terpengaruh D1.
