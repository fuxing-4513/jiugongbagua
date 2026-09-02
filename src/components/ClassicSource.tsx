'use client'

import { useState } from 'react'

/**
 * 古籍依据引用组件（透明推理）
 * 在结论区展示"依据某部古籍"，点击展开原文片段，并链接到易学书馆全书
 */
export default function ClassicSource({
  book,        // 书名，如《滴天髓》
  section,     // 章节/卷目，如「论天干」
  quote,       // 原文片段（可为空 → 只显示书名导航）
  link,        // 易学书馆阅读链接（可选）
  compact,     // 紧凑模式（仅小标签行）
}: {
  book: string
  section?: string
  quote?: string
  link?: string
  compact?: boolean
}) {
  const [open, setOpen] = useState(false)
  const full = `${book}${section ? `·${section}` : ''}`

  if (compact) {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200/60">
        📜 {full}
      </span>
    )
  }

  return (
    <div className="mt-2 rounded-lg border border-amber-200/40 bg-amber-50/40 overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-3 py-1.5 text-[11px] text-amber-700 hover:bg-amber-50 transition-colors"
      >
        <span>📜 古籍依据：{full}</span>
        <span className="text-amber-500">{open ? '收起 ▲' : '展开原文 ▼'}</span>
      </button>
      {open && quote && (
        <div className="px-3 pb-2.5">
          <p className="text-[11px] leading-relaxed text-stone-600 font-serif whitespace-pre-wrap">
            {quote}
          </p>
          {link && (
            <a href={link} target="_blank" rel="noreferrer"
              className="inline-block mt-1.5 text-[10px] text-amber-600 hover:text-amber-800 underline">
              在易学书馆阅读《{book}》全文 →
            </a>
          )}
        </div>
      )}
    </div>
  )
}
