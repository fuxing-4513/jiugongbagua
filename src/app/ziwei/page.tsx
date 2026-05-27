import type { Metadata } from 'next'
import ZiweiClient from './ZiweiClient'

export const metadata: Metadata = {
  title: '紫微斗数排盘 - 九宫八卦',
  description: '输入出生信息，基于 iztro 专业排盘引擎生成紫微斗数命盘，查看十二宫星曜分布、四化飞星、命主身主等完整紫微斗数信息。',
  openGraph: {
    title: '紫微斗数排盘 - 九宫八卦',
    description: '专业紫微斗数命盘排盘工具，十二宫星曜完整呈现。',
  },
}

export default function ZiweiPage() {
  return <ZiweiClient />
}
