/**
 * Langkah 1 dari 2 — kirim kode masuk ke email ortu (ADR-0022).
 *
 * Berkas ini dulu melakukan sign-in password (`grant_type=password`). Diganti bukan karena
 * password tidak aman, melainkan karena **tidak ada halaman daftar dan tidak ada reset password**:
 * ortu yang lupa passwordnya jadi tiket dukungan manual untuk founder yang bekerja kantoran.
 *
 * `create_user: false` adalah **gerbang uji tertutupnya**, dan itu sebabnya tidak perlu ada halaman
 * daftar sama sekali: hanya email yang akunnya sudah dibuat lebih dulu yang bisa menerima kode.
 *
 * Jawaban seragam apa pun hasilnya — disengaja. Kalau layar ini membedakan "email tidak terdaftar"
 * dari "kode terkirim", ia berubah jadi alat memeriksa siapa saja yang ikut uji ini.
 */
import { NextResponse } from 'next/server';
import { sendOtpEndpoint } from '../../../lib/supabase';

export async function POST(req: Request) {
  const form = await req.formData();
  const email = String(form.get('email') ?? '').trim().toLowerCase();

  const back = new URL('/login', req.url);

  if (!email || !email.includes('@')) {
    back.searchParams.set('e', 'failed');
    return NextResponse.redirect(back, { status: 303 });
  }

  const { url, key } = sendOtpEndpoint();

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { apikey: key, 'content-type': 'application/json' },
      // Tidak ada pendaftaran diam-diam. Uji tertutup ditegakkan di sini, bukan dengan
      // menyembunyikan tautan daftar.
      body: JSON.stringify({ email, create_user: false }),
    });

    // 429 dibedakan karena ia satu-satunya kegagalan yang bisa ortu perbaiki sendiri — dengan
    // menunggu. Menyamarkannya sebagai "kode terkirim" akan membuat ortu menunggu email yang
    // tidak akan pernah datang.
    if (res.status === 429) {
      back.searchParams.set('e', 'tooMany');
      return NextResponse.redirect(back, { status: 303 });
    }
  } catch {
    // Jaringan mati pun tetap tampil sebagai "kode terkirim" — lihat catatan seragam di atas.
  }

  back.searchParams.set('sent', '1');
  back.searchParams.set('email', email);
  return NextResponse.redirect(back, { status: 303 });
}
