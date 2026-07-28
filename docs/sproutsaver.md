# Sprout Saver — Peta Flow & Arsitektur Informasi

> **Catatan sumber & keterbatasan**
> Dokumen ini disusun dari halaman resmi Sprout Saver yang dapat diakses publik:
> `/` (homepage), `/features/child-app`, `/features/parent-app`, `/features/learning`.
> URL `/child` yang diminta ter-*redirect* ke homepage; halaman *in-app* yang sebenarnya
> berada di balik login sehingga **tidak bisa diakses**. Karena itu dokumen ini adalah
> **rekonstruksi flow & information architecture berdasarkan deskripsi fitur resmi**,
> bukan pemetaan pixel-per-pixel dari layar aplikasi. Nama layar/urutan komponen adalah
> inferensi wajar dari deskripsi, bukan kutipan struktur navigasi final mereka.

---

## 1. Positioning Produk (untuk konteks)

- **Tagline inti:** "The money system before a debit card" — sistem uang keluarga sebelum kartu debit.
- **Rentang usia:** 6–16 tahun; *sweet spot* 8–13.
- **Prinsip uang:** **tidak ada uang riil yang bergerak di dalam app.** Saldo di app adalah *representasi* komitmen antara orang tua & anak. Payout dunia nyata dilakukan orang tua secara terpisah. (Ini identik dengan konsep kamu.)
- **Empat pilar aktivitas:** Earn (allowance + chores) → Sort (jars) → Save/Commit (goals + vaults) → Request (approval orang tua) — dibungkus lapisan **Learn** (lessons) dan **Reward** (gamifikasi).

---

## 2. Model Mental Inti: 3 Jars

Sprout Saver **tidak** memakai istilah "wallet" atau "pocket". Mereka memakai metafora **jar (toples)** dengan hanya **3 kategori tetap**:

| Jar | Fungsi | Framing ke anak |
|-----|--------|-----------------|
| **Save** | Uang untuk tujuan masa depan & pertumbuhan jangka panjang | "Sebagian uang itu untuk nanti, bukan sekarang." |
| **Spend** | Uang untuk keinginan sehari-hari & pilihan jangka pendek | "Latihan memutuskan: layak dibeli sekarang atau bisa menunggu?" |
| **Give** | Uang untuk amal, hadiah, kebaikan | "Berbagi adalah bagian dari identitas finansial yang sehat." |

**Poin desain penting:**
- Jar bersifat **fixed (3 kategori)** — bukan folder bebas tak terbatas. Ini mengurangi *decision paralysis* untuk anak.
- Setiap jar punya **animated balance** (saldo bergerak real-time saat uang berpindah) dan **history transaksi per-jar**.
- **Goals & Vaults hidup DI DALAM jar Save**, bukan kategori sejajar. Ini kunci untuk pertanyaan "biar tidak rancu" (lihat §9).

---

## 3. Konsep "Unallocated" — jantung UX-nya

Ini fitur paling penting untuk dicontek. Ketika uang baru masuk (allowance/chore/hadiah), uang **tidak langsung masuk ke jar mana pun**. Ia mendarat sebagai **Unallocated balance** dan **memicu prompt** ke anak: "Uang baru datang — mau taruh berapa di Save, Spend, Give?"

- **Purpose comes before use** — anak dipaksa memberi "pekerjaan" pada setiap rupiah sebelum dipakai.
- Orang tua bisa set **default split ratio** (mis. 50/30/20) supaya income *auto-route*, **atau** membiarkan anak melakukan split manual tiap kali sebagai latihan.
- Anak boleh **memindahkan uang antar-jar kapan saja** (transfer freedom) → mendorong *active decision-making*.

---

## 4. Peta Halaman & Flow — CHILD APP

### 4.1 Home (child)
Komponen yang disebutkan/tersirat di layar utama anak:
- **Animated jar balances** (Save / Spend / Give) — visual utama.
- **Unallocated balance prompt** bila ada uang yang belum disortir (call-to-action menonjol).
- **Active savings goals** dengan progress bar.
- **Daily mission prompt** (satu next-action yang dipersonalisasi).
- **Avatar & rewards** (Saver Stars, badge, streak).

### 4.2 Jar Detail
- Saldo jar + **history transaksi khusus jar itu**.
- Aksi: transfer ke jar lain, alokasikan ke goal/vault (khusus Save).

### 4.3 Sort / Allocate Flow (dari Unallocated)
- Dipicu saat income masuk.
- Anak membagi ke 3 jar (manual) atau menerima auto-split (default ratio).

