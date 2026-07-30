import { formatRp, parseRp, validateTake } from '@nummi/core';
import { findChild, getParentData } from '../../lib/data';
import { dict, fill } from '../../lib/copy';
import { Nav, POCKET_COLOR, TopBar } from '../../components/ui';
import { takeMoney } from '../../lib/actions';

const ERROR_COPY: Record<string, string> = {
  'take.amountRequired': dict.parent.amountRequired,
  'take.notEnough': dict.parent.notEnough,
  'take.protected': dict.parent.protected,
  'take.reasonRequired': dict.parent.reasonRequired,
};

const LOCK_COPY: Record<string, string> = {
  'take.dreamProtected': dict.takeLock.dreamProtected,
  'take.giveProtected': dict.takeLock.giveProtected,
  'take.growProtected': dict.takeLock.growProtected,
};

export default async function TakePage({
  searchParams,
}: { searchParams: Promise<{ child?: string; wallet?: string; amount?: string; reason?: string }> }) {
  const sp = await searchParams;
  const data = await getParentData();
  const child = findChild(data, sp.child);
  const pending = data.children.reduce((n, c) => n + c.openRequests.length, 0);

  const target = child.takeTargets.find((t) => t.wallet.id === sp.wallet);
  const amount = sp.amount ? parseRp(sp.amount) : 0;
  const balance = target ? child.balances[target.wallet.id] ?? 0 : 0;
  const submitted = sp.amount !== undefined || sp.reason !== undefined;
  const check = target
    ? validateTake(target.wallet, amount, balance, sp.reason)
    : undefined;

  return (
    <>
      <main className="wrap">
        <TopBar parentName={data.parentName} />
        <h1 style={{ fontSize: 19, fontWeight: 800, marginBottom: 4 }}>{dict.parent.takeTitle}</h1>
        <p className="sub" style={{ marginBottom: 12 }}>{dict.parent.protectedShownNotHidden}</p>

        <div className="card">
          <h2>{dict.parent.takeTitle}</h2>
          {/* I7 / ADR-0007: kantong terlindungi TETAP DITAMPILKAN, digembok, dengan sebab
              spesifik. Menyembunyikannya membuat ortu bingung; menampilkannya-digembok
              mengajari ortu aturannya. */}
          {child.takeTargets.map(({ wallet, locked, reasonKey }) => (
            locked ? (
              <div className="row lockrow" key={wallet.id}>
                <span className="dot" style={{ background: POCKET_COLOR[wallet.category], width: 9, height: 9, borderRadius: 3 }} />
                <span>
                  <span className="nm">🔒 {wallet.name}</span>
                  <span className="sub" style={{ display: 'block' }}>
                    {reasonKey ? LOCK_COPY[reasonKey] : dict.parent.protected}
                  </span>
                </span>
                <span className="amt num">{formatRp(child.balances[wallet.id] ?? 0)}</span>
              </div>
            ) : (
              <a className="row" key={wallet.id} href={`/take?child=${child.id}&wallet=${wallet.id}`}>
                <span className="dot" style={{ background: POCKET_COLOR[wallet.category], width: 9, height: 9, borderRadius: 3 }} />
                <span className="nm">{wallet.name}</span>
                <span className="amt num">{formatRp(child.balances[wallet.id] ?? 0)}</span>
              </a>
            )
          ))}
        </div>

        {target && !target.locked && (
          <form method="get" action="/take">
            <input type="hidden" name="child" value={child.id} />
            <input type="hidden" name="wallet" value={target.wallet.id} />
            <div className="card">
              <h2>{target.wallet.name}</h2>
              <input
                className="field" type="text" inputMode="numeric" name="amount"
                defaultValue={sp.amount ?? ''} placeholder="0"
              />
              {/* Alasan WAJIB — simetris dengan anak. Aturan yang berlaku satu arah saja
                  mengajari anak bahwa aturan itu soal kekuasaan, bukan soal alasan. */}
              <label className="sub" style={{ display: 'block', marginTop: 10 }}>
                {dict.parent.takeReason}
              </label>
              <input
                className="field" type="text" name="reason" defaultValue={sp.reason ?? ''}
                style={{ marginTop: 6 }}
              />
              <button className="btn primary" type="submit" style={{ marginTop: 10 }}>
                {dict.parent.takeSubmit}
              </button>
            </div>
          </form>
        )}

        {submitted && check && !check.ok && check.errorKey && (
          <div className="errbox">{ERROR_COPY[check.errorKey]}</div>
        )}

        {/* Pratinjau notifikasi KATA PER KATA yang akan anak terima — ortu melihat persis
            apa yang dibaca anaknya sebelum menekan. */}
        {check?.ok && target && (
          <form action={takeMoney} className="card">
            <input type="hidden" name="child" value={child.id} />
            <input type="hidden" name="wallet" value={target.wallet.id} />
            <input type="hidden" name="amount" value={amount} />
            <input type="hidden" name="reason" value={sp.reason ?? ''} />
            <h2>{fill(dict.parent.notificationPreview, { child: child.name })}</h2>
            <p className="note">
              −{formatRp(amount)} · {target.wallet.name} — “{sp.reason}”
            </p>
            {/* Langkah kedua yang benar-benar mengambil. Ortu sudah melihat kata per kata apa
                yang akan dibaca anaknya sebelum menekan ini. */}
            <button className="btn primary" type="submit" style={{ marginTop: 10 }}>
              {dict.parent.takeSubmit}
            </button>
          </form>
        )}
      </main>
      <Nav active="dashboard" pending={pending} />
    </>
  );
}
