import type { Metadata } from 'next'
import TaluoClient from './TaluoClient'

export const metadata: Metadata = {
  title: '塔罗在线',
  description: '塔罗在线免费，经典韦特塔罗牌，多种牌阵选择，在线塔罗牌解读，事业爱情财运塔罗预测。',
  keywords: '塔罗,塔罗牌,在线,韦特塔罗,牌阵,塔罗解读',
  openGraph: { title: '塔罗在线', description: '塔罗在线免费，经典韦特塔罗牌，多种牌阵选择，在线塔罗牌解读。' },
  alternates: { canonical: 'https://jiugongbagua.com/taluo', languages: { 'zh-CN': 'https://jiugongbagua.com/taluo', 'zh-TW': 'https://jiugongbagua.com/taluo?lang=zh-TW', 'en': 'https://jiugongbagua.com/taluo?lang=en' } },
}

export default function TaluoPage() { return <TaluoClient /> }