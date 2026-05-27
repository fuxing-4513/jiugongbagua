import type { Metadata } from 'next'
import WenkuClient from './WenkuClient'

export const metadata: Metadata = {
  title: '知识文库 - 九宫八卦',
  description: '九宫八卦知识文库，涵盖易学基础、八字命理、紫微斗数、风水文化、姓名学、数字能量、六爻占卜、小六壬、周公解梦、塔罗牌等传统文化知识。',
  openGraph: {
    title: '知识文库 - 九宫八卦',
    description: '传统文化命理知识大全，原创深度文章。',
  },
}

export default function WenkuPage() {
  return <WenkuClient />
}
