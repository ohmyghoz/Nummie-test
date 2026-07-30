import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';

// Lihat catatan di apps/kid/app/layout.tsx — font disebut CSS tapi tak pernah dimuat.
const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  variable: '--font-ui',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Nummi Console — C-1 (baca-saja)',
  description: 'Alat operator untuk memverifikasi model data Nummi sebelum permukaan anak/ortu ditulis.',
  robots: { index: false, follow: false },
};

// Console tidak pernah dipasang ke Home Screen, tapi ia tetap dibuka di HP saat operator memeriksa
// sesuatu di jalan — dan tanpa ini lebarnya jadi lebar desktop yang diperkecil.
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={jakarta.variable}>
      <body>{children}</body>
    </html>
  );
}
