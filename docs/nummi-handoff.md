# Nummi — Handoff / Continuity Doc

Tujuan: memungkinkan sesi chat baru melanjutkan proyek ini tanpa menggali percakapan lama.
**Cara pakai:** taruh berkas di daftar bawah sebagai Project files, lalu minta Claude membaca
`nummi-status.md` lebih dulu, baru dokumen ini.

*Diperbarui 28 Juli 2026 setelah audit lintas-file. Nama produk final: **Nummi**
(“Celengan” = nama kerja lama yang masih menempel di sebagian nama berkas).*

---

## Apa ini
Aplikasi "junior mobile banking" untuk anak **KG B – Grade 9**: mencatat & mengelola uang saku
+ uang hadiah sebelum punya rekening bank asli. Model inti: **Parent as Banking** — orang tua
adalah banknya. Pasar: Indonesia (mata uang Rp).
**Tidak ada uang riil bergerak di app** — saldo = representasi komitmen; payout dilakukan ortu di luar app.

Kalimat posisi resmi (dipakai konsisten di semua kanal):
> *"Nummi adalah aplikasi Parent as Banking untuk anak belajar memakai, menyimpan, berbagi dan
> mengelola uangnya."* — tagline: *"Uang kecil, kebiasaan besar."*

## File proyek (sumber kebenaran)

**Tracker & keputusan**
- `nummi-status.md` — **baca duluan**: status 5 permukaan, matriks paritas, register kontradiksi, blocker.
- `nummi-handoff.md` — dokumen ini: keputusan produk yang sudah dikunci.
- `nummi-backlog.md` — pekerjaan & keputusan tertunda.
- `nummi_console.md` — dokumen pendamping khusus console admin.
- `premium-setting.md` — spec monetisasi (⚠️ §8 sudah dikoreksi, lihat `nummi-status.md` §6).
- `nummi-brand-system.md` · `nummi-product-design-system.md` — brand & design system.
- `financial_literacy.md`, `financial_literacy_by_sproutsaver.md`, `sproutsaver.md` — kurikulum & riset.

**Mockup aktif (5 permukaan MVP)**
- Anak: `Nummi_Middle__App_standalone_.html` (HP) · `Celengan_iPad__Standalone_.html` (iPad)
- Ortu: `Nummi_Parent_App__Standalone_.html` (HP) · `Nummi_Parent_Web__Standalone_.html` (web)
- Admin: `nummi-console.html`

**Mockup usang — jangan dipakai sebagai acuan:** `celengan-home-mockup.html`,
`celengan-parent-mockup.html`. Keduanya sudah digantikan; isinya masih dipakai sebagai riwayat keputusan
saja. Kelima mockup aktif **tidak live-linked** satu sama lain — angka disamakan manual.

## Arsitektur & keputusan yang SUDAH DIKUNCI
- **Model A**: setiap rupiah selalu di **satu tempat**. Kategori = *label*, bukan wadah. Uang selalu ada di sub-wallet.
- **Invariant**: `Unsorted + Spend + Save + Give + Grow = Total`. Memindah uang antar-pocket tak pernah mengubah Total.
- **4 kategori (jobs)**: Spend / Save / Give / Grow. (Nama enak dipakai: "Pakai / Simpan / Berbagi / Tumbuh".)
- **Sub-wallet per kategori**: Spend→*envelopes*, Save→*dreams* + "Free savings" (catch-all), Give→pool, Grow→*instruments*.
  - "Free savings" = wallet catch-all di Save (nabung tanpa target; tujuan pulang dream yang dibatalkan; titik mendarat Harvest). Nama sementara "Free savings" — kandidat ganti: "Someday". (Backlog F)
