'use client'

import { useState, useMemo } from 'react'
import { astro } from 'iztro'
import { Lunar } from 'lunar-typescript'
import CalendarInput, { type CalendarType, getMaxDay, lunarToSolarDate } from '@/components/CalendarInput'

// ── Brightness lookup ──
const BRIGHTNESS: Record<string, { label: string; color: string; level: number; desc: string }> = {
  'miao': { label: '庙', color: 'text-green-400', level: 5, desc: '星曜最强状态，吉星加倍，凶星减凶' },
  'wang': { label: '旺', color: 'text-green-300', level: 4, desc: '星曜旺盛，力量充沛' },
  'de':   { label: '得', color: 'text-blue-300',  level: 3, desc: '星曜得地，稳定发挥' },
  'li':   { label: '利', color: 'text-cyan-300',  level: 2, desc: '星曜有利，尚可发挥' },
  'ping': { label: '平', color: 'text-yellow-400', level: 1, desc: '星曜平庸，力量一般' },
  'bu':   { label: '不', color: 'text-orange-400', level: -1, desc: '星曜不得力，力量减弱' },
  'xian': { label: '陷', color: 'text-red-400',   level: -2, desc: '星曜落陷，力量最弱，凶性彰显' },
  '':     { label: '—',  color: 'text-gray-400',  level: 0, desc: '' },
}

const MUTAGEN: Record<string, { label: string; color: string }> = {
  'sihuaLu':  { label: '化禄', color: 'text-green-400' },
  'sihuaQuan': { label: '化权', color: 'text-purple-400' },
  'sihuaKe':  { label: '化科', color: 'text-blue-400' },
  'sihuaJi':  { label: '化忌', color: 'text-red-400' },
}

// ── 星曜吉凶分类 ──
const AUSPICIOUS_MAJORS = new Set([
  '紫微', '天府', '太阳', '太阴', '天同', '天相', '天梁', '天机', '文昌', '文曲', '左辅', '右弼', '天魁', '天钺', '禄存'
])
const INAUSPICIOUS_MAJORS = new Set([
  '廉贞', '巨门', '贪狼', '七杀', '破军', '擎羊', '陀罗', '火星', '铃星', '地空', '地劫'
])

// ── 紫微格局检测 ──
interface PatternResult {
  name: string
  desc: string
  rating: '上' | '中上' | '中' | '中下' | '下'
}

function detectPatterns(palaces: any[], soulPalace: any): PatternResult[] {
  const patterns: PatternResult[] = []
  const getPalaceByName = (name: string) => palaces.find((p: any) => p.name === name)
  const soulStars = (soulPalace?.majorStars || []).map((s: any) => s.name)
  const soulBranch = soulPalace?.earthlyBranch || ''

  // 紫府同宫格
  if (soulStars.includes('紫微') && soulStars.includes('天府') && (soulBranch === '寅' || soulBranch === '申')) {
    patterns.push({ name: '紫府同宫格', desc: '紫微天府二帝星同守命宫，帝王之象，主贵气非凡，一生衣食无忧，事业有成。', rating: '上' })
  }
  // 日照雷门格
  if (soulStars.includes('太阳') && soulBranch === '卯') {
    patterns.push({ name: '日照雷门格', desc: '旭日东升于卯，如日照雷门，光辉灿烂。主早年发达，声名远播。', rating: '上' })
  }
  // 月朗天门格
  if (soulStars.includes('太阴') && soulBranch === '亥') {
    patterns.push({ name: '月朗天门格', desc: '太阴在亥为月朗天门，主温润清贵，智慧过人，适合文职、艺术。', rating: '上' })
  }
  // 日丽中天格
  if (soulStars.includes('太阳') && soulBranch === '午') {
    patterns.push({ name: '日丽中天格', desc: '太阳居午宫，如日中天，光辉至极。主权势显赫，名扬四海。', rating: '上' })
  }
  // 机月同梁格
  const jiYueTongLiang = ['天机', '太阴', '天同', '天梁']
  const hasJiYue = jiYueTongLiang.filter(s => soulStars.includes(s))
  if (hasJiYue.length >= 3) {
    patterns.push({ name: '机月同梁格（偏格）', desc: '天机、太阴、天同、天梁齐聚，主智谋机变，宜公职、策划、文秘之职。', rating: '中上' })
  }
  // 巨日同宫格
  if (soulStars.includes('巨门') && soulStars.includes('太阳') && (soulBranch === '寅' || soulBranch === '申')) {
    patterns.push({ name: '巨日同宫格', desc: '巨门与太阳同宫，以口为业，宜律师、教师、媒体等行业，能言善辩。', rating: '中' })
  }
  // 雄宿乾元格
  if (soulStars.includes('廉贞') && soulStars.includes('贪狼') && (soulBranch === '寅' || soulBranch === '申')) {
    patterns.push({ name: '雄宿乾元格', desc: '廉贞贪狼居寅申，雄宿镇乾元。才华出众，多才艺，但情感复杂。', rating: '中' })
  }
  // 杀破狼格
  const shaPolang = ['七杀', '破军', '贪狼']
  const hasShaPoLang = shaPolang.filter(s => soulStars.includes(s))
  if (hasShaPoLang.length >= 2) {
    patterns.push({ name: '杀破狼格', desc: '七杀、破军、贪狼坐命，主变动、开创、冒险精神强。一生波澜壮阔，宜创业从商。', rating: '中' })
  }
  // 府相朝垣格
  if (soulStars.includes('天府') || soulStars.includes('天相')) {
    const caiBo = getPalaceByName('财帛')
    const guanLu = getPalaceByName('官禄')
    const caiStars = (caiBo?.majorStars || []).map((s: any) => s.name)
    const guanStars = (guanLu?.majorStars || []).map((s: any) => s.name)
    const allNear = [...soulStars, ...caiStars, ...guanStars]
    if (allNear.includes('天府') && allNear.includes('天相')) {
      patterns.push({ name: '府相朝垣格', desc: '天府天相会照，稳重踏实，一生衣食丰足，宜从事金融、管理行业。', rating: '中上' })
    }
  }
  // 君臣庆会格
  if (soulStars.includes('紫微') && (soulStars.includes('左辅') || soulStars.includes('右弼'))) {
    patterns.push({ name: '君臣庆会格', desc: '紫微帝星得左右辅弼，君臣相得，主贵气加身，有领导才能，得贵人相助。', rating: '上' })
  }
  return patterns
}

