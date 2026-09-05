import type { Metadata } from 'next'
import Link from 'next/link'
import { ALL_PEOPLE as PEOPLE } from '@/data/renwu/people'

export const metadata: Metadata = {
  title: '人物百科 · 术数先贤 · 九宫文库',
  description: '徐子平、邵雍、京房、刘伯温、万民英…中国术数与易学史上的关键人物——生平、著作与学派传承。',
}

// 时代分组（按 era 关键词）
function eraGroup(era: string): string {
  const e = era || ''
  if (/战国|春秋|先秦|周/.test(e)) return '先秦'
  if (/汉/.test(e)) return '秦汉'
  if (/晋|南北朝|魏/.test(e)) return '魏晋南北朝'
  if (/隋|唐/.test(e)) return '隋唐'
  if (/宋/.test(e)) return '宋'
  if (/元/.test(e)) return '元'
  if (/明/.test(e)) return '明'
  if (/清|民国/.test(e)) return '清·民国'
  if (/传|不详|无考/.test(e)) return '传说·待考'
  return '近现代'
}

const ORDER = ['先秦', '秦汉', '魏晋南北朝', '隋唐', '宋', '元', '明', '清·民国', '近现代', '传说·待考']

export default function RenwuPage() {
  const groups = ORDER.map(g => ({ g, items: PEOPLE.filter(p => eraGroup(p.era) === g) })).filter(x => x.items.length > 0)
  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 font-serif mb-3">👤 人物百科</h1>
        <p className="text-sm text-gray-500">术数与易学史上的关键人物——生平 · 著作 · 学派 · 托名辨析</p>
      </div>

      {/* 建成统计横幅 */}
      <div className="mb-8 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
        {[
          { n: PEOPLE.length, label: '已收录人物', icon: '👤' },
          { n: ORDER.slice(0, -2).length, label: '历史分期', icon: '⏳' },
          { n: PEOPLE.filter(p => p.works?.length).length, label: '关联古籍著作', icon: '📜' },
          { n: PEOPLE.filter(p => p.controversy).length, label: '托名/争议考辨', icon: '🔍' },
        ].map(s => (
          <div key={s.label} className="rounded-xl border border-gold-200/70 dark:border-gold-500/20 bg-gradient-to-b from-[#fdf9ee]/70 to-white/40 dark:from-[#1a1813] dark:to-[#13161c] p-3">
            <p className="text-xl font-bold text-gray-800 dark:text-gray-100">{s.icon} {s.n}</p>
            <p className="text-[11px] text-gray-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* 按时代分组浏览 */}
      {groups.map(({ g, items }) => (
        <div key={g} className="mb-8">
          <h2 className="text-sm font-bold text-gray-600 dark:text-gray-300 mb-3 flex items-center gap-2">
            <span className="inline-block w-1.5 h-4 rounded bg-gold-400" />{g}
            <span className="text-[11px] font-normal text-gray-400">（{items.length} 人）</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {items.map(p => (
              <Link key={p.id} href={`/wenku/renwu/${p.slug}`}
                className="rounded-xl border border-gray-200/80 dark:border-gray-700/60 bg-white/85 dark:bg-[#13161c]/85 p-4 hover:border-gold-400 dark:hover:border-gold-500/60 transition-colors group">
                <div className="flex items-baseline justify-between gap-2">
                  <h3 className="font-bold text-gray-800 dark:text-gray-100 group-hover:text-gold-600 transition-colors">{p.name}</h3>
                  <span className="text-[10px] text-gray-400 shrink-0">{p.era}</span>
                </div>
                <p className="text-[11px] text-gold-600 mt-0.5">{p.field}{p.school ? ` · ${p.school}` : ''}</p>
                <p className="text-xs text-gray-500 mt-2 leading-relaxed line-clamp-2">{p.intro}</p>
              </Link>
            ))}
          </div>
        </div>
      ))}
      <p className="text-center text-[11px] text-gray-400 mt-8">著录口径：生平据通行史传——托名著作均已注明——学术争议如实呈现——九宫原创考辨见各人物页"九宫按"</p>
    </div>
  )
}