### 4.4 Savings Goals (di dalam Save)
- Buat goal bernama: **target amount + deadline opsional + ikon kustom**.
- **Progress bar** menunjukkan kedekatan ke target.
- **Auto-allocation**: income bisa diarahkan otomatis ke goal.
- **Lifecycle lengkap:** Active → Achieved → Fulfilled.
- **Cancel goal** → uang kembali ke jar sumber.

### 4.5 Vaults (di dalam Save)
- **Mengunci uang** untuk durasi tertentu ATAU sampai sebuah goal tercapai.
- **Early release** butuh *alasan* + *approval orang tua* → jadi momen diskusi, bukan penalti.
- Menyelesaikan periode penguncian → dapat **Saver Stars**.
- Tujuan pedagogis: melatih **kesabaran / delayed gratification**.

### 4.6 Allowance (received)
- Uang saku otomatis dengan **cadence** (harian/mingguan) yang bisa dikonfigurasi orang tua.
- Bisa **auto-split** ke jar, atau mendarat sebagai Unallocated untuk latihan sorting.
- **Notifikasi payday** membuat momen "gajian" terlihat & actionable.

### 4.7 Chores & Earning
- Anak melihat daftar chore tersedia.
- Menyelesaikan chore + **foto bukti opsional** → submit untuk review orang tua.
- Reward bisa **fixed atau variabel**.
- Earning yang disetujui masuk mengikuti *money rules* anak (jar/goal yang sama).

### 4.8 Cashout / Redemption Request
- Saat anak mau **menarik uang, menebus goal, atau berdonasi** → submit **request** ke orang tua **beserta konteks**.
- **Cooldown opsional** untuk jumlah besar (jeda anti-impulsif).
- Melacak **merchant, cost, receipt**.
- **Riwayat pembayaran lengkap** untuk mengurangi kebingungan di kemudian hari.
- Flow status: Requested → Approved/Declined → Fulfilled → Tracked.

### 4.9 Growth Rewards (bunga simulasi)
- Reward bulanan yang dikontrol orang tua: uang yang tetap tersimpan **bertambah seiring waktu**.
- **Selalu masuk ke jar Save** → memperkuat kebiasaan menabung.
- Ada **rate & balance cap** per anak.

### 4.10 Missions
- **Prompt next-step harian** yang dipersonalisasi (mis. "sortir uang barumu", "selesaikan chore", "lanjutkan langkah goal").
- Tujuan: menarik anak kembali dengan *purpose*, bukan scrolling.

### 4.11 Reward Layer (gamifikasi)
- **Saver Stars:** mata uang virtual, **hanya bisa didapat** dari menabung/belajar/konsistensi — **tidak bisa dibeli dengan uang riil**.
- **Badges & Streaks:** 30+ badge; streak dengan bonus meningkat di **hari ke-7, 14, 30**.
- **Avatar & Shop:** karakter 3D dengan 844+ item kosmetik di 10 kategori; **semua item earned**, bukan dibeli.
- **Loop-nya:** menabung → dapat Star → buka kosmetik avatar → keinginan buka item mendorong lebih banyak menabung. (Reward selalu mengarah ke perilaku positif.)

### 4.12 Learning (di app yang sama)
- 190+ lesson, 6 format (Video Instructor, Visual Storybook, Decision Story, Group Chat Simulation, Games & Sims).
- 11 topik (Money Basics → Investing, Credit & Debt, Giving, dst.), **dikurasi per usia**.
- **Companion characters** (Chip, Nova, Sage, Jinx, Ash…) yang masing-masing mengajarkan *mindset* uang berbeda.
- Prinsip: **learn-then-practice** — pelajaran langsung terhubung ke jar/goal/vault milik anak sendiri.

---

## 5. The Daily Habit Loop (6 langkah — konsep pengikat)

Ini "mesin" retensi mereka. Anak tidak harus melewati semua tiap hari, tapi seiring waktu uang jadi *sistem pilihan*:

1. **Earn** — allowance terjadwal / chore disetujui (uang masuk dengan sumber jelas).
2. **Sort** — uang baru = Unallocated → dibagi ke Save/Spend/Give (purpose sebelum use).
3. **Commit** — uang bergerak ke goal bernama atau vault (kaitkan menahan diri ke hasil masa depan).
4. **Request** — mau spend/redeem/donate → submit request → orang tua approve/diskusi.
5. **Learn** — lesson/mission/game memperkuat perilaku yang sama.
6. **Reflect** — progress bar, streak, badge, history bikin pilihan terlihat.

---

## 6. Peta Halaman & Flow — PARENT APP

