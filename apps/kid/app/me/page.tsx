import {
  AVATAR_ITEMS, BIG_PRIZE_CHAPTER, CHORES_GATE_LIFETIME_STARS, THEMES,
  bigPrizesUnlocked, canAfford, choresUnlocked, ownsItem,
} from '@nummi/core';
import { getKidData } from '../../lib/data';
import { dict, fill } from '../../lib/copy';
import { Brand, Nav } from '../../components/ui';

const THEME_COLOR: Record<string, string> = {
  violet: '#6c4ce0', sun: '#ffb020', coral: '#ff7a4d', sky: '#2ca6e0', mint: '#2fc078',
};

export default async function MePage() {
  const data = getKidData();
  const e = data.economy;
  // Belum ada persistensi kepemilikan — avatar berbayar tampil belum terbuka sampai S1b.
  const unlocked: string[] = [];

  return (
    <>
      <main className="wrap">
        <Brand childName={data.child.name} />

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div className="coin" style={{ width: 46, height: 46, fontSize: 24, background: 'var(--brand-tint)', color: 'inherit', boxShadow: 'none' }}>
              {data.child.avatar}
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 18 }}>{data.child.name}</div>
              <span className="pill">{data.child.tier}</span>
            </div>
          </div>

          {/* ⭐ DUA angka, dan bedanya dijelaskan — bukan satu angka yang membingungkan.
              X5: tidak ada badge streak di mana pun. Streak dihapus sebagai konsep. */}
          <div className="legend" style={{ marginTop: 14 }}>
            <div className="item">⭐ {dict.me.starsBalance}<span className="amt num">{e.starsBalance}</span></div>
            <div className="item">🏆 {dict.me.starsLifetime}<span className="amt num">{e.starsLifetime}</span></div>
            <div className="item">💎 {dict.me.gems}<span className="amt num">{e.gems}</span></div>
          </div>
        </div>

        {/* Gerbang memakai LIFETIME, jadi belanja avatar tidak pernah menutupnya kembali. */}
        <div className="card">
          <h2>{dict.me.badges}</h2>
          <div className="badgegrid">
            <div className={`badge ${choresUnlocked(e) ? 'on' : ''}`}>
              <span className="ic">🧹</span>
              {choresUnlocked(e)
                ? dict.me.choresOpen
                : fill(dict.me.choresLocked, { stars: CHORES_GATE_LIFETIME_STARS })}
            </div>
            <div className={`badge ${bigPrizesUnlocked(e) ? 'on' : ''}`}>
              <span className="ic">🎁</span>
              {bigPrizesUnlocked(e)
                ? dict.missions.done
                : fill(dict.me.bigPrizesLocked, { n: BIG_PRIZE_CHAPTER })}
            </div>
          </div>
        </div>

        <div className="card">
          <h2>{dict.me.avatarShop}</h2>
          <p className="muted" style={{ marginTop: -6, marginBottom: 10 }}>{dict.me.cosmeticOnly}</p>
          <div className="badgegrid">
            {AVATAR_ITEMS.map((item) => {
              const owns = ownsItem(item, unlocked);
              const afford = canAfford(e, item);
              return (
                <div className={`badge ${owns ? 'on' : ''}`} key={item.key}>
                  <span className="ic">{item.key === 'fox' ? '🦊' : item.key === 'deer' ? '🦌' : item.key === 'cat' ? '🐱' : item.key === 'owl' ? '🦉' : '🐲'}</span>
                  {dict.avatar[item.key]}
                  <span className="pct">
                    {owns ? dict.me.owned : afford ? fill(dict.me.buy, { stars: item.costStars }) : dict.me.cantAfford}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card">
          <h2>{dict.me.theme}</h2>
          <div style={{ display: 'flex', gap: 10 }}>
            {THEMES.map((t) => (
              <span key={t} className="swatch" style={{ background: THEME_COLOR[t] }} />
            ))}
          </div>
          {/* Warna kategori TIDAK ikut tema — ia alat belajar yang dikunci. */}
          <p className="muted" style={{ marginTop: 10 }}>{dict.me.categoryColoursNeverChange}</p>
        </div>
      </main>
      <Nav active="me" />
    </>
  );
}
