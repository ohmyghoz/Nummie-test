# ADR-0020 — D5 dijawab: Middle saja untuk MVP. Kode Little & Teen tetap hidup.

**Status:** ✅ diputuskan 30 Juli 2026 · menutup **D5** untuk cakupan MVP

## Keputusan

**Hanya tier `middle` yang tersedia di MVP.** Ditegakkan di jalur tulis (`MVP_TIERS` di
`packages/core`, `validateChild()` menolak selebihnya), bukan sekadar dicatat.

**Kode Little & Teen tidak dihapus.** Aturan CLAUDE.md tetap: *tier = feature flag*. Membangunnya
ulang mahal, membiarkannya mati sementara murah.

## Koreksi yang memaksa ADR ini ditulis, bukan sekadar dicentang

`nummi-status.md` §5 dan backlog §G2 sama-sama menulis bahwa pemilih tier *"sudah dimatikan —
`harness()` mengembalikan `null`, jadi hanya Middle yang bisa didemokan."* Kalimat itu menggambarkan
**mockup beku di `legacy/`**. Fungsi `harness()` tidak ada di app nyata.

Di `apps/kid` yang sungguhan, tier dibaca dari kolom database (`lib/data.ts:136`), dan
`apps/parent/app/children/new/page.tsx:11` menawarkan **ketiga tier** kepada ortu. `suggestTier()`
akan menempatkan anak 7 tahun di `little` — tier yang tidak pernah diuji — tanpa ada yang menghalangi.

Artinya D5 selama ini terasa sudah dijawab padahal tidak pernah ditegakkan di mana pun. Ini pola yang
sama persis dengan yang baru saja ditutup [ADR-0018](0018-harga-sekali-bayar.md): `isPro()` hidup di
dokumen selama berbulan-bulan tanpa pernah dipanggil satu app pun. Keputusan yang tidak punya penegak
bukan keputusan, hanya harapan.

## Kenapa Middle

**30 keluarga hanya cukup untuk menjawab pertanyaan tentang satu tier.** Dibagi tiga jadi ~10 per
tier — terlalu sedikit untuk menyimpulkan apa pun, dan setiap keluhan jadi mustahil dibaca: apakah ini
masalah produk, atau masalah tier yang salah?

**Middle punya permukaan fitur paling lengkap**, jadi ia menguji paling banyak dengan satu kelompok:
Little menyembunyikan dream dan Today's mission (ADR-model Little), sementara Teen menjanjikan rasio
auto-split yang bisa diedit anak — dan itu **belum dibangun** (backlog A-sisa-3). Menguji Teen sekarang
berarti menguji fitur yang tidak ada.

## Konsekuensi

**Tiga keputusan berhenti bersyarat sekaligus.** Dua ADR menggantungkan pemicu tinjau ulang pada D5,
dan keduanya sekarang tidak bisa menyala di MVP:

| ADR | Pemicu tinjau ulang | Status setelah ADR ini |
|---|---|---|
| [0016](0016-bahasa-produk-inggris.md) bahasa Inggris | *"kalau D5 memasukkan Little"* | tidak menyala — Inggris mantap untuk MVP |
| [0017](0017-istilah-kategori-sama-lintas-tier.md) istilah kategori | *"kalau D5 memasukkan Teen dan uji menunjukkan penolakan"* | tidak menyala |

Argumen terkuat untuk Indonesia selalu anak KG B–Grade 2 yang belum bisa membaca Inggris. Anak-anak
itu **tidak ada di MVP**. `copy/id.ts` tetap dipelihara — `Dictionary` menjaganya lewat tipe, dan itu
yang membuat keputusan bahasa tetap murah dibalik saat Little masuk.

**Batasan rekrutmen, dan ini yang paling mudah terlupakan.** `middle` = usia **9–12**
(`LITTLE_MAX_AGE = 8`, `MIDDLE_MAX_AGE = 12`). 30 keluarga harus direkrut dalam rentang itu. Kalau
tidak, datanya tidak menjawab pertanyaan yang sedang diuji — dan itu baru ketahuan setelah ujinya
selesai.

**Pertanyaan PIN 6 digit untuk anak 5 tahun tidak muncul.** `onboarding.ts:35` menandainya sebagai
peringatan yang menunggu Little; ia tetap menunggu.

**Ortu yang anaknya di luar rentang diberi tahu apa adanya — tapi tidak dihalangi.** Ini pengecualian
yang perlu ditulis alasannya, karena versi pertama keputusan ini adalah memblokir mereka.

`onboarding.ts` catatan 2 sudah mengunci: *"Tier DISARANKAN, tidak ditetapkan… Ortu boleh menimpanya
tanpa dihakimi — tidak ada peringatan, tidak ada 'yakin?'."* Gerbang usia yang menolak pendaftaran
akan melanggar itu secara langsung. Jadi yang ditegakkan keras adalah **cakupan** (`MVP_TIERS` —
tier mana yang ada sama sekali), sementara usia hanya memicu **kalimat jujur** di layar bahwa uji ini
untuk anak 9–12.

Pengendali sebenarnya tetap **rekrutmen**, bukan validasi form. Itu memang tempat yang benar: anak
7 tahun yang diam-diam masuk Middle menghasilkan umpan balik menyesatkan, tapi ortu yang ditolak
mentah di tengah onboarding menghasilkan sesuatu yang lebih buruk — tidak ada data sama sekali.

## Yang akan membuka ini kembali

MVP membuktikan Middle bekerja dan cakupan diperlebar. Saat itu terjadi, **ADR-0016 wajib ditinjau
ulang lebih dulu** kalau yang ditambahkan adalah Little — bukan sesudah layarnya dibangun.
