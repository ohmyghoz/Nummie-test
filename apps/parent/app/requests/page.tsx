import {
  approve, decline, formatRp, fulfilmentPath, markDone, postsLedgerOn, talkAboutIt,
  type MoneyRequest,
} from '@nummi/core';
import { findChild, getParentData } from '../../lib/data';
import { dict, fill } from '../../lib/copy';
import { Nav, TopBar } from '../../components/ui';

const KIND_LABEL: Record<MoneyRequest['kind'], string> = {
  cash_out: 'Cash out', give_away: 'Giving', prize: 'Prize',
  mission_claim: 'Mission', grow_in: 'Grow', harvest: 'Harvest',
};

/**
 * Approval inbox lima jalur — layar tempat siklus uang benar-benar ditutup.
 *
 * Seluruh keputusan dijalankan oleh `@nummi/core` (approve / decline / talkAboutIt / markDone).
 * Tidak ada satu pun aturan yang ditulis ulang di sini: kalau UI boleh punya versinya sendiri,
 * "approve ≠ fulfil" akan mati diam-diam di layar, walaupun datanya benar.
 */
export default async function InboxPage({
  searchParams,
}: { searchParams: Promise<{ child?: string; act?: string; id?: string; story?: string }> }) {
  const sp = await searchParams;
  const data = getParentData();
  const child = findChild(data, sp.child);
  const pending = data.children.reduce((n, c) => n + c.openRequests.length, 0);

  // Pratinjau hasil keputusan. Belum persisten — penulisan ledger menunggu S1b.
  const acted = (() => {
    const target = child.requests.find((r) => r.id === sp.id);
    if (!target || !sp.act) return undefined;
    if (sp.act === 'approve') return approve(target, 'parent_1');
    if (sp.act === 'decline') return decline(target, 'parent_1');
    if (sp.act === 'talk') return talkAboutIt(target, 'parent_1');
    if (sp.act === 'done') return markDone(target, sp.story);
    return undefined;
  })();

  return (
    <>
      <main className="wrap">
        <TopBar parentName={data.parentName} />
        <h1 style={{ fontSize: 19, fontWeight: 800, marginBottom: 12 }}>
          {dict.parent.inbox} · {child.name}
        </h1>

        {acted && !acted.ok && acted.errorKey === 'request.giveNeedsStory' && (
          <div className="errbox">{dict.parent.storyMissing}</div>
        )}

        {child.requests.length === 0 ? (
          <div className="card"><p className="sub">{dict.parent.noPending}</p></div>
        ) : (
          child.requests.map((r) => {
            const instant = fulfilmentPath(r.kind) === 'instant';
            // Kalau ada aksi untuk baris ini, tampilkan hasilnya; kalau tidak, keadaan sekarang.
            const shown = acted?.ok && acted.request?.id === r.id ? acted.request : r;
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

                {open && (
                  <div className="btnrow">
                    <a className="btn primary" href={`/requests?child=${child.id}&act=approve&id=${r.id}`}>
                      {dict.common.approve}
                    </a>
                    {/* Jawaban KETIGA — supaya menolak tanpa penjelasan bukan satu-satunya jalan. */}
                    <a className="btn ghost" href={`/requests?child=${child.id}&act=talk&id=${r.id}`}>
                      {dict.common.talkAboutIt}
                    </a>
                    <a className="btn danger" href={`/requests?child=${child.id}&act=decline&id=${r.id}`}>
                      {dict.common.decline}
                    </a>
                  </div>
                )}

                {isDebt && r.kind !== 'give_away' && (
                  <div className="btnrow">
                    <a className="btn primary" href={`/requests?child=${child.id}&act=done&id=${r.id}`}>
                      {dict.parent.markDone}
                    </a>
                  </div>
                )}

                {/* Give TIDAK punya "Mark as done" polos — yang ada form cerita WAJIB.
                    Tanpa cerita, Give tak beda dari uang yang hilang (ADR-0006). */}
                {isDebt && r.kind === 'give_away' && (
                  <form method="get" action="/requests" style={{ marginTop: 10 }}>
                    <input type="hidden" name="child" value={child.id} />
                    <input type="hidden" name="act" value="done" />
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
