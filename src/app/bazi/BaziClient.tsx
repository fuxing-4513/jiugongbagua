'use client'

import { useState } from 'react'
import { useLocale } from '@/lib/i18n'
import { Solar } from 'lunar-typescript'

function tk(key: string, lang: Record<string, unknown>): string {
  const keys = key.split('.')
  let v: unknown = lang
  for (const k of keys) {
    if (typeof v !== 'object' || v === null) return key
    v = (v as Record<string, unknown>)[k]
  }
  return typeof v === 'string' ? v : key
}

const hourOptions = [
  { value: '0', label: '子时 (23:00-00:59)' },
  { value: '1', label: '丑时 (01:00-02:59)' },
  { value: '2', label: '寅时 (03:00-04:59)' },
  { value: '3', label: '卯时 (05:00-06:59)' },
  { value: '4', label: '辰时 (07:00-08:59)' },
  { value: '5', label: '巳时 (09:00-10:59)' },
  { value: '6', label: '午时 (11:00-12:59)' },
  { value: '7', label: '未时 (13:00-14:59)' },
  { value: '8', label: '申时 (15:00-16:59)' },
  { value: '9', label: '酉时 (17:00-18:59)' },
  { value: '10', label: '戌时 (19:00-20:59)' },
  { value: '11', label: '亥时 (21:00-22:59)' },
]

const wuxingMap: Record<string, string> = {
  '甲':'木','乙':'木','丙':'火','丁':'火','戊':'土','己':'土','庚':'金','辛':'金','壬':'水','癸':'水',
  '子':'水','丑':'土','寅':'木','卯':'木','辰':'土','巳':'火','午':'火','未':'土','申':'金','酉':'金','戌':'土','亥':'水',
}

const nayiMap: Record<string, string> = {
  '甲子':'海中金','乙丑':'海中金','丙寅':'炉中火','丁卯':'炉中火','戊辰':'大林木','己巳':'大林木',
  '庚午':'路旁土','辛未':'路旁土','壬申':'剑锋金','癸酉':'剑锋金','甲戌':'山头火','乙亥':'山头火',
  '丙子':'涧下水','丁丑':'涧下水','戊寅':'城头土','己卯':'城头土','庚辰':'白蜡金','辛巳':'白蜡金',
  '壬午':'杨柳木','癸未':'杨柳木','甲申':'泉中水','乙酉':'泉中水','丙戌':'屋上土','丁亥':'屋上土',
  '戊子':'霹雳火','己丑':'霹雳火','庚寅':'松柏木','辛卯':'松柏木','壬辰':'长流水','癸巳':'长流水',
  '甲午':'沙中金','乙未':'沙中金','丙申':'山下火','丁酉':'山下火','戊戌':'平地木','己亥':'平地木',
  '庚子':'壁上土','辛丑':'壁上土','壬寅':'金箔金','癸卯':'金箔金','甲辰':'覆灯火','乙巳':'覆灯火',
  '丙午':'天河水','丁未':'天河水','戊申':'大驿土','己酉':'大驿土','庚戌':'钗钏金','辛亥':'钗钏金',
  '壬子':'桑柘木','癸丑':'桑柘木','甲寅':'大溪水','乙卯':'大溪水','丙辰':'沙中土','丁巳':'沙中土',
  '戊午':'天上火','己未':'天上火','庚申':'石榴木','辛酉':'石榴木','壬戌':'大海水','癸亥':'大海水',
}

