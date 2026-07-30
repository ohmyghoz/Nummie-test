# Nummi

Aplikasi *Parent as Banking* untuk anak KG B – Grade 9. Anak belajar memakai, menyimpan, berbagi,
dan mengelola uangnya. **Tidak ada uang riil yang bergerak di dalam app** — saldo adalah
representasi komitmen antara orang tua dan anak, diselesaikan di dunia nyata.

Tagline: *Uang kecil, kebiasaan besar.*

---

## Status

**S0 selesai — repo terbentuk.** Belum ada baris kode aplikasi.
Tahap berikutnya: `packages/core` → skema Supabase → console tipis → app anak → app ortu HP.

Peta jalan lengkap ada di `docs/nummi-status.md`. Semua keputusan produk ada di `docs/decisions/`.

## Struktur

| Folder | Isi |
|---|---|
| `docs/` | sumber kebenaran: status, handoff, backlog, brand, design system, kurikulum |
| `docs/decisions/` | ADR — keputusan terkunci & keputusan yang masih terbuka |
| `legacy/` | 5 mockup HTML asli. **Dibekukan.** Referensi visual, bukan sumber kebenaran |
| `packages/core/` | mesin TypeScript murni: ledger, invariant, split, rules, format, seed |
| `apps/kid/` | app anak — responsif HP + iPad |
| `apps/parent/` | app ortu — responsif HP + web |
| `apps/console/` | console admin — operator, lintas keluarga |
| `copy/` | seluruh string UI (`id.ts` · `en.ts`) |
| `supabase/` | migrasi SQL + row-level security |

## Menjalankan mockup lama

`legacy/` berisi lima berkas HTML yang berdiri sendiri. **Buka langsung di browser** — sejak
30 Juli 2026 mereka tidak lagi ikut ter-deploy. `vercel.json` di root dulu menyetel
`outputDirectory: "legacy"`, sisa dari S0.5; kalau repo root diimpor ke Vercel yang terbit adalah
lima mockup beku, bukan app. Berkasnya dihapus (ada di riwayat git, `b2a40b5`).

| Berkas | Permukaan |
|---|---|
| `legacy/kid-mobile.html` | anak, HP |
| `legacy/kid-ipad.html` | anak, iPad |
| `legacy/parent-mobile.html` | ortu, HP |
| `legacy/parent-web.html` | ortu, web |
| `legacy/console.html` | admin |

## Melanjutkan di Claude Code

```bash
cd nummi
claude
```

`CLAUDE.md` terbaca otomatis. Kalimat pembuka yang disarankan:

> Lanjutan proyek Nummi. Baca `CLAUDE.md` lalu `docs/nummi-status.md`. Kita lanjut ke [X].

## Deploy

**PWA di Vercel** (ADR-0019 menjawab D4 untuk MVP). Langkah lengkapnya —
tiga project, Root Directory, env, dan jebakan yang sudah ditemukan — ada di
[`docs/DEPLOY.md`](docs/DEPLOY.md).

Ringkasnya: **dua** project (`apps/kid`, `apps/parent`). **Console tidak ikut** — ia membaca
service role lintas keluarga (ADR-0015).

## Lisensi

Proprietary. Merek **Nummi** sudah dicek bebas di PDKI. Repo privat.
