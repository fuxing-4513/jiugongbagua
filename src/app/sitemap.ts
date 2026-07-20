export const dynamic = 'force-static'

import type { MetadataRoute } from 'next'

const baseUrl = 'https://jiugongbagua.com'

export default function sitemap(): MetadataRoute.Sitemap {
  const mainPages = [
    { path: '', priority: 1.0, changeFreq: 'monthly' as const },
    { path: '/bazi', priority: 0.9, changeFreq: 'weekly' as const },
    { path: '/ziwei', priority: 0.9, changeFreq: 'weekly' as const },
    { path: '/liuyao', priority: 0.8, changeFreq: 'weekly' as const },
    { path: '/xiaoliuren', priority: 0.8, changeFreq: 'weekly' as const },
    { path: '/jiemeng', priority: 0.8, changeFreq: 'weekly' as const },
    { path: '/xingming', priority: 0.8, changeFreq: 'weekly' as const },
    { path: '/shuma', priority: 0.7, changeFreq: 'weekly' as const },
    { path: '/huangli', priority: 0.7, changeFreq: 'daily' as const },
    { path: '/taluo', priority: 0.7, changeFreq: 'weekly' as const },
    { path: '/taluo/cards', priority: 0.6, changeFreq: 'weekly' as const },
    { path: '/wenku', priority: 0.8, changeFreq: 'weekly' as const },
    { path: '/hehun', priority: 0.7, changeFreq: 'weekly' as const },
    { path: '/chenggu', priority: 0.7, changeFreq: 'weekly' as const },
    { path: '/fengshui', priority: 0.7, changeFreq: 'weekly' as const },
    { path: '/lingqian', priority: 0.7, changeFreq: 'weekly' as const },
    { path: '/meihua', priority: 0.7, changeFreq: 'weekly' as const },
    { path: '/qimen', priority: 0.7, changeFreq: 'weekly' as const },
    { path: '/shengxiao', priority: 0.7, changeFreq: 'weekly' as const },
    { path: '/xingzuo', priority: 0.7, changeFreq: 'weekly' as const },
    { path: '/heluo', priority: 0.6, changeFreq: 'monthly' as const },
    { path: '/wiki', priority: 0.6, changeFreq: 'monthly' as const },
    { path: '/app', priority: 0.7, changeFreq: 'monthly' as const },
    { path: '/zonghe-zhengming', priority: 0.6, changeFreq: 'monthly' as const },
  ]

  const infoPages = [
    { path: '/glossary', priority: 0.6, changeFreq: 'monthly' as const },
    { path: '/faq', priority: 0.5, changeFreq: 'monthly' as const },
    { path: '/profile', priority: 0.5, changeFreq: 'monthly' as const },
    { path: '/contact', priority: 0.4, changeFreq: 'monthly' as const },
    { path: '/help', priority: 0.4, changeFreq: 'monthly' as const },
    { path: '/privacy', priority: 0.3, changeFreq: 'yearly' as const },
    { path: '/terms', priority: 0.3, changeFreq: 'yearly' as const },
  ]

  const allPages = [...mainPages, ...infoPages]

  return allPages.map(({ path, priority, changeFreq }) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: changeFreq,
    priority,
  }))
}
