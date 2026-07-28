# Celengan — Kurikulum Literasi Finansial & Desain Mission

> Dokumen konsep: teori dasar yang perlu dikenalkan ke anak per jenjang usia,
> dan bagaimana teori itu diwujudkan menjadi **Mission** di dalam aplikasi.
> Status: draft konsep (plan mode) — belum ada yang dibangun di mockup.
> Terkait: `celengan-backlog.md` item B (gamifikasi), tab **Missions** di bottom nav.

---

## 1. Filosofi & Prinsip Desain Kurikulum

### 1.1 Mengapa mission, bukan "kelas"
Riset yang dikutip GoHenry (University of Cambridge) menunjukkan kebiasaan dan sikap anak
terhadap uang terbentuk **sejak usia ±7 tahun**. Riset internal GoHenry bersama akademisi
(St Andrews, Durham, Texas A&M) juga menemukan bahwa anak yang menyelesaikan Money Missions
menabung **~30% lebih banyak** di bulan pertama, dan yang menyelesaikan seluruh Level 1
menabung rata-rata **50% lebih banyak**. Kesimpulan penting dari riset itu: pendidikan finansial
paling efektif jika (a) disajikan dalam **potongan kecil (bite-sized)**, dan (b) **terhubung
langsung dengan perilaku uang nyata** — bukan teori lepas.

Celengan punya keunggulan struktural di sini: karena uang anak (versi ledger) benar-benar hidup
di aplikasi, setiap pelajaran bisa langsung "ditagih" dalam bentuk aksi nyata terhadap uangnya
sendiri. Ini prinsip **learn-then-practice** yang juga dipakai Sprout Saver.

### 1.2 Lima prinsip desain
1. **Setiap konsep berakhir di aksi.** Micro-lesson (teori) selalu berpasangan dengan practice
   mission (aksi in-app). Teori tanpa aksi = pengetahuan pasif.
2. **Pakai uang anak sendiri sebagai bahan ajar.** Contoh soal memakai saldo, dream, dan
   riwayat transaksi si anak (personalized), bukan angka abstrak.
3. **Tier-aware, bukan sekadar "lebih banyak teks".** Little belajar lewat cerita dan sortir
   sederhana; Middle lewat target dan trade-off; Teen lewat perencanaan, risiko, dan kritik
   terhadap iklan/scam.
4. **Konsep hanya diajarkan jika fiturnya ada (atau bisa disimulasikan).** Grow diajarkan karena
   ada instrumen Grow; bunga majemuk diajarkan lewat Time Deposit; likuiditas lewat Harvest.
5. **Gamifikasi mengarah ke perilaku baik, bukan ke engagement kosong.** Reward diberikan untuk
   menyelesaikan pelajaran dan mempraktikkannya — bukan untuk sekadar membuka app.

### 1.3 Acuan eksternal
- **GoHenry Money Missions** — 3 level usia (6–11 / 12–14 / 15–18), video animasi + kuis +
  poin & badge, dipetakan ke kurikulum pendidikan finansial nasional (US/UK). Topik berjenjang:
  Money Basics → Spending Wisely → Budgets & Plans → Investing, hingga pajak, kredit, dan scam
  untuk remaja.
- **Sprout Saver Learn** — 190+ lesson, 6 format (video, storybook, decision story, chat
  simulation, games), 11 topik terkurasi per usia, dengan companion characters; prinsip
  learn-then-practice yang terhubung ke jar/goal/vault milik anak.
- **CFPB "Building Blocks of Financial Capability"** — 3 blok perkembangan: *executive function*
  (usia dini), *financial habits & norms* (usia SD), *financial knowledge & decision-making
  skills* (remaja). Ini alasan kuat kenapa Little fokus ke kebiasaan & menahan diri, bukan istilah.
- **Konteks Indonesia (OJK)** — literasi keuangan nasional masih menjadi program prioritas
  (Strategi Nasional Literasi Keuangan Indonesia). Celengan bisa memposisikan diri selaras
  dengan agenda ini, termasuk untuk kanal B2B sekolah.

---

## 2. Peta Kompetensi per Jenjang

