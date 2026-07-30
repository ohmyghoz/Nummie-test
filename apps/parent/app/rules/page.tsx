import {
  SPLITTABLE, formatRp, ratioTotal, sortPlan, validateAutoSplit,
  type Category, type RuleMode,
} from '@nummi/core';
import { findChild, getParentData } from '../../lib/data';
import { categoryLabel, dict, fill } from '../../lib/copy';
import { Nav, POCKET_COLOR, TopBar } from '../../components/ui';
import { Upsell } from '../../components/upsell';
import { saveMoneyRules } from '../../lib/actions';

const RATIO_ERROR: Record<string, string> = {
  'ratio.over100': dict.rules.ratioOver100,
  'ratio.strictMustBeExact': dict.rules.ratioStrictMustBeExact,
  'ratio.missingDestination': dict.rules.ratioMissingDestination,
  'ratio.growExcluded': dict.rules.ratioGrowExcluded,
};

/** Contoh nominal untuk pratinjau — supaya rasio berhenti jadi angka abstrak. */
const PREVIEW_AMOUNT = 100_000;

export default async function RulesPage({
  searchParams,
}: { searchParams: Promise<{ child?: string; saved?: string; e?: string }> }) {
  const sp = await searchParams;
  const data = await getParentData();
  const child = findChild(data, sp.child);
  const pending = data.children.reduce((n, c) => n + c.openRequests.length, 0);

  // Mode datang dari database, bukan dari query param. Dulu `?mode=` mengubah pratinjau
  // tanpa menyimpan apa pun — sekarang form-nya yang menyimpan, jadi tidak ada mode bayangan.
  const mode: RuleMode = child.rules.mode;
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

        {sp.saved && <p className="pill ok" style={{ display: 'inline-block', marginBottom: 10 }}>{dict.settings.saved}</p>}
        {sp.e === 'limit.strictFlexibleDial' && (
          <Upsell reason="strictFlexibleDial" plan={data.plan} isSchool={data.isSchool} />
        )}
        {sp.e === 'limit.autoSplitEditor' && (
          <Upsell reason="autoSplitEditor" plan={data.plan} isSchool={data.isSchool} />
        )}
        {sp.e && !sp.e.startsWith('limit.') && (
          <div className="errbox">{dict.parent.decisionFailed}</div>
        )}

        {/* Sampai 30 Juli 2026 mode cuma tautan `?mode=` yang mengubah PRATINJAU, dan rasio
            hanya dipajang tanpa satu pun input. Sekarang keduanya satu form yang tersimpan —
            dan karena app anak membaca baris yang sama, Strict yang dinyalakan di sini
            benar-benar mengunci layar Sort anak. */}
        <form action={saveMoneyRules}>
          <input type="hidden" name="child" value={child.id} />

          <div className="card">
            <h2>{dict.parent.rulesTitle}</h2>
            {(['flexible', 'strict'] as RuleMode[]).map((m) => (
              <label className="choice" key={m}>
                <input type="radio" name="mode" value={m} defaultChecked={mode === m} />
                <span>
                  <b>{m === 'strict' ? dict.parent.modeStrict : dict.parent.modeFlexible}</b>
                  <span className="sub" style={{ display: 'block' }}>
                    {m === 'strict' ? dict.parent.modeStrictBody : dict.parent.modeFlexibleBody}
                  </span>
                </span>
              </label>
            ))}
          </div>

        <div className="card">
          <h2>{fill(dict.parent.ratioTotal, { total })}</h2>
          {/* SPLITTABLE, bukan CATEGORIES: Grow sengaja tidak punya input rasio sama sekali
              (backlog A, ADR-0003 — masuk instrumen selalu lewat pengajuan yang disetujui).
              Yang 0% tetap dirender; kalau disembunyikan, ortu tidak punya cara menaikkannya. */}
          {SPLITTABLE.map((c: Category) => (
            <div className="row" key={c}>
              <span className="dot" style={{ background: POCKET_COLOR[c], width: 9, height: 9, borderRadius: 3 }} />
              <span className="nm">{categoryLabel(child.tier, c)}</span>
              <input
                className="field" type="text" inputMode="numeric" name={`ratio_${c}`}
                defaultValue={rules.autoSplit.ratios[c] ?? 0}
                style={{ width: 72, textAlign: 'right', marginLeft: 'auto' }}
              />
              <span className="sub">%</span>
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

            <button className="btn primary" type="submit" style={{ marginTop: 12 }}>
              {dict.settings.save}
            </button>
          </div>
        </form>
      </main>
      <Nav active="settings" pending={pending} />
    </>
  );
}
