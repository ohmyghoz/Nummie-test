-- Nummi — saldo negatif berhenti jadi laporan, mulai jadi kemustahilan (I2).
--
-- `invariant_check.negative_wallets` sudah ada sejak 0001, tapi ia sebuah VIEW: ia melapor
-- SESUDAH kejadian. Untuk ledger append-only (ADR-0014) itu terlambat menurut definisi —
-- baris yang salah tidak bisa dihapus, hanya ditambal baris pembalik. Yang ketahuan besok
-- pagi lewat cron sudah terlanjur dilihat anaknya.
--
-- ── Cara ini bisa terjadi ────────────────────────────────────────────────────
-- Dua klik Confirm yang cepat di layar Sort. Keduanya memanggil server action, keduanya
-- membaca Unsorted = 50.000 lewat @nummi/core, keduanya menyimpulkan rencana 20k/20k/10k,
-- dan keduanya menulis. Unsorted berakhir −50.000. Tidak ada satu pun aturan yang dilanggar
-- di sisi aplikasi — keduanya benar secara terpisah.
--
-- ── Kenapa pemeriksaan saja TIDAK cukup ──────────────────────────────────────
-- Trigger yang cuma menghitung ulang saldo akan lolos juga: di READ COMMITTED, dua transaksi
-- yang berjalan bersamaan sama-sama TIDAK melihat baris lawannya yang belum di-commit. Keduanya
-- menghitung saldo yang masih sehat, keduanya lolos, keduanya commit. Ini write skew klasik,
-- dan menambah `raise exception` saja tidak menyembuhkannya.
--
-- Karena itu trigger di bawah MENGUNCI baris wallet asal lebih dulu (`for update`). Transaksi
-- kedua tertahan di situ sampai yang pertama selesai, lalu menghitung ulang di atas kenyataan
-- yang sudah ter-commit — dan barulah penolakannya berarti.

create or replace function reject_overdraft()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
declare
  v_balance bigint;
begin
  -- Uang masuk dari luar (uang saku, hadiah, bunga) tidak mengurangi kantong mana pun.
  if new.from_wallet_id is null then
    return null;
  end if;

  -- Kunci dulu, hitung kemudian. Urutan ini yang membedakan penjagaan dari laporan.
  perform 1 from wallets where id = new.from_wallet_id for update;

  select coalesce(sum(case when l.to_wallet_id   = new.from_wallet_id then l.amount else 0 end), 0)
       - coalesce(sum(case when l.from_wallet_id = new.from_wallet_id then l.amount else 0 end), 0)
    into v_balance
  from ledger_entries l
  where l.to_wallet_id = new.from_wallet_id or l.from_wallet_id = new.from_wallet_id;

  if v_balance < 0 then
    raise exception
      'Saldo wallet % akan jadi % — uang tidak boleh keluar dari kantong yang tidak memilikinya (I2).',
      new.from_wallet_id, v_balance
      using errcode = 'check_violation';
  end if;

  return null;
end;
$$;

-- AFTER, bukan BEFORE: pada satu `insert` berisi banyak baris (persis yang dilakukan Sort),
-- trigger AFTER ROW dijalankan setelah seluruh pernyataan selesai, jadi ia menilai keadaan
-- AKHIR. Sort 20k+20k+10k dari 50.000 mendarat tepat di nol dan sah — kalau dinilai per baris
-- di tengah pernyataan, hasilnya tetap sah di sini, tapi AFTER membuatnya sah karena alasan
-- yang benar, bukan karena kebetulan urutannya menguntungkan.
drop trigger if exists no_overdraft on ledger_entries;
create trigger no_overdraft
after insert on ledger_entries
for each row execute function reject_overdraft();

-- CATATAN: ini menegakkan I2 (setiap rupiah di tepat satu wallet, dan tidak ada wallet yang
-- berutang). I1 tetap benar secara konstruksi karena saldo diturunkan dari ledger, bukan
-- disimpan — lihat catatan panjang di 0001_init.sql.
--
-- Penjagaan ini berlaku untuk SEMUA jalur tulis, termasuk yang belum dibangun (Move, Give,
-- Grow, Send/Take dari ortu). Itu alasannya ia hidup di database dan bukan di server action:
-- jalur tulis berikutnya yang lupa memeriksa saldo akan tetap ditolak.
