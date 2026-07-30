# apps/parent — app ortu

Responsif: **HP + web dalam satu basis kode.**

**Cakupan S3 dipersempit ke ortu HP dulu** (keputusan 28 Juli 2026). Halaman Insight versi web
adalah permukaan paling berat dan paling tidak mendesak untuk validasi — ia menunggu.

Referensi visual: `legacy/parent-mobile.html`, `legacy/parent-web.html`.

## Status: irisan penutup-siklus sudah dibangun

```
npm install
npm run parent:dev     # http://localhost:3200
npm run parent:build
```

**Sudah ada:** Dashboard (switcher + ring + strip pending **per-anak** + utang janji) ·
**Approval inbox 5-jalur** · Send money · Take money · Money rules ·
**Settings** (jadwal uang saku · bunga bank · harga hari ini · kelola investasi) ·
**Add a child** · **Jobs & Prizes builder** · **Transactions** (filter rentang).

Nav: Dashboard / Requests / Send / Settings. **Money rules sengaja TIDAK di nav** — ia setelan
**per-anak**, dicapai dari kartu anak di Dashboard; Settings adalah setelan tingkat akun.
Add a child dan Jobs juga dicapai dari Dashboard.

**Belum ada:** Insight · undang ortu kedua · Learning tracker.

### Kesepakatan deposito dibekukan saat approve (0014)

ADR-0003 menutup dengan *"TD tidak ikut pasar — bunganya terkunci di kesepakatan"*, dan sampai
30 Juli 2026 kalimat itu tidak punya rumah: tidak ada kolom untuk tenor, rate, maupun tanggal
mulai. Sekarang approval `grow_in` menulis ketiganya ke wallet.

Diuji: anak menyetor Rp20.000 tenor 12 bulan → approve membekukan `4.00%`. Ortu lalu menurunkan
bunga 12 bulan jadi **1%** → deposito itu **tetap 4%**. Sebelum ini, deposito akan diam-diam
mengikuti setelan hari ini, dan anak yang menyetor karena dijanjikan 4% bisa menemukan bunganya
berubah tanpa pernah diberi tahu.

Ikut ditutup: `ledgerRowFor()` mengembalikan `null` untuk `grow_in`, dan `approveRequest` memakai
`if (row)` — jadi pengajuan Grow yang disetujui akan berpindah ke `approved` **tanpa satu rupiah
bergerak dan tanpa galat.** Sekarang ketiadaan baris di jalur instan harus punya nama; satu-satunya
yang sah adalah harvest `roll_over`, sisanya dianggap bug dan melempar.

⚠️ **Hitung mundur deposito belum bisa dipercaya.** Setiap baris ledger di seed memakai
`createdAt` placeholder yang sama (`2026-07-01`), jadi tanggal bilang "153 hari lagi" sementara
bunga Rp750 sudah tercatat dan seed memang memaksudkan "sudah jatuh tempo". Sesuai prinsip
`core/grow.ts`, **ledger yang berwenang**: bunga tercatat = jatuh tempo. Hitung mundur berbasis
tanggal baru sahih setelah S1b memberi tanggal mulai sungguhan per instrumen.

## Tersambung Supabase (30 Juli 2026) — dan siklus uang akhirnya tutup

`getParentData()` membaca dari Supabase dengan token **ortu**, jadi RLS yang memutuskan anak siapa
yang terlihat. Ortu yang bukan anggota keluarga tidak melihat apa pun (diuji per-role).

**Yang sudah MENULIS: approval inbox.** Approve · Talk about it · Decline · Mark as done semuanya
server action yang benar-benar mengubah database. Sebelum ini mereka `<a href="?act=…">` yang
cuma *memPRATINJAU* keputusan lewat query param — layar yang menampilkan hasil seolah tersimpan.

**Yang MENULIS sekarang:** approval inbox · **Send money** · **Take money** · **Money rules** ·
**Add a child**.

**Yang masih pratinjau:** Settings (uang saku · bunga bank · harga) dan Jobs & Prizes — keduanya
**belum punya tabel**, jadi bukan sekadar belum disambungkan. Lihat backlog U-12/U-13.

### Money rules akhirnya punya input

