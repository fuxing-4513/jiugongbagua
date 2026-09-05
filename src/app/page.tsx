import type { Metadata } from 'next'
import HomeClient from './HomeClient'

const baseUrl = 'https://jiugongbagua.com'

export const metadata: Metadata = {
  title: '九宫八卦 - AI 时空决策引擎 | 八字排盘·紫微斗数·奇门遁甲',
  description: '在关键时刻，看清真实处境。八字排盘、紫微斗数、奇门遁甲等传统命理模型，结合 数百部古籍原典与 AI 白话解读，为人生决策提供情境参考。',
  openGraph: {
    title: '九宫八卦 - AI 时空决策引擎 | 八字排盘·紫微斗数·奇门遁甲',
    description: '在关键时刻，看清真实处境。八字排盘、紫微斗数、奇门遁甲等传统命理模型，结合 数百部古籍原典与 AI 白话解读，为人生决策提供情境参考。',
  },
  alternates: {
    canonical: baseUrl,
    languages: {
      'zh-CN': baseUrl,
      'zh-TW': `${baseUrl}/?lang=zh-TW`,
    },
  },
}

export default function HomePage() {
  return <HomeClient />
}
