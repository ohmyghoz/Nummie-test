# Nummi — STATUS (tracker tunggal)

> **Baca ini duluan.** Dokumen ini menjawab satu pertanyaan: *apa yang sudah ada, di permukaan mana,
> dan apa yang menghalangi MVP.* Keputusan produk ada di `nummi-handoff.md`. Pekerjaan tertunda ada
> di `nummi-backlog.md`. Console ada di `nummi_console.md`.
>
> Terakhir diaudit: **28 Juli 2026** (audit lintas-file atas 5 mockup + 6 dokumen).

---

## 1. Lima permukaan MVP

| # | Permukaan | Berkas aktif | Status | Bahasa UI |
|---|---|---|---|---|
| 1 | **Anak — mobile** | `Nummi_Middle__App_standalone_.html` | prototipe lengkap | Inggris |
| 2 | **Anak — iPad** | `Celengan_iPad__Standalone_.html` | prototipe, **paritas belum penuh** | Inggris |
| 3 | **Ortu — mobile** | `Nummi_Parent_App__Standalone_.html` | prototipe lengkap | Inggris + ID campur |
| 4 | **Ortu — web** | `Nummi_Parent_Web__Standalone_.html` | prototipe lengkap (+halaman Insight) | Inggris + ID campur |
| 5 | **Admin — console** | `nummi-console.html` | prototipe, data dummy | **Indonesia** |

### Berkas yang sudah USANG (jangan dipakai sebagai acuan lagi)

| Berkas | Kenapa usang |
|---|---|
| `celengan-home-mockup.html` | digantikan Nummi Middle mobile + iPad |
| `celengan-parent-mockup.html` | digantikan Nummi Parent mobile + web |
| `nummi-brand-system_1_.md` | ✅ sudah diganti oleh `nummi-brand-system.md` (nama bersih + §8.2 maskot dikoreksi) |

> ✅ **Selesai 28 Juli 2026 — proyek pindah ke repo Git.** Lima mockup sekarang tinggal permanen di
> `legacy/` dengan nama bersih (`kid-mobile`, `kid-ipad`, `parent-mobile`, `parent-web`, `console`),
> jadi tidak ada lagi sesi yang perlu melampirkannya ulang atau salah mengedit berkas usang.
> Ini menutup **X8/K11** (nama berkas) dan **X9** (instruksi menunjuk berkas usang).
>
> Sejak S0, urutan baca yang berlaku: `CLAUDE.md` → dokumen ini → `docs/decisions/`.
> **Sumber kebenaran angka bukan lagi mockup, melainkan `packages/core/src/seed.ts`** — dan angka itu
> dijaga oleh test, bukan oleh ingatan.

---

## 2. Matriks paritas fitur

Legenda: ✅ ada · ⚠️ ada tapi timpang · ❌ tidak ada · — tidak relevan di permukaan ini

| Fitur | Anak HP | Anak iPad | Ortu HP | Ortu Web | Console |
|---|---|---|---|---|---|
| Home + ring kategori | ✅ | ✅ | ✅ | ✅ | — |
| Sort (tier-aware) | ✅ | ✅ | — | — | — |
| Wallets / pocket grid | ✅ | ✅ | ✅ | ✅ | — |
| Add / Move money | ✅ | ✅ | — | — | — |
| Cash out | ✅ | ✅ | ✅ | ✅ | — |
| Give flow + cerita balik | ✅ | ⚠️ tanpa "Write back" | ✅ | ✅ | — |
| Grow: TD / Gold / Forex + Harvest | ✅ | ✅ | ✅ | ✅ | — |
| Penjelas spread emas ("Why is it less…") | ✅ | ✅ | — | — | — |
| Layar Requests / antrean | ✅ | ✅ | ✅ | ✅ | ✅ |
| Missions + kurikulum 6 bab | ✅ | ⚠️ ringkas | ✅ tracker | ✅ tracker | ✅ corong |
| Jobs from home + gerbang ⭐100 | ✅ | ✅ | ✅ builder | ✅ builder | ✅ |
| Prizes / 💎 | ✅ | ✅ | ✅ | ✅ | ✅ |
| Me: avatar shop, badges, tema | ✅ | ✅ | — | — | — |
| Toggle bahasa EN/ID | ✅ placeholder | ❌ | ❌ | ❌ | — |
| Filter rentang tanggal aktivitas | ✅ | ⚠️ 3/7 hari saja | ✅ | ✅ | ✅ |
| Send / Take money | — | — | ✅ | ✅ | — |
| Allowance schedule | — | — | ✅ | ✅ | — |
| Your bank rates + Today's prices | — | — | ✅ | ✅ | ✅ feed |
| **Auto-split editor** (Backlog A) | ✅ dibaca dari `money_rules` (`apps/kid`) | ⚠️ mockup lama | ✅ | ✅ | ❌ |
| **Money rules: Strict/Flexible** (Backlog C) | ✅ ditegakkan (`apps/kid`) | ⚠️ mockup lama | ✅ | ✅ | ❌ |
| **Undang ortu ke-2** (Pro) | — | — | ✅ | ✅ | ❌ |
| Halaman Insight / "What the numbers are telling you" | — | — | ⚠️ sebagian | ✅ | ✅ |
| Rapor Literasi Finansial | — | — | ❌ | ❌ | ❌ |
| Growth Reward (`GROW_REWARD`) | ❌ | ❌ | ❌ | ❌ | ❌ |
| Slot iklan (P1–P4) | — (dilarang, C2) | — | ❌ | ❌ | ❌ |
| Paywall / pembelian | — (dilarang, C1) | — | ❌ | ❌ | ✅ metrik saja |
| Maskot Nummi | ❌ | ❌ | ❌ | ❌ | — |
| Wordmark / kata "Nummi" muncul | ❌ | ❌ | ✅ | ✅ | ✅ |

