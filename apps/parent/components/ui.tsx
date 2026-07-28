import type { Pocket } from '@nummi/core';
import { dict } from '../lib/copy';

/** Warna kategori & status DIWARISI dari sisi anak dan tidak pernah di-tema (README). */
export const POCKET_COLOR: Record<Pocket, string> = {
  unsorted: 'var(--unsorted)',
  spend: 'var(--spend)',
  save: 'var(--save)',
  give: 'var(--give)',
  grow: 'var(--grow)',
};

export function TopBar({ parentName }: { parentName: string }) {
  return (
    <div className="topbar">
      <div className="coin">n</div>
      <b>{dict.brand.name}</b>
      <span className="who">{parentName}</span>
    </div>
  );
}

export type NavKey = 'dashboard' | 'inbox' | 'send' | 'rules';

export function Nav({ active, pending }: { active: NavKey; pending: number }) {
  const items = [
    { key: 'dashboard', href: '/', icon: '🏠', label: dict.parent.dashboard },
    { key: 'inbox', href: '/requests', icon: '📥', label: dict.parent.inbox, badge: pending },
    { key: 'send', href: '/send', icon: '💸', label: dict.parent.send },
    { key: 'rules', href: '/rules', icon: '⚖️', label: dict.parent.rules },
  ] as const;

  return (
    <nav className="nav">
      {items.map((i) => (
        <a key={i.key} href={i.href} className={active === i.key ? 'on' : undefined}>
          <span className="ic">{i.icon}</span>
          {i.label}
          {'badge' in i && i.badge ? ` (${i.badge})` : ''}
        </a>
      ))}
    </nav>
  );
}
