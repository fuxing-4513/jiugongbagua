import type { Metadata } from 'next'
import MyChartsClient from './MyChartsClient'

export const metadata: Metadata = {
  title: '我的命盘 · 九宫',
  description: '云端保存的排盘记录：查看、复制命盘摘要、分享给顾问做深度解读。',
}

export default function MyChartsPage() {
  return <MyChartsClient />
}
