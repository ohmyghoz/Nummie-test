# ADR-0015 — Console dibangun duluan, dan tipis

**Status:** diputuskan 28 Juli 2026

## Keputusan
Setelah skema Supabase hidup, permukaan pertama yang dibangun adalah **console admin** — hanya
tampilan baca di atas tabel nyata (backlog **C-1**). Bukan produk; alat.

C-2 sampai C-7 tetap di backlog: autentikasi & peran sungguhan, penyamaan jendela metrik 7 vs 14
hari, ekspor CSV, mode dukungan sebagai kebijakan sisi server, jejak audit kebal-hapus, validasi
ambang status.

## Kenapa
Urutan awal menaruh console paling akhir, sebagai "permukaan kelima yang harus dikejar". Dengan
Supabase masuk, urutan itu jadi salah:

- Skema dan auth melayani **ketiga permukaan sekaligus** — tidak ada cara membangunnya untuk satu
  app saja. Jadi sebagian dari "ketiganya" memang tak terhindarkan.
- Console adalah satu-satunya permukaan yang **sudah 100% bahasa Indonesia** dan **format rupiahnya
  sudah benar** (backlog X1 menyebutnya sebagai contoh yang benar). Ia tidak terhalang D1 maupun D2.
- Isinya murni pembacaan data. Artinya begitu skema hidup, console adalah cara **tercepat melihat
  apakah model datamu benar** — sebelum satu komponen anak atau ortu ditulis dan sebelum kesalahan
  model data sempat menyebar ke dua basis kode UI.

Console berhenti jadi beban dan jadi alat debug untuk S1.

## Konsekuensi
- Yang dibangun: keluarga & anak, saldo wallet (dari view), ledger mentah, antrean request dengan
  **utang janji** (`approved` + `todo`), dan pemeriksa invarian harian.
- Metrik utara yang ditampilkan: **keluarga aktif mingguan dengan siklus uang lengkap** — bukan DAU.
  Mengejar DAU bertentangan dengan misi produk, dan console tidak boleh jadi alat yang menggodanya.
- Console tidak pernah dipakai untuk *mengubah* data keluarga di fase ini. Baca saja.
