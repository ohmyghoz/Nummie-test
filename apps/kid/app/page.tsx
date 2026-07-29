import { formatRp, type RuleMode } from '@nummi/core';
import { getKidData } from '../lib/data';
import { dict, fill } from '../lib/copy';
import { Brand, Nav, POCKET_COLOR, TotalRing } from '../components/ui';

export default async function HomePage({
  searchParams,
}: { searchParams: Promise<{ mode?: string }> }) {
  const { mode } = await searchParams;
  const data = await getKidData(mode === 'strict' || mode === 'flexible' ? (mode as RuleMode) : undefined);
  const qs = mode ? `?mode=${mode}` : '';

  const dreams = data.wallets.filter((w) => w.wallet.kind === 'dream');

  return (
    <>
      <main className="wrap">
        <Brand childName={data.child.name} />

        {/* Kartu ini SINKRON dari saldo Unsorted dan hilang sendiri saat nol.
            Dulu ia teks statis, sehingga bisa bertentangan dengan ring di layar yang sama. */}
        {data.unsortedBalance > 0 ? (
          <div className="arrived">
            <div className="big">{fill(dict.home.justArrived, { amount: formatRp(data.unsortedBalance) })}</div>
            <div className="sub">{dict.sort.title}</div>
            <a className="cta" href={`/sort${qs}`}>{dict.home.sortItNow}</a>
          </div>
        ) : (
          <div className="card"><div className="muted">{dict.home.nothingToSort}</div></div>
        )}

        {data.openRequests.length > 0 && (
          <a className="banner" href={`/requests${qs}`}>
            ⏳ {fill(dict.home.requestsWaiting, { count: data.openRequests.length })}
          </a>
        )}

        <TotalRing total={data.total} pockets={data.pockets} tier={data.child.tier} />

        {dreams.length > 0 && (
          <div className="card">
            <h2>{dict.home.myDreams}</h2>
            {dreams.map(({ wallet, balance }) => {
              const target = wallet.targetAmount ?? 0;
              const pct = target > 0 ? Math.min(100, (balance / target) * 100) : 0;
              const reached = target > 0 && balance >= target;
              return (
                <div key={wallet.id} style={{ marginBottom: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                    <span style={{ fontWeight: 700 }}>{wallet.name}</span>
                    <span className="amt num" style={{ marginLeft: 'auto', fontWeight: 800 }}>
                      {formatRp(balance)}
                    </span>
                  </div>
                  <div className="bar">
                    <span style={{ width: `${pct}%`, background: POCKET_COLOR.save }} />
                  </div>
                  <div className="meta" style={{ marginTop: 5 }}>
                    {reached
                      ? dict.wallets.reached
                      : fill(dict.home.toGo, { amount: formatRp(Math.max(0, target - balance)) })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
      <Nav active="home" />
    </>
  );
}