- **Grow = SIMULASI, ortu adalah bank-nya** *(keputusan besar — merevisi asumsi awal)*. Tidak ada kewajiban ortu benar-benar membuka deposito, membeli emas, atau membeli valas.
  - **Kenapa diubah**: desain lama ("ortu benar-benar eksekusi di dunia nyata") **mustahil di skala uang anak**. Deposito bank minimum jutaan; emas Antam minimum 0,5 g (ratusan ribu–jutaan); money changer punya minimum transaksi. Anak dengan Rp 30.000 tak bisa membeli apa pun dari semua itu. Simulasi bukan jalan pintas — itu satu-satunya cara Grow bisa hidup.
  - **Tapi HARGANYA riil** (feed harian): emas ikut **harga Antam** (jual & buyback), valas ikut **kurs harian ± spread 1%**. Rate deposito **ditetapkan ortu sendiri** (dia bank-nya) lewat Settings → *Your bank rates*, per tenor 3/6/12 bln.
  - **Risiko pasar ditanggung ORTU** — konsekuensi yang harus disadari & di-disclose: kalau emas naik 30%, ortu berutang 30% lebih banyak (di desain lama ortu ter-hedge karena benar-benar punya emasnya). Di skala uang anak ini kecil & wajar dianggap biaya mendidik, tapi **ortu harus tahu, bukan menemukannya belakangan**. Disclosure tampil di kartu request Grow & di Manage investments.
  - **Nilai ditandai di harga JUAL** (buyback / kurs jual) — yang benar-benar bisa anak dapat hari ini. Konsekuensinya: **emas selalu mulai ~-9%** (spread Antam) dan valas ~-2% (round-trip spread 1%). Ini jujur, dan justru itu pelajarannya. Layar Harvest emas punya kartu penjelas *"Why is it less than you paid?"* yang membandingkan harga jual vs buyback → *"gold is for waiting, not for flipping"*.
  - **Skala emas realistis**: Rp 21.000 ≈ **14,5 mg**, bukan 1,05 g. Format otomatis: **mg kalau <1 g, gram kalau ≥1 g**.
  - **"Approve ≠ Fulfilled" sekarang HANYA berlaku untuk Cash out** (ortu memang harus menyerahkan uang). **Grow & Harvest: approve = selesai seketika** — tak ada aksi dunia nyata, jadi tak ada tahap "To do". Form "Record what you did" (Fase 3) **dihapus** — asumsinya sudah batal.
  - **Asimetri Grow tetap** (masuk butuh izin, keluar cuma lewat Harvest) — **tapi alasannya berubah**: dulu "karena aset riil butuh waktu dicairkan"; sekarang **"karena ortu-sebagai-bank yang menetapkan aturannya, meniru cara instrumen sungguhan bekerja"** — dan supaya anak tidak jadi day-trader sementara ortu menanggung volatilitasnya.
  - Instrumen: Time Deposit (locked s/d mature), Gold (approval), Forex (approval).
  - **Tujuan Harvest dikunci ke wallet Save saja** (default "Free savings"). Hasil investasi balik jadi tabungan, bukan langsung jajan.
  - **Move dihapus dari semua Grow** — satu-satunya jalan keluar adalah Harvest.
  - **Time Deposit** harvest → 3 opsi: (a) Cash out semua (pokok+bunga → Save), (b) Roll over semua (deposito baru, pilih tenor 3/6/12 bln), (c) Take profit (pokok roll over + tenor, bunga → Save). Belum mature = Harvest terkunci. TD **tidak ikut pasar** — bunganya terkunci di kesepakatan.
  - **Gold** harvest → layar konfirmasi (pesan menyesuaikan naik/turun) + penjelas spread, ada Cancel, pilih wallet Save tujuan.
  - **Forex** → maks 3 wallet per mata uang (USD/SGD/EUR). Punya **Add money** (beli valas lagi, butuh OK, sumber rupiah bebas termasuk Unsorted) + Harvest. Beli pakai kurs BELI (mid+1%), jual pakai kurs JUAL (mid−1%).
  - **Async approval (sisi anak)**: submit Harvest/beli → kartu jadi state "⏳ Waiting for grown-up". Dari sisi anak tetap async (nunggu ortu); yang hilang cuma tahap "To do" di sisi ortu.
  - **Harga contoh di mockup** (nanti dari scheduler backend): Emas Antam jual **Rp 1.450.000**/g, buyback **Rp 1.320.000**/g (spread ~9%). Kurs tengah: USD 16.000 / SGD 12.000 / EUR 17.000, spread ±1%. Bank rates default ortu: 3bln 1,5% / 6bln 2,5% / 12bln 4%.
- **Ekonomi reward — DUA mata uang & TIGA gerbang** *(Fase 4)*. Tujuan gerbang: tanpa ini ekonomi 💎 akan **mengalahkan kurikulum** — anak kejar screen time, materi finansial dilewati. Gerbang membalik arahnya: **belajar jadi kunci**, bukan tugas tambahan.
  - **⭐ Stars** — dari **kurikulum** (Learn/Practice) → hanya untuk **kosmetik in-app** (avatar).
  - **💎 Gems** — dari **chores/mission ortu** → hanya untuk **hadiah dunia nyata** (screen time, jalan-jalan).
  - Logikanya: *usaha di app → identitas di app; kerja dunia nyata → hak istimewa dunia nyata.*
  - **⭐ WAJIB dipisah jadi dua angka** — ini konsekuensi paksa, bukan pilihan:
    - `STARS_EARNED` (**lifetime**, tak pernah berkurang) → dipakai untuk **gerbang**
    - `STARS` (**saldo**, naik-turun) → dipakai untuk **beli avatar**
    - Kalau gerbang memakai saldo, anak yang beli avatar akan **mengunci ulang chores-nya sendiri** — dihukum karena memakai hadiahnya. Absurd. Ada baris microcopy di Me yang menjelaskan ini ke anak.
  - **Gerbang 1 — sistem chores**: `⭐ lifetime ≥ 100`. Sebelum itu Jobs & Prizes terkunci (ortu tetap bisa menyiapkannya; muncul otomatis saat gerbang terbuka).
  - **Gerbang 2 — bertahap**: `Chapter 2 selesai` → membuka **job achievement** + **hadiah besar** (≥ 25 💎).
  - **Gerbang mingguan — di PENUKARAN, bukan perolehan** *(keputusan penting)*: 💎 **selalu bisa dikumpulkan**; yang butuh "materi minggu ini selesai" adalah **menukar hadiah**.
    - Alasannya: kalau perolehan yang dikunci, muncul pesan aneh *"kamu belum belajar, jadi tak perlu beresin kamar"* — kontribusi keluarga jadi bersyarat, bertabrakan dgn prinsip yang sudah dikunci. Gerbang di penukaran menjaga kontribusi tetap tak bersyarat, tapi tetap memaksa loop belajar. Psikologisnya juga lebih kuat: 💎 sudah di tangan, tinggal 2 menit belajar untuk memakainya.
  - **Mission ortu ada 3 jenis, reward-nya DIPANDU** (builder-nya yang mengajari ortu, bukan kotak kosong):
    - **Kontribusi keluarga** → **💎 saja, opsi uang tidak muncul**. Riset: membayar tugas dasar keluarga merusak motivasi intrinsik.
    - **Kerja ekstra** → 💰 atau 💎 (kerja yang biasanya kamu bayar ke orang lain).
    - **Pencapaian** (rangking/lomba/hafalan) → **default 💎**, uang tetap boleh tapi bukan default. Membayar nilai akademik lumrah di Indonesia tapi kontroversial di riset — app memberi nudge, bukan larangan.
  - **Reward uang mendarat di Unsorted** (konsisten dgn Send money). Reward 💎 masuk saldo gem.
  - **Pratinjau "berapa lama untuk dapat"** saat ortu menetapkan harga hadiah (mis. *"~40 minggu. Most kids give up quietly at this distance."*) — mencegah ortu tak sengaja membuat hadiah mustahil.
  - **Tracker belajar di sisi ortu** (kartu Learning di tab Missions): progress chapter, ⭐ lifetime, status materi mingguan, status tiap gerbang. Supaya saat anak protes "kok gak bisa tukar?", ortu langsung paham. Sekaligus menampilkan materi terakhir anak sbg **benih conversation starter**.

