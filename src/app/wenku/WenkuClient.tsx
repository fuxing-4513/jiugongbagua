'use client'

import { useState, useMemo } from 'react'
import { useLocale } from '@/lib/i18n'
import { articles, type Article } from './wenkuData'

function tk(key: string, lang: Record<string, unknown>): string {
  const keys = key.split('.')
  let v: unknown = lang
  for (const k of keys) {
    if (typeof v !== 'object' || v === null) return key
    v = (v as Record<string, unknown>)[k]
  }
  return typeof v === 'string' ? v : key
}

const CATEGORIES = [...new Set(articles.map(a => a.category))]

const categoryColors: Record<string, string> = {
  '易学基础': 'bg-red-900/40 text-red-300 border-red-700',
  '五行学说': 'bg-green-900/40 text-green-300 border-green-700',
  '命理知识': 'bg-blue-900/40 text-blue-300 border-blue-700',
  '紫微斗数': 'bg-purple-900/40 text-purple-300 border-purple-700',
  '数字文化': 'bg-cyan-900/40 text-cyan-300 border-cyan-700',
  '姓名文化': 'bg-indigo-900/40 text-indigo-300 border-indigo-700',
  '解梦文化': 'bg-yellow-900/40 text-yellow-300 border-yellow-700',
  '方法类别': 'bg-orange-900/40 text-orange-300 border-orange-700',
  '风水文化': 'bg-amber-900/40 text-amber-300 border-amber-700',
  '传统文化': 'bg-rose-900/40 text-rose-300 border-rose-700',
  '生肖文化': 'bg-pink-900/40 text-pink-300 border-pink-700',
  '塔罗文化': 'bg-violet-900/40 text-violet-300 border-violet-700',
  '择日文化': 'bg-teal-900/40 text-teal-300 border-teal-700',
  '测字文化': 'bg-sky-900/40 text-sky-300 border-sky-700',
}

export default function WenkuClient() {
  const { t } = useLocale()
  const lang = t as unknown as Record<string, unknown>
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [filterCat, setFilterCat] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState<string>('')

  const filtered = useMemo(() => {
    let list = filterCat ? articles.filter(a => a.category === filterCat) : articles
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase()
      list = list.filter(a =>
        a.title.toLowerCase().includes(q) ||
        a.summary.toLowerCase().includes(q) ||
        a.fullContent.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q)
      )
    }
    return list
  }, [filterCat, searchQuery])

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gold-400 font-serif mb-3">{tk('wenku.title', lang)}</h1>
      <p className="text-gray-400 mb-6">{tk('wenku.desc', lang)}</p>

      <div className="mb-4">
        <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
          placeholder="🔍 搜索文章标题、内容或分类..."
          className="w-full px-4 py-2.5 bg-dark-700 border border-dark-600 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:border-gold-500 text-sm" />
      </div>

      <div className="flex flex-wrap gap-1.5 mb-6">
        <button onClick={() => setFilterCat('')}
          className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${!filterCat ? 'bg-gold-600 text-dark-900 border-gold-500' : 'bg-dark-700 text-gray-400 border-dark-600 hover:border-gold-500'}`}>
          全部 ({articles.length})
        </button>
        {CATEGORIES.map(cat => {
          const count = articles.filter(a => a.category === cat).length
          return (
            <button key={cat} onClick={() => setFilterCat(cat)}
              className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${filterCat === cat ? 'bg-gold-600 text-dark-900 border-gold-500' : 'bg-dark-700 text-gray-400 border-dark-600 hover:border-gold-500'}`}>
              {cat} ({count})
            </button>
          )
        })}
      </div>

      <p className="text-xs text-gray-500 mb-4">共 {filtered.length} 篇文章</p>

      <div className="space-y-3">
        {filtered.map(article => (
          <div key={article.id} className="bg-dark-800/80 backdrop-blur rounded-xl border border-dark-600 overflow-hidden transition-all duration-200 hover:border-dark-500">
            <button onClick={() => setExpandedId(expandedId === article.id ? null : article.id)}
              className="w-full text-left p-4 flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${categoryColors[article.category] || 'bg-dark-700 text-gray-400 border-dark-600'}`}>
                    {article.category}
                  </span>
                  <span className="text-[10px] text-gray-600">{article.date}</span>
                </div>
                <h3 className="text-sm font-semibold text-gray-200 mb-1">{article.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{article.summary}</p>
              </div>
              <svg className={`w-4 h-4 text-gray-600 mt-1 transition-transform duration-200 flex-shrink-0 ${expandedId === article.id ? 'rotate-180' : ''}`}
                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {expandedId === article.id && (
              <div className="px-4 pb-4 border-t border-dark-600">
                <div className="mt-3 bg-dark-700 rounded-lg p-4">
                  <p className="text-xs text-gray-300 leading-relaxed whitespace-pre-line">{article.fullContent}</p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
