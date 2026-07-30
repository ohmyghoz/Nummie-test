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
  approve, decline, markDone, postsLedgerOn, talkAboutIt, tdHarvestOutcome,
  type MoneyRequest,
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
