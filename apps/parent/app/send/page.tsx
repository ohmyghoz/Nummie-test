import { SEND_SOURCES, formatRp, parseRp, validateSend, type SendSource } from '@nummi/core';
import { findChild, getParentData } from '../../lib/data';
import { dict, fill } from '../../lib/copy';
import { Nav, TopBar } from '../../components/ui';

const ERROR_COPY: Record<string, string> = {
  'send.amountRequired': dict.parent.amountRequired,
  'send.sourceRequired': dict.parent.sourceRequired,
};

const isSource = (v?: string): v is SendSource =>
  !!v && (SEND_SOURCES as readonly string[]).includes(v);

export default async function SendPage({
  searchParams,
}: { searchParams: Promise<{ child?: string; amount?: string; source?: string; note?: string }> }) {
  const sp = await searchParams;
  const data = await getParentData();
  const child = findChild(data, sp.child);
  const pending = data.children.reduce((n, c) => n + c.openRequests.length, 0);

  const amount = sp.amount ? parseRp(sp.amount) : 0;
  const source = isSource(sp.source) ? sp.source : undefined;
  const submitted = sp.amount !== undefined || sp.source !== undefined;
  const check = source
    ? validateSend({ amount, source, note: sp.note })
    : { ok: false, errorKey: 'send.sourceRequired' as const };

  return (
    <>
      <main className="wrap">
        <TopBar parentName={data.parentName} />
        <h1 style={{ fontSize: 19, fontWeight: 800, marginBottom: 4 }}>{dict.parent.sendTitle}</h1>
        {/* Tujuan tidak bisa dipilih — SELALU Unsorted. Anak yang memberi tugasnya. */}
        <p className="sub" style={{ marginBottom: 12 }}>
          {fill(dict.parent.landsInUnsorted, { child: child.name })}
        </p>

        <form method="get" action="/send">
          <input type="hidden" name="child" value={child.id} />

          <div className="card">
            <h2>{dict.parent.sendTitle}</h2>
            <input
              className="field" type="text" inputMode="numeric" name="amount"
              defaultValue={sp.amount ?? ''} placeholder="0"
            />
          </div>

          <div className="card">
            <h2>{dict.parent.sendSource}</h2>
            {SEND_SOURCES.map((s) => (
              <label className="choice" key={s}>
                <input type="radio" name="source" value={s} defaultChecked={source === s} />
                <span>{dict.sendSource[s]}</span>
              </label>
            ))}
            <input
              className="field" type="text" name="note" defaultValue={sp.note ?? ''}
              placeholder={dict.parent.sendNote} style={{ marginTop: 8 }}
            />
          </div>

          {submitted && !check.ok && check.errorKey && (
            <div className="errbox">{ERROR_COPY[check.errorKey]}</div>
          )}

          <button className="btn primary" type="submit">{dict.parent.sendSubmit}</button>
        </form>

        {submitted && check.ok && source && (
          <div className="card" style={{ marginTop: 12 }}>
            <h2>{fill(dict.parent.notificationPreview, { child: child.name })}</h2>
            <div className="row">
              <span className="nm">{dict.sendSource[source]}</span>
              <span className="amt num">{formatRp(amount)}</span>
            </div>
            <p className="sub" style={{ marginTop: 6 }}>
              → {child.unsortedWallet?.name}
            </p>
            {sp.note && <p className="note" style={{ marginTop: 8 }}>“{sp.note}”</p>}
          </div>
        )}
      </main>
      <Nav active="send" pending={pending} />
    </>
  );
}