- **Give punya flow sendiri** *(Fase 5 — dulu satu-satunya kategori tanpa flow)*. Sebelumnya cara keluar
  dari Give sama persis dgn cash out biasa — momen memberi tak bisa dibedakan dari beli jajan.
  - Detail wallet Give kehilangan **"Cash out"**, diganti **"Give it away"**: pilih tujuan (6 causes kultural —
    masjid/panti/bencana/teman/hewan/tulis sendiri) → nominal → alasan **opsional** (jangan pajaki kemurahan
    hati) → request ke ortu.
  - **Give juga dihapus dari daftar sumber Cash out** — kalau tidak, anak bisa ambil uang Give lewat pintu
    belakang tanpa pernah memberi. Kalau berubah pikiran, harus **Move ke Spend dulu** — sadar & terlihat.
  - **State machine 5**: `give` approve → **To do** (ortu harus benar-benar menyalurkan) → dan **tidak ada
    tombol "Mark as done" polos** — yang ada **form cerita wajib diisi** sebelum request bisa ditutup.
    Tanpa cerita, Give tak beda dari uang yang hilang. Toast penolakan: *"that is the whole point"*.
  - Anak melihat cerita di Me → **"Where my giving went"**, dan **bisa membalas** (ucapan terima kasih/tanya
    lanjutan). Placeholder foto belum ada — itu tercatat sbg item Fase 6.
- **Minus-point saat "merampok" dream** *(Fase 5, Backlog B)*. Pemicu presisi (sudah lama tercatat, akhirnya dibangun):
  - KENA: dream → Spend/Give (membatalkan komitmen untuk dipakai sekarang) → **⭐ −15 flat**.
  - TIDAK kena: dream → dream lain (menata ulang prioritas); dream → Grow (menunda lebih lama = perilaku baik).
  - **Wajib memotong SALDO ⭐ saja, tidak pernah lifetime** — konsekuensi paksa dari arsitektur dua-angka
    Fase 4: kalau lifetime ikut turun, anak yang merampok dream bisa **mengunci ulang seluruh sistem chores**.
  - **Peringatan tampil SEBELUM konfirmasi** (bukan sesudah): *"This costs you 15 stars ... Moving it to
    another dream is free."* — minus tetap berlaku, tapi bukan hukuman diam-diam.
- **Streak DIHAPUS** *(Fase 5, Backlog B — keputusan: dibuang, bukan diperbaiki)*. Alasan: streak menghukum
  jeda wajar (sakit, liburan); mendorong buka-app-harian yang kosong padahal keputusan uang bukan aktivitas
  harian. Kalau nanti dibangun ulang, harus berbasis **perilaku** (mis. rutin sortir dalam 2 hari), bukan
  sekadar membuka app.

- **3 tier usia — model data IDENTIK, beda hanya tampilan & izin**:
  - **Little (KG–Gr1)**: tanpa sub-wallet (ada default tak-terlihat), tanpa Grow, tanpa "My dreams" & tanpa "Today's mission" di Home. Sort ke kategori saja.
  - **Middle (Gr2–6)**: sub-wallet penuh, dreams, Grow, Sort turun ke sub-wallet (anak pilih).
  - **Teen (Gr7–9)**: seperti Middle + anak boleh edit rasio auto-split dalam batas ortu.
- **Sort**: tier-aware. Auto-split = aturan ortu (default 40% Spend / 40% Save / 20% Give). Grow dikecualikan dari Sort.
- **Perpindahan uang (mode Flexible)**: transfer bebas antar semua pocket biasa; Grow pengecualian (lihat backlog D — flow Add money/Move money sudah dibangun untuk Spend/Save/Give; **Unsorted sengaja tidak ikut**, tetap khusus lewat Sort).
- **Localization — ✅ DIPUTUSKAN: bahasa UI = Inggris** ([ADR-0016](decisions/0016-bahasa-produk-inggris.md)).
  Console tetap **Indonesia** (permukaan operator, bukan produk). Teks bebas yang ditulis anak
  (alasan cash-out, alasan & cerita Give) memang sengaja Indonesia dan itu benar — itu tulisan
  pengguna, bukan copy. `nummi-product-design-system.md` §13.1 yang mengunci istilah Indonesia per
  tier kini **menyimpang dari keputusan** dan harus dibaca sebagai usulan, bukan aturan.
  Yang tersisa jadi pekerjaan biasa, bukan blocker: app ortu masih **mencampur** ID di beberapa
  layar ("Detail permintaan", "Undang pasangan") — rapikan ke Inggris lewat `copy/`.
  D2 ikut selesai 29 Juli 2026: istilah **sama lintas tier** (ADR-0017).
- **Request/approval terpusat**: semua aksi yang butuh OK ortu (Cash out, Grow/beli, Harvest) mendaftar ke satu store `REQUESTS`. Awareness anak lewat 3 lapis: badge di kartu Grow (lokal) → banner "N requests waiting" di Home (semua tier, di bawah Unsorted) → layar **Requests** (antrean penuh). Di mockup, approval ortu disimulasikan (tap badge kartu atau tap baris Requests). Store ini = cermin sisi-anak dari Approval Inbox ortu (Backlog G).