// ── 命宫分析 ──
function analyzeSoulPalace(soulPalace: any, allPalaces: any[]) {
  if (!soulPalace) return null

  const majors = soulPalace.majorStars || []
  const minors = [...(soulPalace.minorStars || []), ...(soulPalace.adjectiveStars || [])]
  const branch = soulPalace.earthlyBranch || ''
  const stem = soulPalace.heavenlyStem || ''

  const brightnessAnalysis = majors.map((star: any) => {
    const b = BRIGHTNESS[star.brightness || ''] || BRIGHTNESS['']
    let eval_ = ''
    if (b.level >= 4) eval_ = '极佳'
    else if (b.level >= 2) eval_ = '良好'
    else if (b.level >= 0) eval_ = '一般'
    else if (b.level >= -1) eval_ = '偏弱'
    else eval_ = '不利'
    return { name: star.name, brightness: b.label, level: b.level, color: b.color, desc: b.desc, evaluation: eval_ }
  })

  const auspiciousCount = majors.filter((s: any) => AUSPICIOUS_MAJORS.has(s.name)).length
  const inauspiciousCount = majors.filter((s: any) => INAUSPICIOUS_MAJORS.has(s.name)).length

  const auspiciousMinors = ['天魁', '天钺', '文昌', '文曲', '左辅', '右弼', '禄存', '天马', '三台', '八座', '恩光', '天贵', '龙池', '凤阁', '台辅', '封诰']
  const inauspiciousMinors = ['擎羊', '陀罗', '火星', '铃星', '地空', '地劫', '天刑', '天姚', '阴煞', '劫煞', '破碎', '蜚廉', '孤辰', '寡宿']
  const minorAuspicious = minors.filter((s: any) => auspiciousMinors.includes(s.name)).length
  const minorInauspicious = minors.filter((s: any) => inauspiciousMinors.includes(s.name)).length

  const totalAuspicious = auspiciousCount + minorAuspicious
  const totalInauspicious = inauspiciousCount + minorInauspicious

  let fortuneLevel = ''
  let fortuneColor = ''
  let fortuneDesc = ''
  if (totalAuspicious >= 3 && totalInauspicious === 0) {
    fortuneLevel = '大吉'; fortuneColor = 'text-green-400'; fortuneDesc = '吉星汇聚，福泽深厚，一生顺遂少坎坷。'
  } else if (totalAuspicious >= 2 && totalInauspicious <= 1) {
    fortuneLevel = '中吉'; fortuneColor = 'text-green-300'; fortuneDesc = '吉星为主，虽有微煞，总体向好。'
  } else if (totalAuspicious >= totalInauspicious + 1) {
    fortuneLevel = '小吉'; fortuneColor = 'text-lime-400'; fortuneDesc = '吉多凶少，需把握机遇。'
  } else if (totalAuspicious === totalInauspicious) {
    fortuneLevel = '平'; fortuneColor = 'text-yellow-400'; fortuneDesc = '吉凶参半，需审时度势，趋吉避凶。'
  } else if (totalInauspicious <= 2) {
    fortuneLevel = '小凶'; fortuneColor = 'text-orange-400'; fortuneDesc = '煞星稍多，宜低调行事，注意口舌是非。'
  } else {
    fortuneLevel = '大凶'; fortuneColor = 'text-red-400'; fortuneDesc = '煞星汇聚，一生多有波折，需修身养性，行善积德。'
  }

  const patterns = detectPatterns(allPalaces, soulPalace)

  const sihuaAnalysis = majors
    .filter((star: any) => star.mutagen)
    .map((star: any) => {
      const m = MUTAGEN[star.mutagen]
      if (!m) return null
      let interpret = ''
      if (star.mutagen === 'sihuaLu') interpret = '福禄加身，财运亨通，贵人相助。'
      else if (star.mutagen === 'sihuaQuan') interpret = '权柄在握，宜掌权管理，事业有成。'
      else if (star.mutagen === 'sihuaKe') interpret = '科名显达，学业有成，声名远播。'
      else if (star.mutagen === 'sihuaJi') interpret = '化忌入命，需防小人、官非、健康问题，宜低调谨慎。'
      return { star: star.name, mutagen: m.label, color: m.color, interpret }
    })
    .filter(Boolean)

  return { brightnessAnalysis, fortuneLevel, fortuneColor, fortuneDesc, totalAuspicious, totalInauspicious, patterns, sihuaAnalysis, stem, branch }
}

