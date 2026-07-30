/**
 * Manifest PWA app anak (ADR-0019 menjawab D4 untuk MVP).
 *
 * **Bisa dipasang, sengaja tidak offline.** Tidak ada service worker di sini, dan itu keputusan:
 * menyimpan saldo di cache berarti menampilkan angka uang yang basi, dan seluruh repo ini dibangun
 * di sekitar janji bahwa angkanya benar. Installability tidak butuh JavaScript sama sekali —
 * offline butuh, plus invalidasi cache seumur hidup produk. Lihat ADR-0019 §"Kenapa installable
 * tapi tidak offline".
 *
 * Namanya lewat `copy/` seperti string lain (aturan copy CLAUDE.md) — nama app yang ditulis mati
 * di sini akan jadi satu-satunya teks Inggris yang luput saat D1 ditinjau ulang.
 */
import type { MetadataRoute } from 'next';
import { dict } from '../lib/copy';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: dict.brand.kidApp,
    short_name: dict.brand.kidAppShort,
    description: dict.brand.positioning,
    start_url: '/',
    scope: '/',
    display: 'standalone',
    // Anak memakainya di HP dalam genggaman; iPad tetap jalan, hanya tidak dikunci lanskap.
    orientation: 'portrait',
    background_color: '#fff9f2',
    theme_color: '#fff9f2',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      // `maskable` wajib terpisah: Android memotongnya jadi bentuk peluncur, dan ikon `any`
      // yang dipotong akan kehilangan kecambahnya.
      { src: '/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
