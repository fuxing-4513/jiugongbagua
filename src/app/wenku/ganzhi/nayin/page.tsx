import type { Metadata } from 'next'
import Link from 'next/link'
import Breadcrumb from '@/components/Breadcrumb'
import { ALL_NAYIN, ELEMENT_COLOR } from '@/data/ganzhi/nayin-index'

export const metadata: Metadata = {
  title: '六十甲子纳音 · 干支百科 · 九宫',
  description: '六十甲子纳音三十组详解——海中金、炉中火、大林木…纳音意象、五行属性与传统命理应用。',
}

export default function NayinPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <Breadcrumb items={[{ label: '九宫文库', href: '/wenku' }, { label: '干支百科', href: '/wenku/ganzhi' }, { label: '六十甲子纳音' }]} />
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 font-serif mb-3">🎵 六十甲子纳音</h1>
        <p className="text-sm text-gray-500">纳音三十组——海中金 · 炉中火 · 大林木……<strong>共 {ALL_NAYIN.length} 组全收录</strong>——年命意象 · 五行属性 · 传统命理应用（九宫原创整理）</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-10">
        {ALL_NAYIN.map(n => (
          <Link key={n.id} href={`/wenku/ganzhi/nayin/${n.id}`}
            className="rounded-xl border border-gray-200/80 dark:border-gray-700/60 bg-white/85 dark:bg-[#13161c]/85 p-4 hover:border-gold-400 dark:hover:border-gold-500/60 transition-colors group">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-gray-400">{n.ganzhi}</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full ${ELEMENT_COLOR[n.element]}`}>{n.element}</span>
            </div>
            <h2 className="font-bold text-gray-800 dark:text-gray-100 group-hover:text-gold-600 transition-colors text-base">{n.nayin}</h2>
            <p className="text-xs text-gray-500 mt-1.5 leading-relaxed line-clamp-2">{n.desc.slice(0, 60)}…</p>
          </Link>
        ))}
      </div>
      <div className="text-center">
        <Link href="/wenku/ganzhi" className="text-xs text-gray-400 hover:text-gold-500">← 返回干支百科</Link>
      </div>
    </div>
  )
}
