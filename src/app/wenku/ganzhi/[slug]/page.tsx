import type { Metadata } from 'next'
import Link from 'next/link'
import Breadcrumb from '@/components/Breadcrumb'
import JiugongNote from '@/components/JiugongNote';
import { TIAN_GAN, DI_ZHI } from '@/data/ganzhi/ganzhi'

const ALL = [...TIAN_GAN, ...DI_ZHI]
export function generateStaticParams() {
  return ALL.map(g => ({ slug: g.id }))
}

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const g = ALL.find(x => x.id === decodeURIComponent(slug))
  if (!g) return { title: '干支未找到 · 九宫' }
  return {
    title: `${g.id}（${g.kind === 'tian' ? '天干' : '地支'}）五行属性详解｜${g.wuxing}·${g.direction}方｜九宫`,
    description: `${g.id}：五行属${g.wuxing}（${g.yinyang}），方位${g.direction}，${g.season}${g.month ? '（' + g.month + '）' : ''}——本义、类象与八字/奇门/六壬中的应用。`,
  }
}

export default async function GanzhiDetail({ params }: Props) {
  const { slug } = await params
  const g = ALL.find(x => x.id === decodeURIComponent(slug))
  if (!g) return <div className="max-w-3xl mx-auto px-4 py-16 text-gray-500">干支不存在</div>

  const rows: [string, string][] = [
    ['五行', g.wuxing], ['阴阳', g.yinyang], ['方位', g.direction], ['季节', g.season],
  ]
  if (g.month) rows.push(['对应月份', g.month])
  if (g.hour) rows.push(['对应时辰', g.hour])
  if (g.zodiac) rows.push(['生肖', g.zodiac])
  if (g.canggan) rows.push(['藏干', g.canggan])
  if (g.body) rows.push(['对应脏腑', g.body])
  rows.push(['旺相', g.wangxiu])

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Breadcrumb items={[{ label: '九宫文库', href: '/wenku' }, { label: '干支百科', href: '/wenku/ganzhi' }, { label: g.id }]} />

      <div className="rounded-2xl border border-gold-200/70 dark:border-gold-500/25 bg-white/85 dark:bg-[#13161c]/85 p-6 mb-5 flex items-center gap-6 flex-wrap">
        <div className="text-6xl font-serif text-gray-800 dark:text-gray-100">{g.id}</div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50 mb-1">{g.id} · {g.kind === 'tian' ? '天干' : '地支'}</h1>
          <p className="text-sm text-gray-500">{g.meaning}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mb-5">
        {rows.map(([k, v]) => (
          <div key={k} className="rounded-xl border border-gray-200/80 dark:border-gray-700/60 bg-white/85 dark:bg-[#13161c]/85 p-3">
            <div className="text-[10px] text-gray-400">{k}</div>
            <div className="text-sm font-medium text-gray-700 dark:text-gray-200 mt-0.5">{v}</div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-gray-200/80 dark:border-gray-700/60 bg-white/85 dark:bg-[#13161c]/85 p-5 mb-5">
        <h2 className="text-sm font-bold text-gray-800 dark:text-gray-100 mb-2">🖼️ 万物类象</h2>
        <div className="flex flex-wrap gap-2">
          {g.classImage.map(c => <span key={c} className="text-xs px-2.5 py-1 rounded-full bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300">{c}</span>)}
        </div>
      </div>

      <div className="rounded-xl border border-indigo-200/60 dark:border-indigo-500/25 bg-white/85 dark:bg-[#13161c]/85 p-5">
        <h3 className="text-xs font-bold text-gray-500 mb-2">🔗 关联术数领域</h3>
        <div className="flex flex-wrap gap-2">
          {g.relation.map(r => (
            <Link key={r} href="/glossary" className="text-xs px-3 py-1.5 rounded-lg border border-indigo-200/60 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-500/5">{r}</Link>
          ))}
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          <Link href="/wenku/ganzhi" className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-500 hover:border-gold-300">← 全部干支</Link>
          <Link href="/bazi" className="text-xs px-3 py-1.5 rounded-lg border border-emerald-200/70 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/5">八字排盘</Link>
          <Link href="/huangli" className="text-xs px-3 py-1.5 rounded-lg border border-emerald-200/70 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/5">黄历宜忌</Link>
        </div>
      <JiugongNote title="九宫按">
            本页干支属性（五行·阴阳·方位·藏干·类象）为<b>九宫原创整理</b>——据公版历学与术数原典汇释，是八字、奇门、六壬、择日诸术的公共桥梁知识。引用溯源：九宫文库。
          </JiugongNote>      </div>
    </div>
  )
}
