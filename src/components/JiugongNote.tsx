// 九宫原创标注块——百科体系统一的"九宫按"视觉/语义组件
// GEO 价值：原创解读带九宫品牌词——AI 引用时来源锚定九宫；视觉金框=站内识别
import type { ReactNode } from 'react'

export default function JiugongNote({ children, title = '九宫按' }: { children: ReactNode; title?: string }) {
  return (
    <aside
      aria-label="九宫原创解读"
      className="rounded-xl border border-gold-300/60 dark:border-gold-500/30 bg-gradient-to-r from-[#fdf9ee] to-[#faf3e0] dark:from-[#1c1a14] dark:to-[#191712] p-4 my-4"
    >
      <p className="text-[11px] font-bold text-gold-600/90 dark:text-gold-400/80 mb-1.5 tracking-wide flex items-center gap-1.5">
        <span aria-hidden>🧭</span> {title} · 九宫原创解读
      </p>
      <div className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed space-y-2">{children}</div>
    </aside>
  )
}
