-- Nummi — instrumen Grow punya identitas sendiri, bukan ditebak dari nama.
--
-- `wallet_kind` sudah membedakan unsorted / envelope / dream / free_savings / give_pool /
-- instrument. Yang TIDAK dibedakannya: Time Deposit vs Gold vs US Dollar — ketiganya
-- `kind = 'instrument'`. Komentar di packages/core/src/types.ts sudah menyebut ketiganya
-- ("di bawah grow: time_deposit | gold | forex"), tapi tidak ada kolom yang menegakkannya.
--
-- Selama id-nya konstanta seed (`w_gold`, `w_td`), UI bisa menebak. Begitu id jadi UUID,
-- tebakan itu berhenti bekerja — dan berhenti bekerja TANPA melempar galat:
--
--   apps/kid/app/grow/page.tsx:33      wallet.id === 'w_gold'  → penjelas spread emas hilang
--   apps/kid/app/grow/page.tsx:80      wallet.id === 'w_td'    → badge jatuh tempo tidak muncul
--   apps/parent/app/settings/page.tsx  wallet.id === 'w_td'    (×2)
--
-- Penjelas spread emas adalah keputusan produk (ADR-0003: spread ~9% bagian dari pelajaran,
-- bukan detail yang disembunyikan). Fitur yang hilang diam-diam karena id berubah bentuk
-- adalah cara paling mahal untuk kehilangan keputusan.

create type grow_instrument as enum ('time_deposit', 'gold', 'fx');

alter table wallets add column instrument grow_instrument;

-- Backfill data yang sudah ada. Pemetaan lewat nama HANYA sah di sini, sekali, karena
-- inilah baris-baris yang dibuat seed dan namanya diketahui. Setelah ini nama tidak pernah
-- lagi jadi dasar keputusan.
update wallets set instrument = case name
  when 'Time Deposit' then 'time_deposit'::grow_instrument
  when 'Gold'         then 'gold'::grow_instrument
  when 'US Dollar'    then 'fx'::grow_instrument
end
where kind = 'instrument';

-- Dua arah, bukan satu: instrumen wajib punya jenis, dan yang bukan instrumen wajib tidak
-- punya. Arah kedua yang menjaga "dream berjenis gold" tidak pernah lahir.
alter table wallets add constraint instrument_matches_kind check (
  (kind = 'instrument' and instrument is not null)
  or (kind <> 'instrument' and instrument is null)
);
