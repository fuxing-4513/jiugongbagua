import type { Metadata } from 'next'
import Link from 'next/link'
import Breadcrumb from '@/components/Breadcrumb'
import JiugongNote from '@/components/JiugongNote'
import { getRelById, ALL_RELS } from '@/data/ganzhi/rel-index'
import { REL_TYPE_META } from '@/data/ganzhi/rel-schema'

export async function generateStaticParams() {
  return ALL_RELS.map(r => ({ slug: encodeURIComponent(r.id) }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const r = getRelById(decodeURIComponent(slug))
  if (!r) return { title: '关系未找到 · 九宫' }
  const meta = REL_TYPE_META[r.type]
  return {
    title: `${r.title}详解｜${meta.name}｜干支百科·九宫`,
    description: `${r.title}（${r.members.join('、')}）：合化条件、意象含义、命理解析${r.wuxing ? `——合化${r.wuxing}` : ''}。九宫原创整理，据公版命理典籍。`,
  }
}

export default async function RelDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const r = getRelById(decodeURIComponent(slug))
  if (!r) return <div className="max-w-3xl mx-auto px-4 py-16 text-gray-500">关系条目不存在</div>
  const meta = REL_TYPE_META[r.type]

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Breadcrumb items={[{ label: '九宫文库', href: '/wenku' }, { label: '干支百科', href: '/wenku/ganzhi' }, { label: '干支关系', href: '/wenku/ganzhi/rel' }, { label: r.title }]} />

      <div className="rounded-2xl border border-gold-200/70 dark:border-gold-500/25 bg-white/85 dark:bg-[#13161c]/85 p-6 mb-5">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl">{meta.emoji}</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-gold-500/10 text-gold-600 dark:text-gold-300">{meta.name}</span>
          {r.wuxing && <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600">合化{r.wuxing}</span>}
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50 mb-1">
          {r.title}
          <span className="text-base font-normal text-gray-400 ml-2">（{r.members.join(' + ')}）</span>
        </h1>
        <div className="flex flex-wrap gap-1.5 mt-2">
          {r.tags.map((t, i) => <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">{t}</span>)}
        </div>
      </div>

      <div className="space-y-4 mb-5">
        <Block title={`🧭 合化/触发条件`} text={r.condition} />
        <Block title={`💡 意象含义`} text={r.meaning} />
        <Block title={`🔍 命理解析`} text={r.jiexi} />
        {r.example && <Block title={`📜 口诀/依据`} text={r.example} gold />}
      </div>

      {r.related && r.related.length > 0 && (
        <div className="rounded-xl border border-gray-200/80 dark:border-gray-700/60 bg-white/85 dark:bg-[#13161c]/85 p-4 mb-5">
          <p className="text-xs font-bold text-gray-500 mb-2">🔗 相关关系</p>
          <div className="flex flex-wrap gap-2">
            {r.related.map(rel => {
              const target = getRelById(rel)
              if (!target) return <span key={rel} className="text-xs px-3 py-1.5 rounded-lg bg-gray-50 text-gray-400">{rel}</span>
              return <Link key={rel} href={`/wenku/ganzhi/rel/${encodeURIComponent(target.id)}`} className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:border-gold-300 dark:text-gray-300">{target.title}</Link>
            })}
          </div>
        </div>
      )}

      <div className="flex gap-2 mb-6">
        <Link href="/wenku/ganzhi/rel" className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-500 hover:border-gold-300">← 全部干支关系</Link>
        <Link href="/wenku/ganzhi" className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-500 hover:border-gold-300">干支百科</Link>
      </div>

      <JiugongNote title="九宫按">
        本条为<b>九宫原创整理</b>——合化条件与断语据公版命理典籍（《滴天髓》《三命通会》《子平真诠》等）汇释；出处不确定处一律标注"传统命理认为"，不引伪典。引用溯源：九宫文库。
      </JiugongNote>
    </div>
  )
}

function Block({ icon, title, text, gold }: { icon?: string; title: string; text: string; gold?: boolean }) {
  return (
    <div className={`rounded-2xl border p-5 bg-white/85 dark:bg-[#13161c]/85 ${gold ? 'border-gold-200/70 dark:border-gold-500/25' : 'border-gray-200/80 dark:border-gray-700/60'}`}>
      <h2 className="text-sm font-bold text-gray-700 dark:text-gray-200 mb-2">{title}</h2>
      <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-line">{text}</p>
    </div>
  )
}
