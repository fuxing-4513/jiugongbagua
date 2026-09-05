import type { Metadata } from 'next'
import { DUNHUANG_CATALOG } from '@/data/rare-catalog/dunhuang'
import { SONGYUAN_CATALOG } from '@/data/rare-catalog/songyuan'
import { findBook } from '@/data/xueguan/books'
import Link from 'next/link'
import Breadcrumb from '@/components/Breadcrumb'

const ALL = [...DUNHUANG_CATALOG, ...SONGYUAN_CATALOG]

export function generateStaticParams() {
  return ALL.map(e => ({ id: e.id }))
}

type Props = { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const entry = ALL.find(e => e.id === id)
  if (!entry) return { title: '未找到 · 九宫' }
  return {
    title: `${entry.title} · ${entry.shelfmark.split('（')[0].split('(')[0].trim()} · 珍稀馆藏`,
    description: `${entry.title}（${entry.era}，${entry.institution}藏，${entry.shelfmark}）——馆藏著录、存藏状态、九宫考订与官方入口。`,
  }
}

export default async function EntryPage({ params }: Props) {
  const { id } = await params
  const e = ALL.find(x => x.id === id)
  if (!e) return <div className="max-w-3xl mx-auto px-4 py-16 text-gray-500">条目不存在</div>

  const related = (e.relatedBookIds || [])
    .map(bid => findBook(bid))
    .filter((b): b is NonNullable<typeof b> => Boolean(b))

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Breadcrumb items={[{ label: '珍稀馆藏', href: '/cangku' }, { label: e.title.slice(0, 18) }]} />
      {/* 标题卡 */}
      <div className="rounded-2xl border border-gold-200/70 dark:border-gold-500/25 bg-white/85 dark:bg-[#13161c]/85 p-6 mb-5">
        <div className="flex items-start gap-2 flex-wrap">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50 font-serif">{e.title}</h1>
          {e.isSole && <span className="text-[10px] bg-rose-500/10 text-rose-600 dark:text-rose-300 px-2 py-1 rounded-full">海内外孤本</span>}
          {e.isLost && <span className="text-[10px] bg-amber-500/10 text-amber-600 dark:text-amber-300 px-2 py-1 rounded-full">原书已佚·海外存残</span>}
          {e.hasDigitalImage && <span className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 px-2 py-1 rounded-full">官方高清图已开放</span>}
        </div>
        <p className="text-sm text-gray-500 mt-2">{e.era} · {e.docType} · {e.category}</p>
      </div>

      {/* 馆藏信息 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
        <Info title="馆藏机构" value={`${e.country} · ${e.institution}`} />
        <Info title="馆藏编号" value={e.shelfmark} mono />
        <Info title="完整度" value={e.completeness} />
        <Info title="大陆存藏状态" value={e.cnStatus} />
      </div>

      {/* 考订 */}
      <div className="rounded-2xl border border-gray-200/80 dark:border-gray-700/60 bg-white/85 dark:bg-[#13161c]/85 p-5 mb-5">
        <h2 className="text-sm font-bold text-gray-800 dark:text-gray-100 mb-3">📝 九宫考订</h2>
        <div className="space-y-2">
          {e.kaoding.map((k, i) => (
            <p key={i} className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{k}</p>
          ))}
        </div>
        <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-3">核实日期：{e.verifiedAt}</p>
      </div>

      {/* 录文区（有录文才显示——数据到位即呈现） */}
      {e.luwen && e.luwen.text.length > 0 && (
        <div className="rounded-2xl border border-emerald-200/60 dark:border-emerald-500/25 bg-white/85 dark:bg-[#13161c]/85 p-5 mb-5">
          <h2 className="text-sm font-bold text-gray-800 dark:text-gray-100 mb-1">📜 录文</h2>
          <p className="text-[11px] text-gray-400 mb-3">底本：{e.luwen.source}</p>
          <div className="space-y-3">
            {e.luwen.text.map((t, i) => (
              <p key={i} className="text-sm text-gray-700 dark:text-gray-200 leading-loose whitespace-pre-line font-serif">{t}</p>
            ))}
          </div>
          {e.luwen.notes && <p className="text-[11px] text-gray-400 mt-3">校勘：{e.luwen.notes}</p>}
        </div>
      )}

      {/* 官方入口 + 版权 */}
      {e.officialLink && (
        <div className="rounded-xl border border-sky-200/60 dark:border-sky-500/25 bg-sky-50/60 dark:bg-sky-500/5 p-4 mb-5">
          <p className="text-sm text-sky-800 dark:text-sky-200">
            🔗 官方入口：<a href={e.officialLink} target="_blank" rel="noopener noreferrer" className="underline decoration-dotted hover:text-sky-600">{e.officialLink.replace('https://', '')}</a>
          </p>
          <p className="text-[11px] text-sky-700/70 dark:text-sky-300/60 mt-1.5 leading-relaxed">{e.rightsNote}</p>
        </div>
      )}

      {/* 关联本馆古籍 */}
      {related.length > 0 && (
        <div className="rounded-xl border border-gray-200/80 dark:border-gray-700/60 bg-white/85 dark:bg-[#13161c]/85 p-4">
          <h3 className="text-xs font-bold text-gray-500 mb-2">📚 本馆关联古籍</h3>
          <div className="flex flex-wrap gap-2">
            {related.map(b => (
              <Link key={b.id} href={`/xueguan/${b.category}/${b.id}`}
                className="text-xs px-3 py-1.5 rounded-lg border border-gold-300/60 dark:border-gold-500/30 text-gold-700 dark:text-gold-300 hover:bg-gold-500/5">
                《{b.title}》
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function Info({ title, value, mono }: { title: string; value: string; mono?: boolean }) {
  return (
    <div className="rounded-xl border border-gray-200/80 dark:border-gray-700/60 bg-white/85 dark:bg-[#13161c]/85 p-4">
      <p className="text-[11px] text-gray-400 dark:text-gray-500 mb-1">{title}</p>
      <p className={`text-sm text-gray-700 dark:text-gray-200 leading-relaxed ${mono ? 'font-mono text-[12.5px]' : ''}`}>{value}</p>
    </div>
  )
}
