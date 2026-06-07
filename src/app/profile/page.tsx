'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { getCharts, removeChart, type SavedChart } from '@/lib/collections'

const TABS = [
  { key: 'all', label: '全部', icon: '📋' },
  { key: 'bazi', label: '八字命盘', icon: '📜' },
  { key: 'ziwei', label: '紫微斗数', icon: '⭐' },
  { key: 'liuyao', label: '六爻', icon: '☯' },
  { key: 'qian', label: '签文', icon: '🏮' },
  { key: 'other', label: '其他', icon: '📌' },
]

const ROUTE_MAP: Record<string, string> = {
  bazi: '/bazi',
  ziwei: '/ziwei',
  liuyao: '/liuyao',
  qian: '/lingqian',
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso)
    return d.toLocaleString('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  } catch { return iso }
}

export default function ProfilePage() {
  const [tab, setTab] = useState('all')
  const [charts, setCharts] = useState<SavedChart[]>([])
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  const loadCharts = () => {
    const items = tab === 'all' ? getCharts() : getCharts(tab)
    setCharts(items)
  }

  useEffect(() => { loadCharts() }, [tab])

  const handleDelete = (id: string) => {
    removeChart(id)
    setConfirmDelete(null)
    loadCharts()
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
      <h1 className="text-3xl font-bold text-gold-400 font-serif mb-3">我的收藏</h1>
      <p className="text-gray-400 mb-8">收藏的命盘、签文与测算记录</p>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1.5 mb-6">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-3 py-1.5 text-xs rounded-lg border transition-all ${
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
            <Link href="/bazi" className="text-xs bg-gold-600 hover:bg-gold-500 text-dark-900 font-semibold px-4 py-2 rounded-lg transition-colors">
              去排八字 →
            </Link>
            <Link href="/ziwei" className="text-xs bg-dark-700 hover:bg-dark-600 text-gray-300 border border-dark-600 px-4 py-2 rounded-lg transition-colors">
              紫微斗数
            </Link>
            <Link href="/liuyao" className="text-xs bg-dark-700 hover:bg-dark-600 text-gray-300 border border-dark-600 px-4 py-2 rounded-lg transition-colors">
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
                      className="text-xs text-gold-400 hover:text-gold-300 px-2 py-1 rounded border border-dark-600 hover:border-gold-500/50 transition-colors"
                    >
                      查看
                    </Link>
                  )}
                  {confirmDelete === c.id ? (
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleDelete(c.id)}
                        className="text-xs text-red-400 px-2 py-1 rounded border border-red-500/50 hover:bg-red-500/10"
                      >
                        确认
                      </button>
                      <button
                        onClick={() => setConfirmDelete(null)}
                        className="text-xs text-gray-400 px-2 py-1 rounded border border-dark-600"
                      >
                        取消
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmDelete(c.id)}
                      className="text-xs text-gray-500 hover:text-red-400 px-2 py-1 rounded border border-dark-600 hover:border-red-500/50 transition-colors"
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
    </div>
  )
}
