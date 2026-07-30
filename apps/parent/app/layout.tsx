import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import { dict, lang } from '../lib/copy';
import './globals.css';

// Lihat catatan di apps/kid/app/layout.tsx — font ini disebut CSS sejak awal tapi tak pernah dimuat.
const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  variable: '--font-ui',
  display: 'swap',
});

export const metadata: Metadata = {
  title: dict.brand.parentApp,
  description: dict.brand.tagline,
  robots: { index: false, follow: false },
  icons: {
    icon: '/favicon-32.png',
    apple: '/apple-touch-icon.png',
  },
  appleWebApp: {
    capable: true,
    title: dict.brand.parentAppShort,
    statusBarStyle: 'default',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#f7f5fc',
  // Lihat catatan panjang di apps/kid/app/layout.tsx — nav bawah di sini juga memakai
  // env(safe-area-inset-bottom), dan tanpa ini ia bernilai 0 di mode standalone iOS.
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang={lang} className={jakarta.variable}>
      <body>{children}</body>
    </html>
  );
}
