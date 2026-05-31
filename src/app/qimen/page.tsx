import type { Metadata } from 'next'
import QimenClient from './QimenClient'

export const metadata: Metadata = {
  title: '奇门遁甲在线排盘',
  description: '奇门遁甲在线排盘，传统三式之一，包含地盘、天盘、人盘、神盘四层分析，奇门预测。',
  keywords: '奇门遁甲,排盘,奇门预测,遁甲,三奇八门',
  openGraph: { title: '奇门遁甲在线排盘', description: '奇门遁甲在线排盘，传统三式之一，包含地盘、天盘、人盘、神盘四层分析。' },
  alternates: { canonical: 'https://jiugongbagua.com/qimen', languages: { 'zh-CN': 'https://jiugongbagua.com/qimen', 'zh-TW': 'https://jiugongbagua.com/qimen?lang=zh-TW', 'en': 'https://jiugongbagua.com/qimen?lang=en' } },
}

export default function QimenPage() { return <QimenClient /> }