import type { Metadata } from 'next'
import Link from 'next/link'
import Breadcrumb from '@/components/Breadcrumb'
import JiugongNote from '@/components/JiugongNote'
import { ALL_NAYIN, ELEMENT_COLOR } from '@/data/ganzhi/nayin-index'

export async function generateStaticParams() {
  return ALL_NAYIN.map(n => ({ id: n.id }))
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const n = ALL_NAYIN.find(x => x.id === id)
  if (!n) return { title: '纳音未找到 · 九宫' }
  return {
    title: `${n.nayin}（${n.ganzhi}）详解｜六十甲子纳音·九宫`,
    description: `${n.nayin}（${n.ganzhi}）：纳音五行属${n.element}——意象、禀性、传统命理断语。九宫原创整理。`,
  }
}

export default async function NayinDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const n = ALL_NAYIN.find(x => x.id === id)
  if (!n) return <div className="max-w-3xl mx-auto px-4 py-16 text-gray-500">纳音不存在</div>
  const idx = ALL_NAYIN.indexOf(n)
  const prev = idx > 0 ? ALL_NAYIN[idx - 1] : null
  const next = idx < ALL_NAYIN.length - 1 ? ALL_NAYIN[idx + 1] : null

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Breadcrumb items={[{ label: '九宫文库', href: '/wenku' }, { label: '干支百科', href: '/wenku/ganzhi' }, { label: '六十甲子纳音', href: '/wenku/ganzhi/nayin' }, { label: n.nayin }]} />

      <div className="rounded-2xl border border-gold-200/70 dark:border-gold-500/25 bg-white/85 dark:bg-[#171614]/85 p-6 mb-5 flex items-center gap-5 flex-wrap">
        <div className="text-4xl">{n.element === '金' ? '🥇' : n.element === '木' ? '🌳' : n.element === '水' ? '💧' : n.element === '火' ? '🔥' : '⛰️'}</div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500">{n.ganzhi}</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full ${ELEMENT_COLOR[n.element]}`}>纳音属{n.element}</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-gold-500/10 text-gold-600">第 {idx + 1} / 30 组</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">{n.nayin}</h1>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200/80 dark:border-gray-700/60 bg-white/85 dark:bg-[#171614]/85 p-6 mb-5">
        <p className="text-sm text-gray-700 dark:text-gray-200 leading-loose whitespace-pre-line">{n.desc}</p>
      </div>

      <div className="flex justify-between items-center gap-3 mb-6">
        {prev ? <Link href={`/wenku/ganzhi/nayin/${prev.id}`} className="text-xs px-3 py-2 rounded-lg border border-gray-200 text-gray-500 hover:border-gold-300">← {prev.ganzhi} {prev.nayin}</Link> : <span />}
        {next ? <Link href={`/wenku/ganzhi/nayin/${next.id}`} className="text-xs px-3 py-2 rounded-lg border border-gray-200 text-gray-500 hover:border-gold-300">{next.ganzhi} {next.nayin} →</Link> : <span />}
      </div>

      <div className="flex gap-2 mb-6">
        <Link href="/wenku/ganzhi/nayin" className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-500 hover:border-gold-300">← 全部纳音</Link>
        <Link href="/wenku/ganzhi" className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-500 hover:border-gold-300">干支百科</Link>
      </div>

      <JiugongNote title="九宫按">
        本条为<b>九宫原创整理</b>——纳音意象与传统断语据公版命理通说汇释，不伪托书名；纳音主年命基调与禀性意象，在八字中为辅参（日主旺衰仍以正五行论）。引用溯源：九宫文库。
      </JiugongNote>
    </div>
  )
}
