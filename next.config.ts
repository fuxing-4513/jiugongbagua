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
  // 禁用页面源码映射（防止爬虫获取 TS 源代码提示）
  productionBrowserSourceMaps: false,
  // Webpack 配置：代码混淆增强
  webpack: (config, { isServer, dev }) => {
    if (!dev && !isServer) {
      // 生产环境：关闭source map
      config.devtool = false;
      
      // 添加自定义混淆规则
      // 确保输出中不会出现完整的前缀和文件名
      const TerserPlugin = require('terser-webpack-plugin');
      if (config.optimization && config.optimization.minimizer) {
        config.optimization.minimizer = [
          new TerserPlugin({
            terserOptions: {
              compress: {
                drop_console: true,  // 移除console
                drop_debugger: true, // 移除debugger
                pure_funcs: ['console.log','console.info','console.debug','console.warn'],
              },
              mangle: {
                toplevel: true,
                properties: {
                  regex: /^_private_/,
                },
              },
              output: {
                comments: false,  // 移除注释
                beautify: false,
              },
            },
          }),
        ];
      }
    }
    return config;
  },
};

export default nextConfig;
