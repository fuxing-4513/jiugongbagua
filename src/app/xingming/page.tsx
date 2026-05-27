import type { Metadata } from 'next'
import XingmingClient from './XingmingClient'

export const metadata: Metadata = {
  title: '姓名测试打分 - 九宫八卦',
  description: '输入姓名，基于五格数理和五行三才配置进行姓名分析打分，提供天格、人格、地格、外格、总格完整解读。',
  openGraph: {
    title: '姓名测试打分 - 九宫八卦',
    description: '五格数理姓名分析，81数理吉凶，三才五行配置。',
  },
}

export default function XingmingPage() {
  return <XingmingClient />
}
