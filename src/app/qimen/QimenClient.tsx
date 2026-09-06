'use client'

/**
 * 奇门遁甲 · 时家排盘（拆补法 · 转盘）
 *
 * 输入公历时间 → 完整时家奇门盘（四柱 / 节气定局 / 地盘·天盘·八门·九星·八神·暗干）
 * 历法内核与本站黄历、八字一致（寿星天文历 lunar-typescript），
 * 排盘算法另见 src/lib/qimen-engine.ts（已按公开规则实现并与主流排盘口径校验）。
 */

import { useMemo, useState } from 'react'
import Breadcrumb from '@/components/Breadcrumb'
import {
  createQimenChart,
  buildPalaceCells,
  JU_NUM_CN,
} from '@/lib/qimen-engine'
import type { QimenChart, PalaceCell } from '@/lib/qimen-engine'
import { interpretChart, DOOR_INFO, STAR_INFO, GOD_INFO } from '@/lib/qimen-interpret'
import type { QimenReading } from '@/lib/qimen-interpret'

/* ── 洛书盘面行序（南上）：巽4 离9 坤2 / 震3 中5 兑7 / 艮8 坎1 乾6 ── */
const GRID_ROWS: number[][] = [
  [4, 9, 2],
  [3, 5, 7],
  [8, 1, 6],
]
const PALACE_NO_TO_NAME = ['', '坎', '坤', '震', '巽', '中', '乾', '兑', '艮', '离']
const PALACE_NO_DIR = ['', '正北', '西南', '正东', '东南', '中宫', '西北', '正西', '东北', '正南']

/* ── 吉凶配色（文字，须为完整字面量类名） ── */
const LUCK_TXT: Record<string, string> = {
  大吉: 'text-green-600 dark:text-green-400',
  吉: 'text-green-600 dark:text-green-400',
  平: 'text-amber-600 dark:text-amber-400',
  凶: 'text-red-500 dark:text-red-400',
  大凶: 'text-red-600 dark:text-red-400',
}
const GOD_TONE_TXT: Record<string, string> = {
  吉: 'text-teal-600 dark:text-teal-400',
  平: 'text-gray-500 dark:text-gray-400',
  凶: 'text-rose-500/90 dark:text-rose-400/90',
}
const ACT_LEVEL: Record<string, { cls: string; label: string }> = {
  顺: { cls: 'border-green-300/70 dark:border-green-500/40 bg-green-50/70 dark:bg-green-500/10 text-green-700 dark:text-green-300', label: '顺' },
  中: { cls: 'border-amber-300/70 dark:border-amber-500/40 bg-amber-50/70 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300', label: '平' },
  慎: { cls: 'border-red-300/70 dark:border-red-500/40 bg-red-50/70 dark:bg-red-500/10 text-red-600 dark:text-red-300', label: '慎' },
}
const ACT_ICON: Record<string, string> = { 求财: '💰', 合作: '🤝', 出行: '🚶', 行事: '🧭' }

/* ── 北京时间（东八区）此刻的日期时间 ── */
function beijingNow(): { date: string; time: string } {
  const n = new Date()
  const bj = new Date(n.getTime() + (n.getTimezoneOffset() + 480) * 60000)
  const p = (x: number) => String(x).padStart(2, '0')
  return {
    date: `${bj.getUTCFullYear()}-${p(bj.getUTCMonth() + 1)}-${p(bj.getUTCDate())}`,
    time: `${p(bj.getUTCHours())}:${p(bj.getUTCMinutes())}`,
  }
}

/** 解析并校验「日期 时间」输入，返回 [年,月,日,时,分]；非法返回 null */
function parseDateTime(date: string, time: string): [number, number, number, number, number] | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time)) return null
  const [y, mo, da] = date.split('-').map(Number)
  const [h, mi] = time.split(':').map(Number)
  if (y < 1901 || y > 2099 || mo < 1 || mo > 12 || da < 1 || da > 31 || h < 0 || h > 23 || mi < 0 || mi > 59) return null
  const maxD = new Date(Date.UTC(y, mo, 0)).getUTCDate() // 当月实际天数
  if (da > maxD) return null
  return [y, mo, da, h, mi]
}

