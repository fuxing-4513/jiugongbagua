import type { Metadata } from 'next'
import Link from 'next/link'
import XueguanSearch from '@/components/XueguanSearch'

export const metadata: Metadata = {
  title: '古籍搜索 - 易学书馆 | 九宫八卦',
  description: '在 数百部命理、卜筮、风水、道家古籍中全文搜索，支持书名、作者、章节、关键词多维度检索。',
  openGraph: {
    title: '古籍搜索 - 易学书馆',
    description: '数百部古籍全文检索，九宫易学正本清源',
    siteName: '九宫八卦',
    type: 'website',
    url: 'https://jiugongbagua.com/xueguan/search',
  },
}

export default function XueguanSearchPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-20">
      {/* 面包屑导航 */}
      <div className="mb-6 text-sm text-gray-400">
        <Link href="/xueguan" className="hover:text-gold-500 transition-colors">易学书馆</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-600">搜索</span>
      </div>

      {/* 标题 */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-800 font-serif mb-2">
          🔍 古籍搜索
        </h1>
        <p className="text-sm text-gray-400">
          覆盖 数百部命理·卜筮·风水·道家·医易·西方玄学古籍
        </p>
      </div>

      {/* 搜索组件 */}
      <XueguanSearch placeholder="输入书名、作者、章节、关键词..." />

      {/* 分类快捷入口 */}
      <div className="mt-12 pt-6 border-t border-gray-100">
        <h2 className="text-sm font-medium text-gray-500 mb-3">🏷️ 按分类浏览</h2>
        <div className="flex flex-wrap gap-2">
          {[
            ['mingli-bazi', '📜', '四柱八字'],
            ['bushi-liuyao', '📊', '六爻纳甲'],
            ['xiangshu-mian', '👤', '面相学'],
            ['fengshui-xingshi', '⛰️', '风水形势'],
            ['daojia-jingdian', '☯', '道家经典'],
            ['yiyi-wuyun', '🌪️', '五运六气'],
            ['western-astrology', '🌙', '西方占星'],
          ].map(([cat, emoji, name]) => (
            <Link
              key={cat}
              href={`/xueguan/${cat}`}
              className="px-3 py-1.5 text-xs bg-white border border-gray-100 rounded-full hover:border-gold-200 hover:text-gold-600 transition-colors"
            >
              {emoji} {name}
            </Link>
          ))}
        </div>
        <div className="mt-6 text-center">
          <Link href="/" className="text-sm text-gray-400 hover:text-gold-500 transition-colors">🏠 返回九宫八卦首页</Link>
        </div>
      </div>
    </div>
  )
}
