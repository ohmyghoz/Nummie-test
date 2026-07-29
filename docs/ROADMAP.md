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

Database berdiri, terbukti benar, dan **anak sudah bisa login** — tapi **belum ada satu pun app yang
menyentuhnya**; ketiganya masih membaca `lib/data.ts`. Jadi urutan berikutnya bukan "bangun permukaan
baru", melainkan **menyambungkan permukaan yang sudah ada**:

1. **Klien Supabase + `.env`** di `apps/kid` & `apps/parent`.
2. **Layar login anak** — ini permukaan yang belum pernah dibangun, dan `child-login` menuntut
   `childId`, bukan cuma kode keluarga + PIN. Artinya perlu langkah "pilih anak" lebih dulu, dan
   daftar anak per kode keluarga belum punya jalur baca yang sah (RLS menuntut token yang justru
   belum ada). **Ini keputusan desain, bukan pekerjaan mekanis** — lihat backlog U-7.
3. **Tukar `lib/data.ts` → query nyata**, permukaan demi permukaan, dimulai dari yang menutup
   siklus uang (Home/saldo → Sort → Requests → approval ortu).

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
