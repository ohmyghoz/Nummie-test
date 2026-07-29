import { canOpenSort, formatRp, type RuleMode } from '@nummi/core';
import { getKidData } from '../../lib/data';
import { categoryLabel, dict, fill } from '../../lib/copy';
import { Brand, Nav, POCKET_COLOR } from '../../components/ui';

export default async function SortPage({
  searchParams,
}: { searchParams: Promise<{ mode?: string }> }) {
  const { mode } = await searchParams;
  const active = mode === 'strict' || mode === 'flexible' ? (mode as RuleMode) : undefined;
  const data = await getKidData(active);
  const { plan, rules } = data;

  // A-sisa-1: rasio DIAMBIL dari money_rules ortu, tidak pernah ditulis mati di komponen.
  const hint = fill(dict.sort.autoSplitHint, {
    spend: plan.ratios.spend ?? 0,
    save: plan.ratios.save ?? 0,
    give: plan.ratios.give ?? 0,
  });

  return (
    <>
      <main className="wrap">
        <Brand childName={data.child.name} />
        <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>{dict.sort.title}</h1>

        {!canOpenSort(data.unsortedBalance) ? (
          <div className="card"><div className="muted">{dict.home.nothingToSort}</div></div>
        ) : (
          <>
            <p className="muted" style={{ marginBottom: 14 }}>
              {fill(dict.home.justArrived, { amount: formatRp(data.unsortedBalance) })}
            </p>

            {/* C: mode Strict akhirnya ditegakkan di sisi anak — dan menjelaskan KENAPA
                terkunci, bukan sekadar tombol yang mati. */}
            {plan.locked && (
              <div className="lockbox">
                <div className="t">🔒 {dict.sort.lockedTitle}</div>
                <div className="b">{dict.sort.lockedBody}</div>
              </div>
            )}

            <div className="card">
              <h2>{dict.sort.preview}</h2>
              <p className="muted" style={{ marginTop: -6, marginBottom: 12 }}>{hint}</p>

              {plan.slots.map((slot) => (
                <div className="slot" key={slot.wallet.id}>
                  <span className="dot" style={{ background: POCKET_COLOR[slot.category] }} />
                  <div>
                    <div className="nm">{slot.wallet.name}</div>
                    <div className="pct">
                      {categoryLabel(data.child.tier, slot.category)} · {plan.ratios[slot.category] ?? 0}%
                    </div>
                  </div>
                  <span className="amt num">{formatRp(slot.amount)}</span>
                </div>
              ))}

              {plan.remainderToUnsorted > 0 && (
                <p className="muted" style={{ marginTop: 10 }}>
                  {fill(dict.sort.leftInUnsorted, { amount: formatRp(plan.remainderToUnsorted) })}
                </p>
              )}

              <a className="cta" href="/">{dict.sort.confirm}</a>
            </div>
          </>
        )}

        {/* Alat demo, bukan fitur produk: di produksi mode datang dari money_rules ortu.
            Ada di sini supaya penegakan Strict bisa dilihat tanpa app ortu. */}
        <div className="card">
          <h2>demo · money rules</h2>
          <p className="muted" style={{ marginBottom: 10 }}>
            mode: <span className="pill">{rules.mode}</span>
          </p>
          <a className="pill" href="/sort?mode=flexible" style={{ marginRight: 8 }}>flexible</a>
          <a className="pill" href="/sort?mode=strict">strict</a>
        </div>
      </main>
      <Nav active="add" />
    </>
  );
}
