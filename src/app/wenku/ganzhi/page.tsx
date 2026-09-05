import type { Metadata } from 'next'
import Link from 'next/link'
import { TIAN_GAN, DI_ZHI } from '@/data/ganzhi/ganzhi'

export const metadata: Metadata = {
  title: '干支百科 · 十天干十二地支 · 九宫文库',
  description: '十天干（甲乙丙丁戊己庚辛壬癸）与十二地支（子丑寅卯辰巳午未申酉戌亥）的五行阴阳、方位季节、类象与术数应用。',
}

const WUXING_COLOR: Record<string, string> = { '木': 'text-emerald-600', '火': 'text-rose-500', '土': 'text-amber-600', '金': 'text-yellow-600', '水': 'text-blue-600' }

export default function GanzhiPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 font-serif mb-3">🌳 干支百科</h1>
        <p className="text-sm text-gray-500">十天干 · 十二地支——八字、择日、奇门、六壬共通的桥梁知识</p>
      </div>

      <h2 className="text-sm font-bold text-gray-600 dark:text-gray-300 mb-3">☀️ 十天干</h2>
      <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 mb-8">
        {TIAN_GAN.map(g => (
          <Link key={g.id} href={`/wenku/ganzhi/${encodeURIComponent(g.id)}`}
            className="rounded-xl border border-gray-200/80 dark:border-gray-700/60 bg-white/85 dark:bg-[#13161c]/85 p-3 text-center hover:border-gold-400 transition-colors group">
            <div className="text-2xl font-serif text-gray-800 dark:text-gray-100 group-hover:text-gold-600">{g.id}</div>
            <div className={`text-xs mt-1 ${WUXING_COLOR[g.wuxing]}`}>{g.wuxing} · {g.yinyang}</div>
          </Link>
        ))}
      </div>

      <h2 className="text-sm font-bold text-gray-600 dark:text-gray-300 mb-3">🌙 十二地支</h2>
      <div className="grid grid-cols-6 sm:grid-cols-12 gap-2 mb-8">
        {DI_ZHI.map(g => (
          <Link key={g.id} href={`/wenku/ganzhi/${encodeURIComponent(g.id)}`}
            className="rounded-xl border border-gray-200/80 dark:border-gray-700/60 bg-white/85 dark:bg-[#13161c]/85 p-3 text-center hover:border-gold-400 transition-colors group">
            <div className="text-2xl font-serif text-gray-800 dark:text-gray-100 group-hover:text-gold-600">{g.id}</div>
            <div className="text-[10px] mt-1 text-gray-400">{g.zodiac}</div>
            <div className={`text-[10px] ${WUXING_COLOR[g.wuxing]}`}>{g.wuxing}</div>
          </Link>
        ))}
      </div>
      <p className="text-center text-[11px] text-gray-400">六十甲子 = 天干 × 地支 阴阳相配循环（甲子乙丑…癸亥）——点击查看每个干支的完整属性</p>
    </div>
  )
}
