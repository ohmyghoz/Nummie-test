/** @type {import('next').NextConfig} */
const nextConfig = {
  // @nummi/core adalah TypeScript murni (main -> src/index.ts), jadi harus di-transpile Next.
  // Ini satu-satunya jembatan apps/console -> packages/core (satu arah, sesuai CLAUDE.md).
  transpilePackages: ['@nummi/core'],
  webpack(config) {
    // Core memakai specifier ESM ber-ekstensi .js (NodeNext). Webpack perlu diberi tahu
    // memetakan .js -> .ts saat me-resolve sumber TypeScript milik @nummi/core.
    config.resolve.extensionAlias = {
      ...config.resolve.extensionAlias,
      '.js': ['.ts', '.tsx', '.js'],
    };
    return config;
  },
};

export default nextConfig;
