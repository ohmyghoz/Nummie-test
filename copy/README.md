# copy/

**Tidak boleh ada satu pun string UI yang di-hardcode di komponen.** Semuanya lewat sini.

Alasannya bukan kerapian — ini penawar untuk D1 yang belum diputuskan. Di mockup, copy Inggris
tersebar di HTML: menyakitkan diubah, tapi sekali jalan. Kalau copy yang sama tersebar di puluhan
komponen React, D1 berubah dari "menyakitkan" jadi "berhari-hari". Dengan kamus, D1 jadi murah
kapan pun kamu memutuskannya, dan toggle bahasa 🌐 yang sudah ada di app anak HP jadi gratis di
semua permukaan.

## Isi

| Berkas | |
|---|---|
| `en.ts` | kamus Inggris — **sumber kebenaran struktur kunci saat ini** (port apa adanya dari mockup) |
| `id.ts` | kamus Indonesia — sebagian sudah terisi (console & beberapa layar ortu memang sudah ID) |
| `types.ts` | bentuk kamus — kedua bahasa wajib memenuhi bentuk yang sama |

## Aturan

1. Kunci mendeskripsikan **tempat & makna**, bukan kalimatnya: `sort.emptyState`, bukan `sortNoMoney`.
2. Nominal tidak pernah masuk kamus — selalu lewat `formatRp()` dari `@nummi/core`.
3. Teks bebas yang ditulis anak (alasan cash-out, alasan Give) berbahasa Indonesia apa adanya dan
   tidak terpengaruh D1. Jangan diterjemahkan, jangan disimpan di sini.
4. Istilah kategori diambil lewat `categoryLabel(lang, tier, category)`, tidak pernah `"Spend"`.