### 6.1 Parent Dashboard
- **Household snapshot**: saldo, pending actions, progress signal, snapshot tiap anak dalam satu "command center".
- Fokus: "apa yang butuh perhatian saya sekarang".

### 6.2 Unified Inbox (Approvals)
- **Satu antrean** untuk semua jenis request: chores, cashouts/withdrawals, donations, vault release.
- Tiap item disertai **konteks penuh**; bisa difilter per tipe/urgensi.

### 6.3 Family Controls (Rules per anak)
- Atur **allowance cadence**, **default split Save/Spend/Give**, savings/growth settings, dan *approval guardrails*.
- Setting berbeda per anak sesuai usia & kematangan.
- **PIN-protected**; dukungan **multi-parent** (multiple parents, shared visibility).

### 6.4 Fulfill & Track Payout
- Ubah status request **Approved → Fulfilled** dengan catatan, records, history.
- Payout dunia nyata (transfer e-wallet, beli langsung, cash) dilakukan **di luar app**, lalu ditandai fulfilled.

### 6.5 Insights & Coaching
- **Trend views**: pola menabung, spending, penyelesaian chore.
- Tujuan: "coach behavior, not just balances" — bahan diskusi, bukan ceramah.

### Weekly Parent Workflow (ringkas)
Set rules → uang masuk terarah → review requests di inbox → fulfill & track → coach dengan data tren → ulangi mingguan.

---

## 7. Alur End-to-End Lintas Interface (pemetaan ke konsepmu)

```
[ORANG TUA]                         [ANAK]
  set allowance & split default  →  terima income → Unallocated
  (atau kirim hadiah manual)         │
                                     ▼
                              Sort ke Save / Spend / Give
                                     │
                        ┌────────────┼─────────────┐
                        ▼            ▼             ▼
                     Goals        (pakai)        Give
                     Vaults                       │
                        │                         ▼
                        ▼                  Request donasi ──┐
                 Request redeem ───────────────────────────┤
  cashout request (+ alasan) ◄── Request cashout ──────────┘
        │
        ▼
  Approve/Discuss di Unified Inbox
        │
        ▼
  Fulfill di dunia nyata (transfer GoPay/OVO / beli langsung / cash)
        │
        ▼
  Tandai Fulfilled + catat receipt → history
```

---

## 8. Glosarium Istilah Sprout Saver (untuk perbandingan terminologi)

| Istilah mereka | Arti | Padanan di konsepmu |
|---|---|---|
| **Jar** | Kategori uang (Save/Spend/Give) | "wallet"/"pocket"/kategori |
| **Unallocated** | Uang yang belum disortir | (belum ada di konsepmu — layak diadopsi) |
| **Goal** | Target tabungan bernama | "life goals" |
| **Vault** | Kunci uang untuk latihan sabar | (belum ada) |
| **Allowance** | Uang saku terjadwal | uang saku |
| **Chore** | Tugas berbayar | (opsional) |
| **Cashout / Redemption** | Penarikan/penukaran (butuh approval) | "request penarikan dana" |
| **Growth Reward** | Bunga simulasi (masuk Save) | "investasi" (versi paling sederhana) |
| **Saver Stars** | Mata uang gamifikasi (earned) | reward gamification |
| **Mission** | Next-action harian | (belum ada) |

---

## 9. Insight Kunci untuk Produkmu

1. **Mereka menahan diri hanya pakai 3 jar tetap, bukan folder bebas.** Semakin sedikit kategori level-atas, semakin sedikit anak bingung. "Spend/Save/Invest/Sedekah"-mu = 4 jar; masih dalam batas aman selama sub-wallet ada di *dalamnya*, bukan sejajar.

2. **Goals & Vaults ada DI DALAM jar Save.** Ini cara mereka mencegah kerancuan "total uang vs saldo": Save bukan angka terpisah, melainkan payung yang berisi goals. Anak melihat *hierarki*, bukan banyak saldo sejajar yang membingungkan.

3. **"Unallocated" adalah mekanik terbaik untuk dicontek** — memisahkan "uang masuk" dari "uang yang sudah punya tujuan" menyelesaikan sebagian besar masalah kerancuan saldo secara desain, bukan sekadar label.

4. **Tidak ada uang riil bergerak; app = ledger kepercayaan.** Sama persis dengan modelmu (orang tua sebagai bank, payout terpisah). Ini menyederhanakan compliance & keamanan drastis.

5. **Gamifikasi selalu mengarah ke perilaku baik** (Star hanya bisa di-*earn*, tak bisa dibeli). Prinsip ini menjaga app dari jadi "mesin adiktif".
