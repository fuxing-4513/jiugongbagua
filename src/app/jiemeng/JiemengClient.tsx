'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import ShareResult from '@/components/ShareResult'
import { dataPath } from '@/lib/anti-scrape'
import { synonymMatch, multiTermMatch } from '@/lib/dream-synonyms'
import { generatePsychology, DREAM_CATEGORY_LANG, PSYCHOLOGY_VIEW_LANG, PSYCHOLOGY_FOOTNOTE } from '@/lib/dream-psychology'
import { useLocale } from '@/lib/i18n'

interface Dream {
  keyword: string; title: string; category: string
  tags: string[]; ancient: string; modern: string
  detail: string; mood: string; psychology: string
}

// ── 加载外部解梦数据库 ──
let dreamDB: Dream[] | null = null
let dreamLoading = false
const dreamCallbacks: Array<(ok: boolean) => void> = []

function loadDreamDB() {
  if (dreamDB) return
  if (dreamLoading) return
  dreamLoading = true
  // 先检查sessionStorage缓存
  try {
    const cached = sessionStorage.getItem('jiugong_dreams')
    if (cached) {
      const parsed = JSON.parse(cached)
      if (parsed && parsed.length > 0) {
        dreamDB = parsed
        dreamLoading = false
        dreamCallbacks.forEach(cb => cb(true))
        dreamCallbacks.length = 0
        return
      }
    }
  } catch {}
  fetch(dataPath('dreams'))
    .then(r => r.json())
    .then(data => {
      dreamDB = data.dreams || []
      // 缓存到sessionStorage
      if (dreamDB && dreamDB.length > 0) {
        try { sessionStorage.setItem('jiugong_dreams', JSON.stringify(dreamDB)) } catch {}
      }
      dreamLoading = false
      dreamCallbacks.forEach(cb => cb(true))
      dreamCallbacks.length = 0
    })
    .catch(() => {
      dreamLoading = false
      dreamCallbacks.forEach(cb => cb(false))
      dreamCallbacks.length = 0
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

const ALL_CATEGORIES = ['动物','自然','人物','物品','场景','情感','颜色','食物','现代','建筑','鬼神','植物','生活','活动','情爱','身体','其他']

export default function JiemengClient() {
  const { locale } = useLocale()

  // ── UI Text 多语言 ──
  const uiText = useMemo(() => {
    const l = locale as string
    const enBase = {
      title: 'Dream Interpretation',
      subtitle: 'Ancient Chinese dream divination & modern psychology',
      entryCount: '{count} dream entries',
      loading: 'Loading...',
      searchPlaceholder: '🔍 Enter dream keyword, e.g.: snake, teeth, water',
      hotSearch: 'Hot Searches',
      foundResults: 'Found {count} results',
      notFound: 'No results found for "{keyword}"',
      suggestions: 'Try: snake, teeth, water, flying, exam, death',
      loadMore: 'Load more ({count})',
      tabClassic: '📜 Classic Dream',
      tabPsychology: '🧠 Psychology View',
      ancientText: '📜 Classic Text',
      modernText: '💡 Modern Reading',
      detailText: '📖 Detailed Interpretation',
      searchBtn: 'Search',
    }
    const jaBase = {
      title: '夢占い',
      subtitle: '周公解夢と現代心理学',
      entryCount: '{count}件の夢解釈',
      loading: '読み込み中...',
      searchPlaceholder: '🔍 夢のキーワードを入力（例：蛇、歯、水）',
      hotSearch: '人気検索',
      foundResults: '{count}件見つかりました',
      notFound: '「{keyword}」の関連夢は見つかりませんでした',
      suggestions: '例：蛇、歯、水、飛ぶ、試験、死',
      loadMore: 'もっと見る（{count}）',
      tabClassic: '📜 古典解釈',
      tabPsychology: '🧠 心理学視点',
      ancientText: '📜 古典原文',
      modernText: '💡 現代語訳',
      detailText: '📖 詳細解説',
      searchBtn: '検索',
    }
    const koBase = {
      title: '꿈 해몽',
      subtitle: '고전 꿈 해석과 현대 심리학',
      entryCount: '{count}개의 꿈 해석',
      loading: '로딩 중...',
      searchPlaceholder: '🔍 꿈 키워드 입력 (예: 뱀, 이, 물)',
      hotSearch: '인기 검색어',
      foundResults: '{count}개 결과',
      notFound: '"{keyword}" 관련 꿈 해석이 없습니다',
      suggestions: '예: 뱀, 이, 물, 나는, 시험, 죽음',
      loadMore: '더 보기 ({count})',
      tabClassic: '📜 고전 해몽',
      tabPsychology: '🧠 심리학 관점',
      ancientText: '📜 고전 원문',
      modernText: '💡 현대 해석',
      detailText: '📖 상세 해설',
      searchBtn: '검색',
    }
    const zhTW = {
      title: '周公解夢',
      subtitle: '含《周公解夢》《夢林玄解》《斷夢秘書》古籍原文 · 支援多詞組合搜索',
      entryCount: '收錄 {count} 條夢境解析',
      loading: '載入中...',
      searchPlaceholder: '🔍 輸入夢境關鍵詞，如：蛇咬、掉牙、夢見水',
      hotSearch: '熱門搜尋',
      foundResults: '找到 {count} 條結果',
      notFound: '未找到 "{keyword}" 的相關解夢',
      suggestions: '試試：蛇、掉牙、水、飛、考試、死人',
      loadMore: '載入更多 ({count} 條)',
      tabClassic: '📜 傳統解夢',
      tabPsychology: '🧠 心理學視角',
      ancientText: '📜 古籍原文',
      modernText: '💡 白話解析',
      detailText: '📖 詳細解讀',
      searchBtn: '搜索',
    }
    const zhCN = {
      title: '周公解梦',
      subtitle: '含《周公解梦》《梦林玄解》《断梦秘书》古籍原文 · 支持多词组合搜索',
      entryCount: '收录 {count} 条梦境解析',
      loading: '加载中...',
      searchPlaceholder: '🔍 输入梦境关键词，如：蛇咬、掉牙、梦见水',
      hotSearch: '热门搜索',
      foundResults: '找到 {count} 条结果',
      notFound: '未找到 "{keyword}" 的相关解梦',
      suggestions: '试试：蛇、掉牙、水、飞、考试、死人',
      loadMore: '加载更多 ({count} 条)',
      tabClassic: '📜 传统解梦',
      tabPsychology: '🧠 心理学视角',
      ancientText: '📜 古籍原文',
      modernText: '💡 白话解析',
      detailText: '📖 详细解读',
      searchBtn: '搜索',
    }
    const map: Record<string, typeof zhCN> = { 'zh-CN': zhCN, 'zh-TW': zhTW, 'en': enBase, 'ja': jaBase, 'ko': koBase }
    return map[l] || zhCN
  }, [locale])

  const [loaded, setLoaded] = useState(false)

  const [keyword, setKeyword] = useState('')
  const [results, setResults] = useState<Dream[]>([])
  const [searched, setSearched] = useState(false)
  const [activeCategory, setActiveCategory] = useState('')
  const [selectedDream, setSelectedDream] = useState<Dream | null>(null)
  const [psychoTab, setPsychoTab] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  // 加载数据
  useEffect(() => { loadDreamDB(); dreamCallbacks.push(setLoaded) }, [])

  // 搜索逻辑
  const doSearch = (q: string) => {
    if (!dreamDB) return
    const trimmed = q.trim()
    setSelectedDream(null)
    if (!trimmed) {
      setResults([])
      setSearched(false)
      setActiveCategory('')
      return
    }

    const terms = trimmed.split(/\s+/).filter(Boolean)
    const matched = dreamDB.filter(d => {
      // 原有精确匹配作为快速通道
      const searchText = [d.keyword, d.title, d.modern, ...d.tags].join(' ')
      const exactMatch = terms.every(term =>
        d.keyword.includes(term) || term.includes(d.keyword) ||
        d.title.includes(term) || searchText.includes(term)
      )
      if (exactMatch) return true

      // 同义模糊匹配（关键词层面）
      if (terms.every(term => synonymMatch(term, d.keyword))) return true

      // 全文本同义匹配（title + modern + tags）
      return multiTermMatch(trimmed, searchText)
    })
    setResults(matched)
    setSearched(true)
    setActiveCategory('')
  }

  const handleInput = (val: string) => {
    setKeyword(val)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => doSearch(val), 300)
  }

  const handleSearch = () => doSearch(keyword)

  useEffect(() => { return () => { if (timerRef.current) clearTimeout(timerRef.current) } }, [])

  // 按分类浏览
  const browseCategory = (cat: string) => {
    setActiveCategory(cat)
    setKeyword('')
    setSearched(true)
    if (dreamDB) {
      setResults(dreamDB.filter(d => d.category === cat))
    }
    setSelectedDream(null)
  }

  // 热门梦境（按各分类取第一条）
  const hotKeywords = useMemo(() => {
    if (!dreamDB) return []
    const seen = new Set<string>()
    return dreamDB.filter(d => {
      if (seen.has(d.category)) return false
      seen.add(d.category)
      return true
    }).map(d => ({ keyword: d.keyword, category: d.category }))
  }, [])

  // 分页
  const [page, setPage] = useState(1)
  const PAGE_SIZE = 20
  const pagedResults = results.slice(0, page * PAGE_SIZE)
  const hasMore = results.length > page * PAGE_SIZE

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gold-700 font-serif mb-3">{uiText.title}</h1>
      <p className="text-gray-600 mb-8">{loaded && dreamDB ? uiText.entryCount.replace('{count}', String(dreamDB.length)) : uiText.loading} · {uiText.subtitle}</p>

      {/* 搜索框 */}
      <div className="bg-white/80 rounded-xl border border-gold-500/60 p-6 mb-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={keyword}
            onChange={e => handleInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            placeholder={uiText.searchPlaceholder}
            className="flex-1 px-4 py-2.5 bg-white border border-gold-500/25 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:border-gold-500 text-sm sm:text-base"
          />
          <button
            onClick={handleSearch}
            className="bg-gold-600 hover:bg-gold-500 text-dark-900 font-semibold px-5 py-2 rounded-lg transition-colors whitespace-nowrap"
          >{uiText.searchBtn}</button>
        </div>
        {loaded && dreamDB && (
          <p className="text-[10px] text-gray-500 mt-2">📚 {uiText.entryCount.replace('{count}', String(dreamDB.length))} · {uiText.subtitle}</p>
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
                  : 'bg-gold-500/5 border-gold-500/25 text-gray-600 hover:border-gold-400'
              }`}
            >
              {CAT_ICON[cat] || '📋'} {DREAM_CATEGORY_LANG[cat]?.[locale] || cat}
            </button>
          ))}
        </div>
      </div>

      {/* 热门标签 */}
      <div className="mb-6">
        <p className="text-xs text-gray-500 mb-2">🔥 {uiText.hotSearch}</p>
        <div className="flex flex-wrap gap-1.5">
          {hotKeywords.map((item, i) => (
            <button
              key={i}
              onClick={() => { setKeyword(item.keyword); doSearch(item.keyword) }}
              className="text-xs bg-gold-500/10 hover:bg-gold-100/80 text-gray-500 hover:text-gold-600 px-2.5 py-1 rounded-full border border-gold-500/60 transition-colors"
            >
              {item.keyword}
            </button>
          ))}
        </div>
      </div>

      {/* 搜索结果 */}
      {searched && pagedResults.length > 0 && !selectedDream && (
        <div className="space-y-2">
          <p className="text-xs text-gray-500 mb-1">{uiText.foundResults.replace('{count}', String(results.length))}</p>
          {pagedResults.map((dream, i) => (
            <div key={i}
              onClick={() => setSelectedDream(dream)}
              className="bg-white/80 rounded-xl border border-gold-500/60 p-4 cursor-pointer hover:border-gold-400/60 transition-colors"
            >
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-xs bg-gold-500/10 text-gray-600 px-1.5 py-0.5 rounded">{CAT_ICON[dream.category]||''} {DREAM_CATEGORY_LANG[dream.category]?.[locale] || dream.category}</span>
                <h3 className="text-base font-medium text-gray-800">{dream.title}</h3>
                {dream.mood && (
                  <span className="text-[10px] text-gray-500 ml-auto">{dream.mood}</span>
                )}
              </div>
              <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">{dream.modern}</p>
            </div>
          ))}
          {hasMore && (
            <button
              onClick={() => setPage(p => p + 1)}
              className="w-full text-center text-sm text-gold-600 hover:text-gold-700 py-3"
            >{uiText.loadMore.replace('{count}', String(results.length - page * PAGE_SIZE))}</button>
          )}
        </div>
      )}

      {/* 无结果 */}
      {searched && results.length === 0 && (
        <div className="bg-white/80 rounded-xl border border-gold-500/60 p-5 text-center">
          <p className="text-sm text-gray-600 mb-2">{uiText.notFound.replace('{keyword}', keyword)}</p>
          <p className="text-xs text-gray-500">{uiText.suggestions}</p>
        </div>
      )}

      {/* 未搜索 - 显示分类概览 */}
      {!searched && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {ALL_CATEGORIES.map(cat => {
            const count = dreamDB ? dreamDB.filter(d => d.category === cat).length : 0
            return (
              <button key={cat} onClick={() => browseCategory(cat)}
                className="bg-white/80 border border-gold-500/60 rounded-xl p-4 text-center hover:border-gold-400/60 transition-colors"
              >
                <div className="text-2xl mb-1">{CAT_ICON[cat] || '📋'}</div>
                <div className="text-sm text-gray-800">{DREAM_CATEGORY_LANG[cat]?.[locale] || cat}</div>
                <div className="text-xs text-gray-500">{count} {locale === 'en' ? 'entries' : locale === 'ja' ? '件' : locale === 'ko' ? '개' : '条'}</div>
              </button>
            )
          })}
        </div>
      )}

      {/* 详情弹窗 */}
      {selectedDream && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setSelectedDream(null)}>
          <div className="bg-white/90 border border-gold-500/60 rounded-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto p-6"
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-xs bg-gold-500/10 text-gray-600 px-2 py-0.5 rounded">
                  {CAT_ICON[selectedDream.category]} {DREAM_CATEGORY_LANG[selectedDream.category]?.[locale] || selectedDream.category}
                </span>
                <h2 className="text-lg font-bold text-gold-700">{selectedDream.title}</h2>
              </div>
              <button onClick={() => setSelectedDream(null)}
                className="text-gray-500 hover:text-gray-600 text-xl leading-none">{'\u00D7'}</button>
            </div>

            {/* 视角切换标签 */}
            <div className="flex gap-1 mb-4 bg-gold-500/5 rounded-lg p-1 border border-gold-500/60">
              <button
                onClick={() => setPsychoTab(false)}
                className={`flex-1 text-sm py-1.5 rounded-md transition-colors ${
                  !psychoTab ? 'bg-gold-600 text-dark-900 font-medium' : 'text-gray-600 hover:text-gray-800'
                }`}
              >{uiText.tabClassic}</button>
              <button
                onClick={() => setPsychoTab(true)}
                className={`flex-1 text-sm py-1.5 rounded-md transition-colors ${
                  psychoTab ? 'bg-gold-600 text-dark-900 font-medium' : 'text-gray-600 hover:text-gray-800'
                }`}
              >{uiText.tabPsychology}</button>
            </div>

            {!psychoTab ? (
              <>
                {/* 古籍原文 */}
                <div className="bg-gold-500/5 rounded-lg p-4 mb-4 border border-gold-500/60">
                  <p className="text-xs text-gold-600/90 mb-1">{uiText.ancientText}</p>
                  <p className="text-sm text-gray-700 leading-relaxed">{selectedDream.ancient}</p>
                </div>

                {/* 现代白话 */}
                <div className="mb-4">
                  <p className="text-xs text-shui-600/90 mb-1">{uiText.modernText}</p>
                  <p className="text-sm text-gray-700 leading-relaxed">{selectedDream.modern}</p>
                </div>
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
                      {/* 荣格分析心理学 */}
                      <div className="bg-shui-500/5 border border-shui-500/25 rounded-lg p-4">
                        <p className="text-xs text-shui-600/90 mb-1">🧙 {PSYCHOLOGY_VIEW_LANG.jung[locale] || PSYCHOLOGY_VIEW_LANG.jung['zh-CN']}</p>
                        <p className="text-sm text-gray-700 leading-relaxed">{psych.jung}</p>
                      </div>
                      {/* 弗洛伊德精神分析 */}
                      <div className="bg-gold-500/5 border border-gold-500/25 rounded-lg p-4">
                        <p className="text-xs text-gold-600/90 mb-1">🛋️ {PSYCHOLOGY_VIEW_LANG.freud[locale] || PSYCHOLOGY_VIEW_LANG.freud['zh-CN']}</p>
                        <p className="text-sm text-gray-700 leading-relaxed">{psych.freud}</p>
                      </div>
                      {/* 格式塔心理治疗 */}
                      <div className="bg-jade-500/5 border border-jade-500/25 rounded-lg p-4">
                        <p className="text-xs text-jade-600/90 mb-1">🎭 {PSYCHOLOGY_VIEW_LANG.gestalt[locale] || PSYCHOLOGY_VIEW_LANG.gestalt['zh-CN']}</p>
                        <p className="text-sm text-gray-700 leading-relaxed">{psych.gestalt}</p>
                      </div>
                      {/* 综合视角 */}
                      <div className="bg-gold-500/5 rounded-lg p-4 border border-gold-500/60">
                        <p className="text-xs text-gray-500 mb-1">💡 {PSYCHOLOGY_VIEW_LANG.summary[locale] || PSYCHOLOGY_VIEW_LANG.summary['zh-CN']}</p>
                        <p className="text-sm text-gray-700 leading-relaxed">{psych.summary}</p>
                      </div>
                      <div className="text-[10px] text-gray-500 italic mt-1">
                        {PSYCHOLOGY_FOOTNOTE[locale] || PSYCHOLOGY_FOOTNOTE['zh-CN']}
                      </div>
                    </div>
                  )
                })()}
              </>
            )}

            {/* 详细解析 */}
            {selectedDream.detail && selectedDream.detail !== selectedDream.modern && (
              <div className="mb-4">
                <p className="text-xs text-gray-500 mb-1">{uiText.detailText}</p>
                <p className="text-sm text-gray-600 leading-relaxed">{selectedDream.detail}</p>
              </div>
            )}

            {/* 关键词标签 */}
            <div className="flex flex-wrap gap-1 mt-3">
              {selectedDream.tags.map((tag, i) => (
                <span key={i} className="text-[10px] bg-gold-500/10 text-gray-500 px-2 py-0.5 rounded">{tag}</span>
              ))}
              {selectedDream.mood && selectedDream.mood.split(',').map((m, i) => (
                <span key={i} className="text-[10px] bg-gold-500/10 text-gray-500 px-2 py-0.5 rounded">😴 {m.trim()}</span>
              ))}
            </div>
              <div className="flex justify-end mt-2">
                <ShareResult
                  text={`${selectedDream.title}\n\n${uiText.ancientText}: ${selectedDream.ancient}\n\n${uiText.modernText}: ${selectedDream.modern}${selectedDream.detail !== selectedDream.modern ? `\n\n${uiText.detailText}: ${selectedDream.detail}` : ""}`}
                  label="📋 复制解梦"
                />
              </div>
          </div>
        </div>
      )}
    </div>
  )
}
