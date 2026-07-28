# Celengan — Premium & Monetization Spec

> **Status:** disepakati (plan mode → merge). Ini dokumen **instruksi build**, gaya PRD/Claude Code.
> **Prasyarat baca:** `celengan-handoff.md` (arsitektur & keputusan terkunci), `celengan-backlog.md` (item tertunda).
> **Bahasa:** dokumen Indonesia; identifier & UI copy Inggris (konsisten dgn working language mockup).
> **Model bisnis:** **one-time payment (OTP)** — sekali bayar, hak seumur penggunaan (KG B → Grade 9). Bukan langganan.

---

## 0. Prinsip yang mengunci semua keputusan di bawah

Tiga aturan ini adalah *alasan* pembagian fitur. Kalau ragu menaruh sebuah fitur, uji dengan ini:

1. **Fitur yang menjaga app tetap hidup → GRATIS.** App mati = konversi nol = aset akuisisi nol.
   (allowance schedule, Sort, ledger, riwayat, Give, gamifikasi anak ⭐/💎, Growth Reward.)
2. **Fitur yang jadi alasan download → GRATIS.** Job #1 yang ortu "sewa": *"catat uang anakku biar tak hilang."*
3. **Yang berbayar = kedalaman, bukti, otomatisasi, aspirasi.** Ortu bayar untuk **melihat hasil** & agar
   **anaknya lebih maju** — bukan untuk fungsi dasar.

**Metrik utara (bukan download, bukan DAU):** **jumlah keluarga aktif, dibobot ke tier Teen.**
Alasan: nilai jangka-panjang produk = pipeline keluarga yang 12 bulan lagi membuka rekening bank pertama,
dengan ortu yang sudah percaya pada Celengan soal uang. Setiap gate diuji: *"apakah ini mengurangi keluarga aktif?"*

---

## 1. Tiga CONSTRAINT KERAS (tidak bisa ditawar, berlaku lintas fitur)

Ini bukan preferensi desain — ini pagar yang melindungi legal, App Store review, dan premis produk.
Claude Code **tidak boleh** menghasilkan kode yang melanggar salah satu dari ini.

- **C1 — TIDAK ADA gembok Pro di app anak.** Fitur Pro yang belum aktif harus **TIDAK TAMPIL** di app anak
  (bukan "tampil lalu terkunci"). Contoh: kalau keluarga belum Pro, Grow **tidak ada** di nav/UI anak —
  bukan kartu Grow dengan ikon 🔒. Alasan: (a) App Store Kids / Google Families melarang mendorong anak ke
  pembelian; (b) produk ini mengajari anak menahan impuls konsumtif — memakai impuls anak untuk menjual =
  membunuh premis sendiri. **Semua upsell hidup HANYA di app ortu.**

- **C2 — TIDAK ADA slot iklan di app anak.** Nol, tanpa pengecualian. Detail slot ada di §7.

- **C3 — LLM TIDAK PERNAH menyentuh angka.** Di rapor/analitik, angka & skor selalu deterministik dari ledger
  + rubrik konstanta. LLM (kalau dipakai sama sekali) hanya boleh menerima fakta jadi dan menulis nada/prosa.
  Detail di §6.

---

## 2. Entitlement Matrix (sumber kebenaran gating)

Legenda: **F** = tersedia di Free · **P** = Pro-only · **F→P** = ada di Free tapi dibatasi, penuh di Pro.