Layar ini dulu **nol input**: mode cuma tautan `?mode=` yang mengubah pratinjau tanpa menyimpan,
dan rasio hanya dipajang. Sekarang satu form yang tersimpan — dan karena app anak membaca baris
yang sama, Strict yang dinyalakan di sini benar-benar mengunci layar Sort anak.

**Grow tidak punya input rasio, dan itu disengaja.** `SPLITTABLE` di core (bukan `CATEGORIES`)
yang menentukan kategori mana boleh menerima auto-split — masuk instrumen selalu lewat pengajuan
yang disetujui (ADR-0003, backlog A).

### Add a child: satu transaksi, empat penulisan

Anak + wallet awal + `money_rules` + `child_economy` lahir bersama lewat `create_child()`
(migrasi 0012), atau tidak terjadi apa pun. Anak tanpa wallet tidak bisa menerima uang; anak
tanpa aturan uang punya layar Sort kosong. Ketiganya bukan "nanti diisi".

PIN di-hash **oleh Postgres**, bukan oleh app — sumber yang sama dengan seed dan verifikasi
login. Keunikan PIN per keluarga diperiksa `family_pin_taken()` sebelum menulis (ADR-0012 §A2).

Diuji: PIN kembar ditolak; PIN unik → anak lahir lengkap dan **benar-benar bisa login**, sementara
anak pertama tetap bisa login dengan PIN-nya sendiri.

### ADR-0002 sekarang bisa dilihat, bukan cuma dibaca

| Jalur | Approve | Mark as done |
|---|---|---|
| **Instan** (harvest, grow_in, mission_claim) | **ledger ditulis di sini** | — |
| **To-do** (cash_out, give_away, prize) | status berubah, **uang belum bergerak** | **ledger ditulis di sini** |

Diuji ujung ke ujung, dan angkanya rekonsiliasi:

```
Harvest emas   approve → Gold 19.140 → 0, Headphones +19.140   (satu baris ledger)
Harvest TD     approve → roll_over: NOL rupiah pindah,          (nol baris ledger)
                         TD tetap 30.750, status approved
cash out 25rb  approve → ledger TETAP, saldo TETAP, promise_debt +1
give 15rb      approve → sama; keduanya "You said yes — not done yet"
give           done tanpa cerita → DITOLAK (ADR-0006)
give           done + cerita     → ledger, cerita tersimpan
cash out       done              → ledger

total 484.711 → 444.711 (turun tepat 25rb + 15rb: uang KELUAR dari app)
I1 tegak · nol saldo negatif · nol orphan · promise_debt kembali 0
```

**Nominal Harvest dihitung ulang dari pilihan anak**, tidak diambil dari `amount`. `roll_over`
memindahkan nol rupiah — memakai `amount` mentah akan menguras deposito ke Save, kebalikan dari
yang anak pilih. Pokok diambil dari ledger (`grow_in`), bunga = nilai sekarang − pokok.

⚠️ **Sesi ortu belum diperbarui otomatis.** Access token Supabase berumur ~1 jam dan
`lib/supabase.ts` tidak me-refresh-nya, jadi ortu akan dilempar ke layar masuk setelah satu jam.
Cukup untuk uji prototipe; dicatat sebagai backlog **U-11**.

## Yang harus diperbaiki saat diport (mockup ortu menyimpang dari daftar kanonik)

| | Item |
|---|---|
| **X2** | Target dream: pakai **BMX 300.000 / Headphones 100.000** (angka app anak), bukan 400.000/60.000 |
| **X3** | Request pending: **Rp25.000** |
| **X4** | Rasio seed: **40/40/20**, bukan 40/40/10 |

Semua sudah benar di `packages/core/src/seed.ts` — ambil dari sana, jangan ketik ulang.

## Dua suara, satu produk

Login tetap hangat (satu-satunya layar yang ortu **dan** anak sama-sama berdiri di depannya).
Interior ringkas: ikon garis, angka tabular, hairline border. Ortu membuka app di sela kesibukan.

Yang **tidak pernah** berubah dari sisi anak: warna kategori dan warna status. Kalau ikut di-tema,
ortu dan anak berhenti membicarakan hal yang sama.
