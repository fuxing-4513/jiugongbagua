import type { Metadata } from 'next'
import XingmingClient from './XingmingClient'

export const metadata: Metadata = {
  title: '姓名打分 - 九宫八卦',
  description: '基于康熙字典笔画·五格数理和三才五行配置给姓名打分，提供天格、人格、地格、外格、总格完整解读。',
  openGraph: {
    title: '姓名打分 - 九宫八卦',
    description: '康熙字典笔画五格数理姓名打分，81数理吉凶，三才五行配置。',
  },
}

export default function XingmingPage() {
  return <XingmingClient />
}