| Area | Kapabilitas | Free | Pro | Catatan gating |
|---|---|:--:|:--:|---|
| **Ledger inti** | Unsorted, Sort, 4 kategori, Add/Move, Cash out, **riwayat penuh** | ✅ | ✅ | Jangan pernah sandera data/riwayat. Ini hook, bukan fitur premium. |
| **Sub-wallet** | Dream aktif | 1 | ∞ | `MAX_DREAMS` |
| | Envelope Spend | 1 | ∞ | `MAX_ENVELOPES` |
| | Give pool, Someday | ✅ | ✅ | selalu ada |
| **Allowance** | Jadwal auto-credit | 1 | ∞ | `MAX_ALLOWANCE_SCHEDULES` |
| | Auto-split ratio editor (Backlog A) | ❌ | ✅ | aturan per-sumber (THR beda rasio dari uang saku) = Pro |
| **Growth Reward** | Bunga tabungan simulasi (kecil, likuid) | ✅ | ✅ | **GRATIS.** COGS nol. Lihat §5. |
| **Grow** | Time Deposit / Gold / Forex + Harvest + grafik | ❌ | ✅ | `isPro` gate. Feed harga = satu-satunya COGS riil → alasan jujur menagih. |
| **Give** | Flow penuh + cerita ortu | ✅ | ✅ | |
| | Foto cerita + arsip "Where my giving went" | F→P | ✅ | foto = Pro (opsional, low-priority) |
| **Jobs** | Template siap-pakai (kurasi) | 3 aktif | ∞ | `MAX_ACTIVE_JOBS` |
| | **Custom Jobs builder** | ❌ | ✅ | builder terpandu = Pro. Engine 💎/penukaran tetap Free. |
| **Prizes** | Prize template | 1 | ∞ | `MAX_PRIZES` |
| | **Custom prize builder** | ❌ | ✅ | |
| **Gamifikasi anak** | ⭐/💎, badge, avatar shop dasar | ✅ | ✅ | **selalu Free** (mesin retensi) |
| | Item avatar musiman (Lebaran, 17-an) | ❌ | ✅ | kosmetik, low-priority |
| **Missions/Learning** | ~1 chapter per topik inti | ✅ | ✅ | inti selalu Free |
| | Perpustakaan penuh + refresher engine + **sertifikat per topik** | F→P | ✅ | |
| | Artikel parent (web publik) | ✅ | ✅ | **SEO/akuisisi — wajib publik & gratis** |
| **Laporan ortu** | Ringkasan bulan berjalan | ✅ | ✅ | ringkasan ringan |
| | **Rapor Literasi Finansial** (PDF/semester) | ❌ | ✅ | inti value Pro. Lihat §6. |
| | Behavior lift, progress markers, export | ❌ | ✅ | |
| **Kontrol ortu** | Aturan proteksi default | ✅ | ✅ | |
| | **Strict/Flexible dial** (Backlog C) + batas per-kategori | ❌ | ✅ | |
| **Keluarga** | Jumlah anak | 1 | **≤4** | `MAX_CHILDREN`. Pro = satu harga sampai 4. |
| | Akun ortu personal + penyebutan | 1 akun | **2 akun** | Lihat §4. |
| **Platform** | App mobile | ✅ | ✅ | |
| | **Web dashboard** | ❌ | ✅ | pengisi daftar Pro — **jangan** jadi headline marketing |
| **Iklan** | Bebas iklan brand | ❌ | ✅ | Pro = tak lihat iklan brand (rekomendasi produk internal tetap ada). §7. |

---

## 3. Implementasi flag (siap Claude Code)

**Satu sumber kebenaran plan, dibaca di seluruh app ortu. App anak TIDAK PERNAH membaca ini untuk memasang gembok (C1).**

```js
// Plan negara-keluarga, bukan per-user. Simpan di family record.
const PLAN = { FREE: 'free', PRO: 'pro' };

const LIMITS = {
  free: {
    maxChildren: 1,
    maxDreams: 1,
    maxEnvelopes: 1,
    maxAllowanceSchedules: 1,
    maxActiveJobs: 3,
    maxPrizes: 1,
    grow: false,            // Grow penuh (TD/Gold/FX). NB: growthReward TIDAK di sini — selalu true.
    customJobBuilder: false,
    customPrizeBuilder: false,
    autoSplitEditor: false,
    strictFlexibleDial: false,
    parentAccounts: 1,      // jumlah akun ortu PERSONAL (lihat §4)
    web: false,
    report: false,          // Rapor Literasi Finansial
    brandAdsFree: false,    // Pro = true = tak lihat iklan brand
  },
  pro: {
    maxChildren: 4,
    maxDreams: Infinity,
    maxEnvelopes: Infinity,
    maxAllowanceSchedules: Infinity,
    maxActiveJobs: Infinity,
    maxPrizes: Infinity,
    grow: true,
    customJobBuilder: true,
    customPrizeBuilder: true,
    autoSplitEditor: true,
    strictFlexibleDial: true,
    parentAccounts: 2,
    web: true,
    report: true,
    brandAdsFree: true,
  },
};

const isPro = (family) => family.plan === PLAN.PRO;
const limit = (family, key) => LIMITS[family.plan][key];
```

**Aturan gating:**
- **App ortu**: sebelum aksi yang melewati batas → tampilkan upsell (§8), jangan diam-diam gagal.
- **Growth Reward BUKAN bagian dari `grow` flag.** `grow:false` hanya mematikan TD/Gold/FX. Growth Reward
  selalu aktif untuk semua plan. Ini kesalahan gating yang paling mungkin terjadi — cegah eksplisit.
