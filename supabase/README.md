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

| Berkas | Isi | Di remote |
|---|---|---|
| `migrations/0001_init.sql` | tabel, constraint, view saldo, resolver `is_pro()`, pemeriksa invarian | ✅ jalan |
| `migrations/0002_rls.sql` | row-level security + trigger append-only ledger | ✅ jalan |
| `migrations/0003_child_login_attempts.sql` | bahan rate limiting login anak | ✅ jalan |
| `migrations/0004_view_security_invoker.sql` | view pakai hak pemanggil + putus rekursi RLS | ✅ jalan |
| `migrations/0005_rpc_surface.sql` | cabut EXECUTE helper definer dari `anon` | ✅ jalan |
| `migrations/0006_verify_child_pin.sql` | verifikasi PIN di Postgres (pgcrypto), service role saja | ✅ jalan |
| `migrations/0007_login_by_family_pin.sql` | `find_child_by_pin()` + `family_pin_taken()`, rate limit per keluarga | ✅ jalan |
| `migrations/0008_wallet_instrument.sql` | jenis instrumen Grow jadi kolom, bukan tebakan dari id | ✅ jalan |
| `migrations/0009_no_direct_writes.sql` | cabut hak tulis anak — anak tidak lagi bisa mencetak uang | ✅ jalan |
| `migrations/0010_no_overdraft.sql` | saldo negatif jadi mustahil, bukan sekadar dilaporkan | ✅ jalan |
| `migrations/0011_harvest_destination.sql` | tujuan + pilihan deposito saat Harvest punya tempat | ✅ jalan |
| `migrations/0012_create_child.sql` | tambah anak = satu transaksi (anak + wallet + aturan + ekonomi) | ✅ jalan |
| `migrations/0013_settings_tables.sql` | uang saku (per anak) · bunga bank (per keluarga) · harga harian (global) | ✅ jalan |
| `migrations/0014_deposit_terms.sql` | tenor + rate + tanggal mulai deposito, dibekukan saat approve | ✅ jalan |
| `migrations/0015_jobs_prizes_gems.sql` | `jobs` · `prizes` · **`gem_entries` append-only** + view saldo | ✅ jalan |
| `functions/child-login/` | Edge Function: kode keluarga + PIN → JWT ber-claim | ✅ **v4, ACTIVE** |
| `seed.sql` | data uji kanonik (cermin `packages/core/src/seed.ts`) — jalankan **setelah** migrasi | ✅ jalan (`NUMMI1`) |

## Keadaan sekarang (29 Juli 2026)

Seed sudah masuk dan **direkonsiliasi**: `invariant_check` untuk Arthur = **Rp484.711**, pecahannya
`50.000 / 95.000 / 240.000 / 40.000 / 59.711`, `negative_wallets` 0, `ledger_orphans` kosong.
Angka yang sama dihasilkan `packages/core` (176 test hijau). Itulah gunanya punya dua sumber.

Kode keluarga **`NUMMI1`**, PIN anak **`135790`** — data uji, ganti sebelum keluarga sungguhan.

**Login anak hidup dan sudah diuji ujung ke ujung.** Payload-nya **hanya** `{ familyCode, pin }` —
tidak ada `childId` (ADR-0012 §A1). Kode keluarga diterima huruf kecil, PIN salah dan kode keluarga
salah sama-sama `401` dengan pesan seragam, token berumur 12 jam, dan token itu dipakai menembak
`/rest/v1/wallet_balances` mengembalikan **11 baris, total 484.711** — angka yang sama dengan
`packages/core`. Tiga sumber independen, satu angka.

```bash
curl -X POST "$URL/functions/v1/child-login" \
  -H "apikey: $PUBLISHABLE_KEY" -H "Authorization: Bearer $PUBLISHABLE_KEY" \
  -H 'content-type: application/json' \
  -d '{"familyCode":"NUMMI1","pin":"135790"}'
```

**PIN wajib unik dalam satu keluarga.** Kalau dua anak sama-sama cocok, `find_child_by_pin()`
mengembalikan nol baris dan login GAGAL — server tidak menebak. Keunikan tidak bisa dijaga unique
constraint (salt bcrypt berbeda tiap baris), jadi penegakannya di waktu tulis lewat
`family_pin_taken()`.

