import type { Metadata } from 'next'
import JiemengClient from './JiemengClient'

export const metadata: Metadata = {
  title: '周公解梦 - 九宫八卦',
  description: '在线周公解梦大全，输入梦境关键词查询解析，涵盖动物、自然、人物、场景等百种梦境含义。',
  openGraph: {
    title: '周公解梦 - 九宫八卦',
    description: '在线周公解梦，百种梦境含义解析。',
  },
}

export default function JiemengPage() {
  return <JiemengClient />
}