- **App anak (C1)**: render dari **kapabilitas keluarga yang benar-benar aktif**, bukan dari plan.
  Grow tidak muncul di nav anak kalau `!limit(family,'grow')`. **Tidak ada komponen `<ProLock/>` di app anak.**
- **Downgrade tidak relevan** (OTP — tak ada langganan yang berakhir). Tapi lihat §4 guardrail akun kedua
  seandainya nanti ada model versi berbayar.

---

## 4. Akun ortu kedua = Pro — dijual sebagai IDENTITAS, bukan akses

**Masalah yang dihindari:** kalau yang dijual "hak akses", ortu cukup berbagi 1 password → gate bocor 100%,
gratis, dalam 5 detik. Tak bisa ditegakkan. **Solusi: jual kehadiran, bukan izin.**

| | Free (1 akun) | Pro (2 akun personal) |
|---|---|---|
| Ibu bisa approve? | Ya — pakai login yang sama | Ya, dengan akunnya sendiri |
| Anak lihat pengirim | "Parent" | **"Bunda kirim Rp 50.000 · THR"** (penyebutan bisa di-set) |
| Riwayat approve | anonim | tercatat per-ortu |
| Notifikasi | 1 HP | ke HP masing-masing |
| PIN | dibagi | terpisah |

**Spec build:**
- Kolom `sender_id` / `actor_id` di setiap event ledger & request (**ini memang sudah harus ada** — cost ~nol).
- **Penyebutan = free text + saran**, BUKAN dropdown Ayah/Ibu. Ragam Indonesia terlalu banyak
  (Ayah/Bunda, Papa/Mama, Papi/Mami, Abi/Ummi, Babe, Umi...). Field: `parent.displayName` per akun.
- Anak melihat `displayName` di kartu Send money, approval, dan riwayat.
- **Guardrail (untuk model versi-berbayar seandainya kelak dipakai):** akun kedua **tidak pernah dikunci
  keluar** — turunkan ke view-only, jangan hapus. (Di OTP murni ini tak terjadi; catat saja.)

---

## 5. Growth Reward vs Time Deposit — spec (⚠️ SCOPE BUILD BARU)

> **Label kerja di kode: `GROW_REWARD`.** Penamaan produk final ditunda (kandidat: "bunga tabungan").
> **Status build: `[BLOCKED — butuh build]`.** Ini SATU-SATUNYA keputusan di dokumen ini yang menambah
> scope nyata (mekanik + scheduler bulanan + layar rate ortu). Sisanya sebagian besar `if`.

**Konsep (kenapa ada dua-duanya):** Growth Reward mengajarkan *"uang bertambah kalau didiamkan"* (pasif, likuid,
rate kecil). Time Deposit mengajarkan *"aku dapat lebih banyak, asal rela tak menyentuhnya"* (pilihan, terkunci,
rate lebih tinggi). **Growth Reward adalah PENYEBUT yang membuat Deposito punya arti** — tanpa GR, pilihan anak
cuma "dapat sesuatu vs dapat nol", bukan trade-off; anak rasional mengunci semua & Harvest asimetris tak pernah
terasa sebagai harga. Ini juga menutup bug pedagogis: uang diam di Save saat ini menghasilkan **nol**.

| | Growth Reward (`GROW_REWARD`) | Time Deposit (bagian Grow) |
|---|---|---|
| Uang pindah? | Tidak — tetap di Save | Ya — Save → Grow |
| Approval? | Tidak, otomatis | Ya |
| Bisa diambil? | Kapan saja (berhenti tumbuh) | Harvest saat jatuh tempo saja |
| Rate | rendah | lebih tinggi |
| Risiko ortu | terbatas (ada cap) | terbuka (Gold/FX ikut pasar) |
| COGS | **nol** | feed harga |
| Plan | **Free** | Pro |

**Mekanik build:**
1. **Rate ditetapkan ortu** di layar "Your bank rates" (Fase 3 — sudah ada; GR = model lebih sederhana di layar sama).
2. **Tier-aware** (menyelesaikan tegangan "terasa" vs "ruang untuk TD"):
   | Tier | GR rate | TD | Kenapa |
   |---|---|---|---|
   | Little | ~5%/bln (terasa) | — (tak ada Grow) | pelajaran cuma "diamkan → tumbuh" |
   | Middle/Teen | ~1–2%/bln (baseline) | ortu set, **wajib > GR** | pilihan mulai punya harga |
   - Rate **turun** saat naik tier itu FITUR, bukan bug: *"bunganya turun karena sekarang kamu punya pilihan lebih baik"* (persis transisi celengan→bank di dunia nyata).
