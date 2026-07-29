-- Nummi — anak tidak boleh lagi menulis langsung. Ledger hanya lewat server.
--
-- ── Lubang yang ditutup berkas ini ───────────────────────────────────────────
-- Policy `ledger_insert` di 0002_rls.sql berbunyi: `with check (can_see_child(child_id))`.
-- Ia menjawab "baris ini milik anak itu?" — TAPI TIDAK PERNAH menjawab "uangnya dari mana?".
--
-- Baris ber-`from_wallet_id = null` artinya uang masuk dari luar (uang saku, hadiah). Dengan
-- JWT anak yang sah, satu permintaan ke PostgREST sudah cukup:
--
--   insert into ledger_entries (child_id, from_wallet_id, to_wallet_id, amount, reason)
--   values (<child_id dari token>, null, <wallet mana pun>, 9999999, 'allowance');
--
-- Diuji 29 Juli 2026 di transaksi yang di-rollback: total Arthur 484.711 → 10.484.710.
-- **Anak bisa mencetak uang.** Selama belum ada klien yang menulis, ini tidak berbahaya —
-- dan justru itu alasan menutupnya SEKARANG, di migrasi yang sama dengan dibukanya jalur tulis.
--
-- ── Bentuk penggantinya ──────────────────────────────────────────────────────
-- Penulisan pindah ke server action app anak, yang memvalidasi lewat `@nummi/core` —
-- sortPlan(), movePlan(), aturan Strict — implementasi yang sama yang dijaga 176 test.
-- Aturan uang tetap punya SATU rumah. Constraint & trigger di database (append-only ADR-0014,
-- amount > 0, has_endpoint, not_self) tetap jadi jaring pengaman terakhir, bukan satu-satunya.
--
-- Konsekuensi yang diambil sadar: service key hidup di env server app anak, jadi bug di app
-- tidak lagi ditahan RLS. Itu harga dari tidak punya dua salinan aturan uang yang bisa
-- menyimpang diam-diam — persis jenis kontradiksi yang di repo ini sudah punya register sendiri.

-- Ketiadaan policy INSERT = tidak ada peran ber-RLS yang boleh menulis. Service role melewati
-- RLS sepenuhnya, jadi server action tetap bisa. Ini pola yang sama dengan UPDATE/DELETE pada
-- ledger (ADR-0014): yang menegakkan adalah policy yang TIDAK ADA.
drop policy if exists ledger_insert on ledger_entries;

-- Alasan yang sama untuk request. Anak tidak lagi menyisipkan barisnya sendiri; server action
-- yang membuatnya setelah `@nummi/core` memeriksa saldo dan aturannya. Tanpa ini, anak bisa
-- mengajukan cash out melebihi isi kantongnya, dan yang menangkapnya cuma mata ortu.
drop policy if exists requests_child_insert on requests;

-- Yang SENGAJA dibiarkan: `requests_parent_all`. Ortu masih boleh memutuskan lewat RLS biasa,
-- dan itu tidak bisa memindahkan uang — sejak baris ini, uang hanya bergerak lewat ledger,
-- dan ledger tidak lagi menerima tulisan dari peran ber-RLS mana pun.
--
-- Membaca TIDAK berubah: `ledger_read` dan `requests_read` tetap apa adanya. Anak tetap
-- melihat seluruh sejarahnya sendiri.
