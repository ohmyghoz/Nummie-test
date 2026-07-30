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
  GIVE_CAUSES, canHarvestTo, canOpenSort, growInPlan, movePlan, redeemGems, validateGive,
  type GiveCause, type HarvestChoice, type Tenor,
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

/**
 * Add money to Grow — setoran ke instrumen.
 *
 * Request, bukan ledger: masuk ke Grow SELALU lewat persetujuan ortu, karena ortu yang menanggung
 * risiko pasarnya (ADR-0003). Uang tidak bergerak sampai ia menekan approve.
 *
 * Asimetris dengan Harvest, dan itu memang kebijakannya: keluar hanya lewat Harvest ke Save,
 * masuk hanya lewat pengajuan. `movePlan` tidak bisa dipakai di sini — ia menolak Grow sebagai
 * tujuan (`move.destinationNotAllowed`).
 *
 * Perhatikan `growInPlan()` dipanggil dengan aturan yang sama yang dipakai layarnya untuk
 * pratinjau, termasuk bunga yang dijanjikan. Bunga yang baru terlihat setelah disetujui adalah
 * janji yang tidak pernah dibaca.
 */
export async function submitGrowIn(formData: FormData): Promise<void> {
  const fromId = String(formData.get('from') ?? '');
  const toId = String(formData.get('to') ?? '');
  const amount = Number(formData.get('amount') ?? 0);
  const tenorRaw = Number(formData.get('tenor') ?? 0);

  const data = await getKidData();
  const back = `/grow?fund=${toId}&from=${fromId}&amount=${amount || ''}`;

  const from = data.wallets.find((w) => w.wallet.id === fromId)?.wallet;
  const to = data.wallets.find((w) => w.wallet.id === toId)?.wallet;
  if (!from || !to) redirect('/grow');

  const tenor = [3, 6, 12].includes(tenorRaw) ? (tenorRaw as Tenor) : undefined;

  const plan = growInPlan(from, to, amount, data.balances, data.prices, tenor);
  if (!plan.ok) redirect(`${back}&e=${plan.errorKey ?? 'failed'}`);

  const { error } = await serviceClient().from('requests').insert({
    child_id: data.child.id,
    kind: 'grow_in',
    amount,
    source_wallet_id: from.id,
    // Instrumen tujuannya WAJIB tercatat (constraint `grow_in_needs_destination`, 0014) —
    // ortu tidak boleh menebak setoran ini mendarat di mana.
    destination_wallet_id: to.id,
    // Tenor cuma berarti untuk deposito; constraint `grow_tenor_only_on_grow_in` menjaga
    // kolomnya, dan `growInPlan` sudah menolak deposito tanpa tenor.
    grow_tenor_months: tenor ?? null,
    status: 'needs_ok',
    // Jalur instan (requests.ts:19): menyetujui = selesai, tidak ada tugas dunia nyata sisa.
    fulfilment: 'not_applicable',
  });

  if (error) {
    console.error('submitGrowIn gagal:', error.message);
    redirect(`${back}&e=failed`);
  }

  revalidatePath('/grow');
  revalidatePath('/requests');
  revalidatePath('/');
  redirect('/requests');
}

/**
 * Anak menandai job selesai → request `mission_claim` → ortu.
 *
 * Anak yang menandai, bukan ortu (handoff §129). Alasannya bukan kemudahan: pekerjaan yang harus
 * "dilaporkan" ke ortu untuk diakui mengajari anak bahwa yang penting pengawasan, bukan
 * pekerjaannya. Ortu tetap memutuskan — tapi anak yang mengangkat tangan.
 *
 * Jalur INSTAN: menyetujui = selesai, karena rewardnya cuma angka (💎 atau rupiah ke Unsorted),
 * tidak ada tugas dunia nyata yang tersisa (requests.ts:19).
 */
