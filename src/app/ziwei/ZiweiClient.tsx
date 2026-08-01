'use client'

import { useState, useMemo, useCallback, useRef } from 'react'
import { astro } from 'iztro'
import { getMaxDay, lunarToSolarDate, getYearLeapMonth } from '@/components/CalendarInput'
import { analyzeSiHua, getWuXingJuMeaning, getExtraPatterns } from '@/lib/ziwei-enrich'
import LoadingSpinner from '@/components/LoadingSpinner'
import Breadcrumb from '@/components/Breadcrumb'
import { exportAsPng } from '@/utils/export-image'
import { saveToHistory } from '@/lib/history'
import { useLocale, useT } from '@/lib/i18n'
import { getStarDesc, getPalaceName, getBrightnessLabel } from '@/lib/ziwei-data'

// ── Types ──
type CalendarType = 'solar' | 'lunar'

// ── Brightness (iztro returns Chinese chars) ──
const BRIGHTNESS: Record<string, { label: string; color: string; level: number; score: number }> = {
  '庙': { label: '廟', color: 'text-gold-600', level: 5, score: 100 },
  '旺': { label: '旺', color: 'text-gold-600', level: 4, score: 80 },
  '得': { label: '得', color: 'text-gold-500',  level: 3, score: 60 },
  '利': { label: '利', color: 'text-gold-500',  level: 2, score: 40 },
  '平': { label: '平', color: 'text-gray-500', level: 1, score: 20 },
  '不': { label: '不', color: 'text-gold-500/80', level: -1, score: 10 },
  '陷': { label: '陷', color: 'text-gold-600',   level: -2, score: 0 },
  '':   { label: '—',  color: 'text-gray-400',  level: 0,  score: 0 },
}

const MUTAGEN: Record<string, { label: string; color: string }> = {
  '禄': { label: '化祿', color: 'text-gold-500' },
  '权': { label: '化權', color: 'text-gold-600' },
  '科': { label: '化科', color: 'text-gold-500' },
  '忌': { label: '化忌', color: 'text-gold-600' },
}

const JI_XING = new Set(['左辅','右弼','文昌','文曲','天魁','天钺','禄存','天马','三台','八座','恩光','天贵','龙池','凤阁','台辅','封诰','天福','天官','天厨','天才','天寿','解神','天德','月德'])
const SHA_XING = new Set(['擎羊','陀罗','火星','铃星','地空','地劫','天刑','天姚','阴煞','劫煞','破碎','蜚廉','孤辰','寡宿','天哭','天虚','空亡','旬空','截路','天空','天殇','天使','年解'])

const HOUR_OPTIONS = [
  { value: '0', label: '子 23:00~00:59' }, { value: '1', label: '丑 01:00~02:59' },
  { value: '2', label: '寅 03:00~04:59' }, { value: '3', label: '卯 05:00~06:59' },
  { value: '4', label: '辰 07:00~08:59' }, { value: '5', label: '巳 09:00~10:59' },
  { value: '6', label: '午 11:00~12:59' }, { value: '7', label: '未 13:00~14:59' },
  { value: '8', label: '申 15:00~16:59' }, { value: '9', label: '酉 17:00~18:59' },
  { value: '10', label: '戌 19:00~20:59' }, { value: '11', label: '亥 21:00~22:59' },
]

// ── 4x4 table layout by earthlyBranch ──
const CHART_ROWS: (string | null)[][] = [
  ['巳', '午', '未', '申'],
  ['辰', null, null, '酉'],
  ['卯', '戌', null, null],
  ['寅', '丑', '子', '亥'],
]



// ── Pattern/格局 Library ──
interface PatternDef { name: string; desc: string; rating: string }
interface StarInfo { name: string; brightness?: string; mutagen?: string }

type PalaceForPattern = { name: string; majorStars: StarInfo[]; minorStars: StarInfo[]; adjectiveStars: StarInfo[]; earthlyBranch: string }

