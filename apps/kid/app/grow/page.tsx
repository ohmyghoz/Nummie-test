import {
  formatGoldWeight, formatRp, goldSpreadPct, goldWeightGrams, tdHarvestOutcome,
  type HarvestChoice,
} from '@nummi/core';
import { getKidData } from '../../lib/data';
import { dict, fill } from '../../lib/copy';
import { Brand, Nav, POCKET_COLOR } from '../../components/ui';
import { submitHarvest } from '../../lib/actions';

const TD_CHOICES: { key: HarvestChoice; label: string }[] = [
  { key: 'cash_out', label: dict.grow.cashOut },
  { key: 'roll_over', label: dict.grow.rollOver },
  { key: 'take_profit', label: dict.grow.takeProfit },
];

export default async function GrowPage({
  searchParams,
}: { searchParams: Promise<{ harvest?: string }> }) {
  const { harvest } = await searchParams;
  const data = await getKidData();
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
            // Jenis instrumen datang dari data (`instrument`, migrasi 0008), TIDAK PERNAH
            // dari id atau nama — keduanya berubah bentuk begitu datanya dari Supabase.
            const isGold = wallet.instrument === 'gold';
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

              {/* Ketiga pilihan deposito dulu dirender di sini sebagai daftar yang cuma bisa
                  dibaca. Sekarang mereka hidup di dalam form di bawah, sebagai pilihan yang
                  benar-benar bisa dipilih — angka yang sama, tapi anak yang memutuskan. */}
            </div>

            <form action={submitHarvest}>
              <input type="hidden" name="from" value={target.wallet.id} />

              {/* Deposito jatuh tempo: tiga jalan, tiga angka berbeda. Pilihan ini keputusan
                  ANAK dan ikut tercatat di request (migrasi 0011), bukan ditebak ortu. */}
              {target.wallet.instrument === 'time_deposit' && target.position.deltaRp > 0 && (
                <div className="card">
                  <h2>{dict.grow.matured}</h2>
                  {TD_CHOICES.map(({ key, label }, i) => {
                    const out = tdHarvestOutcome(target.position.rupiahIn, target.position.deltaRp, key);
                    return (
                      <label className="choice" key={key}>
                        <input type="radio" name="choice" value={key} defaultChecked={i === 0} required />
                        <span className="nm">{label}</span>
                        <span className="pct">→ {formatRp(out.toSave)} · {formatRp(out.staysInvested)} ⟳</span>
                      </label>
                    );
                  })}
                </div>
              )}

              <div className="card">
                <h2>{dict.grow.harvestTo}</h2>
                {/* Tujuan Harvest DIKUNCI ke wallet Save (ADR-0003) — uang yang keluar dari
                    Grow tidak boleh langsung jadi jajan. Wallet Spend tidak dirender sama sekali. */}
                {data.harvestTargets.map((w, i) => (
                  <label className="choice" key={w.id}>
                    <input type="radio" name="to" value={w.id} defaultChecked={i === 0} required />
                    <span className="dot" style={{ background: POCKET_COLOR.save }} />
                    <span className="nm">{w.name}</span>
                  </label>
                ))}
                <p className="muted" style={{ marginTop: 8 }}>{dict.grow.harvestLockedToSave}</p>
                <p className="muted">{dict.common.waitingForGrownUp}</p>

                <button className="cta" type="submit" style={{ border: 'none', font: 'inherit', cursor: 'pointer' }}>
                  {dict.grow.harvest}
                </button>
                <a className="pill" href="/grow" style={{ marginLeft: 10 }}>{dict.common.cancel}</a>
              </div>
            </form>
          </>
        )}
      </main>
      <Nav active="add" />
    </>
  );
}
