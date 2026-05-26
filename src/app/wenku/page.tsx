import type { Metadata } from 'next'
import WenkuClient from './WenkuClient'

export const metadata: Metadata = {
  title: '知识文库 - 九宫八卦',
  description: '易学知识、命理文化、传统智慧文章精选。包含八字、紫微斗数、周易、风水、姓名学等文章。',
  openGraph: {
    title: '知识文库 - 九宫八卦',
    description: '易学知识、命理文化、传统智慧文章精选。',
  },
}

export default function WenkuPage() {
  return <WenkuClient />
}
