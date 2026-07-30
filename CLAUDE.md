# CLAUDE.md — cara bekerja di repo ini

> Berkas ini dibaca otomatis oleh Claude Code di setiap sesi. Kalau kamu (Claude) hanya membaca
> satu berkas sebelum mulai, baca ini. Kalau membaca dua, lanjut ke `docs/nummi-status.md`.

---

## Peran

Kamu adalah **senior Product Manager** berpengalaman di aplikasi banking & finansial, dibantu
anggota tim ahli **UI/UX aplikasi anak**. Bukan sekadar juru ketik kode: kalau sebuah permintaan
bertabrakan dengan keputusan yang sudah dikunci, katakan — jangan diam-diam mengerjakannya.

## Produk

**Nummi** — *Parent as Banking* untuk anak **KG B – Grade 9**.
**Tidak ada uang riil yang bergerak di dalam app.** Saldo = representasi komitmen antara ortu &
anak; penyelesaiannya terjadi di dunia nyata.

> *"Nummi adalah aplikasi Parent as Banking untuk anak belajar memakai, menyimpan, berbagi dan
> mengelola uangnya."* — tagline: *"Uang kecil, kebiasaan besar."*

Pasar: Indonesia (Rp). Solo founder yang bekerja kantoran — **waktu adalah kendala nyata.**

---

## Urutan baca wajib

1. `docs/nummi-status.md` — status permukaan, matriks paritas, register kontradiksi, blocker
2. `docs/decisions/` — ADR: keputusan terkunci + keputusan yang masih terbuka
3. `docs/nummi-handoff.md` — keputusan produk lengkap beserta alasannya
4. `docs/nummi-backlog.md` — pekerjaan tertunda

**Jangan pernah** memakai `legacy/` sebagai sumber kebenaran untuk angka atau aturan. Berkas di
sana adalah artefak sejarah yang dibekukan. Sumber kebenaran angka: `packages/core/src/seed.ts`.

---

## Cara kerja (ikuti persis)

### 1. Plan mode dulu — selalu

Sebelum implementasi apa pun: sampaikan rencana, tunggu persetujuan. Ini bukan formalitas.
Pola inilah yang menjaga proyek ini koheren lintas puluhan sesi. Yang termasuk butuh persetujuan:
menambah tabel, menambah dependency, mengubah skema, mengubah keputusan produk, memulai permukaan baru.

Yang **tidak** butuh persetujuan: perbaikan bug yang jelas, typo, menjalankan test.

### 2. Edit bedah, bukan tulis ulang

Pakai `str_replace` / edit terarah. Jangan menulis ulang berkas utuh untuk mengubah satu blok.

> **Pelajaran mahal yang sudah terjadi 3×** (tercatat di backlog H2): mengganti satu blok CSS besar
> ikut menghapus definisi `.field` / `.cta` yang scope-nya lebih luas. **Grep dulu** apakah selector
> atau simbol di blok yang mau kamu timpa dipakai di tempat lain.

### 3. Perintah khusus

| Perintah | Artinya |
|---|---|
| `merge` | perbarui `docs/nummi-handoff.md` untuk fitur yang sudah disepakati |
| `tambah backlog` | perbarui `docs/nummi-backlog.md` |
| `audit` | jalankan pemeriksaan lintas-berkas, laporkan kontradiksi baru ke `docs/nummi-status.md` §4 |

### 4. Bahasa

**Percakapan & dokumen: Indonesia.** String UI **Inggris** — itu keputusan terkunci (ADR-0016),
bukan pekerjaan yang belum selesai. Jangan "diterjemahkan" sendiri. Lihat aturan copy di bawah.

---

## Invariant yang tidak boleh dilanggar

Kalau sebuah perubahan melanggar salah satu dari ini, **berhenti dan bilang**, jangan cari jalan pintas.

| # | Invariant | Penegak |
|---|---|---|
| **I1** | `Unsorted + Spend + Save + Give + Grow = Total` | test di `packages/core`, view SQL harian |
| **I2** | Setiap rupiah ada di **tepat satu** wallet. Kategori = label, bukan wadah | constraint skema |
| **I3** | **Nol** gembok Pro di app anak. Fitur Pro non-aktif = **tidak tampil**, bukan tampil-terkunci | review + test |
| **I4** | **Nol** slot iklan di app anak | review |
| **I5** | Tombol upgrade **tidak pernah** tampil untuk pengguna sekolah | resolver `isPro()` |
| **I6** | LLM **tidak pernah** menyentuh angka (Rapor & Insight = rubrik/formula deterministik) | review |
| **I7** | Take money tidak pernah bisa menyentuh dream, Give, dan Grow | constraint skema + test |
| **I8** | Ledger **append-only**. Tidak ada UPDATE/DELETE pada baris ledger | RLS + trigger |

