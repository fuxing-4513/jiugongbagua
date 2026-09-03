'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { api, type ChartItem, type User } from '@/lib/api'
import Breadcrumb from '@/components/Breadcrumb'

const TYPE_NAMES: Record<string, string> = { bazi: '八字', ziwei: '紫微', app: '综合排盘' }

export default function MyChartsClient() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [checked, setChecked] = useState(false)
  const [charts, setCharts] = useState<ChartItem[]>([])
  const [copied, setCopied] = useState<string>('')
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState('')

  useEffect(() => {
    api.me().then(async r => {
      setUser(r.ok ? r.user || null : null)
      setChecked(true)
      if (!r.ok) return
      // 登录后自动补保存（排盘页点保存→登录→回到这里完成保存）
      try {
        const pending = localStorage.getItem('jg-pending-save')
        if (pending) {
          const p = JSON.parse(pending)
          const res = await api.saveChart(p.chartType, p.title || '', p.summary)
          localStorage.removeItem('jg-pending-save')
          setNotice(`已自动保存你的${p.chartType === 'bazi' ? '八字' : p.chartType === 'ziwei' ? '紫微' : '综合'}命盘（编号 ${res.id}）`)
        }
      } catch {}
      return api.listCharts().then(l => setCharts(l.charts)).catch(() => {})
    }).catch(() => { setChecked(true) })
  }, [])

  async function remove(id: string) {
    if (!confirm('确定删除这条记录吗？')) return
    await api.deleteChart(id).catch(() => {})
    setCharts(charts.filter(c => c.id !== id))
  }

  async function copySummary(c: ChartItem) {
    setBusy(true)
    try {
      const r = await api.share(c.id)
      const text = `【九宫命盘 · ${TYPE_NAMES[c.chart_type] || c.chart_type}】${c.title ? '（' + c.title + '）' : ''}\n${r.chart.summary}\n—— 来自 jiugongbagua.com`
      await navigator.clipboard.writeText(text)
      setCopied(c.id)
      setTimeout(() => setCopied(''), 2500)
    } catch { alert('复制失败，请重试') }
    setBusy(false)
  }

  if (!checked) return <div className="min-h-[40vh] flex items-center justify-center text-sm text-gray-400">加载中…</div>

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <div className="text-4xl mb-4">🔐</div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-50 mb-2">登录后查看你的命盘</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">排盘记录云端保存，换设备也能找回</p>
        <Link href="/login?next=/mycharts" className="jg-btn-primary inline-block">去登录 / 注册</Link>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <Breadcrumb items={[{ label: '首页', href: '/' }, { label: '我的命盘' }]} />
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">📁 我的命盘</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{user.email} · 共 {charts.length} 条记录</p>
        </div>
        <button
          onClick={async () => { await api.logout().catch(() => {}); router.push('/') }}
          className="text-xs text-gray-400 hover:text-red-500 transition-colors"
        >退出登录</button>
      </div>

      {notice && (
        <p className="mb-4 text-xs text-emerald-600 dark:text-emerald-300 bg-emerald-500/10 border border-emerald-400/30 rounded-lg px-3 py-2">
          ✅ {notice}
        </p>
      )}

      {charts.length === 0 ? (
        <div className="jg-card-plain p-10 text-center">
          <p className="text-3xl mb-3">🈳</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">还没有保存任何排盘</p>
          <p className="text-[11px] text-gray-400 dark:text-gray-500 mb-5">排盘结果页点「保存到我的命盘」即可留存</p>
          <div className="flex justify-center gap-3">
            <Link href="/bazi" className="jg-btn-primary">去排八字</Link>
            <Link href="/ziwei" className="jg-btn">排紫微</Link>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {charts.map(c => (
            <div key={c.id} className="jg-card p-4 flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-violet-500/10 text-violet-500 dark:text-violet-300 border border-violet-400/20">
                    {TYPE_NAMES[c.chart_type] || c.chart_type}
                  </span>
                  <span className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">
                    {c.title || '未命名命盘'}
                  </span>
                </div>
                <p className="text-[10px] text-gray-400 dark:text-gray-500">
                  编号 {c.id} · {new Date(c.created_at).toLocaleDateString('zh-CN')}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => copySummary(c)}
                  disabled={busy}
                  className="text-xs px-3 py-1.5 rounded-lg border border-violet-400/30 text-violet-600 dark:text-violet-300 hover:bg-violet-500/10 transition-colors"
                >
                  {copied === c.id ? '✓ 已复制' : '复制摘要发顾问'}
                </button>
                <button
                  onClick={() => remove(c.id)}
                  className="text-xs px-2.5 py-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:border-red-300 border border-transparent transition-colors"
                >
                  删除
                </button>
              </div>
            </div>
          ))}
          <p className="text-[10px] text-gray-400 dark:text-gray-500 text-center pt-2 leading-relaxed">
            「复制摘要发顾问」：把命盘摘要发给微信里的顾问老师，即可基于你的盘做深度解读
          </p>
        </div>
      )}
    </div>
  )
}
