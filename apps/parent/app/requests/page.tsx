import { formatRp, fulfilmentPath, postsLedgerOn, type MoneyRequest } from '@nummi/core';
import { findChild, getParentData } from '../../lib/data';
import { dict, fill } from '../../lib/copy';
import { Nav, TopBar } from '../../components/ui';
import {
  approveRequest, declineRequest, markRequestDone, talkAboutRequest,
} from '../../lib/actions';

// Lewat kamus, bukan teks mati (aturan copy CLAUDE.md). Tipenya tetap dikunci ke
// `MoneyRequest['kind']` supaya jalur keenam tidak bisa lahir tanpa label.
const KIND_LABEL: Record<MoneyRequest['kind'], string> = dict.requestKind;

/**
 * Approval inbox lima jalur — layar tempat siklus uang benar-benar ditutup.
 *
 * Seluruh keputusan dijalankan oleh `@nummi/core` (approve / decline / talkAboutIt / markDone).
 * Tidak ada satu pun aturan yang ditulis ulang di sini: kalau UI boleh punya versinya sendiri,
 * "approve ≠ fulfil" akan mati diam-diam di layar, walaupun datanya benar.
 */
export default async function InboxPage({
  searchParams,
}: { searchParams: Promise<{ child?: string; e?: string }> }) {
  const sp = await searchParams;
  const data = await getParentData();
  const child = findChild(data, sp.child);
  const pending = data.children.reduce((n, c) => n + c.openRequests.length, 0);

  // Blok "pratinjau keputusan" yang dulu ada di sini sudah dihapus. Ia menghitung hasil approve
  // lewat query param dan menampilkannya seolah tersimpan — padahal tidak ada apa pun yang
  // tercatat. Sekarang keputusannya dijalankan server action, jadi yang dirender di bawah selalu
  // keadaan yang BENAR-BENAR ada di database.

  return (
    <>
      <main className="wrap">
        <TopBar parentName={data.parentName} />
        <h1 style={{ fontSize: 19, fontWeight: 800, marginBottom: 12 }}>
          {dict.parent.inbox} · {child.name}
        </h1>

        {sp.e === 'request.giveNeedsStory' && (
          <div className="errbox">{dict.parent.storyMissing}</div>
        )}
        {sp.e === 'failed' && <div className="errbox">{dict.parent.decisionFailed}</div>}

        {child.requests.length === 0 ? (
          <div className="card"><p className="sub">{dict.parent.noPending}</p></div>
        ) : (
          child.requests.map((r) => {
            const instant = fulfilmentPath(r.kind) === 'instant';
            // Kalau ada aksi untuk baris ini, tampilkan hasilnya; kalau tidak, keadaan sekarang.
            const shown = r;
            const isDebt = shown.status === 'approved' && shown.fulfilment === 'todo';
            const open = shown.status === 'needs_ok' || shown.status === 'talk_about_it';

            return (
              <div className="card" key={r.id}>
                <div className="kid">
                  <span className="nm">{KIND_LABEL[r.kind]}</span>
                  <span className="tot num">{formatRp(r.amount)}</span>
                </div>
                {r.reason && <p className="sub" style={{ marginTop: 4 }}>“{r.reason}”</p>}

                {/* Jalurnya ditulis apa adanya SEBELUM ortu menekan apa pun — supaya ia tahu
                    apakah menyetujui berarti selesai, atau masih meninggalkan tugas. */}
                <p className="sub" style={{ marginTop: 8 }}>
                  {instant ? `⚡ ${dict.parent.instant}` : `📌 ${dict.parent.toDo}`}
                  {' · '}
                  ledger: {postsLedgerOn(r.kind)}
                </p>

                <div style={{ marginTop: 8, display: 'flex', gap: 7, flexWrap: 'wrap' }}>
                  <span className={`pill ${shown.status === 'approved' ? 'ok' : shown.status === 'declined' ? 'risk' : 'warn'}`}>
                    {shown.status}
                  </span>
                  <span className="pill">{shown.fulfilment}</span>
                  {isDebt && <span className="pill risk">{dict.parent.promiseDebt}</span>}
                </div>

                {/* Sampai 30 Juli 2026 ketiga tombol ini `<a href>` yang cuma memPRATINJAU
                    keputusannya lewat query param. Sekarang mereka benar-benar memutuskan —
                    dan untuk jalur instan, benar-benar memindahkan uang. */}
                {open && (
                  <div className="btnrow">
                    <form action={approveRequest}>
                      <input type="hidden" name="id" value={r.id} />
                      <button className="btn primary" type="submit">{dict.common.approve}</button>
                    </form>
                    {/* Jawaban KETIGA — supaya menolak tanpa penjelasan bukan satu-satunya jalan. */}
                    <form action={talkAboutRequest}>
                      <input type="hidden" name="id" value={r.id} />
                      <button className="btn ghost" type="submit">{dict.common.talkAboutIt}</button>
                    </form>
                    <form action={declineRequest}>
                      <input type="hidden" name="id" value={r.id} />
                      <button className="btn danger" type="submit">{dict.common.decline}</button>
                    </form>
                  </div>
                )}

                {isDebt && r.kind !== 'give_away' && (
                  <div className="btnrow">
                    <form action={markRequestDone}>
                      <input type="hidden" name="id" value={r.id} />
                      <button className="btn primary" type="submit">{dict.parent.markDone}</button>
                    </form>
                  </div>
                )}

                {/* Give TIDAK punya "Mark as done" polos — yang ada form cerita WAJIB.
                    Tanpa cerita, Give tak beda dari uang yang hilang (ADR-0006). */}
                {isDebt && r.kind === 'give_away' && (
                  <form action={markRequestDone} style={{ marginTop: 10 }}>
                    <input type="hidden" name="id" value={r.id} />
                    <label className="sub">{dict.parent.storyRequired}</label>
                    <input
                      className="field" type="text" name="story"
                      placeholder={dict.parent.storyPlaceholder} style={{ marginTop: 6 }}
                    />
                    <button className="btn primary" type="submit" style={{ marginTop: 8 }}>
                      {dict.parent.markDone}
                    </button>
                  </form>
                )}

                {shown.fulfilment === 'done' && shown.fulfilmentStory && (
                  <p className="note" style={{ marginTop: 10 }}>
                    {fill(dict.parent.notificationPreview, { child: child.name })} “{shown.fulfilmentStory}”
                  </p>
                )}
              </div>
            );
          })
        )}
      </main>
      <Nav active="inbox" pending={pending} />
    </>
  );
}