Kurikulum dibagi 3 tier mengikuti tier aplikasi. Setiap tier punya "kalimat kelulusan" —
apa yang anak *bisa lakukan* setelah menyelesaikan jenjangnya.

### 2.1 Little (KG B – Grade 1) — "Uang punya tempat dan tugas"
Fokus CFPB: executive function — menunggu, memilih, mengenali.
Kalimat kelulusan: *"Aku tahu uangku ada berapa, aku bisa memilih uang itu untuk dipakai,
disimpan, atau dibagi, dan aku bisa menunggu untuk sesuatu yang aku mau."*

Kompetensi:
- Mengenal uang sebagai alat tukar (bukan mainan; barang ditukar dengan uang).
- Mengenal angka nominal secara relatif (lebih banyak/lebih sedikit; cukup/tidak cukup).
- **Konsep inti aplikasi:** uang baru harus "diberi tugas" (Sort ke Spend/Save/Give).
- Menunda keinginan dalam skala kecil (menunggu 1–7 hari).
- Berbagi sebagai kebiasaan yang menyenangkan, bukan kewajiban.
- Membedakan "milikku" vs "milik orang lain" (dasar kejujuran finansial).

### 2.2 Middle (Grade 2–6) — "Aku punya rencana untuk uangku"
Fokus CFPB: financial habits & norms.
Kalimat kelulusan: *"Aku bisa membagi uangku dengan sengaja, menabung untuk target yang aku
tentukan sendiri, membedakan butuh dan ingin, dan mengerti kenapa uang yang ditumbuhkan
tidak bisa diambil kapan saja."*

Kompetensi:
- **Needs vs wants** dan memakainya saat memutuskan pembelian.
- Budgeting sederhana: membagi pemasukan dengan rasio (auto-split 40/40/20) dan memahami
  artinya, bukan sekadar menerima.
