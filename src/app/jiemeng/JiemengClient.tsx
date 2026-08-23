'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import ShareResult from '@/components/ShareResult'
import { dataPath } from '@/lib/anti-scrape'
import { synonymMatch, multiTermMatch } from '@/lib/dream-synonyms'
import { generatePsychology } from '@/lib/dream-psychology'
import { SEARCH_INDEX, type InlineDreamRow } from './searchIndex'

/** 完整词条（懒加载增强用） */
interface Dream {
  keyword: string; title: string; category: string
  tags: string[]; ancient: string; modern: string
  detail: string; mood: string; psychology: string
  psychologyNote?: string
}

// ── 全量数据后台增强加载（失败不影响搜索）──
let fullData: Dream[] | null = null
let fullLoading = false
const fullCallbacks: Array<(ok: boolean) => void> = []

function fetchJson(url: string): Promise<any> {
  return fetch(url).then(r => {
    if (!r.ok) throw new Error(`HTTP ${r.status}`)
    return r.json()
  })
}

function loadFullDB() {
  if (fullData || fullLoading) return
  fullLoading = true
  try {
    const cached = sessionStorage.getItem('jiugong_dreams_full')
    if (cached) {
      const parsed = JSON.parse(cached)
      if (parsed && parsed.length > 100) {
        fullData = parsed
        fullLoading = false
        fullCallbacks.forEach(cb => cb(true))
        fullCallbacks.length = 0
        return
      }
    }
  } catch {}
  fetchJson(dataPath('dreams'))
    .then(data => {
      const arr = data.dreams || data
      if (!arr || arr.length === 0) throw new Error('空数据')
      fullData = arr
      try { sessionStorage.setItem('jiugong_dreams_full', JSON.stringify(arr)) } catch {}
      fullLoading = false
      fullCallbacks.forEach(cb => cb(true))
      fullCallbacks.length = 0
    })
    .catch(() => {
      fullLoading = false
      fullCallbacks.forEach(cb => cb(false))
      fullCallbacks.length = 0
    })
}

// ── 分类图标 ──
const CAT_ICON: Record<string, string> = {
  '动物': '🐾', '自然': '🌊', '人物': '👤', '物品': '💎',
  '场景': '🏠', '情感': '💖', '颜色': '🎨', '食物': '🍎',
  '现代': '📱', '建筑': '🏛️', '鬼神': '👻', '植物': '🌿',
  '生活': '☕', '活动': '🏃', '情爱': '💕', '身体': '🫀',
  '其他': '📋'
}

// ── 分类筛选 ──
const ALL_CATEGORIES = ['动物','自然','人物','物品','场景','情感','颜色','食物','现代','建筑','鬼神','植物','生活','活动','情爱','身体','其他']

