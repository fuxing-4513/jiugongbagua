import type { Metadata } from 'next'
import TaluoClient from './TaluoClient'

export const metadata: Metadata = {
  title: '塔罗占卜 - 九宫八卦',
  description: '随机抽取塔罗牌，解读牌面含义，洞察过去现在未来。22张大阿尔卡那完整库，含正逆位解读。',
  openGraph: {
    title: '塔罗占卜 - 九宫八卦',
    description: '塔罗牌占卜，洞察过去现在未来。',
  },
}

export default function TaluoPage() {
  return <TaluoClient />
}
