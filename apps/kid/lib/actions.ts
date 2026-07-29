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
import {
  GIVE_CAUSES, canHarvestTo, canOpenSort, movePlan, validateGive,
  type GiveCause, type HarvestChoice,
} from '@nummi/core';
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

/**
 * Move money — menulis ledger LANGSUNG, sama seperti Sort.
 *
 * Id wallet memang datang dari formData, dan itu aman justru karena tidak pernah dipercaya:
 * keduanya dicari di dalam `data.wallets`, yaitu daftar yang dibaca lewat token dan dijaga RLS.
 * Id milik keluarga lain sederhananya tidak akan ketemu.
 */
export async function applyMove(formData: FormData): Promise<void> {
  const fromId = String(formData.get('from') ?? '');
  const toId = String(formData.get('to') ?? '');
  const amount = Number(formData.get('amount') ?? 0);

  const data = await getKidData();   // tanpa mode — lihat aturan 3 di atas
  const from = data.wallets.find((w) => w.wallet.id === fromId)?.wallet;
  const to = data.wallets.find((w) => w.wallet.id === toId)?.wallet;
  if (!from || !to) redirect('/move');

  // Aturan yang sama dengan yang dipakai pratinjau. Kalau server action memutuskan sendiri,
  // anak bisa melihat "boleh" lalu ditolak — atau lebih buruk, sebaliknya.
  const plan = movePlan(from, to, amount, data.rules, data.balances);
  if (!plan.ok) {
    redirect(`/move?from=${fromId}&to=${toId}&amount=${amount}`);
  }

  const { error } = await serviceClient().from('ledger_entries').insert({
    child_id: data.child.id,
    from_wallet_id: from.id,
    to_wallet_id: to.id,
    amount,
    reason: 'move',
  });

  if (error) {
    console.error('applyMove gagal:', error.message);
    redirect(`/move?from=${fromId}&to=${toId}&amount=${amount}&e=failed`);
  }

  revalidatePath('/');
  revalidatePath('/wallets');
  revalidatePath('/move');
  redirect('/wallets');
}

/**
 * Give — TIDAK menulis ledger. Ia membuat REQUEST (ADR-0002: mengajukan ≠ disetujui, dan
 * disetujui ≠ tersalurkan). Uangnya baru bergerak saat ortu menyetujui, dan barisnya baru
 * bisa ditutup setelah ortu menuliskan ceritanya (ADR-0006).
 *
 * Catatan yang sengaja dibiarkan apa adanya: dua pengajuan Give yang masing-masing sah bisa
 * melebihi isi kantong Give kalau digabung, karena request tidak "memesan" saldo. Yang
 * menangkapnya adalah trigger `no_overdraft` (0010) saat ortu menyetujui yang kedua. Itu benar
 * secara uang, tapi pengalaman ortunya belum dipikirkan — dicatat untuk irisan 3.
 */
export async function submitGive(formData: FormData): Promise<void> {
  const amount = Number(formData.get('amount') ?? 0);
  const causeRaw = String(formData.get('cause') ?? '');
  const note = String(formData.get('note') ?? '').trim() || undefined;
  const cause = (GIVE_CAUSES as readonly string[]).includes(causeRaw)
    ? (causeRaw as GiveCause)
    : undefined;

  const data = await getKidData();
  const back = `/give?amount=${amount}&cause=${causeRaw}${note ? `&note=${encodeURIComponent(note)}` : ''}`;

  if (!cause || !data.giveWalletId) redirect(back);

  const check = validateGive(
    { amount, sourceWalletId: data.giveWalletId, cause, note },
    data.giveBalance,
  );
  if (!check.ok) redirect(back);

  const { error } = await serviceClient().from('requests').insert({
    child_id: data.child.id,
    kind: 'give_away',
    amount,
    source_wallet_id: data.giveWalletId,
    // Alasan OPSIONAL untuk Give — jangan pajaki kemurahan hati (ADR-0006).
    reason: note ?? null,
    status: 'needs_ok',
    fulfilment: 'todo',
  });

  if (error) {
    console.error('submitGive gagal:', error.message);
    redirect(`${back}&e=failed`);
  }

  revalidatePath('/give');
  revalidatePath('/requests');
  revalidatePath('/');
  redirect('/give?sent=1');
}

/**
 * Harvest — request juga, bukan ledger (ADR-0002). Tapi berbeda dari Give dalam satu hal yang
 * penting: uangnya **tetap di dalam app**, jadi ia harus mendarat di suatu tempat yang jelas.
 *
 * Tujuan dipilih ANAK dan ikut tercatat (migrasi 0011). Kalau tidak, ortu yang menebak saat
 * menyetujui — dan anak yang memilih "BMX Bike" bisa menemukan uangnya di "Free savings" tanpa
 * pernah tahu pilihannya diabaikan. ADR-0003 menjadikan ortu bank, bukan pemilik keputusan.
 *
 * `canHarvestTo()` diperiksa ulang di sini, bukan cuma dipakai untuk merender daftar: yang
 * menentukan bukan apa yang tampil di layar, melainkan apa yang boleh masuk ke database.
 */
export async function submitHarvest(formData: FormData): Promise<void> {
  const fromId = String(formData.get('from') ?? '');
  const toId = String(formData.get('to') ?? '');
  const choiceRaw = String(formData.get('choice') ?? '');

  const data = await getKidData();
  const back = `/grow?harvest=${fromId}`;

  const source = data.grow.find((g) => g.wallet.id === fromId);
  const destination = data.wallets.find((w) => w.wallet.id === toId)?.wallet;
  if (!source || !destination) redirect(back);

  // Grow keluar HANYA lewat Harvest, dan Harvest mendarat HANYA di Save (ADR-0003).
  if (!canHarvestTo(destination)) redirect(back);

  const isTd = source.wallet.instrument === 'time_deposit';
  const choice: HarvestChoice | null =
    isTd && ['cash_out', 'roll_over', 'take_profit'].includes(choiceRaw)
      ? (choiceRaw as HarvestChoice)
      : null;
  if (isTd && !choice) redirect(back);

  const amount = source.position.valueNow;
  if (amount <= 0) redirect(back);

  const { error } = await serviceClient().from('requests').insert({
    child_id: data.child.id,
    kind: 'harvest',
    amount,
    source_wallet_id: source.wallet.id,
    destination_wallet_id: destination.id,
    harvest_choice: choice,
    status: 'needs_ok',
    // Harvest jalur "instan": menyetujui = selesai, tidak ada tugas dunia nyata yang tersisa
    // untuk ortu (fulfilmentPath di packages/core/src/requests.ts).
    fulfilment: 'not_applicable',
  });

  if (error) {
    console.error('submitHarvest gagal:', error.message);
    redirect(`${back}&e=failed`);
  }

  revalidatePath('/grow');
  revalidatePath('/requests');
  revalidatePath('/');
  redirect('/requests');
}