export default function JiemengClient() {
  const searchParams = useSearchParams()
  // 搜索能力由内联索引保证，页面即到即搜
  const [keyword, setKeyword] = useState('')
  const [results, setResults] = useState<InlineDreamRow[]>([])
  const [searched, setSearched] = useState(false)
  const [activeCategory, setActiveCategory] = useState('')
  const [selectedDream, setSelectedDream] = useState<InlineDreamRow | null>(null)
  const [psychoTab, setPsychoTab] = useState(false)
  const [fullReady, setFullReady] = useState(!!fullData)
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  // 后台尝试加载全量库（增强详情；被CDN拦截也不影响任何功能）
  useEffect(() => {
    if (fullData) { setFullReady(true); return }
    loadFullDB()
    fullCallbacks.push((ok) => { if (ok) setFullReady(true) })
  }, [])

  // 支持 ?q= 直接搜索（SEO 落地页入口）
  useEffect(() => {
    const q = searchParams?.get('q')
    if (q && q.trim()) {
      setKeyword(q.trim())
      doSearch(q.trim())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  // 搜索逻辑：内联索引，毫秒级响应，零网络依赖
  const doSearch = (q: string) => {
    const trimmed = q.trim()
    setSelectedDream(null)
    if (!trimmed) {
      setResults([])
      setSearched(false)
      setActiveCategory('')
      return
    }

    const terms = trimmed.split(/\s+/).filter(Boolean)
    const matched = SEARCH_INDEX.filter(d => {
      const searchText = `${d.k} ${d.t} ${d.m} ${(d.g || []).join(' ')}`
      const exactMatch = terms.every(term =>
        d.k.includes(term) || term.includes(d.k) ||
        d.t.includes(term) || searchText.includes(term)
      )
      if (exactMatch) return true
      if (terms.every(term => synonymMatch(term, d.k))) return true
      return multiTermMatch(trimmed, searchText)
    })
    setResults(matched)
    setSearched(true)
    setActiveCategory('')
  }

  const handleInput = (val: string) => {
    setKeyword(val)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => doSearch(val), 200)
  }

  const handleSearch = () => doSearch(keyword)

  useEffect(() => { return () => { if (timerRef.current) clearTimeout(timerRef.current) } }, [])

  // 按分类浏览
  const browseCategory = (cat: string) => {
    setActiveCategory(cat)
    setKeyword('')
    setSearched(true)
    setResults(SEARCH_INDEX.filter(d => d.c === cat))
    setSelectedDream(null)
  }

  // 热门梦境（按各分类取第一条）
  const hotKeywords = useMemo(() => {
    const seen = new Set<string>()
    return SEARCH_INDEX.filter(d => {
      if (seen.has(d.c)) return false
      seen.add(d.c)
      return true
    }).map(d => ({ keyword: d.k }))
  }, [])

  // 点击结果 → 打开详情（内联索引兜底，全量库增强）
  const openDetail = (item: InlineDreamRow) => {
    setPsychoTab(false)
    if (fullData) {
      const hit = fullData.find(d => d.keyword === item.k && d.title === item.t) ||
                  fullData.find(d => d.keyword === item.k) ||
                  fullData.find(d => d.title === item.t)
      if (hit) { setSelectedDream({ ...item, detail: hit.detail, mood: hit.mood }); return }
    }
    // 全量库未就绪：用内联数据展示（detail 用白话+古籍兜底）
    setSelectedDream({
      ...item,
      detail: item.m.length > 60 ? item.m : `${item.m}\n\n📜 古籍参考：${item.a}`,
      mood: '',
    })
  }

  // 分页
  const [page, setPage] = useState(1)
  const PAGE_SIZE = 20
  const pagedResults = results.slice(0, page * PAGE_SIZE)
  const hasMore = results.length > page * PAGE_SIZE

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gold-700 font-serif mb-3">周公解梦</h1>
      <p className="text-gray-600 mb-8">收录 {SEARCH_INDEX.length} 条梦境解析 · 含《周公解梦》《梦林玄解》《断梦秘书》古籍原文 · 支持多词组合搜索</p>

      {/* 搜索框 */}
      <div className="bg-white/80 rounded-xl border border-amber-200/60 p-6 mb-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={keyword}
            onChange={e => handleInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            placeholder="🔍 输入梦境关键词，如：蛇咬、掉牙、AI、梦见水"
            className="flex-1 px-4 py-2.5 bg-white border border-amber-200 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:border-gold-500 text-sm sm:text-base"
          />
          <button
            onClick={handleSearch}
            className="bg-gold-600 hover:bg-gold-500 text-dark-900 font-semibold px-5 py-2 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
          >搜索</button>
        </div>
        <p className="text-[10px] text-gray-500 mt-2">📚 收录 {SEARCH_INDEX.length} 条梦境解析 · 古籍与心理学双视角 · 支持多词组合搜索</p>
      </div>

      {/* 分类导航 */}
      <div className="mb-4 overflow-x-auto">
        <div className="flex gap-1.5 min-w-max pb-1">
          {ALL_CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => browseCategory(cat)}
              className={`text-xs sm:text-sm px-3 py-1.5 rounded-full border transition-colors whitespace-nowrap ${
                activeCategory === cat
                  ? 'bg-gold-600 border-gold-500 text-dark-900 font-medium'
                  : 'bg-amber-50 border-amber-200 text-gray-600 hover:border-gold-400'
              }`}
            >
              {CAT_ICON[cat] || '📋'} {cat}
            </button>
          ))}
        </div>
      </div>

      {/* 热门标签 */}
      <div className="mb-6">
        <p className="text-xs text-gray-500 mb-2">🔥 热门搜索</p>
        <div className="flex flex-wrap gap-1.5">
          {(hotKeywords.length ? hotKeywords : [
            {keyword:'蛇'},{keyword:'掉牙'},{keyword:'怀孕'},
            {keyword:'死人'},{keyword:'鱼'},{keyword:'AI'}
          ]).map((item, i) => (
            <button
              key={i}
              onClick={() => { setKeyword(item.keyword); doSearch(item.keyword) }}
              className="text-xs bg-amber-100/60 hover:bg-gold-100/80 text-gray-500 hover:text-gold-600 px-2.5 py-1 rounded-full border border-amber-200/60 transition-colors"
            >
              {item.keyword}
            </button>
          ))}
        </div>
      </div>

      {/* 搜索结果 */}
      {searched && pagedResults.length > 0 && !selectedDream && (
        <div className="space-y-2">
          <p className="text-xs text-gray-500 mb-1">找到 {results.length} 条结果</p>
          {pagedResults.map((dream, i) => (
            <div key={i}
              onClick={() => openDetail(dream)}
              className="bg-white/80 rounded-xl border border-amber-200/60 p-4 cursor-pointer hover:border-gold-400/60 transition-colors"
            >
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-xs bg-amber-100/60 text-gray-600 px-1.5 py-0.5 rounded">{CAT_ICON[dream.c]||''} {dream.c}</span>
                <h3 className="text-base font-medium text-gray-800">{dream.t}</h3>
                <Link
                  href={`/jiemeng/${encodeURIComponent(dream.k).replace(/[%()（）\s.]/g, '').toLowerCase()}/`}
                  onClick={e => e.stopPropagation()}
                  className="ml-auto text-[10px] text-gold-600 hover:underline whitespace-nowrap">详情页 ›</Link>
              </div>
              <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">{dream.m.slice(0, 90)}</p>
            </div>
          ))}
          {hasMore && (
            <button
              onClick={() => setPage(p => p + 1)}
              className="w-full text-center text-sm text-gold-600 hover:text-gold-700 py-3"
            >加载更多 ({results.length - page * PAGE_SIZE} 条)</button>
          )}
        </div>
      )}

      {/* 无结果 */}
      {searched && results.length === 0 && (
        <div className="bg-white/80 rounded-xl border border-amber-200/60 p-5 text-center">
          <p className="text-sm text-gray-600 mb-2">未找到 &quot;{keyword}&quot; 的相关解梦</p>
          <p className="text-xs text-gray-500">试试：蛇、掉牙、水、飞、考试、死人、AI</p>
        </div>
      )}

      {/* 未搜索 - 显示分类概览 */}
      {!searched && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {ALL_CATEGORIES.map(cat => {
            const count = SEARCH_INDEX.filter(d => d.c === cat).length
            return (
              <button key={cat} onClick={() => browseCategory(cat)}
                className="bg-white/80 border border-amber-200/60 rounded-xl p-4 text-center hover:border-gold-400/60 transition-colors"
              >
                <div className="text-2xl mb-1">{CAT_ICON[cat] || '📋'}</div>
                <div className="text-sm text-gray-800">{cat}</div>
                <div className="text-xs text-gray-500">{count} 条</div>
              </button>
            )
          })}
        </div>
      )}

      {/* 详情弹窗 */}
      {selectedDream && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setSelectedDream(null)}>
          <div className="bg-white/90 border border-amber-200/60 rounded-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto p-6"
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-xs bg-amber-100/60 text-gray-600 px-2 py-0.5 rounded">
                  {CAT_ICON[selectedDream.c]} {selectedDream.c}
                </span>
                <h2 className="text-lg font-bold text-gold-700">{selectedDream.t}</h2>
              </div>
              <button onClick={() => setSelectedDream(null)}
                className="text-gray-500 hover:text-gray-600 text-xl leading-none">{'\u00D7'}</button>
            </div>

            {!fullReady && (
              <p className="text-[10px] text-gray-400 mb-3">ℹ️ 当前为精简解读；完整版正在后台加载，稍后重开可看全文</p>
            )}

            {/* 视角切换标签 */}
            <div className="flex gap-1 mb-4 bg-amber-50 rounded-lg p-1 border border-amber-100/60">
              <button
                onClick={() => setPsychoTab(false)}
                className={`flex-1 text-sm py-1.5 rounded-md transition-colors ${
                  !psychoTab ? 'bg-gold-600 text-dark-900 font-medium' : 'text-gray-600 hover:text-gray-800'
                }`}
              >📜 传统解梦</button>
              <button
                onClick={() => setPsychoTab(true)}
                className={`flex-1 text-sm py-1.5 rounded-md transition-colors ${
                  psychoTab ? 'bg-gold-600 text-dark-900 font-medium' : 'text-gray-600 hover:text-gray-800'
                }`}
              >🧠 心理学视角</button>
            </div>

            {!psychoTab ? (
              <>
                {/* 古籍原文 */}
                {selectedDream.a && (
                  <div className="bg-amber-50 rounded-lg p-4 mb-4 border border-amber-100/60">
                    <p className="text-xs text-gold-600/90 mb-1">📜 古籍原文</p>
                    <p className="text-sm text-gray-700 leading-relaxed">{selectedDream.a}</p>
                  </div>
                )}

                {/* 白话解析 */}
                <div className="mb-4">
                  <p className="text-xs text-blue-600/90 mb-1">💡 白话解析</p>
                  <p className="text-sm text-gray-700 leading-relaxed">{selectedDream.m}</p>
                </div>

                {/* 详细解读（来自全量库时才有） */}
                {(selectedDream as any).detail && (selectedDream as any).detail !== selectedDream.m && (
                  <div className="mb-4">
                    <p className="text-xs text-gray-500 mb-1">📖 详细解读</p>
                    <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{(selectedDream as any).detail}</p>
                  </div>
                )}
              </>
            ) : (
              <>
                {(() => {
                  const psych = generatePsychology({
                    keyword: selectedDream.k,
                    category: selectedDream.c,
                    tags: selectedDream.g,
                    mood: (selectedDream as any).mood || '',
                    modern: selectedDream.m,
                  })
                  return (
                    <div className="space-y-4">
                      <div className="bg-violet-50/80 border border-violet-200 rounded-lg p-4">
                        <p className="text-xs text-violet-600/90 mb-1">🧙 荣格分析心理学</p>
                        <p className="text-sm text-gray-700 leading-relaxed">{psych.jung}</p>
                      </div>
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                        <p className="text-xs text-amber-600/90 mb-1">🛋️ 弗洛伊德精神分析</p>
                        <p className="text-sm text-gray-700 leading-relaxed">{psych.freud}</p>
                      </div>
                      <div className="bg-emerald-50/80 border border-emerald-200 rounded-lg p-4">
                        <p className="text-xs text-emerald-600/90 mb-1">🎭 格式塔梦境工作</p>
                        <p className="text-sm text-gray-700 leading-relaxed">{psych.gestalt}</p>
                      </div>
                      <div className="bg-amber-50 rounded-lg p-4 border border-amber-100/60">
                        <p className="text-xs text-gray-500 mb-1">💡 综合启示</p>
                        <p className="text-sm text-gray-700 leading-relaxed">{psych.summary}</p>
                      </div>
                      <div className="text-[10px] text-gray-500 italic mt-1">
                        基于荣格分析心理学、弗洛伊德释梦理论及格式塔梦境工作法生成
                      </div>
                    </div>
                  )
                })()}
              </>
            )}

            {/* 标签行 */}
            <div className="flex flex-wrap gap-1 mt-3">
              {(selectedDream.g || []).map((tag, i) => (
                <span key={i} className="text-[10px] bg-amber-100/60 text-gray-500 px-2 py-0.5 rounded">{tag}</span>
              ))}
            </div>
            <div className="flex justify-between items-center mt-3">
              <Link
                href={`/jiemeng/${encodeURIComponent(selectedDream.k).replace(/[%()（）\s.]/g, '').toLowerCase()}/`}
                className="text-xs text-gold-600 hover:underline">查看完整网页版 ›</Link>
              <ShareResult
                text={`${selectedDream.t}\n\n古籍原文: ${selectedDream.a}\n\n白话解析: ${selectedDream.m}`}
                label="📋 复制解梦"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