### Yang paling menonjol dari matriks

1. **App anak sama sekali tidak menyebut "Nummi"** dan tidak memuat maskot. Ini permukaan yang paling
   sering dilihat anak, dan justru satu-satunya yang tanpa brand.
2. **Strict/Flexible dibangun hanya di sisi ortu.** Ortu bisa menyalakan mode Strict, app anak tidak
   tahu-menahu. Aturan yang tidak ditegakkan lebih buruk daripada aturan yang belum ada.
3. **Auto-split editor sama** — ortu bisa mengubah rasio, app anak tetap menulis "40% Spend / 40% Save
   / 20% Give default" sebagai teks mati.

---

## 3. Status per fase

| Fase | Isi | Status |
|---|---|---|
| 1 | Ledger inti, Sort, Wallets, Home, login, approval inbox | ✅ selesai |
| 2 | Send/Take money, Add a child | ✅ selesai |
| 3 | Settings nyata: allowance, bank rates, harga harian, manage investments | ✅ selesai |
| 4 | Ekonomi ⭐/💎, tiga gerbang, Jobs builder, Prizes, avatar shop | ✅ selesai |
| 5 | Give flow + cerita wajib, minus-point raid dream, streak dihapus | ✅ selesai |
| **6** | **Auto-split editor + Money rules (Strict/Flexible) + ortu ke-2 + Insight** | ✅ **ditegakkan di kedua sisi.** Sisi anak menyusul di `apps/kid`: rasio dibaca dari `money_rules` (A-sisa-1) dan Strict benar-benar mengunci + menjelaskan kenapa (C) |
| 7 | Rapor Literasi, Growth Reward, paywall, iklan | ❌ belum mulai |

**Fase 6 ternyata sudah dibangun** — memo lama masih menyebutnya "spec'd, belum dibangun". Yang benar:
sisi ortu sudah jalan (mobile + web), sisi anak belum menyusul.

---

## 4. Register kontradiksi (temuan audit)

Diurutkan dari yang paling mahal kalau dibiarkan.