// ── Component ──
export default function ZiweiClient() {
  const now = new Date()
  const [calendarType, setCalendarType] = useState<CalendarType>('solar')
  const [year, setYear] = useState(String(now.getFullYear()))
  const [month, setMonth] = useState(String(now.getMonth() + 1))
  const [day, setDay] = useState(String(now.getDate()))
  const [hour, setHour] = useState('6')
  const [gender, setGender] = useState<'M' | 'F'>('M')
  const [isLeapMonth, setIsLeapMonth] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')

  const y = parseInt(year) || 2000
  const m = parseInt(month) || 1
  const d = parseInt(day) || 1

  const analyze = () => {
    setError('')
    const maxDay = getMaxDay(calendarType, y, m)
    if (y < 1900 || y > 2100) { setError('年份需在 1900-2100 之间'); return }
    if (m < 1 || m > 12) { setError('请输入有效月份'); return }
    if (d < 1 || d > maxDay) { setError(`${calendarType === 'solar' ? `${y}年${m}月` : `农历${m}月`}有 ${maxDay} 天，请输入 1-${maxDay}`); return }

    try {
      const h = parseInt(hour)
      let solarDateStr: string
      if (calendarType === 'solar') {
        solarDateStr = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
      } else {
        solarDateStr = lunarToSolarDate(y, m, d, isLeapMonth)
      }
      const r = astro.bySolar(solarDateStr, h, gender === 'M' ? 'male' : 'female')
      setResult(r as any)
    } catch (e: any) {
      setError(e?.message || '日期格式有误，请检查输入')
    }
  }

  const soulPalace = useMemo(() => {
    if (!result?.palaces) return null
    return result.palaces.find((p: any) => p.name === '命宫') || null
  }, [result])

  const soulAnalysis = useMemo(() => {
    if (!soulPalace || !result?.palaces) return null
    return analyzeSoulPalace(soulPalace, result.palaces)
  }, [soulPalace, result])

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gold-400 font-serif mb-3">紫微斗数</h1>
      <p className="text-gray-400 mb-6">紫微斗数命盘排盘——四化·庙旺·大限·格局全解析</p>

      {/* Input Card */}
      <div className="bg-dark-800/80 backdrop-blur rounded-xl border border-dark-600 p-6 mb-8 max-w-lg mx-auto">
        <CalendarInput
          calendarType={calendarType}
          year={year}
          month={month}
          day={day}
          hour={hour}
          isLeapMonth={isLeapMonth}
          onCalendarTypeChange={setCalendarType}
          onYearChange={setYear}
          onMonthChange={setMonth}
          onDayChange={setDay}
          onHourChange={setHour}
          onLeapMonthChange={setIsLeapMonth}
          label="出生日期"
        />

        {/* Gender */}
        <div className="mt-4">
          <label className="text-sm text-gray-400 block mb-1">性别</label>
          <div className="flex bg-dark-700 rounded-lg p-1 gap-1">
            <button
              onClick={() => setGender('M')}
              className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${gender === 'M' ? 'bg-blue-500 text-white' : 'text-gray-400 hover:text-gray-200'}`}
            >♂ 男</button>
            <button
              onClick={() => setGender('F')}
              className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${gender === 'F' ? 'bg-pink-500 text-white' : 'text-gray-400 hover:text-gray-200'}`}
            >♀ 女</button>
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-400 mt-3">{error}</p>
        )}

        <button onClick={analyze}
          className="w-full mt-4 bg-gold-600 hover:bg-gold-500 text-dark-900 font-semibold py-3 rounded-lg transition-colors active:scale-[0.98] text-lg">
          排盘
        </button>
        <p className="text-center text-[10px] text-gray-600 mt-2">
          {calendarType === 'solar' ? '阳历：公历日期直接排盘' : '阴历：农历日期自动换算为公历后进行排盘'}
        </p>
      </div>

      {result && (
        <div className="space-y-6">
          {/* 基本信息 */}
          <div className="bg-dark-800/80 backdrop-blur rounded-xl border border-dark-600 p-5">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 text-sm">
              <div><span className="text-gray-500">公历：</span><span className="text-gray-200">{result.solarDate}</span></div>
              <div><span className="text-gray-500">农历：</span><span className="text-gray-200">{result.lunarDate}</span></div>
              <div><span className="text-gray-500">干支：</span><span className="text-gray-200">{result.chineseDate}</span></div>
              <div><span className="text-gray-500">生肖：</span><span className="text-gray-200">{result.zodiac}</span></div>
              <div><span className="text-gray-500">星座：</span><span className="text-gray-200">{result.sign}</span></div>
              <div><span className="text-gray-500">五行局：</span><span className="text-gray-200">{result.fiveElementsClass}</span></div>
              <div><span className="text-gray-500">命主：</span><span className="text-gray-200">{result.soul}</span></div>
              <div><span className="text-gray-500">身主：</span><span className="text-gray-200">{result.body}</span></div>
              <div><span className="text-gray-500">时辰：</span><span className="text-gray-200">{result.time}（{result.timeRange}）</span></div>
              <div><span className="text-gray-500">性别：</span><span className="text-gray-200">{result.gender}</span></div>
            </div>
          </div>

          {/* ===== 命宫详解 ===== */}
          {soulAnalysis && (
            <div className="bg-dark-800/80 backdrop-blur rounded-xl border border-gold-500/30 p-6">
              <h3 className="text-lg font-semibold text-gold-400 font-serif mb-4 flex items-center gap-2">
                🏠 命宫详解
                <span className="text-xs text-gray-500 font-normal">{soulAnalysis.stem}{soulAnalysis.branch}</span>
              </h3>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <div>
                  <h4 className="text-sm font-medium text-gold-300 mb-3">✦ 主星亮度</h4>
                  {soulAnalysis.brightnessAnalysis.length > 0 ? (
                    <div className="space-y-2">
                      {soulAnalysis.brightnessAnalysis.map((b: any, i: number) => (
                        <div key={i} className="bg-dark-700/60 rounded-lg p-3 flex items-center justify-between">
                          <span className="text-sm font-semibold text-gray-200">{b.name}</span>
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-bold ${b.color}`}>{b.brightness}</span>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                              b.evaluation === '极佳' ? 'bg-green-900/50 text-green-300' :
                              b.evaluation === '良好' ? 'bg-blue-900/50 text-blue-300' :
                              b.evaluation === '一般' ? 'bg-yellow-900/50 text-yellow-300' :
                              b.evaluation === '偏弱' ? 'bg-orange-900/50 text-orange-300' :
                              'bg-red-900/50 text-red-300'
                            }`}>{b.evaluation}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-500">命宫无主星（借对宫安星）</p>
                  )}
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gold-300 mb-3">✦ 吉凶分析</h4>
                  <div className="bg-dark-700/60 rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">吉星</span>
                      <span className="text-sm text-green-400 font-semibold">{soulAnalysis.totalAuspicious} 颗</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">煞星</span>
                      <span className="text-sm text-red-400 font-semibold">{soulAnalysis.totalInauspicious} 颗</span>
                    </div>
                    <div className="border-t border-dark-600 pt-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400">综合评定</span>
                        <span className={`text-base font-bold ${soulAnalysis.fortuneColor}`}>{soulAnalysis.fortuneLevel}</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-1 leading-relaxed">{soulAnalysis.fortuneDesc}</p>
                    </div>
                  </div>

                  {soulAnalysis.sihuaAnalysis.length > 0 && (
                    <div className="mt-3">
                      <h4 className="text-xs font-medium text-gold-300 mb-2">✦ 四化飞星</h4>
                      <div className="space-y-1.5">
                        {soulAnalysis.sihuaAnalysis.map((s: any, i: number) => (
                          <div key={i} className="bg-dark-700/60 rounded p-2">
                            <span className="text-xs font-semibold text-gray-200">{s.star}</span>
                            <span className={`text-xs ml-2 ${s.color}`}>{s.mutagen}</span>
                            <p className="text-[10px] text-gray-500 mt-0.5">{s.interpret}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {soulAnalysis.patterns.length > 0 && (
                <div className="mt-5 pt-4 border-t border-dark-600">
                  <h4 className="text-sm font-medium text-gold-300 mb-3">✦ 格局分析</h4>
                  <div className="space-y-3">
                    {soulAnalysis.patterns.map((p: PatternResult, i: number) => (
                      <div key={i} className="bg-dark-700/60 rounded-lg p-4 flex items-start gap-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 mt-0.5 ${
                          p.rating === '上' || p.rating === '中上' ? 'bg-gold-900/50 text-gold-300 border border-gold-600/30' :
                          p.rating === '中' ? 'bg-blue-900/50 text-blue-300 border border-blue-600/30' :
                          'bg-gray-800 text-gray-400 border border-gray-600/30'
                        }`}>{p.rating}</span>
                        <div>
                          <p className="text-sm font-semibold text-gray-200">{p.name}</p>
                          <p className="text-xs text-gray-400 mt-1 leading-relaxed">{p.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 十二宫 */}
          <h3 className="text-lg font-semibold text-gold-300 font-serif">十二宫 · 四化 · 庙旺 · 大限</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {result.palaces.map((palace: any) => {
              const majors = palace.majorStars || []
              const minors = [...(palace.minorStars || []), ...(palace.adjectiveStars || [])]

              return (
                <div key={palace.index}
                  className={`rounded-xl border p-3 backdrop-blur transition-all ${
                    palace.name === '命宫'
                      ? 'border-gold-500 bg-gold-900/20 shadow-lg shadow-gold-500/10'
                      : palace.isBodyPalace
                      ? 'border-gold-500/60 bg-gold-900/15'
                      : 'border-dark-600 bg-dark-800/80'
                  }`}>
                  <div className="flex items-center justify-between mb-1">
                    <p className={`text-xs font-medium ${palace.name === '命宫' ? 'text-gold-300' : 'text-gold-400'}`}>
                      {palace.name}
                      {palace.name === '命宫' && <span className="ml-1 text-[9px] text-gold-500">命</span>}
                      {palace.isBodyPalace && <span className="ml-1 text-[9px] text-gold-300">身</span>}
                    </p>
                    {palace.decadal && (
                      <p className="text-[9px] text-gray-500">{palace.decadal.range[0]}-{palace.decadal.range[1]}岁</p>
                    )}
                  </div>
                  <p className="text-[9px] text-gray-600 mb-2">{palace.heavenlyStem}{palace.earthlyBranch}</p>

                  {majors.length > 0 ? majors.map((star: any, i: number) => (
                    <p key={i} className="text-xs font-semibold text-gold-300 flex items-center gap-1 flex-wrap">
                      <span>{star.name}</span>
                      {star.brightness && BRIGHTNESS[star.brightness] && (
                        <span className={`text-[9px] ${BRIGHTNESS[star.brightness].color}`}>
                          {BRIGHTNESS[star.brightness].label}
                        </span>
                      )}
                      {star.mutagen && MUTAGEN[star.mutagen] && (
                        <span className={`text-[9px] ${MUTAGEN[star.mutagen].color}`}>
                          {MUTAGEN[star.mutagen].label}
                        </span>
                      )}
                    </p>
                  )) : (
                    <p className="text-[10px] text-gray-600 italic">—</p>
                  )}

                  {minors.length > 0 && (
                    <div className="mt-1 pt-1 border-t border-dark-600 flex flex-wrap gap-x-1.5">
                      {minors.map((star: any, i: number) => (
                        <span key={i} className={`text-[9px] ${star.type === 'bad' ? 'text-red-400' : 'text-cyan-300'}`}>
                          {star.name}{' '}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
