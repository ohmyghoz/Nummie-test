# ADR-0008 — Rapor = formula, LLM tidak pernah menyentuh angka

**Status:** 🔒 terkunci

## Keputusan
Rapor Literasi Finansial (per semester) dihitung dari **rubrik deterministik** atas data ledger.
LLM maksimal berada di lapis ketiga (perapian kalimat), **tidak pernah** menyentuh angka atau skor.

5 dimensi: Ketekunan · Kesabaran · Perencanaan · Kemurahan · Pengetahuan (`financial_literacy.md` §7).

## Kenapa — dan kenapa alasannya bukan biaya
Cadence per-semester sudah membuat biaya LLM tidak relevan. Alasannya tiga hal lain:
1. **Halusinasi tentang anak orang itu fatal.**
2. **Rapor harus bisa dibandingkan antar-semester.** LLM tidak konsisten, formula konsisten — dan
   perbandingan antar-semester itulah produknya.
3. **Rubrik terbuka > kotak hitam.** Ortu berhak tahu skornya dari mana.

## Konsekuensi
- Skor tidak pernah berdiri sendiri — **selalu disertai 1 aksi konkret untuk ortu.**
- Aturan yang sama berlaku untuk halaman **Insight** di app ortu: pembacaan tren dalam kalimat biasa,
  tapi seluruh angkanya deterministik dari ledger.
- Ini adalah Constraint **C3** dan invariant **I6** di `CLAUDE.md`.