## Navigasi & UI yang sudah dibangun (di mockup)
- **Missions** (kerangka UI; konten = sampel, bukan kurikulum final): stats strip (⭐ & 💎) → **Daily mission state-aware** (Unsorted>0 → "Sort your Rp X"; kalau 0 → jatuh ke Learn berikutnya) → **Event mission** (THR Lebaran, Pilar G) → **6 chapter** (done/active/locked; chapter Grow disembunyikan di Little). Chapter detail = pasangan **Learn → Practice**; Practice terkunci sampai Learn pasangannya selesai (§3.1 `financial_literacy.md`).
  - **Lesson flow**: panel cerita → kuis interaktif (feedback benar/salah, CTA aktif setelah menjawab) → layar selesai + kalimat kunci + reward stars.
  - **Tier-aware (§3.3)**: Little 2 panel+1 kuis, Middle 3+2, Teen 3+3.
  - **Practice terverifikasi ledger**: "Sort your Rp 50,000" deep-link ke flow Sort asli; selesai sortir → mission auto-selesai (+15⭐). Bukan self-report.
  - **"Jobs from home"** *(Fase 4)*: section terpisah dari kurikulum, berisi mission dari ortu. Terkunci sampai ⭐ lifetime ≥100 (panel gerbang + progress bar + tombol "Go to a lesson"). Job achievement terkunci sampai Chapter 2. Mark done → masuk store `REQUESTS` → nunggu ortu. Tombol demo "▶ Start a new week" mereset job mingguan **dan** materi mingguan.
  - *Sampel konten baru Topik 2 (2 Learn). Chapter 3–6 sengaja locked. Practice "dream" belum deep-link penuh.*

- **Bottom nav**: Home · Wallets · **(＋ hub aksi)** · Missions · **Me**. Tombol tengah = action hub (sheet).
- **Bug lama diperbaiki** *(Fase 5)*: topbar ⭐ dulu **hardcoded "240"** sementara halaman Me bilang **120** — dua angka utk hal yang sama. Sekarang topbar disambungkan ke `STARS` yang sesungguhnya lewat `syncTopStars()`. 🔥 streak (yang juga sempat bertabrakan 5 vs 4 di layar berbeda) sudah dihapus total.
- **"Me"** (dulu "Trophies"/"Aku") = ruang identitas & reward: avatar+nama+pill tier, stats (streak/⭐/💎), **Prizes** (tukar 💎 → hadiah nyata; ada gerbang mingguan & gerbang hadiah besar), **My look** (avatar shop pakai ⭐ saldo; unlock → equip → avatar ikut berubah di topbar Home), grid badges, **theme picker**, toggle bahasa EN/ID (placeholder), buddies. Avatar kiri-atas Home = pintu ke sana.
- **Theme picker**: 5 tema (Grape default, Ocean, Mint, Sunset, Berry). Hanya mengubah warna **brand/aksen**; **warna kategori tidak pernah berubah** (Spend oranye, Save biru, Give pink, Grow hijau) karena warna kategori adalah alat belajar, bukan dekorasi. Semua gradient brand di CSS sudah di-variabel-kan agar tema berlaku menyeluruh.
- **Home**: sapaan+avatar (nama anak = **Arthur**), Total (ring bersegmen), kartu "Unsorted", **banner "N requests waiting"** (muncul bila ada pending; semua tier; buka layar Requests), ringkasan kantong (chip bisa diklik→Wallets), My dreams (2 dream; disembunyikan di Little), misi harian (disembunyikan di Little juga), quick actions, aktivitas.
- **Wallets**: pola pocket-grid ala Bank Jago — header kategori kartu besar (ber-tint, chevron besar), **accordion** (buka satu tutup lainnya), pocket 2 kolom (ring progress, shared indicator dulu dibuang), hide-balance toggle, add-card.
- **Flows sudah ada**: Sort (interaktif, tier-aware), Create (envelope/dream/give/grow — grow butuh izin & sumber Spend/Save, plus pemilihan mata uang saat Forex), Detail sub-wallet (Spend/Save dgn tracker+grafik / Grow dgn info per-instrumen + Harvest), **Add money & Move money** (Spend/Save/Give), **Grow flows** (TD 3-opsi harvest, Gold konfirmasi, Forex add+harvest, semua dgn state pending + simulasi approval), **Cash out** (sumber non-Grow non-Unsorted, nominal via stepper, 3 metode opsional yg disembunyikan di Little, alasan wajib), **banner pending + layar Requests**, action hub, toast.
- **Mode usia** bisa diganti via toggle di atas frame (mempengaruhi Home & Wallets & Sort).

## Angka contoh (agar konsisten lintas layar — mode Middle) — **KANONIK**
Kalau ada permukaan yang berbeda dari daftar ini, **permukaan itu yang salah**, bukan daftarnya.
- Total Rp 484.711 = Unsorted 50.000 + Spend 95.000 + Save 240.000 + Give 40.000 + Grow 59.711
- Spend: Snacks 45.000 / Transport 30.000 / Games 20.000
- Save: BMX Bike 150.000 (**target 300.000**) / Headphones 30.000 (**target 100.000**) / Free savings 60.000
- ⭐ saldo 120 · ⭐ lifetime 120 · 💎 12 · Chapter 1 dari 6 selesai
- Request pending contoh: **Cash out Rp 25.000 dari Snacks**, alasan ditulis anak
- Rasio auto-split default: **40% Spend / 40% Save / 20% Give**

> **Selisih yang belum diperbaiki per 28 Juli 2026** (lihat register K4–K6 di `nummi-status.md`):
> app ortu memakai target BMX 400.000 & Headphones 60.000; app anak memakai pending Rp 20.000;
> seed rules app ortu memakai 40/40/10. Ketiganya menyimpang dari daftar kanonik di atas.
- Grow (dihitung dari feed, bukan hardcode): TD pokok 30.000 + bunga 750 (✅ matured) = 30.750 /
  Gold **14,5 mg** beli 21.000 → buyback 19.140 (**▼8,9%** krn spread) / Forex US$0,62 beli 10.000 → 9.821 (**▼1,8%**)
- Little: Grow dilebur ke Save (Save tampil 299.711), Grow disembunyikan.
- **Kedua mockup (anak & ortu) dipatok manual ke angka ini** — tidak live-linked, jadi kalau satu berubah, sinkronkan yang lain.

## Sisi Orang Tua — `celengan-parent-mockup.html` (Fase 1 + 2 + 3 + 4 + 5)

