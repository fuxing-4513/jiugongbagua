import type { Metadata } from 'next'
import ZiweiClient from './ZiweiClient'

export const metadata: Metadata = {
  title: '紫微斗数排盘在线',
  description: '紫微斗数在线排盘，输入出生信息即可排出紫微命盘，包含十二宫、星曜解析、四化飞星。传统紫微斗数命理分析。',
  keywords: '紫微斗数,免费排盘,紫微命盘,十二宫,星曜,四化飞星',
  openGraph: { title: '紫微斗数排盘在线', description: '紫微斗数在线排盘，输入出生信息即可排出紫微命盘。' },
  alternates: { canonical: 'https://jiugongbagua.com/ziwei', languages: { 'zh-CN': 'https://jiugongbagua.com/ziwei', 'zh-TW': 'https://jiugongbagua.com/ziwei?lang=zh-TW', 'en': 'https://jiugongbagua.com/ziwei?lang=en' } },
}

export default function ZiweiPage() { return <ZiweiClient /> }