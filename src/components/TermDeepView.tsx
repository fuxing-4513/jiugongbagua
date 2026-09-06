// 术语深度渲染（TermDeep——源流/经典原文/实战断语/辨析——四节）
export interface TermDeep {
  slug: string
  yuanliu: string       // 源流（概念出处/体系演变——据实）
  jingdian: string      // 经典原文印证（真实原文——无则注"散见诸命书"）
  shizhan: string[]     // 实战断语（传统命理断语——冠"传统命理认为"）
  bianxi: string[]      // 辨析（易混淆概念区分）
}

export default function TermDeepView({ d }: { d: TermDeep }) {
  return (
    <div className="space-y-3.5 mt-4">
      <div className="rounded-xl border border-gold-200/60 dark:border-gold-500/20 bg-gradient-to-r from-[#fdf9ee]/70 to-transparent dark:from-[#1c1a13] p-4">
        <p className="text-[11px] font-bold text-gold-600 dark:text-gold-400 mb-1.5">📚 源流</p>
        <p className="text-sm text-gray-700 dark:text-gray-200 leading-relaxed">{d.yuanliu}</p>
      </div>
      <div className="rounded-xl border border-indigo-200/50 dark:border-indigo-500/15 p-4">
        <p className="text-[11px] font-bold text-indigo-600 dark:text-indigo-300 mb-1.5">📜 经典印证</p>
        <p className="text-sm text-gray-700 dark:text-gray-200 leading-relaxed font-serif">{d.jingdian}</p>
      </div>
      <div className="rounded-xl border border-emerald-200/50 dark:border-emerald-500/15 p-4">
        <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-300 mb-2">🔍 实战断语</p>
        <ul className="space-y-1.5">{d.shizhan.map((s, i) => <li key={i} className="text-sm text-gray-700 dark:text-gray-200 leading-relaxed flex gap-2"><span className="text-emerald-500 shrink-0">·</span>{s}</li>)}</ul>
      </div>
      <div className="rounded-xl border border-amber-200/50 dark:border-amber-500/15 bg-amber-50/40 dark:bg-amber-500/5 p-4">
        <p className="text-[11px] font-bold text-amber-700 dark:text-amber-300 mb-2">🆚 概念辨析</p>
        <ul className="space-y-1.5">{d.bianxi.map((s, i) => <li key={i} className="text-sm text-gray-700 dark:text-gray-200 leading-relaxed flex gap-2"><span className="text-amber-500 shrink-0">·</span>{s}</li>)}</ul>
      </div>
    </div>
  )
}
