import type { Metadata } from 'next'
import ZiweiClient from './ZiweiClient'

export const metadata: Metadata = {
  title: '紫微斗数排盘在线',
  description: '紫微斗数在线排盘：专业命盘图（大限/流年/流月/流日/流时/飞星），40+ 古籍格局识别（紫微斗数全书·全集·骨髓赋），四化深度解析，古籍原文文库检索。',
  keywords: '紫微斗数,免费排盘,紫微命盘,十二宫,星曜,四化飞星,命盘图,格局,大限流年,倪海厦天纪,紫微斗数全书,古籍',
  openGraph: { title: '紫微斗数排盘在线', description: '紫微斗数在线排盘：专业命盘图 + 40+ 古籍格局识别 + 四化深度解析。' },
  alternates: { canonical: 'https://jiugongbagua.com/ziwei', languages: { 'zh-CN': 'https://jiugongbagua.com/ziwei', 'zh-TW': 'https://jiugongbagua.com/ziwei?lang=zh-TW', 'en': 'https://jiugongbagua.com/ziwei?lang=en' } },
}

export default function ZiweiPage() { return <ZiweiClient /> }