export default function QimenClient() {
  /* 输入默认当前（北京时间）；提交后按提交值起局（useMemo 纯推导，无副作用） */
  const [dateStr, setDateStr] = useState(() => beijingNow().date)
  const [timeStr, setTimeStr] = useState(() => beijingNow().time)
  const [committed, setCommitted] = useState<{ d: string; t: string }>(() => {
    const n = beijingNow()
    return { d: n.date, t: n.time }
  })
  const [error, setError] = useState('')

  const chart = useMemo<QimenChart | null>(() => {
    const p = parseDateTime(committed.d, committed.t)
    if (!p) return null
    try {
      return createQimenChart(p[0], p[1], p[2], p[3], p[4])
    } catch {
      return null
    }
  }, [committed.d, committed.t])
  const reading = useMemo<QimenReading | null>(() => (chart ? interpretChart(chart) : null), [chart])

  /* 排盘：校验当前输入并提交 */
  const run = (d?: string, t?: string) => {
    const date = d ?? dateStr
    const time = t ?? timeStr
    const parsed = parseDateTime(date, time)
    if (!parsed) {
      setError('请填写完整的日期与时间（支持 1901–2099 年）。')
      return
    }
    setError('')
    setCommitted({ d: date, t: time })
  }

  const pick = (d?: string, t?: string) => {
    const date = d ?? dateStr
    const time = t ?? timeStr
    if (d) setDateStr(d)
    if (t) setTimeStr(t)
    run(date, time)
  }
  const now = beijingNow()
  const ranFor = `${committed.d} ${committed.t}`

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 md:py-10">
      <Breadcrumb items={[{ label: '全部工具', href: '/tools' }, { label: '奇门遁甲' }]} />

      {/* ── 标题 ── */}
      <div className="bg-white/85 dark:bg-[#171614]/85 rounded-2xl border border-gold-200/60 dark:border-gold-500/20 p-5 md:p-6 mb-5">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-50 font-serif mb-1.5">
          🧭 奇门遁甲 · 时家排盘
        </h1>
        <p className="text-xs leading-relaxed text-gray-500 dark:text-gray-400">
          输入任意公历时刻，排完整时家奇门盘：四柱干支、节气定局（拆补法）、
          地盘·天盘·八门·九星·八神·暗干九宫全盘，并附白话决策参考。
          <span className="text-gray-400 dark:text-gray-500"> 历法内核与本站黄历、八字同源（寿星天文历），按北京时间（东八区）排盘。</span>
        </p>
      </div>

      {/* ── 起局时间 ── */}
      <div className="bg-white/85 dark:bg-[#171614]/85 rounded-2xl border border-gray-200/70 dark:border-white/10 p-5 mb-6">
        <p className="text-xs font-semibold text-gray-600 dark:text-gray-300 mb-3">起局时间</p>
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="date"
            value={dateStr}
            onChange={(e) => setDateStr(e.target.value)}
            min="1901-01-01"
            max="2099-12-31"
            className="px-2.5 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-800 dark:text-gray-100"
          />
          <input
            type="time"
            value={timeStr}
            onChange={(e) => setTimeStr(e.target.value)}
            className="px-2.5 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-800 dark:text-gray-100"
          />
          <button
            onClick={() => run()}
            className="px-5 py-2 rounded-lg bg-gold-500 hover:bg-gold-400 text-white dark:text-dark-900 dark:bg-gold-500 dark:hover:bg-gold-400 font-semibold text-sm transition-colors active:scale-95"
          >
            排盘
          </button>
        </div>
        <div className="flex flex-wrap gap-1.5 mt-3">
          {[
            { label: '此刻', fn: () => pick(now.date, now.time) },
            { label: '今日午时', fn: () => pick(dateStr || now.date, '12:00') },
            { label: '今日酉时', fn: () => pick(dateStr || now.date, '18:00') },
            { label: '今日早子时', fn: () => pick(dateStr || now.date, '00:00') },
          ].map((b) => (
            <button
              key={b.label}
              onClick={b.fn}
              className="text-[11px] px-2.5 py-1 rounded-full border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-gold-400 dark:hover:border-gold-500/60 hover:text-gold-600 dark:hover:text-gold-300 transition-colors"
            >
              {b.label}
            </button>
          ))}
        </div>
        {error && <p className="text-xs text-red-500 mt-3">{error}</p>}
        <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-3 leading-relaxed">
          口径：北京时间（UTC+8）平太阳时；23:00–23:59 按次日干支起时（晚子时换日，时家排盘通行做法）。
          拆补法定局：日干支逢符头段（甲子/己卯/甲午/己酉起五日为上元）定三元，节气交接时刻一到即换本节气之局。
        </p>
      </div>

      {chart && reading && (
        <>
          {/* ── 盘头信息 ── */}
          <div className="bg-white/85 dark:bg-[#171614]/85 rounded-2xl border border-gray-200/70 dark:border-white/10 p-5 mb-5">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              {[
                ['年', `${chart.calendar.yearPillar.gan}${chart.calendar.yearPillar.zhi}`],
                ['月', `${chart.calendar.monthPillar.gan}${chart.calendar.monthPillar.zhi}`],
                ['日', `${chart.calendar.dayPillar.gan}${chart.calendar.dayPillar.zhi}`],
                ['时', `${chart.calendar.hourPillar.gan}${chart.calendar.hourPillar.zhi}`],
              ].map(([k, v]) => (
                <span key={k} className="inline-flex items-baseline gap-1 px-2.5 py-1 rounded-lg bg-gray-50 dark:bg-gray-800/70 border border-gray-100 dark:border-gray-700/60">
                  <span className="text-[10px] text-gray-400 dark:text-gray-500">{k}柱</span>
                  <span className="text-sm font-bold text-gray-800 dark:text-gray-100 font-serif">{v}</span>
                </span>
              ))}
              <span className="inline-flex items-baseline gap-1 px-2.5 py-1 rounded-lg bg-gold-50 dark:bg-gold-500/10 border border-gold-200/80 dark:border-gold-500/30">
                <span className="text-[10px] text-gold-600 dark:text-gold-300">{chart.ju.termName}·{chart.ju.yuan}</span>
                <span className="text-sm font-bold text-gold-600 dark:text-gold-300 font-serif">
                  {chart.ju.dun}遁{JU_NUM_CN[chart.ju.juNumber]}局
                </span>
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[11px]">
              <div className="rounded-lg border border-gray-100 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-900/40 px-3 py-2">
                <p className="text-gray-400 dark:text-gray-500 mb-0.5">节气交接</p>
                <p className="text-gray-700 dark:text-gray-200">{chart.calendar.termName} {chart.calendar.termSolarText}</p>
              </div>
              <div className="rounded-lg border border-gray-100 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-900/40 px-3 py-2">
                <p className="text-gray-400 dark:text-gray-500 mb-0.5">值符（主帅）</p>
                <p className="text-gray-700 dark:text-gray-200">
                  天{chart.zf.zhifuStar}星 · {PALACE_NO_TO_NAME[chart.zf.zhifuGongNo]}宫（{PALACE_NO_DIR[chart.zf.zhifuGongNo]}）
                </p>
              </div>
              <div className="rounded-lg border border-gray-100 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-900/40 px-3 py-2">
                <p className="text-gray-400 dark:text-gray-500 mb-0.5">值使（事体走向）</p>
                <p className="text-gray-700 dark:text-gray-200">
                  {chart.zf.zhishiDoor}门 · {PALACE_NO_TO_NAME[chart.zf.zhishiGongNo]}宫（{PALACE_NO_DIR[chart.zf.zhishiGongNo]}）
                </p>
              </div>
              <div className="rounded-lg border border-gray-100 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-900/40 px-3 py-2">
                <p className="text-gray-400 dark:text-gray-500 mb-0.5">时旬 · 空亡</p>
                <p className="text-gray-700 dark:text-gray-200">
                  {chart.zf.xunHead}旬（{chart.zf.liuYi}遁） · 时空亡{chart.zf.hourKong}
                  {chart.zf.dayKong && ` · 日空亡${chart.zf.dayKong}`}
                </p>
              </div>
            </div>
          </div>

          {/* ── 九宫盘 ── */}
          <PalaceGrid chart={chart} reading={reading} ranFor={ranFor} />

          {/* ── 白话解读 ── */}
          <ReadingSection chart={chart} reading={reading} />

          {/* ── 每宫简注 ── */}
          <div className="bg-white/85 dark:bg-[#171614]/85 rounded-2xl border border-gray-200/70 dark:border-white/10 p-5 mb-5">
            <details>
              <summary className="cursor-pointer text-sm font-semibold text-gray-700 dark:text-gray-200">
                九宫逐宫简注 <span className="text-[10px] font-normal text-gray-400 dark:text-gray-500">（按吉凶印象从好到差排列）</span>
              </summary>
              <div className="mt-3 space-y-2">
                {reading.palaceNotes.map(({ cell, text }) => (
                  <div key={cell.no} className="flex gap-2 text-xs leading-relaxed">
                    <span className="shrink-0 w-14 font-bold text-gray-500 dark:text-gray-400 font-serif">
                      {PALACE_NO_TO_NAME[cell.no]}宫{cell.no === 5 ? '' : `(${PALACE_NO_DIR[cell.no]})`}
                    </span>
                    <span className="text-gray-600 dark:text-gray-300">{text || '此宫无特别提示。'}</span>
                  </div>
                ))}
              </div>
            </details>
          </div>

          {/* ── 图例与口径 ── */}
          <div className="bg-white/85 dark:bg-[#171614]/85 rounded-2xl border border-gray-200/70 dark:border-white/10 p-5 mb-8">
            <details>
              <summary className="cursor-pointer text-sm font-semibold text-gray-700 dark:text-gray-200">
                图例与排盘口径
              </summary>
              <ul className="mt-3 space-y-1.5 text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed list-disc pl-4">
                <li>每宫自上而下：八神 → 八门 → 九星 → 天盘干（大）→ 暗干 → 地盘干（小）。中宫只藏干（天禽星寄坤二与天芮同宫，盘面星位以「禽」代「芮」）。</li>
                <li>门吉凶色：<span className="text-green-600 dark:text-green-400">大吉/吉（生·开·休）</span>、
                  <span className="text-amber-600 dark:text-amber-400">平（景·杜）</span>、
                  <span className="text-red-500 dark:text-red-400">凶（伤·惊·死）</span>；
                  标 <b>值符</b> 的宫为值符落宫（时干在地盘之宫），标 <b>值使</b> 的宫为值使门落宫；「日/时」为日干、时干在天盘之落宫（用神位）。</li>
                <li>三奇（乙丙丁）字色高亮；白虎、玄武在部分流派亦写作勾陈、朱雀，属同名异写。</li>
                <li>定局：拆补法（节气交接时刻即换本节气之局；三元按日干支符头段：甲子/己卯/甲午/己酉起五日上元）。未采用置闰法，跨节气数日的局数两者可能不同。</li>
                <li>时间：按北京时间平太阳时，未做真太阳时校正；如需真太阳时，请先换算后再排。</li>
              </ul>
            </details>
          </div>
        </>
      )}

      {!chart && !error && (
        <p className="text-center text-xs text-gray-400 py-10">正在按当前时间起局…</p>
      )}
    </div>
  )
}