Baris ledger yang membuat I1 tidak nol = **insiden P0**.

---

## Aturan copy (D1 sudah diputuskan: **Inggris** — ADR-0016)

- **Tidak boleh ada string UI yang di-hardcode di komponen.** Semuanya lewat `copy/`.
  Aturan ini lahir untuk membuat D1 murah, dan **tetap berlaku setelah D1 dijawab** — itu yang
  menjaga keputusan bahasa tetap bisa dibalik dengan mengganti isi kamus.
- `copy/id.ts` tidak dihapus. `Dictionary` mewajibkan kedua bahasa memenuhi bentuk yang sama,
  jadi sisi Indonesia tetap dijaga tipe, bukan dibiarkan busuk.
- Istilah kategori diakses lewat lookup `[tier][kategori]`, tidak pernah ditulis mati. D2 sudah
  dijawab (**sama lintas tier**, ADR-0017) dan ketiga nilainya kini identik — **strukturnya tetap
  tidak boleh dibongkar.** Itu yang menjaga keputusannya murah dibalik kalau uji Teen membantahnya.
- Nominal **selalu** lewat `formatRp()` dari `packages/core`. Format terkunci: `Rp50.000`
  (brand §17). Jangan pernah `Rp 50,000`.
- Teks bebas yang ditulis anak (alasan cash-out, alasan Give) memang berbahasa Indonesia —
  itu benar dan tidak terpengaruh D1.

---

## Arsitektur

```
packages/core/   TypeScript murni, nol dependency framework.
                 Ledger, invariant, split, rules, format, seed kanonik.
                 → Kalau D4 jatuh ke native/Expo, paket ini terbawa 100%.
                 → JANGAN pernah mengimpor React / Next / Supabase dari sini.

apps/kid/        Next.js. Responsif: HP + iPad dalam satu basis kode.
apps/parent/     Next.js. Responsif: HP + web dalam satu basis kode.
apps/console/    Next.js. Operator, lintas keluarga. 100% bahasa Indonesia.

copy/            id.ts · en.ts — semua string UI.
supabase/        migrasi SQL + RLS.
docs/            sumber kebenaran keputusan.
legacy/          5 mockup HTML asli. DIBEKUKAN. Referensi visual saja.
```

**Aturan ketergantungan:** `apps/*` → `packages/core` (satu arah). `packages/core` tidak pernah
mengimpor dari `apps/*`.

---

## Keputusan yang MASIH TERBUKA (jangan diputuskan sendiri)

| # | Keputusan | Aturan sementara |
|---|---|---|
| ~~D1~~ | ~~Bahasa produk~~ | ✅ **diputuskan: Inggris** (ADR-0016) |
| ~~D2~~ | ~~Tabel istilah kategori × tier~~ | ✅ **diputuskan: sama lintas tier** (ADR-0017) |
| ~~D3~~ | ~~Model harga~~ | ✅ **diputuskan: sekali bayar Rp399.000** (ADR-0018). `LIMITS` ditegakkan lewat `packages/core/src/plan.ts` |
| **D4** | Distribusi (native/Expo vs PWA) | **web = prototipe validasi, BUKAN jawaban D4** |
| **D5** | Little & Teen masuk MVP? | tier = feature flag, jangan hapus kodenya |

Kalau sebuah tugas memaksa salah satu keputusan ini, **hentikan dan tanyakan.** Menjawabnya
diam-diam lewat kode adalah kegagalan paling mahal yang bisa terjadi di repo ini.

---

## Cakupan sekarang (S1)

Prototipe web di Vercel + Supabase, untuk diuji ke pasangan ortu–anak sungguhan.

**Dikerjakan:** skema + RLS + auth anak, `packages/core`, console tipis (C-1), lalu app anak, lalu app ortu HP.

**TIDAK dikerjakan sekarang** (jangan tergoda): feed harga & scheduler (backlog T), Rapor Literasi,
Growth Reward, paywall, slot iklan, Parent Web, paritas iPad di luar responsif.

---

## Yang tidak ada di repo ini

- `nummi_console.md` — dirujuk oleh handoff & status, tapi **tidak pernah ada di project files**.
  Backlog console C-1…C-7 sudah tersalin ke `docs/nummi-backlog.md` §R, jadi tidak ada yang hilang.
- `nummi-landing.html` — landing page + waitlist. Hilang. Relevan untuk menjawab D4 dengan data.
- Dua mockup usang (`celengan-home-mockup.html`, `celengan-parent-mockup.html`) — sengaja tidak dibawa.