function detectPatterns(palaces: PalaceForPattern[], bornSihua: { star: string }[]): PatternDef[] {
  const patterns: PatternDef[] = []
  const getP = (n: string) => palaces.find(p => p.name === n)
  const getStars = (n: string) => (getP(n)?.majorStars || []).map((s: StarInfo) => s.name)
  const soul = getP('命宫')
  const sb = soul?.earthlyBranch || ''
  const has = (n: string, star: string) => (getStars(n) || []).includes(star)
  const hasAny = (n: string, stars: string[]) => stars.some(s => (getStars(n) || []).includes(s))

  // 三方四正：命宫 + 财帛 + 官禄
  const triStars = (p: string) => {
    const q = getP(p); if (!q) return []
    return [...(q.majorStars || []).map(s => s.name), ...(q.minorStars || []).map(s => s.name), ...(q.adjectiveStars || []).map(s => s.name)]
  }
  const triAll = [...new Set([...triStars('命宫'), ...triStars('财帛'), ...triStars('官禄')])]
  const triHas = (star: string) => triAll.includes(star)
  const triHasAny = (stars: string[]) => stars.some(s => triAll.includes(s))
  // 迁移宫（对宫）

  // ═══════════════════════════════════════════
  // 顶级格局（上格）
  // ═══════════════════════════════════════════

  // 紫府同宫
  if (has('命宫', '紫微') && has('命宫', '天府'))
    patterns.push({ name: '紫府同宮格', desc: '紫微天府二帝星同守命宮，帝王之象，主貴氣非凡，一生衣食無憂，事業有成。' + (sb === '寅' || sb === '申' ? '寅申為正格，格局更高。' : ''), rating: '上' })

  // 君臣庆会
  if (has('命宫', '紫微') && hasAny('命宫', ['左辅', '右弼']))
    patterns.push({ name: '君臣慶會格', desc: '紫微帝星得左右輔弼拱照，君臣相得，主貴氣加身，有領導才能，得貴人相助。', rating: '上' })

  // 日照雷门
  if (has('命宫', '太阳') && sb === '卯')
    patterns.push({ name: '日照雷門格', desc: '旭日東升於卯，如日照雷門，光輝燦爛。主早年發達，聲名遠播。', rating: '上' })

  // 日丽中天
  if (has('命宫', '太阳') && sb === '午')
    patterns.push({ name: '日麗中天格', desc: '太陽居午宮，如日中天，光輝至極。主權勢顯赫，名揚四海。', rating: '上' })

  // 月朗天门
  if (has('命宫', '太阴') && sb === '亥')
    patterns.push({ name: '月朗天門格', desc: '太陰在亥為月朗天門，主溫潤清貴，智慧過人，適合文職、藝術。', rating: '上' })

  // 月生沧海
  if (has('命宫', '太阴') && sb === '酉')
    patterns.push({ name: '月生滄海格', desc: '太陰在酉，如月出海，主富貴清雅，宜文職才藝。', rating: '上' })

  // 七杀朝斗
  if (has('命宫', '七杀') && hasAny('迁移', ['紫微', '天府']))
    patterns.push({ name: '七殺朝斗格', desc: '七殺在命，對宮紫微天府照拱，為上貴格局。作風強勢，攻擊力強，有領導力。' + (sb === '寅' || sb === '申' ? '寅申為正格。' : ''), rating: '上' })

  // 武贪格
  if (has('命宫', '武曲') && has('命宫', '贪狼'))
    patterns.push({ name: '武貪不發少年格', desc: '武曲貪狼守命，主中年後大發達，少年辛苦磨練。' + (sb === '丑' || sb === '未' ? '丑未為正格。' : ''), rating: '上' })

  // 紫微朝垣（三方见紫微）
  if (!has('命宫', '紫微') && triHas('紫微'))
    patterns.push({ name: '紫微朝垣格', desc: '三方四正中紫微照拱，貴氣加身，得上司提攜，有領導才能。', rating: '上' })

  // 三奇加会（科权禄）
  const sihuaLabels = bornSihua.map(s => s.star)
  if (sihuaLabels.length >= 3 && ['禄', '权', '科'].every(t => bornSihua.some(s => s.star.includes(t) || t === '')))
    patterns.push({ name: '三奇加會格', desc: '科權祿三奇會合，主才華出眾，名利雙收，一生有特殊成就。', rating: '上' })

  // ═══════════════════════════════════════════
  // 中上级格局
  // ═══════════════════════════════════════════

  // 府相朝垣
  if (triHas('天府') && triHas('天相'))
    patterns.push({ name: '府相朝垣格', desc: '天府天相在三方四正朝照，穩重踏實，一生衣食豐足，宜從事金融、管理行業。', rating: '中上' })

  // 机月同梁
  if (['天机', '太阴', '天同', '天梁'].filter(x => triHas(x)).length >= 3)
    patterns.push({ name: '機月同梁格', desc: '天機、太陰、天同、天梁在三方四正齊聚，主智謀機變，宜公職、策劃、文秘之職。吏人優裕之格。', rating: '中上' })

  // 阳梁昌禄
  if (triHas('太阳') && triHas('天梁') && triHasAny(['文昌', '禄存']))
    patterns.push({ name: '陽梁昌祿格', desc: '太陽天梁配文昌或祿存，主科甲功名，利學業考試，適合學術研究。', rating: '中上' })

  // 文星拱命
  if (['文昌', '文曲', '左辅', '右弼', '天魁', '天钺'].filter(x => triHas(x)).length >= 4)
    patterns.push({ name: '文星拱命格', desc: '輔弼昌曲魁鉞會照，聰明多藝，宜文職、學術研究，文采出眾。', rating: '中上' })

  // 紫微+七杀/破军/贪狼
  if (has('命宫', '紫微') && has('命宫', '七杀'))
    patterns.push({ name: '紫殺格', desc: '紫微七殺同守命宮，化殺為權，威權顯赫，宜軍警、管理。', rating: '中上' })
  if (has('命宫', '紫微') && has('命宫', '破军'))
    patterns.push({ name: '紫破格', desc: '紫微破軍同守命宮，開創性強，宜創業、革新，但變動較大。', rating: '中上' })
  if (has('命宫', '紫微') && has('命宫', '贪狼'))
    patterns.push({ name: '紫貪格', desc: '紫微貪狼同守命宮，多才多藝，桃花旺盛，宜演藝、公關行業。', rating: '中' })

  // 廉贞组合
  if (has('命宫', '廉贞') && has('命宫', '七杀'))
    patterns.push({ name: '廉貞七殺格', desc: '廉貞七殺同守命宮，積富之人。性格果決剛毅，做事雷厲風行。', rating: '中上' })
  if (has('命宫', '廉贞') && has('命宫', '破军'))
    patterns.push({ name: '廉貞破軍格', desc: '廉貞破軍同守命宮，浪裡行舟，變動多端，宜開拓型事業。', rating: '中' })
  if (has('命宫', '廉贞') && has('命宫', '天府'))
    patterns.push({ name: '廉府格', desc: '廉貞天府同守命宮，才華內斂，能文能武，宜管理、行政。', rating: '中上' })
  if (has('命宫', '廉贞') && has('命宫', '天相'))
    patterns.push({ name: '廉相格', desc: '廉貞天相同守命宮，能文能武，宜公務、服務行業。', rating: '中' })
  if (has('命宫', '廉贞') && has('命宫', '贪狼') && (sb === '巳' || sb === '亥'))
    patterns.push({ name: '泛水桃花格', desc: '廉貞貪狼居巳亥，泛水桃花，風流倜儻，才華出眾，但感情複雜。', rating: '中' })

  // 武曲组合
  if (has('命宫', '武曲') && has('命宫', '七杀'))
    patterns.push({ name: '武殺格', desc: '武曲七殺同守命宮，剛毅果決，宜軍警、工業、外科醫生。', rating: '中' })
  if (has('命宫', '武曲') && has('命宫', '破军'))
    patterns.push({ name: '武破格', desc: '武曲破軍同守命宮，動盪中求發展，宜開創新事業。', rating: '中' })
  if (has('命宫', '武曲') && has('命宫', '天府'))
    patterns.push({ name: '武府格', desc: '武曲天府同守命宮，文武兼備，剛柔並濟，宜管理崗位，財運穩定。', rating: '中上' })
  if (has('命宫', '武曲') && has('命宫', '天相'))
    patterns.push({ name: '武相格', desc: '武曲天相同守命宮，剛正不阿，宜公職、企業管理。', rating: '中上' })

  // ═══════════════════════════════════════════
  // 中级格局
  // ═══════════════════════════════════════════

  // 巨日
  if (has('命宫', '巨门') && has('命宫', '太阳'))
    patterns.push({ name: '巨日同宮格', desc: '巨門與太陽同宮，以口為業，宜律師、教師、媒體等行業，能言善辯。', rating: '中' })

  // 巨机
  if (has('命宫', '巨门') && has('命宫', '天机'))
    patterns.push({ name: '巨機同臨格', desc: '巨門天機同守命宮，智慧過人，口才出眾，宜研究、顧問行業。', rating: '中' })

  // 杀破狼
  if (['七杀', '破军', '贪狼'].filter(x => triHas(x)).length >= 2)
    patterns.push({ name: '殺破狼格', desc: '七殺、破軍、貪狼在三方四正，主變動、開創、冒險精神強。一生波瀾壯闊，宜創業從商。', rating: '中' })

  // 同梁
  if (triHas('天同') && triHas('天梁'))
    patterns.push({ name: '同梁拱照格', desc: '天同天梁在三方照拱，福壽雙全，宜慈善、宗教、公務行業。', rating: '中上' })

  // 同阴
  if (has('命宫', '天同') && has('命宫', '太阴'))
    patterns.push({ name: '同陰格', desc: '天同太陰同守命宮，溫柔體貼，宜服務、藝術行業。', rating: '中' })

  // 禄马交驰
  if ((has('命宫', '禄存') && triHas('天马')) || (triHas('禄存') && triHas('天马')))
    patterns.push({ name: '祿馬交馳格', desc: '祿存天馬交會，主奔波勞碌而招財，宜外地發展、經商貿易。', rating: '中' })

  // 六吉汇聚
  const liuji = ['左辅', '右弼', '文昌', '文曲', '天魁', '天钺']
  const liujiCount = liuji.filter(x => triHas(x)).length
  if (liujiCount >= 3)
    patterns.push({ name: '六吉拱命格', desc: `六吉星中${liujiCount}顆會照三方四正，貴人多助，處處逢源，事半功倍。`, rating: liujiCount >= 5 ? '上' : '中上' })

  // 六煞回避
  const liusha = ['擎羊', '陀罗', '火星', '铃星', '地空', '地劫']
  const liushaCount = liusha.filter(x => triHas(x)).length
  if (liushaCount >= 3)
    patterns.push({ name: '六煞聚會格', desc: `六煞星中${liushaCount}顆在三方四正，一生多波折考驗，需修身養性，行善積德化解。`, rating: '中下' })

  // 空劫拱命
  if (triHas('地空') && triHas('地劫'))
    patterns.push({ name: '空劫夾命格', desc: '地空地劫在三方四正，思想獨特，不入俗流，宜創意、藝術行業，但需防虛幻不實。', rating: '中' })

  // 昌曲夹命
  if (triHas('文昌') && triHas('文曲'))
    patterns.push({ name: '昌曲拱命格', desc: '文昌文曲在三方四正，文采出眾，學業有成，宜學術、文學、藝術。', rating: '中上' })

  // 魁钺夹命
  if (triHas('天魁') && triHas('天钺'))
    patterns.push({ name: '魁鉞拱命格', desc: '天魁天鉞在三方四正，貴人運極佳，得上司長輩提攜，宜公職。', rating: '中上' })

  // 日月并明
  if (triHas('太阳') && triHas('太阴'))
    patterns.push({ name: '日月並明格', desc: '太陽太陰在三方四正，陰陽調和，事業家庭兩全，一生光明磊落。', rating: '中上' })

  // 辅弼拱主
  if (has('命宫', '紫微') && triHasAny(['左辅', '右弼']))
    patterns.push({ name: '輔弼拱主格', desc: '紫微坐命，左輔右弼在三方拱照，帝星得輔，權威更盛。', rating: '上' })

  return patterns
}

