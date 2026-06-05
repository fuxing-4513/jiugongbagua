'use client'

import { useState, useMemo, useEffect } from 'react'

// ── 类型 ──
interface CharBrief { z: string; p: string; j: boolean }
interface StrokeGroup { stroke: number; chars: CharBrief[]; jiCount: number }
interface ElementData {
  el: string; name: string; total: number; ji: number
  byStroke: Record<number, CharBrief[]>
}
interface CharDetail {
  zi: string
  pinyin?: string; zhuyin?: string; wubi?: string; cangjie?: string
  zhengma?: string; sijiao?: string; bihua?: number; kangxiBihua?: number
  bushou?: string; bishun?: string; zixing?: string; tongyi?: string
  wuxingShuxing?: string; jixiong?: string; changyong?: boolean
  xiantong?: boolean; biaozhun?: boolean; yuyi?: string
  qimingJieshi?: string; tuijiandu?: string; wenhuaYinxiang?: string
  zixingNum?: number; zixingGender?: string; jibenJieshi?: string
  error?: string
}
interface DetailData { el: string; name: string; total: number; chars: CharDetail[] }

const ELEMENTS = ['jin', 'mu', 'shui', 'huo', 'tu'] as const
const EL_NAMES: Record<string, string> = { jin: '金', mu: '木', shui: '水', huo: '火', tu: '土' }
const EL_COLORS: Record<string, string> = {
  jin: 'border-yellow-500', mu: 'border-green-500',
  shui: 'border-blue-500', huo: 'border-red-500', tu: 'border-amber-500',
}
const EL_BG: Record<string, string> = {
  jin: 'bg-yellow-500/20', mu: 'bg-green-500/20',
  shui: 'bg-blue-500/20', huo: 'bg-red-500/20', tu: 'bg-amber-500/20',
}
const EL_TEXT: Record<string, string> = {
  jin: 'text-yellow-400', mu: 'text-green-400',
  shui: 'text-blue-400', huo: 'text-red-400', tu: 'text-amber-400',
}