export async function claimJob(formData: FormData): Promise<void> {
  const jobId = String(formData.get('job') ?? '');

  const data = await getKidData();
  // Job dicari di daftar yang SUDAH tergerbang (`availableJobs` di data.ts). Job yang terkunci
  // gerbang tidak akan ketemu di sini — jadi gerbangnya bukan cuma soal apa yang tampil.
  const job = data.jobs.find((j) => j.id === jobId);
  if (!job) redirect('/missions');

  // Sudah pernah diklaim dan masih menunggu? Jangan biarkan dua klaim untuk satu pekerjaan.
  const pending = data.requests.some(
    (r) => r.kind === 'mission_claim' && r.status === 'needs_ok' && r.jobId === job.id,
  );
  if (pending) redirect('/requests');

  const { error } = await serviceClient().from('requests').insert({
    child_id: data.child.id,
    kind: 'mission_claim',
    // `amount` kolom RUPIAH. Untuk job ber-💎 ia tidak dipakai — jumlah 💎 diturunkan dari
    // `jobs.amount` lewat job_id (0015). Satu kolom dua arti adalah cara keputusan mati.
    amount: job.reward === 'money' ? job.amount : null,
    job_id: job.id,
    status: 'needs_ok',
    fulfilment: 'not_applicable',
  });

  if (error) {
    console.error('claimJob gagal:', error.message);
    redirect('/missions?e=failed');
  }

  revalidatePath('/missions');
  revalidatePath('/requests');
  revalidatePath('/me');
  redirect('/requests');
}

/**
 * Anak menukar 💎 jadi hadiah nyata → request `prize` → ortu.
 *
 * Jalur TO-DO, bukan instan (ADR-0002): menyetujui belum berarti selesai, karena ortu harus
 * BENAR-BENAR memberikan 1 jam main itu. Janji yang tidak ditepati merusak kepercayaan pada
 * seluruh sistem — dan itu sebabnya `prize` tidak pernah masuk INSTANT_KINDS.
 *
 * Tiga gerbang diperiksa `redeemGems()` di core: materi mingguan, hadiah besar (≥25 💎), lalu
 * saldo. Diperiksa ULANG di sini, bukan cuma dipakai merender daftar.
 */
export async function redeemPrize(formData: FormData): Promise<void> {
  const prizeId = String(formData.get('prize') ?? '');

  const data = await getKidData();
  const prize = data.prizes.find((p) => p.id === prizeId);
  if (!prize) redirect('/me');

  const check = redeemGems(data.economy, prize.gemCost);
  if (!check.ok) redirect(`/me?e=${check.errorKey ?? 'failed'}`);

  /*
   * 💎 dipotong di sini, saat DIAJUKAN — bukan saat ortu menyetujui.
   *
   * Alasannya sama dengan U-10 (request tidak memesan saldo uang): tanpa memotong sekarang, anak
   * bisa mengajukan tiga hadiah dengan 💎 yang cukup untuk satu, dan ortu yang menemukan
   * kegagalannya. Kalau ortu menolak, baris pembalik yang mengembalikan 💎-nya — dan ledger
   * membuat pengembalian itu punya jejak, bukan diam-diam.
   */
  const db = serviceClient();
  const { data: req, error } = await db.from('requests')
    .insert({
      child_id: data.child.id,
      kind: 'prize',
      prize_id: prize.id,
      status: 'needs_ok',
      // TO-DO: ortu masih harus benar-benar memberikannya (ADR-0002).
      fulfilment: 'todo',
    })
    .select('id')
    .single();

  if (error || !req) {
    console.error('redeemPrize gagal:', error?.message);
    redirect('/me?e=failed');
  }

  const { error: gemError } = await db.from('gem_entries').insert({
    child_id: data.child.id,
    delta: -prize.gemCost,
    reason: 'prize',
    request_id: req.id,
  });

  if (gemError) {
    // Trigger `no_gem_overdraft` (0015) menangkap balapan yang lolos pemeriksaan di atas.
    console.error('redeemPrize: 💎 gagal dipotong:', gemError.message);
    redirect('/me?e=gems.insufficient');
  }

  revalidatePath('/me');
  revalidatePath('/requests');
  redirect('/requests');
}