/* ═══════════════ 九宫盘 ═══════════════ */

function PalaceGrid({ chart, reading, ranFor }: { chart: QimenChart; reading: QimenReading; ranFor: string }) {
  const cells = buildPalaceCells(chart)
  const cellByNo = (no: number) => cells.find((c) => c.no === no)!
  const badgeAt = (no: number): string[] => {
    const badges: string[] = []
    if (chart.zf.zhifuGongNo === no) badges.push('值符')
    if (chart.zf.zhishiGongNo === no) badges.push('值使')
    if (reading.dayPalace?.no === no) badges.push('日')
    if (reading.hourPalace?.no === no && reading.hourPalace.no !== reading.dayPalace?.no) badges.push('时')
    return badges
  }
  const isSanqi = (g: string) => g === '乙' || g === '丙' || g === '丁'
  return (
    <div className="mb-5">
      <div className="flex items-center justify-between mb-2 px-1">
        <h2 className="text-sm font-bold text-gray-700 dark:text-gray-200">九宫盘面</h2>
        <span className="text-[10px] text-gray-400 dark:text-gray-500">{ranFor} 起局 · 南上北下</span>
      </div>
      <div className="rounded-2xl border border-gray-200/80 dark:border-white/10 bg-white/85 dark:bg-[#101018]/85 p-2 md:p-3 shadow-sm">
        <div className="grid grid-cols-3 gap-1 md:gap-1.5">
          {GRID_ROWS.flat().map((no) => {
            const cell: PalaceCell = cellByNo(no)
            if (cell.isCenter) {
              return (
                <div
                  key={no}
                  className="relative rounded-xl border border-dashed border-gray-300/80 dark:border-gray-600/50 bg-gray-50/70 dark:bg-gray-900/50 flex flex-col items-center justify-center gap-0.5 py-3 min-h-[120px] md:min-h-[150px]"
                >
                  <span className="text-[10px] text-gray-400 dark:text-gray-500">中 · 宫</span>
                  <span className={`text-lg font-serif font-bold ${isSanqi(cell.skyGan) ? 'text-gold-600 dark:text-gold-300' : 'text-gray-700 dark:text-gray-100'}`}>{cell.skyGan}</span>
                  <span className="text-[10px] text-gray-400 dark:text-gray-500">天盘/地盘同干</span>
                  <span className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">空亡：{chart.zf.hourKong || '—'}</span>
                  <span className="text-[9px] text-gray-300 dark:text-gray-600">天禽寄坤 · 与芮同宫</span>
                </div>
              )
            }
            const badges = badgeAt(no)
            const doorLuck = cell.door ? DOOR_INFO[cell.door]?.luck : undefined
            const starLuck = cell.star ? STAR_INFO[cell.star]?.luck : undefined
            const godTone = cell.god ? GOD_INFO[cell.god]?.tone : undefined
            const isZf = chart.zf.zhifuGongNo === no
            return (
              <div
                key={no}
                className={`relative rounded-xl border flex flex-col items-center justify-between px-1 py-2 min-h-[120px] md:min-h-[150px] transition-colors ${
                  isZf
                    ? 'border-gold-400/80 dark:border-gold-500/60 bg-gold-50/40 dark:bg-gold-500/[0.06] shadow-[0_0_0_1px_rgba(212,175,55,0.25)]'
                    : 'border-gray-200/80 dark:border-white/10 bg-white dark:bg-[#171614]/70'
                }`}
              >
                {/* 宫名角标 */}
                <div className="w-full flex items-center justify-between text-[9px] md:text-[10px] text-gray-400 dark:text-gray-500">
                  <span className="font-bold font-serif text-gray-500 dark:text-gray-300">{PALACE_NO_TO_NAME[no]}</span>
                  <span>{PALACE_NO_DIR[no]}</span>
                </div>
                {/* 八神 + 徽标 */}
                <div className="w-full flex items-center justify-center gap-1 flex-wrap">
                  {cell.god && <span className={`text-[10px] md:text-[11px] ${godTone ? GOD_TONE_TXT[godTone] : 'text-gray-500 dark:text-gray-400'}`}>{cell.god}</span>}
                </div>
                {/* 八门 */}
                {cell.door && (
                  <span className={`text-base md:text-lg font-bold font-serif leading-none ${doorLuck ? LUCK_TXT[doorLuck] : 'text-gray-700 dark:text-gray-200'}`}>
                    {cell.door}门
                  </span>
                )}
                {/* 九星 */}
                {cell.star && (
                  <span className={`text-[10px] md:text-[11px] leading-none ${starLuck === '凶' || starLuck === '大凶' ? 'text-gray-400 dark:text-gray-500' : 'text-gray-600 dark:text-gray-300'}`}>
                    天{cell.star}星
                  </span>
                )}
                {/* 天盘干 + 暗干 */}
                <span className={`text-xl md:text-2xl font-serif font-bold leading-none ${isSanqi(cell.skyGan) ? 'text-gold-600 dark:text-gold-300' : 'text-gray-800 dark:text-gray-100'}`}>
                  {cell.skyGan}
                  {cell.anganGan && cell.anganGan !== cell.skyGan && (
                    <span className="text-[9px] text-gray-300 dark:text-gray-600 font-normal">/{cell.anganGan}</span>
                  )}
                </span>
                {/* 地盘干 */}
                <span className="text-[10px] text-gray-400 dark:text-gray-500 leading-none">{cell.earthGan}（地盘）</span>
                {/* 徽标 */}
                <div className="w-full flex items-center justify-center gap-1 min-h-[14px]">
                  {badges.map((b) => (
                    <span
                      key={b}
                      title={b === '值符' ? '值符落宫（值符加时干处）' : b === '值使' ? '值使门落宫' : b === '日' ? '日干用神落宫' : '时干落宫'}
                      className={`text-[8px] md:text-[9px] px-1 py-px rounded font-semibold ${
                        b === '值符'
                          ? 'bg-gold-500/15 text-gold-700 dark:text-gold-300'
                          : b === '值使'
                            ? 'bg-jade-500/15 text-jade-700 dark:text-jade-300'
                            : b === '日'
                              ? 'bg-blue-500/10 text-blue-600 dark:text-blue-300'
                              : 'bg-purple-500/10 text-purple-600 dark:text-purple-300'
                      }`}
                    >
                      {b}
                    </span>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

/* ═══════════════ 白话解读 ═══════════════ */

function ReadingSection({ chart, reading }: { chart: QimenChart; reading: QimenReading }) {
  const dayGan = chart.calendar.dayPillar.gan
  const hourGan = chart.calendar.hourPillar.gan
  const dayJia = dayGan === '甲'
  const hourJia = hourGan === '甲'
  // 「中宫（中宫）」去重：落宫显示助手
  const loc = (p: { name: string; direction: string } | null) => (p ? (p.name === '中' ? '中宫' : `${p.name}宫（${p.direction}）`) : '')

  return (
    <div className="space-y-5 mb-5">
      {/* 全局倾向 */}
      <div className="bg-white/85 dark:bg-[#171614]/85 rounded-2xl border border-gray-200/70 dark:border-white/10 p-5">
        <h2 className="text-sm font-bold text-gray-700 dark:text-gray-200 mb-2.5">🗒️ 全局倾向</h2>
        <div className="space-y-2">
          {reading.summary.map((s, i) => (
            <p key={i} className="text-[13px] leading-relaxed text-gray-600 dark:text-gray-300">
              {s}
            </p>
          ))}
        </div>
        <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-3">
          以上为排盘符号的白话转译，供决策参考；事在人为，方向对了剩下的交给行动与耐心。
        </p>
      </div>

      {/* 关键用神 */}
      <div className="grid md:grid-cols-2 gap-3">
        <InfoCard
          title={dayJia ? '日干用神 · 甲日' : `日干用神 · ${dayGan}日`}
          accent="border-t-blue-400/70 dark:border-t-blue-500/50"
          body={
            dayJia
              ? '日干为甲（主帅之干）遁而不显，测事以值符宫代看自身。'
              : reading.dayPalace
                ? `日干（你/求测人）落${loc(reading.dayPalace)}：${reading.dayPalace.note}。${reading.dayPalace.door ? DOOR_INFO[reading.dayPalace.door].oneLine : ''}`
                : '日干不显于盘面（通常为旬首遁甲之象），以值符宫代看。'
          }
        />
        <InfoCard
          title="时干 · 事体"
          accent="border-t-purple-400/70 dark:border-t-purple-500/50"
          body={
            hourJia
              ? '时干为甲，事体隐于仪中，值符宫即此事之枢机，看其落宫吉凶即可。'
              : reading.hourPalace
                ? `时干（所问之事）在天盘落${loc(reading.hourPalace)}：${reading.hourPalace.note}。`
                : '时干不显，以值符宫参看。'
          }
        />
        <InfoCard
          title="值符宫（当下气场最强处）"
          accent="border-t-gold-400/70 dark:border-t-gold-500/50"
          body={
            reading.zhifuPalace
              ? `值符（天${chart.zf.zhifuStar}星）加时干落${loc(reading.zhifuPalace)}：${reading.zhifuPalace.note}。这一宫代表此刻最"当令"的力量，办事可借它的势。`
              : '值符入中寄坤，气在中宫，宜稳不宜动。'
          }
        />
        <InfoCard
          title="值使宫（事态如何发展）"
          accent="border-t-jade-400/70 dark:border-t-jade-500/50"
          body={
            reading.zhishiPalace
              ? `值使（${chart.zf.zhishiDoor}门）落${loc(reading.zhishiPalace)}：${reading.zhishiPalace.note}。${reading.zhishiPalace.door ? DOOR_INFO[reading.zhishiPalace.door].oneLine : ''}`
              : '值使入中寄坤，事态收敛，静观为佳。'
          }
        />
      </div>

      {/* 分项倾向 */}
      <div className="bg-white/85 dark:bg-[#171614]/85 rounded-2xl border border-gray-200/70 dark:border-white/10 p-5">
        <h2 className="text-sm font-bold text-gray-700 dark:text-gray-200 mb-3">📌 此时宜做什么</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
          {reading.actions.map((a) => {
            const lv = ACT_LEVEL[a.level]
            return (
              <div key={a.key} className={`rounded-xl border p-3 flex flex-col gap-1.5 ${lv.cls}`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold">{ACT_ICON[a.key]} {a.key}</span>
                  <span className="text-[10px] px-1.5 py-px rounded-full bg-white/70 dark:bg-black/20 font-semibold">{lv.label}</span>
                </div>
                <p className="text-[11px] leading-relaxed opacity-90">{a.text}</p>
              </div>
            )
          })}
        </div>
        <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-3">
          求财看生门、合作看六合/开门、出行看开休门、行事节奏看九天九地——这是传统取用的简化，仅供参考。
        </p>
      </div>
    </div>
  )
}

function InfoCard({ title, accent, body }: { title: string; accent: string; body: string }) {
  return (
    <div className={`bg-white/85 dark:bg-[#171614]/85 rounded-2xl border border-gray-200/70 dark:border-white/10 border-t-2 p-4 ${accent}`}>
      <h3 className="text-xs font-bold text-gray-700 dark:text-gray-200 mb-1.5">{title}</h3>
      <p className="text-xs leading-relaxed text-gray-600 dark:text-gray-300">{body}</p>
    </div>
  )
}
