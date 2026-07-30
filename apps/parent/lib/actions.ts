'use server';

/**
 * Keputusan ortu — tempat siklus uang benar-benar ditutup.
 *
 * ── ADR-0002 hidup atau mati di berkas ini ───────────────────────────────────
 * "Approve ≠ fulfil" bukan gaya penulisan, ia dua kolom terpisah (`status`, `fulfilment`) dan
 * dua saat berbeda untuk menulis ledger:
 *
 *   Jalur INSTAN  (harvest, grow_in, mission_claim) → ledger ditulis saat **approve**.
 *                 Tidak ada tugas dunia nyata yang tersisa; uangnya cuma berpindah kantong.
 *   Jalur TO-DO   (cash_out, give_away, prize)      → ledger ditulis saat **done**.
 *                 Kalau ditulis saat approve, saldo anak berkurang padahal ortu belum
 *                 benar-benar menyerahkan uangnya. Itu kebohongan yang paling mahal di app ini.
 *
 * Yang memutuskan jalur mana BUKAN kode di sini, melainkan `postsLedgerOn()` di
 * `@nummi/core`. Kalau berkas ini punya daftar sendiri, ADR-0002 akan mati diam-diam.
 *
 * ── Tiga aturan yang tidak boleh dilanggar ───────────────────────────────────
 *  1. **Request dicari lewat pembacaan ber-token ortu**, bukan dipercaya dari formData.
 *     Id request milik keluarga lain sederhananya tidak akan ketemu — RLS yang menjaganya.
 *  2. **Transisi status dijalankan `@nummi/core`** (approve/decline/talkAboutIt/markDone),
 *     bukan ditulis ulang. Layar pratinjau memakai fungsi yang sama, jadi apa yang dilihat
 *     ortu dan apa yang tersimpan tidak bisa berbeda.
 *  3. **Nominal Harvest dihitung ulang dari pilihan anak**, tidak diambil dari `amount`.
 *     `roll_over` memindahkan NOL rupiah — uangnya lanjut bekerja. Memakai `amount` mentah
 *     akan memindahkan seluruh nilai deposito ke Save, kebalikan dari yang anak pilih.
 */
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import {
  CATEGORIES,
  approve, decline, markDone, postsLedgerOn, talkAboutIt, tdHarvestOutcome,
  STARTER_WALLETS, validateAutoSplit, validateChild, validateSend, validateTake,
  type Category, type MoneyRequest, type MoneyRules, type RuleMode, type SendSource,
  type Tier,
} from '@nummi/core';
import { getParentData, type ChildView } from './data';
import { serviceClient } from './supabase';

interface Found {
  request: MoneyRequest;
  parentId: string;
  childId: string;
  child: ChildView;
  /** baris DB mentah — perlu untuk kolom yang tidak ada di MoneyRequest */
  raw: { destination_wallet_id: string | null; harvest_choice: string | null };
}

/** Cari request lewat data yang dibaca dengan token ortu. Kalau tidak ketemu, tidak terjadi apa-apa. */
async function findRequest(requestId: string): Promise<Found | null> {
  const data = await getParentData();
  for (const child of data.children) {
    const request = child.requests.find((r) => r.id === requestId);
    if (request) {
      // Kolom khusus harvest tidak ada di bentuk `MoneyRequest` core (core tidak tahu-menahu
      // soal skema). Diambil terpisah, tetap lewat service role SETELAH kepemilikan terbukti.
      const { data: raw } = await serviceClient()
        .from('requests')
        .select('destination_wallet_id, harvest_choice')
        .eq('id', requestId)
        .maybeSingle();
      return {
        request,
        parentId: data.parentId,
        childId: child.id,
        child,
        raw: raw ?? { destination_wallet_id: null, harvest_choice: null },
      };
    }
  }
  return null;
}

