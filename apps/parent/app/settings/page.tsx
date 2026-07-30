import {
  formatRp, goldSpreadPct, growPosition, isMatured, daysUntilMaturity,
  nextAllowanceDates, parseRp, ratesRewardPatience, validateAllowance, validateBankRates,
  type AllowanceFrequency,
} from '@nummi/core';
import { findChild, getParentData } from '../../lib/data';
import { dict, fill } from '../../lib/copy';
import { Nav, POCKET_COLOR, TopBar } from '../../components/ui';
import { saveAllowance, saveBankRates } from '../../lib/actions';

const FREQUENCIES: AllowanceFrequency[] = ['weekly', 'biweekly', 'monthly'];
const WEEKDAYS = ['0', '1', '2', '3', '4', '5', '6'] as const;

const ERROR_COPY: Record<string, string> = {
  'allowance.amountRequired': dict.settings.amountRequired,
  'allowance.dayOutOfRange': dict.settings.dayOutOfRange,
  'rates.negative': dict.settings.ratesNegative,
  'rates.tooHigh': dict.settings.ratesTooHigh,
};

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{
    child?: string; amount?: string; freq?: string; day?: string; off?: string;
    saved?: string; e?: string;
  }>;
}) {
  const sp = await searchParams;
  const data = await getParentData();
  const child = findChild(data, sp.child);
  const pending = data.children.reduce((n, c) => n + c.openRequests.length, 0);

  // Jadwal yang sedang dilihat: dari DATABASE (0013), bisa ditimpa lewat query supaya ortu bisa
  // mencoba kombinasi lain dan melihat tanggalnya SEBELUM menyimpan.
  const freq = FREQUENCIES.includes(sp.freq as AllowanceFrequency)
    ? (sp.freq as AllowanceFrequency)
    : child.allowance.frequency;
  const schedule = {
    ...child.allowance,
    enabled: sp.off !== '1',
    frequency: freq,
    amount: sp.amount ? parseRp(sp.amount) : child.allowance.amount,
    day: sp.day !== undefined ? Number(sp.day) : child.allowance.day,
  };
  const check = validateAllowance(schedule);
  const upcoming = check.ok ? nextAllowanceDates(schedule, data.today, 3) : [];

  const rates = data.prices.bankRates;
  const ratesCheck = validateBankRates(rates);
  const patient = ratesRewardPatience(rates);

  const keep = (extra: Record<string, string>) =>
    `/settings?${new URLSearchParams({ child: child.id, ...extra }).toString()}`;

  return (
    <>
      <main className="wrap">
        <TopBar parentName={data.parentName} />
        <h1 style={{ fontSize: 19, fontWeight: 800, marginBottom: 12 }}>
          {dict.settings.title} · {child.name}
        </h1>

        {sp.saved && (
          <p className="pill ok" style={{ display: 'inline-block', marginBottom: 10 }}>
            {dict.settings.saved}
          </p>
        )}
        {sp.e && <div className="errbox">{ERROR_COPY[sp.e] ?? dict.parent.decisionFailed}</div>}

        {/* ── PIN anak ───────────────────────────────────────────────────────
            Ditaruh paling atas dengan sengaja: ini yang dicari ortu saat sedang panik karena
            anaknya tidak bisa masuk, dan ia harus ketemu tanpa menggulir. */}
        <div className="card">
          <h2>{dict.resetPin.title}</h2>
          <p className="sub" style={{ marginTop: -6, marginBottom: 10 }}>
            {dict.resetPin.cannotSee}
          </p>
          <a className="btn" href={`/children/pin?child=${child.id}`}>
            {dict.resetPin.submit}
          </a>
        </div>

        {/* ── Allowance schedule ─────────────────────────────────────────────── */}
        <div className="card">
          <h2>{dict.settings.allowance}</h2>
          <p className="sub" style={{ marginTop: -6, marginBottom: 10 }}>
            {dict.settings.noApprovalNeeded} {dict.settings.landsInUnsorted}
          </p>

          <form method="get" action="/settings">
            <input type="hidden" name="child" value={child.id} />
            <label className="sub">{dict.settings.amount}</label>
            <input
              className="field" type="text" inputMode="numeric" name="amount"
              defaultValue={String(schedule.amount)} style={{ marginTop: 5, marginBottom: 10 }}
            />

            <label className="sub">{dict.settings.frequency}</label>
            <div style={{ marginTop: 5, marginBottom: 10 }}>
              {FREQUENCIES.map((f) => (
                <label className="choice" key={f}>
                  <input type="radio" name="freq" value={f} defaultChecked={freq === f} />
                  <span>{dict.frequency[f]}</span>
                </label>
              ))}
            </div>

            <label className="sub">{dict.settings.day}</label>
            {freq === 'monthly' ? (
              <input
                className="field" type="text" inputMode="numeric" name="day"
                defaultValue={String(schedule.day)} style={{ marginTop: 5 }}
              />
            ) : (
              <div style={{ marginTop: 5 }}>
                {WEEKDAYS.map((d) => (
                  <label className="choice" key={d}>
                    <input type="radio" name="day" value={d} defaultChecked={String(schedule.day) === d} />
                    <span>{dict.weekday[d]}</span>
                  </label>
                ))}
              </div>
            )}

            <button className="btn primary" type="submit" style={{ marginTop: 10 }}>
              {dict.settings.nextDates}
            </button>
          </form>

          {!check.ok && check.errorKey && (
            <div className="errbox" style={{ marginTop: 10 }}>{ERROR_COPY[check.errorKey]}</div>
          )}

          {/* Tiga tanggal, bukan satu — "tiap dua minggu" terlihat sama persis dengan
              "tiap minggu" kalau hanya satu tanggal yang ditampilkan. */}
          {upcoming.length > 0 && (
            <div style={{ marginTop: 10 }}>
              <h2>{dict.settings.nextDates}</h2>
              {upcoming.map((d) => (
                <div className="row" key={d}>
                  <span className="nm">{d}</span>
                  <span className="amt num">{formatRp(schedule.amount)}</span>
                </div>
              ))}
            </div>
          )}
          {/* SIMPAN — sampai 30 Juli 2026 layar ini seluruhnya pratinjau: form di atas hanya
              menulis query param, dan tidak ada satu pun tombol yang menyimpan. */}
          <form action={saveAllowance} style={{ marginTop: 12 }}>
            <input type="hidden" name="child" value={child.id} />
            <input type="hidden" name="amount" value={schedule.amount} />
            <input type="hidden" name="frequency" value={schedule.frequency} />
            <input type="hidden" name="day" value={schedule.day} />
            <label className="choice">
              <input type="checkbox" name="enabled" defaultChecked={schedule.enabled} />
              <span>{schedule.enabled ? dict.settings.allowanceOn : dict.settings.allowanceOff}</span>
            </label>
            <button className="btn primary" type="submit" style={{ marginTop: 8 }}>
              {dict.settings.save}
            </button>
          </form>
        </div>

        {/* ── Your bank rates ────────────────────────────────────────────────── */}
        <div className="card">
          <h2>{dict.settings.ratesTitle}</h2>
          <p className="sub" style={{ marginTop: -6, marginBottom: 8 }}>{dict.settings.ratesHint}</p>
          {/* Sampai 30 Juli 2026 ketiga baris ini hanya TAMPILAN, padahal copy di atasnya
              berbunyi "You are the bank." Sekarang benar-benar bisa disetel. */}
          <form action={saveBankRates}>
            <input type="hidden" name="child" value={child.id} />
            {([['m3', 3], ['m6', 6], ['m12', 12]] as const).map(([key, months]) => (
              <div className="row" key={key}>
                <span className="nm">{fill(dict.settings.months, { n: months })}</span>
                <input
                  className="field" type="text" inputMode="decimal" name={key}
                  defaultValue={rates[key]}
                  style={{ width: 84, textAlign: 'right', marginLeft: 'auto' }}
                />
                <span className="sub">%</span>
              </div>
            ))}

            {!ratesCheck.ok && ratesCheck.errorKey && (
              <div className="errbox" style={{ marginTop: 10 }}>{ERROR_COPY[ratesCheck.errorKey]}</div>
            )}
            {/* Petunjuk, BUKAN larangan — ortu tetap bank-nya (ADR-0003). Rate terbalik
                tetap tersimpan; layar cuma menyebutkan bahwa itu terbalik. */}
            {!patient && <p className="note" style={{ marginTop: 10 }}>{dict.settings.ratesUpsideDown}</p>}
            <p className="sub" style={{ marginTop: 8 }}>{dict.settings.oneTapApprove}</p>

            <button className="btn primary" type="submit" style={{ marginTop: 10 }}>
              {dict.settings.save}
            </button>
          </form>
        </div>

        {/* ── Today's prices ─────────────────────────────────────────────────── */}
        <div className="card">
          <h2>{dict.settings.pricesTitle}</h2>
          <p className="sub" style={{ marginTop: -6, marginBottom: 8 }}>
            {fill(dict.settings.pricesFrom, { date: data.prices.updatedAt })}
          </p>
          <div className="row">
            <span className="nm">{dict.settings.goldSell}</span>
            <span className="amt num">{formatRp(data.prices.goldSellPerGram)}/g</span>
          </div>
          <div className="row">
            <span className="nm">{dict.settings.goldBuyback}</span>
            <span className="amt num">{formatRp(data.prices.goldBuybackPerGram)}/g</span>
          </div>
          <div className="row">
            <span className="nm">{fill(dict.settings.spread, { pct: goldSpreadPct(data.prices).toFixed(1) })}</span>
          </div>
          <h2 style={{ marginTop: 12 }}>{dict.settings.fx}</h2>
          {Object.entries(data.prices.fxMid).map(([cur, mid]) => (
            <div className="row" key={cur}>
              <span className="nm">{cur}</span>
              <span className="amt num">{formatRp(mid)}</span>
            </div>
          ))}
        </div>

        {/* ── Manage investments ─────────────────────────────────────────────── */}
        <div className="card">
          <h2>{dict.settings.investmentsTitle}</h2>
          {child.investments.map(({ wallet, rupiahIn, valueNow }) => {
            const pos = growPosition(rupiahIn, valueNow);
            // Jatuh tempo diambil dari LEDGER (bunga sudah tercatat), bukan dari tanggal —
            // tanggal seed masih placeholder. Lihat catatan di seed.ts.
            const maturedByLedger = wallet.instrument === 'time_deposit' && pos.deltaRp > 0;
            const daysLeft = daysUntilMaturity(data.tdStart, 6, data.today);
            return (
              <div className="row" key={wallet.id}>
                <span className="dot" style={{ background: POCKET_COLOR.grow, width: 9, height: 9, borderRadius: 3 }} />
                <span>
                  <span className="nm">{wallet.name}</span>
                  <span className="sub" style={{ display: 'block' }}>
                    {formatRp(rupiahIn)} → {formatRp(valueNow)} ({pos.deltaPct.toFixed(1)}%)
                    {wallet.instrument === 'time_deposit' && (
                      maturedByLedger
                        ? ` · ✅ ${dict.settings.matured}`
                        : ` · ${fill(dict.settings.daysLeft, { days: daysLeft })}`
                    )}
                  </span>
                </span>
                <span className="amt num">{formatRp(valueNow)}</span>
              </div>
            );
          })}
          <p className="sub" style={{ marginTop: 10 }}>
            {fill(dict.settings.startedOn, { date: data.tdStart })} · {dict.settings.placeholderDates}
          </p>
        </div>
      </main>
      <Nav active="settings" pending={pending} />
    </>
  );
}
