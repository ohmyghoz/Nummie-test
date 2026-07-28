# ADR-0005 — Strict/Flexible: Strict default mati

**Status:** 🔒 terkunci

## Keputusan
Dua mode aturan uang per anak, ditetapkan ortu:
- **Flexible** — anak bebas menyortir ulang Unsorted & Spend
- **Strict** — pembagian terkunci, uang tidak bisa keluar dari tugas yang sudah diberikan

**Strict default MATI.**

Yang berlaku di kedua mode: cash-out selalu butuh persetujuan; dream & Give tidak bisa dibatalkan
tanpa ortu; Grow tidak bisa ditarik sepihak.

## Kenapa default mati
Riset literasi finansial memperingatkan bahaya mencabut pengambilan keputusan nyata dari anak.
Anak yang tak pernah boleh salah memilih tidak belajar memilih.

## ⚠️ Gap paling mahal di seluruh backlog
Mode ini **sudah dibangun di sisi ortu** (Fase 6) tapi **belum ditegakkan di app anak**. App anak
tidak mengenal konsep mode sama sekali. Artinya ortu bisa menyalakan Strict dan tidak terjadi apa-apa.

> **Aturan yang tidak ditegakkan lebih buruk daripada aturan yang belum ada** — karena ortu mengira
> anaknya dibatasi padahal tidak.

Saat dibangun di sisi anak: gembok harus disertai pesan yang menjelaskan **kenapa** terkunci,
bukan sekadar tombol mati.

## Terkait: auto-split
Default 40% Spend / 40% Save / 20% Give. Ortu bisa mengubah rasio **dan** memilih wallet tujuan per
kategori. Sisa rasio yang belum dialokasikan boleh tersisa di mode Flexible (mendarat di Unsorted),
tapi **wajib habis di mode Strict**. Kalau auto-split mati, semua uang masuk mendarat di Unsorted.

App anak masih menampilkan teks mati "40% Spend / 40% Save / 20% Give default" — harus diganti
dengan rasio sungguhan dari sisi ortu.
