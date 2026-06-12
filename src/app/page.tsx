import type { Metadata } from 'next'
import HomeClient from './HomeClient'

const baseUrl = 'https://jiugongbagua.com'

export const metadata: Metadata = {
  title: '九宫八卦 - 中国传统命理文化平台',
  description: '九宫八卦是中国传统命理文化平台，提供八字算命、紫微斗数、六爻、小六壬、周公解梦、姓名测试、号码测吉凶、黄历择日、塔罗等在线免费服务。',
  openGraph: {
    title: '九宫八卦 - 传统命理在线测算平台',
    description: '传承经典 · 智慧启航。八字算命、紫微斗数、六爻、梅花易数、小六壬等二十余种传统命理在线服务。',
  },
  alternates: {
    canonical: baseUrl,
    languages: {
      'zh-CN': baseUrl,
      'zh-TW': `${baseUrl}/?lang=zh-TW`,
      'en': `${baseUrl}/?lang=en`,
    },
  },
}

export default function HomePage() {
  return <HomeClient />
}
