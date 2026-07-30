import { formatRp, fulfilmentPath } from '@nummi/core';
import {
  getConsoleData,
  POCKETS,
  type ChildView,
  type ConsoleData,
  type LedgerEntry,
  type MoneyRequest,
  type Pocket,
  type WalletBalance,
} from '../lib/data';

/* ── Label operator (bahasa Indonesia; console dikecualikan dari D1/D2) ──────────
   Nama kategori (Spend/Save/Give/Grow/Unsorted) SENGAJA tidak diterjemahkan: itu kunci
   kantong kanonik, bukan copy produk — menerjemahkannya di sini akan memutuskan D2 diam-diam. */
const POCKET_META: Record<Pocket, { label: string; color: string }> = {
  unsorted: { label: 'Unsorted', color: 'var(--unsorted)' },
  spend: { label: 'Spend', color: 'var(--spend)' },
  save: { label: 'Save', color: 'var(--save)' },
  give: { label: 'Give', color: 'var(--give)' },
  grow: { label: 'Grow', color: 'var(--grow)' },
};

const REASON_ID: Record<LedgerEntry['reason'], string> = {
  allowance: 'Uang saku', send_money: 'Kirim uang', take_money: 'Ambil uang',
  reward_money: 'Hadiah uang', sort: 'Sortir', move: 'Pindah', cash_out: 'Cash out',
  grow_in: 'Masuk Grow', harvest: 'Harvest', give_away: 'Beri',
};

const KIND_ID: Record<MoneyRequest['kind'], string> = {
  cash_out: 'Cash out', give_away: 'Beri', prize: 'Hadiah',
  mission_claim: 'Klaim misi', grow_in: 'Masuk Grow', harvest: 'Harvest',
};

const STATUS_ID: Record<MoneyRequest['status'], { label: string; cls: string }> = {
  needs_ok: { label: 'Perlu persetujuan', cls: 'warn' },
  approved: { label: 'Disetujui', cls: 'ok' },
  declined: { label: 'Ditolak', cls: 'neutral' },
  talk_about_it: { label: 'Dibicarakan dulu', cls: 'neutral' },
};

const FULFILMENT_ID: Record<MoneyRequest['fulfilment'], string> = {
  not_applicable: '—', todo: 'To do', done: 'Done',
};

const TIER_ID: Record<ChildView['tier'], string> = {
  little: 'Little', middle: 'Middle', teen: 'Teen',
};

function Rail() {
  return (
    <aside className="rail">
      <div className="brandbox">
        <div className="coin">n</div>
        <div>
          <b>Nummi</b>
          <span>Console</span>
        </div>
      </div>
      <p className="railnote">
        Permukaan <b>operator</b>, lintas-keluarga. Bukan produk — alat untuk melihat apakah
        model datamu benar sebelum satu komponen anak atau ortu ditulis.
      </p>
      <p className="railnote" style={{ marginTop: 12 }}>
        Fase ini <b>baca-saja</b>. Sumber angka: <b>seed kanonik</b> <span className="mono">@nummi/core</span>.
      </p>
      <span className="railtag">C-1 · baca-saja</span>
    </aside>
  );
}

function Strip({ totals }: { totals: ConsoleData['totals'] }) {
  return (
    <div className="strip">
      <div className="stat"><div className="k">Keluarga</div><div className="v num">{totals.families}</div></div>
      <div className="stat"><div className="k">Anak</div><div className="v num">{totals.children}</div></div>
      <div className="stat"><div className="k">Request terbuka</div><div className="v num">{totals.openRequests}</div></div>
      <div className={`stat${totals.promiseDebt > 0 ? ' hot' : ''}`}>
        <div className="k">Utang janji</div><div className="v num">{totals.promiseDebt}</div>
      </div>
      <div className={`stat${totals.p0Incidents > 0 ? ' hot' : ''}`}>
        <div className="k">Insiden P0</div><div className="v num">{totals.p0Incidents}</div>
      </div>
    </div>
  );
}

