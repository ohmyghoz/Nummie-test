import {
  PIN_LENGTH, STARTER_WALLETS,
  ageFrom, suggestTier, validateChild, type Tier,
} from '@nummi/core';
import { getParentData } from '../../../lib/data';
import { dict, fill } from '../../../lib/copy';
import { Nav, TopBar } from '../../../components/ui';
import { addChild } from '../../../lib/actions';

const TIERS: Tier[] = ['little', 'middle', 'teen'];

const ERROR_COPY: Record<string, string> = {
  'child.nameRequired': dict.addChild.nameRequired,
  'child.birthMonthInvalid': dict.addChild.birthMonthInvalid,
  'child.birthYearInvalid': dict.addChild.birthYearInvalid,
  'child.pinDigitsOnly': dict.addChild.pinDigitsOnly,
  // Belum bisa benar-benar terpicu di sini: keunikan PIN diperiksa `family_pin_taken()` di
  // Postgres, dan layar ini masih membaca `lib/data.ts` (backlog U-2). Dipetakan sekarang
  // supaya saat disambungkan tidak ada errorKey yang jatuh tanpa copy.
  'child.pinTaken': dict.addChild.pinTaken,
};

export default async function AddChildPage({
  searchParams,
}: {
  searchParams: Promise<{
    name?: string; month?: string; year?: string; tier?: string; pin?: string; e?: string;
  }>;
}) {
  const sp = await searchParams;
  const data = await getParentData();
  const pending = data.children.reduce((n, c) => n + c.openRequests.length, 0);

  const name = sp.name ?? '';
  const month = Number(sp.month ?? 0);
  const year = Number(sp.year ?? 0);
  const pin = sp.pin ?? '';
  const submitted = sp.name !== undefined;

  const canSuggest = month >= 1 && month <= 12 && year > 1900;
  const suggested = canSuggest ? suggestTier(month, year, data.today) : undefined;
  // Saran hanya default; pilihan ortu selalu menang.
  const tier = (TIERS.includes(sp.tier as Tier) ? (sp.tier as Tier) : suggested) ?? 'middle';

  const check = submitted
    ? validateChild({ name, birthMonth: month, birthYear: year, tier, pin }, data.today)
    : undefined;

  return (
    <>
      <main className="wrap">
        <TopBar parentName={data.parentName} />
        <h1 style={{ fontSize: 19, fontWeight: 800, marginBottom: 12 }}>{dict.addChild.title}</h1>

        <form method="get" action="/children/new">
          <div className="card">
            <label className="sub">{dict.addChild.name}</label>
            <input className="field" type="text" name="name" defaultValue={name} style={{ marginTop: 5 }} />

            <label className="sub" style={{ display: 'block', marginTop: 12 }}>{dict.addChild.birth}</label>
            {/* Bulan + tahun saja. Tanggal presisi tidak pernah diminta — sudah jadi
                constraint skema, bukan sekadar niat baik. */}
            <div style={{ display: 'flex', gap: 8, marginTop: 5 }}>
              <input className="field" type="text" inputMode="numeric" name="month"
                placeholder={dict.addChild.month} defaultValue={sp.month ?? ''} />
              <input className="field" type="text" inputMode="numeric" name="year"
                placeholder={dict.addChild.year} defaultValue={sp.year ?? ''} />
            </div>
            <p className="sub" style={{ marginTop: 6 }}>🔒 {dict.addChild.privacy}</p>
          </div>

          <div className="card">
            <h2>{dict.addChild.tier}</h2>
            {TIERS.map((t) => (
              <label className="choice" key={t}>
                <input type="radio" name="tier" value={t} defaultChecked={tier === t} />
                <span>
                  {dict.tierName[t]}
                  {suggested === t && (
                    <span className="pill" style={{ marginLeft: 8 }}>{dict.addChild.tierSuggested}</span>
                  )}
                </span>
              </label>
            ))}
            {/* Ditimpa tanpa dihakimi — tidak ada peringatan, tidak ada "yakin?". */}
            <p className="sub" style={{ marginTop: 6 }}>
              {dict.addChild.tierOverride}
              {canSuggest && ` (${ageFrom(month, year, data.today)})`}
            </p>
          </div>

          <div className="card">
            <label className="sub">{dict.addChild.pin}</label>
            <input className="field" type="text" inputMode="numeric" name="pin"
              maxLength={PIN_LENGTH} defaultValue={pin} style={{ marginTop: 5 }} />
            <p className="sub" style={{ marginTop: 6 }}>
              {fill(dict.addChild.pinHint, { length: PIN_LENGTH })}
            </p>
          </div>

          <button className="btn primary" type="submit">
            {fill(dict.addChild.submit, { name: name || '…' })}
          </button>
        </form>

        {sp.e && (
          <div className="errbox" style={{ marginTop: 12 }}>
            {ERROR_COPY[sp.e] ?? dict.parent.decisionFailed}
          </div>
        )}

        {check && !check.ok && check.errorKey && (
          <div className="errbox" style={{ marginTop: 12 }}>
            {check.errorKey === 'child.pinLength'
              ? fill(dict.addChild.pinLength, { length: PIN_LENGTH })
              : ERROR_COPY[check.errorKey]}
          </div>
        )}

        {check?.ok && (
          <form action={addChild} className="card" style={{ marginTop: 12 }}>
            <input type="hidden" name="name" value={name} />
            <input type="hidden" name="month" value={month} />
            <input type="hidden" name="year" value={year} />
            <input type="hidden" name="tier" value={tier} />
            <input type="hidden" name="pin" value={pin} />
            <h2>{dict.addChild.starterWallets}</h2>
            {/* Bentuk wallet awal identik untuk ketiga tier — anak yang naik tier tidak
                perlu migrasi apa pun. */}
            {STARTER_WALLETS.map((w) => (
              <div className="row" key={w.name}>
                <span className="nm">{w.name}</span>
                <span className="sub">{w.category}</span>
              </div>
            ))}
            <p className="note" style={{ marginTop: 10 }}>
              {fill(dict.addChild.created, { name })}
            </p>
            {/* Langkah kedua yang benar-benar membuat anaknya. Satu transaksi di database:
                anak + wallet awal + aturan uang + ekonomi, atau tidak terjadi apa pun. */}
            <button className="btn primary" type="submit" style={{ marginTop: 10 }}>
              {fill(dict.addChild.submit, { name })}
            </button>
          </form>
        )}
      </main>
      <Nav active="settings" pending={pending} />
    </>
  );
}
