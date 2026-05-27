import type { Metadata } from 'next'
import LiuyaoClient from './LiuyaoClient'

export const metadata: Metadata = {
  title: '六爻占卜 - 九宫八卦',
  description: '在线六爻起卦，三枚硬币法模拟传统摇卦，64卦卦辞爻辞完整解读。',
  openGraph: {
    title: '六爻占卜 - 九宫八卦',
    description: '在线六爻起卦占卜，卦象解读吉凶祸福。',
  },
}

export default function LiuyaoPage() {
  return <LiuyaoClient />
}
