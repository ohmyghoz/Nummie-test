import { GIVE_CAUSES, formatRp, parseRp, validateGive, type GiveCause } from '@nummi/core';
import { getKidData } from '../../lib/data';
import { dict, fill } from '../../lib/copy';
import { Brand, Nav } from '../../components/ui';

const ERROR_COPY: Record<string, string> = {
  'give.amountRequired': dict.give.amountRequired,
  'give.notEnough': dict.give.notEnough,
  'give.ownCauseNeedsNote': dict.give.ownCauseNeedsNote,
};

function isCause(v: string | undefined): v is GiveCause {
  return !!v && (GIVE_CAUSES as readonly string[]).includes(v);
}

export default async function GivePage({
  searchParams,
}: { searchParams: Promise<{ amount?: string; cause?: string; note?: string; sent?: string }> }) {
  const sp = await searchParams;
  const data = getKidData();

  // Form dikirim lewat GET — nol JavaScript klien, semua keputusan tetap di server.
  const amount = sp.amount ? parseRp(sp.amount) : 0;
  const cause = isCause(sp.cause) ? sp.cause : undefined;
  const note = sp.note?.trim() || undefined;
  const submitted = sp.amount !== undefined || sp.cause !== undefined;

  const check = cause
    ? validateGive({ amount, sourceWalletId: 'w_give', cause, note }, data.giveBalance)
    : { ok: false, errorKey: 'give.amountRequired' as const };

  const ready = submitted && check.ok;

  return (
    <>
      <main className="wrap">
        <Brand childName={data.child.name} />
        <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>{dict.give.title}</h1>
        <p className="muted" style={{ marginBottom: 14 }}>
          {fill(dict.give.available, { amount: formatRp(data.giveBalance) })}
        </p>

        {sp.sent ? (
          <div className="card">
            <p style={{ fontWeight: 700 }}>🎁 {dict.give.sent}</p>
            <a className="cta" href="/giving">{dict.give.whereMyGivingWent}</a>
          </div>
        ) : (
          <form method="get" action="/give">
            <div className="card">
              <h2>{dict.give.howMuch}</h2>
              <input
                className="field" type="text" inputMode="numeric" name="amount"
                defaultValue={sp.amount ?? ''} placeholder="0"
              />
            </div>

            <div className="card">
              <h2>{dict.give.pickCause}</h2>
              {GIVE_CAUSES.map((c) => (
                <label className="choice" key={c}>
                  <input type="radio" name="cause" value={c} defaultChecked={cause === c} />
                  <span>{dict.giveCause[c]}</span>
                </label>
              ))}
              {/* Teks bebas anak memang berbahasa Indonesia — tidak terpengaruh D1. */}
              <input
                className="field" type="text" name="note" defaultValue={sp.note ?? ''}
                placeholder={dict.give.notePlaceholder} style={{ marginTop: 10 }}
              />
              <p className="muted" style={{ marginTop: 8 }}>{dict.give.reasonLabel}</p>
            </div>

            {submitted && !check.ok && check.errorKey && (
              <div className="errbox">{ERROR_COPY[check.errorKey]}</div>
            )}

            <button className="cta" type="submit">{dict.give.submit}</button>
          </form>
        )}

        {ready && !sp.sent && (
          <div className="card" style={{ marginTop: 14 }}>
            <h2>{dict.sort.preview}</h2>
            <div className="slot">
              <span className="dot" style={{ background: 'var(--give)' }} />
              <div>
                <div className="nm">{dict.giveCause[cause!]}</div>
                {note && <div className="pct">“{note}”</div>}
              </div>
              <span className="amt num">{formatRp(amount)}</span>
            </div>
            {/* ADR-0002: mengajukan != disetujui, dan disetujui != tersalurkan. */}
            <p className="muted">{dict.common.waitingForGrownUp}</p>
            <a
              className="cta"
              href={`/give?sent=1&amount=${amount}&cause=${cause}${note ? `&note=${encodeURIComponent(note)}` : ''}`}
            >
              {dict.give.submit}
            </a>
          </div>
        )}
      </main>
      <Nav active="add" />
    </>
  );
}
