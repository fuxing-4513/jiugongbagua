import type { Metadata } from 'next'
import HuangliClient from './HuangliClient'

export const metadata: Metadata = {
  title: '黄历择日 - 九宫八卦',
  description: '查看每日黄历，包含农历、干支、宜忌、冲煞、星宿、吉神方位等信息。支持日期切换。',
  openGraph: {
    title: '黄历择日 - 九宫八卦',
    description: '每日黄历宜忌查询，择吉日良辰。',
  },
}

export default function HuangliPage() {
  return <HuangliClient />
}
