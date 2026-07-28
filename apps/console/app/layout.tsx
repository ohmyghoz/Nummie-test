import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Nummi Console — C-1 (baca-saja)',
  description: 'Alat operator untuk memverifikasi model data Nummi sebelum permukaan anak/ortu ditulis.',
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