// ── Star info type ──
interface FullStarInfo { name: string; brightness: string; mutagen: string; type: string; scope: string }

// ── Component ──
export default function ZiweiClient() {
  const { locale } = useLocale()
  const getT = useT()
  const now = new Date()
  const [calendarType, setCalendarType] = useState<CalendarType>('solar')
  const [year, setYear] = useState(String(now.getFullYear()))
  const [month, setMonth] = useState(String(now.getMonth() + 1))
  const [day, setDay] = useState(String(now.getDate()))
  const [hour, setHour] = useState('6')
  const [gender, setGender] = useState<'M' | 'F'>('M')
  const [isLeap, setIsLeap] = useState(false)
  const [result, setResult] = useState<Record<string, unknown> | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const exportRef = useRef<HTMLDivElement>(null)

  const y = parseInt(year) || 2000
  const m = parseInt(month) || 1
  const d = parseInt(day) || 1

  const maxDay = useMemo(() => getMaxDay(calendarType, y, m), [calendarType, y, m])
  // Use clamped day (derived, not state) for all computations
  const clampedDay = String(Math.min(parseInt(day) || 1, maxDay))
  const yearLeap = useMemo(() => calendarType === 'lunar' ? getYearLeapMonth(y) : 0, [calendarType, y])
  const hasLeap = calendarType === 'lunar' && yearLeap === m

  const validationMsg = useMemo(() => {
    if (y < 1 || y > 3400) return '年份需在 1-3400 之間'
    if (m < 1 || m > 12) return '請輸入有效月份'
    if (d < 1 || d > maxDay) return `${calendarType === 'solar' ? `${y}年${m}月` : `農曆${m}月`}有 ${maxDay} 天`
    return ''
  }, [y, m, d, maxDay, calendarType])

  const analyze = useCallback(() => {
    setError('')
    setLoading(true)
    if (validationMsg) { setError(validationMsg); setLoading(false); return }
    try {
      // CalendarInput 的 hour 值用的是地支索引 (0=子,6=午,11=亥), 需转成实际小时数
      const h = ((parseInt(hour) || 6) * 2 + 23) % 24
      const sd = calendarType === 'solar'
        ? `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
        : lunarToSolarDate(y, m, d, isLeap)
      const r = astro.bySolar(sd, h, gender === 'M' ? 'male' : 'female')
      setResult(r as unknown as Record<string, unknown>)
      saveToHistory({type:'ziwei', dateStr: `${calendarType === 'solar' ? '公历' : '农历'} ${y}年${m}月${d}日`, bazi: `${gender === 'M' ? '男' : '女'}命 · 时${HOUR_OPTIONS.find(o => o.value === hour)?.label || ''}`, preview: `五行局: ${(r as { fiveElementsClass?: string })?.fiveElementsClass || ''}` })
      setLoading(false)
    } catch (e: unknown) { setError((e as Error)?.message || '日期格式有誤'); setLoading(false) }
  }, [y, m, d, hour, calendarType, isLeap, gender, validationMsg])

  // ── Derived data ──
  type PalaceRaw = { name: string; earthlyBranch: string; heavenlyStem: string; isBodyPalace?: boolean; majorStars: FullStarInfo[]; minorStars: FullStarInfo[]; adjectiveStars: FullStarInfo[]; decadal?: { range: [number, number] }; ages?: { range: [number, number] } }
  const palaces = useMemo(() => (result?.palaces || []) as PalaceRaw[], [result])
  const palaceMap = useMemo(() => Object.fromEntries(palaces.map(p => [p.earthlyBranch, p])), [palaces])
  const soulPalace = palaces.find(p => p.name === '命宫')
  // ── Sihua (scan all palaces) ──
  const bornSihua = useMemo(() => {
    const list: { star: string; label: string; color: string }[] = []
    for (const p of palaces) {
      for (const s of p.majorStars || []) {
        if (s.mutagen && MUTAGEN[s.mutagen]) {
          list.push({ star: s.name, label: MUTAGEN[s.mutagen].label, color: MUTAGEN[s.mutagen].color })
        }
      }
    }
    return list
  }, [palaces])

  // ── Brightness score ──
  const brightnessScore = useMemo(() => {
    const ms = (soulPalace?.majorStars || []) as FullStarInfo[]
    if (ms.length === 0) return 50
    return Math.round(ms.reduce((sum, s) => sum + (BRIGHTNESS[s.brightness || ''] || BRIGHTNESS['']).score, 0) / ms.length)
  }, [soulPalace])

  // ── Auspicious stats (命宫 + 迁移宫) ──
  const auspiciousStats = useMemo(() => {
    const qy = palaceMap['申'] // opposite palace (迁移)
    const allSoulStars = [
      ...(soulPalace?.majorStars || []).map((s: FullStarInfo) => s.name),
      ...(soulPalace?.minorStars || []).map((s: FullStarInfo) => s.name),
      ...(soulPalace?.adjectiveStars || []).map((s: FullStarInfo) => s.name),
    ]
    const allQyStars = qy ? [
      ...(qy.majorStars || []).map((s: FullStarInfo) => s.name),
      ...(qy.minorStars || []).map((s: FullStarInfo) => s.name),
      ...(qy.adjectiveStars || []).map((s: FullStarInfo) => s.name),
    ] : []
    const combined = [...allSoulStars, ...allQyStars]
    const ji = combined.filter(x => JI_XING.has(x)).length
    const sha = combined.filter(x => SHA_XING.has(x)).length
    const jiList = combined.filter(x => JI_XING.has(x))
    const shaList = combined.filter(x => SHA_XING.has(x))
    return { ji, sha, jiList: jiList.join(' '), shaList: shaList.join(' ') }
  }, [soulPalace, palaceMap])

  const { ji: auspCount, sha: inauspCount } = auspiciousStats
  const auspIndex = auspCount + inauspCount > 0 ? Math.round((auspCount / (auspCount + inauspCount)) * 100) : 50
  const fortuneScore = Math.round((brightnessScore + auspIndex) / 2)

  // ── Patterns ──
  const patterns = useMemo(() => {
    if (!soulPalace) return []
    return detectPatterns(palaces as PalaceForPattern[], bornSihua as { star: string }[])
  }, [soulPalace, palaces, bornSihua])
  const patternIndex = patterns.length > 0 ? Math.min(100, 50 + patterns.length * 15) : 50

  // SiHua analysis
  const sihuaAnalysis = (() => {
    const list = bornSihua.map(s => ({
      star: s.star,
      hua: (s.label || '').replace('化', ''),
      gong: ''
    }));
    return list.length > 0 ? analyzeSiHua(list) : null;
  })()

  // ── Star descriptions ──
  const soulStarDescs = useMemo(() => {
    if (!soulPalace) return []
    const ms = (soulPalace.majorStars || []).map((s: FullStarInfo) => s.name)
    const ns = [...(soulPalace.minorStars || []), ...(soulPalace.adjectiveStars || [])].map((s: FullStarInfo) => s.name)
    const descs: { name: string; desc: string }[] = []
    for (const name of ms) { const d = getStarDesc(name, locale); if (d) descs.push({ name, desc: d }) }
    for (const name of ns) { const d = getStarDesc(name, locale); if (d) descs.push({ name, desc: d }) }
    return descs
  }, [soulPalace])

  const soulDisplayName = soulPalace ? getPalaceName(soulPalace.name, locale) : '—'
  const zodiac = (result?.zodiac as string) || ''
  const fiveElem = (result?.fiveElementsClass as string) || ''
  const wuXingJuMeaning = getWuXingJuMeaning(fiveElem)
  const soul = (result?.soul as string) || ''
  const body = (result?.body as string) || ''
  const solarDate = (result?.solarDate as string) || ''
  const lunarDate = (result?.lunarDate as string) || ''
  const chineseDate = (result?.chineseDate as string) || ''
  const timeRange = (result?.timeRange as string) || HOUR_OPTIONS.find(o => o.value === hour)?.label || ''

  // ═══ BUILD PALACE CELL DATA ═══
  const renderPalaceCell = (branch: string) => {
    const p = palaceMap[branch]
    if (!p) return <td key={branch} className="border border-dark-600 p-1.5 bg-dark-900/30 text-[9px] text-gray-600 align-top">{branch}</td>
    const isSoul = p.name === '命宫'
    const isBody = p.isBodyPalace
    const displayName = getPalaceName(p.name, locale)
    const majors = (p.majorStars || []) as FullStarInfo[]
    const minors = [...(p.minorStars || []), ...(p.adjectiveStars || [])] as FullStarInfo[]
    const bg = isSoul ? 'bg-gold-900/25 border-gold-400 shadow-[0_0_8px_rgba(200,160,80,0.3)]'
      : isBody ? 'bg-gold-900/15 border-gold-500/50'
      : 'bg-dark-800/70 border-dark-600'
    return (
      <td key={branch} className={`border p-1.5 align-top ${bg}`}>
        <p className="text-[9px] text-gray-600 mb-0.5">{p.heavenlyStem}{p.earthlyBranch}</p>
        <p className={`font-semibold text-xs mb-0.5 ${isSoul ? 'text-gold-300' : 'text-gold-400'}`}>
          {displayName}
          {isBody && <span className="text-[8px] text-gold-500 ml-0.5">身</span>}
        </p>
        {p.decadal?.range && <p className="text-[8px] text-gray-500">大限:{p.decadal.range[0]}-{p.decadal.range[1]}</p>}
        {majors.length > 0 ? (
          <div className="mt-0.5">
            {majors.map((s, i) => {
              const b = BRIGHTNESS[s.brightness || ''] || BRIGHTNESS['']
              const mu = s.mutagen && MUTAGEN[s.mutagen] ? MUTAGEN[s.mutagen] : null
              return (
                <span key={i} className="text-[10px] text-gold-300 font-semibold">
                  {s.name}{b.label !== '—' && <span className={`text-[8px] ${b.color}`}>{b.label}</span>}
                  {mu && <span className={`text-[8px] ${mu.color}`}>{mu.label}</span>}
                  {i < majors.length - 1 && ' '}
                </span>
              )
            })}
          </div>
        ) : <p className="text-[9px] text-gray-600 italic">—</p>}
        {minors.length > 0 && (
          <p className="text-[8px] text-gray-500 leading-relaxed mt-0.5">
            {minors.map((s, i) => (
              <span key={i} className={SHA_XING.has(s.name) ? 'text-gold-600/80' : 'text-gold-600/80'}>
                {s.name}{i < minors.length - 1 ? ',' : ''}
              </span>
            ))}
          </p>
        )}
      </td>
    )
  }

  // ═══ RENDER ═══
  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <Breadcrumb items={[{label:getT('nav.home'),href:'/'},{label:getT('nav.tools')},{label:getT('ziweiPage.title')}]} />
      <h1 className="text-3xl font-bold text-gold-400 font-serif mb-2">{getT('ziweiPage.title')}</h1>
      <p className="text-gray-400 mb-6 text-sm">{getT('ziweiPage.subtitle')}</p>

      {/* ═══ Input Form ═══ */}
      <div className="bg-dark-800/80 rounded-xl border border-dark-600 p-5 mb-8 max-w-2xl mx-auto">
        <table className="w-full text-sm"><tbody>
          <tr>
            <td className="text-gray-400 pr-3 py-1.5 w-12 align-middle">{getT('ziweiPage.genderLabel')}</td>
            <td className="py-1.5">
              <label className="inline-flex items-center gap-1 cursor-pointer mr-5">
                <input type="radio" name="gender" checked={gender === 'M'} onChange={() => setGender('M')} className="accent-gold-500" />
                <span className="text-gray-200">{getT('ziweiPage.male')}</span>
              </label>
              <label className="inline-flex items-center gap-1 cursor-pointer">
                <input type="radio" name="gender" checked={gender === 'F'} onChange={() => setGender('F')} className="accent-gold-500" />
                <span className="text-gray-200">{getT('ziweiPage.female')}</span>
              </label>
            </td>
          </tr>
          <tr>
            <td className="text-gray-400 pr-3 py-1.5 align-middle">{getT('ziweiPage.dateLabel')}</td>
            <td className="py-1.5 flex items-center gap-1.5 flex-wrap">
              <select value={calendarType} onChange={e => { setCalendarType(e.target.value as CalendarType); setIsLeap(false) }}
                className="px-2 min-h-[44px] bg-dark-700 border border-dark-500 rounded text-gray-200 text-sm">
                <option value="solar">{getT('ziweiPage.calendarSolar')}</option>
                <option value="lunar">{getT('ziweiPage.calendarLunar')}</option>
              </select>
              <select value={year} onChange={e => setYear(e.target.value)}
                className="px-1.5 min-h-[44px] bg-dark-700 border border-dark-500 rounded text-gray-200 text-sm text-center">
                {Array.from({ length: 200 }, (_, i) => 1900 + i).map(v => <option key={v} value={v}>{v}</option>)}
              </select>
              <span className="text-gray-500 text-sm">{getT('ziweiPage.year')}</span>
              <select value={month} onChange={e => { setMonth(e.target.value); setIsLeap(false) }}
                className="px-1.5 min-h-[44px] bg-dark-700 border border-dark-500 rounded text-gray-200 text-sm">
                {Array.from({ length: 12 }, (_, i) => <option key={i + 1} value={i + 1}>{i + 1}</option>)}
              </select>
              <span className="text-gray-500 text-sm">{getT('ziweiPage.month')}</span>
              {hasLeap && (
                <label className="flex items-center gap-1 text-[10px] text-gold-500 cursor-pointer">
                  <input type="checkbox" checked={isLeap} onChange={e => setIsLeap(e.target.checked)} /> {getT('ziweiPage.leapMonth')}
                </label>
              )}
              <select value={clampedDay} onChange={e => setDay(e.target.value)}
                className="px-1.5 min-h-[44px] bg-dark-700 border border-dark-500 rounded text-gray-200 text-sm">
                {Array.from({ length: maxDay }, (_, i) => <option key={i + 1} value={i + 1}>{i + 1}</option>)}
              </select>
              <span className="text-gray-500 text-sm">{getT('ziweiPage.day')}</span>
              <select value={hour} onChange={e => setHour(e.target.value)}
                className="px-1 min-h-[44px] bg-dark-700 border border-dark-500 rounded text-gray-200 text-[11px]">
                {HOUR_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </td>
          </tr>
        </tbody></table>
        {error && <p className="text-xs text-gold-600 mt-2">{error}</p>}
        {validationMsg && <p className="text-xs text-gold-500 mt-2">⚠ {validationMsg}</p>}
        <div className="mt-4 flex gap-2">
          <button onClick={analyze} disabled={!!validationMsg}
            className="bg-gold-600 hover:bg-gold-500 text-dark-900 font-semibold px-6 min-h-[44px] rounded-lg text-sm transition-colors disabled:opacity-50">
            {getT('ziweiPage.submit')}
          </button>
          <button onClick={() => { setResult(null); setError('') }}
            className="border border-dark-500 text-gray-400 hover:text-gray-200 px-4 min-h-[44px] rounded-lg text-sm transition-colors">
            {getT('ziweiPage.clear')}
          </button>
        </div>
      </div>

      {loading && <LoadingSpinner size="md" text={getT('ziweiPage.loading')} />}

      {/* ═══ Results ═══ */}
      {result && (
        <div ref={exportRef} className="space-y-6">
          {/* ── Control Bar ── */}
          <div className="bg-dark-800/60 rounded-lg border border-dark-600 p-3 text-sm flex items-center gap-4 flex-wrap">
            <span className="text-gray-400 text-xs">流月起始宮位</span>
            <label className="text-gray-200 text-xs"><input type="radio" name="flow" defaultChecked className="mr-1 accent-gold-500" />流月起始宮位</label>
            <label className="text-gray-500 text-xs"><input type="radio" name="flow" className="mr-1" />流年本宮</label>
            <label className="text-gray-500 text-xs"><input type="radio" name="flow" className="mr-1" />流年斗君</label>
            <span className="text-gray-600 mx-1">|</span>
            <select className="px-2 py-1 bg-dark-700 border border-dark-500 rounded text-gray-200 text-xs">
              <option>國曆</option><option>農曆</option>
            </select>
            <select className="px-1.5 py-1 bg-dark-700 border border-dark-500 rounded text-gray-200 text-xs" value={year} onChange={e => setYear(e.target.value)}>
              {Array.from({ length: 200 }, (_, i) => 1900 + i).map(v => <option key={v} value={v}>{v}</option>)}
            </select>
            <button className="px-2 min-h-[44px] text-xs bg-gold-600/20 border border-gold-500/30 rounded text-gold-400 hover:bg-gold-600/40">流年</button>
            <button className="px-2 min-h-[44px] text-xs border border-dark-500 rounded text-gray-500 hover:text-gray-300">流月</button>
            <button className="px-2 min-h-[44px] text-xs border border-dark-500 rounded text-gray-500 hover:text-gray-300">流日</button>
            <button className="px-2 min-h-[44px] text-xs border border-dark-500 rounded text-gray-500 hover:text-gray-300">流時</button>
          </div>

          {/* ── 12-Palace Table ── */}
          <h2 className="text-lg font-semibold text-gold-400 font-serif">
            本命：{soulDisplayName}
            <span className="text-xs text-gray-500 font-normal ml-3">
              {getT('ziweiPage.goodFortune')}:<span className={`font-bold ${fortuneScore >= 80 ? 'text-gold-600' : fortuneScore >= 60 ? 'text-gold-500' : fortuneScore >= 40 ? 'text-gold-600' : 'text-gold-600'}`}>{fortuneScore}</span>
            </span>
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse" style={{ minWidth: 600 }}>
              <tbody>
                {CHART_ROWS.map((row, ri) => (
                  <tr key={ri}>
                    {row.map((branch, ci) => {
                      if (ri === 1 && ci === 1) {
                        return (
                          <td key="center" colSpan={2} className="border border-dark-600 bg-dark-850/80 p-3 text-center align-middle">
                            <div className="text-[10px] leading-relaxed text-gray-300 space-y-0.5">
                              <p>陽曆：{solarDate} {timeRange} {gender === 'M' ? '陽男' : '陰女'}</p>
                              <p>農曆：{lunarDate}</p>
                              <p>干支：{chineseDate}</p>
                              <p>五行局：{fiveElem}</p>
                              <p className="text-[9px]">
                                生年四化：{bornSihua.length > 0
                                  ? bornSihua.map((s, i) => <span key={i} className={`${s.color} font-semibold`}>{s.star}{s.label}{i < bornSihua.length - 1 ? '、' : ''}</span>)
                                  : <span className="text-gray-500">—</span>}
                              </p>
                              <p>命主：{soul}　身主：{body}</p>
                              <p className="text-gray-500">生肖：{zodiac}</p>
                            </div>
                          </td>
                        )
                      }
                      if (!branch) {
                        if (ri === 2 && (ci === 2 || ci === 3)) return <td key={ci} className="border border-dark-600 bg-dark-900/30" />
                        return null
                      }
                      return renderPalaceCell(branch)
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ── Brightness & Auspicious Analysis ── */}
          <div className="bg-dark-800/80 rounded-xl border border-gold-500/20 p-6">
            <h3 className="text-base font-semibold text-gold-400 font-serif mb-4">{getT('ziweiPage.brightnessTitle')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <table className="w-full text-xs"><tbody>
                  <tr className="border-b border-dark-600"><td className="py-1.5 text-gray-400 font-medium">{getT('ziweiPage.mainStar')}</td><td className="py-1.5 text-gray-400 font-medium">{getT('ziweiPage.brightnessLevel')}</td></tr>
                  {soulPalace && (soulPalace.majorStars as FullStarInfo[]).length > 0 ? (soulPalace.majorStars as FullStarInfo[]).map((s, i) => {
                    const b = BRIGHTNESS[s.brightness || ''] || BRIGHTNESS['']
                    return <tr key={i} className="border-b border-dark-700">
                      <td className="py-1.5 text-gray-200 font-semibold">{s.name}</td>
                      <td className={`py-1.5 ${b.color} font-semibold`}>{b.label} ({b.score})</td>
                    </tr>
                  }) : <tr><td colSpan={2} className="py-1.5 text-gray-500 text-xs">{getT('ziweiPage.noMainStar')}</td></tr>}
                </tbody></table>
                <p className="text-xs text-gray-400 mt-2">{getT('ziweiPage.brightnessIndex')}=<span className="text-gold-400 font-semibold">{brightnessScore}%</span></p>
              </div>
              <div>
                <table className="w-full text-xs"><tbody>
                  <tr className="border-b border-dark-600"><td className="py-1.5 text-gold-600 font-medium">{getT('ziweiPage.auspiciousStars')}</td><td className="py-1.5 text-gold-600 font-medium">{getT('ziweiPage.inauspiciousStars')}</td></tr>
                  <tr className="border-b border-dark-700">
                    <td className="py-1.5 text-gold-600/80 text-[10px]">{auspiciousStats.jiList || '—'}</td>
                    <td className="py-1.5 text-gold-600/80 text-[10px]">{auspiciousStats.shaList || '—'}</td>
                  </tr>
                  <tr>
                    <td className="py-1.5 text-gold-600 font-semibold">{getT('ziweiPage.auspiciousCount').replace('{n}', String(auspCount))}</td>
                    <td className="py-1.5 text-gold-600 font-semibold">{getT('ziweiPage.inauspiciousCount').replace('{n}', String(inauspCount))}</td>
                  </tr>
                </tbody></table>
                <p className="text-xs text-gray-400 mt-2">{getT('ziweiPage.auspiciousRatio').replace('{a}', String(auspCount)).replace('{b}', String(inauspCount))}=<span className="text-gold-400 font-semibold">{auspIndex}%</span></p>
                <p className="text-xs text-gray-400 mt-1">{getT('ziweiPage.goodFortune')}=<span className={`font-bold ${fortuneScore >= 80 ? 'text-gold-600' : fortuneScore >= 60 ? 'text-gold-500' : fortuneScore >= 40 ? 'text-gold-600' : 'text-gold-600'}`}>{fortuneScore}</span></p>
              </div>
            </div>
          </div>

          {/* ── Pattern Analysis ── */}
          <div className="bg-dark-800/80 rounded-xl border border-gold-500/20 p-6">
            {sihuaAnalysis && sihuaAnalysis.lu.star && (
            <div className="bg-dark-800/80 rounded-xl border border-dark-600 p-4 mb-4">
              <h3 className="text-sm font-semibold text-gold-300 font-serif mb-3 text-center">四化深度分析</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {sihuaAnalysis.lu.star && (
                <div className="bg-dark-700/60 rounded-lg p-2 text-center">
                  <p className="text-xs text-gray-500">化禄</p>
                  <p className="font-semibold text-gold-600 text-sm">{sihuaAnalysis.lu.star}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{sihuaAnalysis.lu.meaning.split('，').slice(1).join('，')}</p>
                </div>)}
                {sihuaAnalysis.quan.star && (
                <div className="bg-dark-700/60 rounded-lg p-2 text-center">
                  <p className="text-xs text-gray-500">化权</p>
                  <p className="font-semibold text-gold-600 text-sm">{sihuaAnalysis.quan.star}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{sihuaAnalysis.quan.meaning.split('，').slice(1).join('，')}</p>
                </div>)}
                {sihuaAnalysis.ke.star && (
                <div className="bg-dark-700/60 rounded-lg p-2 text-center">
                  <p className="text-xs text-gray-500">化科</p>
                  <p className="font-semibold text-gold-600 text-sm">{sihuaAnalysis.ke.star}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{sihuaAnalysis.ke.meaning.split('，').slice(1).join('，')}</p>
                </div>)}
                {sihuaAnalysis.ji.star && (
                <div className="bg-dark-700/60 rounded-lg p-2 text-center">
                  <p className="text-xs text-gray-500">化忌</p>
                  <p className="font-semibold text-gold-600 text-sm">{sihuaAnalysis.ji.star}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{sihuaAnalysis.ji.meaning.split('，').slice(1).join('，')}</p>
                </div>)}
              </div>
              <p className="text-xs text-gray-400 text-center mt-2">{sihuaAnalysis.summary}</p>
            </div>
            )}

            <h3 className="text-base font-semibold text-gold-400 font-serif mb-4">{getT('ziweiPage.patternTitle')}</h3>
            {patterns.length > 0 ? (
              <div className="space-y-3">
                <table className="w-full text-xs"><tbody>
                  {patterns.map((p, i) => (
                    <tr key={i} className="border-b border-dark-700">
                      <td className="py-2 w-36 text-gold-300 font-semibold align-top">【{p.name}】</td>
                      <td className="py-2 text-gray-400 leading-relaxed">{p.desc}</td>
                    </tr>
                  ))}
                </tbody></table>
                <p className="text-xs text-gray-400">{getT('ziweiPage.patternTotal').replace('{n}', String(patterns.length))}</p>
                <p className="text-xs text-gray-400">{getT('ziweiPage.patternRatio')}=<span className="text-gold-400 font-semibold">{patternIndex}%</span></p>
              </div>
            ) : <p className="text-xs text-gray-500">{getT('ziweiPage.patternNone')}</p>}
          </div>

          {/* ── Star Descriptions ── */}
          <div className="bg-dark-800/80 rounded-xl border border-gold-500/20 p-6">
            <h3 className="text-base font-semibold text-gold-400 font-serif mb-4">{getT('ziweiPage.starDescTitle').replace('{palace}', soulDisplayName)}</h3>
            {soulStarDescs.length > 0 ? (
              <table className="w-full text-xs"><tbody>
                {soulStarDescs.map(({ name, desc }, i) => (
                  <tr key={i} className="border-b border-dark-700">
                    <td className="py-2 w-16 text-gold-300 font-semibold align-top">{name}</td>
                    <td className="py-2 text-gray-400 leading-relaxed">{desc}</td>
                  </tr>
                ))}
              </tbody></table>
            ) : (
              <div className="text-xs text-gray-500">
                <p className="mb-2">{getT('ziweiPage.noStarData')}</p>
                {soulPalace && <p className="text-gray-600">{getT('ziweiPage.mainStar')}：{(soulPalace.majorStars as FullStarInfo[])?.map((s: FullStarInfo) => s.name).join(', ') || '—'}</p>}
              </div>
            )}
          </div>

          {/* ── Export Button ── */}
          <div className="flex justify-center">
            <button
              onClick={() => { if (exportRef.current) exportAsPng(exportRef.current, '紫微斗数命盘.png') }}
              className="text-sm px-4 min-h-[44px] rounded-lg border border-dark-600 text-gray-400 hover:border-gold-500/50 hover:text-gold-400 transition-all"
            >
              {getT('ziweiPage.exportImage')}
            </button>
          </div>

          {/* ── Introduction ── */}
          <div className="bg-dark-800/60 rounded-xl border border-dark-600 p-5 text-xs text-gray-400 leading-relaxed space-y-1.5">
            <h3 className="text-sm font-semibold text-gold-400 font-serif mb-2">{getT('ziweiPage.introTitle')}</h3>
            <p>{getT('ziweiPage.introP1')}</p>
            <p>{getT('ziweiPage.introP2')}</p>
            <p>{getT('ziweiPage.introP3')}</p>
            <p>{getT('ziweiPage.introP4')}</p>
            <p>{getT('ziweiPage.introP5')}</p>
          </div>
        </div>
      )}
    </div>
  )
}
