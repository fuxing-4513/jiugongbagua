import type { Metadata } from 'next'
import ChengguClient from './ChengguClient'

export const metadata: Metadata = {
  title: '称骨测算',
  description: '称骨测算在线，袁天罡称骨法，根据出生年月日时重量推算骨重，解读命格轻重与一生运势。',
  keywords: '称骨测算,袁天罡称骨,骨重,免费称骨,命格',
  openGraph: { title: '称骨测算', description: '称骨测算在线，袁天罡称骨法，根据出生年月日时重量推算骨重。' },
  alternates: { canonical: 'https://jiugongbagua.com/chenggu', languages: { 'zh-CN': 'https://jiugongbagua.com/chenggu', 'zh-TW': 'https://jiugongbagua.com/chenggu?lang=zh-TW', 'en': 'https://jiugongbagua.com/chenggu?lang=en' } },
}

export default function ChengguPage() { return <ChengguClient /> }