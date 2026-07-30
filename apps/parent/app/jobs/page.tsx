import {
  BIG_PRIZE_CHAPTER, CHAPTER_COUNT, CHORES_GATE_LIFETIME_STARS,
  allowedRewards, bigPrizesUnlocked, canRedeemGems, choresUnlocked, formatRp, parseRp,
  validateJob, validatePrize, weeksToEarn,
  type JobKind, type RewardKind,
} from '@nummi/core';
import { findChild, getParentData } from '../../lib/data';
import { dict, fill } from '../../lib/copy';
import { Nav, TopBar } from '../../components/ui';
import { archiveJob, archivePrize, createJob, createPrize } from '../../lib/actions';

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
    saved?: string; e?: string;
  }>;
}) {
  const sp = await searchParams;
  const data = await getParentData();
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
          <form action={createJob} className="card">
            <input type="hidden" name="child" value={child.id} />
            <input type="hidden" name="kind" value={kind} />
            <input type="hidden" name="title" value={sp.title ?? ''} />
            <input type="hidden" name="reward" value={reward} />
            <input type="hidden" name="amount" value={amount} />
            <div className="row">
              <span className="nm">{sp.title}</span>
              <span className="sub">{dict.jobKind[kind]}</span>
              <span className="amt num">
                {reward === 'gems' ? `${amount} 💎` : formatRp(amount)}
              </span>
            </div>
            {/* Langkah kedua yang benar-benar menyimpan. Sebelum ini kartu ini cuma pratinjau. */}
            <button className="btn primary" type="submit" style={{ marginTop: 10 }}>
              {dict.settings.save}
            </button>
          </form>
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
          <form action={createPrize} className="card">
            <input type="hidden" name="child" value={child.id} />
            <input type="hidden" name="title" value={sp.prize ?? ''} />
            <input type="hidden" name="cost" value={sp.cost ?? ''} />
            <h2>{dict.jobs.timeToEarn}</h2>
            <p className={weeks === null ? 'errbox' : 'note'}>
              {weeks === null ? dict.jobs.never : fill(dict.jobs.weeks, { weeks })}
            </p>
            {/* Hadiah yang tak akan pernah tercapai tetap BOLEH disimpan — ortu sudah diberi tahu,
                dan melarangnya berarti app memutuskan menggantikan ortu. */}
            {prizeCheck?.ok && (
              <button className="btn primary" type="submit" style={{ marginTop: 10 }}>
                {dict.settings.save}
              </button>
            )}
          </form>
        )}

        {sp.saved && (
          <p className="pill ok" style={{ display: 'inline-block' }}>{dict.settings.saved}</p>
        )}
        {sp.e && !jobCheck && !prizeCheck && (
          <div className="errbox">{ERROR_COPY[sp.e] ?? dict.parent.decisionFailed}</div>
        )}

        {/* Daftar yang SUDAH tersimpan — sebelum ini layar ini tidak pernah menampilkan apa pun
            yang pernah dibuat, karena tidak ada yang pernah tersimpan. */}
        {/*
          LEARNING TRACKER — ada di spec sejak handoff §82, tidak pernah bisa dibangun karena app
          ortu tidak pernah membaca `child_economy`. Tempatnya di sini, bukan di Dashboard: ketiga
          gerbang ADR-0004 menentukan apa yang bisa dipakai dari Jobs & Prizes, jadi ortu perlu
          melihatnya justru saat ia sedang menyiapkannya.

          Setiap gerbang menyebut APA YANG KURANG, bukan cuma terkunci — ortu yang hanya melihat 🔒
          tidak tahu ia bisa membantu apa.
        */}
        <div className="card">
          <h2>{dict.tracker.title}</h2>
          <div className="row">
            <span className="nm">{dict.tracker.chapters}</span>
            <span className="amt num">{child.economy.chaptersDone} / {CHAPTER_COUNT}</span>
          </div>
          <div className="row">
            <span className="nm">🏆 {dict.tracker.starsLifetime}</span>
            <span className="amt num">{child.economy.starsLifetime}</span>
          </div>
          <div className="row">
            <span className="nm">💎 {dict.tracker.gems}</span>
            <span className="amt num">{child.gems}</span>
          </div>

          {([
            {
              label: dict.tracker.gateChores,
              open: choresUnlocked(child.economy),
              hint: fill(dict.tracker.starsToGo, {
                n: Math.max(0, CHORES_GATE_LIFETIME_STARS - child.economy.starsLifetime),
              }),
            },
            {
              label: dict.tracker.gateBigPrize,
              open: bigPrizesUnlocked(child.economy),
              hint: fill(dict.tracker.chaptersToGo, { n: BIG_PRIZE_CHAPTER }),
            },
            {
              label: dict.tracker.gateWeekly,
              open: canRedeemGems(child.economy),
              // `undefined` = belum ada materi mingguan, bukan belum selesai (ADR-0004 §A3).
              hint: dict.tracker.weeklyNoData,
            },
          ]).map((gate) => (
            <div className="row" key={gate.label}>
              <span className={`pill ${gate.open ? 'ok' : ''}`}>
                {gate.open ? dict.tracker.open : dict.tracker.locked}
              </span>
              <span className="nm">{gate.label}</span>
              {!gate.open && <span className="sub">{gate.hint}</span>}
            </div>
          ))}

          {/* Benih "conversation starter" yang sudah ada di spec: pantauan yang tidak berubah jadi
              bahan bicara cuma jadi dasbor. */}
          <p className="note" style={{ marginTop: 10 }}>
            {fill(dict.tracker.talkAboutIt, {
              child: child.name, n: child.economy.chaptersDone + 1,
            })}
          </p>
        </div>

        {(child.jobs.length > 0 || child.prizes.length > 0) && (
          <div className="card">
            <h2>{dict.jobs.title} · {dict.jobs.prizes}</h2>
            {child.jobs.map((j) => (
              <div className="row" key={j.id}>
                <span className="nm">{j.title}</span>
                <span className="sub">{dict.jobKind[j.kind]}</span>
                <span className="amt num">
                  {j.reward === 'gems' ? `${j.amount} 💎` : formatRp(j.amount)}
                </span>
                <form action={archiveJob}>
                  <input type="hidden" name="child" value={child.id} />
                  <input type="hidden" name="job" value={j.id} />
                  <button className="btn ghost" type="submit">{dict.jobs.archive}</button>
                </form>
              </div>
            ))}
            {child.prizes.map((pr) => (
              <div className="row" key={pr.id}>
                <span className="nm">🎁 {pr.title}</span>
                <span className="amt num">{pr.gemCost} 💎</span>
                <form action={archivePrize}>
                  <input type="hidden" name="child" value={child.id} />
                  <input type="hidden" name="prize" value={pr.id} />
                  <button className="btn ghost" type="submit">{dict.jobs.archive}</button>
                </form>
              </div>
            ))}
            {/* Tidak ada tombol EDIT, dan itu disengaja: mengubah nominal job yang sudah pernah
                diklaim membuat sejarah berbohong. Job diganti, bukan diubah. */}
            <p className="sub" style={{ marginTop: 8 }}>{dict.jobs.archiveHint}</p>
          </div>
        )}
      </main>
      <Nav active="settings" pending={pending} />
    </>
  );
}
