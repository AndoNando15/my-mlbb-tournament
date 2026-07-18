import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/',
        destination: '/daftar',
        permanent: true, // true untuk SEO dan redirect permanen (301)
      },
    ];
  },
};

export default nextConfig;
