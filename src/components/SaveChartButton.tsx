'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'

/**
 * 保存命盘按钮
 * - 未登录：把摘要暂存 localStorage，跳登录；登录后自动补保存
 * - 已登录：直接保存，提示编号
 */
export default function SaveChartButton({
  chartType,
  summary,
  title,
  compact,
}: {
  chartType: string
  summary: string
  title?: string
  compact?: boolean
}) {
  const router = useRouter()
  const [state, setState] = useState<'idle' | 'busy' | 'saved'>('idle')
  const [savedId, setSavedId] = useState('')

  async function handleSave() {
    setState('busy')
    try {
      const me = await api.me()
      if (!me.ok) {
        // 未登录：暂存摘要 → 跳登录
        try { localStorage.setItem('jg-pending-save', JSON.stringify({ chartType, title: title || '', summary, ts: Date.now() })) } catch {}
        router.push(`/login?next=/mycharts`)
        return
      }
      const r = await api.saveChart(chartType, title || '', summary)
      setSavedId(r.id)
      setState('saved')
    } catch {
      setState('idle')
      alert('保存失败，请稍后重试')
    }
  }

  if (state === 'saved') {
    return (
      <button
        onClick={() => router.push('/mycharts')}
        className={`text-xs px-3 py-2 rounded-lg border border-emerald-400/40 text-emerald-600 dark:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 transition-colors`}
      >
        ✓ 已保存（编号 {savedId}）· 去管理
      </button>
    )
  }

  return (
    <button
      onClick={handleSave}
      disabled={state === 'busy'}
      className={`text-xs px-3 py-2 rounded-lg border border-violet-400/30 text-violet-600 dark:text-violet-300 hover:bg-violet-500/10 transition-colors disabled:opacity-50 ${compact ? '' : ''}`}
    >
      {state === 'busy' ? '保存中…' : '💾 保存到我的命盘'}
    </button>
  )
}
