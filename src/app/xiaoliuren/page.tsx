import type { Metadata } from 'next'
import XiaoliurenClient from './XiaoliurenClient'

export const metadata: Metadata = {
  title: '小六壬占卜在线',
  description: '小六壬占卜在线免费测算，传统掌诀占卜法，输入月日时或随机数字，推算大安/留连/速喜/赤口/小吉/空亡。',
  keywords: '小六壬,掌诀占卜,大安,速喜,小吉,空亡,赤口,留连',
  openGraph: { title: '小六壬占卜在线', description: '小六壬占卜在线免费测算，传统掌诀占卜法，推算大安/留连/速喜/赤口/小吉/空亡。' },
  alternates: { canonical: 'https://jiugongbagua.com/xiaoliuren', languages: { 'zh-CN': 'https://jiugongbagua.com/xiaoliuren', 'zh-TW': 'https://jiugongbagua.com/xiaoliuren?lang=zh-TW', 'en': 'https://jiugongbagua.com/xiaoliuren?lang=en' } },
}

export default function XiaoliurenPage() { return <XiaoliurenClient /> }