'use server';

/**
 * Penulisan ledger dari sisi anak.
 *
 * ── Kenapa berkas ini ada, dan kenapa bentuknya begini ───────────────────────
 * Sampai migrasi 0009, anak bisa menulis langsung ke `ledger_entries` lewat PostgREST —
 * termasuk baris ber-`from_wallet_id = null`, yang artinya **mencetak uang**. Policy lama
 * hanya menjawab "baris ini milik anak itu?", bukan "uangnya dari mana?".
 *
 * Sekarang tidak ada peran ber-RLS yang boleh menulis ke ledger. Yang boleh cuma service key,
 * dan service key hanya hidup di sini — di server action, tidak pernah di browser.
 *
 * ── Tiga aturan yang tidak boleh dilanggar berkas ini ────────────────────────
 *
 *  1. **Identitas anak TIDAK PERNAH datang dari input klien.** Selalu dari `getKidData()`,
 *     yang membacanya lewat token di cookie — dan pembacaan itu dijaga RLS. Kalau suatu saat
 *     ada `childId` datang dari formData, itu bug keamanan, bukan kemudahan.
 *
 *  2. **Aturan uang tidak ditulis ulang di sini.** Rencananya datang dari `sortPlan()` di
 *     `@nummi/core` — implementasi yang sama yang dijaga 176 test dan yang dipakai layarnya
 *     untuk pratinjau. Kalau server action menghitung sendiri, pratinjau dan hasil bisa
 *     berbeda, dan anak akan belajar bahwa app-nya berbohong.
 *
 *  3. **Mode demo `?mode=` tidak pernah ikut ke jalur tulis.** `getKidData()` dipanggil TANPA
 *     argumen di bawah, jadi mode selalu dibaca dari `money_rules` milik ortu. Kalau tidak,
 *     anak tinggal menambahkan `?mode=flexible` untuk keluar dari mode Strict.
 */
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { canOpenSort } from '@nummi/core';
import { getKidData } from './data';
import { serviceClient } from './supabase';

export async function applySort(): Promise<void> {
  // TANPA argumen mode — lihat aturan 3 di atas.
  const data = await getKidData();

  if (!canOpenSort(data.unsortedBalance)) redirect('/sort');
  if (!data.unsortedWalletId) redirect('/sort');

  const slots = data.plan.slots.filter((s) => s.amount > 0);
  if (slots.length === 0) redirect('/sort');

  // Satu `insert` berisi banyak baris = SATU pernyataan SQL = atomik. Ini bukan detail:
  // ledger bersifat append-only (ADR-0014), jadi Sort yang separuh tertulis TIDAK BISA
  // dibatalkan — hanya bisa ditambal dengan baris pembalik. Yang separuh jadi harus mustahil,
  // bukan sekadar jarang.
  const rows = slots.map((slot) => ({
    child_id: data.child.id,
    from_wallet_id: data.unsortedWalletId,
    to_wallet_id: slot.wallet.id,
    amount: slot.amount,
    reason: 'sort' as const,
  }));

  const { error } = await serviceClient().from('ledger_entries').insert(rows);

  if (error) {
    // Constraint database adalah jaring pengaman terakhir, dan kalau ia yang menangkap,
    // artinya ada aturan di `@nummi/core` yang tidak sejalan dengannya. Itu layak diketahui,
    // bukan diubah jadi layar kosong.
    console.error('applySort gagal:', error.message);
    redirect('/sort?e=failed');
  }

  revalidatePath('/');
  revalidatePath('/sort');
  revalidatePath('/wallets');
  redirect('/');
}
