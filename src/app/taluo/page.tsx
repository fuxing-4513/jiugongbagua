import type { Metadata } from 'next'
import TaluoClient from './TaluoClient'

export const metadata: Metadata = {
  title: '塔罗牌在线占卜',
  description: '免费在线塔罗牌占卜，韦特塔罗78张完整牌库。三牌占卜（过去-现在-未来）与Yes/No单张占卜，沉浸式洗牌抽牌翻牌体验，完整塔罗牌义字典。',
  keywords: '塔罗,塔罗牌,塔罗占卜在线,韦特塔罗,三牌牌阵,塔罗解读,塔罗牌义大全,yes no塔罗,塔罗牌在线免费',
  openGraph: { title: '塔罗牌在线占卜', description: '免费在线塔罗牌占卜 — 三牌牌阵 & Yes/No 单张占卜' },
  alternates: { canonical: 'https://jiugongbagua.com/taluo', languages: { 'zh-CN': 'https://jiugongbagua.com/taluo', 'zh-TW': 'https://jiugongbagua.com/taluo?lang=zh-TW', 'en': 'https://jiugongbagua.com/taluo?lang=en' } },
}

export default function TaluoPage() { return <TaluoClient /> }
