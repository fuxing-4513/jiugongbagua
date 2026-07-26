import type { Metadata } from 'next'
import MeihuaClient from './MeihuaClient'

export const metadata: Metadata = {
  title: '梅花易数',
  description: '梅花易数在线起卦，基于数字、农历、公历、万物类象等多种起卦方式，64卦断辞详解。',
  keywords: '梅花易数,起卦,易经,64卦,邵雍',
  openGraph: { title: '梅花易数', description: '梅花易数在线起卦，基于数字、农历、公历、万物类象等多种起卦方式。' },
  alternates: { canonical: 'https://jiugongbagua.com/meihua', languages: { 'zh-CN': 'https://jiugongbagua.com/meihua', 'zh-TW': 'https://jiugongbagua.com/meihua?lang=zh-TW', 'en': 'https://jiugongbagua.com/meihua?lang=en' } },
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  '@id': 'https://jiugongbagua.com/meihua#faq',
  mainEntity: [
    {
      '@type': 'Question',
      name: '什么是梅花易数？',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '梅花易数是由北宋理学家邵雍（邵康节）创立的易学占卜方法，源于"观梅占"典故。它以易经64卦为基础，通过数字、时间、颜色、声音、方位等万物类象起卦，强调"象数理占"四位一体，是一种灵活多变的起卦解卦体系。',
      },
    },
    {
      '@type': 'Question',
      name: '梅花易数怎么起卦？',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '梅花易数有多种起卦方式：数字起卦法（任意两个数分别对应上下卦和动爻）、时间起卦法（用年月日时数字起卦）、万物类象法（见物起卦）等。本站提供数字起卦和时间起卦两种主要方式，填入对应信息即可自动生成卦象和断辞。',
      },
    },
    {
      '@type': 'Question',
      name: '梅花易数和六爻哪个准？',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '梅花易数和六爻都是基于周易64卦的占卜方法，但各有特色。六爻（纳甲筮法）体系更系统严密，有固定的世应、六亲、用神分析框架，适合具体事项的详细推演。梅花易数更灵活，强调心易感悟和象数理占的综合运用，适合快速判断方向。两者没有绝对的高低，选择哪种取决于个人偏好和所问之事。',
      },
    },
    {
      '@type': 'Question',
      name: '周易64卦每卦的含义是什么？',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '周易64卦由八卦两两相重而成，每卦包含卦名、卦辞、爻辞和象辞。卦辞概括一卦的总体吉凶和核心含义，六个爻的爻辞则描述事物发展的六个阶段。本站对每卦都提供了邵雍河洛理数、傅佩荣解卦手册、张铭仁解卦三位大师的解读，以及事业、经商、求名、婚恋等六大领域的具体建议。',
      },
    },
    {
      '@type': 'Question',
      name: '免费在线算命的原理是什么？',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '免费在线算命基于中国传统命理学和周易文化的数字化实现。八字排盘通过计算出生时间对应的天干地支和五行生克关系来生成命盘；六爻和梅花易数通过随机数模拟传统起卦过程；紫微斗数以出生时间和星曜分布排盘。所有计算基于传统古籍中的固定规则，不涉及任何神秘力量，提供的是传统文化视角的参考信息。',
      },
    },
  ],
}

export default function MeihuaPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <MeihuaClient />
    </>
  )
}