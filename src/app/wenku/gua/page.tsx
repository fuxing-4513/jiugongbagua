import type { Metadata } from 'next'
import Link from 'next/link'
import { getHexagrams, TRIGRAM_INFO } from '@/lib/hexagram-data'

export const metadata: Metadata = {
  title: '六十四卦 · 卦象百科 · 九宫',
  description: '周易六十四卦全解：每卦含卦画、卦辞爻辞原文、白话译文与九宫导读——乾、坤、屯、蒙…逐一详解。',
}

export default function GuaIndexPage() {
  const guas = getHexagrams()
  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-center font-serif text-gray-800 dark:text-gray-100 mb-3">☰ 六十四卦 · 卦象百科</h1>
      <p className="text-center text-sm text-gray-500 mb-8">每卦含卦画、原文、白话与导读——点击卦名进入详解页</p>
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2.5">
        {guas.map(g => (
          <Link key={g.slug} href={`/wenku/gua/${g.slug}`}
            className="rounded-xl border border-gray-200/80 dark:border-gray-700/60 bg-white/85 dark:bg-[#13161c]/85 p-3 text-center hover:border-gold-400 dark:hover:border-gold-500/60 transition-colors group">
            <div className="text-[10px] text-gray-400">{g.seq}</div>
            {g.figSrc ? (
              <img src={g.figSrc} alt={`${g.name}卦象`} className="w-14 h-auto mx-auto my-1" loading="lazy" />
            ) : (
              <div className="text-2xl my-2">{g.upper}{TRIGRAM_INFO[g.upper]?.symbol}{g.lower}{TRIGRAM_INFO[g.lower]?.symbol}</div>
            )}
            <div className="text-sm font-medium text-gray-700 dark:text-gray-200 group-hover:text-gold-600 transition-colors">{g.shortName}</div>
            <div className="text-[10px] text-gray-400 truncate">{g.name}</div>
          </Link>
        ))}
      </div>
      <p className="text-center text-xs text-gray-400 mt-8">八卦五行：乾兑金 · 震巽木 · 坎水 · 离火 · 艮坤土 —— 卦象为研究原始数据，本站按传统图式绘制</p>
    </div>
  )
}
