import type { Metadata } from 'next'
import TaluoClient from './TaluoClient'

export const metadata: Metadata = {
  title: '塔罗牌在线',
  description: '免费在线塔罗牌解读，韦特塔罗78张完整牌库。三牌牌阵、凯尔特十字、关系牌阵、事业牌阵、日运单牌多牌阵选择，3D翻牌动画，多维度深度解读。',
  keywords: '塔罗,塔罗牌,塔罗牌在线,韦特塔罗,三牌牌阵,凯尔特十字,塔罗解读,塔罗牌义大全,塔罗牌在线免费,关系牌阵,事业牌阵,日运塔罗',
  openGraph: { title: '塔罗牌在线', description: '免费在线塔罗牌解读 — 三牌牌阵·凯尔特十字·关系·事业·日运，3D翻牌动画' },
  alternates: { canonical: 'https://jiugongbagua.com/taluo', languages: { 'zh-CN': 'https://jiugongbagua.com/taluo', 'zh-TW': 'https://jiugongbagua.com/taluo?lang=zh-TW', 'en': 'https://jiugongbagua.com/taluo?lang=en' } },
}

export default function TaluoPage() { return <TaluoClient /> }
