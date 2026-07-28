# Peta jalan — S0 sampai S3

Estimasi di bawah adalah **akhir pekan**, bukan hari kerja penuh. Ghozy pegawai kantoran;
peta jalan yang berpura-pura sebaliknya tidak berguna.

| Tahap | Isi | Perkiraan | Status |
|---|---|---|---|
| **S0** | Repo, `CLAUDE.md`, ADR, arsip lima mockup | ½ hari | ✅ selesai |
| **S0.5** | Lima mockup lama live di Vercel apa adanya | 1 jam | ⏳ tinggal push |
| **S1a** | `packages/core` — ledger, invariant, split, rules, format, seed | 1–2 akhir pekan | ✅ **69 test hijau** — + requests (ADR-0002), economy (ADR-0004), sort |
| **S1b** | Skema Supabase + RLS + auth anak | 2–3 akhir pekan | 🟡 migrasi, RLS, Edge Function & `seed.sql` siap — **belum dijalankan** (menunggu project Supabase) |
| **S1c** | Console tipis di atas data nyata (C-1) | 1 akhir pekan | ✅ dibangun di atas seed kanonik; tinggal ditukar ke view saat S1b jalan |
| **S2** | App anak, responsif HP + iPad, Fase 6 ditegakkan | 3–4 akhir pekan | 🟢 **semua permukaan berdiri**, nav kanonik (Home/Wallets/(+)/Missions/Me): Sort · Move · Give (+cerita) · Grow/Harvest · Requests · Missions · Me. Fase 6 ditegakkan. Belum: isi pelajaran (kuis), Prizes/Jobs, Forex per-mata-uang. **Belum persisten** — semua flow berhenti di "menunggu orang tua" sampai S1b jalan |
| **S3** | App ortu **HP saja** (web ditunda) | 3–4 akhir pekan | 🟡 **siklus uang bisa ditutup**: Dashboard · **approval inbox 5-jalur** · Send · Take · Money rules · **Settings** (uang saku, bunga bank, harga, investasi) · **Add a child** · **Jobs & Prizes**. Belum: Insight · Transactions · Learning tracker. **Belum persisten** sampai S1b |

Totalnya sekitar **tiga bulan akhir pekan** sampai ketiga permukaan jalan di atas data nyata.

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
