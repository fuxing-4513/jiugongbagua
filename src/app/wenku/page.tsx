import type { Metadata } from 'next'
import WenkuClient from './WenkuClient'

export const metadata: Metadata = {
  title: '命理知识文库',
  description: '中国传统命理文化知识文库，包含八字、紫微斗数、风水、面相、手相、梅花易数等传统文化知识文章。',
  keywords: '命理文库,玄学知识,八字知识,风水知识,易经学习',
  openGraph: { title: '命理知识文库', description: '中国传统命理文化知识文库，包含八字、紫微斗数、风水、面相、手相等传统文化知识。' },
  alternates: { canonical: 'https://jiugongbagua.com/wenku', languages: { 'zh-CN': 'https://jiugongbagua.com/wenku', 'zh-TW': 'https://jiugongbagua.com/wenku?lang=zh-TW', 'en': 'https://jiugongbagua.com/wenku?lang=en' } },
}

export default function WenkuPage() { return <WenkuClient /> }