/** Baris ledger untuk sebuah request yang sudah boleh menggerakkan uang. */
function ledgerRowFor(found: Found): Record<string, unknown> | null {
  const { request: r, raw, childId } = found;

  switch (r.kind) {
    // Uang KELUAR dari app: tujuan null. Yang terjadi setelahnya ada di dunia nyata.
    case 'cash_out':
    case 'give_away':
      return {
        child_id: childId,
        from_wallet_id: r.sourceWalletId ?? null,
        to_wallet_id: null,
        amount: r.amount,
        reason: r.kind,
        request_id: r.id,
      };

    case 'harvest': {
      if (!raw.destination_wallet_id) return null;

      // Pilihan anak yang menentukan berapa yang pindah — dan untuk itu POKOK dan BUNGA harus
      // dipisah, karena `take_profit` memindahkan bunganya saja. Request cuma menyimpan nilai
      // sekarang, jadi pokoknya diambil dari ledger (jumlah baris `grow_in` ke wallet itu),
      // persis sumber yang dipakai layar Grow anak.
      const inv = found.child.investments.find((i) => i.wallet.id === r.sourceWalletId);
      const principal = inv?.rupiahIn ?? 0;
      const interest = (inv?.valueNow ?? r.amount) - principal;

      const amount = raw.harvest_choice
        ? tdHarvestOutcome(
            principal, interest,
            raw.harvest_choice as 'cash_out' | 'roll_over' | 'take_profit',
          ).toSave
        : r.amount;
      // `roll_over` = nol rupiah pindah. Baris ledger bernilai nol dilarang skema
      // (`amount > 0`) — dan itu benar: tidak ada yang bergerak, jadi tidak ada yang dicatat.
      if (amount <= 0) return null;
      return {
        child_id: childId,
        from_wallet_id: r.sourceWalletId ?? null,
        to_wallet_id: raw.destination_wallet_id,
        amount,
        reason: 'harvest',
        request_id: r.id,
      };
    }

    default:
      // grow_in, prize, mission_claim: belum ada jalurnya di app anak, jadi belum ada
      // request-nya yang bisa disetujui. Sengaja tidak diarang-arang sekarang.
      return null;
  }
}

