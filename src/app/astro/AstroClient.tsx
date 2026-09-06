'use client'

// 西洋占星排盘：输入公历出生时间 + 城市坐标 → 排盘
// 天文内核：astronomia（VSOP87，与瑞士星历同精度级）

import { useState } from 'react'
import { computeChart, SIGN_NAMES, type ChartResult, type ChartBody } from '@/lib/astrology-engine'
import { ZODIAC_DEEP, PLANET_DEEP, HOUSE_DEEP, ASPECT_DEEP } from '@/data/astro/index'
import Breadcrumb from '@/components/Breadcrumb'

// 星座 sign 索引 → ZODIAC_DEEP id 映射（0=白羊）
const SIGN_IDS = ['aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo', 'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces']

const CITIES = [
  { name: '北京', lon: 116.4, lat: 39.9 }, { name: '上海', lon: 121.5, lat: 31.2 },
  { name: '广州', lon: 113.3, lat: 23.1 }, { name: '深圳', lon: 114.1, lat: 22.5 },
  { name: '成都', lon: 104.1, lat: 30.7 }, { name: '杭州', lon: 120.2, lat: 30.3 },
  { name: '台北', lon: 121.5, lat: 25.0 }, { name: '香港', lon: 114.2, lat: 22.3 },
  { name: '新加坡', lon: 103.8, lat: 1.35 }, { name: '纽约', lon: -74.0, lat: 40.7 },
  { name: '洛杉矶', lon: -118.2, lat: 34.1 }, { name: '伦敦', lon: -0.1, lat: 51.5 },
  { name: '悉尼', lon: 151.2, lat: -33.9 }, { name: '东京', lon: 139.7, lat: 35.7 },
]

const SUN_READ = ['白羊：天生的开拓者，行动先于犹豫，最怕原地等待。', '金牛：稳扎稳打的建造者，安全感来自看得见的积累。', '双子：好奇心驱动的信息枢纽，靠表达与连接认识世界。', '巨蟹：情绪雷达灵敏的守护者，家与归属是能量来源。', '狮子：自带舞台的发光体，被认可时能量最盛。', '处女：细节控与改良者，在打磨事物中找到心流。', '天秤：关系的艺术家，平衡与美感是你的指南针。', '天蝎：深度探测器，真相与掌控欲是你的燃料。', '射手：意义追寻者，远方与信念让你保持鲜活。', '摩羯：长期主义的结构师，责任与成就筑成你的阶梯。', '水瓶：未来视角的革新者，独立与理想是你的底色。', '双鱼：感受力的深海，共情与想象力是你的天赋。']
const MOON_READ = ['月亮白羊：情绪来得快走得快，需要即时回应。', '月亮金牛：情绪求稳，美食与舒适是充电方式。', '月亮双子：心情随信息流动，聊天是最好的安抚。', '月亮巨蟹：情绪记忆深刻，需要被温柔包裹。', '月亮狮子：需要被看见与被欣赏，骄傲而忠诚。', '月亮处女：用照顾别人来安放自己的焦虑。', '月亮天秤：害怕冲突，和谐氛围是情绪氧气。', '月亮天蝎：情绪浓烈且隐秘，信任需要漫长建立。', '月亮射手：心情靠信念与自由充电，讨厌被束缚。', '月亮摩羯：习惯克制情绪，用成就换取安心。', '月亮水瓶：情绪抽离而理性，需要个人空间。', '月亮双鱼：情绪如潮水，容易吸收周围的气氛。']
const ASC_READ = ['上升白羊：给人果断直接的初印象，行动派气质。', '上升金牛：气质沉稳亲和，让人想靠近的踏实感。', '上升双子：灵动健谈，社交场上反应敏捷。', '上升巨蟹：柔和腼腆，让人自然想照顾。', '上升狮子：存在感强，出场自带气场。', '上升处女：清爽细致，给人可靠利落的印象。', '上升天秤：优雅得体，天生的社交润滑剂。', '上升天蝎：神秘有距离感，眼神有穿透力。', '上升射手：开朗乐观，自带松弛的感染力。', '上升摩羯：成熟稳重，看起来比同龄人靠谱。', '上升水瓶：气质独特，有种旁观者的松弛感。', '上升双鱼：柔和梦幻，容易被误读的温柔。']

