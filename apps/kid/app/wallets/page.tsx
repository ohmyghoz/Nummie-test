import { canChildMoveFrom, formatRp, type Pocket, type RuleMode } from '@nummi/core';
import { getKidData, POCKETS } from '../../lib/data';
import { categoryLabel, dict, fill } from '../../lib/copy';
import { Brand, Nav, POCKET_COLOR } from '../../components/ui';

export default async function WalletsPage({
  searchParams,
}: { searchParams: Promise<{ mode?: string }> }) {
  const { mode } = await searchParams;
  const data = await getKidData(mode === 'strict' || mode === 'flexible' ? (mode as RuleMode) : undefined);

  return (
    <>
      <main className="wrap">
        <Brand childName={data.child.name} />
        <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 14 }}>{dict.wallets.title}</h1>

        <div className="grid2">
          {POCKETS.map((pocket: Pocket) => {
            const rows = data.wallets.filter((r) => r.wallet.category === pocket);
            if (rows.length === 0) return null;
            const total = rows.reduce((s, r) => s + r.balance, 0);

            return (
              <section className="pocket" key={pocket}>
                <div className="head">
                  <span className="dot" style={{ background: POCKET_COLOR[pocket] }} />
                  <span className="nm">{categoryLabel(data.child.tier, pocket)}</span>
                  <span className="tot num">{formatRp(total)}</span>
                </div>

                {rows.map(({ wallet, balance }) => {
                  const target = wallet.targetAmount ?? 0;
                  const pct = target > 0 ? Math.min(100, (balance / target) * 100) : 0;
                  // Grow: Harvest satu-satunya jalan keluar (ADR-0003). Dream & Give juga
                  // tidak bisa dipindah anak sendiri. Ditampilkan sebagai penjelasan, bukan gembok bisu.
                  const movable = canChildMoveFrom(wallet, data.rules);

                  return (
                    <div key={wallet.id}>
                      <div className="row">
                        <span className="nm">{wallet.name}</span>
                        <span className="amt num">{formatRp(balance)}</span>
                      </div>
                      {target > 0 && (
                        <>
                          <div className="bar">
                            <span style={{ width: `${pct}%`, background: POCKET_COLOR.save }} />
                          </div>
                          <div className="meta" style={{ margin: '5px 0 9px' }}>
                            {balance >= target
                              ? dict.wallets.reached
                              : fill(dict.wallets.target, { amount: formatRp(target) })}
                          </div>
                        </>
                      )}
                      {pocket === 'grow' && !movable && (
                        <div className="meta" style={{ margin: '2px 0 9px' }}>
                          {dict.wallets.lockedByGrow}
                        </div>
                      )}
                    </div>
                  );
                })}
              </section>
            );
          })}
        </div>
      </main>
      <Nav active="wallets" />
    </>
  );
}
