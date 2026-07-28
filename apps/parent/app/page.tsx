import { formatRp } from '@nummi/core';
import { getParentData, POCKETS } from '../lib/data';
import { categoryLabel, dict, fill } from '../lib/copy';
import { Nav, POCKET_COLOR, TopBar } from '../components/ui';

export default async function DashboardPage() {
  const data = getParentData();
  const pending = data.children.reduce((n, c) => n + c.openRequests.length, 0);

  return (
    <>
      <main className="wrap">
        <TopBar parentName={data.parentName} />

        {/* Strip pending PER-ANAK, bukan gabungan semua anak — perbaikan lintas-app yang
            sudah dikunci. Gabungan membuat ortu tidak tahu anak mana yang menunggu. */}
        {data.children.map((child) => (
          <section key={child.id}>
            <div className="card">
              <div className="kid">
                <span className="av">{child.avatar}</span>
                <span>
                  <span className="nm">{child.name}</span>
                  <span className="pill" style={{ marginLeft: 7 }}>{child.tier}</span>
                </span>
                <span className="tot num">{formatRp(child.total)}</span>
              </div>

              <div className="ring">
                {POCKETS.filter((p) => child.pockets[p] > 0).map((p) => (
                  <span key={p} style={{ width: `${(child.pockets[p] / child.total) * 100}%`, background: POCKET_COLOR[p] }} />
                ))}
              </div>
              {/* Legenda memakai lookup istilah yang sama dengan app anak — ortu dan anak
                  harus membicarakan hal yang sama. */}
              <div className="legend">
                {POCKETS.filter((p) => child.pockets[p] > 0).map((p) => (
                  <span className="item" key={p}>
                    <span className="dot" style={{ background: POCKET_COLOR[p] }} />
                    {categoryLabel(child.tier, p)}
                    <span className="amt num">{formatRp(child.pockets[p])}</span>
                  </span>
                ))}
              </div>
            </div>

            {child.openRequests.length > 0 && (
              <a className="card" href={`/requests?child=${child.id}`} style={{ display: 'block' }}>
                <div className="note">
                  📥 {child.name}: {fill(dict.parent.pendingCount, { count: child.openRequests.length })}
                </div>
              </a>
            )}

            {/* Utang janji = metrik kepercayaan. Ditampilkan terpisah dari antrean biasa,
                karena "belum diputuskan" dan "sudah dijanjikan tapi belum ditepati" adalah
                dua kegagalan yang sangat berbeda (ADR-0002). */}
            {child.promiseDebt.length > 0 && (
              <div className="card">
                <h2>{dict.parent.promiseDebt}</h2>
                <p className="sub">{dict.parent.promiseDebtHint}</p>
                {child.promiseDebt.map((r) => (
                  <div className="row" key={r.id}>
                    <span className="nm">{r.reason ?? r.kind}</span>
                    <span className="amt num">{formatRp(r.amount)}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="card">
              <h2>{dict.parent.dashboard}</h2>
              <div className="btnrow">
                <a className="btn" href={`/send?child=${child.id}`}>{dict.parent.send}</a>
                <a className="btn" href={`/take?child=${child.id}`}>{dict.parent.take}</a>
                <a className="btn" href={`/rules?child=${child.id}`}>{dict.parent.rules}</a>
                <a className="btn" href={`/settings?child=${child.id}`}>{dict.settings.title}</a>
              </div>
            </div>
          </section>
        ))}
      </main>
      <Nav active="dashboard" pending={pending} />
    </>
  );
}
