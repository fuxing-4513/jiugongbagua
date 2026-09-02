import type { Metadata } from 'next'
import ExpertsClient from './ExpertsClient'

export const metadata: Metadata = {
  title: '专家预约咨询',
  description: '命理专家在线预约咨询服务，经验丰富的传统命理师傅为您提供八字、风水、命理分析等一对一咨询。',
  keywords: '命理专家,在线咨询,八字命理师,风水先生,咨询师',
  openGraph: { title: '专家预约咨询', description: '命理专家在线预约咨询服务，经验丰富的传统命理师傅提供八字、风水、命理分析等一对一咨询。' },
  alternates: { canonical: 'https://jiugongbagua.com/experts', languages: { 'zh-CN': 'https://jiugongbagua.com/experts', 'zh-TW': 'https://jiugongbagua.com/experts?lang=zh-TW',  } },
}

export default function ExpertsPage() { return <ExpertsClient /> }