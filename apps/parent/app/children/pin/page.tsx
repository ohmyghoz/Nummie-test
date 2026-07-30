/**
 * Ganti PIN anak — jalur pemulihan satu-satunya.
 *
 * Ortu **mengganti**, tidak pernah **melihat**. `pin_hash` di-bcrypt dan sengaja tidak pernah
 * keluar dari database (migrasi 0006); layar ini tidak berusaha mengakalinya. Sampai 30 Juli 2026
 * jalur ini tidak ada sama sekali, sementara app anak menjanjikan ortu bisa melihat PIN-nya —
 * anak yang lupa PIN terkunci permanen dari uangnya sendiri.
 */
import { PIN_LENGTH } from '@nummi/core';
import { findChild, getParentData } from '../../../lib/data';
import { dict, fill } from '../../../lib/copy';
import { Nav, TopBar } from '../../../components/ui';
import { resetChildPin } from '../../../lib/actions';

const ERROR_COPY: Record<string, string> = {
  'child.pinDigitsOnly': dict.addChild.pinDigitsOnly,
  'child.pinTaken': dict.addChild.pinTaken,
};

export default async function ResetPinPage({
  searchParams,
}: { searchParams: Promise<{ child?: string; e?: string; saved?: string }> }) {
  const sp = await searchParams;
  const data = await getParentData();
  const child = findChild(data, sp.child);
  const pending = data.children.reduce((n, c) => n + c.openRequests.length, 0);

  return (
    <>
      <main className="wrap">
        <TopBar parentName={data.parentName} />
        <h1 style={{ fontSize: 19, fontWeight: 800, marginBottom: 4 }}>{dict.resetPin.title}</h1>
        <p className="sub" style={{ marginBottom: 12 }}>
          {fill(dict.resetPin.forWhom, { name: child.name })}
        </p>

        <div className="card">
          <form action={resetChildPin}>
            <input type="hidden" name="child" value={child.id} />
            <label className="sub" htmlFor="pin">{dict.resetPin.newPin}</label>
            <input
              id="pin" className="field" type="text" inputMode="numeric" name="pin"
              maxLength={PIN_LENGTH} autoComplete="off" style={{ marginTop: 5 }}
            />
            <p className="sub" style={{ marginTop: 6 }}>
              {fill(dict.resetPin.hint, { length: PIN_LENGTH })}
            </p>
            <button className="btn primary" type="submit" style={{ marginTop: 12 }}>
              {dict.resetPin.submit}
            </button>
          </form>
        </div>

        {/* Dikatakan apa adanya. Ortu yang mengira bisa melihat PIN lama akan mencarinya. */}
        <p className="note">🔒 {dict.resetPin.cannotSee}</p>

        {sp.saved && (
          <div className="card" style={{ marginTop: 12 }}>
            <strong>{dict.resetPin.saved}</strong>
            <p className="sub" style={{ marginTop: 6 }}>
              {fill(dict.resetPin.tellThem, { name: child.name })}
            </p>
          </div>
        )}

        {sp.e && (
          <div className="errbox" style={{ marginTop: 12 }}>
            {sp.e === 'child.pinLength'
              ? fill(dict.addChild.pinLength, { length: PIN_LENGTH })
              : ERROR_COPY[sp.e] ?? dict.parent.decisionFailed}
          </div>
        )}
      </main>
      <Nav active="settings" pending={pending} />
    </>
  );
}
