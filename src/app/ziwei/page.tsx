import type { Metadata } from 'next'
import ZiweiClient from './ZiweiClient'

export const metadata: Metadata = {
  title: '紫微斗数排盘在线',
  description: '紫微斗数在线排盘，输入出生信息即可排出紫微命盘，包含十二宫、星曜解析、四化飞星。传统紫微斗数命理分析。',
  keywords: '紫微斗数,免费排盘,紫微命盘,十二宫,星曜,四化飞星',
  openGraph: { title: '紫微斗数排盘在线', description: '紫微斗数在线排盘，输入出生信息即可排出紫微命盘。' },
  alternates: { canonical: 'https://jiugongbagua.com/ziwei', languages: { 'zh-CN': 'https://jiugongbagua.com/ziwei', 'zh-TW': 'https://jiugongbagua.com/ziwei?lang=zh-TW', 'en': 'https://jiugongbagua.com/ziwei?lang=en' } },
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  '@id': 'https://jiugongbagua.com/ziwei#faq',
  mainEntity: [
    {
      '@type': 'Question',
      name: '紫微斗数排盘需要什么信息？',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '紫微斗数排盘需要准确的出生年月日时（精确到小时）以及性别。本站支持阳历和农历输入，并提供真太阳时校正功能，帮助用户获取更精确的排盘结果。',
      },
    },
    {
      '@type': 'Question',
      name: '紫微斗数和八字有什么区别？',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '紫微斗数和八字都是中国传统命理学的重要分支。八字以五行生克为核心理论，通过天干地支分析命运特质。紫微斗数以星曜系统为核心，将命盘分为十二宫，每宫有不同主星和辅星，通过星曜组合和亮度判断命运。紫微斗数的十二宫包含了命宫、兄弟宫、夫妻宫、子女宫、财帛宫、疾厄宫、迁移宫、交友宫、官禄宫、田宅宫、福德宫、父母宫，对人生各方面覆盖更全面。',
      },
    },
    {
      '@type': 'Question',
      name: '紫微斗数排盘详解怎么看？',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '紫微斗数排盘完成后，首先看命宫的主星和亮度，这是命格的基础。再依次分析各宫位的星曜组合，重点关注紫微、天机、太阳、武曲、天同、廉贞等北斗主星的位置。四化星（化禄、化权、化科、化忌）的落宫也是关键，决定了吉凶方向。本站会自动列出所有星曜和亮度，无需专业知识即可查看。',
      },
    },
    {
      '@type': 'Question',
      name: '紫微命盘中的格局是什么？',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '紫微斗数中的格局是指特定星曜组合形成的特殊命格，如"紫府同宫格"（紫微天府同守命宫）、"日月并明格"（太阳太阴同守命宫或夹命）、"杀破狼格"（七杀、破军、贪狼三合方会照）等。每种格局都有其独特的性格特征和命运走向。本站自动检测命盘中的格局并给出评级和详细解释。',
      },
    },
  ],
}

export default function ZiweiPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <ZiweiClient />
    </>
  )
}