export default function AstroClient() {
  const [dateStr, setDateStr] = useState('1990-01-15')
  const [timeStr, setTimeStr] = useState('12:00')
  const [cityIdx, setCityIdx] = useState(0)
  const [tzOffset, setTzOffset] = useState(8) // 时区（默认东八区）
  const [chart, setChart] = useState<ChartResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const run = async () => {
    setLoading(true); setError(''); setChart(null)
    try {
      const city = CITIES[cityIdx]
      // 本地时间 → UTC
      const local = new Date(`${dateStr}T${timeStr}:00`)
      const utc = new Date(local.getTime() - tzOffset * 3600 * 1000)
      const r = await computeChart(utc, city.lon, city.lat)
      setChart(r)
    } catch (e: any) {
      setError('排盘计算失败：' + (e?.message || '未知错误') + '（请检查输入）')
    } finally { setLoading(false) }
  }

  const sun = chart?.bodies.find(b => b.key === 'sun')
  const moon = chart?.bodies.find(b => b.key === 'moon')
  const formatPos = (b: ChartBody) => `${SIGN_NAMES[b.sign]}${Math.floor(b.signDeg)}°${Math.floor((b.signDeg % 1) * 60)}′`

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <Breadcrumb items={[{ label: '全部工具', href: '/tools' }, { label: '西洋占星' }]} />

      {/* 输入区 */}
      <div className="bg-white/85 dark:bg-[#13161c]/85 rounded-2xl border border-violet-200/60 dark:border-violet-500/25 p-5 md:p-6 mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-50 mb-1">🪐 西洋占星 · 星盘排盘</h1>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-5">
          出生星盘（本命盘）：看性格底色、情感模式与人生课题。天文内核 VSOP87 行星历表——同精度级为天文台历书。结果仅供自我了解与决策参考。
        </p>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <label className="text-xs text-gray-500 dark:text-gray-400">出生日期
            <input type="date" value={dateStr} onChange={e => setDateStr(e.target.value)}
              className="mt-1 w-full px-2.5 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-800 dark:text-gray-100" />
          </label>
          <label className="text-xs text-gray-500 dark:text-gray-400">出生时间
            <input type="time" value={timeStr} onChange={e => setTimeStr(e.target.value)}
              className="mt-1 w-full px-2.5 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-800 dark:text-gray-100" />
          </label>
          <label className="text-xs text-gray-500 dark:text-gray-400">时区
            <select value={tzOffset} onChange={e => setTzOffset(+e.target.value)}
              className="mt-1 w-full px-2.5 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-800 dark:text-gray-100">
              <option value={8}>中国 UTC+8</option><option value={9}>日本/韩国 +9</option>
              <option value={7}>东南亚 +7</option><option value={0}>伦敦 UTC+0</option>
              <option value={-5}>美东 -5</option><option value={-8}>美西 -8</option>
              <option value={10}>悉尼 +10</option>
            </select>
          </label>
          <label className="text-xs text-gray-500 dark:text-gray-400">出生城市
            <select value={cityIdx} onChange={e => setCityIdx(+e.target.value)}
              className="mt-1 w-full px-2.5 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-800 dark:text-gray-100">
              {CITIES.map((c, i) => <option key={c.name} value={i}>{c.name}</option>)}
            </select>
          </label>
          <div className="flex items-end">
            <button onClick={run} disabled={loading}
              className="w-full py-2 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-medium hover:opacity-90 disabled:opacity-50 shadow-lg shadow-violet-500/20">
              {loading ? '计算中…' : '🪐 排星盘'}
            </button>
          </div>
        </div>
        {error && <p className="text-xs text-red-500 mt-3">{error}</p>}
      </div>

      {chart && (
        <>
          {/* 三大星座概要 */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
            {[
              { label: '☉ 太阳星座', body: sun, read: sun ? SUN_READ[sun.sign] : '' },
              { label: '☽ 月亮星座', body: moon, read: moon ? MOON_READ[moon.sign] : '' },
              { label: '↗ 上升星座', body: chart ? { sign: chart.ascSign, signDeg: 0, name: '', symbol: '', lon: chart.asc, house: 1, key: 'sun' as const, retrograde: false } as ChartBody : null, read: ASC_READ[chart.ascSign] },
            ].map(card => {
              const zd = ZODIAC_DEEP.find(z => z.id === SIGN_IDS[card.body!.sign])
              return (
                <div key={card.label} className="rounded-xl border border-violet-200/60 dark:border-violet-500/25 bg-white/85 dark:bg-[#13161c]/85 p-4">
                  <p className="text-[11px] text-gray-400 dark:text-gray-500 mb-1">{card.label}</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-gray-50 mb-1.5">{SIGN_NAMES[card.body!.sign]}</p>
                  {zd && (
                    <p className="text-[10px] text-violet-500 dark:text-violet-300 mb-1.5 flex flex-wrap gap-x-2">
                      <span>{zd.date}</span><span>· {zd.element}象 · {zd.mode}星座</span><span>· 守护星 {zd.ruler}</span>
                    </p>
                  )}
                  <p className="text-[11.5px] text-gray-500 dark:text-gray-400 leading-relaxed">{card.read}</p>
                  {zd && (
                    <div className="mt-2.5 pt-2.5 border-t border-violet-100 dark:border-violet-500/15 space-y-2">
                      {zd.core.map((c, i) => <p key={i} className="text-[11px] text-gray-600 dark:text-gray-300 leading-relaxed">{c}</p>)}
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed pt-1 border-t border-gray-100 dark:border-gray-800">
                        <span className="text-violet-500 font-medium">💞 爱情：</span>{zd.love[0]}
                      </p>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">
                        <span className="text-violet-500 font-medium">💼 事业：</span>{zd.career[0]}
                      </p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[420px_1fr] gap-5 mb-6">
            {/* 星盘 SVG */}
            <ChartWheel chart={chart} />
            {/* 行星表 */}
            <div className="rounded-2xl border border-violet-200/60 dark:border-violet-500/25 bg-white/85 dark:bg-[#13161c]/85 p-5 overflow-x-auto">
              <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100 mb-3">🪐 行星位置（本命盘）</h3>
              <table className="w-full text-xs">
                <thead><tr className="text-gray-400 dark:text-gray-500 border-b border-gray-100 dark:border-gray-800">
                  <th className="text-left py-1.5 font-medium">行星</th><th className="text-left font-medium">星座</th>
                  <th className="text-left font-medium">度数</th><th className="text-left font-medium">宫位</th><th className="text-left font-medium">状态</th>
                </tr></thead>
                <tbody>
                  {chart.bodies.map(b => (
                    <tr key={b.key} className="border-b border-gray-50 dark:border-gray-800/60">
                      <td className="py-2 font-medium text-gray-800 dark:text-gray-100 whitespace-nowrap">{b.symbol} {b.name}</td>
                      <td className="py-2 text-gray-700 dark:text-gray-200">{SIGN_NAMES[b.sign]}</td>
                      <td className="py-2 text-gray-500 dark:text-gray-400">{Math.floor(b.signDeg)}°{Math.floor((b.signDeg % 1) * 60)}′</td>
                      <td className="py-2 text-gray-600 dark:text-gray-300">第 {b.house} 宫</td>
                      <td className="py-2 text-gray-500 dark:text-gray-400">{b.retrograde ? <span className="text-orange-500">逆行 R</span> : '—'}</td>
                    </tr>
                  ))}
                  <tr className="border-b border-gray-50 dark:border-gray-800/60">
                    <td className="py-2 font-medium text-gray-800 dark:text-gray-100 whitespace-nowrap">↗ 上升</td>
                    <td className="py-2 text-gray-700 dark:text-gray-200">{SIGN_NAMES[chart.ascSign]}</td>
                    <td className="py-2 text-gray-500 dark:text-gray-400">{Math.floor(chart.asc % 30)}°{Math.floor((chart.asc % 1) * 60)}′</td>
                    <td className="py-2 text-gray-600 dark:text-gray-300">第 1 宫头</td><td className="py-2" />
                  </tr>
                  <tr>
                    <td className="py-2 font-medium text-gray-800 dark:text-gray-100 whitespace-nowrap">✚ 天顶 MC</td>
                    <td className="py-2 text-gray-700 dark:text-gray-200">{SIGN_NAMES[chart.mcSign]}</td>
                    <td className="py-2 text-gray-500 dark:text-gray-400">{Math.floor(chart.mc % 30)}°</td>
                    <td className="py-2 text-gray-600 dark:text-gray-300">第 10 宫头</td><td className="py-2" />
                  </tr>
                </tbody>
              </table>
              <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-3 leading-relaxed">
                上升 = 出生时东方地平线升起的星座（外在面具）；天顶 MC = 星盘最高点（事业与社会成就方向）。
                宫位制：等宫制。本命盘描述的是能量倾向，具体人生取决于你的选择与行动。
              </p>
            </div>
          </div>

          {/* 行星深度解读（占星学核心体系） */}
          <div className="mb-6">
            <h3 className="text-base font-bold text-gray-800 dark:text-gray-100 mb-3 flex items-center gap-2">🔭 十大行星 · 深度解读 <span className="text-[10px] font-normal text-gray-400">你在本命盘中的能量组件</span></h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {PLANET_DEEP.map(p => {
                const pos = chart.bodies.find(b => b.key === p.id || (p.id === 'sun' && b.key === 'sun') || (p.id === 'moon' && b.key === 'moon'))
                return (
                  <div key={p.id} className="rounded-xl border border-violet-200/50 dark:border-violet-500/15 bg-white/85 dark:bg-[#13161c]/85 p-4">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-bold text-gray-800 dark:text-gray-100 text-sm">🪐 {p.name}<span className="text-[10px] text-gray-400 font-normal ml-1.5">({p.en})</span></p>
                      {pos && <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-600 dark:text-violet-300">你的{pos.name}在{SIGN_NAMES[pos.sign]}</span>}
                    </div>
                    <p className="text-[10px] text-gray-400 mb-1.5">{p.domain} · 庙旺：{p.dignity}</p>
                    <div className="space-y-1.5">
                      {p.meaning.map((m, i) => <p key={i} className="text-[11px] text-gray-600 dark:text-gray-300 leading-relaxed">{m}</p>)}
                    </div>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 leading-relaxed mt-2 pt-2 border-t border-gray-100 dark:border-gray-800"><span className="text-violet-500">神话原型：</span>{p.myth}</p>
                  </div>
                )
              })}
            </div>
          </div>

          {/* 宫位深度（你的行星落在哪些人生领域） */}
          <div className="mb-6">
            <h3 className="text-base font-bold text-gray-800 dark:text-gray-100 mb-3 flex items-center gap-2">🏠 十二宫位 · 深度解读 <span className="text-[10px] font-normal text-gray-400">行星落在的宫位 = 能量投射的人生领域</span></h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {HOUSE_DEEP.map(h => {
                const planetsHere = chart.bodies.filter(b => b.house === h.n)
                return (
                  <div key={h.n} className={`rounded-xl border p-3.5 ${planetsHere.length ? 'border-gold-300/70 dark:border-gold-500/40 bg-gradient-to-b from-[#fdf9ee]/70 to-white/50 dark:from-[#1c1a13] dark:to-[#13161c]' : 'border-gray-200/70 dark:border-gray-700/50 bg-white/85 dark:bg-[#13161c]/85'}`}>
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-bold text-gray-700 dark:text-gray-200">第 {h.n} 宫 · {h.name}</p>
                      {planetsHere.length > 0 && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-gold-500/15 text-gold-600 dark:text-gold-300 font-medium">{planetsHere.map(p => p.symbol).join(' ')}</span>}
                    </div>
                    <p className="text-[9.5px] text-gray-400 mb-1">{h.domain}</p>
                    <p className="text-[10.5px] text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-3">{h.meaning.split('\n')[0]}</p>
                  </div>
                )
              })}
            </div>
          </div>

          {/* 相位深度 */}
          <div className="mb-6">
            <h3 className="text-base font-bold text-gray-800 dark:text-gray-100 mb-3 flex items-center gap-2">🔯 相位体系 · 深度解读 <span className="text-[10px] font-normal text-gray-400">行星间的角度对话——你内在能量的合作与张力</span></h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
              {ASPECT_DEEP.map(a => (
                <div key={a.id} className="rounded-xl border border-gray-200/70 dark:border-gray-700/50 bg-white/85 dark:bg-[#13161c]/85 p-3.5">
                  <p className="text-xs font-bold text-gray-700 dark:text-gray-200 mb-0.5">{a.name}<span className="text-[10px] text-gray-400 font-normal ml-1">{a.deg}</span></p>
                  <p className="text-[10.5px] text-gray-500 dark:text-gray-400 leading-relaxed">{a.meaning}</p>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-3 leading-relaxed">相位描述的是心理动力模式——刑冲是成长的功课，拱合是顺手的天赋；本命盘解析请咨询专业占星师做完整解读。</p>
          </div>
        </>
      )}
    </div>
  )
}

// ── 星盘 SVG（等宫制：ASC 左侧，行星按黄经定位）──
function ChartWheel({ chart }: { chart: ChartResult }) {
  const CX = 210, CY = 210
  const R_OUT = 195, R_SIGN = 170, R_HOUSE = 138, R_IN = 120
  const ang = (lon: number) => (((lon - chart.asc) % 360) + 360) % 360 // 相对 ASC
  const pt = (lon: number, r: number) => {
    const a = (ang(lon) - 90) * Math.PI / 180 // ASC 在左侧（-90）
    return { x: CX + r * Math.cos(a), y: CY + r * Math.sin(a) }
  }
  const signGlyph = ['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓']
  const arcs: React.ReactElement[] = []
  for (let i = 0; i < 12; i++) {
    const a0 = ang(i * 30), a1 = ang((i + 1) * 30)
    const p0 = pt(i * 30 + chart.asc - chart.asc + (i * 30), R_OUT)
    // 星座刻度起点按绝对黄经 0 在白羊头
    void a0; void a1; void p0
    const s0 = pt(0 + i * 30, R_SIGN - 12)
    const p1 = pt((i * 30) + 15, R_OUT - 14)
    arcs.push(
      <g key={i}>
        <path d={ringArc(R_OUT, i * 30, (i + 1) * 30, chart.asc)} stroke="url(#ringGrad)" strokeWidth="1" fill="rgba(124,58,237,0.05)" />
        <text x={s0.x} y={s0.y} fontSize="13" textAnchor="middle" dominantBaseline="middle" fill="#8b5cf6" opacity="0.85">{signGlyph[i]}</text>
        <text x={p1.x} y={p1.y} fontSize="8.5" textAnchor="middle" dominantBaseline="middle" fill="#a1a1aa">{SIGN_NAMES[i]}</text>
      </g>
    )
  }
  // 宫线
  const houseLines: React.ReactElement[] = []
  for (let i = 0; i < 12; i++) {
    const inner = pt(chart.asc + i * 30, R_IN - 4)
    const outer = pt(chart.asc + i * 30, R_SIGN - 2)
    const mid = pt(chart.asc + i * 30 + 15, (R_IN + R_HOUSE) / 2)
    houseLines.push(
      <g key={'h' + i}>
        <line x1={outer.x} y1={outer.y} x2={inner.x} y2={inner.y} stroke="#c4b5fd" strokeOpacity="0.4" strokeWidth="0.7" />
        <text x={mid.x} y={mid.y} fontSize="8" textAnchor="middle" dominantBaseline="middle" fill="#a78bfa" opacity="0.75">{i + 1}</text>
      </g>
    )
  }
  // 行星
  const bodies = chart.bodies.filter(b => b.key !== 'northNode')
  const bodyMarks = bodies.map(b => {
    const p = pt(b.lon, (R_IN + R_HOUSE) / 2 - 10)
    return (
      <g key={b.key}>
        <circle cx={p.x} cy={p.y} r="11" fill={b.key === 'sun' ? 'rgba(251,191,36,0.18)' : 'rgba(139,92,246,0.12)'} stroke="none" />
        <text x={p.x} y={p.y - 1} fontSize="11" textAnchor="middle" dominantBaseline="middle"
          fill={b.key === 'sun' ? '#f59e0b' : b.key === 'moon' ? '#94a3b8' : '#7c3aed'} fontWeight="bold">{b.symbol}</text>
        <text x={p.x} y={p.y + 11} fontSize="6.5" textAnchor="middle" fill="#71717a" dark-fill="#a1a1aa">{b.name.slice(0, 2)}</text>
      </g>
    )
  })
  // ASC/MC 标记
  const ascPt = pt(chart.asc, R_IN - 8)
  const mcPt = pt(chart.mc, R_IN - 8)
  const d = chart.mc ? '' : ''
  return (
    <div className="rounded-2xl border border-violet-200/60 dark:border-violet-500/25 bg-white/85 dark:bg-[#13161c]/85 p-4 flex flex-col items-center">
      <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100 self-start mb-2">🗺️ 本命星盘</h3>
      <svg viewBox="0 0 420 420" className="w-full max-w-[400px]">
        <defs>
          <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.5" /><stop offset="100%" stopColor="#6366f1" stopOpacity="0.5" />
          </linearGradient>
        </defs>
        <circle cx={CX} cy={CY} r={R_OUT - 2} fill="none" stroke="#e4e4e7" strokeOpacity="0.5" strokeWidth="0.6" />
        <circle cx={CX} cy={CY} r={R_SIGN} fill="none" stroke="#e4e4e7" strokeOpacity="0.3" strokeWidth="0.5" />
        <circle cx={CX} cy={CY} r={R_HOUSE} fill="none" stroke="#e4e4e7" strokeOpacity="0.3" strokeWidth="0.5" />
        <circle cx={CX} cy={CY} r={R_IN} fill="none" stroke="#e4e4e7" strokeOpacity="0.5" strokeWidth="0.6" />
        {arcs}{houseLines}{bodyMarks}
        {/* ASC / MC 轴线 */}
        <line x1={pt(chart.asc, R_IN - 6).x} y1={pt(chart.asc, R_IN - 6).y}
          x2={pt((chart.asc + 180) % 360, R_SIGN + 2).x} y2={pt((chart.asc + 180) % 360, R_SIGN + 2).y}
          stroke="#8b5cf6" strokeOpacity="0.6" strokeWidth="1.2" strokeDasharray="4 3" />
        <line x1={pt(chart.mc, R_IN - 6).x} y1={pt(chart.mc, R_IN - 6).y}
          x2={pt((chart.mc + 180) % 360, R_SIGN + 2).x} y2={pt((chart.mc + 180) % 360, R_SIGN + 2).y}
          stroke="#6366f1" strokeOpacity="0.6" strokeWidth="1.2" strokeDasharray="4 3" />
        <text x={ascPt.x} y={ascPt.y - 14} fontSize="10" textAnchor="middle" fill="#8b5cf6" fontWeight="bold">ASC {SIGN_NAMES[chart.ascSign]}</text>
        <text x={mcPt.x} y={mcPt.y - 14} fontSize="10" textAnchor="middle" fill="#6366f1" fontWeight="bold">MC {SIGN_NAMES[chart.mcSign]}</text>
        <text x={CX} y={CY} fontSize="9" textAnchor="middle" fill="#71717a">{d || '☉ 本命盘 · 决策参考'}</text>
      </svg>
      <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1 leading-relaxed text-center">
        盘面含义：外圈星座（逆时针）→ 宫位数字（1 起于上升）→ 行星符号位置。<br />传统占星用于自我认知；人生走向仍由你的每次选择决定。
      </p>
    </div>
  )
}

// 画星座环扇形（黄经 0 起每 30° 一段，旋转到 ASC 相对位）
function ringArc(r: number, lon0: number, lon1: number, asc: number): string {
  const CX = 210, CY = 210
  const p = (lon: number) => {
    const a = (((lon - asc) % 360 + 360) % 360 - 90) * Math.PI / 180
    return `${(CX + r * Math.cos(a)).toFixed(2)},${(CY + r * Math.sin(a)).toFixed(2)}`
  }
  return `M ${p(lon0)} A ${r} ${r} 0 0 1 ${p(lon1)} L ${p2(lon1)} A ${r - 26} ${r - 26} 0 0 0 ${p2(lon0)} Z`
  function p2(lon: number): string {
    const a = (((lon - asc) % 360 + 360) % 360 - 90) * Math.PI / 180
    return `${(CX + (r - 26) * Math.cos(a)).toFixed(2)},${(CY + (r - 26) * Math.sin(a)).toFixed(2)}`
  }
}
