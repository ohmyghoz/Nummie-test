import { formatRp, fulfilmentPath, type RuleMode } from '@nummi/core';
import { getKidData } from '../../lib/data';
import { dict } from '../../lib/copy';
import { Brand, Nav } from '../../components/ui';

export default async function RequestsPage({
  searchParams,
}: { searchParams: Promise<{ mode?: string }> }) {
  const { mode } = await searchParams;
  const data = await getKidData(mode === 'strict' || mode === 'flexible' ? (mode as RuleMode) : undefined);
  const debtIds = new Set(data.promiseDebt.map((r) => r.id));
  const walletName = new Map(data.wallets.map(({ wallet }) => [wallet.id, wallet.name]));

  return (
    <>
      <main className="wrap">
        <Brand childName={data.child.name} />
        <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 14 }}>{dict.requests.title}</h1>

        {data.requests.length === 0 ? (
          <div className="card"><div className="muted">{dict.requests.empty}</div></div>
        ) : (
          data.requests.map((r) => {
            // ADR-0002: approve != fulfil. Anak berhak tahu bedanya "sudah diizinkan"
            // dan "sudah benar-benar dilakukan" — itu yang membuat janji bisa ditagih.
            const approvedNotDone = r.status === 'approved' && r.fulfilment === 'todo';
            const label = approvedNotDone
              ? dict.requests.approved
              : r.status === 'needs_ok'
                ? dict.requests.waiting
                : dict.common[r.status === 'approved' ? 'done' : 'talkAboutIt'];

            return (
              <div className="card" key={r.id}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontWeight: 800 }}>
                    {r.sourceWalletId ? walletName.get(r.sourceWalletId) ?? '—' : '—'}
                  </span>
                  <span className="amt num" style={{ marginLeft: 'auto', fontWeight: 800 }}>
                    {formatRp(r.amount)}
                  </span>
                </div>
                {r.reason && <p className="muted" style={{ marginTop: 6 }}>“{r.reason}”</p>}
                <div style={{ marginTop: 10, display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span className="pill">{label}</span>
                  {fulfilmentPath(r.kind) === 'todo' && debtIds.has(r.id) && (
                    <span className="pill">{dict.requests.storyNeeded}</span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </main>
      <Nav active="add" />
    </>
  );
}
