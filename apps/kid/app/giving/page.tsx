import { formatRp } from '@nummi/core';
import { getKidData } from '../../lib/data';
import { dict } from '../../lib/copy';
import { Brand, Nav } from '../../components/ui';

/**
 * "Where my giving went" — penutup lingkaran Fase 5.
 *
 * Yang tampil di sini HANYA Give yang sudah punya cerita dari ortu (`closedGiving`).
 * Give yang sudah disetujui tapi belum diceritakan sengaja ditampilkan terpisah sebagai
 * utang janji — anak berhak tahu bedanya "sudah diizinkan" dan "sudah benar-benar disalurkan".
 */
export default async function GivingPage() {
  const data = getKidData();
  const waiting = data.requests.filter(
    (r) => r.kind === 'give_away' && r.status === 'approved' && r.fulfilment === 'todo',
  );

  return (
    <>
      <main className="wrap">
        <Brand childName={data.child.name} />
        <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 14 }}>
          {dict.give.whereMyGivingWent}
        </h1>

        {waiting.map((r) => (
          <div className="card" key={r.id}>
            <div style={{ display: 'flex', gap: 10 }}>
              <span style={{ fontWeight: 800 }}>{dict.give.stillWaitingStory}</span>
              <span className="amt num" style={{ marginLeft: 'auto', fontWeight: 800 }}>
                {formatRp(r.amount)}
              </span>
            </div>
          </div>
        ))}

        {data.givingStories.length === 0 && waiting.length === 0 ? (
          <div className="card"><div className="muted">{dict.give.noStoriesYet}</div></div>
        ) : (
          data.givingStories.map((r) => (
            <div className="card" key={r.id}>
              <div style={{ display: 'flex', gap: 10, marginBottom: 6 }}>
                <span style={{ fontWeight: 800 }}>🎁</span>
                <span className="amt num" style={{ marginLeft: 'auto', fontWeight: 800 }}>
                  {formatRp(r.amount)}
                </span>
              </div>
              <p>{r.fulfilmentStory}</p>
            </div>
          ))
        )}
      </main>
      <Nav active="give" />
    </>
  );
}
