import type { Metadata } from 'next'
import QimenClient from './QimenClient'

export const metadata: Metadata = {
  title: '奇门遁甲在线排盘',
  description: '奇门遁甲在线排盘，传统三式之一，包含地盘、天盘、人盘、神盘四层分析，奇门预测。',
  keywords: '奇门遁甲,排盘,奇门预测,遁甲,三奇八门',
  openGraph: { title: '奇门遁甲在线排盘', description: '奇门遁甲在线排盘，传统三式之一，包含地盘、天盘、人盘、神盘四层分析。' },
  alternates: { canonical: 'https://jiugongbagua.com/qimen', languages: { 'zh-CN': 'https://jiugongbagua.com/qimen', 'zh-TW': 'https://jiugongbagua.com/qimen?lang=zh-TW', 'en': 'https://jiugongbagua.com/qimen?lang=en' } },
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  '@id': 'https://jiugongbagua.com/qimen#faq',
  mainEntity: [
    {
      '@type': 'Question',
      name: '什么是奇门遁甲？',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '奇门遁甲是中国传统术数三式之一（太乙、奇门、六壬），被称为"帝王之学"。它融合了阴阳五行、八卦九宫、天干地支、八门九星等理论，通过分析天时、地利、人和、神助四大要素，预测事物发展趋吉避凶。在古代主要用于军事战略，现代多用于决策咨询、择吉和运势分析。',
      },
    },
    {
      '@type': 'Question',
      name: '奇门遁甲在线排盘怎么看？',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '奇门遁甲排盘由天盘、地盘、人盘和神盘四层组成。地盘代表基础环境，天盘显示天时趋势，人盘（八门）反映人事状态，神盘（八神）揭示吉凶暗力。排盘时首先看日干（问卦人）和时干（所问事）所在的宫位，再看各宫位的八门、九星、八神的吉凶组合。本站提供一键排盘，自动生成四层盘式解析。',
      },
    },
    {
      '@type': 'Question',
      name: '奇门和六爻哪个更适合预测？',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '奇门遁甲和六爻各有擅长领域。奇门遁甲侧重审时度势、方位选择、战略决策，擅长分析"什么时间、什么方位、做什么事最为有利"。六爻侧重具体事件的吉凶判断和详细推演。一般来说，奇门更适合大的战略决策和择吉，六爻更适合具体的日常事务问卜。',
      },
    },
  ],
}

export default function QimenPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <QimenClient />
    </>
  )
}