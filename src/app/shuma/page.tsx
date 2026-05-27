import type { Metadata } from 'next'
import ShumaClient from './ShumaClient'

export const metadata: Metadata = {
  title: '号码测吉凶 - 九宫八卦',
  description: '基于八星磁场理论的手机号码数字能量分析，输入手机号快速分析财运、事业、感情等数字磁场信息。',
  openGraph: {
    title: '号码测吉凶 - 九宫八卦',
    description: '八星磁场手机号分析，在线免费测算手机号码吉凶。',
  },
}

export default function ShumaPage() {
  return <ShumaClient />
}
