import {
  CATEGORIES, formatRp, ratioTotal, sortPlan, validateAutoSplit,
  type Category, type RuleMode,
} from '@nummi/core';
import { findChild, getParentData } from '../../lib/data';
import { categoryLabel, dict, fill } from '../../lib/copy';
import { Nav, POCKET_COLOR, TopBar } from '../../components/ui';

const RATIO_ERROR: Record<string, string> = {
  'ratio.over100': dict.rules.ratioOver100,
  'ratio.strictMustBeExact': dict.rules.ratioStrictMustBeExact,
  'ratio.missingDestination': dict.rules.ratioMissingDestination,
};

/** Contoh nominal untuk pratinjau — supaya rasio berhenti jadi angka abstrak. */
const PREVIEW_AMOUNT = 100_000;

export default async function RulesPage({
  searchParams,
}: { searchParams: Promise<{ child?: string; mode?: string }> }) {
  const sp = await searchParams;
  const data = getParentData();
  const child = findChild(data, sp.child);
  const pending = data.children.reduce((n, c) => n + c.openRequests.length, 0);

  const mode: RuleMode = sp.mode === 'strict' ? 'strict' : child.rules.mode;
  const rules = { ...child.rules, mode };
  const total = ratioTotal(rules.autoSplit);
  const check = validateAutoSplit(rules);
  // Pratinjau memakai mesin yang SAMA dengan app anak — bukan hitungan kedua yang bisa menyimpang.
  const plan = sortPlan(PREVIEW_AMOUNT, rules, child.wallets);

  return (
    <>
      <main className="wrap">
        <TopBar parentName={data.parentName} />
        <h1 style={{ fontSize: 19, fontWeight: 800, marginBottom: 4 }}>
          {dict.parent.rulesTitle} · {child.name}
        </h1>
        <p className="sub" style={{ marginBottom: 12 }}>{dict.parent.enforcedOnKid}</p>

        <div className="card">
          <h2>{dict.parent.rulesTitle}</h2>
          {(['flexible', 'strict'] as RuleMode[]).map((m) => (
            <a
              className="choice" key={m} href={`/rules?child=${child.id}&mode=${m}`}
              style={mode === m ? { borderColor: 'var(--brand)', background: 'var(--brand-tint)' } : undefined}
            >
              <span>
                <b>{m === 'strict' ? dict.parent.modeStrict : dict.parent.modeFlexible}</b>
                <span className="sub" style={{ display: 'block' }}>
                  {m === 'strict' ? dict.parent.modeStrictBody : dict.parent.modeFlexibleBody}
                </span>
              </span>
            </a>
          ))}
        </div>

        <div className="card">
          <h2>{fill(dict.parent.ratioTotal, { total })}</h2>
          {CATEGORIES.filter((c: Category) => (rules.autoSplit.ratios[c] ?? 0) > 0).map((c) => (
            <div className="row" key={c}>
              <span className="dot" style={{ background: POCKET_COLOR[c], width: 9, height: 9, borderRadius: 3 }} />
              <span className="nm">{categoryLabel(child.tier, c)}</span>
              <span className="amt num">{rules.autoSplit.ratios[c]}%</span>
            </div>
          ))}

          {!check.ok && check.errorKey && (
            <div className="errbox" style={{ marginTop: 10 }}>
              {fill(RATIO_ERROR[check.errorKey] ?? '', { remaining: 100 - total })}
            </div>
          )}

          {/* Sisa boleh tersisa di Flexible (mendarat di Unsorted), tapi WAJIB habis di Strict. */}
          {total < 100 && (
            <p className="sub" style={{ marginTop: 8 }}>
              {fill(dict.parent.ratioLeftover, { leftover: 100 - total })}
            </p>
          )}
        </div>

        <div className="card">
          <h2>{dict.sort.preview} · {formatRp(PREVIEW_AMOUNT)}</h2>
          {plan.slots.map((s) => (
            <div className="row" key={s.wallet.id}>
              <span className="dot" style={{ background: POCKET_COLOR[s.category], width: 9, height: 9, borderRadius: 3 }} />
              <span className="nm">{s.wallet.name}</span>
              <span className="amt num">{formatRp(s.amount)}</span>
            </div>
          ))}
          {plan.remainderToUnsorted > 0 && (
            <div className="row">
              <span className="dot" style={{ background: POCKET_COLOR.unsorted, width: 9, height: 9, borderRadius: 3 }} />
              <span className="nm">{categoryLabel(child.tier, 'unsorted')}</span>
              <span className="amt num">{formatRp(plan.remainderToUnsorted)}</span>
            </div>
          )}
          <p className="sub" style={{ marginTop: 8 }}>
            {plan.locked ? `🔒 ${dict.sort.lockedTitle}` : dict.parent.modeFlexibleBody}
          </p>
        </div>
      </main>
      <Nav active="rules" pending={pending} />
    </>
  );
}
