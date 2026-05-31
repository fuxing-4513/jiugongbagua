import type { Metadata } from 'next'
import HuangliClient from './HuangliClient'

export const metadata: Metadata = {
  title: '黄历择日查询',
  description: '今日黄历择日查询，在线黄历老黄历看日子宜忌，包含干支三柱、冲煞、星宿、十二建星、财神方位、吉神方位等信息。',
  keywords: '黄历,老黄历,择日,宜忌,吉日,冲煞,黄道吉日',
  openGraph: { title: '黄历择日查询', description: '今日黄历择日查询，在线黄历老黄历看日子宜忌，包含干支三柱、冲煞、星宿等信息。' },
  alternates: { canonical: 'https://jiugongbagua.com/huangli', languages: { 'zh-CN': 'https://jiugongbagua.com/huangli', 'zh-TW': 'https://jiugongbagua.com/huangli?lang=zh-TW', 'en': 'https://jiugongbagua.com/huangli?lang=en' } },
}

export default function HuangliPage() { return <HuangliClient /> }