- Goal-setting: target nominal + perkiraan waktu ("kalau nabung Rp 10.000/minggu,
  BMX Bike tercapai dalam N minggu").
- Opportunity cost: memakai uang untuk A berarti tidak bisa untuk B (mekanik Move money +
  minus-point saat "merampok" dream adalah pengajarnya).
- Pengenalan Grow: uang bisa bertumbuh, tapi harus "dikunci" — pengenalan bunga/imbal hasil
  dan likuiditas lewat Time Deposit & Harvest.
- Memberi dengan tujuan (infaq/sedekah Jumat, donasi bencana) dan mencatatnya.
- Sumber uang khas Indonesia: uang saku, THR Lebaran, angpao, hadiah lomba — semuanya
  income yang layak direncanakan, bukan rezeki yang langsung habis.

### 2.3 Teen (Grade 7–9) — "Aku mengelola sistem uangku sendiri"
Fokus CFPB: financial knowledge & decision-making.
Kalimat kelulusan: *"Aku bisa merancang aturan pembagian uangku sendiri, membandingkan
instrumen menabung/berinvestasi berdasarkan risiko dan likuiditas, mengenali jebakan
konsumtif dan penipuan, dan siap membuka rekening bank sungguhan."*

Kompetensi:
- Merancang & merevisi rasio auto-split sendiri (dalam batas orang tua) dan mengevaluasi
  hasilnya setelah 1 bulan.
- Risiko vs imbal hasil: membandingkan Time Deposit (pasti, terkunci), Gold (fluktuatif,
  cenderung naik), Forex (bisa naik/turun) — memakai data riil dari Grow miliknya.
- Bunga majemuk & efek waktu (simulasi: "kalau kamu mulai sekarang vs 2 tahun lagi").
- Inflasi sederhana: kenapa harga bakso naik; kenapa "menyimpan di bawah kasur" itu rugi.
- Literasi konsumen: iklan, diskon palsu, FOMO, paylater/pinjol (bahaya kredit konsumtif),
  dan penipuan online (phishing, "hadiah" palsu, judi online berkedok game).
- Etika & sosial: zakat/persembahan/donasi terencana, membantu keluarga, konsumsi bertanggung
  jawab.
- Jembatan ke dunia nyata: apa itu rekening bank, kartu debit, e-wallet, biaya admin, dan
  apa yang berubah ketika "bank"-nya bukan lagi orang tua.

---

## 3. Arsitektur Mission

### 3.1 Dua jenis mission (sesuai visi produk)
1. **Learn Mission (teori)** — micro-lesson 1–3 menit: cerita/komik/video pendek + kuis
   2–4 soal. Selalu berakhir dengan satu kalimat "kunci" yang bisa diingat anak.
2. **Practice Mission (praktik)** — aksi nyata di aplikasi yang membuktikan konsepnya:
   sortir uang, isi dream, kunci Time Deposit, ajukan Harvest, dsb. Diverifikasi otomatis
   oleh event di ledger (bukan self-report).

Aturan pemasangan: **setiap Learn membuka Practice pasangannya**, dan Practice baru memberi
reward penuh jika Learn-nya sudah selesai. Ini mereplikasi temuan GoHenry bahwa efek terkuat
muncul ketika pelajaran tersambung ke perilaku.

### 3.2 Tiga ritme mission
| Ritme | Isi | Sumber |
|---|---|---|
| **Daily mission** | 1 aksi kecil hari ini (yang sudah ada di Home) | dipilih engine dari kurikulum + keadaan saldo anak |
| **Story mission / Chapter** | jalur belajar berurutan per topik (spt level GoHenry) | kurikulum §4 |
| **Event mission** | musiman: Lebaran/THR, tahun ajaran baru, Ramadan (giving), ulang tahun | kalender |

Daily mission bersifat *state-aware*: kalau ada Unsorted > 0, misinya "sortir uangmu";
kalau dream mandek 2 minggu, misinya "isi dreammu Rp 10.000"; kalau tidak ada apa-apa,
fallback ke Learn Mission berikutnya di chapter aktif.

### 3.3 Format konten per tier
| | Little | Middle | Teen |
|---|---|---|---|
| Format utama | cerita bergambar + tap-to-choose | komik/animasi + kuis + simulasi | decision story, simulasi chat, kalkulator interaktif |
| Durasi | < 1 menit | 1–3 menit | 3–5 menit |
| Bahasa | sangat sederhana, ikon besar | naratif, contoh konkret | to-the-point, data & grafik |
| Verifikasi praktik | 1 langkah (tap Sort) | multi-langkah | multi-langkah + refleksi singkat |

### 3.4 Karakter pemandu (companion) — opsional, terhubung ke gamifikasi
Meniru Sprout Saver: tiap "mindset" uang diwakili karakter. Usulan awal (nama placeholder,
netral budaya):
- **Momo** (celengan/panda) — pemandu utama, kebiasaan menabung.
- **Kiki** (tupai) — spending cerdas, needs vs wants.
- **Bima** (pohon/beringin kecil) — Grow, kesabaran, investasi.
- **Lala** (lebah) — Give, berbagi, komunitas.
Karakter ini juga bisa menjadi aset gamifikasi (kostum avatar, dsb.) — lihat backlog B.

---

## 4. Kurikulum: Topik → Konsep → Mission

Sepuluh topik payung, masing-masing berisi chapter berjenjang. Total kasar bila dipecah
menjadi micro-lesson per tier: **±150–200 mission** (setara skala 190+ Sprout Saver, tapi
setiap unit lebih kecil dan selalu berpasangan dengan praktik).

Legenda: 🐣 Little · 🧒 Middle · 🧑 Teen · [L] Learn · [P] Practice.

### Topik 1 — Apa itu uang (Money Basics)
Konsep: alat tukar, nominal, dari mana uang datang (bekerja/usaha), uang fisik vs digital.
- 🐣 [L] "Toko Bu Sari": cerita menukar uang dengan barang. [P] Kenali saldomu — buka Home,
  tap ring Total, jawab "uangmu ada berapa?" (pilihan ganda dari saldo asli).
- 🐣 [L] "Uang datang dari mana?" (ayah/ibu bekerja). [P] Saat menerima kiriman uang saku,
  buka notifikasi dan tandai sumbernya.
- 🧒 [L] Uang tunai vs saldo di app: kenapa angka di Celengan = janji orang tua. [P] Telusuri
  history satu wallet dan temukan transaksi pertama.
- 🧒 [L] Sejarah singkat uang (barter → koin → digital). [P] Kuis berhadiah stars.
- 🧑 [L] Uang giral, e-wallet, rekening bank: apa bedanya dengan Celengan. [P] Simulasi
  "membaca" biaya admin & bunga tabungan bank sungguhan (data contoh).

### Topik 2 — Memberi tugas pada uang (Sort / Purpose)
Konsep inti Celengan: uang baru belum punya tugas; Unsorted → Spend/Save/Give.
- 🐣 [L] "Tiga rumah uang": setiap koin butuh rumah. [P] Sortir uang barumu (dipandu, 1 kategori
  per tap).
- 🧒 [L] Kenapa dibagi dulu sebelum dipakai ("purpose before use"). [P] Sortir manual tanpa
  auto-split, lalu bandingkan dengan usulan auto-split.
- 🧒 [L] Arti 40/40/20. [P] Selesaikan 4 sortir berturut-turut tanpa menyisakan Unsorted > 3 hari
  (streak mission).
- 🧑 [L] Merancang rasio sendiri: apa trade-off menaikkan Spend. [P] Edit rasio auto-split
  (dalam batas ortu), jalankan 1 bulan, lalu review hasilnya di mission refleksi.

### Topik 3 — Butuh vs Ingin (Spending Wisely)
Konsep: needs vs wants, prioritas, harga vs nilai, keputusan sebelum membeli.
- 🐣 [L] Sortir gambar: nasi, mainan, sepatu sekolah, permen → butuh/ingin. [P] Sebelum minta
  cash-out, pilih label "butuh" atau "ingin" (data ini juga berguna bagi orang tua).
- 🧒 [L] "Aturan tunggu 3 hari" untuk barang ingin. [P] Tandai satu keinginan → app menahannya
  3 hari → kalau masih mau, ajukan; kalau tidak, dapat bonus stars ("kamu menang lawan impuls").
- 🧒 [L] Harga satuan & membandingkan (mana lebih hemat). [P] Kuis interaktif harga jajanan.
- 🧑 [L] Anatomi iklan & diskon: anchor price, "diskon 70%", FOMO. [P] Decision story:
  flash sale sepatu — beli sekarang / cek harga asli / tunggu.
- 🧑 [L] Paylater & pinjol: kenapa "beli sekarang bayar nanti" itu mahal. [P] Kalkulator:
  hitung harga sebenarnya barang Rp 500.000 dengan bunga paylater.

### Topik 4 — Menabung & Dream (Saving & Goals)
Konsep: delayed gratification, target, konsistensi kecil > setoran besar sesekali.
- 🐣 [L] Cerita menunggu (marshmallow versi ramah anak). [P] Simpan Rp berapa pun ke Save
  hari ini.
- 🧒 [L] Membuat target yang baik: nominal + tenggat realistis. [P] Buat dream pertamamu
  dengan target & tanggal.
- 🧒 [L] Matematika dream: Rp 10.000/minggu → berapa minggu? [P] Isi dream 4 minggu
  berturut-turut (streak) → badge "Penabung Konsisten".
- 🧒 [L] Kalau dream berubah: boleh! Yang penting uang kembali ke Save. [P] Pindahkan saldo
  antar-dream tanpa penalti (mengajarkan re-prioritas ≠ gagal).
- 🧑 [L] Dana darurat mini: kenapa "Free savings/Someday" perlu diisi. [P] Jaga Free savings
  ≥ 10% dari Total selama sebulan.
- 🧑 [L] Menabung otomatis vs manual: kenapa otomatis menang. [P] Aktifkan auto-route
  sebagian uang saku ke dream.

### Topik 5 — Berbagi (Give)
Konsep: berbagi sebagai identitas, memberi terencana, empati; konteks lokal (infaq, zakat
fitrah, kotak amal, persembahan, donasi bencana).
- 🐣 [L] Cerita "sebagian untuk teman". [P] Sisihkan ke Give saat sortir (berapa pun).
- 🧒 [L] Memberi terencana vs spontan; Jumat berbagi. [P] Streak Give mingguan 4x → badge.
- 🧒 [L] Ke mana uang Give pergi (masjid/gereja, panti, bencana). [P] Ajukan "Give keluar"
  dengan tujuan, orang tua fulfill, anak menandai ceritanya.
- 🧑 [L] Zakat, persentase, dan memberi proporsional. [P] Hitung 2,5% dari THR Lebaranmu dan
  alokasikan ke Give.
- 🧑 [L] Menilai lembaga donasi (transparansi). [P] Decision story memilih kanal donasi.

### Topik 6 — Menumbuhkan uang (Grow & Investing)
Konsep: uang bisa bekerja, imbal hasil, waktu, likuiditas, risiko. Fitur pengajarnya:
Time Deposit, Gold, Forex, Harvest (satu arah, butuh izin).
- 🧒 [L] "Biji yang ditanam tidak boleh dicabut tiap hari" — metafora Grow. [P] Ajukan Grow
  pertamamu (nominal kecil) dengan izin ortu.
- 🧒 [L] Kenapa Time Deposit terkunci; apa itu jatuh tempo. [P] Tunggu TD mature tanpa
  mengajukan pembatalan → bonus stars saat mature ("hadiah kesabaran").
- 🧒 [L] Harvest: memetik hasil = menjual aset sungguhan. [P] Lakukan 1 Harvest ke dream.
- 🧑 [L] Risiko vs imbal hasil: TD pasti-kecil, Gold fluktuatif, Forex bisa turun. [P] Bandingkan
  grafik 3 instrumen Grow milikmu dan tulis 1 kalimat kesimpulan.
- 🧑 [L] Bunga majemuk & mulai lebih awal. [P] Kalkulator: Rp 50.000/bulan selama 5 vs 10 tahun.
- 🧑 [L] Diversifikasi sederhana ("jangan semua telur di satu keranjang"). [P] Miliki ≥ 2 jenis
  instrumen Grow.
- 🧑 [L] Yang BUKAN investasi: skema cepat kaya, "titip dana", judi online. [P] Kuis deteksi
  penawaran bodong.

### Topik 7 — Pemasukan & Bekerja (Earning) — *tergantung fitur chores/masuk backlog*
Konsep: uang datang dari usaha; nilai kerja; sumber income khas anak Indonesia.
- 🐣 [L] Cerita membantu di rumah. [P] (jika fitur chore ada) selesaikan 1 tugas.
- 🧒 [L] THR, angpao, hadiah lomba = income tidak rutin → paling penting untuk disortir.
  [P] Event mission Lebaran: sortir THR-mu, minimal 30% ke Save.
- 🧑 [L] Uang saku = "gaji" pertamamu: hidup dari payday ke payday. [P] Bertahan sampai
  hari uang saku berikutnya tanpa cash-out darurat.
- 🧑 [L] Ide usaha kecil remaja (jualan, jasa). [P] Refleksi terstruktur: catat 1 ide + modal +
  perkiraan untung.

### Topik 8 — Budgeting & Perencanaan
Konsep: rencana pengeluaran, amplop (envelope), evaluasi bulanan.
- 🧒 [L] Amplop Snacks/Transport/Games: kenapa dipisah. [P] Buat 1 envelope baru dengan
  limit mingguan.
- 🧒 [L] Kalau amplop habis sebelum waktunya? (belajar dari kejadian, bukan hukuman).
  [P] Review mingguan: lihat envelope mana yang jebol, geser alokasi.
- 🧑 [L] Membaca laporan bulananmu sendiri. [P] Mission bulanan "Money Review": 3 pertanyaan
  refleksi + set 1 niat bulan depan.
- 🧑 [L] Merencanakan pengeluaran besar (study tour, kado teman). [P] Buat dream jangka pendek
  dengan deadline dan auto-route.

### Topik 9 — Keamanan & Penipuan (Safety) — makin penting di Indonesia
Konsep: kerahasiaan (PIN/OTP), phishing, hadiah palsu, penipuan game/top-up, judi online.
- 🐣 [L] "Rahasia uang": tidak semua orang boleh tahu. [P] Aktifkan hide-balance dan coba
  toggle-nya.
- 🧒 [L] Orang asing minta kode/transfer = tolak & lapor. [P] Kuis situasi (chat simulation).
- 🧑 [L] Phishing & link palsu; "menang undian". [P] Simulasi chat: temukan 3 tanda penipuan.
- 🧑 [L] Top-up game & loot box: kenapa dirancang bikin nagih; judi berkedok game. [P] Decision
  story + hitung total pengeluaran top-up hipotetis setahun.

### Topik 10 — Jembatan ke dunia nyata (Teen capstone)
Konsep: rekening bank pertama, kartu debit, e-wallet, biaya-biaya, menuju kemandirian.
- 🧑 [L] Membaca produk tabungan anak di bank sungguhan (fitur, biaya, bunga). [P] Bandingkan
  2 produk (data contoh) dan pilih dengan alasan.
- 🧑 [L] Apa yang berubah ketika bank-mu bukan lagi orang tua. [P] "Wisuda Celengan":
  mission capstone — presentasikan ringkasan 1 tahun pengelolaan uangmu ke orang tua
  (app menyiapkan slide otomatis dari data).

---

## 5. Progression, Unlock & Sertifikasi

- **Chapter berurutan di dalam topik; topik bisa paralel** (maks. 2 chapter aktif agar fokus).
- **Level per tier** (spt GoHenry L1/L2/L3): anak naik level dari menyelesaikan chapter,
  bukan dari umur semata — anak Grade 4 yang cepat boleh mencicipi materi Teen versi ringan.
- **Gate berbasis perilaku, bukan hanya kuis:** contoh — chapter "Grow lanjutan" terbuka
  setelah anak punya ≥ 1 instrumen Grow aktif 30 hari.
- **Refresher otomatis:** kalau perilaku menurun (mis. Unsorted menumpuk > 7 hari), engine
  menyodorkan ulang mission terkait sebagai daily mission.
- **Sertifikat per topik** (shareable ke orang tua; berguna juga untuk narasi B2B sekolah:
  "rapor literasi finansial").

## 6. Peran Orang Tua dalam Kurikulum

- **Progress mirror** di app orang tua (spt GoHenry): topik apa yang sedang dipelajari anak,
  dengan "conversation starter" 1 kalimat ("Tanyakan ke Arthur apa bedanya butuh dan ingin").
- **Reward opsional dari orang tua** per chapter selesai (GoHenry menyediakan tombol serupa) —
  tapi lihat catatan desain di diskusi gamifikasi: reward uang harus per-milestone, bukan
  per-mission, agar motivasi intrinsik tidak rusak.
- **Event mission keluarga**: misi yang butuh 2 pihak (mis. anak mengajukan rencana THR,
  orang tua me-review bersama).

## 7. Metrik Keberhasilan (yang layak diukur sejak awal)

1. **Behavior lift** (metrik utama, meniru riset GoHenry): rata-rata setoran ke Save
   sebelum vs sesudah menyelesaikan chapter Saving.
2. Waktu rata-rata Unsorted → tersortir (harus turun).
3. % anak dengan dream aktif yang bergerak (terisi dalam 14 hari terakhir).
4. Completion rate per mission & drop-off point (untuk perbaikan konten).
5. Rasio Learn→Practice conversion (berapa % yang lanjut praktik setelah teori).
6. Untuk Teen: % yang mengedit rasio auto-split lalu bertahan ≥ 1 bulan.

## 8. Rencana Konten Bertahap (agar tidak menulis 200 lesson sekaligus)

- **Fase 1 (MVP Missions):** 1 chapter per topik inti (Topik 2, 3, 4, 5) × 3 tier ≈ 30–40
  mission + daily mission engine sederhana (state-aware).
- **Fase 2:** Topik 6 (Grow) + Topik 9 (Safety) + event Lebaran.
- **Fase 3:** Topik 1, 7, 8, 10 + refresher engine + sertifikat + progress mirror ortu.

---

*Dokumen ini adalah lapisan "Learn" dari Celengan. Lapisan "Reward" (stars/XP/badge/avatar)
dibahas terpisah dan tercatat di `celengan-backlog.md` item B.*
