import {
  allowedRewards, formatRp, parseRp, validateJob, validatePrize, weeksToEarn,
  type JobKind, type RewardKind,
} from '@nummi/core';
import { findChild, getParentData } from '../../lib/data';
import { dict, fill } from '../../lib/copy';
import { Nav, TopBar } from '../../components/ui';

const KINDS: JobKind[] = ['family_contribution', 'extra_work', 'achievement'];

const ERROR_COPY: Record<string, string> = {
  'job.titleRequired': dict.jobs.titleRequired,
  'job.amountRequired': dict.jobs.amountRequired,
  'job.moneyNotAllowedForFamily': dict.jobs.moneyNotAllowed,
  'prize.titleRequired': dict.jobs.titleRequired,
  'prize.costRequired': dict.jobs.costRequired,
};

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<{
    child?: string; kind?: string; title?: string; reward?: string; amount?: string;
    prize?: string; cost?: string; perWeek?: string;
  }>;
}) {
  const sp = await searchParams;
  const data = getParentData();
  const child = findChild(data, sp.child);
  const pending = data.children.reduce((n, c) => n + c.openRequests.length, 0);

  const kind: JobKind = KINDS.includes(sp.kind as JobKind)
    ? (sp.kind as JobKind)
    : 'family_contribution';
  // INI barisnya: untuk kontribusi keluarga daftarnya hanya ['gems'], jadi opsi uang
  // tidak pernah dirender sama sekali — bukan dirender lalu dinonaktifkan.
  const rewards: RewardKind[] = allowedRewards(kind);
  /**
   * Reward yang DIMINTA diteruskan apa adanya ke validasi, walau tidak diizinkan untuk jenis
   * ini. Menormalkannya diam-diam jadi `gems` akan menyembunyikan penjaganya: ortu yang
   * mengirim `reward=money` untuk kontribusi keluarga harus MELIHAT penolakannya, bukan
   * mendapati pilihannya ditukar tanpa diberi tahu.
   */
  const requested: RewardKind | undefined =
    sp.reward === 'gems' || sp.reward === 'money' ? sp.reward : undefined;
  const reward: RewardKind = requested ?? rewards[0]!;

  const amount = sp.amount ? parseRp(sp.amount) : 0;
  const jobSubmitted = sp.title !== undefined;
  const jobCheck = jobSubmitted
    ? validateJob({ kind, title: sp.title ?? '', reward, amount })
    : undefined;

  const gemCost = sp.cost ? Number(sp.cost) : 0;
  const perWeek = sp.perWeek ? Number(sp.perWeek) : 0;
  const prizeSubmitted = sp.prize !== undefined;
  const prizeCheck = prizeSubmitted
    ? validatePrize({ title: sp.prize ?? '', gemCost })
    : undefined;
  const weeks = prizeCheck?.ok ? weeksToEarn(gemCost, perWeek) : undefined;

  return (
    <>
      <main className="wrap">
        <TopBar parentName={data.parentName} />
        <h1 style={{ fontSize: 19, fontWeight: 800, marginBottom: 12 }}>
          {dict.jobs.title} · {child.name}
        </h1>

        <form method="get" action="/jobs">
          <input type="hidden" name="child" value={child.id} />
          <div className="card">
            <h2>{dict.jobs.kind}</h2>
            {KINDS.map((k) => (
              <label className="choice" key={k}>
                <input type="radio" name="kind" value={k} defaultChecked={kind === k} />
                <span>{dict.jobKind[k]}</span>
              </label>
            ))}

            <label className="sub" style={{ display: 'block', marginTop: 10 }}>{dict.jobs.jobTitle}</label>
            <input className="field" type="text" name="title" defaultValue={sp.title ?? ''} style={{ marginTop: 5 }} />

            <label className="sub" style={{ display: 'block', marginTop: 10 }}>{dict.jobs.reward}</label>
            {rewards.length === 1 ? (
              <>
                <p className="pill" style={{ marginTop: 5 }}>💎 {dict.jobs.gemsOnly}</p>
                <input type="hidden" name="reward" value="gems" />
                {/* Alasannya ditulis, bukan disembunyikan — supaya ortu paham, bukan menurut. */}
                <p className="note" style={{ marginTop: 8 }}>{dict.jobs.whyGemsOnly}</p>
              </>
            ) : (
              <div style={{ marginTop: 5 }}>
                {rewards.map((r) => (
                  <label className="choice" key={r}>
                    <input type="radio" name="reward" value={r} defaultChecked={reward === r} />
                    <span>{dict.rewardKind[r]}</span>
                  </label>
                ))}
              </div>
            )}

            <label className="sub" style={{ display: 'block', marginTop: 10 }}>{dict.jobs.amount}</label>
            <input className="field" type="text" inputMode="numeric" name="amount"
              defaultValue={sp.amount ?? ''} style={{ marginTop: 5 }} />

            <button className="btn primary" type="submit" style={{ marginTop: 10 }}>{dict.jobs.add}</button>
          </div>
        </form>

        {jobCheck && !jobCheck.ok && jobCheck.errorKey && (
          <div className="errbox">{ERROR_COPY[jobCheck.errorKey]}</div>
        )}
        {jobCheck?.ok && (
          <div className="card">
            <div className="row">
              <span className="nm">{sp.title}</span>
              <span className="sub">{dict.jobKind[kind]}</span>
              <span className="amt num">
                {reward === 'gems' ? `${amount} 💎` : formatRp(amount)}
              </span>
            </div>
          </div>
        )}

        <form method="get" action="/jobs">
          <input type="hidden" name="child" value={child.id} />
          <div className="card">
            <h2>{dict.jobs.prizes}</h2>
            <label className="sub">{dict.jobs.prizeTitle}</label>
            <input className="field" type="text" name="prize" defaultValue={sp.prize ?? ''} style={{ marginTop: 5 }} />
            <label className="sub" style={{ display: 'block', marginTop: 10 }}>{dict.jobs.gemCost}</label>
            <input className="field" type="text" inputMode="numeric" name="cost"
              defaultValue={sp.cost ?? ''} style={{ marginTop: 5 }} />
            <label className="sub" style={{ display: 'block', marginTop: 10 }}>
              {fill(dict.jobs.gemsPerWeek, { gems: perWeek })}
            </label>
            <input className="field" type="text" inputMode="numeric" name="perWeek"
              defaultValue={sp.perWeek ?? ''} style={{ marginTop: 5 }} />
            <button className="btn primary" type="submit" style={{ marginTop: 10 }}>{dict.jobs.add}</button>
          </div>
        </form>

        {prizeCheck && !prizeCheck.ok && prizeCheck.errorKey && (
          <div className="errbox">{ERROR_COPY[prizeCheck.errorKey]}</div>
        )}
        {/* "Berapa lama untuk dapat" — pratinjau yang menghentikan ortu memasang hadiah
            mustahil. Hadiah yang tak akan pernah tercapai DITANDAI, bukan disembunyikan. */}
        {weeks !== undefined && (
          <div className="card">
            <h2>{dict.jobs.timeToEarn}</h2>
            <p className={weeks === null ? 'errbox' : 'note'}>
              {weeks === null ? dict.jobs.never : fill(dict.jobs.weeks, { weeks })}
            </p>
          </div>
        )}
      </main>
      <Nav active="settings" pending={pending} />
    </>
  );
}
