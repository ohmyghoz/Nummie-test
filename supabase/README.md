# Supabase

Region: **Singapore** (latensi Indonesia).

| Berkas | Isi |
|---|---|
| `migrations/0001_init.sql` | tabel, constraint, view saldo, resolver `is_pro()`, pemeriksa invarian |
| `migrations/0002_rls.sql` | row-level security + trigger append-only ledger |
| `migrations/0003_child_login_attempts.sql` | bahan rate limiting login anak |
| `functions/child-login/` | Edge Function: kode keluarga + PIN → JWT ber-claim |

```bash
supabase db push
supabase functions deploy child-login
```

## Dua jenis pengguna

**Ortu** — pengguna Supabase Auth sungguhan (email + magic link).

**Anak** — bukan pengguna `auth.users`. Anak masuk dengan **kode keluarga + PIN**; Edge Function
`child-login` memverifikasi lalu menerbitkan JWT dengan claim `nummi_role`, `child_id`, `family_id`,
`tier`. RLS membaca claim itu, bukan sesi klien.
Alasan lengkap: `docs/decisions/0012-auth-anak-kode-keluarga-pin.md`.

## Yang sengaja tidak punya policy

- `iap_receipts` — hanya service role.
- `child_login_attempts` — hanya service role.
- `UPDATE`/`DELETE` pada `ledger_entries` — **ketiadaan policy-nya disengaja**, dan itulah penegak
  ADR-0014. Ada trigger sebagai sabuk pengaman kedua.

## Data uji

Menguji dengan keluarga sungguhan berarti data anak sungguhan. Untuk fase prototipe:

- nama samaran, bukan nama asli;
- lahir hanya bulan + tahun (sudah jadi constraint skema, bukan sekadar niat baik);
- tanpa foto — sekaligus alasan bagus untuk menunda item backlog "foto di cerita Give";
- bisa dihapus atas permintaan (`delete from families` merambat lewat `on delete cascade`).

## Pemeriksa harian

```sql
select * from invariant_check where negative_wallets > 0;  -- harus kosong. Ada isi = P0.
select * from ledger_orphans;                              -- harus kosong. Ada isi = P0.
select * from promise_debt order by days_outstanding desc; -- bukan bug; yang bahaya usianya
```
