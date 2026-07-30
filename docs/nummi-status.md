# Nummi — STATUS (tracker tunggal)

> **Baca ini duluan.** Dokumen ini menjawab satu pertanyaan: *apa yang sudah ada, di permukaan mana,
> dan apa yang menghalangi MVP.* Keputusan produk ada di `nummi-handoff.md`. Pekerjaan tertunda ada
> di `nummi-backlog.md`. Console ada di `nummi_console.md`.
>
> Terakhir diaudit: **28 Juli 2026** (audit lintas-file atas 5 mockup + 6 dokumen), diperbarui
> **30 Juli 2026** (D3 ditutup — ADR-0018; §5, §9 mengikuti).

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
| ~~**K2**~~ | ~~**Istilah kategori tidak sinkron**~~ ✅ **selesai 29 Juli 2026** ([ADR-0017](decisions/0017-istilah-kategori-sama-lintas-tier.md)). Satu set untuk ketiga tier: `Unsorted · Spend · Save · Give · Grow`. Design system §13.1 ditulis ulang — ia satu-satunya yang menyimpang | brand · design system · copy | ✅ `copy/` sudah sesuai, tidak ada perubahan kode |
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
| ~~**K15**~~ | ~~**Panjang PIN anak disebut tiga angka berbeda**~~ ✅ **selesai 29 Juli 2026 — 6 digit tetap** ([ADR-0012 §A2](decisions/0012-auth-anak-kode-keluarga-pin.md)). Yang memaksanya diputuskan bukan kerapian dokumen, melainkan cara anak masuk: karena anak tidak memilih dirinya lebih dulu, **tiap anak menambah satu PIN yang sah** di ruang tebakan yang sama. Ikut terkunci: **PIN wajib unik per keluarga**, ditegakkan di waktu tulis karena salt bcrypt membuat constraint mustahil | skema · Edge Function · core | ✅ ditegakkan di `PIN_LENGTH` + test |
| **K14** | **"Approve ≠ Fulfilled" bertabrakan dengan tabelnya sendiri**: `nummi-handoff.md` menulis judul *"HANYA untuk Cash out"*, lalu tabel tepat di bawahnya mencantumkan prize → To do dan Give → To do + cerita wajib. Handoff juga menulis *"empat jalur"* untuk tabel berisi **lima** baris | handoff (internal) | **tabelnya yang benar** — judulnya lahir di konteks revisi Grow (*"di antara flow Grow, hanya cash out"*) tapi terbaca sebagai aturan global. Cocok dengan backlog G ("approval inbox 5-jalur"). Sudah diluruskan di `decisions/0002-approve-bukan-fulfil.md`. ⚠️ Kalau tersalin salah ke skema sebagai **satu** enum (bukan dua kolom), keputusan "approve ≠ fulfil" mati diam-diam |

---

## 5. Keputusan D1–D5 — semuanya terjawab per 30 Juli 2026

Bagian ini dulu berjudul *"keputusan yang menunggu kamu (blocker sebenarnya)"*. Sekarang ia arsip:
yang berharga bukan lagi keputusannya, melainkan **pemicu tinjau ulang** masing-masing — itu yang
memberi tahu kapan sesuatu harus dibuka lagi.

**~~D1 — Bahasa produk.~~ ✅ DIPUTUSKAN: tetap Inggris** ([ADR-0016](decisions/0016-bahasa-produk-inggris.md)).
Rekomendasi di dokumen ini sebelumnya Indonesia, bersandar pada anak KG B–Grade 2 yang belum bisa
membaca Inggris. Argumen itu benar tapi **tidak berlaku untuk cakupan yang sedang diuji** — pemilih
tier dimatikan, jadi hanya **Middle** yang bisa didemokan (D5). Semua string tetap lewat `copy/`,
sehingga keputusan ini murah dibalik. **Ditinjau ulang kalau D5 memasukkan Little.**

**~~D2 — Satu tabel istilah final.~~ ✅ DIPUTUSKAN: sama lintas tier**
([ADR-0017](decisions/0017-istilah-kategori-sama-lintas-tier.md)). `Unsorted · Spend · Save · Give ·
Grow`, pasangan Indonesia `Uang Baru · Pakai · Simpan · Berbagi · Bertumbuh`. Design system §13.1 —
satu-satunya sumber yang menyimpang — sudah ditulis ulang mengikuti. Lookup `[tier][kategori]` tetap
dipertahankan walau ketiganya identik; itu yang menjaga keputusan ini murah dibalik.