3. **Aturan tangga (WAJIB):** layar rate ortu menampilkan GR & TD **berdampingan** dan **memperingatkan kalau
   tangga terbalik** (GR ≥ TD → mengunci uang untuk dapat lebih sedikit = tak masuk akal). Terpandu, bukan kotak kosong.
4. **Cap bulanan (WAJIB):** batasi liabilitas ortu. GR strictly lebih aman dari Grow.
5. **Mendarat proporsional ke wallet Save yang menghasilkannya** (bukan ke Someday, bukan ke Unsorted).
   - Kenapa bukan Unsorted: kalau bisa di-Sort ke Spend, pelajaran terbalik jadi "nabung supaya bisa jajan".
   - Invariant Model A aman: ini uang masuk (seperti Send money), tujuan bukan Unsorted.
6. **"Hari Tumbuh"** (mis. tanggal 1): momen perayaan bulanan + alasan buka app yang bukan streak kosong.
7. **Scheduler bulanan** (backlog teknis T — sejajar dgn scheduler harga & reset mingguan). Di mockup: tombol demo
   "▶ Run growth day". Jangan menumpuk klaim retroaktif kalau anak lama tak buka app.
8. **Angka tidak realistis, dan itu disengaja & bisa ditebus:** rate riil (4%/tahun) tak terasa di skala uang anak
   → tak ada pelajaran. GR pakai angka besar; Teen lulus ke Grow yang angkanya riil (feed). "Angka bohong,
   pelajaran benar." Disclose sebagai simulasi.

---

## 6. Rapor Literasi Finansial — spec (formula, bukan LLM)

**Cadence: per semester (2×/tahun), per anak.** Ini menjawab "kapan" & "biaya" sekaligus: tak ada ortu yang mau
laporan harian soal Rp 10.000; cadence semesteran membuat biaya LLM tak masuk pembukuan **bahkan seandainya**
LLM dipakai. Tapi tetap **formula-first** karena tiga alasan yang lebih kuat dari biaya:
(a) halusinasi tentang anak orang = fatal (dokumen ditempel di kulkas); (b) rapor harus **bisa dibandingkan**
antar-semester — LLM tak konsisten, formula konsisten, dan *perbandingan itulah produknya*; (c) rubrik terbuka >
kotak hitam (prinsip Backlog A: "preview hasil, bukan kotak hitam"). **Formula-nya memang lebih pintar.**

**Arsitektur 3 lapis (C3: LLM tak pernah sentuh angka):**

| Lapis | Isi | LLM? |
|---|---|---|
| 1 — Angka | metrik deterministik dari ledger | **tidak pernah** |
| 2 — Skor | rubrik konstanta (threshold) → 5 dimensi + panah tren | **tidak pernah** |
| 3 — Narasi | 2–3 kalimat pembingkai + 1 saran aksi | **template default**; LLM opsional, gagal → jatuh ke template |

**5 dimensi** (sumber metrik: `financial_literacy.md` §7 — tinggal dinamai & di-threshold):

| Dimensi | Diukur dari (Lapis 1) |
|---|---|
| Ketekunan | rata-rata waktu Unsorted → tersortir |
| Kesabaran | jumlah dream di-raid (⭐−15) vs dream selesai |
| Perencanaan | kepatuhan rasio auto-split + dream aktif yang bergerak |
| Kemurahan | rutinitas setoran Give (bukan nominal) |
| Pengetahuan | chapter selesai + rasio Learn→Practice |

**Aturan copy (WAJIB):**
- **Skor tak pernah berdiri sendiri** — selalu berpasangan dgn 1 aksi konkret untuk ortu.
  Contoh: *"Kesabaran 3/5 — Arthur mengambil dari dream 2× semester ini. Coba tanyakan apa yang membuatnya berubah pikiran."*
- **Jangan mempermalukan anak.** Bahasa "yang tumbuh / yang bisa dilatih", bukan nilai C.
- Skor pakai skala tetap (mis. 1–5) + **panah tren** vs semester lalu.

**Catatan:** tempat LLM benar-benar berguna BUKAN rapor, tapi **conversation starter mingguan** (Backlog, kartu
Learning) — personal, bervariasi, dan kalau meleset tak ada yang rusak. Harga per-token terkini:
https://docs.claude.com/en/docs/about-claude/pricing (argumen tak bergantung angka — cadence yang menentukan).

