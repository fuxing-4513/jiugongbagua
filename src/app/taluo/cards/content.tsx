'use client'

import { useState, useMemo } from 'react'
import { ALL_CARDS, MAJOR, MINOR, TarotCard } from '@/lib/tarot-data'

type FilterType = 'all' | 'major' | 'minor'
type SuitFilter = 'all' | 'wands' | 'cups' | 'swords' | 'pentacles'

const SUIT_LABELS: Record<string, string> = {
  wands: '权杖', cups: '圣杯', swords: '宝剑', pentacles: '星币',
}

const SUIT_ICONS: Record<string, string> = {
  wands: '🔥', cups: '💧', swords: '⚔️', pentacles: '🪙',
}

export default function CardsPage() {
  const [filter, setFilter] = useState<FilterType>('all')
  const [suitFilter, setSuitFilter] = useState<SuitFilter>('all')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<TarotCard | null>(null)

  const filtered = useMemo(() => {
    let cards = ALL_CARDS
    if (filter === 'major') cards = MAJOR
    else if (filter === 'minor') cards = MINOR

    if (suitFilter !== 'all' && filter !== 'major') {
      cards = cards.filter(c => c.suit === suitFilter)
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase()
      cards = cards.filter(c =>
        c.name.includes(q) || c.nameEn.toLowerCase().includes(q) || c.keywords.includes(q)
      )
    }
    return cards
  }, [filter, suitFilter, search])

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gold-400 font-serif mb-2">塔罗牌义大全</h1>
      <p className="text-gray-400 mb-6">浏览全部 78 张韦特塔罗牌的正位与逆位解读</p>

      {/* 筛选栏 */}
      <div className="bg-dark-800/80 rounded-xl border border-dark-600 p-4 mb-6 space-y-3">
        <div className="flex flex-wrap gap-2">
          {([
            { k: 'all', label: '全部' },
            { k: 'major', label: '大阿卡那' },
            { k: 'minor', label: '小阿卡那' },
          ] as { k: FilterType; label: string }[]).map(f => (
            <button key={f.k} onClick={() => { setFilter(f.k); setSuitFilter('all') }}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                filter === f.k ? 'bg-gold-600 border-gold-500 text-dark-900 font-medium' : 'bg-dark-700 border-dark-600 text-gray-300 hover:border-gold-500/50'
              }`}>
              {f.label} ({f.k === 'all' ? 78 : f.k === 'major' ? 22 : 56})
            </button>
          ))}
        </div>

        {filter !== 'major' && (
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setSuitFilter('all')}
              className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                suitFilter === 'all' ? 'bg-dark-600 border-dark-500 text-gray-200' : 'bg-dark-700 border-dark-600 text-gray-500 hover:border-dark-500'
              }`}>全部花色</button>
            {(['wands','cups','swords','pentacles'] as SuitFilter[]).map(s => (
              <button key={s} onClick={() => setSuitFilter(s)}
                className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                  suitFilter === s ? 'bg-dark-600 border-dark-500 text-gray-200' : 'bg-dark-700 border-dark-600 text-gray-500 hover:border-dark-500'
                }`}>
                {SUIT_ICONS[s]} {SUIT_LABELS[s]}
              </button>
            ))}
          </div>
        )}

        <input type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="🔍 搜索牌名、关键词……"
          className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-gold-500" />
      </div>

      {/* 牌列表 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
        {filtered.map(card => (
          <button key={card.id} onClick={() => setSelected(card)}
            className="bg-dark-800/80 border border-dark-600 rounded-xl p-3 text-left hover:border-gold-500/40 transition-colors group">
            <p className={`text-xs font-semibold ${card.suit === 'major' ? 'text-gold-400' : 'text-gray-300'}`}>
              {card.name}
            </p>
            <p className="text-[10px] text-gray-600 truncate">{card.nameEn}</p>
            <p className="text-[9px] text-gray-600 mt-1">
              {card.suit && card.suit !== 'major' ? SUIT_LABELS[card.suit] : '大阿卡那'} · {card.element}
            </p>
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-gray-500 text-sm">未找到匹配的牌</div>
      )}

      {/* 详情弹窗 */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setSelected(null)}>
          <div className="bg-dark-800 border border-dark-600 rounded-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto p-6"
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-xs bg-dark-700 text-gray-400 px-2 py-0.5 rounded">
                  {selected.suit === 'major' ? '大阿卡那' : SUIT_LABELS[selected.suit || '']} · {selected.element}
                </span>
                <h2 className="text-lg font-bold text-gold-400 mt-1">{selected.name}</h2>
                <p className="text-xs text-gray-500">{selected.nameEn}</p>
              </div>
              <button onClick={() => setSelected(null)}
                className="text-gray-500 hover:text-gray-300 text-xl leading-none">{'\u00D7'}</button>
            </div>

            <p className="text-xs text-gold-500/80 mb-1">📖 核心含义</p>
            <p className="text-sm text-gray-300 leading-relaxed mb-4">{selected.meaning}</p>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-dark-900/60 rounded-lg p-3 border border-dark-600/50">
                <p className="text-[10px] text-emerald-400/80 mb-1">▲ 正位</p>
                <p className="text-xs text-gray-400 leading-relaxed">{selected.upright}</p>
              </div>
              <div className="bg-dark-900/60 rounded-lg p-3 border border-dark-600/50">
                <p className="text-[10px] text-rose-400/80 mb-1">▼ 逆位</p>
                <p className="text-xs text-gray-400 leading-relaxed">{selected.reversed}</p>
              </div>
            </div>

            <div className="mb-3">
              <p className="text-xs text-gray-500 mb-1">💡 行动建议</p>
              <p className="text-sm text-gray-400">{selected.advice}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">🤔 自我提问</p>
              <p className="text-sm text-gray-400 italic">{selected.reflection}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
