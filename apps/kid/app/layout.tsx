import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import { dict, lang } from '../lib/copy';
import './globals.css';

/**
 * `globals.css` sudah menyebut 'Plus Jakarta Sans' sejak awal, tapi tidak ada yang pernah
 * memuatnya — jadi setiap permukaan diam-diam tampil dengan `system-ui`. Di tab browser itu nyaris
 * tak terlihat; di app yang dipasang ke Home Screen, tampil seperti default sistem adalah masalah
 * tersendiri. `next/font` mengunduhnya **saat build dan meng-host-nya sendiri**: nol permintaan
 * pihak ketiga saat runtime, jadi ia tidak menambah jejak pelacakan di app anak.
 */
const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  variable: '--font-ui',
  display: 'swap',
});

export const metadata: Metadata = {
  title: dict.brand.kidApp,
  description: dict.brand.tagline,
  robots: { index: false, follow: false },
  icons: {
    icon: '/favicon-32.png',
    apple: '/apple-touch-icon.png',
  },
  // iOS belum sepenuhnya membaca manifest untuk add-to-homescreen; tanpa blok ini app terbuka
  // di Safari ber-address-bar, bukan sebagai app.
  appleWebApp: {
    capable: true,
    title: dict.brand.kidAppShort,
    statusBarStyle: 'default',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#fff9f2',
  /**
   * **Jangan hapus.** `globals.css` memberi nav bawah padding
   * `calc(8px + env(safe-area-inset-bottom))`, dan tanpa `viewportFit: 'cover'` variabel itu
   * bernilai **0** di iOS — jadi nav duduk persis di bawah home indicator begitu app dipasang ke
   * Home Screen. Di tab Safari biasa tidak kelihatan, hanya di mode standalone: bug yang cuma
   * muncul setelah seseorang benar-benar memasang app-nya.
   */
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang={lang} className={jakarta.variable}>
      <body>{children}</body>
    </html>
  );
}
