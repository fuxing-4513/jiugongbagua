import type { Metadata } from 'next'
import HehunClient from './HehunClient'

export const metadata: Metadata = {
  title: '八字合婚配对免费',
  description: '八字合婚免费配对测试，基于双方生辰八字分析婚姻缘分、五行互补、十神配对，合婚择吉参考。',
  keywords: '八字合婚,合婚配对,婚姻测算,八字配对,婚配',
  openGraph: { title: '八字合婚配对免费', description: '八字合婚免费配对测试，基于双方生辰八字分析婚姻缘分、五行互补。' },
  alternates: { canonical: 'https://jiugongbagua.com/hehun', languages: { 'zh-CN': 'https://jiugongbagua.com/hehun', 'zh-TW': 'https://jiugongbagua.com/hehun?lang=zh-TW', 'en': 'https://jiugongbagua.com/hehun?lang=en' } },
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  '@id': 'https://jiugongbagua.com/hehun#faq',
  mainEntity: [
    {
      '@type': 'Question',
      name: '八字合婚免费配对原理是什么？',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '八字合婚是基于双方出生年月日时生成的八字，分析五行互补、十神配对、年柱纳音、日柱关系等维度。五行互补指双方八字中缺失或偏旺的五行能否相互补益；十神配对看双方日干的生克关系；年柱纳音看年命是否相生。综合以上因素，评定两人的婚姻缘分和匹配程度。',
      },
    },
    {
      '@type': 'Question',
      name: '合婚需要双方的生辰八字吗？',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '是的，八字合婚需要双方的出生年份、月份、日期和时辰。信息越准确，合婚分析越精准。如果您只知道其中一方的准确信息，也可以先为该方排盘，再结合另一方的已知信息做参考分析。本站所有合婚服务均为免费。',
      },
    },
    {
      '@type': 'Question',
      name: '八字不合怎么办？',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '八字合婚仅供参考，不应作为决定婚姻的唯一标准。即使八字显示某些方面不完全匹配，通过双方的相互理解、包容和努力，完全可以建立幸福的婚姻关系。合婚分析更多是帮助了解彼此性格特点和潜在沟通点，而非判定命运。',
      },
    },
  ],
}

export default function HehunPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <HehunClient />
    </>
  )
}