> **Bukti yang sudah ada dan sering terlewat:** lembar karakter yang sudah disetujui
> (`panduan_karakter_nummi_yang_ceria.png`) memberi label kategorinya **dwibahasa berpasangan** —
> *SPEND / PAKAI · SAVE / SIMPAN · GIVE / BERBAGI · GROW / BERTUMBUH* — persis sama dengan tabel warna
> kategori di brand system §5.2, dan persis sama dengan kalimat posisi resmi. Yang menyimpang justru
> **design system §13.1** (Belanja/Impian/Pengeluaran/Tabungan untuk Middle & Teen).
>
> Bukti itulah yang akhirnya dipakai ADR-0017: dua dari tiga sumber sudah sepakat. Yang perlu
> diputuskan tinggal **apakah istilahnya berubah menurut tier atau tidak.** Argumen untuk tidak berubah:
> warna kategori sudah kamu kunci sebagai alat belajar yang tak pernah berubah — istilahnya sebaiknya
> mengikuti logika yang sama, kalau tidak anak yang naik tier harus belajar ulang nama benda yang sama.

**~~D3 — Model harga.~~ ✅ DIPUTUSKAN: sekali bayar Rp399.000**
([ADR-0018](decisions/0018-harga-sekali-bayar.md)). Yang menentukan bukan angkanya, melainkan bahwa
*"Rp3.700 sebulan sampai Grade 9"* adalah satu-satunya klaim yang langganan tidak bisa mengucapkannya
— plus nol churn/dunning untuk founder yang bekerja akhir pekan. Dua risiko diterima sadar dan
dicatat: kewajiban ~10 tahun dari satu kali bayar, dan **ketidakadilan antar keluarga**.

Konsekuensi yang langsung: `LIMITS` berhenti jadi spec dan jadi `packages/core/src/plan.ts`, lalu
**ditegakkan** — sebelum 30 Juli 2026 `isPro()` **tidak pernah dipanggil satu app pun**, jadi
"Grow = Pro" dan C1/I3 hidup hanya di dokumen.

**~~D4 — Distribusi.~~ ✅ DIJAWAB UNTUK MVP: PWA** ([ADR-0019](decisions/0019-d4-pwa-untuk-mvp.md)).
Bisa dipasang ke Home Screen, **sengaja tidak offline** — nol service worker, karena menyimpan saldo
di cache berarti menampilkan angka uang yang basi, dan repo ini punya nol JavaScript klien hari ini.
Yang membuatnya bisa dijawab bukan data baru melainkan cakupan: satu-satunya pemaksa native adalah
Apple IAP, dan MVP tidak menjual apa pun.

> **Distribusi v1 tetap terbuka**, dan itu disengaja. ADR-0013 memperingatkan bahwa beginilah
> keputusan besar mati diam-diam. Jawabannya harus datang dari data uji 30 keluarga.

**~~D5 — Nasib Little & Teen.~~ ✅ DIPUTUSKAN: Middle saja**
([ADR-0020](decisions/0020-d5-middle-saja-untuk-mvp.md)). Kode Little & Teen tetap hidup (tier =
feature flag), tapi tidak ditawarkan di jalur tulis.

> ⚠️ **Kalimat lama di sini keliru** dan sempat membuat D5 tampak sudah beres: *"pemilih tier
> dimatikan, `harness()` mengembalikan `null`."* Itu menggambarkan **mockup beku di `legacy/`** —
> fungsi itu tidak ada di app nyata. `apps/kid` membaca tier dari database, dan
> `apps/parent/app/children/new` menawarkan **ketiga tier**. Sekarang ditegakkan lewat `MVP_TIERS`
> + `validateChild()` di `packages/core`, dengan test.
>
> **Ikut tertutup:** pemicu tinjau ulang ADR-0016 (bahasa) & ADR-0017 (istilah) sama-sama bergantung
> pada D5 memasukkan Little/Teen. Keduanya tidak menyala di MVP — tiga keputusan berhenti bersyarat
> sekaligus.
>
> **Batasan rekrutmen yang paling mudah terlupakan:** `middle` = usia **9–12**. 30 keluarga harus
> direkrut dalam rentang itu, atau datanya tidak menjawab pertanyaan yang sedang diuji.

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

Yang masih terbuka: **D4 (distribusi)** — dan ia yang bisa mengubah seluruh bab ini.

---

## 7. Berkas yang disebut tapi tidak ada di Project

Kalau memang masih relevan, unggah; kalau sudah mati, catat matinya supaya tidak dicari lagi.

- `nummi-landing.html` — landing page + waitlist (kunci untuk menjawab D4 dengan data nyata)
- Catatan riset kompetitor SproutSaver versi lanjutan (`sproutsaver.md` yang ada masih versi awal)
- Catatan struktur pajak & badan usaha
- Spec pra-build Fase 6 (sudah tidak mendesak — Fase 6 sisi ortu ternyata sudah dibangun)

---

## 8. Urutan yang saya sarankan

