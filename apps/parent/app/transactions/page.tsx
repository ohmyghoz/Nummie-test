import {
  DATE_RANGES, filterByRange, formatRp, summarise, txnRows,
  type DateRange, type LedgerEntry,
} from '@nummi/core';
import { findChild, getParentData } from '../../lib/data';
import { dict, fill } from '../../lib/copy';
import { Nav, TopBar } from '../../components/ui';

const RANGE_LABEL: Record<DateRange, string> = {
  '7d': dict.txn.range7d, '30d': dict.txn.range30d, '90d': dict.txn.range90d, all: dict.txn.rangeAll,
};

const REASON_LABEL: Record<LedgerEntry['reason'], string> = {
  allowance: dict.sendSource.allowance,
  send_money: dict.parent.send,
  take_money: dict.parent.take,
  reward_money: dict.sendSource.prize,
  sort: dict.sort.title,
  move: dict.move.title,
  cash_out: dict.requestKind.cash_out,
  grow_in: dict.grow.title,
  harvest: dict.grow.harvest,
  give_away: dict.give.giveItAway,
};

export default async function TransactionsPage({
  searchParams,
}: { searchParams: Promise<{ child?: string; range?: string }> }) {
  const sp = await searchParams;
  const data = await getParentData();
  const child = findChild(data, sp.child);
  const pending = data.children.reduce((n, c) => n + c.openRequests.length, 0);

  const range: DateRange = DATE_RANGES.includes(sp.range as DateRange)
    ? (sp.range as DateRange)
    : 'all';

  // Ledger anak yang sedang dilihat, dari database — bukan `SEED_LEDGER` statis. Sebelum ini
  // Dashboard dan Transactions bisa menampilkan dua angka berbeda di sesi yang sama.
  const entries = filterByRange(child.ledger, range, data.today);
  const summary = summarise(entries);
  const rows = txnRows(entries, child.wallets);

  return (
    <>
      <main className="wrap">
        <TopBar parentName={data.parentName} />
        <h1 style={{ fontSize: 19, fontWeight: 800, marginBottom: 10 }}>
          {dict.txn.title} · {child.name}
        </h1>

        {/* Rentangnya datang dari DATE_RANGES di core — satu daftar, supaya tidak terulang
            jendela 7 vs 14 hari yang pernah berbeda antar layar console (K13). */}
        <div className="btnrow" style={{ marginBottom: 12 }}>
          {DATE_RANGES.map((r) => (
            <a
              className={`btn${range === r ? ' primary' : ''}`} key={r}
              href={`/transactions?child=${child.id}&range=${r}`}
            >
              {RANGE_LABEL[r]}
            </a>
          ))}
        </div>

        <div className="card">
          <div className="row">
            <span className="nm">↓ {dict.txn.moneyIn}</span>
            <span className="amt num" style={{ color: 'var(--ok)' }}>{formatRp(summary.moneyIn)}</span>
          </div>
          <div className="row">
            <span className="nm">↑ {dict.txn.moneyOut}</span>
            <span className="amt num" style={{ color: 'var(--risk)' }}>{formatRp(summary.moneyOut)}</span>
          </div>
          {/* Dipisah, TIDAK dijumlahkan ke masuk/keluar — memindahkan uang tidak mengubah total (I1). */}
          <div className="row">
            <span className="nm">⇄ {dict.txn.moved}</span>
            <span className="amt num">{formatRp(summary.moved)}</span>
          </div>
          <div className="row">
            <span className="nm"><b>{dict.txn.net}</b></span>
            <span className="amt num"><b>{formatRp(summary.net)}</b></span>
          </div>
          <p className="sub" style={{ marginTop: 8 }}>{dict.txn.movedHint}</p>
        </div>

        <div className="card">
          <h2>{fill(dict.txn.count, { count: summary.count })}</h2>
          {rows.length === 0 ? (
            <p className="sub">{dict.txn.empty}</p>
          ) : (
            rows.map(({ entry, direction, fromName, toName }) => (
              <div className="row" key={entry.id}>
                <span style={{ width: 18 }}>
                  {direction === 'in' ? '↓' : direction === 'out' ? '↑' : '⇄'}
                </span>
                <span>
                  <span className="nm">{REASON_LABEL[entry.reason]}</span>
                  <span className="sub" style={{ display: 'block' }}>
                    {fromName ?? dict.txn.fromOutside} → {toName ?? dict.txn.fromOutside}
                    {' · '}{entry.createdAt.slice(0, 10)}
                  </span>
                </span>
                <span
                  className="amt num"
                  style={{ color: direction === 'in' ? 'var(--ok)' : direction === 'out' ? 'var(--risk)' : undefined }}
                >
                  {formatRp(entry.amount)}
                </span>
              </div>
            ))
          )}
        </div>
      </main>
      <Nav active="settings" pending={pending} />
    </>
  );
}
