import type { Metadata } from 'next'
import AiClient from './AiClient'

export const metadata: Metadata = {
  title: 'AI 决策对话 · 九宫',
  description: '基于你的命盘与人生节点，AI 决策顾问提供白话情境评估、风险提示与行动建议。古籍依据可溯源，解读透明不黑盒。',
}

export default function AiPage() {
  return <AiClient />
}
