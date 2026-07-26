export const dynamic = 'force-static'

import type { MetadataRoute } from 'next'
import { flattenCategories } from '@/data/xueguan/categories'
import { bookCatalog } from '@/data/xueguan/books'

const baseUrl = 'https://jiugongbagua.com'

export default function sitemap(): MetadataRoute.Sitemap {
  // ========== 主站页面 ==========
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

  // ========== 易学书馆页面（自动生成） ==========
  const xueguanPages: { path: string; priority: number; changeFreq: 'weekly' | 'monthly' }[] = []

  // 首页
  xueguanPages.push({ path: '/xueguan', priority: 0.9, changeFreq: 'weekly' })

  // 所有分类（大类+子类）
  for (const cat of flattenCategories()) {
    xueguanPages.push({ path: `/xueguan/${cat.id}`, priority: 0.8, changeFreq: 'weekly' })
  }

  // 所有书籍页面
  for (const book of bookCatalog) {
    if (!book) continue
    const priority = book.isComplete ? 0.7 : 0.6
    xueguanPages.push({ path: `/xueguan/${book.category}/${book.id}`, priority, changeFreq: 'monthly' })
  }

  const allPages = [...mainPages, ...infoPages, ...xueguanPages]

  return allPages.map(({ path, priority, changeFreq }) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: changeFreq,
    priority,
  }))
}
