import type { Metadata } from 'next'
import BaziClient from './BaziClient'

export const metadata: Metadata = {
  title: '四柱八字排盘',
  description: '输入出生年月日时，在线免费四柱八字排盘，包含五行分布、纳音、十神、大运分析、神煞详解。传统子平八字命理，精准推算命盘。',
  keywords: '八字排盘,四柱排盘,免费八字,子平八字,五行分析,大运流年',
  openGraph: {
    title: '四柱八字排盘',
    description: '输入出生年月日时，在线免费四柱八字排盘，包含五行分布、纳音、十神、大运分析、神煞详解。',
  },
  alternates: {
    canonical: 'https://jiugongbagua.com/bazi',
    languages: { 'zh-CN': 'https://jiugongbagua.com/bazi', 'zh-TW': 'https://jiugongbagua.com/bazi?lang=zh-TW', 'en': 'https://jiugongbagua.com/bazi?lang=en' },
  },
}

const baseUrl = 'https://jiugongbagua.com'

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  '@id': 'https://jiugongbagua.com/bazi#faq',
  mainEntity: [
    {
      '@type': 'Question',
      name: '什么是四柱八字？',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '四柱八字是中国传统命理学的核心概念，通过一个人的出生年、月、日、时各取天干地支，组成年柱、月柱、日柱、时柱共八个字。四柱八字蕴含五行生克关系，可推演命运走势、性格特质、事业财运、婚姻感情等信息。',
      },
    },
    {
      '@type': 'Question',
      name: '八字排盘需要哪些信息？',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '八字排盘需要出生年份、月份、日期和时辰（几点出生）。建议尽可能提供准确的出生时间，因为时柱对命盘分析有重要影响。本站支持阳历（公历）和阴历（农历）输入，并支持真太阳时校正。',
      },
    },
    {
      '@type': 'Question',
      name: '八字合婚免费是真的吗？',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '是的，九宫八卦提供免费的八字排盘服务，输入双方出生信息即可查看各自的四柱八字、五行分布、神煞等详细命盘信息。合婚分析可在本平台使用相关工具免费查看，不收取任何费用。',
      },
    },
    {
      '@type': 'Question',
      name: '八字中的五行缺什么怎么看？',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '八字排盘完成后，系统会自动统计金、木、水、火、土各五行在四柱中出现的次数，并用柱状图直观展示五行分布。缺某一行即为该五行出现次数为零，系统会标注缺哪些五行并提供相应的补益建议。',
      },
    },
    {
      '@type': 'Question',
      name: '大运和流年有什么区别？',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '大运是十年一个周期的运势阶段，反映人生长期的发展趋势和阶段性波峰波谷。流年是每一年的具体运势，即当年干支与命盘产生的动态关系。大运看大方向，流年看当年具体吉凶，两者结合才能准确推算命运轨迹。',
      },
    },
  ],
}

export default function BaziPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <BaziClient />
    </>
  )
}