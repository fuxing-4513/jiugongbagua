export const dynamic = 'force-static'

import type { MetadataRoute } from 'next'

// 用户声明: 严格防爬虫 - 禁止AI训练 / 数据抓取 / 无信誉爬虫
// 注: Next.js export 模式下 public/robots.txt 不会被复制到 out 目录，改用 route handler

// 已知AI训练爬虫名单（持续更新）
const AI_CRAWLERS = [
  'GPTBot', 'Claude-Web', 'anthropic-ai', 'CCBot', 'FacebookBot',
  'Bytespider', 'TikTok', 'Amazonbot', 'Applebot-Extended',
  'Google-Extended', 'omgili', 'omgilibot', 'cohere-ai',
  'PerplexityBot', 'YouBot', 'ChatGPT-User', 'gemini',
  'AhrefsBot', 'SemrushBot', 'Mozbot', 'Screaming Frog SEO Spider',
  'BLEXBot', 'DotBot', 'MJ12bot', 'DataForSeoBot', 'SeekportBot',
]

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/api/',
          '/.git/',
          '/data/v2/',
          '/data/system_config.json',
          '/data/api_metrics_collect.json',
        ],
      },
      {
        userAgent: 'Baiduspider',
        allow: '/',
        disallow: ['/admin/', '/api/', '/.git/'],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/admin/', '/api/', '/.git/'],
      },
      {
        userAgent: 'bingbot',
        allow: '/',
        disallow: ['/admin/', '/api/', '/.git/'],
      },
      // AI训练爬虫 - 全面封禁
      ...AI_CRAWLERS.map(ua => ({
        userAgent: ua,
        disallow: ['/'],
      })),
    ],
    sitemap: 'https://www.jiugongbagua.com/sitemap.xml',
  }
}
