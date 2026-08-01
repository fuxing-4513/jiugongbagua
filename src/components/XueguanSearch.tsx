'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import Link from 'next/link'
import Fuse from 'fuse.js'

interface SearchBook {
  id: string
  title: string
  author: string
  dynasty: string
  category: string
  summary: string
  keywords: string[]
  isComplete: boolean
  chapters: { id: string; title: string }[]
}

interface SearchIndex {
  totalBooks: number
  totalContentBooks: number
  books: SearchBook[]
}

interface SearchResult {
  book: SearchBook
  matchedField: 'title' | 'author' | 'summary' | 'chapter' | 'keyword'
  matchedText: string
  chapterId?: string
  chapterTitle?: string
  score: number
}

export default function XueguanSearch({ placeholder = '搜索古籍名称、作者、章节...' }: { placeholder?: string }) {
  const [query, setQuery] = useState('')
  const [index, setIndex] = useState<SearchIndex | null>(null)
  const [loading, setLoading] = useState(true)
  const [results, setResults] = useState<SearchResult[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  // 加载搜索索引
  useEffect(() => {
    fetch('/data/xueguan-search.json')
      .then(r => r.json())
      .then(data => {
        setIndex(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  // 搜索
  useEffect(() => {
    if (!index || !query.trim()) {
      setResults([])
      return
    }

    const q = query.trim().toLowerCase()
    const found: SearchResult[] = []

    for (const book of index.books) {
      // 书名匹配
      if (book.title.toLowerCase().includes(q)) {
        found.push({ book, matchedField: 'title', matchedText: book.title, score: 10 })
      }
      // 作者匹配
      if (book.author.toLowerCase().includes(q)) {
        found.push({ book, matchedField: 'author', matchedText: book.author, score: 8 })
      }
      // 朝代匹配
      if (book.dynasty.includes(q)) {
        found.push({ book, matchedField: 'title', matchedText: book.dynasty, score: 3 })
      }
      // 关键词匹配
      for (const kw of book.keywords) {
        if (kw.toLowerCase().includes(q)) {
          found.push({ book, matchedField: 'keyword', matchedText: kw, score: 6 })
          break
        }
      }
      // 简介匹配
      if (book.summary.toLowerCase().includes(q)) {
        found.push({ book, matchedField: 'summary', matchedText: book.summary.substring(0, 60) + '...', score: 4 })
      }
      // 章节标题匹配
      for (const ch of book.chapters) {
        if (ch.title.toLowerCase().includes(q)) {
          found.push({
            book, matchedField: 'chapter', matchedText: ch.title,
            chapterId: ch.id, chapterTitle: ch.title, score: 5
          })
        }
      }
    }

    // 排序：按分数降序，再按书名
    found.sort((a, b) => b.score - a.score || a.book.title.localeCompare(b.book.title, 'zh'))

    // 去重 (同一本书只保留最高分的那条)
    const seen = new Set<string>()
    const deduped: SearchResult[] = []
    for (const r of found) {
      const key = r.book.id + r.matchedField + (r.chapterId || '')
      if (!seen.has(key)) {
        seen.add(key)
        deduped.push(r)
      }
    }

    setResults(deduped.slice(0, 50))
  }, [query, index])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setQuery('')
      inputRef.current?.blur()
    }
  }

  // 所属分类名（中文）
  const catNames: Record<string, string> = {
    'mingli-bazi': '四柱八字', 'mingli-ziwei': '紫微斗数', 'mingli-heluo': '河洛理数',
    'mingli-tieban': '铁板神数', 'mingli-chenggu': '称骨测算',
    'bushi-yijing': '易经周易', 'bushi-liuyao': '六爻纳甲', 'bushi-meihua': '梅花易数',
    'bushi-qimen': '奇门遁甲', 'bushi-liuren': '六壬神课', 'bushi-xiaoliuren': '小六壬',
    'bushi-lingqian': '灵签占卜', 'bushi-zhuge': '诸葛神数',
    'xiangshu-mian': '面相学', 'xiangshu-shou': '手相学', 'xiangshu-gu': '骨相学',
    'fengshui-xingshi': '形势派', 'fengshui-liqi': '理气派', 'fengshui-zonghe': '综合·阳宅',
    'daojia-jingdian': '道家经典', 'daojia-danding': '丹道养生', 'daojia-ganying': '劝善感应',
    'jiemeng-zhougong': '周公解梦', 'jiemeng-guji': '梦占古籍',
    'zashu-xingming': '姓名学', 'zashu-shuma': '数字能量', 'zashu-huangli': '择日黄历',
    'zashu-shengxiao': '生肖民俗',
    'yiyi-wuyun': '五运六气', 'yiyi-jingdian': '医易经典', 'yiyi-maizhen': '脉诊命理',
    'western-astrology': '西方占星', 'western-tarot': '塔罗牌', 'western-occult': '神秘学',
  }

  return (
    <div className="w-full">
      {/* 搜索框 */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <span className="text-gray-300">{loading ? '⏳' : '🔍'}</span>
        </div>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full pl-11 pr-10 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-gold-300 focus:ring-1 focus:ring-gold-200 transition-colors"
          autoFocus
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-300 hover:text-gray-500 transition-colors"
          >
            ✕
          </button>
        )}
      </div>

      {/* 搜索结果统计 */}
      {query && results.length > 0 && (
        <div className="mt-3 text-xs text-gray-400">
          找到 <strong className="text-gold-500">{results.length}</strong> 条结果
        </div>
      )}

      {/* 空搜索提示 */}
      {!query && !loading && (
        <div className="mt-8 text-center py-10 text-gray-400">
          <p className="text-2xl mb-2">📖</p>
          <p className="text-sm">输入关键词搜索古籍</p>
          {index && (
            <p className="text-xs mt-1 text-gray-300">
              覆盖 {index.totalBooks} 部古籍 · {index.totalContentBooks} 部已录入章节
            </p>
          )}
        </div>
      )}

      {/* 搜索中 */}
      {loading && (
        <div className="mt-8 text-center text-gray-400 text-sm">
          ⏳ 加载索引中...
        </div>
      )}

      {/* 搜索结果列表 */}
      {query && results.length > 0 && (
        <div className="mt-4 space-y-2 max-h-[60vh] overflow-y-auto pr-1">
          {results.map((r, i) => (
            <Link
              key={r.book.id + i}
              href={`/xueguan/${r.book.category}/${r.book.id}${r.chapterId ? '#ch-' + r.chapterId : ''}`}
              className="flex items-start gap-3 p-3 rounded-lg bg-white border border-gray-50 hover:border-gold-200 hover:shadow-sm transition-all group"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-800 group-hover:text-gold-600 transition-colors">
                    {r.book.title}
                  </span>
                  {r.book.isComplete && (
                    <span className="text-[10px] bg-jade-50 text-jade-500 px-1.5 py-0.5 rounded font-medium">全文</span>
                  )}
                  <span className="text-[10px] text-gray-300 bg-gray-50 px-1.5 py-0.5 rounded">
                    {catNames[r.book.category] || r.book.category}
                  </span>
                </div>
                {r.matchedField === 'chapter' && r.chapterTitle && (
                  <div className="text-xs text-gold-500 mt-0.5">
                    章节匹配 · {r.chapterTitle}
                  </div>
                )}
                {r.matchedField === 'keyword' && (
                  <div className="text-xs text-shui-500 mt-0.5">
                    标签匹配 · {r.matchedText}
                  </div>
                )}
                {r.matchedField === 'author' && (
                  <div className="text-xs text-gray-400 mt-0.5">
                    {r.book.author} · {r.book.dynasty}
                  </div>
                )}
                <div className="text-xs text-gray-400 mt-0.5 line-clamp-1">
                  {r.book.summary}
                </div>
              </div>
              <span className="text-gray-200 group-hover:text-gold-300 transition-colors text-xs mt-1">→</span>
            </Link>
          ))}
        </div>
      )}

      {/* 无结果 */}
      {query && !loading && results.length === 0 && (
        <div className="mt-8 text-center py-10 text-gray-400">
          <p className="text-2xl mb-2">🔍</p>
          <p className="text-sm">未找到 "{query}" 的相关古籍</p>
          <p className="text-xs mt-1 text-gray-300">试试其他关键词，或查看分类浏览</p>
        </div>
      )}
    </div>
  )
}