**App anak sudah tersambung** — membaca (Home/Wallets/Sort/Requests) dan **menulis** (Sort).
Saldo di atas kini bergerak karena anak sungguhan menekan tombol, bukan karena seed.

**Ortu pertama sudah tertaut** (30 Juli 2026): akun Auth dibuat lewat Admin API, lalu disisipkan
ke `parents` sebagai "Ayah" primary di `NUMMI1`. RLS sisi ortu diuji dengan baris nyata — 1 anak,
11 wallet, 11 saldo, total 484.711; ortu asing nol; **token anak melihat nol baris ortu** (policy
`parents_read_child_blocked`).

Yang **belum**: `apps/parent` + `apps/console` masih membaca `lib/data.ts`, jadi request yang
diajukan anak belum bisa disetujui siapa pun.

## Tentang JWT: project ini pakai kunci asimetris, tapi login anak masih HS256

JWKS project (`/auth/v1/.well-known/jwks.json`) memuat satu kunci **ES256**, `key_ops: ["verify"]` —
kunci publik, tidak bisa dipakai menandatangani. Jadi `child-login` **tidak mungkin** menerbitkan
token dengan kunci itu.

Yang menyelamatkan: JWT secret HS256 lama masih berstatus **`Previously used`**
(`9835f01e-8ce0-4aca-bfc8-d3ba223a48d5`), jadi token HS256 masih diverifikasi. Nilainya dipasang
sebagai secret `CHILD_JWT_SECRET`. Token tidak perlu membawa header `kid` — sudah diuji, cocok.

> ⚠️ **Jangan pernah me-revoke kunci `9835f01e-…`** sampai U-6 selesai. Satu klik itu mematikan
> login semua anak serentak. Ini utang yang tanggal jatuh temponya ditentukan Supabase, bukan kita;
> jalan keluarnya (token terbitan Supabase + custom access token hook) ada di backlog U-6.

## Tidak perlu Supabase CLI untuk pekerjaan sejauh ini

Semua yang di atas dikerjakan lewat MCP + dashboard, tanpa `supabase` CLI terpasang:

| Pekerjaan | Caranya |
|---|---|
| Jalankan migrasi | MCP `apply_migration` |
| Set secret Edge Function | Dashboard → Edge Functions → Secrets |
| Deploy Edge Function | MCP `deploy_edge_function` |
| **Hapus** Edge Function | **hanya Dashboard** — MCP tidak punya tool-nya |

CLI (`brew install supabase/tap/supabase`) baru berguna untuk stack lokal dan `db push`.
Blok perintah di bawah ini disimpan sebagai padanan CLI, bukan sebagai satu-satunya jalan.

## Enam jebakan yang sudah ditemukan dan ditutup (jangan diulang)

**1. View tidak mewarisi RLS.** `wallet_balances` adalah satu-satunya sumber saldo. Dibuat dengan
default Postgres, ia berjalan dengan hak *pemilik* view — jadi JWT keluarga mana pun yang menembak
`/rest/v1/wallet_balances` akan membaca saldo **seluruh keluarga**, melewati RLS yang sudah benar di
`wallets` dan `ledger_entries`. Ditutup di `0004` dengan `security_invoker = on` di keempat view.

**2. Policy yang memanggil fungsi yang membaca tabelnya sendiri = rekursi.** `parents_read` memanggil
`auth_family_id()`, yang membaca `parents`, yang memicu `parents_read` lagi. Bukan teori — `select
count(*) from parents` sebagai role `authenticated` mengembalikan `54001 stack depth limit exceeded`.
Karena `auth_family_id()` dipakai hampir semua policy, **seluruh sisi ortu mati**. Ditutup di `0004`
dengan menjadikan `auth_family_id()` & `can_see_child()` SECURITY DEFINER + `search_path` terkunci.

**3. Edge Runtime tidak punya `Worker`.** `deno.land/x/bcrypt` versi async menjalankan perbandingan
di dalam Worker, jadi `child-login` v1 mengembalikan `500` dengan `ReferenceError: Worker is not
defined` — dan log permintaan biasa tidak memperlihatkan sebabnya sama sekali. Ditutup di `0006`
dengan memindahkan verifikasi PIN ke Postgres lewat pgcrypto: bcrypt keluar dari jalur auth, dan
`pin_hash` tidak pernah lagi ditarik keluar database. Catatan untuk fungsi Postgres apa pun yang
memakai pgcrypto: `search_path` **wajib** memuat `extensions` — di situlah ekstensinya dipasang,
bukan di `public`.