export default function NamingChars() {
  const [activeEl, setActiveEl] = useState<string>('jin')
  const [listData, setListData] = useState<ElementData | null>(null)
  const [detailData, setDetailData] = useState<DetailData | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [jiOnly, setJiOnly] = useState(false)
  const [activeStroke, setActiveStroke] = useState<number | null>(null)
  const [selectedZi, setSelectedZi] = useState<CharDetail | null>(null)

  // 加载列表 & 详情数据
  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    setListData(null)
    setDetailData(null)
    
    // 并行加载列表和详情
    Promise.all([
      fetch(`/data/wuxing-${activeEl}.json`, { signal: controller.signal }).then(r => r.json()),
      fetch(`/data/wuxing-detail-${activeEl}.json`, { signal: controller.signal }).then(r => r.json()).catch(() => null),
    ]).then(([list, detail]) => {
      setListData(list)
      if (detail) setDetailData(detail)
      setLoading(false)
    }).catch((e) => {
      if (e?.name !== 'AbortError') setLoading(false)
    })
    return () => controller.abort()
  }, [activeEl])

  // 构建笔画分组
  const strokeGroups: StrokeGroup[] = useMemo(() => {
    if (!listData) return []
    const groups: StrokeGroup[] = []
    const strokes = Object.keys(listData.byStroke).map(Number).sort((a, b) => a - b)
    for (const s of strokes) {
      let chars = listData.byStroke[s] || []
      if (jiOnly) chars = chars.filter(c => c.j)
      if (search) {
        const q = search.toLowerCase()
        chars = chars.filter(c => c.z.includes(q) || c.p.toLowerCase().includes(q))
      }
      if (activeStroke !== null && s !== activeStroke) continue
      if (chars.length > 0) {
        groups.push({ stroke: s, chars, jiCount: chars.filter(c => c.j).length })
      }
    }
    return groups
  }, [listData, search, jiOnly, activeStroke])

  // 点击字 → 查找详情
  const handleCharClick = (z: string) => {
    if (detailData) {
      const found = detailData.chars.find(c => c.zi === z)
      if (found && !found.error) {
        setSelectedZi(found)
        return
      }
    }
    // 没有详情数据，显示基本信息
    const brief = listData?.byStroke
    let found: CharBrief | undefined
    for (const stroke of Object.keys(listData?.byStroke || {})) {
      found = listData?.byStroke[Number(stroke)]?.find(c => c.z === z)
      if (found) break
    }
    if (found) {
      setSelectedZi({ zi: z, pinyin: found.p })
    }
  }

  return (
    <div className="space-y-4">
      {/* 标题 */}
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold text-gold-400 font-serif">📚 起名用字参考</h3>
        <p className="text-xs text-gray-500 mt-1">
          数据来源：康熙字典 · 点击查看详细解释
          {detailData && <span className="text-green-500 ml-1">● 详情已加载</span>}
        </p>
      </div>

      {/* 五行 Tabs */}
      <div className="flex flex-wrap gap-1.5 justify-center">
        {ELEMENTS.map(el => (
          <button
            key={el}
            onClick={() => { setActiveEl(el); setActiveStroke(null); setSearch('') }}
            className={`px-3 py-1.5 text-xs rounded-lg border transition-all ${
              activeEl === el
                ? `${EL_BG[el]} ${EL_COLORS[el]} text-white font-semibold`
                : 'border-dark-600 text-gray-400 hover:border-dark-500'
            }`}
          >
            {EL_NAMES[el]}
          </button>
        ))}
      </div>

      {/* 工具栏 */}
      <div className="flex flex-wrap items-center gap-2 justify-between bg-dark-800/50 rounded-lg p-3">
        <div className="flex items-center gap-3 text-xs text-gray-400">
          {listData && (
            <>
              <span>属{listData.name}字：<b className="text-gray-200">{listData.total.toLocaleString()}</b></span>
              <span>吉字：<b className="text-green-400">{listData.ji.toLocaleString()}</b></span>
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1 text-xs text-gray-400 cursor-pointer">
            <input type="checkbox" checked={jiOnly} onChange={e => setJiOnly(e.target.checked)} className="accent-gold-500" />
            仅吉字
          </label>
          <input type="text" placeholder="搜索字/拼音..." value={search}
            onChange={e => { setSearch(e.target.value); setActiveStroke(null) }}
            className="w-28 bg-dark-700 border border-dark-600 rounded text-xs px-2 py-1 text-gray-200 placeholder-gray-500 focus:outline-none focus:border-gold-500"
          />
        </div>
      </div>

      {/* 加载中 */}
      {loading && (
        <div className="text-center py-8 text-gray-500">
          <div className="animate-spin w-6 h-6 border-2 border-gold-500 border-t-transparent rounded-full mx-auto mb-2" />
          <p className="text-xs">加载字库数据...</p>
        </div>
      )}

      {/* 笔画导航 */}
      {listData && !loading && (
        <div className="flex flex-wrap gap-1">
          {Object.keys(listData.byStroke).map(Number).sort((a, b) => a - b).map(s => (
            <button key={s} onClick={() => setActiveStroke(activeStroke === s ? null : s)}
              className={`px-2 py-0.5 text-[10px] rounded border transition-all ${
                activeStroke === s
                  ? 'border-gold-500 bg-gold-500/20 text-gold-400'
                  : 'border-dark-600 text-gray-500 hover:border-dark-500 hover:text-gray-400'
              }`}
            >
              {s}画 <span className="opacity-60">({(listData.byStroke[s] || []).length})</span>
            </button>
          ))}
        </div>
      )}

      {/* 字网格 */}
      {!loading && (
        <div className="space-y-3">
          {strokeGroups.length === 0 && (
            <p className="text-center text-gray-500 text-sm py-8">{search ? `无匹配"${search}"` : '无数据'}</p>
          )}
          {strokeGroups.map(group => (
            <div key={group.stroke} className="bg-dark-800/50 rounded-xl border border-dark-600 overflow-hidden">
              <div className="bg-dark-700/50 px-3 py-2 flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-300">
                  {group.stroke}画
                  <span className="text-gray-500 font-normal ml-2">
                    共 {group.chars.length} 字
                    {group.jiCount > 0 && <span className="text-green-500"> · 吉 {group.jiCount}</span>}
                  </span>
                </span>
              </div>
              <div className="p-2 grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-1">
                {group.chars.map(c => (
                  <button
                    key={c.z}
                    onClick={() => handleCharClick(c.z)}
                    className={`relative flex flex-col items-center justify-center p-1.5 rounded-lg border transition-all text-center min-h-[44px] ${
                      selectedZi?.zi === c.z
                        ? 'border-gold-500 bg-gold-500/15 shadow-sm shadow-gold-500/10 ring-1 ring-gold-500/30'
                        : c.j
                          ? 'border-dark-500 hover:border-gold-500/50 hover:bg-dark-600'
                          : 'border-dark-600 hover:border-dark-500 hover:bg-dark-700'
                    }`}
                    title={`${c.p} · ${c.z}${c.j ? ' (吉)' : ''} — 点击查看详情`}
                  >
                    <span className="text-sm font-serif text-gray-200 leading-tight">{c.z}</span>
                    <span className="text-[9px] text-gray-500 leading-tight truncate max-w-full">{c.p}</span>
                    {c.j && (
                      <span className="absolute -top-0.5 -right-0.5 text-[8px] bg-green-600 text-white px-0.5 rounded-full leading-tight font-semibold">
                        吉
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── 详情弹窗 ── */}
      {selectedZi && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setSelectedZi(null)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div
            className="relative bg-dark-800 border border-gold-500/30 rounded-2xl shadow-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto p-6"
            onClick={e => e.stopPropagation()}
          >
            {/* 关闭按钮 */}
            <button
              onClick={() => setSelectedZi(null)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-300 text-lg leading-none"
            >
              ✕
            </button>

            {/* 大字显示 */}
            <div className="text-center mb-4">
              <span className="text-5xl font-serif text-gold-400">{selectedZi.zi}</span>
              {selectedZi.pinyin && (
                <p className="text-sm text-gray-400 mt-1">{selectedZi.pinyin}</p>
              )}
            </div>

            {/* 基础信息 */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
              {selectedZi.bihua ? <InfoBadge label="笔画" value={`${selectedZi.bihua}画`} /> : null}
              {selectedZi.kangxiBihua ? <InfoBadge label="康熙笔画" value={`${selectedZi.kangxiBihua}画`} /> : null}
              {selectedZi.wubi ? <InfoBadge label="五笔" value={selectedZi.wubi} /> : null}
              {selectedZi.cangjie ? <InfoBadge label="仓颉" value={selectedZi.cangjie} /> : null}
              {selectedZi.bushou ? <InfoBadge label="部首" value={selectedZi.bushou} /> : null}
              {selectedZi.bishun ? <InfoBadge label="笔顺" value={selectedZi.bishun} /> : null}
              {selectedZi.zixing ? <InfoBadge label="字形" value={selectedZi.zixing} /> : null}
              {selectedZi.sijiao ? <InfoBadge label="四角" value={selectedZi.sijiao} /> : null}
              {selectedZi.tongyi ? <InfoBadge label="统一码" value={selectedZi.tongyi} /> : null}
            </div>

            {/* 五行 + 吉凶 */}
            <div className="flex flex-wrap gap-2 mb-4">
              {selectedZi.wuxingShuxing && (
                <span className={`text-xs px-2 py-0.5 rounded-full border ${EL_COLORS[activeEl] || 'border-gray-500'} ${EL_BG[activeEl] || 'bg-gray-500/20'} ${EL_TEXT[activeEl] || 'text-gray-300'}`}>
                  五行：{selectedZi.wuxingShuxing}
                </span>
              )}
              {selectedZi.jixiong && (
                <span className={`text-xs px-2 py-0.5 rounded-full border ${
                  selectedZi.jixiong === '吉' ? 'border-green-500 bg-green-500/20 text-green-400' :
                  selectedZi.jixiong === '凶' ? 'border-red-500 bg-red-500/20 text-red-400' :
                  'border-gray-500 bg-gray-500/20 text-gray-300'
                }`}>
                  吉凶：{selectedZi.jixiong}
                </span>
              )}
              {selectedZi.changyong && (
                <span className="text-xs px-2 py-0.5 rounded-full border border-blue-500/50 bg-blue-500/10 text-blue-400">
                  常用字
                </span>
              )}
              {selectedZi.biaozhun && (
                <span className="text-xs px-2 py-0.5 rounded-full border border-purple-500/50 bg-purple-500/10 text-purple-400">
                  标准字体
                </span>
              )}
            </div>

            {/* 寓意解释 */}
            {selectedZi.yuyi && (
              <div className="mb-3 p-3 bg-dark-700/50 rounded-lg border border-dark-600">
                <p className="text-[10px] text-gray-500 mb-1">寓意解释</p>
                <p className="text-sm text-gray-200">{selectedZi.yuyi}</p>
              </div>
            )}

            {/* 起名解释 */}
            {selectedZi.qimingJieshi && (
              <div className="mb-3 p-3 bg-dark-700/50 rounded-lg border border-dark-600">
                <p className="text-[10px] text-gray-500 mb-1">起名解释</p>
                <p className="text-sm text-gray-200">{selectedZi.qimingJieshi}</p>
              </div>
            )}

            {/* 起名参考 */}
            {(selectedZi.tuijiandu || selectedZi.wenhuaYinxiang || selectedZi.zixingNum != null) && (
              <div className="mb-3 p-3 bg-dark-700/50 rounded-lg border border-dark-600">
                <p className="text-[10px] text-gray-500 mb-2">起名参考</p>
                <div className="flex flex-wrap gap-3">
                  {selectedZi.tuijiandu && (
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-gray-500">推荐度</span>
                      <span className="text-sm font-semibold text-gold-400">{selectedZi.tuijiandu}</span>
                    </div>
                  )}
                  {selectedZi.wenhuaYinxiang && (
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-gray-500">文化印象</span>
                      <span className="text-sm font-semibold text-gold-400">{selectedZi.wenhuaYinxiang}</span>
                    </div>
                  )}
                  {selectedZi.zixingNum != null && (
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-gray-500">字性</span>
                      <span className="text-sm text-gray-300">{selectedZi.zixingNum}</span>
                      {selectedZi.zixingGender && (
                        <span className="text-[10px] text-gray-500">{selectedZi.zixingGender}</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 基本解释 */}
            {selectedZi.jibenJieshi && (
              <div className="mb-3 p-3 bg-dark-700/50 rounded-lg border border-dark-600">
                <p className="text-[10px] text-gray-500 mb-1">基本解释</p>
                <p className="text-xs text-gray-300 leading-relaxed">{selectedZi.jibenJieshi}</p>
              </div>
            )}

            {/* 无详情提示 */}
            {!selectedZi.pinyin && !selectedZi.wuxingShuxing && !selectedZi.yuyi && (
              <p className="text-center text-gray-500 text-sm py-4">
                详情数据抓取中，请稍后再试<br />
                <a
                  href={`https://www.kangxizidian.com.cn/hanzi/${encodeURIComponent(selectedZi.zi)}.html`}
                  target="_blank" rel="noopener noreferrer"
                  className="text-gold-500 hover:underline text-xs mt-1 inline-block"
                >
                  前往康熙字典查看 →
                </a>
              </p>
            )}

            {/* 底部外链 */}
            <div className="mt-4 pt-3 border-t border-dark-600 text-center">
              <a
                href={`https://www.kangxizidian.com.cn/hanzi/${encodeURIComponent(selectedZi.zi)}.html`}
                target="_blank" rel="noopener noreferrer"
                className="text-[10px] text-gray-500 hover:text-gold-400 transition-colors"
              >
                数据来源：康熙字典
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── 小标签 ──
function InfoBadge({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-dark-700/50 rounded-lg p-2 text-center border border-dark-600">
      <p className="text-[9px] text-gray-500">{label}</p>
      <p className="text-xs text-gray-200 font-medium">{value}</p>
    </div>
  )
}
