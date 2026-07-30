import {
  formatGoldWeight, formatRp, goldSpreadPct, goldWeightGrams, growInPlan, parseRp,
  tdHarvestOutcome, tenorRate,
  type HarvestChoice, type Tenor,
} from '@nummi/core';
import { getKidData } from '../../lib/data';
import { dict, fill } from '../../lib/copy';
import { Brand, Nav, POCKET_COLOR } from '../../components/ui';
import { submitGrowIn, submitHarvest } from '../../lib/actions';

const ERROR_COPY: Record<string, string> = {
  'growIn.amountRequired': dict.grow.amountRequired,
  'growIn.notEnough': dict.grow.notEnough,
  'growIn.sourceNotAllowed': dict.grow.sourceNotAllowed,
  'growIn.tenorRequired': dict.grow.tenorRequired,
  'growIn.depositBusy': dict.grow.depositBusy,
};

const TD_CHOICES: { key: HarvestChoice; label: string }[] = [
  { key: 'cash_out', label: dict.grow.cashOut },
  { key: 'roll_over', label: dict.grow.rollOver },
  { key: 'take_profit', label: dict.grow.takeProfit },
];

export default async function GrowPage({
  searchParams,
}: {
  searchParams: Promise<{
    harvest?: string; fund?: string; from?: string; amount?: string; tenor?: string; e?: string;
  }>;
}) {
  const sp = await searchParams;
  const { harvest } = sp;
  const data = await getKidData();
  const target = data.grow.find((g) => g.wallet.id === harvest);

  /* ── Mode ketiga: mendanai instrumen (U-14) ────────────────────────────────
   * Sampai 30 Juli 2026 layar ini hanya bisa MEMANEN. Anak bisa menuai tapi tidak bisa menanam —
   * dan itu terasa seperti bug, bukan fitur yang belum ada.
   *
   * Bertahap lewat query param, pola yang sama dengan /move: sumber → jumlah → pratinjau, dengan
   * `growInPlan()` menghitung ulang di server tiap langkah. */
  const fundTo = data.growInTargets.find((w) => w.id === sp.fund);
  const fundFrom = data.growInSources.find((w) => w.id === sp.from);
  const fundAmount = sp.amount ? parseRp(sp.amount) : 0;
  const tenor = [3, 6, 12].includes(Number(sp.tenor)) ? (Number(sp.tenor) as Tenor) : undefined;
  const fundPlan = fundTo && fundFrom
    ? growInPlan(fundFrom, fundTo, fundAmount, data.balances, data.prices, tenor)
    : undefined;

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

                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
                  {/* Menanam dan menuai berdampingan — kalau cuma ada Harvest, Grow terasa
                      seperti tempat yang uangnya muncul entah dari mana. */}
                  {data.growInTargets.some((w) => w.id === wallet.id) && (
                    <a className="cta" style={{ marginTop: 0 }} href={`/grow?fund=${wallet.id}`}>
                      {dict.grow.addMoney}
                    </a>
                  )}
                  {position.valueNow > 0 && (
                    <a className="pill" href={`/grow?harvest=${wallet.id}`}>{dict.grow.harvest}</a>
                  )}
                </div>
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
        {fundTo && (
          <>
            {sp.e && <div className="errbox">{ERROR_COPY[sp.e] ?? dict.grow.amountRequired}</div>}

            <div className="card">
              <h2>{dict.grow.addMoney} · {fundTo.name}</h2>

              {/* Langkah 1 — sumber. Dream TIDAK ADA di daftar ini, dan itu bukan karena
                  disembunyikan: `growInSources` di core tidak pernah mengembalikannya. */}
              <p className="muted" style={{ marginBottom: 8 }}>{dict.grow.addMoneyFrom}</p>
              {data.growInSources.map((w) => (
                <a
                  className="slot" key={w.id}
                  href={`/grow?fund=${fundTo.id}&from=${w.id}${sp.amount ? `&amount=${sp.amount}` : ''}`}
                  style={fundFrom?.id === w.id ? { borderColor: 'var(--brand)' } : undefined}
                >
                  <span className="nm">{w.name}</span>
                  <span className="amt num">{formatRp(data.balances[w.id] ?? 0)}</span>
                </a>
              ))}
            </div>

            {fundFrom && (
              <form method="get" action="/grow">
                <input type="hidden" name="fund" value={fundTo.id} />
                <input type="hidden" name="from" value={fundFrom.id} />
                <div className="card">
                  <h2>{dict.grow.howMuch}</h2>
                  <input
                    className="field" type="text" inputMode="numeric" name="amount"
                    defaultValue={sp.amount ?? ''} placeholder="0"
                  />

                  {/* Langkah 2b — tenor, HANYA untuk deposito. Emas & valas tidak punya jangka:
                      nilainya mengikuti harga, dan itu pelajaran yang berbeda (ADR-0003). */}
                  {fundTo.instrument === 'time_deposit' && (
                    <>
                      <p className="muted" style={{ margin: '12px 0 8px' }}>{dict.grow.pickTenor}</p>
                      {([3, 6, 12] as Tenor[]).map((t) => (
                        <label className="choice" key={t}>
                          <input type="radio" name="tenor" value={t} defaultChecked={tenor === t} />
                          <span className="nm">{fill(dict.grow.months, { n: t })}</span>
                          <span className="pct">{tenorRate(t, data.prices)}%</span>
                        </label>
                      ))}
                    </>
                  )}

                  <button className="cta" type="submit">{dict.sort.preview}</button>
                </div>
              </form>
            )}

            {fundPlan?.ok && fundFrom && (
              <form action={submitGrowIn} className="card">
                <input type="hidden" name="from" value={fundFrom.id} />
                <input type="hidden" name="to" value={fundTo.id} />
                <input type="hidden" name="amount" value={fundPlan.amount} />
                {tenor && <input type="hidden" name="tenor" value={tenor} />}

                <h2>{dict.sort.preview}</h2>
                <div className="slot">
                  <span className="dot" style={{ background: POCKET_COLOR.grow }} />
                  <span className="nm">{fill(dict.move.after, {
                    wallet: fundFrom.name, amount: formatRp(fundPlan.fromAfter),
                  })}</span>
                </div>

                {/* Bunga yang dijanjikan tampil SEBELUM anak mengajukan. Bunga yang baru
                    terlihat setelah disetujui adalah janji yang tidak pernah dibaca. */}
                {fundPlan.promisedInterest > 0 && (
                  <p style={{ marginTop: 8, fontWeight: 700, color: 'var(--grow)' }}>
                    {fill(dict.grow.promisedInterest, {
                      amount: formatRp(fundPlan.promisedInterest),
                    })}
                  </p>
                )}

                <p className="muted" style={{ marginTop: 8 }}>{dict.grow.needsGrownUp}</p>
                <button className="cta" type="submit" style={{ border: 'none', font: 'inherit', cursor: 'pointer' }}>
                  {dict.grow.submit}
                </button>
                <a className="pill" href="/grow" style={{ marginLeft: 10 }}>{dict.common.cancel}</a>
              </form>
            )}
          </>
        )}
      </main>
      <Nav active="add" />
    </>
  );
}
