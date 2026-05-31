import type { Metadata } from 'next'
import CeziClient from './CeziClient'

export const metadata: Metadata = {
  title: '测字占卜在线免费',
  description: '测字占卜在线免费，输入汉字根据笔画、五行、字形字义解读吉凶。支持诸葛神数384签，传统测字术数。',
  keywords: '测字占卜,测字,诸葛神数,汉字五行,测字算命',
  openGraph: { title: '测字占卜在线免费', description: '测字占卜在线免费，输入汉字根据笔画、五行、字形字义解读吉凶。' },
  alternates: { canonical: 'https://jiugongbagua.com/cezi', languages: { 'zh-CN': 'https://jiugongbagua.com/cezi', 'zh-TW': 'https://jiugongbagua.com/cezi?lang=zh-TW', 'en': 'https://jiugongbagua.com/cezi?lang=en' } },
}

export default function CeziPage() { return <CeziClient /> }