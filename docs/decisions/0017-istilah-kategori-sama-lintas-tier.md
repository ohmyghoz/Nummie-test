# ADR-0017 — Istilah kategori sama untuk ketiga tier

**Status:** ✅ diputuskan 29 Juli 2026 · menutup **D2**

## Konteks

Empat sumber menyebut istilah kategori, dan tiga di antaranya sudah sepakat:

| Sumber | Istilah |
|---|---|
| Brand system §5.2 | Spend/Pakai · Save/Simpan · Give/Berbagi · Grow/Bertumbuh · Unsorted/Uang Baru |
| Lembar karakter yang disetujui | sama persis, dwibahasa berpasangan |
| Kalimat posisi resmi | "memakai, menyimpan, berbagi dan mengelola" |
| **Design system §13.1** | **berbeda** — Middle: Belanja/Impian · Teen: Pengeluaran/Tabungan/Investasi |

Yang tersisa dari D2 bukan "istilah mana", melainkan **apakah istilahnya berubah menurut tier.**
`copy/` sudah memakai lookup `[tier][kategori]` sejak awal, diisi identik dengan catatan sementara
*"sampai D2 memutuskan sebaliknya"* — jadi kedua jawaban sama-sama murah untuk dijalankan.

## Keputusan

**Satu set istilah untuk Little, Middle, dan Teen.** Yang dipakai adalah versi brand §5.2 —
`Unsorted · Spend · Save · Give · Grow`, dengan pasangan Indonesia `Uang Baru · Pakai · Simpan ·
Berbagi · Bertumbuh`.

Design system §13.1 ditulis ulang mengikuti keputusan ini. **Bentuk lookup `[tier][kategori]`
tetap dipertahankan**, walaupun ketiga nilainya kini identik — lihat "Konsekuensi" di bawah.

## Kenapa

**Alasan utamanya sudah kamu putuskan di tempat lain.** Warna kategori dikunci sebagai alat belajar
yang tak pernah berubah (brand §5.2: *"The category colors must remain consistent throughout the
product"*). Kalau warnanya jangkar tapi namanya berubah tiap naik tier, jangkarnya cuma setengah.
Anak yang lulus dari Middle ke Teen harus belajar ulang nama benda yang sama — sementara justru
anak itulah yang sudah punya dua tahun kebiasaan melekat pada nama lamanya.

Alasan kedua, lebih membosankan tapi nyata: tiga set × dua bahasa = 30 istilah untuk dirawat, dan
setiap istilah yang bisa menyimpang, cepat atau lambat menyimpang. Repo ini sudah punya register
kontradiksi sepanjang 15 baris; menambah 30 titik yang bisa bergeser bukan harga yang sepadan untuk
kosakata yang lebih dewasa.

Alasan ketiga: **§13.1 adalah satu-satunya sumber yang menyimpang**, dan ia menyimpang dari lembar
karakter yang sudah disetujui. Yang lebih murah diperbaiki adalah yang sendirian.

## Yang diambil sadar sebagai risiko

Anak 15 tahun bisa merasa "Save" dan "Give" kekanak-kanakan dibanding "Tabungan" dan "Donasi".
Kekhawatiran §13.1 itu **sah**, dan keputusan ini tidak berpura-pura ia tidak ada.

Kalau nanti terbukti nyata dari uji pengguna, jalan keluarnya **bukan** mengganti label, melainkan
menambah lapisan penjelasan per tier (label tetap jadi jangkar, teks pendukungnya yang tumbuh).
Opsi itu sudah dipertimbangkan dan ditunda karena harganya 15 kalimat baru × 2 bahasa untuk masalah
yang belum terbukti ada.

## Konsekuensi

- **Bentuk `Record<Tier, CategoryTerms>` TIDAK dibongkar.** Ketiga nilainya identik hari ini, tapi
  strukturnya yang membuat keputusan ini bisa dibalik dengan mengedit kamus, bukan dengan menyisir
  komponen. Aturan lama tetap berlaku: **istilah kategori tidak pernah ditulis mati di komponen.**
- Aturan itu sekarang punya alasan yang lebih baik daripada "D2 belum diputuskan": ia yang menjaga
  pintu keluar untuk risiko di atas tetap murah.
- Design system §13.1 tidak lagi jadi sumber istilah — ia menunjuk ke ADR ini.
- Kolom "Unsorted" ikut terkunci: **Unsorted / Uang Baru**, bukan "Belum dibagi" atau "Belum
  dialokasikan".

## Ditinjau ulang kalau

- **D5 memasukkan Teen** ke MVP dan uji pengguna menunjukkan penolakan nyata pada kosakatanya; atau
- muncul kebutuhan regulasi/edukasi yang menuntut istilah finansial baku untuk pengguna remaja.

Sampai salah satu terjadi, ini keputusan tertutup.
