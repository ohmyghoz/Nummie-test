/**
 * Layar masuk anak — permukaan pertama yang dilihat anak, dan satu-satunya yang tidak
 * boleh menampilkan angka apa pun.
 *
 * Tiga hal yang disengaja:
 *
 *  1. **Tidak ada daftar anak.** Anak mengetik kode keluarga + PIN, server yang mencari siapa
 *     dia (ADR-0012 §A1). Layar yang menampilkan "Arthur · Sita · Bima" akan membocorkan isi
 *     keluarga ke siapa pun yang menebak kode keluarga.
 *  2. **Satu pesan galat untuk semua sebab.** Server menjawab seragam; layar ini tidak boleh
 *     lebih cerewet daripada server, kalau tidak ia membuka lagi apa yang sudah ditutup.
 *  3. **Nol JavaScript klien**, sama seperti permukaan lain. Form HTML biasa ke route handler,
 *     karena hanya server yang bisa memasang cookie httpOnly.
 */
import { PIN_LENGTH } from '@nummi/core';
import { dict, fill } from '../../lib/copy';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ e?: string; m?: string }>;
}) {
  const sp = await searchParams;
  const lockedMinutes = sp.e === 'locked' ? Number(sp.m) || 15 : 0;

  return (
    <main className="wrap">
      <h1 style={{ fontSize: 28, fontWeight: 800, marginTop: 24, marginBottom: 4 }}>
        {dict.login.title}
      </h1>
      <p className="muted" style={{ marginBottom: 18 }}>{dict.login.subtitle}</p>

      {sp.e && (
        <div className="errbox">
          {lockedMinutes
            ? fill(dict.login.lockedOut, { minutes: lockedMinutes })
            : dict.login.failed}
        </div>
      )}

      <form method="post" action="/api/login">
        <div className="card">
          <label htmlFor="familyCode" style={{ fontWeight: 800, fontSize: 15 }}>{dict.login.familyCode}</label>
          <input
            className="field" id="familyCode" name="familyCode" type="text"
            autoComplete="off" autoCapitalize="characters" required
            style={{ marginTop: 5, textTransform: 'uppercase' }}
          />
          <p className="muted" style={{ marginTop: 6 }}>{dict.login.familyCodeHint}</p>
        </div>

        <div className="card">
          <label htmlFor="pin" style={{ fontWeight: 800, fontSize: 15 }}>{dict.login.pin}</label>
          {/* inputMode numeric memunculkan papan angka di HP — anak tidak perlu mencari
              angka di keyboard huruf. type tetap password: PIN tidak terbaca dari samping. */}
          <input
            className="field" id="pin" name="pin" type="password"
            inputMode="numeric" pattern="[0-9]*" maxLength={PIN_LENGTH}
            autoComplete="off" required
            style={{ marginTop: 5, letterSpacing: '.3em' }}
          />
          <p className="muted" style={{ marginTop: 6 }}>
            {fill(dict.login.pinHint, { length: PIN_LENGTH })}
          </p>
        </div>

        <button className="cta" type="submit" style={{ width: '100%', textAlign: 'center' }}>
          {dict.login.submit}
        </button>
      </form>

      <p className="muted" style={{ marginTop: 18, fontSize: 13 }}>{dict.login.askGrownUp}</p>
    </main>
  );
}