const shishenMap: Record<string, Record<string, string>> = {
  '甲':{'甲':'比肩','乙':'劫财','丙':'食神','丁':'伤官','戊':'偏财','己':'正财','庚':'七杀','辛':'正官','壬':'偏印','癸':'正印'},
  '乙':{'甲':'劫财','乙':'比肩','丙':'伤官','丁':'食神','戊':'正财','己':'偏财','庚':'正官','辛':'七杀','壬':'正印','癸':'偏印'},
  '丙':{'甲':'偏印','乙':'正印','丙':'比肩','丁':'劫财','戊':'食神','己':'伤官','庚':'偏财','辛':'正财','壬':'七杀','癸':'正官'},
  '丁':{'甲':'正印','乙':'偏印','丙':'劫财','丁':'比肩','戊':'伤官','己':'食神','庚':'正财','辛':'偏财','壬':'正官','癸':'七杀'},
  '戊':{'甲':'七杀','乙':'正官','丙':'偏印','丁':'正印','戊':'比肩','己':'劫财','庚':'食神','辛':'伤官','壬':'偏财','癸':'正财'},
  '己':{'甲':'正官','乙':'七杀','丙':'正印','丁':'偏印','戊':'劫财','己':'比肩','庚':'伤官','辛':'食神','壬':'正财','癸':'偏财'},
  '庚':{'甲':'偏财','乙':'正财','丙':'七杀','丁':'正官','戊':'偏印','己':'正印','庚':'比肩','辛':'劫财','壬':'食神','癸':'伤官'},
  '辛':{'甲':'正财','乙':'偏财','丙':'正官','丁':'七杀','戊':'正印','己':'偏印','庚':'劫财','辛':'比肩','壬':'伤官','癸':'食神'},
  '壬':{'甲':'食神','乙':'伤官','丙':'偏财','丁':'正财','戊':'七杀','己':'正官','庚':'偏印','辛':'正印','壬':'比肩','癸':'劫财'},
  '癸':{'甲':'伤官','乙':'食神','丙':'正财','丁':'偏财','戊':'正官','己':'七杀','庚':'正印','辛':'偏印','壬':'劫财','癸':'比肩'},
}

const hiddenStems: Record<string, string> = {
  '子':'癸','丑':'己癸辛','寅':'甲丙戊','卯':'乙','辰':'戊乙癸','巳':'丙庚戊',
  '午':'丁己','未':'己丁乙','申':'庚壬戊','酉':'辛','戌':'戊辛丁','亥':'壬甲',
}

const WUXING_COLORS: Record<string, string> = {
  '金':'bg-yellow-900/40 text-yellow-300 border-yellow-700',
  '木':'bg-green-900/40 text-green-300 border-green-700',
  '水':'bg-blue-900/40 text-blue-300 border-blue-700',
  '火':'bg-red-900/40 text-red-300 border-red-700',
  '土':'bg-amber-900/40 text-amber-300 border-amber-700',
}

interface PillarInfo {
  ganzhi: string; gan: string; zhi: string; nayi: string; wxGan: string; wxZhi: string; hidden: string; shishen: string
}

interface BaziResult {
  year: PillarInfo; month: PillarInfo; day: PillarInfo; hour: PillarInfo
  wuxing: Record<string, number>; dayun: { gz: string; age: number }[]
  mingGong: string; shenGong: string; taiYuan: string
  dayDiShi: string; monthDiShi: string; yearDiShi: string; timeDiShi: string
  dayXunKong: string
}

function analyze(y: number, m: number, d: number, h: number): BaziResult {
  const solar = Solar.fromYmdHms(y, m, d, h, 0, 0)
  const ec = solar.getLunar().getEightChar()

  function makeP(info: { ganzhi: string; gan: string; zhi: string }): PillarInfo {
    const gz = info.ganzhi || info.gan + info.zhi
    return {
      ganzhi: gz,
      gan: info.gan, zhi: info.zhi,
      nayi: nayiMap[gz] || '—',
      wxGan: wuxingMap[info.gan] || '', wxZhi: wuxingMap[info.zhi] || '',
      hidden: hiddenStems[info.zhi] || '—',
      shishen: shishenMap[ec.getDayGan()]?.[info.gan] || '',
    }
  }

  const result: BaziResult = {
    year: makeP({ ganzhi: ec.getYear(), gan: ec.getYearGan(), zhi: ec.getYearZhi() }),
    month: makeP({ ganzhi: ec.getMonth(), gan: ec.getMonthGan(), zhi: ec.getMonthZhi() }),
    day: makeP({ ganzhi: ec.getDay(), gan: ec.getDayGan(), zhi: ec.getDayZhi() }),
    hour: makeP({ ganzhi: ec.getTime(), gan: ec.getTimeGan(), zhi: ec.getTimeZhi() }),
    wuxing: { '金':0,'木':0,'水':0,'火':0,'土':0 },
    dayun: [],
    mingGong: ec.getMingGong(), shenGong: ec.getShenGong(), taiYuan: ec.getTaiYuan(),
    dayDiShi: ec.getDayDiShi(), monthDiShi: ec.getMonthDiShi(),
    yearDiShi: ec.getYearDiShi(), timeDiShi: ec.getTimeDiShi(),
    dayXunKong: ec.getDayXunKong(),
  }

  // 五行统计
  const gz = [result.year, result.month, result.day, result.hour]
  for (const p of gz) {
    const w1 = wuxingMap[p.gan]; const w2 = wuxingMap[p.zhi]
    if (w1 && w1 in result.wuxing) result.wuxing[w1]++
    if (w2 && w2 in result.wuxing) result.wuxing[w2]++
  }

  // 大运
  try {
    const yun = ec.getYun(2)
    const dyList = yun.getDaYun()
    for (const dy of dyList) {
      result.dayun.push({ gz: dy.getGanZhi(), age: dy.getStartAge() })
    }
  } catch {}

  return result
}