1. ~~Putuskan D1 & D2~~ ✅ **selesai** — Inggris (ADR-0016) dan istilah kategori sama lintas tier
   (ADR-0017). Keputusan copy tidak lagi memblokir apa pun.
2. **Bersihkan K3–K7** — murah, mekanis, dan menghilangkan angka yang saling bertentangan antar layar.
3. **Turunkan Fase 6 ke sisi anak** (auto-split & money rules ditegakkan di app anak).
4. **Tutup paritas iPad** (§2) atau putuskan iPad keluar dari cakupan MVP.
5. **Bawa brand masuk ke app anak** (wordmark + maskot) setelah K8 diselesaikan.
   ✅ Wordmark sudah ada (`apps/kid/components/ui.tsx`). Sisa: maskot.
6. ~~**D3 + D4** sebelum baris kode produksi pertama.~~ ✅ keduanya terjawab (ADR-0018, ADR-0019).

---

## 9. Keadaan database (29 Juli 2026) — S1b hidup

Project `lrjkhlaxixdbvxdpuqte`. Migrasi **0001–0006** jalan, seed kanonik masuk, dan angkanya
direkonsiliasi terhadap `packages/core`: total Arthur **Rp484.711**, I1 tegak, `ledger_orphans`
kosong. Rincian & cara mengujinya ada di `supabase/README.md`.

**Dua cacat keamanan ditemukan dan ditutup sebelum app disambungkan** — keduanya lahir dari perilaku
Postgres, bukan dari policy yang salah tulis:

- **View melewati RLS.** `wallet_balances` (satu-satunya sumber saldo) berjalan dengan hak pemilik
  view, sehingga JWT keluarga mana pun bisa membaca saldo seluruh keluarga. Ditutup di `0004`.
- **RLS sisi ortu rekursif total.** `auth_family_id()` membaca `parents`, yang policy-nya memanggil
  `auth_family_id()` — terbukti `54001 stack depth limit exceeded`. Karena fungsi itu dipakai hampir
  semua policy, seluruh sisi ortu mati. Ditutup di `0004`.

Pelajarannya sama untuk keduanya, dan layak diingat: **keduanya tidak terlihat selama tabel kosong**.
Uji akses selalu dengan role sungguhan (`set local role authenticated` + claim JWT), tidak pernah
dengan koneksi service role — service role membuat semuanya tampak baik-baik saja.

**Login anak hidup** (`child-login` v4): kode keluarga + PIN saja, tanpa `childId` dan tanpa daftar
anak (ADR-0012 §A1). Diuji ujung ke ujung — token terbit → `/rest/v1/wallet_balances` mengembalikan
11 baris, **Rp484.711**. Verifikasi PIN dipindah ke Postgres (`0006`) setelah `deno.land/x/bcrypt`
gagal di Edge Runtime; efek sampingnya justru perbaikan: `pin_hash` tidak pernah lagi keluar dari
database.

**Temuan paling mahal hari itu, dan yang paling mudah tidak terlihat:** rate limiting login anak
**tidak pernah menyala sekali pun** sejak ditulis. Kuncinya memakai `x-forwarded-for` utuh, padahal
header itu rantai yang hop terakhirnya adalah proxy Supabase sendiri dan berganti tiap permintaan —
jadi setiap tebakan tampak datang dari IP baru. Tujuh tebakan berturut-turut semuanya lolos. Kodenya
ada sejak awal; efeknya tidak. Sekarang dua lapis (per-IP dan per-keluarga) dan **dibuktikan
menyala**: percobaan ke-6 dijawab `429`, dan PIN benar pun tetap ditolak selama terkunci.
Rinciannya di [ADR-0012 §A3](decisions/0012-auth-anak-kode-keluarga-pin.md).

> Pelajaran yang sama berulang tiga kali dalam satu hari: **fitur keamanan yang tidak pernah diuji
> dengan permintaan sungguhan sama saja dengan tidak ada.** RLS yang rekursif, view yang melewati
> RLS, dan rate limit yang tidak pernah menghitung — ketiganya lolos review kode.

**Yang masih menghalangi uji ortu–anak sungguhan:**

