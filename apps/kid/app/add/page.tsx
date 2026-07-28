import { canOpenSort, formatRp } from '@nummi/core';
import { getKidData } from '../../lib/data';
import { dict, fill } from '../../lib/copy';
import { Brand, Nav } from '../../components/ui';

/**
 * Hub aksi — tombol tengah nav (handoff: "hub aksi di tombol tengah").
 *
 * Setiap aksi hanya muncul kalau memang bisa dilakukan sekarang. Yang tidak bisa dilakukan
 * TIDAK dirender sebagai tombol mati: itu aturan yang sama dengan I3 (fitur non-aktif =
 * tidak tampil, bukan tampil-terkunci), dan alasannya sama — tombol mati mengajari anak
 * bahwa app-nya bohong.
 */
export default async function AddPage() {
  const data = getKidData();

  const actions = [
    canOpenSort(data.unsortedBalance) && {
      href: '/sort', icon: '✨', title: dict.sort.title,
      sub: fill(dict.home.justArrived, { amount: formatRp(data.unsortedBalance) }),
    },
    { href: '/move', icon: '🔀', title: dict.move.title, sub: dict.wallets.title },
    data.giveBalance > 0 && {
      href: '/give', icon: '🎁', title: dict.give.giveItAway,
      sub: fill(dict.give.available, { amount: formatRp(data.giveBalance) }),
    },
    { href: '/grow', icon: '🌱', title: dict.grow.title, sub: dict.grow.onlyWayOut },
    data.requests.length > 0 && {
      href: '/requests', icon: '⏳', title: dict.requests.title,
      sub: fill(dict.home.requestsWaiting, { count: data.openRequests.length }),
    },
    data.givingStories.length > 0 && {
      href: '/giving', icon: '💌', title: dict.give.whereMyGivingWent, sub: '',
    },
  ].filter(Boolean) as { href: string; icon: string; title: string; sub: string }[];

  return (
    <>
      <main className="wrap">
        <Brand childName={data.child.name} />
        <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 14 }}>{dict.nav.add}</h1>

        <div className="grid2">
          {actions.map((a) => (
            <a className="slot" key={a.href} href={a.href}>
              <span style={{ fontSize: 22 }}>{a.icon}</span>
              <div>
                <div className="nm">{a.title}</div>
                {a.sub && <div className="pct">{a.sub}</div>}
              </div>
            </a>
          ))}
        </div>
      </main>
      <Nav active="add" />
    </>
  );
}
