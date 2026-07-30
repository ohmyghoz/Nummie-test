/**
 * Masuk sebagai ortu — **kode sekali pakai lewat email, tanpa password** (ADR-0022).
 *
 * Dua langkah di SATU halaman: email → kode. Bukan dua rute, supaya kembali dari langkah kedua
 * tidak membuang apa yang sudah diketik, dan supaya kode diketik ke tab yang sama — lihat catatan
 * "kode, bukan magic link" di `lib/supabase.ts`.
 *
 * Nol JavaScript klien, sama seperti permukaan lain: form HTML ke route handler, karena hanya
 * server yang bisa memasang cookie httpOnly.
 *
 * Satu pesan seragam untuk semua sebab. Email yang tidak terdaftar dan email yang terdaftar harus
 * tidak bisa dibedakan — kalau tidak, layar ini jadi alat memeriksa siapa yang ikut uji ini.
 */
import { dict, fill } from '../../lib/copy';

export default async function ParentLoginPage({
  searchParams,
}: { searchParams: Promise<{ e?: string; sent?: string; email?: string }> }) {
  const sp = await searchParams;
  const sent = sp.sent === '1' && Boolean(sp.email);

  const error = sp.e === 'tooMany'
    ? dict.parentAuth.tooMany
    : sp.e === 'badCode'
      ? dict.parentAuth.badCode
      : sp.e
        ? dict.parentAuth.failed
        : undefined;

  return (
    <main className="wrap">
      <h1 style={{ fontSize: 24, fontWeight: 800, marginTop: 22, marginBottom: 4 }}>
        {dict.parentAuth.title}
      </h1>
      <p className="sub" style={{ marginBottom: 16 }}>
        {sent ? fill(dict.parentAuth.codeSent, { email: sp.email ?? '' }) : dict.parentAuth.subtitle}
      </p>

      {error && <div className="errbox">{error}</div>}

      {sent ? (
        <>
          <form method="post" action="/api/verify">
            <input type="hidden" name="email" value={sp.email} />
            <div className="card">
              <label className="sub" htmlFor="code">{dict.parentAuth.code}</label>
              <input
                className="field" id="code" name="code" type="text"
                inputMode="numeric" autoComplete="one-time-code" autoFocus required
                style={{ marginTop: 5, letterSpacing: '.28em', fontSize: 19 }}
              />
              <p className="sub" style={{ marginTop: 6 }}>{dict.parentAuth.codeHint}</p>
            </div>
            <button className="btn primary" type="submit" style={{ width: '100%' }}>
              {dict.parentAuth.submitCode}
            </button>
          </form>

          {/* Kirim ulang = mulai dari awal. Satu jalur, bukan dua yang bisa menyimpang. */}
          <form method="post" action="/api/login" style={{ marginTop: 10 }}>
            <input type="hidden" name="email" value={sp.email} />
            <button
              type="submit"
              style={{
                background: 'none', border: 0, padding: 0, cursor: 'pointer', font: 'inherit',
                fontSize: 13, fontWeight: 700, color: 'var(--ink-3)', textDecoration: 'underline',
              }}
            >
              {dict.parentAuth.resend}
            </button>
          </form>
        </>
      ) : (
        <form method="post" action="/api/login">
          <div className="card">
            <label className="sub" htmlFor="email">{dict.parentAuth.email}</label>
            <input
              className="field" id="email" name="email" type="email"
              autoComplete="email" autoFocus required style={{ marginTop: 5 }}
            />
            {/* Dikatakan di depan: ortu yang mengharap kolom password tidak perlu menebak-nebak. */}
            <p className="sub" style={{ marginTop: 6 }}>{dict.parentAuth.noPassword}</p>
          </div>
          <button className="btn primary" type="submit" style={{ width: '100%' }}>
            {dict.parentAuth.submit}
          </button>
        </form>
      )}
    </main>
  );
}
