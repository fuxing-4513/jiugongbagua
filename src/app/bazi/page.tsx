import type { Metadata } from 'next'
import BaziClient from './BaziClient'

export const metadata: Metadata = {
  title: '八字算命 - 九宫八卦',
  description: '输入出生年月日时，基于专业八字库推算四柱命盘，包含五行分布、纳音、十神和大运分析。',
  openGraph: {
    title: '八字算命 - 九宫八卦',
    description: '输入出生年月日时，基于专业八字库推算四柱命盘。',
  },
}

export default function BaziPage() {
  return <BaziClient />
}
