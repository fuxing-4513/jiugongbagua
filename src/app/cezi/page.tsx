import type { Metadata } from 'next'
import CeziClient from './CeziClient'

export const metadata: Metadata = {
  title: '测字 - 九宫八卦',
  description: '输入一个汉字，系统根据笔画、五行、字形字义进行占卜解读。',
  openGraph: {
    title: '测字 - 九宫八卦',
    description: '单字占卜测吉凶，汉字玄机解读。',
  },
}

export default function CeziPage() {
  return <CeziClient />
}
