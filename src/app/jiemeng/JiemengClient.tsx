'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import ShareResult from '@/components/ShareResult'
import { dreamIndexPath, dataPath } from '@/lib/anti-scrape'
import { synonymMatch, multiTermMatch } from '@/lib/dream-synonyms'
import { generatePsychology } from '@/lib/dream-psychology'

/** 轻量索引条目（秒开秒搜） */
interface DreamIndexItem {
  k: string   // keyword
  t: string   // title
  c: string   // category
  g: string[] // tags
  m: string   // modern 摘要前72字
}

/** 完整词条（详情展示用，懒加载） */
interface Dream {
  keyword: string; title: string; category: string
  tags: string[]; ancient: string; modern: string
  detail: string; mood: string; psychology: string
  psychologyNote?: string
}

// ── 数据加载：索引优先，全量懒加载 ──
let indexData: DreamIndexItem[] | null = null
let fullData: Dream[] | null = null
let fullLoading = false
let indexLoading = false
const indexCallbacks: Array<(ok: boolean) => void> = []
const fullCallbacks: Array<(ok: boolean) => void> = []

function fetchJson(url: string): Promise<any> {
  return fetch(url).then(r => {
    if (!r.ok) throw new Error(`HTTP ${r.status}`)
    return r.json()
  })
}

