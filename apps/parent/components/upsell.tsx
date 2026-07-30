/**
 * Upsell — **hanya hidup di app ortu** (C1). Tidak ada padanannya di app anak, dan itu bukan
 * kekurangan: produk ini mengajari anak menahan impuls konsumtif, jadi memakai impuls anak untuk
 * berjualan akan membunuh premisnya sendiri.
 *
 * Dua aturan yang dijaga komponen ini:
 *
 *  1. **Selalu menyebut apa yang DIBUKA, bukan apa yang terkunci** (§8: "selalu tunjukkan value,
 *     jangan gagal diam-diam"). Karena itu setiap pesan menyebut juga apa yang tetap gratis —
 *     "Mode Ketat bagian dari Pro, aturan proteksinya tetap gratis."
 *
 *  2. **Tidak pernah tampil untuk pengguna sekolah** (I5). Sekolah diprovisikan sepenuhnya di luar
 *     app store (ADR-0010), jadi tombol beli di sana menyalahi jalur pengadaannya. Yang memutuskan
 *     `canShowUpgrade()` di core, bukan percabangan di layar.
 */
import { ONE_TIME_PRICE_RP, canShowUpgrade, formatRp, type Plan } from '@nummi/core';
import { dict, fill } from '../lib/copy';

export type UpsellReason =
  | 'maxChildren' | 'maxActiveJobs' | 'maxPrizes' | 'maxDreams'
  | 'strictFlexibleDial' | 'autoSplitEditor' | 'grow' | 'report';

/** Batas berupa angka perlu menyebut angkanya — "Free menjalankan 3 kerjaan", bukan "ada batas". */
const WITH_LIMIT: Partial<Record<UpsellReason, number>> = {
  maxActiveJobs: 3,
  maxPrizes: 1,
};

export function Upsell({
  reason, plan, isSchool,
}: { reason: UpsellReason; plan: Plan; isSchool: boolean }) {
  if (!canShowUpgrade(plan, isSchool ? 'school' : undefined)) return null;

  const n = WITH_LIMIT[reason];
  const perMonth = Math.round(ONE_TIME_PRICE_RP / 108 / 100) * 100;   // ~9 tahun, dibulatkan

  return (
    <div className="card" style={{ borderColor: 'var(--brand)' }}>
      <h2>{dict.upsell.title}</h2>
      <p className="note">{n === undefined ? dict.upsell[reason] : fill(dict.upsell[reason], { n })}</p>

      <div className="row" style={{ marginTop: 10 }}>
        <span className="nm">{dict.upsell.framing}</span>
        <span className="amt num">{formatRp(ONE_TIME_PRICE_RP)}</span>
      </div>
      {/* Kalimat yang tidak bisa diucapkan langganan (ADR-0018). */}
      <p className="sub">{fill(dict.upsell.perMonth, { amount: formatRp(perMonth) })}</p>

      <div className="btnrow">
        {/* Pembelian sungguhan lewat Apple IAP, dan itu butuh app native (D4 belum dijawab).
            Tombolnya sengaja belum menjanjikan apa pun — lebih baik jujur daripada checkout palsu. */}
        <span className="btn primary" aria-disabled="true">{dict.upsell.cta}</span>
      </div>
    </div>
  );
}