| # | Kontradiksi | Di mana | Usulan |
|---|---|---|---|
| ~~**K1**~~ | ~~**Bahasa UI**~~ ✅ **selesai** — D1 diputuskan ke **Inggris** ([ADR-0016](decisions/0016-bahasa-produk-inggris.md)). Console tetap Indonesia (permukaan operator, bukan produk). Yang tersisa: app ortu masih mencampur ID di beberapa layar ("Detail permintaan", "Undang pasangan") — itu sekarang **bug copy**, bukan lagi keputusan tertunda | app ortu | rapikan ke Inggris lewat `copy/` |
| **K2** | **Istilah kategori tidak sinkron**: positioning brand memakai *Pakai/Simpan/Berbagi/Bertumbuh*; design system §13.1 memakai *Belanja/Impian/Bertumbuh* untuk Middle; mockup memakai *Spend/Save/Give/Grow* | brand vs design system vs mockup | pilih satu set per tier, tulis di satu tabel, semua turunan mengikuti |
| **K3** | **Format rupiah**: brand §17 mengunci `Rp50.000`; semua mockup produk memakai `Rp 10,000`; console sudah benar; bahkan antar-mockup anak beda (`Rp 900.000.` vs `Rp 900,000.`) | 4 mockup produk | sudah diputuskan di brand — tinggal ditegakkan. Satu titik ubah: fungsi `rp()` / `fmt()` |
| **K4** | **Target dream berbeda antar app**: anak = BMX Rp300.000, Headphones Rp100.000; ortu = BMX Rp400.000, Headphones Rp60.000 | anak vs ortu | pakai angka app anak (sesuai handoff), perbaiki sisi ortu |
| **K5** | **Request pending berbeda**: anak menunggu cash out Rp20.000 dari Snacks; ortu menampilkan Rp25.000 dari Snacks | anak vs ortu | samakan ke Rp25.000 (versi ortu lebih lengkap: ada alasan tertulis) |
| **K6** | **Rasio auto-split seed = 40/40/10** (total 90%) padahal default terdokumentasi 40/40/20 | ortu | perbaiki seed jadi 40/40/20 |
| **K7** | **Badge "🔥 7-day streak" masih ada di app anak** padahal streak dihapus total di Fase 5 — badge yang mustahil didapat | anak HP + iPad | hapus badge, atau ganti jadi badge berbasis perilaku |
| **K8** | ~~**Maskot**: brand §8.1 = kancil emas berselendang ungu; §8.2 = karakter celengan babi kuning-oranye~~ | brand system | ✅ **sudah dibereskan** — §8.2 ditulis ulang mengikuti lembar karakter yang disetujui (kancil emas, selendang ungu ber-monogram **n**, kecambah hijau). Berkasnya sekaligus di-rename jadi `nummi-brand-system.md`. Kalau kamu tidak setuju, tinggal kembalikan — perubahannya satu blok |
| **K9** | **Jalur pembayaran**: `premium-setting.md` §8 menulis *"QRIS/GoPay/transfer via checkout web bukan opsional"*. Temuan App Store berikutnya membatalkan itu untuk iOS (storefront Indonesia tidak dapat pengecualian anti-steering) | premium-setting vs riset toko app | tulis ulang §8 — lihat §6 di bawah |
| **K10** | **B2B sekolah**: backlog O bilang *"jangan dikejar"*; console sudah punya plan Sekolah, tabel kursi, peran Admin sekolah, dan jalur Enterprise Services | backlog vs console | dua-duanya bisa benar kalau ditulis benar: **tidak dikejar aktif, tapi jalurnya siap kalau datang** |
| **K11** | **Nama produk di berkas**: `Celengan_iPad_…`, `celengan-*.md`, `celengan-*.html` masih memakai nama lama | nama berkas | rename saat merge berikutnya |
| **K12** | **Ejaan Inggris tidak konsisten**: "Practice with my real money" (HP) vs "Practise…" (iPad) | anak HP vs iPad | ⚠️ **naik prioritas.** Dulu diasumsikan gugur sendiri kalau D1 jatuh ke Indonesia. D1 jatuh ke **Inggris** (ADR-0016), jadi ini sekarang harus benar-benar diperbaiki: pilih satu varian, tegakkan di `copy/en.ts` |
| **K13** | **Jendela metrik console** 7 hari vs 14 hari antara Ikhtisar & kartu status | console | sudah tercatat sebagai C-3 |
| **K14** | **"Approve ≠ Fulfilled" bertabrakan dengan tabelnya sendiri**: `nummi-handoff.md` menulis judul *"HANYA untuk Cash out"*, lalu tabel tepat di bawahnya mencantumkan prize → To do dan Give → To do + cerita wajib. Handoff juga menulis *"empat jalur"* untuk tabel berisi **lima** baris | handoff (internal) | **tabelnya yang benar** — judulnya lahir di konteks revisi Grow (*"di antara flow Grow, hanya cash out"*) tapi terbaca sebagai aturan global. Cocok dengan backlog G ("approval inbox 5-jalur"). Sudah diluruskan di `decisions/0002-approve-bukan-fulfil.md`. ⚠️ Kalau tersalin salah ke skema sebagai **satu** enum (bukan dua kolom), keputusan "approve ≠ fulfil" mati diam-diam |

---

## 5. Keputusan yang menunggu kamu (blocker sebenarnya)

Ini bukan pekerjaan build — ini keputusan yang, selama belum diambil, membuat setiap pekerjaan
berikutnya berisiko dikerjakan dua kali.

**~~D1 — Bahasa produk.~~ ✅ DIPUTUSKAN: tetap Inggris** ([ADR-0016](decisions/0016-bahasa-produk-inggris.md)).
Rekomendasi di dokumen ini sebelumnya Indonesia, bersandar pada anak KG B–Grade 2 yang belum bisa
membaca Inggris. Argumen itu benar tapi **tidak berlaku untuk cakupan yang sedang diuji** — pemilih
tier dimatikan, jadi hanya **Middle** yang bisa didemokan (D5). Semua string tetap lewat `copy/`,
sehingga keputusan ini murah dibalik. **Ditinjau ulang kalau D5 memasukkan Little.**

