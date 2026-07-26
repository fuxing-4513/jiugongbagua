import type { Metadata } from 'next'
import JiemengClient from './JiemengClient'

export const metadata: Metadata = {
  title: '周公解梦在线查询',
  description: '周公解梦大全在线查询，收录梦境类型解析，输入梦到的事物即可查看周公解梦释义、吉凶征兆与运势预示。',
  keywords: '周公解梦,梦境解析,梦到,解梦大全,梦的预兆',
  openGraph: { title: '周公解梦在线查询', description: '周公解梦大全在线查询，收录梦境类型解析，查看周公解梦释义、吉凶征兆。' },
  alternates: { canonical: 'https://jiugongbagua.com/jiemeng', languages: { 'zh-CN': 'https://jiugongbagua.com/jiemeng', 'zh-TW': 'https://jiugongbagua.com/jiemeng?lang=zh-TW', 'en': 'https://jiugongbagua.com/jiemeng?lang=en' } },
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  '@id': 'https://jiugongbagua.com/jiemeng#faq',
  mainEntity: [
    {
      '@type': 'Question',
      name: '周公解梦是真的吗？',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '周公解梦是中国传统梦境解析文化的核心经典，由周公旦整理历代梦境象征而成。虽然现代科学认为梦境是大脑在睡眠中的自然活动，但解梦文化承载了千年来人们对潜意识和心理象征的探索，具有一定的文化参考和心理暗示价值。',
      },
    },
    {
      '@type': 'Question',
      name: '梦到蛇是什么意思？',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '解梦大全中，梦到蛇通常象征智慧、转变或潜在威胁，具体含义取决于梦境情境。蛇咬人可能预示人际关系问题，梦到被蛇追赶可能反映生活中的压力，梦到蛇蜕皮象征新生和转变。结合梦境具体细节可获得更精准的解读。',
      },
    },
    {
      '@type': 'Question',
      name: '梦到水是什么预兆？',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '水在解梦里代表情感、财富和潜意识。清澈的水通常象征财运和好兆头，浑浊的水可能预示麻烦或感情困扰。梦到大海代表心胸开阔或事业前景广阔，梦到下雨则取决于雨势大小和梦境氛围。',
      },
    },
    {
      '@type': 'Question',
      name: '梦到已故亲人怎么回事？',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '梦到已故亲人是常见梦境，通常表示思念之情，也可能是潜意识中寻求指引或安慰。从解梦角度看，已故亲人在梦中说的话或做的事往往反映了梦者内心的某种需求或未解决的问题，不必过度担忧。',
      },
    },
    {
      '@type': 'Question',
      name: '经常做梦好不好？',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '人每天睡眠都会做3-5个梦，只是多数被遗忘。经常记住梦境说明睡眠中快速眼动期较活跃，或醒来方式刚好在REM阶段。偶尔多梦属于正常，若严重影响睡眠质量，建议调整作息或咨询专业人士。解梦文化更多关注梦的象征意义而非生理层面。',
      },
    },
  ],
}

export default function JiemengPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <JiemengClient />
    </>
  )
}