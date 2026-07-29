# Supabase

Region: **Singapore** (latensi Indonesia).

**Project ref: `lrjkhlaxixdbvxdpuqte`** → `https://lrjkhlaxixdbvxdpuqte.supabase.co`

> ⚠️ Ada project lain (`qwceygruvwjnbikieglw`) yang sempat dipakai lebih awal dan **sudah tidak
> berlaku**. Kunci apa pun yang pernah diambil dari sana tidak cocok dengan project ini —
> jangan dipasang ulang.

## MCP server (dijalankan di mesin sendiri, bukan di sesi remote)

`.mcp.json` di root repo sudah berisi konfigurasinya, jadi `claude mcp add` tidak perlu diulang.
Yang tersisa hanya autentikasi:

```bash
claude /mcp          # pilih "supabase", lalu Authenticate
```

Jalankan di **terminal biasa**, bukan ekstensi IDE — alurnya membuka browser.

Opsional, mempercepat kerja agent di Supabase:

```bash
npx skills add supabase/agent-skills
```

**Kenapa tidak bisa dari sesi Claude Code remote:** `mcp.supabase.com` diblokir network policy
environment (403 pada CONNECT), dan alur OAuth-nya butuh browser. Keduanya hambatan lingkungan,
bukan konfigurasi yang salah.

| Berkas | Isi |
|---|---|
| `migrations/0001_init.sql` | tabel, constraint, view saldo, resolver `is_pro()`, pemeriksa invarian |
| `migrations/0002_rls.sql` | row-level security + trigger append-only ledger |
| `migrations/0003_child_login_attempts.sql` | bahan rate limiting login anak |
| `functions/child-login/` | Edge Function: kode keluarga + PIN → JWT ber-claim |
| `seed.sql` | data uji kanonik (cermin `packages/core/src/seed.ts`) — jalankan **setelah** migrasi |

```bash
supabase db push
supabase secrets set CHILD_JWT_SECRET=<jwt secret proyek>   # WAJIB sebelum deploy
supabase functions deploy child-login
```

> **Nama secret-nya `CHILD_JWT_SECRET`, bukan `SUPABASE_JWT_SECRET`.** Supabase mereservasi
> prefix `SUPABASE_` untuk secrets, dan JWT secret tidak termasuk yang di-inject otomatis
> (hanya `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_DB_URL`).
> Memakai nama berprefix itu membuat penandatanganan token gagal diam-diam saat runtime.

> **Cek dulu jenis JWT proyekmu.** `child-login` menandatangani **HS256** dengan JWT secret
> lama. Proyek yang memakai *JWT signing key* asimetris (ECC/RSA) akan menolak token itu, dan
> login anak mati total. Lihat **Settings → API → JWT Keys** sebelum deploy.

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
- ⚠️ **bisa dihapus atas permintaan — BELUM BENAR.** Lihat di bawah.

### ⚠️ Penghapusan data saat ini MUSTAHIL

Berkas ini dulu menjanjikan `delete from families` merambat lewat `on delete cascade`.
**Itu tidak berhasil.** Trigger append-only (`0002_rls.sql`) memasang `before delete on
ledger_entries` yang selalu `raise exception`, dan trigger BEFORE DELETE tetap menyala saat
cascade. Jadi rantai `families → children → ledger_entries` selalu meledak dan seluruh
penghapusan di-rollback.

Akibatnya janji privasi "bisa dihapus atas permintaan" tidak bisa dipenuhi — justru oleh
penegak ADR-0014. **Belum diperbaiki: butuh keputusan produk**, karena menyentuh ADR-0014.
Usulan paling ringan (sejarah tetap kebal di operasi normal, purge harus dinyalakan sadar
per-transaksi):

```sql
if tg_op = 'DELETE'
   and coalesce(current_setting('nummi.purge', true), '') = 'on'
then return old; end if;
```

lalu penghapusan resmi jadi `set local nummi.purge = 'on';` sebelum `delete from families …`.

## Pemeriksa harian

```sql
select * from invariant_check where negative_wallets > 0;  -- harus kosong. Ada isi = P0.
select * from ledger_orphans;                              -- harus kosong. Ada isi = P0.
select * from promise_debt order by days_outstanding desc; -- bukan bug; yang bahaya usianya
```