**D2 — Satu tabel istilah final.** Setelah D1, kunci satu tabel: kategori × tier × istilah. Tabel itu
jadi rujukan tunggal brand, design system, dan semua mockup.

> **Bukti yang sudah ada dan sering terlewat:** lembar karakter yang sudah disetujui
> (`panduan_karakter_nummi_yang_ceria.png`) memberi label kategorinya **dwibahasa berpasangan** —
> *SPEND / PAKAI · SAVE / SIMPAN · GIVE / BERBAGI · GROW / BERTUMBUH* — persis sama dengan tabel warna
> kategori di brand system §5.2, dan persis sama dengan kalimat posisi resmi. Yang menyimpang justru
> **design system §13.1** (Belanja/Impian/Pengeluaran/Tabungan untuk Middle & Teen).
>
> Artinya D2 mungkin lebih ringan dari kelihatannya: dua dari tiga sumber sudah sepakat. Yang perlu
> diputuskan tinggal **apakah istilahnya berubah menurut tier atau tidak.** Argumen untuk tidak berubah:
> warna kategori sudah kamu kunci sebagai alat belajar yang tak pernah berubah — istilahnya sebaiknya
> mengikuti logika yang sama, kalau tidak anak yang naik tier harus belajar ulang nama benda yang sama.

**D3 — Model harga.** `premium-setting.md` masih mengunci one-time Rp399.000. Analisis berikutnya
menandai risiko struktural pendapatan sekali-bayar terhadap kewajiban seumur hidup, dan mengusulkan
model hibrida (slot founding-member seumur hidup terbatas → langganan). Belum final.

**D4 — Distribusi.** Native/Expo vs PWA. Ini menghambat mulainya M1 dan belum terjawab.

**D5 — Nasib Little & Teen.** Di app anak, pemilih tier sengaja dimatikan (`harness()` mengembalikan
`null`) sehingga hanya Middle yang bisa didemokan, walaupun logikanya ada. Untuk MVP: cukup Middle,
atau ketiganya?

---

## 6. Koreksi jalur monetisasi (menggantikan `premium-setting.md` §8)

Yang sudah tidak berlaku lagi di §8: rencana mengunci fitur lewat pembayaran QRIS/GoPay/transfer di
checkout web.

Yang berlaku sekarang:

- **iOS = pasar utama.** Ini membalik asumsi awal dan mempengaruhi semua keputusan monetisasi.
- **Apple IAP wajib** untuk membuka fitur di iOS. Storefront Indonesia **tidak** mendapat pengecualian
  anti-steering seperti AS/UE. Pengecualian Reader App tidak berlaku untuk Nummi. Jalur pembayaran luar
  membawa risiko terminasi akun yang nyata.
- **Program Usaha Kecil Apple: 15%.**
- **Android**: Google Play Billing + **User Choice Billing** (Indonesia termasuk) → Xendit/Mayar sah,
  penghematan biaya ~4%.
- **Sekolah**: Enterprise Services (Pedoman 3.1.3(c)) — akses diberikan **sepenuhnya di luar app store**.
  Konsekuensi UX yang sudah dikunci: tombol upgrade **tidak pernah muncul** untuk pengguna sekolah,
  dan kolom kode sekolah dikubur di Settings.
- **Arsitektur entitlement**: empat tabel (`entitlements`, `iap_receipts`, `schools`, `school_members`)
  dengan satu resolver `isPro(user)`.

Yang masih terbuka: **D3 (model harga)**.

---

## 7. Berkas yang disebut tapi tidak ada di Project

Kalau memang masih relevan, unggah; kalau sudah mati, catat matinya supaya tidak dicari lagi.

- `nummi-landing.html` — landing page + waitlist (kunci untuk menjawab D4 dengan data nyata)
- Catatan riset kompetitor SproutSaver versi lanjutan (`sproutsaver.md` yang ada masih versi awal)
- Catatan struktur pajak & badan usaha
- Spec pra-build Fase 6 (sudah tidak mendesak — Fase 6 sisi ortu ternyata sudah dibangun)

---

## 8. Urutan yang saya sarankan

1. ~~Putuskan D1~~ ✅ **selesai — Inggris** (ADR-0016). Tersisa **D2** (apakah istilah berubah
   menurut tier), yang kini menyempit ke sisi Inggris saja.
2. **Bersihkan K3–K7** — murah, mekanis, dan menghilangkan angka yang saling bertentangan antar layar.
3. **Turunkan Fase 6 ke sisi anak** (auto-split & money rules ditegakkan di app anak).
4. **Tutup paritas iPad** (§2) atau putuskan iPad keluar dari cakupan MVP.
5. **Bawa brand masuk ke app anak** (wordmark + maskot) setelah K8 diselesaikan.
6. **D3 + D4** sebelum baris kode produksi pertama.
