import type { Metadata } from 'next'
import LiuyaoClient from './LiuyaoClient'

export const metadata: Metadata = {
  title: '六爻在线免费',
  description: '六爻在线起卦解卦，传统纳甲筮法，输入三个数字或随机起卦，分析卦象爻辞、世应、用神，预测吉凶。',
  keywords: '六爻,免费起卦,纳甲筮法,周易,卦象解卦',
  openGraph: { title: '六爻在线免费', description: '六爻在线起卦解卦，传统纳甲筮法，输入三个数字或随机起卦。' },
  alternates: { canonical: 'https://jiugongbagua.com/liuyao', languages: { 'zh-CN': 'https://jiugongbagua.com/liuyao', 'zh-TW': 'https://jiugongbagua.com/liuyao?lang=zh-TW', 'en': 'https://jiugongbagua.com/liuyao?lang=en' } },
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  '@id': 'https://jiugongbagua.com/liuyao#faq',
  mainEntity: [
    {
      '@type': 'Question',
      name: '六爻占卜是什么？',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '六爻占卜又称纳甲筮法，是中国传统周易占卜术之一。使用三枚铜钱进行六次投掷，从下到上形成六条爻线（阴爻或阳爻），组成一个六爻卦象。根据卦象的世应关系、五行六亲、动爻变化等信息，解析所问之事的吉凶趋势。',
      },
    },
    {
      '@type': 'Question',
      name: '六爻在线占卜准吗？',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '六爻占卜的准确性取决于起卦的诚心和解卦的专业度。本平台提供手动摇卦和自动起卦两种方式，手动模式模拟真实铜钱投掷流程，自动模式方便快速体验。卦象由系统基于传统纳甲筮法规则自动解析，可提供有价值的参考。',
      },
    },
    {
      '@type': 'Question',
      name: '六爻和梅花易数有什么区别？',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '六爻（纳甲筮法）使用三枚铜钱投掷六次成卦，重卦象和五行六亲生克关系，配世应、用神分析，属于较为系统的占卜体系。梅花易数则由北宋邵雍创立，可用数字、时间、声音、颜色等多种方式起卦，更强调象数理占和心易感悟。两者都基于周易64卦，但方法和侧重点不同。',
      },
    },
    {
      '@type': 'Question',
      name: '六爻中的世爻和应爻是什么？',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '世爻代表问卦者自己，是卦的核心所在，反映求测人的状态和处境。应爻代表所问之事、对方或外部环境。世应之间的生克关系（世生应、应生世、世克应、应克世等）是判断吉凶、关系亲疏的重要依据。',
      },
    },
    {
      '@type': 'Question',
      name: '什么是动爻和变卦？',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '动爻是指在起卦过程中出现的变爻（老阳或老阴），代表该爻位有变化发生。动爻所在的爻位揭示了事情变化的关键位置。变卦则是根据动爻将本卦中的阴阳爻反转后得到的新卦，代表事情发展变化的最终结果或趋势方向。',
      },
    },
  ],
}

export default function LiuyaoPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <LiuyaoClient />
    </>
  )
}