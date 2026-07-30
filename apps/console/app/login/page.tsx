/**
 * Layar masuk console. Bahasa Indonesia seperti seluruh console — permukaan operator,
 * dikecualikan dari D1/D2.
 *
 * Nol JavaScript klien: `<form method="post">` biasa, sama seperti login anak & ortu.
 */
export const dynamic = 'force-dynamic';

const ERRORS: Record<string, string> = {
  failed: 'Password salah.',
  unset: 'CONSOLE_PASSWORD belum diset di server. Console tidak bisa dibuka sampai itu beres.',
};

export default async function ConsoleLoginPage({
  searchParams,
}: { searchParams: Promise<{ e?: string; m?: string }> }) {
  const sp = await searchParams;
  const locked = sp.e === 'locked';
  const message = locked
    ? `Terlalu banyak percobaan. Coba lagi dalam ${sp.m ?? 15} menit.`
    : sp.e
      ? ERRORS[sp.e] ?? ERRORS.failed
      : undefined;

  return (
    <main className="shell" style={{ maxWidth: 380, marginTop: '12vh' }}>
      <div className="brandbox">
        <span className="coin">n</span>
        <div>
          <strong>Nummi Console</strong>
          <div className="railnote">Alat operator · lintas keluarga</div>
        </div>
      </div>

      <div className="card">
        <form method="post" action="/api/login">
          <label className="railnote" htmlFor="password">Password operator</label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            autoFocus
            style={{
              width: '100%', marginTop: 6, padding: '10px 12px', fontSize: 15,
              border: '1px solid var(--line, #e6e2f0)', borderRadius: 10,
              fontFamily: 'var(--ui)',
            }}
          />
          <button
            type="submit"
            style={{
              width: '100%', marginTop: 12, padding: '11px 16px', fontSize: 15, fontWeight: 700,
              color: '#fff', background: 'var(--brand, #6c4ce0)', border: 0, borderRadius: 999,
              cursor: 'pointer', fontFamily: 'var(--ui)',
            }}
          >
            Masuk
          </button>
        </form>

        {message && (
          <p className="railnote" style={{ marginTop: 12, color: '#b5473c', fontWeight: 700 }}>
            {message}
          </p>
        )}
      </div>

      <p className="railnote" style={{ marginTop: 14 }}>
        Console membaca data seluruh keluarga. Kalau kamu tidak sedang memeriksa invarian atau
        menyelidiki laporan, tutup halaman ini.
      </p>
    </main>
  );
}
