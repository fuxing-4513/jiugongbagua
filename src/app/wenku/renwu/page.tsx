import type { Metadata } from 'next'
import Link from 'next/link'
import { ALL_PEOPLE as PEOPLE } from '@/data/renwu/people'

export const metadata: Metadata = {
  title: '人物百科 · 术数先贤 · 九宫文库',
  description: '徐子平、邵雍、京房、刘伯温、万民英…中国术数与易学史上的关键人物——生平、著作与学派传承。',
}

export default function RenwuPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 font-serif mb-3">👤 人物百科</h1>
        <p className="text-sm text-gray-500">术数与易学史上的关键人物——生平 · 著作 · 学派 · 托名辨析</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {PEOPLE.map(p => (
          <Link key={p.id} href={`/wenku/renwu/${p.slug}`}
            className="rounded-xl border border-gray-200/80 dark:border-gray-700/60 bg-white/85 dark:bg-[#13161c]/85 p-4 hover:border-gold-400 dark:hover:border-gold-500/60 transition-colors group">
            <div className="flex items-baseline justify-between gap-2">
              <h2 className="font-bold text-gray-800 dark:text-gray-100 group-hover:text-gold-600 transition-colors">{p.name}</h2>
              <span className="text-[10px] text-gray-400 shrink-0">{p.era}</span>
            </div>
            <p className="text-[11px] text-gold-600 mt-0.5">{p.field} · {p.school || ''}</p>
            <p className="text-xs text-gray-500 mt-2 leading-relaxed line-clamp-2">{p.intro}</p>
          </Link>
        ))}
      </div>
      <p className="text-center text-[11px] text-gray-400 mt-8">著录口径：生平据通行史传——托名著作均已注明——学术争议如实呈现</p>
    </div>
  )
}
