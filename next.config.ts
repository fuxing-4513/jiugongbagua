import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  images: { 
    unoptimized: true,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  trailingSlash: true,
  // 实验性优化
  experimental: {
    optimizePackageImports: ['lunar-typescript', 'iztro'],
  },
};

export default nextConfig;