export async function approveRequest(formData: FormData): Promise<void> {
  const id = String(formData.get('id') ?? '');
  const found = await findRequest(id);
  if (!found) redirect('/requests');

  const transition = approve(found.request, found.parentId);
  if (!transition.ok || !transition.request) redirect('/requests');

  const db = serviceClient();

  // Ledger DULU, status kemudian: kalau saldo tidak cukup, trigger no_overdraft (0010)
  // menolak dan statusnya tidak pernah berubah. Urutan sebaliknya akan meninggalkan request
  // "approved" yang uangnya tidak pernah pindah — utang janji palsu di kolom yang salah.
  if (postsLedgerOn(found.request.kind) === 'approve') {
    const row = ledgerRowFor(found);
    if (row) {
      const { error } = await db.from('ledger_entries').insert(row);
      if (error) {
        console.error('approve: ledger gagal:', error.message);
        redirect(`/requests?child=${found.childId}&e=failed`);
      }
    }
  }

  const next = transition.request;
  const { error } = await db.from('requests')
    .update({
      status: next.status,
      fulfilment: next.fulfilment,
      decided_by: found.parentId,
      decided_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) {
    console.error('approve: status gagal:', error.message);
    redirect(`/requests?child=${found.childId}&e=failed`);
  }

  revalidateAll();
  redirect(`/requests?child=${found.childId}`);
}

export async function declineRequest(formData: FormData): Promise<void> {
  await decide(formData, 'decline');
}

export async function talkAboutRequest(formData: FormData): Promise<void> {
  await decide(formData, 'talk');
}

async function decide(formData: FormData, kind: 'decline' | 'talk'): Promise<void> {
  const id = String(formData.get('id') ?? '');
  const found = await findRequest(id);
  if (!found) redirect('/requests');

  const transition = kind === 'decline'
    ? decline(found.request, found.parentId)
    : talkAboutIt(found.request, found.parentId);
  if (!transition.ok || !transition.request) redirect('/requests');

  // Menolak dan "bicarakan dulu" TIDAK menyentuh ledger. Tidak ada uang yang bergerak,
  // jadi tidak ada yang perlu dicatat — dan itu sebabnya keduanya aman diulang.
  const { error } = await serviceClient().from('requests')
    .update({
      status: transition.request.status,
      fulfilment: transition.request.fulfilment,
      decided_by: found.parentId,
      decided_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) {
    console.error(`${kind} gagal:`, error.message);
    redirect(`/requests?child=${found.childId}&e=failed`);
  }

  revalidateAll();
  redirect(`/requests?child=${found.childId}`);
}

export async function markRequestDone(formData: FormData): Promise<void> {
  const id = String(formData.get('id') ?? '');
  const story = String(formData.get('story') ?? '').trim() || undefined;

  const found = await findRequest(id);
  if (!found) redirect('/requests');

  // Give tidak bisa ditutup tanpa cerita (ADR-0006) — dan yang menegakkannya `markDone()`
  // di core, bukan pemeriksaan tambahan di sini.
  const transition = markDone(found.request, story);
  if (!transition.ok || !transition.request) {
    redirect(`/requests?child=${found.childId}&e=${transition.errorKey ?? 'failed'}`);
  }

  const db = serviceClient();

  // Inilah saat uang benar-benar berpindah untuk jalur to-do (ADR-0002).
  const row = ledgerRowFor(found);
  if (row) {
    const { error } = await db.from('ledger_entries').insert(row);
    if (error) {
      console.error('markDone: ledger gagal:', error.message);
      redirect(`/requests?child=${found.childId}&e=failed`);
    }
  }

  const next = transition.request;
  const { error } = await db.from('requests')
    .update({ fulfilment: next.fulfilment, fulfilment_story: next.fulfilmentStory ?? null })
    .eq('id', id);

  if (error) {
    console.error('markDone: status gagal:', error.message);
    redirect(`/requests?child=${found.childId}&e=failed`);
  }

  revalidateAll();
  redirect(`/requests?child=${found.childId}`);
}

function revalidateAll(): void {
  revalidatePath('/');
  revalidatePath('/requests');
  revalidatePath('/transactions');
}

/**
 * Send money — uang masuk dari luar app. Satu-satunya jalur di seluruh sistem yang MENAMBAH
 * total anak, dan itu sebabnya `from_wallet_id` null di sini bukan lubang melainkan definisi:
 * uangnya memang datang dari dunia nyata, dari kantong ortu.
 *
 * Tujuannya SELALU Unsorted (`sendLandsIn`), tidak pernah bisa dipilih ortu. Itu keputusan
 * produk, bukan penyederhanaan: yang memberi tugas pada uang adalah anak. Ortu yang bisa
 * mengirim langsung ke "Tabungan" akan mengambil alih pelajarannya.
 */
export async function sendMoney(formData: FormData): Promise<void> {
  const childId = String(formData.get('child') ?? '');
  const amount = Number(formData.get('amount') ?? 0);
  const source = String(formData.get('source') ?? '');
  const note = String(formData.get('note') ?? '').trim() || undefined;

  const data = await getParentData();
  const child = data.children.find((c) => c.id === childId);
  if (!child) redirect('/send');

  const back = `/send?child=${childId}&amount=${amount}&source=${source}`;

  const check = validateSend({ amount, source: source as SendSource, note });
  if (!check.ok) redirect(back);

  const landing = child.unsortedWallet;
  if (!landing) redirect(back);

  const { error } = await serviceClient().from('ledger_entries').insert({
    child_id: child.id,
    from_wallet_id: null,
    to_wallet_id: landing.id,
    amount,
    reason: 'send_money',
    created_by: data.parentId,
  });

  if (error) {
    console.error('sendMoney gagal:', error.message);
    redirect(`${back}&e=failed`);
  }

  revalidateAll();
  redirect(`/?child=${childId}&sent=1`);
}

/**
 * Take money — ortu mengambil kembali. Jalur yang paling perlu dijaga di seluruh app ortu.
 *
 * I7 (invariant): take TIDAK PERNAH bisa menyentuh dream, Give, dan Grow. Yang menegakkannya
 * `validateTake()` → `canParentTakeFrom()` di core, dan layar sengaja TETAP MENAMPILKAN kantong
 * terlindungi itu (bukan menyembunyikannya) supaya ortu melihat aturannya, bukan bingung ke mana
 * kantongnya pergi.
 *
 * Diperiksa ulang di sini, bukan cuma dipakai merender: yang menentukan bukan apa yang tampil.
 */
export async function takeMoney(formData: FormData): Promise<void> {
  const childId = String(formData.get('child') ?? '');
  const walletId = String(formData.get('wallet') ?? '');
  const amount = Number(formData.get('amount') ?? 0);
  const reason = String(formData.get('reason') ?? '').trim();

  const data = await getParentData();
  const child = data.children.find((c) => c.id === childId);
  const wallet = child?.wallets.find((w) => w.id === walletId);
  if (!child || !wallet) redirect('/take');

  const back = `/take?child=${childId}&wallet=${walletId}&amount=${amount}`;

  const check = validateTake(wallet, amount, child.balances[wallet.id] ?? 0, reason);
  if (!check.ok) redirect(back);

  const { error } = await serviceClient().from('ledger_entries').insert({
    child_id: child.id,
    from_wallet_id: wallet.id,
    to_wallet_id: null,
    amount,
    reason: 'take_money',
    created_by: data.parentId,
  });

  if (error) {
    console.error('takeMoney gagal:', error.message);
    redirect(`${back}&e=failed`);
  }

  revalidateAll();
  redirect(`/?child=${childId}&took=1`);
}

/**
 * Money rules — mode Strict/Flexible dan rasio auto-split.
 *
 * Ini setelan yang paling langsung terasa di app anak: `sortPlan()` di sisi anak membaca baris
 * yang sama, jadi Strict yang dinyalakan di sini benar-benar mengunci layar Sort anak dan
 * rasio yang diubah di sini langsung mengubah angka yang dilihat anak. Tidak ada salinan.
 *
 * `validateAutoSplit()` yang memutuskan sah atau tidak — termasuk aturan bahwa di Strict rasio
 * WAJIB habis 100% (uang tidak boleh menganggur di Unsorted saat anak tidak boleh menyortir).
 */
export async function saveMoneyRules(formData: FormData): Promise<void> {
  const childId = String(formData.get('child') ?? '');
  const mode = String(formData.get('mode') ?? '') as RuleMode;

  const data = await getParentData();
  const child = data.children.find((c) => c.id === childId);
  if (!child || (mode !== 'flexible' && mode !== 'strict')) redirect('/');

  const ratios: Partial<Record<Category, number>> = {};
  for (const category of CATEGORIES) {
    const raw = formData.get(`ratio_${category}`);
    if (raw !== null) {
      const n = Number(raw);
      if (Number.isFinite(n) && n > 0) ratios[category] = Math.round(n);
    }
  }

  const next: MoneyRules = {
    childId: child.id,
    mode,
    autoSplit: { ...child.rules.autoSplit, ratios },
  };

  const check = validateAutoSplit(next);
  const back = `/rules?child=${childId}`;
  if (!check.ok) redirect(`${back}&e=${check.errorKey ?? 'failed'}`);

  const { error } = await serviceClient().from('money_rules')
    .update({
      mode: next.mode,
      auto_split_enabled: next.autoSplit.enabled,
      ratios,
      updated_at: new Date().toISOString(),
    })
    .eq('child_id', child.id);

  if (error) {
    console.error('saveMoneyRules gagal:', error.message);
    redirect(`${back}&e=failed`);
  }

  revalidatePath('/rules');
  revalidateAll();
  redirect(`${back}&saved=1`);
}

/**
 * Add a child — satu langkah ortu, empat penulisan yang harus jadi atau gagal bersama.
 *
 * Anak tanpa wallet awal adalah anak yang tidak bisa menerima uang. Anak tanpa `money_rules`
 * membuat layar Sort-nya kosong. Anak tanpa `child_economy` membuat layar Me-nya pecah. Ketiganya
 * bukan "nanti diisi" — mereka bagian dari apa artinya seorang anak ada di sistem ini.
 *
 * PIN wajib unik dalam keluarga (ADR-0012 §A2), dan itu TIDAK bisa dijaga constraint karena
 * bcrypt memberi salt berbeda tiap baris. Diperiksa `family_pin_taken()` sebelum menulis.
 */
export async function addChild(formData: FormData): Promise<void> {
  const name = String(formData.get('name') ?? '').trim();
  const birthMonth = Number(formData.get('month') ?? 0);
  const birthYear = Number(formData.get('year') ?? 0);
  const tier = String(formData.get('tier') ?? 'middle') as Tier;
  const pin = String(formData.get('pin') ?? '').trim();

  const data = await getParentData();
  const db = serviceClient();

  const q = new URLSearchParams({ name, month: String(birthMonth), year: String(birthYear), tier });
  const back = `/children/new?${q.toString()}`;

  // Keluarga si ortu — dibaca SETELAH identitasnya terbukti dari token, bukan dari input.
  const { data: me } = await db.from('parents')
    .select('family_id').eq('id', data.parentId).maybeSingle();
  if (!me) redirect('/login');

  // PIN kembar bikin login "kode keluarga + PIN" tidak punya jawaban tunggal (ADR-0012 §A1),
  // dan keunikannya tidak bisa dijaga constraint karena salt bcrypt berbeda tiap baris.
  const { data: taken } = await db.rpc('family_pin_taken', {
    p_family_id: me.family_id, p_pin: pin,
  });

  const check = validateChild(
    { name, birthMonth, birthYear, tier, pin },
    data.today,
    { pinTakenInFamily: taken === true },
  );
  if (!check.ok) redirect(`${back}&e=${check.errorKey ?? 'failed'}`);

  // SATU panggilan, satu transaksi: anak + wallet awal + money_rules + child_economy.
  // Kalau salah satu gagal, tidak ada anak setengah jadi yang tertinggal (migrasi 0012).
  // `STARTER_WALLETS` dikirim dari core supaya daftar itu tidak punya rumah kedua di SQL.
  const { data: childId, error } = await db.rpc('create_child', {
    p_family_id: me.family_id,
    p_name: name,
    p_birth_month: birthMonth,
    p_birth_year: birthYear,
    p_tier: tier,
    p_pin: pin,
    p_wallets: STARTER_WALLETS,
  });

  if (error || !childId) {
    console.error('addChild gagal:', error?.message);
    redirect(`${back}&e=failed`);
  }

  revalidateAll();
  redirect(`/?child=${childId}&added=1`);
}
