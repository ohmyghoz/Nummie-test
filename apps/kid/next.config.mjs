import { fileURLToPath } from 'node:url';

/**
 * Akar workspace dipatok eksplisit. Tanpa ini Next MENEBAK-nya dari lockfile terdekat, dan di mesin
 * yang punya `package-lock.json` nyasar di direktori home ia memilih home sebagai akar — build lokal
 * dan build Vercel jadi menghitung jejak berkas yang berbeda.
 */
const workspaceRoot = fileURLToPath(new URL('../..', import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingRoot: workspaceRoot,
  transpilePackages: ['@nummi/core'],
  webpack(config) {
    // @nummi/core dan copy/ memakai specifier ESM ber-ekstensi .js (NodeNext).
    // Webpack perlu diberi tahu memetakan .js -> .ts saat me-resolve sumber TypeScript-nya.
    config.resolve.extensionAlias = {
      ...config.resolve.extensionAlias,
      '.js': ['.ts', '.tsx', '.js'],
    };
    return config;
  },
};

export default nextConfig;