**4. `x-forwarded-for` adalah rantai, dan ujungnya berganti tiap permintaan.** Rate limiting login
anak memakainya utuh sebagai kunci, jadi setiap tebakan tampak datang dari IP baru dan hitungannya
tidak pernah mencapai ambang. **Tujuh tebakan berturut-turut semuanya lolos.** Kodenya ada sejak
awal; efeknya tidak pernah ada. Ambil hop **pertama** (`.split(',')[0]`), dan karena hop itu dikirim
klien dan bisa dipalsukan, tambahkan lapis kedua per-keluarga — lihat ADR-0012 §A3.

**5. Policy INSERT bisa memeriksa hal yang salah.** `ledger_insert` menjawab *"baris ini milik anak
itu?"* dan tidak pernah *"uangnya dari mana?"*. Baris ber-`from_wallet_id = null` artinya uang masuk
dari luar — dan anak boleh menulisnya sendiri. Diuji: total 484.711 → 10.484.710 dengan satu
permintaan. Ditutup di `0009`. **Setiap policy INSERT harus diuji dengan mencoba menyalahgunakannya**,
bukan dengan membaca ulang kalimatnya.

**6. Memeriksa saldo saja tidak mencegah saldo negatif.** Dua transaksi bersamaan di READ COMMITTED
sama-sama tidak melihat baris lawannya yang belum di-commit, jadi keduanya menghitung saldo yang
masih sehat dan keduanya lolos — write skew klasik. `raise exception` saja tidak menyembuhkannya.
Trigger di `0010` **mengunci baris wallet asal (`for update`) lebih dulu, baru menghitung**. Diuji
dengan dua permintaan bersamaan: tepat 3 baris tertulis, bukan 6.

Keenamnya lolos pembacaan kode, dan tidak satu pun terlihat sampai ada permintaan sungguhan yang
menyentuhnya: dua yang pertama tersembunyi selama tabel masih kosong, yang ketiga baru muncul saat
fungsinya benar-benar dipanggil, dan yang keempat **tidak pernah melempar galat sama sekali** — ia
cuma diam-diam tidak bekerja. Yang terakhir itu jenis paling berbahaya: satu-satunya cara
menemukannya adalah menyerang sendiri fiturnya dan memastikan serangan itu **gagal**.

Kalau kamu menambah view atau helper baru, ujilah dengan role sungguhan, bukan dengan koneksi
service role:

```sql
begin;
  set local role authenticated;
  set local request.jwt.claims = '{"nummi_role":"child","child_id":"…","family_id":"…","role":"authenticated"}';
  select count(*) from wallet_balances;   -- harus HANYA milik anak itu
rollback;
```

## Dua ledger, dua alasan

Uang **dan** 💎 sama-sama append-only, dan itu bukan simetri demi kerapian:

| | Tabel | Saldo | Kenapa append-only |
|---|---|---|---|
| Uang | `ledger_entries` | view `wallet_balances` | ADR-0014 — sejarah uang tidak boleh bisa diedit |
| 💎 | `gem_entries` | view `gem_balances` | ditukar jadi **hadiah dunia nyata**; "💎-ku ke mana?" harus terjawab |
| ⭐ | `child_economy` (penghitung) | — | hanya membeli kosmetik in-app; tidak menyentuh dunia nyata |

Keduanya punya trigger kembar: `no_ledger_*`/`no_gem_*` (menolak UPDATE & DELETE) dan
`no_overdraft`/`no_gem_overdraft` (mengunci dulu, baru menghitung — write skew tidak bisa
diselesaikan dengan `raise exception` saja).

Pembedaan ⭐ vs 💎 langsung mengikuti ADR-0004: yang menyentuh dunia nyata dijaga lebih ketat.

Advisor akan tetap melaporkan bahwa `authenticated` boleh memanggil kedua helper definer itu.
Disengaja — policy dievaluasi sebagai role pemanggil, jadi mencabutnya justru mematikan RLS.
Lihat catatan di `0005_rpc_surface.sql`.

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
