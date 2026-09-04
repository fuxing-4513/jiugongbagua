import type { Metadata } from 'next'
import NumerologyClient from './NumerologyClient'

export const metadata: Metadata = {
  title: '生命灵数 · 灵数测算 · 九宫',
  description: '生命灵数在线测算：生命路径数、表达数、灵魂冲动数、人格数——毕达哥拉斯数字体系，白话解读你的天赋、情感与事业方向。',
}

export default function NumerologyPage() {
  return <NumerologyClient />
}