export default function BaziClient() {
  const { t } = useLocale()
  const lang = t as unknown as Record<string, unknown>

  const now = new Date()
  const [year, setYear] = useState(String(now.getFullYear()))
  const [month, setMonth] = useState(String(now.getMonth() + 1))
  const [day, setDay] = useState(String(now.getDate()))
  const [hour, setHour] = useState('6')
  const [result, setResult] = useState<BaziResult | null>(null)
  const [error, setError] = useState('')

  const analyzeBazi = () => {
    setError('')
    const y = parseInt(year); const m = parseInt(month); const d = parseInt(day); const h = parseInt(hour)
    if (isNaN(y) || isNaN(m) || isNaN(d) || isNaN(h)) { setError('请输入有效的日期和时间'); return }
    if (m < 1 || m > 12 || d < 1 || d > 31 || h < 0 || h > 11) { setError('日期或时辰无效'); return }
    try { setResult(analyze(y, m, d, h)) } catch { setError('八字计算出错，请检查日期') }
  }

  const pillars = result ? [result.year, result.month, result.day, result.hour] : []

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gold-400 font-serif mb-3">{tk('bazi.title', lang)}</h1>
      <p className="text-gray-400 mb-8">{tk('bazi.desc', lang)}</p>

      <div className="bg-dark-800/80 backdrop-blur rounded-xl border border-dark-600 p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-200 mb-4">{tk('bazi.birthInfo', lang)}</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
          {[
            { label: tk('common.year', lang), val: year, set: setYear, min: 1900, max: 2100 },
            { label: tk('common.month', lang), val: month, set: setMonth, min: 1, max: 12 },
            { label: tk('common.day', lang), val: day, set: setDay, min: 1, max: 31 },
          ].map((f, i) => (
            <div key={i}>
              <label className="block text-xs text-gray-400 mb-1">{f.label}</label>
              <input type="number" value={f.val} onChange={e => f.set(e.target.value)}
                className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-gray-200 focus:outline-none focus:border-gold-500" min={f.min} max={f.max} />
            </div>
          ))}
          <div>
            <label className="block text-xs text-gray-400 mb-1">{tk('common.hour', lang)}</label>
            <select value={hour} onChange={e => setHour(e.target.value)}
              className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-gray-200 focus:outline-none focus:border-gold-500">
              {hourOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>
        {error && <p className="text-sm text-red-400 mb-3">{error}</p>}
        <button onClick={analyzeBazi}
          className="bg-gold-600 hover:bg-gold-500 text-dark-900 font-semibold px-6 py-2.5 rounded-lg transition-colors active:scale-95">
          {tk('common.submit', lang)}
        </button>
      </div>

      {result && (
        <div className="space-y-5">
          {/* 四柱命盘 */}
          <div className="bg-dark-800/80 backdrop-blur rounded-xl border border-dark-600 p-5">
            <h2 className="text-lg font-semibold text-gold-300 font-serif mb-4 text-center">
              {tk('bazi.resultTitle', lang)}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              {[
                { label: tk('bazi.yearPillar', lang), p: pillars[0] },
                { label: tk('bazi.monthPillar', lang), p: pillars[1] },
                { label: `日柱（${pillars[2].shishen}）`, p: pillars[2] },
                { label: tk('bazi.hourPillar', lang), p: pillars[3] },
              ].map((item, i) => (
                <div key={i} className="bg-dark-700 rounded-xl p-4 text-center border border-dark-600">
                  <p className="text-xs text-gray-500 mb-2">{item.label}</p>
                  <p className="text-2xl font-bold text-gold-400 font-serif mb-1">{item.p.ganzhi}</p>
                  <div className="flex items-center justify-center gap-1 text-xs mb-1">
                    <span className="bg-red-900/40 text-red-300 px-1.5 py-0.5 rounded">{item.p.wxGan}</span>
                    <span className="text-gray-600">/</span>
                    <span className="bg-amber-900/40 text-amber-300 px-1.5 py-0.5 rounded">{item.p.wxZhi}</span>
                  </div>
                  <p className="text-xs text-gray-500">{item.p.nayi}</p>
                  <p className="text-[10px] text-gray-600 mt-1">藏干：{item.p.hidden}</p>
                </div>
              ))}
            </div>

            {/* 十二长生 + 旬空 */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-3">
              {[
                { label: '年柱', v: result.yearDiShi },
                { label: '月柱', v: result.monthDiShi },
                { label: '日柱', v: result.dayDiShi },
                { label: '时柱', v: result.timeDiShi },
              ].map((d, i) => (
                <div key={i} className="bg-dark-700 rounded-lg p-2 text-center">
                  <p className="text-[10px] text-gray-500 mb-0.5">{d.label}</p>
                  <p className="text-xs text-gray-300">{d.v}</p>
                </div>
              ))}
              <div className="bg-dark-700 rounded-lg p-2 text-center">
                <p className="text-[10px] text-gray-500 mb-0.5">旬空</p>
                <p className="text-xs text-gray-300">{result.dayXunKong}</p>
              </div>
            </div>
          </div>

          {/* 十神 */}
          <div className="bg-dark-800/80 backdrop-blur rounded-xl border border-dark-600 p-5">
            <h3 className="text-base font-semibold text-gray-200 mb-3">十神</h3>
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: tk('bazi.yearPillar', lang), val: pillars[0].shishen },
                { label: tk('bazi.monthPillar', lang), val: pillars[1].shishen },
                { label: '日主', val: pillars[2].gan },
                { label: tk('bazi.hourPillar', lang), val: pillars[3].shishen },
              ].map((item, i) => (
                <div key={i} className="bg-purple-900/20 rounded-lg p-3 text-center border border-purple-800/30">
                  <p className="text-xs text-gray-500 mb-1">{item.label}</p>
                  <p className="text-sm font-semibold text-purple-300">{item.val}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 五行分布 */}
          <div className="bg-dark-800/80 backdrop-blur rounded-xl border border-dark-600 p-5">
            <h3 className="text-base font-semibold text-gray-200 mb-3">五行分布</h3>
            <div className="grid grid-cols-5 gap-2">
              {Object.entries(result.wuxing).map(([wx, count]) => (
                <div key={wx} className={`rounded-lg p-3 text-center border ${WUXING_COLORS[wx] || 'bg-dark-700 border-dark-600'}`}>
                  <p className="text-lg font-bold mb-1">{wx}</p>
                  <div className="h-1.5 bg-dark-600 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${wx === '金'?'bg-yellow-400':wx === '木'?'bg-green-400':wx === '水'?'bg-blue-400':wx === '火'?'bg-red-400':'bg-amber-400'}`}
                      style={{ width: `${(count / 8) * 100}%` }} />
                  </div>
                  <p className="text-xs mt-1 text-gray-400">{count}/8</p>
                </div>
              ))}
            </div>
          </div>

          {/* 命宫身宫胎元 */}
          <div className="bg-dark-800/80 backdrop-blur rounded-xl border border-dark-600 p-5">
            <h3 className="text-base font-semibold text-gray-200 mb-3">命宫 / 身宫 / 胎元</h3>
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-dark-700 rounded-lg p-3 text-center">
                <p className="text-xs text-gray-500 mb-1">命宫</p>
                <p className="text-sm font-semibold text-gray-200">{result.mingGong}</p>
              </div>
              <div className="bg-dark-700 rounded-lg p-3 text-center">
                <p className="text-xs text-gray-500 mb-1">身宫</p>
                <p className="text-sm font-semibold text-gray-200">{result.shenGong}</p>
              </div>
              <div className="bg-dark-700 rounded-lg p-3 text-center">
                <p className="text-xs text-gray-500 mb-1">胎元</p>
                <p className="text-sm font-semibold text-gray-200">{result.taiYuan}</p>
              </div>
            </div>
          </div>

          {/* 大运 */}
          {result.dayun.length > 0 && (
            <div className="bg-dark-800/80 backdrop-blur rounded-xl border border-dark-600 p-5">
              <h3 className="text-base font-semibold text-gray-200 mb-3">大运</h3>
              <div className="flex flex-wrap gap-1.5">
                {result.dayun.map((dy, i) => (
                  <span key={i}
                    className="inline-block bg-amber-900/30 text-amber-300 text-xs px-2.5 py-1 rounded-full border border-amber-700/40 font-serif">
                    {dy.gz} ({dy.age}岁){i < result.dayun.length - 1 && <span className="text-amber-700 mx-1">→</span>}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
