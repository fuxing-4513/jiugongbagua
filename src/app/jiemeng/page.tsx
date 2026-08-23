import type { Metadata } from 'next'
import { Suspense } from 'react'
import JiemengClient from './JiemengClient'

export const metadata: Metadata = {
  title: '周公解梦在线查询',
  description: '周公解梦大全在线查询，收录梦境类型解析，输入梦到的事物即可查看周公解梦释义、吉凶征兆与运势预示。',
  keywords: '周公解梦,梦境解析,梦到,解梦大全,梦的预兆',
  openGraph: { title: '周公解梦在线查询', description: '周公解梦大全在线查询，收录梦境类型解析，查看周公解梦释义、吉凶征兆。' },
  alternates: { canonical: 'https://jiugongbagua.com/jiemeng', languages: { 'zh-CN': 'https://jiugongbagua.com/jiemeng', 'zh-TW': 'https://jiugongbagua.com/jiemeng?lang=zh-TW', 'en': 'https://jiugongbagua.com/jiemeng?lang=en' } },
}

export default function JiemengPage() {
  return (
    <Suspense fallback={
      <div className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold text-gold-700 font-serif mb-3">周公解梦</h1>
        <p className="text-gray-600 mb-8">正在加载解梦数据库...</p>
      </div>
    }>
      <JiemengClient />
    </Suspense>
  )
}
