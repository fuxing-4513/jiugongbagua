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
    languages: { 'zh-CN': 'https://jiugongbagua.com/bazi', 'zh-TW': 'https://jiugongbagua.com/bazi?lang=zh-TW',  },
  },
}

export default function BaziPage() { return <BaziClient /> }