---

## 7. Iklan — inventory sendiri, app ortu saja

**Arsitektur (menyelesaikan legal secara desain):** inventory sendiri, **tanpa SDK pihak ketiga**. Tak ada data
keluar, tak ada behavioral targeting → bebas dari Google Families / Apple Kids / UU PDP soal data anak.
Fokus: **produk internal (paket edukasi/webinar) + hasil kerja sama brand langsung.**
Dengan OTP, ini jawaban kedua untuk lubang revenue front-loaded (bersama paket edukasi).

**C2: NOL slot di app anak.** Satu iklan di sisi anak memicu review Kids/Families + membunuh premis.

**Slot yang boleh (app ortu saja):**
| Slot | Lokasi | Kenapa aman |
|---|---|---|
| P1 | Dashboard, bawah lipatan | jauh dari keputusan uang |
| P2 | **Setelah cash-out di-approve** | ortu **sudah pasti** akan membeli barang itu → layanan, bukan bujukan. Slot paling bernilai. |
| P3 | Learning Center / artikel | konten-adjacent, wajar |
| P4 | Rapor — **hanya bagian "langkah berikutnya"** | rapor = dokumen sakral. Boleh rekomendasi paket edukasi; **tak boleh** banner brand. |

**Daftar-tidak (tulis SEKARANG, selagi belum lapar):**
- ✅ **Selaras:** bank/rekening pelajar (SimPel, Jago, Blu), Pegadaian/emas mikro, buku & alat sekolah, produk edukasi sendiri.
- ❌ **Tidak pernah:** top-up game & voucher, paylater/pinjol, judi (termasuk berkedok game), makanan/mainan
  yang menyasar anak, apa pun yang menargetkan *anak* lewat mata ortu.
- **Aturan pengunci:** daftar ✅ ≈ persis daftar musuh di Pilar C kurikulum. **Tak boleh** mengajari bahaya
  pinjol di satu layar lalu menerima uang pinjol di layar sebelahnya.

**Pro = bebas iklan brand** (rekomendasi produk internal tetap muncul — Pro user justru pembeli terbaik paket edukasi).

---

## 8. Paywall & momen upsell

- **Harga: one-time Rp 399.000.** Framing: **"Sekali bayar. Dari KG B sampai Grade 9."**
  (Rp 399k ÷ 9 tahun ≈ **Rp 3.700/bln** — di bawah jajan sekali. Subscription tak bisa ucapkan kalimat ini.)
- **Momen paywall terbaik: SETELAH Sort pertama berhasil** — saat ortu pertama kali melihat anaknya
  *benar-benar memikirkan uangnya*. Puncak emosi produk. Bukan saat onboarding.
- **Upsell kontekstual** (semua di app ortu, C1): saat menabrak batas (dream ke-2, job ke-4, mau buka Grow,
  mau tambah anak, mau rapor). Selalu tunjukkan value, jangan gagal diam-diam.
- **Pembayaran (RISIKO EKSEKUSI TERBESAR):** banyak ortu ID tak punya kartu di App Store. **QRIS / GoPay /
  transfer bank via checkout web bukan opsional.** Perlu riset serius sebelum harga & flow dikunci.

---

## 9. Ringkasan keputusan (audit trail)

| # | Keputusan | |
|---|---|---|
| 1 | One-time payment Rp 399.000, "KG B → Grade 9" | ✅ |
| 2 | 2 akun ortu personal + penyebutan free-text = Pro (jual identitas, bukan akses) | ✅ |
| 3 | Grow (TD/Gold/Forex + Harvest) = Pro | ✅ |
| 4 | Web + Rapor Literasi Finansial = Pro | ✅ |
| 5 | Jobs/Prizes: template Free, custom builder Pro | ✅ |
| 6 | Free 1 anak · Pro ≤4, satu harga | ✅ |
| 7 | Growth Reward Free — penyebut untuk TD, tier-aware, tangga dijaga `[BLOCKED — butuh build]` | ✅ |
| 8 | Rapor = formula/rubrik; LLM maksimal lapis 3 | ✅ |
| 9 | Iklan house/brand, app ortu saja, 4 slot + daftar-tidak; Pro bebas iklan brand | ✅ |

**Ditunda ke backlog (bukan dibuang):** Family Circle (undang keluarga besar), B2B sekolah, OTP berbasis versi,
paket edukasi/webinar sebagai mesin revenue berulang, affiliate versi "fulfilment ortu saja".
