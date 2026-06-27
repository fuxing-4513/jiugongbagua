export const dynamic = 'force-static'

import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/data/', '/*.json', '/*.json.gz', '/api/', '/admin/', '/_next/', '/out/'],
      },
      {
        userAgent: 'GPTBot',
        disallow: '/',
      },
      {
        userAgent: 'Claude-Web',
        disallow: '/',
      },
      {
        userAgent: 'CCBot',
        disallow: '/',
      },
      {
        userAgent: 'anthropic-ai',
        disallow: '/',
      },
      {
        userAgent: 'FacebookBot',
        disallow: ['/data/', '/*.json'],
      },
    ],
    sitemap: 'https://jiugongbagua.com/sitemap.xml',
  }
}