| # | Hal | Kenapa memblokir |
|---|---|---|
| ~~1~~ | ~~**Layar login anak**~~ | ✅ **selesai 29 Juli 2026.** Anak masuk dengan kode keluarga + PIN, token di cookie httpOnly, dan Home/Wallets/Sort/Requests membaca database. Diuji ujung ke ujung dari browser, termasuk token palsu dan PIN salah |
| ~~2~~ | ~~Belum ada baris `parents`~~ | ✅ **selesai 30 Juli 2026.** Ortu pertama ("Ayah", primary) tertaut ke `NUMMI1` lewat Admin API. **RLS sisi ortu akhirnya diuji dengan baris nyata** — jalur yang dulu rekursif fatal sebelum 0004: 1 anak, 11 wallet, 11 saldo, 4 request, total 484.711. Ortu asing melihat nol; token anak melihat wallet-nya sendiri tapi **nol baris ortu** |
| ~~3~~ | ~~**App ortu belum menyentuh Supabase**~~ | ✅ **30 Juli 2026 — siklus uang TUTUP.** Ortu masuk, membaca data nyata, dan approval inbox benar-benar menulis: 4 request diputuskan, total 484.711 → 444.711 (turun tepat sejumlah uang yang keluar), I1 tegak, `promise_debt` kembali 0, dan **anak melihat cerita ortunya** di "Where my giving went". Send · Take · Money rules · Add a child ikut menulis; **console tersambung** lintas keluarga (baca-saja). Sisa: Settings & Jobs/Prizes — keduanya **belum punya tabel** (U-12/U-13) |
| ~~4~~ | ~~**Jalur tulis anak**~~ | ✅ **selesai 29 Juli 2026** — Sort menulis sungguhan dari app: Unsorted 50.000 → 0, Spend +20k, Save +20k, Give +10k, total tetap **484.711**, I1 tegak, nol orphan. Ketiga baris ber-`created_at` identik = satu pernyataan, atomik |
| ~~5~~ | ~~**Sort ganda**~~ | ✅ **selesai 29 Juli 2026 (migrasi 0010).** Dua klik bersamaan diuji sungguhan: satu lolos, satu ditolak, tepat 3 baris tertulis (bukan 6), Unsorted 0 bukan −50.000. Saldo negatif berhenti jadi laporan, jadi kemustahilan |
| 6 | Penghapusan data masih mustahil | trigger append-only membatalkan `delete from families`. Janji privasi belum bisa dipenuhi — butuh keputusan produk karena menyentuh ADR-0014 (`supabase/README.md`) |
| 7 | Login anak menumpang JWT secret legacy | project sudah pakai ES256; token anak masih HS256 dengan kunci berstatus `Previously used`. **Jangan revoke kunci itu** sebelum backlog **U-6** selesai |

---

## 10. Kesiapan deploy (30 Juli 2026) — D4 dijawab, dan satu P0 ditemukan

D4 jatuh ke **PWA untuk MVP** ([ADR-0019](decisions/0019-d4-pwa-untuk-mvp.md)) dan D5 ke **Middle
saja** ([ADR-0020](decisions/0020-d5-middle-saja-untuk-mvp.md)). Langkah deploy lengkap ada di
[`DEPLOY.md`](DEPLOY.md). Yang perlu dicatat di sini:

**🚨 P0 yang ditemukan sebelum baris pertama di-deploy — dan cara ia bersembunyi.**
`apps/console` tidak memakai `cookies()` di mana pun, jadi Next menganggap `/` **statis** dan
memprerender-nya **saat build** — memanggil service role lintas keluarga lalu menulis hasilnya ke
`.next/server/app/index.html`. Berkas itu terbukti berisi 58 KB saldo nyata (`Rp484.711`,
`Rp279.140`) sebagai HTML datar yang siap di-cache CDN, di app yang **tidak punya login sama
sekali**. Ditutup dengan `force-dynamic` + middleware basic-auth **gagal-tertutup**, dan keduanya
**diuji dengan permintaan sungguhan**: tanpa auth `401` nol nominal bocor, tanpa `CONSOLE_PASSWORD`
`503` untuk semua permintaan termasuk yang membawa password benar.

> Ini bentuk keempat dari pelajaran yang sama. Tiga sebelumnya: RLS rekursif, view yang melewati
> RLS, rate limit yang tak pernah menghitung. Kali ini penyebabnya bukan policy yang salah tulis
> melainkan **default framework** — Next memilih statis kalau tidak ada yang menghalangi, dan
> "statis" untuk halaman service-role berarti "diterbitkan".

**Enam item backlog ternyata sudah beres** (X1–X5, X10). Semuanya ditulis terhadap mockup beku;
kode nyata sudah benar sejak ditulis. Rinciannya di `nummi-backlog.md` §PALING ATAS.

**Yang ikut ditutup saat menyiapkan deploy:** CI tidak pernah mem-build satu app pun · `vercel.json`
root menunjuk `legacy/` · `env(safe-area-inset-bottom)` selalu bernilai 0 tanpa `viewportFit` ·
font brand tidak pernah dimuat (semua permukaan diam-diam `system-ui`) · Transactions ortu membaca
`SEED_LEDGER` statis padahal Dashboard di sesi yang sama membaca database.

**Status verifikasi:** 219 test lulus · typecheck bersih · ketiga app build tanpa env Supabase
(kalau salah satu mulai membutuhkannya saat build, itu tanda ia memanggil database di waktu build).
