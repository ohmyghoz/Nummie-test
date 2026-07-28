# ADR-0002 — Approve ≠ Fulfil: lima jalur approval

**Status:** 🔒 terkunci
**⚠️ Meluruskan kontradiksi internal** — lihat "Catatan" di bawah.

## Keputusan
Persetujuan ortu dan pelaksanaan di dunia nyata adalah **dua hal terpisah**, dan itu harus terlihat
di data sebagai **dua kolom**, bukan satu enum:

- `status` — `needs_ok` → `approved` / `declined` / `talk_about_it`
- `fulfilment` — `not_applicable` | `todo` | `done`

### Lima jalur

| Jenis request | Jalur | Kenapa |
|---|---|---|
| Grow / Harvest | approve = selesai seketika | tak ada aksi dunia nyata (ortu = bank) |
| Klaim mission | approve = selesai seketika | reward hanya angka di ledger |
| **Tukar hadiah (prize)** | approve → **To do** | ortu harus benar-benar memberi 1 jam main; janji yang tak ditepati merusak kepercayaan pada seluruh sistem |
| **Give** | approve → **To do** + **cerita wajib** | ortu harus menyalurkan DAN menutup lingkarannya |
| **Cash out** | approve → **To do** | ortu harus menyerahkan uang |

Jawaban ketiga selain Approve/Decline: **"Talk about it"** — supaya menolak tanpa penjelasan
(kesalahan umum ortu) tidak jadi satu-satunya jalan.

Give tidak punya tombol "Mark as done" polos — yang ada **form cerita yang wajib diisi** sebelum
request bisa ditutup. Tanpa cerita, Give tak beda dari uang yang hilang.

## Catatan — kontradiksi yang diluruskan di sini
`nummi-handoff.md` menulis judul *"Approve ≠ Fulfilled — **HANYA untuk Cash out**"*, lalu di
tabel tepat di bawahnya mencantumkan prize → To do dan Give → To do. Judul itu keliru: kalimatnya
lahir di konteks revisi Grow (artinya *"di antara flow Grow, hanya cash out"*), tapi terbaca
sebagai aturan global. Handoff juga menulis *"empat jalur"* untuk tabel berisi lima baris.

**Yang benar adalah tabelnya**, dan itu cocok dengan backlog G ("approval inbox 5-jalur").
Dicatat sebagai **K14** di `../nummi-status.md`.

## Konsekuensi
- Kalau kedua kolom digabung jadi satu enum saat migrasi — kesalahan yang sangat wajar — keputusan
  ini mati diam-diam. **Jangan.**
- Metrik **utang janji** (`approved` tapi `fulfilment != done`) jatuh gratis dari skema. Itu metrik
  kepercayaan utama console.
- Saldo ledger untuk cash-out baru berubah saat `Mark as done`, bukan saat approve.
