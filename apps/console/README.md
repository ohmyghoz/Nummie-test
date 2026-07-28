# apps/console — console admin

**Dibangun duluan, dan tipis** (ADR-0015). Bukan produk; alat untuk melihat apakah model datamu
benar sebelum satu komponen anak atau ortu ditulis.

100% bahasa Indonesia, dan format rupiahnya sudah benar sejak awal — console tidak terhalang D1
maupun D2. Referensi: `legacy/console.html`.

## Cakupan sekarang: hanya C-1 — ✅ dibangun

Keluarga & anak · saldo wallet (dari view) · ledger mentah · antrean request dengan **utang janji**
· hasil pemeriksa invarian. **Baca saja** — console tidak pernah dipakai mengubah data keluarga
di fase ini.

Dibangun dengan Next.js (App Router, server component, tanpa JS klien). Semua angka dihitung oleh
`@nummi/core` (`walletBalances`, `pocketBalances`, `checkLedgerHealth`, `promiseDebt`) — console tidak
pernah menghitung ulang sendiri.

### Menjalankan

```
npm install
npm run console:dev     # http://localhost:3000
npm run console:build   # build produksi
```

### Sumber data & titik tukar S1b

Sumber angka saat ini adalah **seed kanonik** `@nummi/core`, dibungkus di satu tempat:
`lib/data.ts` → `getConsoleData()`. Ketika migrasi Supabase dijalankan (S1b), cukup ganti isi fungsi
itu dengan query ke view SQL — tidak ada berkas di `app/` yang perlu diubah, karena UI tidak pernah
menyentuh seed langsung.

## Masih di backlog, jangan dikerjakan sekarang

C-2 auth & peran sungguhan · C-3 samakan jendela metrik 7 vs 14 hari · C-4 ekspor CSV ·
C-5 mode dukungan sebagai kebijakan sisi server · C-6 jejak audit kebal-hapus ·
C-7 validasi ambang status 14/21/30 hari dengan data nyata.

## Metrik utara

**Keluarga aktif mingguan dengan siklus uang lengkap** — bukan DAU. Mengejar DAU bertentangan
dengan misi produk, dan console tidak boleh jadi alat yang menggodanya.
