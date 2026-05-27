import type { Metadata } from 'next'
import TaluoClient from './TaluoClient'

export const metadata: Metadata = {
  title: '塔罗占卜 - 九宫八卦',
  description: '在线塔罗牌占卜，78张完整牌组支持单张/三张/凯尔特十字牌阵，自动抽牌解读。',
  openGraph: {
    title: '塔罗占卜 - 九宫八卦',
    description: '78张塔罗牌在线占卜，多种牌阵可选。',
  },
}

export default function TaluoPage() {
  return <TaluoClient />
}