**Cakupan Fase 1**: Login (2 pintu), Dashboard + switcher anak, Requests (approval inbox 2-langkah).
**Cakupan Fase 2**: Send money, Take money, Add a child.
**Cakupan Fase 3**: Settings jadi nyata — Allowance schedule (auto-credit), Manage investments, Your bank rates, Today's prices.
**Cakupan Fase 4**: Missions jadi nyata — kartu **Learning** (tracker + status gerbang + benih conversation starter),
**Jobs** (builder 3 jenis terpandu), **Prizes** (custom prize + pratinjau "berapa lama untuk dapat").
**Cakupan Fase 5**: Give flow (request → To do → **form cerita wajib**) menutup lubang kategori terakhir;
minus-point raid dream (Backlog B); streak dihapus; bug topbar ⭐/🔥 diperbaiki.

**Keputusan arsitektur & nada:**
- **Approve ≠ Fulfilled — HANYA untuk Cash out** *(direvisi: dulu berlaku utk semua jenis request)*:
  `Needs OK` (anak mengajukan) → `To do` (di-approve, **belum** dieksekusi — ortu dapat instruksi konkret,
  mis. "Hand Arthur Rp 25,000 in cash") → `Done` (ortu tandai **Mark as done**, baru saldo ledger berubah).
  **Grow & Harvest tidak lewat "To do"**: tak ada aksi dunia nyata (ortu = bank), jadi approve = selesai seketika.
  **Empat jalur approve, masing-masing ada alasannya:**
  | Jenis | Jalur | Kenapa |
  |---|---|---|
  | Grow / Harvest | approve = selesai | tak ada aksi dunia nyata |
  | Klaim mission | approve = selesai | reward cuma angka di ledger |
  | **Tukar hadiah** | approve → **To do** | ortu harus benar-benar memberi 1 jam main; janji yang tak ditepati merusak kepercayaan pada seluruh sistem |
  | **Give** | approve → **To do** + **cerita wajib** | ortu harus menyalurkan DAN menutup lingkarannya — tanpa cerita, Give = uang hilang |
  | Cash out | approve → To do | ortu harus menyerahkan uang |
- **Jawaban ketiga: "Talk about it"** — selain Approve/Decline, supaya menolak tanpa penjelasan (kesalahan
  umum ortu) tidak jadi satu-satunya jalan.
- **Aturan potong uang ("Take money")**: hanya boleh dari **Spend, Unsorted, dan Free savings** (uang yang
  belum punya tujuan spesifik). **Dream, Give, dan Grow terlindungi mutlak** — dream = janji anak ke diri
  sendiri, Give = janji ke orang lain, Grow = aset riil yang secara teknis tak bisa ditarik sepihak. Flow
  Take money sendiri belum dibangun (Fase 2), tapi aturan proteksi ini sudah final & harus dipatuhi saat dibangun.
- **Dua suara, satu app**: Login tetap **hangat/playful** (piggy gradient, Fredoka, kartu bulat, PIN pad
  bulat) — karena itu satu-satunya layar yang ortu **dan** anak sama-sama berdiri di depannya (dua pintu,
  satu celengan). Interior (Dashboard/Requests/dst) pakai bahasa **ringkas/padat**: ikon garis (bukan emoji
  chrome), angka tabular, hairline border, sudut kecil (9–16px), legend dgn nominal+persen menggantikan
  ring-saja. Alasannya: ortu membuka app di sela kesibukan, butuh gambaran penuh + keputusan cepat; anak
  butuh ruang berpikir lambat. Dua permukaan boleh beda suara asal tak pernah beda makna.
  - **Palet interior tetap cerah** (bukan abu/gelap) — kanvas lavender `#F1EFF9`, aksen ungu brand `#6C4CE0`
    menggantikan draft awal yang sempat pakai `ink` hitam untuk tombol utama/chip terpilih.
  - **Warna kategori & status TIDAK PERNAH diubah** dari sisi anak: Spend/Save/Give/Grow persis sama;
    status ok/warn/danger juga pakai nilai yang identik (mis. `--ok` = `--grow-deep` anak). Ini jembatan
    makna antar-app — kalau ikut di-tema, ortu & anak berhenti membicarakan hal yang sama.
  - **Aturan emoji**: emoji yang membawa **identitas anak** tetap ada (avatar Arthur 🦊 di ring & tiap
    request — itu miliknya, bukan hiasan). Emoji sebagai **chrome** (nav, ikon aksi) diganti ikon garis SVG.
- **Switcher anak** (multi-anak) di Dashboard — ganti anak mendemokan tier dari sudut ortu (Nadia/Little:
  Grow hilang, ring 4 segmen, bukan 5).
- **Seed data Requests** (demo, cermin flow anak): cash-out Rp 25.000 (alasan ditulis anak), harvest Gold,
  beli USD Rp 16.000 — semua dari Arthur; satu request Nadia sudah `Done` sebagai contoh histori.

**Fase 2 — Send money, Take money, Add a child:**
- **Refactor data model**: `KIDS` diubah dari total-per-kategori jadi **sub-wallet per anak**
  (`k.wallets = [{id,name,ico,cat,kind,amt}]`), karena Take money mustahil menegakkan aturan proteksi
  tanpa tahu mana dream dan mana Free savings. Total kategori sekarang diturunkan lewat `catTotal(k,cat)`.
- **Send money**: nominal (stepper) + **tag sumber wajib** (Allowance/THR Lebaran/Birthday/Prize/From
  family/Other — pembeda kultural Celengan) + catatan opsional. Uang **selalu mendarat di Unsorted**,
  tak pernah langsung ke kategori — anak yang memberi tugas pada uangnya, bukan ortu.
- **Take money**: kantong terlindungi (dream/Give/Grow) **tetap ditampilkan tapi digembok** (bergaris
  putus, ikon gerbang, sebab spesifik saat di-tap) — bukan disembunyikan. Menyembunyikan bikin ortu
  bingung; menampilkan-digembok mengajari ortu aturannya. **Alasan wajib** (simetri dgn anak yang wajib
  isi alasan Cash-out) + **pratinjau notifikasi persis kata-per-kata** yang akan anak terima (karena anak
  tak bisa menolak, minimal berhak tahu persis apa & kenapa).
