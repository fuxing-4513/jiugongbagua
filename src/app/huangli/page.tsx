import type { Metadata } from 'next'
import HuangliClient from './HuangliClient'

export const metadata: Metadata = {
  title: '每日宜忌 · 老黄历择日查询',
  description: '每日宜忌：今日黄历宜忌、冲煞、财神方位、吉时查询。传统择日参考，帮助安排签约、搬家、出行等重要日程。',
  keywords: '每日宜忌,黄历,老黄历,择日,宜忌,吉日,冲煞,黄道吉日,今日宜忌',
  openGraph: { title: '每日宜忌 · 老黄历', description: '今日黄历宜忌、冲煞、财神方位、吉时查询，传统择日参考。' },
  alternates: { canonical: 'https://jiugongbagua.com/huangli', languages: { 'zh-CN': 'https://jiugongbagua.com/huangli', 'zh-TW': 'https://jiugongbagua.com/huangli?lang=zh-TW',  } },
}

export default function HuangliPage() { return <HuangliClient /> }