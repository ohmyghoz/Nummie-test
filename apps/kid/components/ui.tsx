/**
 * Potongan UI bersama app anak.
 *
 * Aturan yang berlaku di seluruh berkas ini:
 *  - nominal SELALU lewat `formatRp()` (X1) — tidak pernah `Rp 10,000`
 *  - teks SELALU dari `copy/` — tidak ada string yang di-hardcode
 *  - nama kategori lewat lookup `[tier][kategori]` (D2 masih terbuka)
 *  - NOL gembok Pro & NOL slot iklan (I3, I4)
 */
import { formatRp, type Pocket, type Tier } from '@nummi/core';
import { categoryLabel, dict } from '../lib/copy';
import { POCKETS } from '../lib/data';

export const POCKET_COLOR: Record<Pocket, string> = {
  unsorted: 'var(--unsorted)',
  spend: 'var(--spend)',
  save: 'var(--save)',
  give: 'var(--give)',
  grow: 'var(--grow)',
};

export function Brand({ childName }: { childName: string }) {
  return (
    <div className="brandbar">
      {/* X6: app anak dulu satu-satunya permukaan tanpa brand sama sekali. */}
      <div className="coin">n</div>
      <div className="wordmark">{dict.brand.name}</div>
      <div className="hi">{dict.home.greeting.replace('{child}', childName)}</div>
    </div>
  );
}

export function TotalRing({
  total, pockets, tier,
}: { total: number; pockets: Record<Pocket, number>; tier: Tier }) {
  // Little melebur Grow ke Save — sudah ditangani pocketBalancesForTier, jadi di sini
  // cukup sembunyikan kantong yang memang nol supaya legenda tidak berisik.
  const shown = POCKETS.filter((p) => pockets[p] > 0);
  return (
    <div className="card">
      <div className="totalbox">
        <div className="k">{dict.home.totalLabel}</div>
        <div className="v num">{formatRp(total)}</div>
      </div>
      <div className="ring">
        {shown.map((p) => (
          <span key={p} style={{ width: `${(pockets[p] / total) * 100}%`, background: POCKET_COLOR[p] }} />
        ))}
      </div>
      <div className="legend">
        {shown.map((p) => (
          <div className="item" key={p}>
            <span className="dot" style={{ background: POCKET_COLOR[p] }} />
            {categoryLabel(tier, p)}
            <span className="amt num">{formatRp(pockets[p])}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Nav bawah. Missions & Me belum ada di irisan ini — sengaja TIDAK dirender sebagai
 *  tombol mati, karena tombol yang tidak melakukan apa-apa mengajari anak hal yang salah. */
export function Nav({ active }: { active: 'home' | 'wallets' | 'sort' | 'requests' }) {
  const items = [
    { key: 'home', href: '/', icon: '🏠', label: dict.nav.home },
    { key: 'wallets', href: '/wallets', icon: '👛', label: dict.nav.wallets },
    { key: 'sort', href: '/sort', icon: '✨', label: dict.home.sortItNow },
    { key: 'requests', href: '/requests', icon: '⏳', label: dict.requests.title },
  ] as const;
  return (
    <nav className="nav">
      {items.map((i) => (
        <a key={i.key} href={i.href} className={active === i.key ? 'on' : undefined}>
          <span className="ic">{i.icon}</span>
          {i.label}
        </a>
      ))}
    </nav>
  );
}
