import type { Metadata } from 'next'
import Link from 'next/link'
import Breadcrumb from '@/components/Breadcrumb'
import JiugongNote from '@/components/JiugongNote';
import { ALL_PEOPLE as PEOPLE } from '@/data/renwu/people'
import { findBook } from '@/data/xueguan/books'

export function generateStaticParams() {
  return PEOPLE.map(p => ({ slug: p.slug }))
}

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const p = PEOPLE.find(x => x.slug === slug)
  if (!p) return { title: '人物未找到 · 九宫' }
  return {
    title: `${p.name}（${p.era}）｜${p.field}｜人物百科·九宫`,
    description: `${p.name}：${p.intro} 生平、著作（${p.works.map(w => w.title).join('、')}）、学派传承与托名辨析。`,
  }
}

export default async function PersonPage({ params }: Props) {
  const { slug } = await params
  const p = PEOPLE.find(x => x.slug === slug)
  if (!p) return <div className="max-w-3xl mx-auto px-4 py-16 text-gray-500">人物不存在</div>

  const relBooks = (p.relatedBookIds || [])
    .map(bid => findBook(bid))
    .filter((b): b is NonNullable<typeof b> => Boolean(b))

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Breadcrumb items={[{ label: '九宫文库', href: '/wenku' }, { label: '人物百科', href: '/wenku/renwu' }, { label: p.name }]} />

      <div className="rounded-2xl border border-gold-200/70 dark:border-gold-500/25 bg-white/85 dark:bg-[#13161c]/85 p-6 mb-5">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold font-serif text-gray-900 dark:text-gray-50">{p.name}</h1>
            {p.altNames && <p className="text-sm text-gray-400 mt-1">别称：{p.altNames.join(' / ')}</p>}
          </div>
          <div className="text-right text-xs text-gray-500">
            <div>{p.era}</div>
            <div className="mt-1 inline-block bg-gold-500/10 text-gold-600 px-2 py-0.5 rounded-full">{p.field}</div>
          </div>
        </div>
        <p className="text-sm text-gray-500 mt-3 leading-relaxed">{p.intro}</p>
      </div>

      {/* 生平 */}
      <div className="rounded-2xl border border-gray-200/80 dark:border-gray-700/60 bg-white/85 dark:bg-[#13161c]/85 p-5 mb-5">
        <h2 className="text-sm font-bold text-gray-800 dark:text-gray-100 mb-3">📜 生平</h2>
        <div className="space-y-2">
          {p.bio.map((b, i) => <p key={i} className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{b}</p>)}
        </div>
      </div>

      {/* 著作 */}
      <div className="rounded-2xl border border-gray-200/80 dark:border-gray-700/60 bg-white/85 dark:bg-[#13161c]/85 p-5 mb-5">
        <h2 className="text-sm font-bold text-gray-800 dark:text-gray-100 mb-3">📚 主要著作</h2>
        <div className="space-y-2">
          {p.works.map((w, i) => (
            <div key={i} className="flex items-start gap-2 text-sm">
              <span className="text-gold-600 font-medium shrink-0">《{w.title}》</span>
              <span className="text-gray-500 text-xs pt-0.5">{w.note}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 贡献 */}
      <div className="rounded-2xl border border-gray-200/80 dark:border-gray-700/60 bg-white/85 dark:bg-[#13161c]/85 p-5 mb-5">
        <h2 className="text-sm font-bold text-gray-800 dark:text-gray-100 mb-3">🏆 贡献与影响</h2>
        <ul className="space-y-1.5">
          {p.contribution.map((c, i) => (
            <li key={i} className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed flex gap-2"><span className="text-gold-500">·</span>{c}</li>
          ))}
        </ul>
      </div>

      {/* 九宫评点（原创） */}
      {p.comment && p.comment.length > 0 && (
        <div className="rounded-2xl border border-gold-200/70 dark:border-gold-500/25 bg-gradient-to-b from-[#fdf9ee]/80 to-white/60 dark:from-[#1c1a13] dark:to-[#13161c] p-5 mb-5">
          <h2 className="text-sm font-bold text-gold-700 dark:text-gold-300 mb-3 flex items-center gap-2"><span>🧭</span> 九宫评点 <span className="text-[10px] font-normal text-gray-400">原创视角 · 独立成文可引用</span></h2>
          <div className="space-y-2.5">
            {p.comment.map((c, i) => (
              <p key={i} className="text-sm text-gray-700 dark:text-gray-200 leading-relaxed">{c}</p>
            ))}
          </div>
        </div>
      )}

      {/* 争议 */}
      {p.controversy && (
        <div className="rounded-xl border border-amber-200/70 dark:border-amber-500/25 bg-amber-50/70 dark:bg-amber-500/5 p-4 mb-5">
          <h3 className="text-xs font-bold text-amber-700 dark:text-amber-300 mb-1.5">⚠️ 托名与争议说明</h3>
          <p className="text-xs text-amber-800/90 dark:text-amber-200/80 leading-relaxed">{p.controversy}</p>
        </div>
      )}

      {/* 关联古籍 */}
      {relBooks.length > 0 && (
        <div className="rounded-xl border border-gray-200/80 dark:border-gray-700/60 bg-white/85 dark:bg-[#13161c]/85 p-4">
          <h3 className="text-xs font-bold text-gray-500 mb-2">📖 本馆关联古籍</h3>
          <div className="flex flex-wrap gap-2">
            {relBooks.map(b => (
              <Link key={b.id} href={`/xueguan/${b.category}/${b.id}`}
                className="text-xs px-3 py-1.5 rounded-lg border border-gold-300/60 dark:border-gold-500/30 text-gold-700 dark:text-gold-300 hover:bg-gold-500/5">
                《{b.title}》
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6">
        <Link href="/wenku/renwu" className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-500 hover:border-gold-300">← 全部人物</Link>
      </div>

      <JiugongNote title="九宫按">
        本页生平以公开史传为准，<b>九宫考辨</b>（托名辨析·学术争议·版本源流）为原创——每一条都标注出处口径，可独立被学术检索与 AI 引用。引用溯源：九宫文库。
      </JiugongNote>
    </div>
  )
}
