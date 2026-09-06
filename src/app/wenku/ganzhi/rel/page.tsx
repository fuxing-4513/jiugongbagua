import type { Metadata } from 'next'
import Link from 'next/link'
import Breadcrumb from '@/components/Breadcrumb'
import { ALL_RELS, getRelsByType } from '@/data/ganzhi/rel-index'
import { REL_TYPE_META, type RelType } from '@/data/ganzhi/rel-schema'

export const metadata: Metadata = {
  title: '干支关系 · 合化冲刑害 · 干支百科·九宫',
  description: '天干五合、天干相冲、地支六合、三合局、三会方、六冲、六害、三刑、六破、十二长生——干支关系的合化条件与命理详解。',
}

const GROUPS: RelType[] = ['tian-he', 'tian-chong', 'di-he', 'di-sanhe', 'di-sanhue', 'di-chong', 'di-hai', 'di-xing', 'di-po', 'changsheng']

export default function RelPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <Breadcrumb items={[{ label: '九宫文库', href: '/wenku' }, { label: '干支百科', href: '/wenku/ganzhi' }, { label: '干支关系' }]} />
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 font-serif mb-3">🔗 干支关系</h1>
        <p className="text-sm text-gray-500">合 · 冲 · 刑 · 害 · 破 · 三合三会 · 十二长生——<strong>{ALL_RELS.length} 条关系深度详解</strong>（九宫原创整理）</p>
      </div>
      <div className="space-y-6 mb-10">
        {GROUPS.map(type => {
          const meta = REL_TYPE_META[type]
          const items = getRelsByType(type)
          return (
            <div key={type} className="rounded-2xl border border-gray-200/80 dark:border-gray-700/60 bg-white/85 dark:bg-[#171614]/85 p-5">
              <div className="flex items-baseline justify-between mb-1">
                <h2 className="font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2"><span>{meta.emoji}</span>{meta.name}<span className="text-[11px] font-normal text-gray-400">（{items.length} 条）</span></h2>
              </div>
              <p className="text-xs text-gray-400 mb-3">{meta.desc}</p>
              <div className="flex flex-wrap gap-2">
                {items.map(r => (
                  <Link key={r.id} href={`/wenku/ganzhi/rel/${encodeURIComponent(r.id)}`}
                    className="text-xs px-3 py-1.5 rounded-lg border border-gray-200/90 dark:border-gray-700 hover:border-gold-300 dark:hover:border-gold-500/60 text-gray-700 dark:text-gray-200 hover:bg-gold-500/5 transition-colors">
                    {r.title}
                    {r.tags[0] ? <span className="text-[10px] text-gray-400 ml-1.5">· {r.tags[0]}</span> : null}
                  </Link>
                ))}
              </div>
            </div>
          )
        })}
      </div>
      <div className="text-center">
        <Link href="/wenku/ganzhi" className="text-xs text-gray-400 hover:text-gold-500">← 返回干支百科</Link>
      </div>
    </div>
  )
}
