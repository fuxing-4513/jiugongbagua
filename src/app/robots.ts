export const dynamic = 'force-static'

import type { MetadataRoute } from 'next'

// 用户声明: 严格防爬虫 - 禁止AI训练 / 数据抓取 / 无信誉爬虫
// 本文件的完全版本见 src/app/robots.ts
// 注: Next.js export 模式下 public/robots.txt 不会被复制到 out 目录，改用 route handler

export const dynamic = 'force-static'

import type { MetadataRoute } from 'next'

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
        disallow: ['/data/', '/*.json', '/*.json.gz', '/api/', '/admin/', '/_next/', '/out/',
                   '/.git/', '/.env', '/config/', '/backup/', '/database/',
                   '/data/api_metrics_collect.json', '/data/system_config.json', '/data/v2/'],
      },
      // AI训练爬虫 → 全站禁止
      ...AI_CRAWLERS.map(ua => ({
        userAgent: ua,
        disallow: '/',
      })),
      // 搜索引擎允许收录首页及公开内容
      {
        userAgent: 'Baiduspider',
        allow: '/',
        disallow: ['/data/', '/*.json', '/*.json.gz', '/api/', '/admin/'],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/data/', '/*.json', '/api/'],
      },
      {
        userAgent: 'bingbot',
        allow: '/',
        disallow: ['/data/', '/*.json', '/api/'],
      },
      {
        userAgent: 'YandexBot',
        allow: '/',
        disallow: ['/data/', '/*.json'],
      },
      {
        userAgent: 'Sogou',
        allow: '/',
        disallow: ['/data/', '/*.json'],
      },
    ],
    sitemap: 'https://jiugongbagua.com/sitemap.xml',
  }
}
