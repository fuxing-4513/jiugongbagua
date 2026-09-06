import type { Metadata } from 'next'
import { DUNHUANG_CATALOG, DUNHUANG_BATCH2 } from '@/data/rare-catalog/dunhuang'
import { SONGYUAN_CATALOG } from '@/data/rare-catalog/songyuan'
import { DAOIST_CATALOG } from '@/data/rare-catalog/daoist-rare'
import { LOC_CATALOG } from '@/data/rare-catalog/loc-catalog'
import { LOC_BATCH2 } from '@/data/rare-catalog/loc-batch2'
import Link from 'next/link'

export const metadata: Metadata = {
  title: '珍稀馆藏 · 海外玄学古籍著录库 · 九宫',
  description: '九宫珍稀馆藏：敦煌玄学文献（P.2831/P.3507/P.2705 等）与海外宋元易学珍本（宫内厅/美国国会图书馆）——馆藏级著录、来源考订、官方入口——正本清源。',
}

const LIBS = [
  { id: 'dunhuang', name: '敦煌玄学文献著录库', emoji: '🏜️', desc: '法国 BnF Pelliot 与英国 BL Stein 敦煌遗书中的风水、占梦、星占、择日、道经文献——P/S 编号体系著录', count: DUNHUANG_CATALOG.length + DUNHUANG_BATCH2.length, items: [...DUNHUANG_CATALOG, ...DUNHUANG_BATCH2] },
  { id: 'loc', name: '欧美馆藏珍本著录库', emoji: '🗽', desc: '美国国会图书馆中国善本中的易学与丹道要籍——据 LOC 馆藏记录著录（数字资源已开放）', count: LOC_CATALOG.length + LOC_BATCH2.length, items: [...LOC_CATALOG, ...LOC_BATCH2] },
  { id: 'daozang', name: '道藏海外珍本著录库', emoji: '☯️', desc: '海外藏《道藏》全藏与道经珍本——道教文献版本基准（含续拓）', count: DAOIST_CATALOG.length, items: DAOIST_CATALOG },
  { id: 'songyuan', name: '海外宋元易学珍本著录库', emoji: '🏯', desc: '日本宫内厅书陵部宋元版汉籍与欧美馆藏中的易学珍本——版本谱系考订', count: SONGYUAN_CATALOG.length, items: SONGYUAN_CATALOG },
]

export default function CangkuPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gold-600 font-serif mb-3">🏛️ 珍稀馆藏</h1>
        <p className="text-gray-500 text-sm max-w-2xl mx-auto leading-relaxed">
          海外藏中国玄学古籍的<strong>馆藏级著录</strong>——敦煌遗书 · 宋元珍本 · 佚书残卷。
          本站著录每条文献的馆藏机构、编号、版本与存藏状态，附九宫考订与官方入口；图版版权归各馆方，本站仅著录不转载。
        </p>
      </div>

      {LIBS.map(lib => (
        <section key={lib.id} className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">{lib.emoji}</span>
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">{lib.name}</h2>
            <span className="text-xs bg-gold-500/10 text-gold-600 px-2 py-0.5 rounded">{lib.count} 条</span>
          </div>
          <p className="text-sm text-gray-500 mb-4 leading-relaxed">{lib.desc}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {lib.items.map(item => (
              <Link key={item.id} href={`/cangku/${item.id}`}
                className="rounded-xl border border-gray-200/80 dark:border-gray-700/60 bg-white/85 dark:bg-[#171614]/85 p-4 hover:border-gold-400 dark:hover:border-gold-500/60 transition-colors group">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-medium text-gray-800 dark:text-gray-100 group-hover:text-gold-600 transition-colors text-sm leading-snug">{item.title}</p>
                  <span className="shrink-0 text-[10px] px-1.5 py-0.5 rounded bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border border-gray-100 dark:border-gray-700">{item.completeness}</span>
                </div>
                <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                  {item.institution} · <span className="text-gold-600 dark:text-gold-400 font-mono text-[11px]">{item.shelfmark.split('（')[0].split('(')[0].trim()}</span>
                </p>
                <p className="mt-1 text-[11px] text-gray-400">{item.era} · {item.category}</p>
              </Link>
            ))}
          </div>
        </section>
      ))}

      <div className="rounded-xl border border-amber-200/70 dark:border-amber-500/25 bg-amber-50/70 dark:bg-amber-500/5 px-5 py-4 text-xs text-amber-800/90 dark:text-amber-200/80 leading-relaxed">
        📜 <strong>著录口径</strong>：本站采用"海外原藏 / 大陆无同版 / 原书已佚海外存残"等精确表述，凡未经国内联合目录核验者不作"大陆没有"断言；馆藏信息持续复核更新（每条标注核实日期）。
        <span className="block mt-1">本馆中医/民俗类文献（含人神日游等）仅为历史文化研究著录——不构成医疗建议。</span>
      </div>
    </div>
  )
}
