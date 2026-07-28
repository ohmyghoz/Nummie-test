# ADR-0001 — Model A: setiap rupiah di satu tempat

**Status:** 🔒 terkunci

## Keputusan
Setiap rupiah selalu berada di **tepat satu** sub-wallet. Kategori (Spend/Save/Give/Grow) adalah
**label**, bukan wadah. Memindahkan uang antar-pocket tidak pernah mengubah Total.

**Invariant:** `Unsorted + Spend + Save + Give + Grow = Total`

Sub-wallet per kategori:
- Spend → *envelopes*
- Save → *dreams* + "Free savings" (catch-all)
- Give → pool
- Grow → *instruments*

## Kenapa
Model alternatif (uang bisa "dihitung dua kali" di beberapa kategori) membuat anak tidak pernah
punya gambaran tunggal tentang uangnya, dan membuat Total tak bisa dipercaya. Untuk produk yang
mengajari kejujuran angka, itu cacat fatal.

## Konsekuensi
- "Free savings" berperan rangkap: nabung tanpa target, tujuan pulang dream yang dibatalkan, dan
  titik mendarat Harvest. Nama masih sementara — kandidat ganti "Someday / Suatu Nanti" (backlog F).
- Uang masuk (allowance, Send money, reward uang) **selalu** mendarat di Unsorted, tak pernah
  langsung ke kategori. Anak yang memberi tugas pada uangnya, bukan ortu.
- Invariant harus ditegakkan otomatis, bukan diandalkan pada disiplin. Baris ledger yang membuatnya
  tidak nol = **insiden P0**.
