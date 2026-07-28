# @nummi/core

Mesin Nummi. **TypeScript murni — nol dependency framework.**

> ⚠️ Paket ini **tidak boleh** mengimpor React, Next, atau Supabase.
> Alasannya ada di [ADR-0013](../../docs/decisions/0013-web-first-d4-tetap-terbuka.md): D4 (distribusi)
> masih terbuka. Selama logika bisnis tinggal di sini, pilihan apa pun tetap murah — kalau nanti jatuh
> ke native/Expo, paket ini terbawa 100% dan hanya UI yang ditulis ulang.

| Berkas | Isi |
|---|---|
| `types.ts` | tipe domain: kategori, tier, wallet, ledger, request |
| `money.ts` | `formatRp()` — satu-satunya cara menampilkan nominal. Plus format berat emas |
| `ledger.ts` | saldo diturunkan dari ledger + pemeriksa invariant |
| `rules.ts` | auto-split, Strict/Flexible, aturan proteksi Take money, jalur approval |
| `seed.ts` | **angka kanonik**. Kalau ada permukaan yang berbeda, permukaan itu yang salah |

```bash
npm install
npm test
```
