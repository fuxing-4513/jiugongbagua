import type { Metadata } from 'next'
import ShumaClient from './ShumaClient'

export const metadata: Metadata = {
  title: '号码测吉凶在线',
  description: '手机号码测吉凶、车牌号测吉凶在线免费，基于数理吉凶分析，数字能量解读。',
  keywords: '号码测吉凶,手机号吉凶,车牌号吉凶,数字吉凶',
  openGraph: { title: '号码测吉凶在线', description: '手机号码测吉凶、车牌号测吉凶在线免费，基于数理吉凶分析。' },
  alternates: { canonical: 'https://jiugongbagua.com/shuma', languages: { 'zh-CN': 'https://jiugongbagua.com/shuma', 'zh-TW': 'https://jiugongbagua.com/shuma?lang=zh-TW',  } },
}

export default function ShumaPage() { return <ShumaClient /> }