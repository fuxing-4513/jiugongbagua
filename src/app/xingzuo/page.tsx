import type { Metadata } from 'next'
import XingzuoClient from './XingzuoClient'

export const metadata: Metadata = {
  title: '星座运势查询',
  description: '十二星座运势查询，包含白羊座、金牛座、双子座、巨蟹座、狮子座、处女座、天秤座、天蝎座、射手座、摩羯座、水瓶座、双鱼座的运势分析。',
  keywords: '星座运势,星座,十二星座,今日运势,明日运势',
  openGraph: { title: '星座运势查询', description: '十二星座运势查询，包含白羊座、金牛座、双子座等十二星座的运势分析。' },
  alternates: { canonical: 'https://jiugongbagua.com/xingzuo', languages: { 'zh-CN': 'https://jiugongbagua.com/xingzuo', 'zh-TW': 'https://jiugongbagua.com/xingzuo?lang=zh-TW', 'en': 'https://jiugongbagua.com/xingzuo?lang=en' } },
}

export default function XingzuoPage() { return <XingzuoClient /> }