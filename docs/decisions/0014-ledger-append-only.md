# ADR-0014 — Ledger append-only, saldo diturunkan

**Status:** 🆕 diputuskan 28 Juli 2026

## Keputusan
`ledger_entries` adalah sumber kebenaran. Setiap baris mencatat perpindahan
`(from_wallet, to_wallet, amount)`. **Saldo wallet dihitung**, tidak disimpan sebagai angka yang
bisa di-UPDATE.

Ledger bersifat **append-only**: tidak ada UPDATE, tidak ada DELETE. Koreksi dilakukan dengan baris
pembalik, bukan dengan menghapus sejarah.

## Kenapa
- Invariant `Unsorted + Spend + Save + Give + Grow = Total` (ADR-0001) berubah dari janji di dokumen
  menjadi **satu query yang bisa dijalankan setiap hari**.
- Backlog console sudah menetapkan baris ledger yang tidak nol sebagai **insiden P0**. Definisi itu
  sekarang punya penegak, bukan hanya penulis.
- Backlog C-6 meminta **jejak audit yang kebal-hapus**. Append-only memberikannya gratis.
- Produk ini mengajari anak bahwa angka uang tidak berubah diam-diam. Skema yang membolehkan UPDATE
  saldo mengajarkan sebaliknya kepada tim yang membangunnya.

## Konsekuensi
- Saldo dibaca lewat view (`wallet_balances`) atau agregasi ter-cache. Untuk skala prototipe, view
  biasa sudah cukup — jangan optimasi dini.
- Uang masuk (allowance, Send money, reward uang) = baris dengan `from_wallet = NULL` menuju Unsorted.
- Cash-out mengurangi saldo **saat `Mark as done`**, bukan saat approve (lihat ADR-0002).
- Pemeriksa invarian harian dijalankan sebagai cron Supabase; hasil tidak nol menjadi alarm.
