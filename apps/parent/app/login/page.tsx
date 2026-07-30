/**
 * Masuk sebagai ortu — Supabase Auth biasa (email + password), ADR-0012.
 *
 * Nol JavaScript klien, sama seperti permukaan lain: form HTML ke route handler, karena hanya
 * server yang bisa memasang cookie httpOnly.
 *
 * Satu pesan galat untuk semua sebab. Email yang tidak terdaftar dan password yang salah harus
 * tidak bisa dibedakan — kalau tidak, layar ini berubah jadi alat memeriksa siapa yang punya akun.
 */
import { dict } from '../../lib/copy';

export default async function ParentLoginPage({
  searchParams,
}: { searchParams: Promise<{ e?: string }> }) {
  const sp = await searchParams;

  return (
    <main className="wrap">
      <h1 style={{ fontSize: 24, fontWeight: 800, marginTop: 22, marginBottom: 4 }}>
        {dict.parentAuth.title}
      </h1>
      <p className="sub" style={{ marginBottom: 16 }}>{dict.parentAuth.subtitle}</p>

      {sp.e && <div className="errbox">{dict.parentAuth.failed}</div>}

      <form method="post" action="/api/login">
        <div className="card">
          <label className="sub" htmlFor="email">{dict.parentAuth.email}</label>
          <input
            className="field" id="email" name="email" type="email"
            autoComplete="email" required style={{ marginTop: 5 }}
          />
        </div>

        <div className="card">
          <label className="sub" htmlFor="password">{dict.parentAuth.password}</label>
          <input
            className="field" id="password" name="password" type="password"
            autoComplete="current-password" required style={{ marginTop: 5 }}
          />
        </div>

        <button className="btn primary" type="submit" style={{ width: '100%' }}>
          {dict.parentAuth.submit}
        </button>
      </form>
    </main>
  );
}
