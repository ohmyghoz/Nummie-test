/** @type {import('next').NextConfig} */
const nextConfig = {
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