function PocketRibbon({ pockets, total }: { pockets: Record<Pocket, number>; total: number }) {
  return (
    <>
      <div className="pocketbar">
        {POCKETS.map((p) => {
          const pct = total > 0 ? (pockets[p] / total) * 100 : 0;
          if (pct <= 0) return null;
          return <span key={p} style={{ width: `${pct}%`, background: POCKET_META[p].color }} />;
        })}
      </div>
      <div className="pocketlegend">
        {POCKETS.map((p) => (
          <div className="item" key={p}>
            <span className="dot" style={{ background: POCKET_META[p].color }} />
            {POCKET_META[p].label}
            <span className="amt num">{formatRp(pockets[p])}</span>
          </div>
        ))}
      </div>
    </>
  );
}

function WalletTable({ rows }: { rows: WalletBalance[] }) {
  return (
    <div className="card">
      <h2>Saldo wallet <span className="sub">diturunkan dari ledger — I2: satu rupiah, satu wallet</span></h2>
      <table>
        <thead>
          <tr><th>Wallet</th><th>Kantong</th><th>Jenis</th><th className="r">Saldo</th></tr>
        </thead>
        <tbody>
          {rows.map(({ wallet, balance }) => (
            <tr key={wallet.id}>
              <td>{wallet.name}</td>
              <td><span className={`pill cat-${wallet.category}`}>{POCKET_META[wallet.category].label}</span></td>
              <td className="mono">{wallet.kind}</td>
              <td className="r num">{formatRp(balance)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function LedgerTable({ entries, nameOf }: { entries: LedgerEntry[]; nameOf: (id: string | null) => string }) {
  return (
    <div className="card">
      <h2>Ledger mentah <span className="sub">append-only (ADR-0014) — {entries.length} baris</span></h2>
      <table>
        <thead>
          <tr><th>#</th><th>Dari</th><th>Ke</th><th>Alasan</th><th className="r">Jumlah</th></tr>
        </thead>
        <tbody>
          {entries.map((e) => (
            <tr key={e.id}>
              <td className="mono">{e.id}</td>
              <td>{nameOf(e.fromWalletId)}</td>
              <td>{nameOf(e.toWalletId)}</td>
              <td><span className="pill neutral">{REASON_ID[e.reason]}</span></td>
              <td className="r num">{formatRp(e.amount)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function RequestTable({ requests, debtIds, nameOf }: {
  requests: MoneyRequest[]; debtIds: Set<string>; nameOf: (id: string | null) => string;
}) {
  return (
    <div className="card">
      <h2>
        Antrean request <span className="sub">utang janji = disetujui tapi belum ditandai Done (ADR-0002)</span>
      </h2>
      {requests.length === 0 ? (
        <div className="emptyrow">Tidak ada request.</div>
      ) : (
        <table>
          <thead>
            <tr><th>Jenis</th><th>Jalur</th><th>Sumber</th><th>Alasan</th><th>Status</th><th>Penyelesaian</th><th className="r">Jumlah</th></tr>
          </thead>
          <tbody>
            {requests.map((r) => {
              const st = STATUS_ID[r.status];
              const isDebt = debtIds.has(r.id);
              // ADR-0002 terlihat di data nyata: jalur instan tidak pernah menyisakan pekerjaan.
              const instant = fulfilmentPath(r.kind) === 'instant';
              return (
                <tr key={r.id}>
                  <td>{KIND_ID[r.kind]}</td>
                  <td>
                    <span className={`pill ${instant ? 'ok' : 'neutral'}`}>
                      {instant ? 'instan' : 'to-do'}
                    </span>
                  </td>
                  <td>{r.sourceWalletId ? nameOf(r.sourceWalletId) : '—'}</td>
                  <td>{r.reason ?? <span style={{ color: 'var(--ink-4)' }}>—</span>}</td>
                  <td><span className={`pill ${st.cls}`}>{st.label}</span></td>
                  <td>
                    {FULFILMENT_ID[r.fulfilment]}
                    {isDebt && <span className="pill risk" style={{ marginLeft: 8 }}>utang janji</span>}
                  </td>
                  <td className="r num">{formatRp(r.amount)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}

function InvariantPanel({ inv }: { inv: ChildView['invariant'] }) {
  const eq = POCKETS.map((p) => formatRp(inv.pockets[p])).join(' + ');
  return (
    <div className="card">
      <h2>Pemeriksa invarian <span className="sub">I1 · kesehatan ledger · rekonsiliasi</span></h2>
      <div className="body">
        <div className={`verdict ${inv.i1Holds && inv.health.length === 0 ? 'pass' : 'fail'}`}>
          <span className="big">{inv.i1Holds && inv.health.length === 0 ? '✓ SEHAT' : '✕ INSIDEN P0'}</span>
          <div>
            <div>Unsorted + Spend + Save + Give + Grow = Total</div>
            <div className="eq">{eq} = {formatRp(inv.total)}</div>
          </div>
        </div>
        <div style={{ marginTop: 12 }}>
          <div className="checkline">
            <span className={`mk ${inv.i1Holds ? 'ok' : 'bad'}`}>{inv.i1Holds ? '✓' : '✕'}</span>
            I1 — jumlah kantong ({formatRp(inv.pocketSum)}) sama dengan total ({formatRp(inv.total)})
          </div>
          <div className="checkline">
            <span className={`mk ${inv.matchesDbView ? 'ok' : 'bad'}`}>{inv.matchesDbView ? '✓' : '✕'}</span>
            Core cocok dengan view database — {formatRp(inv.dbViewTotal)}
          </div>
          <div className="checkline">
            <span className={`mk ${inv.health.length === 0 ? 'ok' : 'bad'}`}>{inv.health.length === 0 ? '✓' : '✕'}</span>
            Kesehatan ledger — {inv.health.length === 0 ? 'tidak ada temuan' : `${inv.health.length} temuan (P0)`}
          </div>
          {inv.health.map((h, i) => (
            <div className="checkline" key={i}>
              <span className="mk bad">•</span><span className="mono">{h.kind}</span> — {h.detail}
            </div>
          ))}
        </div>
        <p className="foot">
          Baris ledger yang membuat I1 tidak nol adalah insiden P0 (backlog §R). Karena setiap perpindahan
          internal satu baris ber-<span className="mono">from</span>+<span className="mono">to</span>, I1 benar
          secara konstruksi — yang diperiksa di sini adalah baris tak-sah yang bisa merusaknya.
        </p>
      </div>
    </div>
  );
}

function ChildSection({ child }: { child: ChildView }) {
  const walletName = new Map(child.walletBalances.map(({ wallet }) => [wallet.id, wallet.name]));
  const nameOf = (id: string | null) => (id === null ? '＋ luar' : walletName.get(id) ?? id);
  const debtIds = new Set(child.promiseDebt.map((r) => r.id));

  return (
    <section>
      <div className="card">
        <div className="childhead">
          <div className="av">{child.avatar}</div>
          <div>
            <div className="nm">{child.name} <span className="tier">{TIER_ID[child.tier]}</span></div>
          </div>
          <div className="tot">
            <div className="k">Total</div>
            <div className="v num">{formatRp(child.total)}</div>
          </div>
        </div>
        <PocketRibbon pockets={child.pockets} total={child.total} />
      </div>

      <WalletTable rows={child.walletBalances} />
      <LedgerTable entries={child.ledger} nameOf={nameOf} />
      <RequestTable requests={child.requests} debtIds={debtIds} nameOf={nameOf} />
      <InvariantPanel inv={child.invariant} />
    </section>
  );
}

export default async function ConsolePage() {
  const data = await getConsoleData();
  return (
    <div className="shell">
      <Rail />
      <main className="main">
        <div className="pagehead">
          <h1>Ikhtisar keluarga</h1>
          <p>Metrik utara: keluarga aktif mingguan dengan siklus uang lengkap — bukan DAU.</p>
        </div>
        <Strip totals={data.totals} />
        {data.families.map((fam) => (
          <div key={fam.id}>
            {fam.children.map((child) => <ChildSection key={child.id} child={child} />)}
          </div>
        ))}
      </main>
    </div>
  );
}
