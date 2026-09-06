import type { Metadata } from 'next'
import Link from 'next/link'
import Breadcrumb from '@/components/Breadcrumb'
import { getHexagrams, getGuaBySlug, TRIGRAM_INFO } from '@/lib/hexagram-data'
import GuaDeepView from '@/components/GuaDeepView'
import { getGuaDeepById } from '@/data/gua/deep'

export function generateStaticParams() {
  return getHexagrams().map(g => ({ slug: g.slug }))
}

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const g = getGuaBySlug(slug)
  if (!g) return { title: '卦象未找到 · 九宫' }
  return {
    title: `${g.name}卦（第${g.seq}卦）详解｜卦辞爻辞原文与白话｜九宫`,
    description: `${g.name}（第${g.seq}卦，上${g.upper}下${g.lower}）：卦辞爻辞原文、白话译文、彖象传与九宫导读——${(g.guaci || '').slice(0, 30)}`,
  }
}

export default async function GuaPage({ params }: Props) {
  const { slug } = await params
  const g = getGuaBySlug(slug)
  if (!g) return <div className="max-w-3xl mx-auto px-4 py-16 text-gray-500">卦象不存在</div>
  const up = TRIGRAM_INFO[g.upper]
  const low = TRIGRAM_INFO[g.lower]
  const all = getHexagrams()

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Breadcrumb items={[{ label: '卦象百科', href: '/gua' }, { label: `${g.name}卦` }]} />

      {/* 标题 + 卦画 */}
      <div className="rounded-2xl border border-gold-200/70 dark:border-gold-500/25 bg-white/85 dark:bg-[#13161c]/85 p-6 mb-5 flex gap-6 items-center flex-wrap">
        {g.figSrc && <img src={g.figSrc} alt={`${g.name}卦象`} className="w-28 h-auto" />}
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-bold font-serif text-gray-900 dark:text-gray-50">{g.name}卦</h1>
            <span className="text-xs bg-gold-500/10 text-gold-600 px-2 py-0.5 rounded-full">第 {g.seq} 卦</span>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            {g.upper}{up?.symbol} {up?.nature}（上·{g.upper}） · {g.lower}{low?.symbol} {low?.nature}（下·{g.lower}）
          </p>
          <div className="flex flex-wrap gap-1.5 mt-3 text-[11px]">
            <span className="px-2 py-0.5 rounded bg-gray-50 dark:bg-gray-800 text-gray-500">上卦五行：{up?.wuxing}</span>
            <span className="px-2 py-0.5 rounded bg-gray-50 dark:bg-gray-800 text-gray-500">下卦五行：{low?.wuxing}</span>
            <span className="px-2 py-0.5 rounded bg-gray-50 dark:bg-gray-800 text-gray-500">上卦方位（后天）：{up?.houtian}</span>
            <span className="px-2 py-0.5 rounded bg-gray-50 dark:bg-gray-800 text-gray-500">下卦方位（后天）：{low?.houtian}</span>
          </div>
        </div>
      </div>

      {/* 卦辞爻辞原文 */}
      <div className="rounded-2xl border border-gray-200/80 dark:border-gray-700/60 bg-white/85 dark:bg-[#13161c]/85 p-5 mb-5">
        <h2 className="text-sm font-bold text-gray-800 dark:text-gray-100 mb-3">📜 原文</h2>
        <div className="prose prose-sm max-w-none text-gray-700 dark:text-gray-200 leading-loose whitespace-pre-line font-serif text-[15px]">{g.content}</div>
      </div>

      {/* 白话 */}
      {g.vernacular && (
        <div className="rounded-2xl border border-gold-200/70 dark:border-gold-500/25 bg-[#fdfbf5] dark:bg-[#16181e] p-5 mb-5">
          <h2 className="text-sm font-bold text-gray-800 dark:text-gray-100 mb-3">🗣️ 白话译文</h2>
          <div className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-line">{g.vernacular}</div>
        </div>
      )}

      {/* 九宫按 */}
      {g.notes && (
        <div className="rounded-xl border border-indigo-200/60 dark:border-indigo-500/25 bg-white/85 dark:bg-[#13161c]/85 p-5 mb-5">
          <h2 className="text-xs font-bold text-gray-500 mb-2">📝 九宫按</h2>
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{g.notes}</p>
        </div>
      )}

      {/* 关联 */}
      <div className="flex flex-wrap gap-2 items-center">
        <Link href="/xueguan/bushi-yijing/zhouyi" className="text-xs px-3 py-1.5 rounded-lg border border-gold-300/60 dark:border-gold-500/30 text-gold-700 dark:text-gold-300 hover:bg-gold-500/5">《周易》全文</Link>
        <Link href="/wenku/gua" className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-500 hover:border-gold-300">← 全部六十四卦</Link>
        {g.seq > 1 && (
          <Link href={`/wenku/gua/${all[g.seq - 2].slug}`} className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-500 hover:border-gold-300">↑ 上一卦：{all[g.seq - 2].name}</Link>
        )}
        {g.seq < 64 && (
          <Link href={`/wenku/gua/${all[g.seq].slug}`} className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-500 hover:border-gold-300">↓ 下一卦：{all[g.seq].name}</Link>
        )}
      </div>

      {/* 深度分析（九宫原创——穷通宝鉴级详解） */}
      {getGuaDeepById(g.slug) && (
        <div className="mt-8">
          <div className="flex items-center gap-2 mb-3">
            <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">📖 {g.name} 深度分析</h2>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-gold-500/10 text-gold-600 dark:text-gold-300">九宫原创 · 卦德/爻精/错综/应用/现代启示</span>
          </div>
          <GuaDeepView d={getGuaDeepById(g.slug)!} />
        </div>
      )}
    </div>
  )
}
