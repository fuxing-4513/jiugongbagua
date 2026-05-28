import type { Metadata } from 'next'
import XiaoliurenClient from './XiaoliurenClient'

export const metadata: Metadata = {
  title: '小六壬占卜 - 九宫八卦',
  description: '在线小六壬占卜，输入三个数字推算吉凶，大安、留连、速喜、赤口、小吉、空亡六掌解读。',
  openGraph: {
    title: '小六壬占卜 - 九宫八卦',
    description: '在线小六壬占卜，掌诀推算吉凶祸福。',
  },
}

export default function XiaoliurenPage() {
  return <XiaoliurenClient />
}
