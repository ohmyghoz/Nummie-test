# Peta jalan — S0 sampai S3

Estimasi di bawah adalah **akhir pekan**, bukan hari kerja penuh. Ghozy pegawai kantoran;
peta jalan yang berpura-pura sebaliknya tidak berguna.

| Tahap | Isi | Perkiraan | Status |
|---|---|---|---|
| **S0** | Repo, `CLAUDE.md`, ADR, arsip lima mockup | ½ hari | ✅ selesai |
| **S0.5** | Lima mockup lama live di Vercel apa adanya | 1 jam | ⏳ tinggal push |
| **S1a** | `packages/core` — ledger, invariant, split, rules, format, seed | 1–2 akhir pekan | ✅ **172 test hijau** — + requests (ADR-0002), economy (ADR-0004), sort, move, give, grow, parent, settings, onboarding, jobs, transactions |
| **S1b** | Skema Supabase + RLS + auth anak | 2–3 akhir pekan | ✅ **selesai** — migrasi 0001–0006 jalan, seed kanonik masuk, isolasi RLS diuji per-role, dan **login anak hidup**: kode keluarga + PIN → token → `wallet_balances` mengembalikan 11 baris / **Rp484.711**, cocok dengan `packages/core` |
| **S1c** | Console tipis di atas data nyata (C-1) | 1 akhir pekan | ✅ dibangun di atas seed kanonik; tinggal ditukar ke view saat S1b jalan |
| **S2** | App anak, responsif HP + iPad, Fase 6 ditegakkan | 3–4 akhir pekan | 🟢 **semua permukaan berdiri**, nav kanonik (Home/Wallets/(+)/Missions/Me): Sort · Move · Give (+cerita) · Grow/Harvest · Requests · Missions · Me. Fase 6 ditegakkan. Belum: isi pelajaran (kuis), Prizes/Jobs, Forex per-mata-uang. **Belum persisten** — semua flow berhenti di "menunggu orang tua" sampai S1b jalan |
| **S3** | App ortu **HP saja** (web ditunda) | 3–4 akhir pekan | 🟡 **siklus uang bisa ditutup**: Dashboard · **approval inbox 5-jalur** · Send · Take · Money rules · **Settings** (uang saku, bunga bank, harga, investasi) · **Add a child** · **Jobs & Prizes** · **Transactions**. Belum: Insight · Learning tracker. **Belum persisten** sampai S1b |

Totalnya sekitar **tiga bulan akhir pekan** sampai ketiga permukaan jalan di atas data nyata.

## Yang tersisa setelah S1b selesai (29 Juli 2026)

Database berdiri, terbukti benar, dan **app anak sudah tersambung untuk membaca**. `apps/parent`
dan `apps/console` masih membaca `lib/data.ts`. Urutan berikutnya bukan "bangun permukaan baru",
melainkan **menyambungkan permukaan yang sudah ada**:

1. ~~Klien Supabase + `.env` + layar login anak + tukar `lib/data.ts`~~ ✅ **selesai untuk
   `apps/kid` (irisan 1, baca-saja)**: anak masuk dengan kode keluarga + PIN, dan Home/Wallets/
   Sort/Requests menampilkan angka dari database. Grow & Missions masih setengah demo — lihat
   `apps/kid/README.md`.
2. **Irisan 2 — menulis ledger.** Sort, Move, Give, dan Grow masih berhenti di "menunggu orang
   tua". Ini yang pertama kali menyentuh ADR-0014 (append-only) dari sisi aplikasi.
3. ~~**Irisan 3 — app ortu.**~~ 🟢 **Potongan penutup-siklus selesai 30 Juli 2026.** Login ortu,
   pembacaan nyata, dan approval inbox yang menulis ledger. **Siklus uang sudah pernah tutup utuh
   sekali**: anak mengajukan → ortu memutuskan → uang bergerak → anak melihat ceritanya.
   Send · Take · Money rules · Add a child ikut menulis, sesi ortu diperbarui otomatis (U-11),
   dan **console tersambung** lintas keluarga sebagai permukaan baca-saja dengan pemeriksaan
   silang core-vs-database. Sisa: Settings & Jobs/Prizes — **belum punya tabel**, bukan belum
   disambungkan (U-12/U-13), dan "Add money to Grow" di app anak butuh aturan produk baru (U-14).

Konsol (S1c) sengaja terakhir: ia memakai service role dan tidak memblokir uji ortu–anak.

## Yang sengaja TIDAK dikerjakan di S1–S3

Feed harga & scheduler harian (backlog T) · scheduler reset mingguan · Rapor Literasi Finansial ·
Growth Reward · paywall & entitlement UI · slot iklan · Parent Web · paritas iPad di luar responsif.

Semuanya punya alasan yang sama: tidak satu pun dibutuhkan untuk menjawab pertanyaan yang membuat
prototipe ini ada — **apakah pasangan ortu–anak sungguhan benar-benar memakai siklus uangnya
sampai tutup.**

## Urutan ini bisa berubah oleh satu hal

Kalau D1 (bahasa) diputuskan ke Indonesia sebelum S2 dimulai, kerjakan penerjemahan **sebelum**
app anak dibangun, bukan sesudah. Di kamus, itu satu sesi. Di dua basis kode UI yang sudah jadi,
itu berhari-hari.