- **Add a child**: nama, **bulan+tahun lahir saja** (privasi, tanpa tanggal presisi), tier **disarankan
  otomatis dari usia** (cutoff ≤7 Little, ≤12 Middle, >12 Teen; "hari ini" mockup = Juli 2026) **tapi ortu
  bisa override** — hint saat override sengaja tidak menghakimi ("that's fine, the boundary isn't sharp"),
  PIN 6-digit. Anak baru langsung muncul di switcher dgn saldo 0 & wallet starter sesuai tier.
- **Pola bug yang berulang 3×** — dicatat sebagai pengingat proses: saat mengganti satu blok CSS (login)
  dua kali berturut-turut, definisi dasar `.field`/`.cta` yang scope-nya lebih luas ikut terhapus tanpa
  disadari (halaman jadi "berantakan" / tombol jadi polos tanpa gaya). Pelajarannya: kalau memadukan/
  mengganti blok CSS besar, grep dulu apakah selector di blok itu dipakai di tempat lain sebelum menimpa.

**Fase 3 — Settings jadi nyata:**
- **Allowance schedule (auto-credit)**: nominal + frekuensi (weekly/2-mingguan/monthly) + hari/tanggal, dgn
  pratinjau tanggal pembayaran berikutnya. **Otomatis masuk Unsorted tanpa konfirmasi ortu** — sah karena
  tak ada uang riil bergerak (uang tetap di tangan ortu; ledger cuma mencatat komitmen). Riset: uang saku
  yang bersyarat perilaku merusak kemampuan anak berencana → baseline harus tak bersyarat. Ortu boleh
  pause/edit, bukan skip diam-diam. Tombol demo "Run the next payment now" menggantikan scheduler.
  *Catatan: opsi 2-mingguan di mockup disederhanakan — tanpa anchor tanggal mulai. Perlu diperbaiki saat dibangun sungguhan.*
- **Your bank rates**: ortu menetapkan bunga per tenor (3/6/12 bln). Request deposito lalu bisa di-approve
  **1 tap** — rate & jatuh tempo dihitung otomatis. Label sengaja jujur: *"Interest you pay"*.
- **Today's prices**: emas jual/buyback + 3 kurs tengah + tanggal pembaruan. Tombol demo "Simulate tomorrow's
  prices" (emas ±3%, valas ±1%) menggantikan scheduler — sekaligus mendemokan bahwa **TD tidak ikut pasar**
  sementara emas & valas ikut.
- **Manage investments**: detail per instrumen (TD: pokok/rate/tenor/jatuh tempo + countdown; Gold: berat,
  harga bayar, buyback hari ini; FX: unit, kurs jual). Tombol update manual **dihapus** — harga dari feed.
- **Account card**: nama, lahir (bulan+tahun saja), tier, PIN tersamar. Edit belum dibangun.

**Fase 4 — Missions & Prizes:**
- **Kartu Learning** (tracker): chapter x/y + judul materi yg sedang dipelajari, ⭐ lifetime + sisa menuju gerbang,
  status materi mingguan ("Can swap" / "Swap paused"), status gerbang Jobs & Achievements. Plus baris
  *"💬 Arthur just learned ... — a good thing to ask about at dinner"* = benih conversation starter (Backlog).
- **Jobs**: daftar per anak + builder terpandu (3 jenis + template + reward dipandu + sekali/mingguan).
  Job yang terkunci gerbang tetap tampil (dgn tanda 🔒) supaya ortu tahu apa yang menanti.
- **Prizes**: custom prize (nama + biaya 💎) dgn **pratinjau "berapa lama untuk dapat"** berbasis 💎/minggu
  yang realistis dari job mingguan yang ada. Verdict-nya berjenjang: *quick win / within sight / long haul /
  "Most kids give up quietly at this distance"*. Angka ini **hidup** — nambah job mingguan mengubah estimasinya.
- **Seed data mission & prize disamakan manual** di kedua mockup (tak live-linked).

**Fase 6 — Money rules, auto-split, ortu kedua & Insight** *(ditemukan saat audit 28 Juli 2026:
sudah dibangun di app ortu HP + web, catatannya belum pernah ditulis)*:
- **Auto-split editor** (menutup Backlog A level 1): sakelar on/off, rasio per kategori, **plus pemilihan
  wallet tujuan** per kategori (`dest`: mis. Spend→Snacks, Save→Free savings). Ada validasi
  *"Ratio is over 100%"*. Sisa rasio yang belum dialokasikan **boleh** di mode Flexible dan mendarat di
  Unsorted; di mode Strict wajib habis (*"Assign the last N%"*). Kalau auto-split mati, semua uang masuk
  mendarat di Unsorted seperti sebelumnya.
- **Money rules — Strict vs Flexible** (menutup Backlog C, sisi ortu): dua mode dengan penjelasan
  konsekuensi yang ditulis apa adanya, mis. Flexible = *"anak bisa menyortir ulang Unsorted & Spend
  dengan bebas"*, Strict = *"pembagian terkunci — uang tidak bisa keluar dari tugas yang sudah diberikan"*.
  Yang tetap berlaku di kedua mode: setiap cash-out butuh persetujuan; dream & Give tidak bisa dibatalkan
  tanpa ortu; Grow tidak bisa ditarik sepihak.
  **⚠️ Belum ditegakkan di app anak** — app anak masih menampilkan teks mati "40% Spend / 40% Save /
  20% Give default" dan tidak tahu mode Strict. Ini item paling mendesak di backlog.
- **Undang orang tua kedua** (turunan §4 `premium-setting.md`): alur undangan (belum diundang → diundang →
  akun aktif), atribusi keputusan per-ortu (*"Diputuskan oleh …"*), dan gerbang Pro pada penggantian sebutan
  (*"Ubah sebutan orang tua tersedia di Nummi Pro"*) — sesuai keputusan **jual identitas, bukan akses**.
