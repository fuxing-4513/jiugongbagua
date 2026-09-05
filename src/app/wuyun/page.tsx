import type { Metadata } from 'next'
import WuyunClient from './WuyunClient'

export const metadata: Metadata = {
  title: '五运六气 · 运气推算 · 九宫',
  description: '五运六气在线推算：中运（大运太过不及）、司天在泉、主气客气六步——依《黄帝内经·素问》运气七篇，推算全年气候大势与养生要点。',
}

export default function WuyunPage() {
  return <WuyunClient />
}
