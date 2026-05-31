import type { Metadata } from 'next'
import LingqianClient from './LingqianClient'

export const metadata: Metadata = {
  title: '灵签占卜在线',
  description: '灵签占卜在线抽签，传统签文解读，求签问卜，事业签、姻缘签、财运签等在线摇签解签。',
  keywords: '灵签占卜,抽签,签文,求签,解签,在线摇签',
  openGraph: { title: '灵签占卜在线', description: '灵签占卜在线抽签，传统签文解读，求签问卜，事业签、姻缘签、财运签。' },
  alternates: { canonical: 'https://jiugongbagua.com/lingqian', languages: { 'zh-CN': 'https://jiugongbagua.com/lingqian', 'zh-TW': 'https://jiugongbagua.com/lingqian?lang=zh-TW', 'en': 'https://jiugongbagua.com/lingqian?lang=en' } },
}

export default function LingqianPage() { return <LingqianClient /> }