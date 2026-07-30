/**
 * Manifest PWA app ortu (ADR-0019). Bisa dipasang, sengaja tidak offline — alasannya sama
 * dengan app anak, dan di sini lebih tajam: layar ini menyetujui perpindahan uang.
 *
 * Ikonnya varian **ungu**, app anak varian **kuning** (brand system §7). Bukan selera: satu ortu
 * bisa memasang kedua app di HP yang sama, dan dua ikon kembar di home screen adalah cara termurah
 * membuat orang membuka app yang salah.
 */
import type { MetadataRoute } from 'next';
import { dict } from '../lib/copy';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: dict.brand.parentApp,
    short_name: dict.brand.parentAppShort,
    description: dict.brand.positioning,
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#f7f5fc',
    theme_color: '#f7f5fc',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
