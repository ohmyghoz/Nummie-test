import {
  formatRp, movePlan, moveSources, moveTargets, parseRp, type RuleMode, type Wallet,
} from '@nummi/core';
import { getKidData } from '../../lib/data';
import { dict, fill } from '../../lib/copy';
import { Brand, Nav, POCKET_COLOR } from '../../components/ui';

const ERROR_COPY: Record<string, string> = {
  'move.amountRequired': dict.move.amountRequired,
  'move.notEnough': dict.move.notEnough,
  'move.sourceLocked': dict.move.sourceLocked,
  'move.sameWallet': dict.move.sameWallet,
  'move.destinationNotAllowed': dict.move.destinationNotAllowed,
};

export default async function MovePage({
  searchParams,
}: { searchParams: Promise<{ from?: string; to?: string; amount?: string; mode?: string }> }) {
  const sp = await searchParams;
  const mode = sp.mode === 'strict' || sp.mode === 'flexible' ? (sp.mode as RuleMode) : undefined;
  const data = getKidData(mode);

  const all = data.wallets.map((r) => r.wallet);
  const sources = moveSources(all, data.rules);
  const from = all.find((w) => w.id === sp.from);
  const to = all.find((w) => w.id === sp.to);
  const amount = sp.amount ? parseRp(sp.amount) : 0;
  const targets: Wallet[] = from ? moveTargets(from, all) : [];

  const plan = from && to ? movePlan(from, to, amount, data.rules, data.balances) : undefined;
  const keep = (extra: Record<string, string>) => {
    const p = new URLSearchParams({ ...(mode ? { mode } : {}), ...extra });
    return `/move?${p.toString()}`;
  };

  return (
    <>
      <main className="wrap">
        <Brand childName={data.child.name} />
        <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 14 }}>{dict.move.title}</h1>

        {/* Strict mengosongkan daftar sumber sepenuhnya — dan itu dijelaskan, bukan layar kosong. */}
        {sources.length === 0 ? (
          <div className="lockbox">
            <div className="t">🔒 {dict.sort.lockedTitle}</div>
            <div className="b">{dict.sort.lockedBody}</div>
          </div>
        ) : (
          <>
            <div className="card">
              <h2>{dict.move.from}</h2>
              {sources.map((w) => (
                <a
                  className="slot" key={w.id}
                  href={keep({ from: w.id, ...(sp.amount ? { amount: sp.amount } : {}) })}
                  style={from?.id === w.id ? { borderColor: 'var(--brand)' } : undefined}
                >
                  <span className="dot" style={{ background: POCKET_COLOR[w.category] }} />
                  <span className="nm">{w.name}</span>
                  <span className="amt num">{formatRp(data.balances[w.id] ?? 0)}</span>
                </a>
              ))}
            </div>

            {from && (
              <div className="card">
                <h2>{dict.move.to}</h2>
                {targets.map((w) => (
                  <a
                    className="slot" key={w.id}
                    href={keep({ from: from.id, to: w.id, ...(sp.amount ? { amount: sp.amount } : {}) })}
                    style={to?.id === w.id ? { borderColor: 'var(--brand)' } : undefined}
                  >
                    <span className="dot" style={{ background: POCKET_COLOR[w.category] }} />
                    <span className="nm">{w.name}</span>
                  </a>
                ))}
              </div>
            )}

            {from && to && (
              <form method="get" action="/move">
                <input type="hidden" name="from" value={from.id} />
                <input type="hidden" name="to" value={to.id} />
                {mode && <input type="hidden" name="mode" value={mode} />}
                <div className="card">
                  <h2>{dict.move.howMuch}</h2>
                  <input
                    className="field" type="text" inputMode="numeric" name="amount"
                    defaultValue={sp.amount ?? ''} placeholder="0"
                  />
                  <button className="cta" type="submit">{dict.move.confirm}</button>
                </div>
              </form>
            )}
          </>
        )}

        {plan && sp.amount && !plan.ok && plan.errorKey && (
          <div className="errbox">{ERROR_COPY[plan.errorKey]}</div>
        )}

        {/* Ongkos ⭐ ditampilkan bahkan saat rencananya ditolak: merampok dream selalu
            butuh ortu, dan anak harus tahu ongkosnya SEBELUM mengajukan (Fase 5). */}
        {plan && plan.starPenalty > 0 && (
          <div className="lockbox">
            <div className="t">⭐ {fill(dict.move.starWarning, { stars: plan.starPenalty })}</div>
            <div className="b">{dict.move.needsGrownUp}</div>
          </div>
        )}

        {plan?.ok && (
          <div className="card">
            <h2>{dict.move.preview}</h2>
            <div className="slot">
              <span className="dot" style={{ background: POCKET_COLOR[from!.category] }} />
              <span className="nm">{fill(dict.move.after, { wallet: from!.name, amount: formatRp(plan.fromAfter) })}</span>
            </div>
            <div className="slot">
              <span className="dot" style={{ background: POCKET_COLOR[to!.category] }} />
              <span className="nm">{fill(dict.move.after, { wallet: to!.name, amount: formatRp(plan.toAfter) })}</span>
            </div>
          </div>
        )}
      </main>
      <Nav active="add" />
    </>
  );
}
