import type { Metadata } from 'next'
import Link from 'next/link'
import WenkuSearch from '@/components/WenkuSearch'

export const metadata: Metadata = {
  title: '九宫文库 · 知识中心 · 九宫',
  description: '九宫文库：卦象百科、人物百科、术语百科与传统术数知识体系——系统化的易学知识图谱。',
}

const SECTIONS = [
  {
    href: '/wenku/gua',
    emoji: '☰',
    title: '卦象百科',
    desc: '六十四卦逐卦详解——卦画、卦辞爻辞原文、白话译文与九宫导读',
    tag: '已完成 · 64 卦',
    tagColor: 'text-emerald-600 dark:text-emerald-300 bg-emerald-500/10',
  },
  {
    href: '/wenku/renwu',
    emoji: '👤',
    title: '人物百科',
    desc: '徐子平、万民英、刘伯温、邵雍…术数史上关键人物的生平、著作与学派',
    tag: '已完成 · 133 位',
    tagColor: 'text-emerald-600 dark:text-emerald-300 bg-emerald-500/10',
  },
  {
    href: '/glossary',
    emoji: '📖',
    title: '术语百科',
    desc: '十神、格局、用神、神煞…传统术数核心术语的系统释义',
    tag: '已完成 · 1000+ 词',
    tagColor: 'text-emerald-600 dark:text-emerald-300 bg-emerald-500/10',
  },
  {
    href: '/wenku/ganzhi',
    emoji: '🌳',
    title: '干支百科',
    desc: '十天干、十二地支、六十甲子的五行属性与术数应用——八字/择日/奇门的桥梁',
    tag: '已完成 · 22',
    tagColor: 'text-emerald-600 dark:text-emerald-300 bg-emerald-500/10',
  },
]

export default function WenkuPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 font-serif mb-3">📚 九宫文库</h1>
        <p className="text-sm text-gray-500 max-w-2xl mx-auto leading-relaxed">
          传统术数<strong>知识体系</strong>——卦象、人物、术语、干支的系统化百科，
          每一篇都基于古籍原典，白话解读，可溯源。
        </p>
      </div>

      {/* 文库全库搜索（标题下方） */}
      <div className="mb-8">
        <WenkuSearch />
      </div>

      {/* 知识体系区 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
        {SECTIONS.map(s => (
          <Link key={s.href} href={s.href}
            className="rounded-2xl border border-gray-200/80 dark:border-gray-700/60 bg-white/85 dark:bg-[#13161c]/85 p-5 hover:border-gold-400 dark:hover:border-gold-500/60 transition-colors group">
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">{s.emoji}</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full ${s.tagColor}`}>{s.tag}</span>
            </div>
            <h2 className="font-bold text-gray-800 dark:text-gray-100 group-hover:text-gold-600 transition-colors mb-1.5">{s.title}</h2>
            <p className="text-xs text-gray-500 leading-relaxed">{s.desc}</p>
          </Link>
        ))}
      </div>

      {/* 自创文章区（用户原创——占位） */}
      <div className="rounded-2xl border border-dashed border-gray-300/70 dark:border-gray-600/50 p-8 text-center">
        <div className="text-3xl mb-3">✍️</div>
        <h2 className="font-bold text-gray-700 dark:text-gray-200 mb-2">原创文章</h2>
        <p className="text-sm text-gray-400 max-w-md mx-auto leading-relaxed">
          九宫文库的原创文章即将上线——每一篇都将基于完整的命理推理逻辑，
          有深度、有观点、有可读性。
        </p>
      </div>
    </div>
  )
}
