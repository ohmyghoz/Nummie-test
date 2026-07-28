import {
  formatGoldWeight, formatRp, goldSpreadPct, goldWeightGrams, tdHarvestOutcome,
  type HarvestChoice,
} from '@nummi/core';
import { getKidData } from '../../lib/data';
import { dict, fill } from '../../lib/copy';
import { Brand, Nav, POCKET_COLOR } from '../../components/ui';

const TD_CHOICES: { key: HarvestChoice; label: string }[] = [
  { key: 'cash_out', label: dict.grow.cashOut },
  { key: 'roll_over', label: dict.grow.rollOver },
  { key: 'take_profit', label: dict.grow.takeProfit },
];

export default async function GrowPage({
  searchParams,
}: { searchParams: Promise<{ harvest?: string }> }) {
  const { harvest } = await searchParams;
  const data = getKidData();
  const target = data.grow.find((g) => g.wallet.id === harvest);

  return (
    <>
      <main className="wrap">
        <Brand childName={data.child.name} />
        <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>{dict.grow.title}</h1>
        <p className="muted" style={{ marginBottom: 14 }}>
          {fill(dict.grow.pricesAsOf, { date: data.prices.updatedAt })} · {dict.grow.onlyWayOut}
        </p>

        {!target ? (
          data.grow.map(({ wallet, position }) => {
            const isGold = wallet.id === 'w_gold';
            const grams = isGold ? goldWeightGrams(position.rupiahIn, data.prices) : 0;
            return (
              <div className="card" key={wallet.id}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span className="dot" style={{ background: POCKET_COLOR.grow, width: 12, height: 12, borderRadius: 4 }} />
                  <span style={{ fontWeight: 800, fontSize: 16 }}>{wallet.name}</span>
                  <span className="amt num" style={{ marginLeft: 'auto', fontWeight: 800, fontSize: 18 }}>
                    {formatRp(position.valueNow)}
                  </span>
                </div>

                <p className="muted" style={{ marginTop: 6 }}>
                  {fill(dict.grow.putIn, { amount: formatRp(position.rupiahIn) })}
                  {isGold && ` · ${fill(dict.grow.youOwn, { weight: formatGoldWeight(grams) })}`}
                </p>

                <p style={{ marginTop: 4, fontWeight: 700, color: position.below ? 'var(--give)' : 'var(--grow)' }}>
                  {position.below ? '▼' : '▲'} {formatRp(Math.abs(position.deltaRp))} ({position.deltaPct.toFixed(1)}%)
                </p>

                {/* Kartu penjelas spread — "Why is it less…". Spread adalah pelajaran,
                    jangan disederhanakan jadi satu harga. */}
                {isGold && position.below && (
                  <div className="lockbox" style={{ marginTop: 12, marginBottom: 0 }}>
                    <div className="t">{dict.grow.whyLess}</div>
                    <div className="b">
                      {fill(dict.grow.whyLessBody, { spread: goldSpreadPct(data.prices).toFixed(0) })}
                    </div>
                  </div>
                )}

                <a className="cta" href={`/grow?harvest=${wallet.id}`}>{dict.grow.harvest}</a>
              </div>
            );
          })
        ) : (
          <>
            <div className="card">
              <h2>{dict.grow.harvest} · {target.wallet.name}</h2>
              <div className="slot">
                <span className="dot" style={{ background: POCKET_COLOR.grow }} />
                <div className="nm">{fill(dict.grow.worthNow, { amount: formatRp(target.position.valueNow) })}</div>
              </div>

              {/* Deposito yang sudah jatuh tempo punya tiga pilihan (Fase 3).
                  Jatuh tempo disimpulkan dari ledger: bunganya sudah dicatat. */}
              {target.wallet.id === 'w_td' && target.position.deltaRp > 0 && (
                <>
                  <p className="muted" style={{ margin: '10px 0 8px' }}>✅ {dict.grow.matured}</p>
                  {TD_CHOICES.map(({ key, label }) => {
                    const out = tdHarvestOutcome(
                      target.position.rupiahIn, target.position.deltaRp, key,
                    );
                    return (
                      <div className="slot" key={key}>
                        <div>
                          <div className="nm">{label}</div>
                          <div className="pct">
                            → {formatRp(out.toSave)} · {formatRp(out.staysInvested)} ⟳
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </>
              )}
            </div>

            <div className="card">
              <h2>{dict.grow.harvestTo}</h2>
              {/* Tujuan Harvest DIKUNCI ke wallet Save (ADR-0003) — uang yang keluar dari
                  Grow tidak boleh langsung jadi jajan. Wallet Spend tidak dirender sama sekali. */}
              {data.harvestTargets.map((w) => (
                <div className="slot" key={w.id}>
                  <span className="dot" style={{ background: POCKET_COLOR.save }} />
                  <span className="nm">{w.name}</span>
                </div>
              ))}
              <p className="muted" style={{ marginTop: 8 }}>{dict.grow.harvestLockedToSave}</p>
              <p className="muted">{dict.common.waitingForGrownUp}</p>
              <a className="cta" href="/grow">{dict.common.cancel}</a>
            </div>
          </>
        )}
      </main>
      <Nav active="add" />
    </>
  );
}
