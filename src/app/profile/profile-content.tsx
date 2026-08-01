'use client'


import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import { getCharts, removeChart } from '@/lib/collections'

// ── 排盘历史类型 ──
interface HistoryEntry {
  id: string
  type: 'bazi' | 'ziwei'
  dateStr: string
  bazi: string
  preview: string
  timestamp: string
}

const HISTORY_KEY = 'jiugong_history'

function getHistory(): HistoryEntry[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(HISTORY_KEY)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

function clearHistory(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(HISTORY_KEY)
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso)
    return d.toLocaleString('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  } catch { return iso }
}

const ROUTE_MAP: Record<string, string> = {
  bazi: '/bazi',
  ziwei: '/ziwei',
  liuyao: '/liuyao',
  qian: '/lingqian',
}

const TABS = [
  { key: 'all', label: '全部', icon: '📋' },
  { key: 'bazi', label: '八字命盘', icon: '📜' },
  { key: 'ziwei', label: '紫微斗数', icon: '⭐' },
  { key: 'liuyao', label: '六爻', icon: '☯' },
  { key: 'qian', label: '签文', icon: '🏮' },
  { key: 'other', label: '其他', icon: '📌' },
]

const HISTORY_TYPE_LABEL: Record<string, string> = {
  bazi: '八字',
  ziwei: '紫微斗数',
}

export default function ProfilePage() {
  const [tab, setTab] = useState('all')
  const [refreshKey, setRefreshKey] = useState(0)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [history, setHistory] = useState<HistoryEntry[]>([])

  useEffect(() => {
    setHistory(getHistory())
  }, [refreshKey])

  const charts = useMemo(() => {
    return tab === 'all' ? getCharts() : getCharts(tab)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, refreshKey])

  const handleDelete = (id: string) => {
    removeChart(id)
    setConfirmDelete(null)
    setRefreshKey(k => k + 1)
  }

  const handleClearHistory = () => {
    clearHistory()
    setShowClearConfirm(false)
    setRefreshKey(k => k + 1)
  }

  const counts = {
    all: getCharts().length,
    bazi: getCharts('bazi').length,
    ziwei: getCharts('ziwei').length,
    liuyao: getCharts('liuyao').length,
    qian: getCharts('qian').length,
    other: getCharts('other').length,
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gold-400 font-serif mb-3">用户中心</h1>

      {/* ═══ 我的排盘历史 ═══ */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gold-300 font-serif">📋 我的排盘</h2>
          {history.length > 0 && (
            <div className="flex items-center gap-2">
              {showClearConfirm ? (
                <div className="flex gap-1.5">
                  <button
                    onClick={handleClearHistory}
                    className="text-xs px-3 min-h-[44px] rounded-lg bg-gold-500/20 text-gold-600 border border-gold-500/50 hover:bg-gold-500/30 transition-colors"
                  >
                    确认清空
                  </button>
                  <button
                    onClick={() => setShowClearConfirm(false)}
                    className="text-xs px-3 min-h-[44px] rounded-lg bg-dark-700 text-gray-400 border border-dark-600 hover:text-gray-200 transition-colors"
                  >
                    取消
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowClearConfirm(true)}
                  className="text-xs px-3 min-h-[44px] rounded-lg bg-dark-700 text-gray-500 border border-dark-600 hover:text-gold-600 hover:border-gold-500/50 transition-colors"
                >
                  清空历史
                </button>
              )}
            </div>
          )}
        </div>

        {history.length === 0 ? (
          <div className="text-center py-12 bg-dark-800/50 rounded-xl border border-dark-600">
            <p className="text-3xl mb-3">📭</p>
            <p className="text-gray-400 mb-1">暂无排盘记录</p>
            <p className="text-xs text-gray-600">排盘后自动保存，方便回看</p>
            <div className="mt-5 flex flex-wrap gap-3 justify-center">
              <Link href="/bazi" className="text-xs bg-gold-600 hover:bg-gold-500 text-dark-900 font-semibold px-4 min-h-[44px] rounded-lg transition-colors inline-flex items-center">
                去排八字 →
              </Link>
              <Link href="/ziwei" className="text-xs bg-dark-700 hover:bg-dark-600 text-gray-300 border border-dark-600 px-4 min-h-[44px] rounded-lg transition-colors inline-flex items-center">
                紫微斗数
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-2.5">
            {history.map((entry) => (
              <Link
                key={entry.id}
                href={ROUTE_MAP[entry.type] || '/bazi'}
                className="block bg-dark-800/50 rounded-xl border border-dark-600 p-4 hover:border-gold-500/30 transition-all group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs px-1.5 py-0.5 rounded bg-dark-700 border border-dark-600 text-gray-400">
                        {HISTORY_TYPE_LABEL[entry.type] || entry.type}
                      </span>
                      <span className="text-xs text-gray-500">{formatDate(entry.timestamp)}</span>
                    </div>
                    <p className="text-sm font-semibold text-gray-200 font-serif group-hover:text-gold-400 transition-colors">
                      {entry.dateStr}
                    </p>
                    <p className="text-xs text-gold-400 font-mono mt-0.5">{entry.bazi}</p>
                    {entry.preview && (
                      <p className="text-[11px] text-gray-500 mt-1.5 truncate">{entry.preview}</p>
                    )}
                  </div>
                  <span className="text-xs text-gold-500/50 group-hover:text-gold-400 self-center ml-3">
                    →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* ═══ 分隔线 ═══ */}
      <div className="w-16 h-px mx-auto bg-dark-500/40 mb-8"></div>

      {/* ═══ 我的收藏 ═══ */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gold-300 font-serif">⭐ 我的收藏</h2>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-1.5 mb-6">
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-3 min-h-[44px] text-xs rounded-lg border transition-all ${
                tab === t.key
                  ? 'bg-gold-600/20 border-gold-500 text-gold-400 font-semibold'
                  : 'border-dark-600 text-gray-400 hover:border-dark-500'
              }`}
            >
              {t.icon} {t.label}
              {counts[t.key as keyof typeof counts] > 0 && (
                <span className="ml-1 text-[10px] opacity-60">({counts[t.key as keyof typeof counts]})</span>
              )}
            </button>
          ))}
        </div>

        {/* List */}
        {charts.length === 0 ? (
          <div className="text-center py-16 bg-dark-800/50 rounded-xl border border-dark-600">
            <p className="text-4xl mb-4">📭</p>
            <p className="text-gray-400 mb-2">暂无收藏</p>
            <p className="text-xs text-gray-600">
              在八字、紫微、六爻等页面测算后，点击「收藏」按钮即可保存到这里
            </p>
            <div className="mt-6 flex flex-wrap gap-3 justify-center">
              <Link href="/bazi" className="text-xs bg-gold-600 hover:bg-gold-500 text-dark-900 font-semibold px-4 min-h-[44px] rounded-lg transition-colors inline-flex items-center">
                去排八字 →
              </Link>
              <Link href="/ziwei" className="text-xs bg-dark-700 hover:bg-dark-600 text-gray-300 border border-dark-600 px-4 min-h-[44px] rounded-lg transition-colors inline-flex items-center">
                紫微斗数
              </Link>
              <Link href="/liuyao" className="text-xs bg-dark-700 hover:bg-dark-600 text-gray-300 border border-dark-600 px-4 min-h-[44px] rounded-lg transition-colors inline-flex items-center">
                六爻
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {charts.map(c => (
              <div
                key={c.id}
                className="bg-dark-800/50 rounded-xl border border-dark-600 p-4 hover:border-gold-500/30 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs px-1.5 py-0.5 rounded bg-dark-700 border border-dark-600 text-gray-400">
                        {TABS.find(t => t.key === c.type)?.icon} {TABS.find(t => t.key === c.type)?.label}
                      </span>
                      <span className="text-xs text-gray-600">{formatDate(c.createdAt)}</span>
                    </div>
                    <h3 className="text-sm font-semibold text-gray-200 font-serif">{c.name}</h3>
                    {c.summary && <p className="text-xs text-gray-500 mt-1 truncate">{c.summary}</p>}
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0 ml-3">
                    {ROUTE_MAP[c.type] && (
                      <Link
                        href={ROUTE_MAP[c.type]}
                        className="text-xs text-gold-400 hover:text-gold-300 px-2 min-h-[44px] rounded border border-dark-600 hover:border-gold-500/50 transition-colors inline-flex items-center"
                      >
                        查看
                      </Link>
                    )}
                    {confirmDelete === c.id ? (
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleDelete(c.id)}
                          className="text-xs text-gold-600 px-2 min-h-[44px] rounded border border-gold-500/50 hover:bg-gold-500/10"
                        >
                          确认
                        </button>
                        <button
                          onClick={() => setConfirmDelete(null)}
                          className="text-xs text-gray-400 px-2 min-h-[44px] rounded border border-dark-600"
                        >
                          取消
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmDelete(c.id)}
                        className="text-xs text-gray-500 hover:text-gold-600 px-2 min-h-[44px] rounded border border-dark-600 hover:border-gold-500/50 transition-colors"
                      >
                        🗑
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 说明 */}
        <div className="mt-8 p-4 bg-dark-700/30 rounded-xl border border-dark-600">
          <p className="text-[10px] text-gray-600">
            💡 数据保存在浏览器本地存储中。清除浏览器数据或更换设备后收藏会丢失。最多保存 50 条记录。
          </p>
        </div>
      </section>
    </div>
  )
}
