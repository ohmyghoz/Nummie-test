import {
  CHAPTERS, CHAPTER_COUNT, STARS_PER_LESSON,
  canRedeemGems, chapterStatus, lessonMix,
} from '@nummi/core';
import { getKidData } from '../../lib/data';
import { dict, fill } from '../../lib/copy';
import { Brand, Nav } from '../../components/ui';

export default async function MissionsPage() {
  const data = getKidData();
  const mix = lessonMix(data.child.tier);

  return (
    <>
      <main className="wrap">
        <Brand childName={data.child.name} />
        <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>{dict.missions.title}</h1>
        <p className="muted" style={{ marginBottom: 14 }}>
          {fill(dict.missions.chapterOf, { n: data.economy.chaptersDone + 1, total: CHAPTER_COUNT })}
          {' · '}
          {fill(dict.missions.starsEach, { stars: STARS_PER_LESSON })}
        </p>

        {/* Gerbang mingguan ada di PENUKARAN, bukan perolehan — 💎 selalu boleh dikumpulkan. */}
        {!canRedeemGems(data.economy) && (
          <div className="banner">🎯 {dict.missions.weeklyGate}</div>
        )}

        <div className="grid2">
          {CHAPTERS.map((key, i) => {
            const status = chapterStatus(i, data.economy.chaptersDone);
            const locked = status === 'locked';
            return (
              <div className="card" key={key} style={locked ? { opacity: .55 } : undefined}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                  <span style={{ fontWeight: 800 }}>
                    {status === 'done' ? '✅' : status === 'current' ? '👉' : '🔒'}
                  </span>
                  <span style={{ fontWeight: 800 }}>{dict.chapter[key]}</span>
                </div>
                <p className="muted" style={{ marginTop: 4 }}>
                  {fill(dict.missions.chapterOf, { n: i + 1, total: CHAPTER_COUNT })}
                  {status === 'current' && ` · ${dict.missions.current}`}
                  {status === 'done' && ` · ${dict.missions.done}`}
                </p>

                {locked ? (
                  <p className="muted" style={{ marginTop: 8 }}>{dict.missions.chapterLocked}</p>
                ) : (
                  <>
                    <div className="slot" style={{ marginTop: 10 }}>
                      <span style={{ fontSize: 18 }}>📖</span>
                      <div>
                        <div className="nm">{dict.missions.learn}</div>
                        <div className="pct">{mix.learn}×</div>
                      </div>
                    </div>
                    {/* Practice terkunci sampai Learn pasangannya selesai — membalik urutannya
                        membuat latihan jadi tebak-tebakan. Chapter yang sudah 'done' berarti
                        Learn-nya pasti selesai. */}
                    <div className="slot">
                      <span style={{ fontSize: 18 }}>{status === 'done' ? '🎮' : '🔒'}</span>
                      <div>
                        <div className="nm">{dict.missions.practice}</div>
                        <div className="pct">
                          {status === 'done' ? `${mix.practice}×` : dict.missions.practiceLocked}
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </main>
      <Nav active="missions" />
    </>
  );
}