- **Halaman Insight** (paling lengkap di versi web): pembacaan tren dalam kalimat biasa — pergerakan
  Unsorted, rasio simpan, dream yang tak pernah dirampok, tren per rentang waktu, dan *"tidak ada yang perlu
  dibimbing sekarang — kebiasaannya sedang terjaga"* saat memang tidak ada masalah. Sifatnya deterministik
  (dihitung dari ledger), konsisten dengan Constraint C3.
- **Transactions / riwayat penuh** dengan filter rentang tanggal, di sisi ortu.
- **Parent Web** = superset dari Parent HP: tambahan Dashboard lintas-anak (*"From all your children"*),
  *"Rules, per child"*, dan halaman Insight penuh. Parent HP punya layar **Detail permintaan** yang tidak
  ada di web.

**Yang sengaja BELUM dibangun** (bukan lupa — urutan prioritas, lihat Backlog G):
Auto-split ratio editor · Strict/Flexible · Parent articles + conversation starters (benihnya sudah ada di
kartu Learning) · Progress markers · Give fulfilment story (foto/cerita balik) · Edit data anak (nama/tier/PIN) ·
Growth Reward (bunga simulasi didanai ortu — konsep terpisah dari Grow, masih menunggu keputusan) ·
**Scheduler + feed harga (backlog teknis T)** · **Scheduler reset mingguan** (job & materi mingguan — di mockup
masih tombol demo) · Edit/hapus mission & prize yang sudah dibuat (baru bisa create).

**Perbaikan lintas-app (berlaku di kid app & parent app):**
- **Notifikasi/strip pending sekarang per-anak** di Dashboard ortu ("N of Arthur's requests..."), bukan
  gabungan semua anak — supaya tidak membingungkan saat switcher pindah ke anak yang tak punya request.
  Lonceng di header tetap global (lintas anak) — bedanya disengaja: strip = konteks anak yang lagi dibuka,
  lonceng = radar seluruh keluarga.
- **Pemisah ribuan di semua input nominal** (mis. "50,000" bukan "50000") — berlaku live saat mengetik
  maupun saat tombol stepper +/− ditekan, di kid app (Add/Move money, Forex, Cash out) & parent app
  (Send/Take money). Parsing tetap membuang semua non-digit sebelum dihitung, jadi aman dari kesalahan baca.


## Catatan teknis mockup
- Satu file HTML self-contained. Frame HP + panel design system di sampingnya.
- Fonts: Fredoka (display/angka) + Plus Jakarta Sans (UI). Brand grape #6C4CE0; warna kategori: Spend #FF7A4D, Save #2CA6E0, Give #F056A0, Grow #2FC078 (+ token `-deep` & `-tint`). Token ini sama persis dipakai di `celengan-parent-mockup.html`.
- JS satu IIFE; validasi dengan `node --check`. Angka & aksi sebagian placeholder (form Create belum tervalidasi; Cash-out/Harvest/Grow-in masih toast — butuh approval-flow beneran, lihat Backlog G & H).

## Langkah berikutnya (urutan yang disarankan)
1. ~~Keputusan D1 & D2~~ ✅ **selesai** — Inggris (ADR-0016), istilah sama lintas tier (ADR-0017).
   yang kini menyempit ke sisi Inggris saja.
2. **Bersih-bersih kontradiksi K3–K7** (format rupiah, target dream, request pending, rasio seed,
   badge streak yatim) — mekanis, murah, menghilangkan angka yang saling bertentangan antar layar.
3. **Turunkan Fase 6 ke app anak** — auto-split & money rules ditegakkan di sisi anak, bukan cuma diatur ortu.
4. **Paritas iPad** (lihat matriks di `nummi-status.md` §2) atau putuskan iPad keluar dari cakupan MVP.
5. **Bawa brand ke app anak** — wordmark + maskot; selesaikan dulu kontradiksi maskot (K8).
6. **Fase 7**: Rapor Literasi (M2), Growth Reward (M1), paywall (M6), slot iklan (M5).
7. **Backlog teknis (T)**: scheduler feed harga harian + scheduler reset mingguan — dua-duanya masih tombol demo.
8. **D3 + D4** (model harga & distribusi) sebelum baris kode produksi pertama.

## Cara melanjutkan di chat baru (dalam Project ini)
1. Pastikan Project files berisi berkas di daftar "File proyek" di atas — dan **buang dua mockup usang**
   supaya tidak ada sesi yang mengedit berkas yang salah.
2. Buka dengan: "Lanjutan proyek Nummi — baca `nummi-status.md` dulu, lalu lanjut ke [X]."
3. Claude mengedit mockup dengan menyalin file ke direktori kerja lalu memodifikasinya (file yang diunggah
   bersifat read-only). Untuk mockup React yang di-bundle, yang diedit adalah blok kode aplikasi di dalam
   berkas HTML-nya.

---

## Monetisasi & Premium — DISEPAKATI (spec lengkap: `premium-setting.md`)

**Model bisnis: one-time payment (OTP), Rp 399.000** — "sekali bayar, KG B → Grade 9". Bukan langganan.
Alasan cocok utk Ghozy (pegawai kantoran): nol ops langganan, nol guardrail downgrade, nol objection "males
langganan". **Lubang OTP**: revenue = f(user baru), bukan f(total user) → butuh (a) audit COGS ~nol per user;
(b) mesin revenue berulang = **paket edukasi/webinar** (bukan pelengkap — penutup lubang).

**Metrik utara**: keluarga aktif dibobot ke tier Teen (BUKAN download/DAU) — nilai produk = pipeline keluarga
yg 12 bln lagi buka rekening bank pertama dgn ortu yg sudah percaya.