function loadIndex(force = false) {
  if (indexData && !force) { indexCallbacks.forEach(cb => cb(true)); indexCallbacks.length = 0; return }
  if (indexLoading) return
  indexLoading = true
  // sessionStorage 缓存加速二次访问
  try {
    const cached = sessionStorage.getItem('jiugong_dreams_index')
    if (cached) {
      const parsed = JSON.parse(cached)
      if (Array.isArray(parsed) && parsed.length > 100) {
        indexData = parsed
        indexLoading = false
        indexCallbacks.forEach(cb => cb(true))
        indexCallbacks.length = 0
        // 缓存命中时仍后台刷新一次，保证数据最新
        fetchJson(dreamIndexPath()).then((fresh) => {
          if (Array.isArray(fresh) && fresh.length > 100) {
            indexData = fresh
            try { sessionStorage.setItem('jiugong_dreams_index', JSON.stringify(fresh)) } catch {}
          }
        }).catch(() => {})
        return
      }
    }
  } catch {}
  fetchJson(dreamIndexPath())
    .then(data => {
      if (!Array.isArray(data) || data.length === 0) throw new Error('空数据')
      indexData = data
      try { sessionStorage.setItem('jiugong_dreams_index', JSON.stringify(data)) } catch {}
      indexLoading = false
      indexCallbacks.forEach(cb => cb(true))
      indexCallbacks.length = 0
    })
    .catch(() => {
      indexLoading = false
      indexCallbacks.forEach(cb => cb(false))
      indexCallbacks.length = 0
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
  const [loaded, setLoaded] = useState(!!indexData)
  const [loadError, setLoadError] = useState(false)

  const [keyword, setKeyword] = useState('')
  const [results, setResults] = useState<DreamIndexItem[]>([])
  const [searched, setSearched] = useState(false)
  const [activeCategory, setActiveCategory] = useState('')
  const [selectedDream, setSelectedDream] = useState<Dream | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [psychoTab, setPsychoTab] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  // 加载索引（立即）+ 全量数据（后台）
  useEffect(() => {
    if (indexData) { setLoaded(true); return }
    loadIndex()
    indexCallbacks.push((ok) => { setLoaded(ok); if (!ok) setLoadError(true) })
    loadFullDB()
    fullCallbacks.push((ok) => { if (!ok) setLoadError(true) })
  }, [])

  // 支持 ?q= 直接搜索（SEO 落地页入口）
  useEffect(() => {
    const q = searchParams?.get('q')
    if (q && q.trim()) {
      setKeyword(q.trim())
      const t = setInterval(() => {
        if (indexData) { doSearch(q.trim()); clearInterval(t) }
      }, 200)
      setTimeout(() => clearInterval(t), 8000)
      return () => clearInterval(t)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, loaded])

  // 搜索逻辑：在轻量索引上执行（毫秒级响应）
  const doSearch = (q: string) => {
    if (!indexData) return
    const trimmed = q.trim()
    setSelectedDream(null)
    if (!trimmed) {
      setResults([])
      setSearched(false)
      setActiveCategory('')
      return
    }

    const terms = trimmed.split(/\s+/).filter(Boolean)
    const matched = indexData.filter(d => {
      const searchText = `${d.k} ${d.t} ${d.m} ${(d.g || []).join(' ')}`
      // 原有精确匹配快速通道
      const exactMatch = terms.every(term =>
        d.k.includes(term) || term.includes(d.k) ||
        d.t.includes(term) || searchText.includes(term)
      )
      if (exactMatch) return true
      // 同义模糊匹配（关键词层面）
      if (terms.every(term => synonymMatch(term, d.k))) return true
      // 全文本同义匹配
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
    if (indexData) {
      setResults(indexData.filter(d => d.c === cat))
    }
    setSelectedDream(null)
  }

  // 热门梦境（按各分类取第一条）
  const hotKeywords = useMemo(() => {
    if (!indexData) return []
    const seen = new Set<string>()
    return indexData.filter(d => {
      if (seen.has(d.c)) return false
      seen.add(d.c)
      return true
    }).map(d => ({ keyword: d.k, category: d.c }))
  }, [loaded])

  // 点击结果 → 从全量库取完整词条（未就绪则等待）
  const openDetail = async (item: DreamIndexItem) => {
    setSelectedDream(null)
    setPsychoTab(false)
    if (fullData) {
      const hit = fullData.find(d => d.keyword === item.k) ||
                  fullData.find(d => d.title === item.t)
      if (hit) { setSelectedDream(hit); return }
    }
    // 全量库未就绪：等待加载完成
    setDetailLoading(true)
    loadFullDB()
    const ok = await new Promise<boolean>(resolve => {
      if (fullData) return resolve(true)
      fullCallbacks.push(resolve)
      setTimeout(() => resolve(false), 15000)
    })
    setDetailLoading(false)
    if (ok && fullData) {
      const hit = fullData.find(d => d.keyword === item.k) ||
                  fullData.find(d => d.title === item.t)
      if (hit) setSelectedDream(hit)
    }
  }

  // 分页
  const [page, setPage] = useState(1)
  const PAGE_SIZE = 20
  const pagedResults = results.slice(0, page * PAGE_SIZE)
  const hasMore = results.length > page * PAGE_SIZE

  // 重试加载
  const retry = () => {
    setLoadError(false)
    loadIndex()
    indexCallbacks.push((ok) => { setLoaded(ok); if (!ok) setLoadError(true) })
    loadFullDB()
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gold-700 font-serif mb-3">周公解梦</h1>
      <p className="text-gray-600 mb-8">
        {loadError ? '数据加载失败' : loaded ? `收录 ${indexData?.length ?? 0} 条梦境解析 · 含《周公解梦》《梦林玄解》《断梦秘书》古籍原文 · 支持多词组合搜索` : '正在加载解梦数据库...'}
      </p>

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
            disabled={!loaded}
            className={`font-semibold px-5 py-2 rounded-lg transition-colors whitespace-nowrap ${
              loaded
                ? 'bg-gold-600 hover:bg-gold-500 text-dark-900 cursor-pointer'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >搜索</button>
        </div>
        {!loaded && !loadError && (
          <div className="flex items-center gap-2 mt-3 text-xs text-gray-500">
            <span className="inline-block w-3 h-3 border-2 border-gold-500 border-t-transparent rounded-full animate-spin"></span>
            数据库加载中，搜索将在就绪后自动可用...
          </div>
        )}
        {loadError && (
          <div className="mt-3 text-xs text-red-500 flex items-center gap-2">
            <span>⚠️ 解梦数据库加载失败（网络原因）</span>
            <button onClick={retry} className="px-2 py-0.5 bg-red-50 border border-red-200 rounded hover:bg-red-100">点击重试</button>
          </div>
        )}
        {loaded && (
          <p className="text-[10px] text-gray-500 mt-2">📚 收录 {indexData?.length ?? 0} 条梦境解析 · 含《周公解梦》《梦林玄解》《断梦秘书》古籍与心理学双视角 · 支持多词组合搜索</p>
        )}
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
            {keyword:'蛇',category:''},{keyword:'掉牙',category:''},{keyword:'怀孕',category:''},
            {keyword:'死人',category:''},{keyword:'鱼',category:''},{keyword:'AI',category:''}
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
              </div>
              <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">{dream.m}</p>
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
      {searched && results.length === 0 && loaded && (
        <div className="bg-white/80 rounded-xl border border-amber-200/60 p-5 text-center">
          <p className="text-sm text-gray-600 mb-2">未找到 &quot;{keyword}&quot; 的相关解梦</p>
          <p className="text-xs text-gray-500">试试：蛇、掉牙、水、飞、考试、死人、AI</p>
        </div>
      )}

      {/* 未搜索 - 显示分类概览 */}
      {!searched && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {ALL_CATEGORIES.map(cat => {
            const count = indexData ? indexData.filter(d => d.c === cat).length : 0
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
      {detailLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl px-6 py-4 flex items-center gap-3 shadow-xl">
            <span className="inline-block w-4 h-4 border-2 border-gold-500 border-t-transparent rounded-full animate-spin"></span>
            <span className="text-sm text-gray-600">正在载入完整解析...</span>
          </div>
        </div>
      )}
      {selectedDream && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setSelectedDream(null)}>
          <div className="bg-white/90 border border-amber-200/60 rounded-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto p-6"
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-xs bg-amber-100/60 text-gray-600 px-2 py-0.5 rounded">
                  {CAT_ICON[selectedDream.category]} {selectedDream.category}
                </span>
                <h2 className="text-lg font-bold text-gold-700">{selectedDream.title}</h2>
              </div>
              <button onClick={() => setSelectedDream(null)}
                className="text-gray-500 hover:text-gray-600 text-xl leading-none">{'\u00D7'}</button>
            </div>

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
                <div className="bg-amber-50 rounded-lg p-4 mb-4 border border-amber-100/60">
                  <p className="text-xs text-gold-600/90 mb-1">📜 古籍原文</p>
                  <p className="text-sm text-gray-700 leading-relaxed">{selectedDream.ancient}</p>
                </div>

                {/* 现代白话 */}
                <div className="mb-4">
                  <p className="text-xs text-blue-600/90 mb-1">💡 白话解析</p>
                  <p className="text-sm text-gray-700 leading-relaxed">{selectedDream.modern}</p>
                </div>

                {/* 心理学要点（与传统解梦融合展示） */}
                {selectedDream.psychologyNote && (
                  <div className="bg-violet-50/70 border border-violet-200/60 rounded-lg p-3 mb-4">
                    <p className="text-xs text-violet-600/90 mb-1">🧠 心理学视角</p>
                    <p className="text-sm text-gray-700 leading-relaxed">{selectedDream.psychologyNote}</p>
                  </div>
                )}
              </>
            ) : (
              <>
                {(() => {
                  const psych = generatePsychology({
                    keyword: selectedDream.keyword,
                    category: selectedDream.category,
                    tags: selectedDream.tags,
                    mood: selectedDream.mood,
                    modern: selectedDream.modern,
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
                      {selectedDream.psychologyNote && (
                        <div className="bg-violet-50/70 border border-violet-200/60 rounded-lg p-3">
                          <p className="text-xs text-violet-600/90 mb-1">📌 本条要点</p>
                          <p className="text-sm text-gray-700 leading-relaxed">{selectedDream.psychologyNote}</p>
                        </div>
                      )}
                      <div className="text-[10px] text-gray-500 italic mt-1">
                        基于荣格分析心理学、弗洛伊德释梦理论及格式塔梦境工作法，结合梦境关键词和情绪自动生成
                      </div>
                    </div>
                  )
                })()}
              </>
            )}

            {/* 详细解析 */}
            {selectedDream.detail && selectedDream.detail !== selectedDream.modern && (
              <div className="mb-4">
                <p className="text-xs text-gray-500 mb-1">📖 详细解读</p>
                <p className="text-sm text-gray-600 leading-relaxed">{selectedDream.detail}</p>
              </div>
            )}

            {/* 关键词标签 */}
            <div className="flex flex-wrap gap-1 mt-3">
              {selectedDream.tags.map((tag, i) => (
                <span key={i} className="text-[10px] bg-amber-100/60 text-gray-500 px-2 py-0.5 rounded">{tag}</span>
              ))}
              {selectedDream.mood && selectedDream.mood.split(',').map((m, i) => (
                <span key={i} className="text-[10px] bg-amber-100/60 text-gray-500 px-2 py-0.5 rounded">😴 {m.trim()}</span>
              ))}
            </div>
              <div className="flex justify-end mt-2">
                <ShareResult
                  text={`${selectedDream.title}\n\n古籍原文: ${selectedDream.ancient}\n\n白话解析: ${selectedDream.modern}${selectedDream.detail !== selectedDream.modern ? `\n\n详细解读: ${selectedDream.detail}` : ""}`}
                  label="📋 复制解梦"
                />
              </div>
          </div>
        </div>
      )}
    </div>
  )
}
