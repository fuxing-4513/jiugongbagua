export const dynamic = 'force-static'

import type { MetadataRoute } from 'next'

const baseUrl = 'https://jiugongbagua.com'

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = [
    '',
    '/bazi',
    '/ziwei',
    '/liuyao',
    '/xiaoliuren',
    '/jiemeng',
    '/xingming',
    '/shuma',
    '/huangli',
    '/taluo',
    '/cezi',
    '/wenku',
    '/experts',
  ]

  return pages.map((page) => ({
    url: `${baseUrl}${page}`,
    lastModified: new Date(),
    changeFrequency: page === '' ? 'monthly' as const : 'weekly' as const,
    priority: page === '' ? 1.0 : 0.8,
  }))
}