**3 CONSTRAINT KERAS** (lindungi legal + App Store + premis):
- **C1** — TIDAK ADA gembok Pro di app anak. Fitur Pro belum-aktif = TIDAK TAMPIL (bukan tampil-terkunci).
  Grow tak muncul di nav anak kalau non-Pro. Semua upsell HANYA di app ortu. (Produk ini mengajari anak menahan
  impuls konsumtif — memakai impuls anak utk menjual = bunuh premis.)
- **C2** — NOL slot iklan di app anak.
- **C3** — LLM tak pernah menyentuh angka (rapor: angka & skor deterministik dari ledger + rubrik konstanta).

**Pembagian Free/Pro (ringkas):**
- **Selalu Free** (mesin retensi/akuisisi): ledger inti + riwayat penuh, Sort, Give flow, allowance 1 jadwal,
  gamifikasi ⭐/💎, **Growth Reward** (bunga tabungan simulasi), Jobs **template** (3), 1 prize, 1 dream, 1 envelope,
  1 anak, ~1 chapter/topik, artikel parent web (SEO).
- **Pro**: **Grow** (TD/Gold/Forex + Harvest — satu-satunya COGS riil = feed), **Rapor Literasi Finansial** (PDF/sem),
  **web dashboard**, **2 akun ortu personal + penyebutan**, **custom Jobs/Prizes builder** + tak terbatas, ≤4 anak
  (satu harga), auto-split editor, Strict/Flexible dial, perpustakaan penuh + sertifikat, bebas iklan brand,
  dream/envelope/allowance tak terbatas.

**Keputusan kunci & alasannya:**
- **Akun ortu kedua = jual IDENTITAS, bukan akses** (kalau jual akses → 1 password dibagi → gate bocor 100%).
  Free = 1 akun ("Parent" anonim). Pro = 2 akun personal, anak lihat "Bunda kirim..." (penyebutan **free text +
  saran**, bukan dropdown Ayah/Ibu — ragam ID terlalu banyak). Build = kolom `sender_id` (memang sudah harus ada).
- **Growth Reward = PENYEBUT untuk Deposito, bukan Grow-lite** `[BLOCKED — butuh build]`. GR: bunga kecil, likuid,
  otomatis, uang tak pindah, COGS nol, Free. TD: bunga lebih tinggi, harganya = ketidakbebasan waktu (terkunci,
  Harvest), Pro. Tanpa GR, pilihan anak cuma "dapat sesuatu vs nol" (bukan trade-off) → anak kunci semua, Harvest
  asimetris tak pernah terasa sbg harga. GR menutup bug: uang diam di Save saat ini = nol. Tier-aware (Little ~5%/bln
  terasa; Middle/Teen ~1–2%/bln, TD wajib>GR). Mendarat proporsional ke wallet Save penghasil. Aturan tangga + cap wajib.
  Label kode `GROW_REWARD`; nama produk final ditunda (kandidat "bunga tabungan"). SATU-satunya keputusan premium yg
  menambah scope build nyata — sisanya `if`.
- **Rapor = formula-first, bukan LLM** (per-semester). Alasan bukan biaya (cadence sudah bikin murah) tapi:
  halusinasi ttg anak orang fatal; rapor harus bisa dibandingkan antar-semester (LLM tak konsisten, formula konsisten,
  perbandingan itulah produknya); rubrik terbuka > kotak hitam. 5 dimensi (Ketekunan/Kesabaran/Perencanaan/Kemurahan/
  Pengetahuan) dari `financial_literacy.md` §7. Skor tak pernah berdiri sendiri — selalu + 1 aksi konkret ortu.
- **Iklan = inventory sendiri (tanpa SDK 3rd-party), app ortu saja.** 4 slot (P1 dashboard bawah, **P2 setelah
  cash-out approve = paling bernilai**, P3 learning, P4 rapor "langkah berikutnya" saja). Daftar-tidak ditulis
  sekarang: ✅ bank pelajar/Pegadaian/buku ❌ top-up game/pinjol/judi/mainan-anak. Daftar ✅ ≈ musuh Pilar C kurikulum
  → tak boleh ajari bahaya pinjol lalu terima uangnya. Pro = bebas iklan brand.
- **Paywall**: momen terbaik = SETELAH Sort pertama berhasil (puncak emosi).
- **⚠️ KOREKSI — jalur pembayaran** *(membatalkan rencana lama "QRIS/GoPay/transfer via checkout web")*:
  **iOS adalah pasar utama** (membalik asumsi awal). **Apple IAP wajib** untuk membuka fitur di iOS —
  storefront Indonesia tidak mendapat pengecualian anti-steering seperti AS/UE, dan pengecualian Reader App
  tidak berlaku untuk Nummi. Jalur pembayaran luar membawa risiko terminasi akun yang nyata.
  Program Usaha Kecil Apple = **15%**. **Android**: Google Play Billing + **User Choice Billing** (Indonesia
  termasuk) → Xendit/Mayar sah, hemat ~4%. **Sekolah**: Enterprise Services (3.1.3(c)), diprovisikan
  **sepenuhnya di luar app store**; konsekuensi UX: tombol upgrade tidak pernah tampil untuk pengguna sekolah,
  kolom kode sekolah dikubur di Settings.
  **Arsitektur entitlement**: empat tabel (`entitlements`, `iap_receipts`, `schools`, `school_members`),
  satu resolver `isPro(user)`.
- **⚠️ Harga BELUM final.** `premium-setting.md` masih mengunci one-time Rp 399.000. Risiko struktural
  sekali-bayar (pendapatan sekali, kewajiban seumur pemakaian) sudah teridentifikasi; usulan model hibrida
  (slot founding-member seumur hidup terbatas → langganan) belum diputuskan. Lihat D3 di `nummi-status.md`.

**Ditunda (backlog M–Q)**: Family Circle (ditolak v1), B2B sekolah (jangan dikejar; ganti webinar), OTP versi,
affiliate versi fulfilment-ortu. Detail di `nummi-backlog.md`.
