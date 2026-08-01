'use client'

import { useState, useMemo } from 'react'
import { Solar, Lunar } from 'lunar-typescript'
import CalendarInput, { type CalendarType } from '@/components/CalendarInput'
import { enrichBazi } from '@/lib/bazi-enrich'
import { crossValidate } from '@/lib/zonghe-yinzheng'
import { calcTrueSolarTime } from '@/lib/solar-time'
import { useLocale } from '@/lib/i18n'

const HOUR_OPTIONS = [
  { value: '0', label: '子 23:00~00:59' }, { value: '1', label: '丑 01:00~02:59' },
  { value: '2', label: '寅 03:00~04:59' }, { value: '3', label: '卯 05:00~06:59' },
  { value: '4', label: '辰 07:00~08:59' }, { value: '5', label: '巳 09:00~10:59' },
  { value: '6', label: '午 11:00~12:59' }, { value: '7', label: '未 13:00~14:59' },
  { value: '8', label: '申 15:00~16:59' }, { value: '9', label: '酉 17:00~18:59' },
  { value: '10', label: '戌 19:00~20:59' }, { value: '11', label: '亥 21:00~22:59' },
]

export default function ZongheZhengmingPage() {
  const { locale, t } = useLocale()
  const now = new Date()
  const [cal, setCal] = useState<CalendarType>('solar')
  const [year, setYear] = useState(String(now.getFullYear()))
  const [month, setMonth] = useState(String(now.getMonth() + 1))
  const [day, setDay] = useState(String(now.getDate()))
  const [hour, setHour] = useState('6')
  const [gender, setGender] = useState<'male' | 'female'>('male')
  const [isLeap, setIsLeap] = useState(false)
  const [useTrueSolar, setUseTrueSolar] = useState(true)
  const [longitude, setLongitude] = useState(116.4)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')

  const isCN = locale === 'zh-CN' || locale === 'zh-TW'

  const doCalc = () => {
    setError('')
    setResult(null)
    const y = parseInt(year), m = parseInt(month), d = parseInt(day), h = parseInt(hour)
    if (isNaN(y)||isNaN(m)||isNaN(d)||isNaN(h)||m<1||m>12||d<1||d>31) {
      setError(isCN ? '日期无效' : locale === 'ja' ? '日付が無効です' : locale === 'ko' ? '날짜가 유효하지 않습니다' : 'Invalid date')
      return
    }

    try {
      // 真太阳时修正
      let finalHour = h
      let solarNote = ''
      if (useTrueSolar) {
        const dateStr = `${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`
        const st = calcTrueSolarTime(dateStr, h, 0, longitude)
        finalHour = st.adjustedHour
        solarNote = st.note
      }

      // 排八字（使用小时信息）
      const solar = Solar.fromYmdHms(y, m, d, Math.round(finalHour), 0, 0)
      const lunar = solar.getLunar()
      const eightChar = lunar.getEightChar()
      const bazi = [
        eightChar.getYearGan()+eightChar.getYearZhi(),
        eightChar.getMonthGan()+eightChar.getMonthZhi(),
        eightChar.getDayGan()+eightChar.getDayZhi(),
        eightChar.getTimeGan()+eightChar.getTimeZhi(),
      ]

      const siZhu = {
        '年': { gan: bazi[0][0], zhi: bazi[0][1] },
        '月': { gan: bazi[1][0], zhi: bazi[1][1] },
        '日': { gan: bazi[2][0], zhi: bazi[2][1] },
        '时': { gan: bazi[3][0], zhi: bazi[3][1] },
      }

      // 八字补层
      const enrich = enrichBazi(siZhu)

      // 紫微信息（模拟简单数据，完整紫微需要 iztro）
      const fiveElem = ''

      setResult({
        dateStr: `${y}年${m}月${d}日`,
        bazi: `${bazi[0]} ${bazi[1]} ${bazi[2]} ${bazi[3]}`,
        dayMaster: eightChar.getDayGan(),
        siZhu,
        enrich,
        fiveElem,
        zodiac: lunar.getYearShengXiao(),
        solarNote,
        ziweiMock: {
          mingGong: eightChar.getMingGong() || '',
          wuXingJu: { name: fiveElem, number: 0 },
          mainStars: [eightChar.getDayGan() + '主星'],
        }
      })
    } catch (e: any) {
      setError(
        isCN ? '计算出错：' + (e?.message || '未知错误')
        : locale === 'ja' ? '計算エラー：' + (e?.message || '不明なエラー')
        : locale === 'ko' ? '계산 오류：' + (e?.message || '알 수 없는 오류')
        : 'Calculation error: ' + (e?.message || 'unknown error')
      )
    }
  }

  const title = isCN ? '八字·紫微综合印证'
    : locale === 'ja' ? '八字·紫微総合検証'
    : locale === 'ko' ? '사주·자미 종합 검증'
    : 'Ba Zi & Zi Wei Cross Validation'

  const subtitle = isCN ? '同盘对账 · 六维交叉佐证 · 命格全息解读'
    : locale === 'ja' ? '同盤照合 · 六次元クロス検証 · 命格全息読解'
    : locale === 'ko' ? '동반 대조 · 6차원 교차 검증 · 명격 전면 해독'
    : 'Cross-check · Six-dimension verification · Holographic destiny reading'

  const btnText = isCN ? '开始印证'
    : locale === 'ja' ? '検証開始'
    : locale === 'ko' ? '검증 시작'
    : 'Start Validation'

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gold-400 font-serif mb-3">{title}</h1>
      <p className="text-gray-400 mb-8">{subtitle}</p>

      <div className="bg-dark-800/80 rounded-xl border border-dark-600 p-6 mb-8">
        <div className="flex gap-4 mb-4 flex-wrap items-end">
          <div className="flex-1 min-w-[200px]">
            <CalendarInput
              calendarType={cal}
              year={year}
              month={month}
              day={day}
              hour={String(parseInt(hour) * 2)}
              isLeapMonth={isLeap}
              onCalendarTypeChange={(v) => setCal(v)}
              onYearChange={setYear}
              onMonthChange={setMonth}
              onDayChange={setDay}
              onHourChange={(v) => setHour(String(Math.floor(parseInt(v) / 2)))}
              onLeapMonthChange={setIsLeap}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">{isCN ? '时辰' : locale === 'ja' ? '時刻' : locale === 'ko' ? '시진' : 'Hour'}</label>
            <select value={hour} onChange={e => setHour(e.target.value)}
              className="bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-sm text-gray-200">
              {HOUR_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">{isCN ? '性别' : locale === 'ja' ? '性別' : locale === 'ko' ? '성별' : 'Gender'}</label>
            <select value={gender} onChange={e => setGender(e.target.value as any)}
              className="bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-sm text-gray-200">
              <option value="male">{isCN ? '男' : locale === 'ja' ? '男' : locale === 'ko' ? '남' : 'Male'}</option>
              <option value="female">{isCN ? '女' : locale === 'ja' ? '女' : locale === 'ko' ? '여' : 'Female'}</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">{isCN ? '真太阳时' : locale === 'ja' ? '真太陽時' : locale === 'ko' ? '진태양시' : 'True Solar Time'}</label>
            <label className="flex items-center gap-2 text-sm text-gray-300">
              <input type="checkbox" checked={useTrueSolar} onChange={e => setUseTrueSolar(e.target.checked)} />
              {useTrueSolar ? (isCN ? '经度 ' : locale === 'ja' ? '経度 ' : locale === 'ko' ? '경도 ' : 'Longitude ') : (isCN ? '关闭' : locale === 'ja' ? 'オフ' : locale === 'ko' ? '끄기' : 'Off')}
              <input type="number" value={longitude} onChange={e => setLongitude(parseFloat(e.target.value) || 116.4)}
                className="bg-dark-700 border border-dark-600 rounded px-2 py-1 w-20 text-sm text-gray-200" disabled={!useTrueSolar} />°E
            </label>
          </div>
          <button onClick={doCalc} className="bg-gold-600 hover:bg-gold-500 text-dark-900 font-semibold px-6 py-2 rounded-lg text-sm">{btnText}</button>
        </div>
        {error && <p className="text-gold-600 text-sm">{error}</p>}
      </div>

      {result && (
        <div className="space-y-4">
          <div className="bg-dark-800/80 rounded-xl border border-dark-600 p-4">
            <div className="text-center mb-4">
              <p className="text-xs text-gray-500">
                {result.dateStr}
                {isCN ? ' · ' : locale === 'ja' ? ' · ' : ' · '}
                {result.zodiac}{isCN ? '命' : locale === 'ja' ? '' : locale === 'ko' ? '명' : ''}
              </p>
              <p className="text-xl font-bold text-gold-400 font-serif">{result.bazi}</p>
              <p className="text-xs text-gray-500 mt-1">
                {isCN ? '日主 ' : locale === 'ja' ? '日主 ' : locale === 'ko' ? '일주 ' : 'Day Master '}
                {result.dayMaster}
                {isCN ? ' · 五行局 ' : locale === 'ja' ? ' · 五行局 ' : locale === 'ko' ? ' · 오행국 ' : ' · WJ '}
                {result.fiveElem}
              </p>
              {result.solarNote && <p className="text-xs text-gold-600 mt-1">{result.solarNote}</p>}
            </div>

            {/* 八字推演 */}
            <div className="bg-dark-700/60 rounded-lg p-3 mb-3">
              <h3 className="text-xs font-semibold text-gray-400 mb-2">
                {isCN ? '八字推演' : locale === 'ja' ? '八字推演' : locale === 'ko' ? '사주 추연' : 'Ba Zi Analysis'}
              </h3>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>{isCN ? '格局' : locale === 'ja' ? '格局' : locale === 'ko' ? '격국' : 'Pattern'}: <span className="text-gold-400 font-semibold">{result.enrich.格局.primary}</span></div>
                <div>{isCN ? '旺衰' : locale === 'ja' ? '旺衰' : locale === 'ko' ? '왕쇠' : 'Strength'}: <span className="font-semibold" style={{color: '#987818'}}>{result.enrich.旺衰.verdict}</span></div>
                <div>{isCN ? '五行缺' : locale === 'ja' ? '五行欠乏' : locale === 'ko' ? '오행 부족' : 'Missing'}: <span className="text-gold-600">{result.enrich.五行统计.missing.join('、') || (isCN ? '无' : locale === 'ja' ? '無' : locale === 'ko' ? '없음' : 'none')}</span></div>
                <div>{isCN ? '调候' : locale === 'ja' ? '調候' : locale === 'ko' ? '조후' : 'Adjusting'}: <span className="text-gold-600">{result.enrich.调候用神.join('、') || (isCN ? '无' : locale === 'ja' ? '無' : locale === 'ko' ? '없음' : 'none')}</span></div>
              </div>
              {result.enrich.地支关系.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {result.enrich.地支关系.map((r: any, i: number) => (
                    <span key={i} className="text-xs px-1.5 py-0.5 rounded bg-dark-600 text-gray-400">{r.type}({r.zhi.join('')})</span>
                  ))}
                </div>
              )}
            </div>

            {/* 综合印证卡片 */}
            {(() => {
              const cv = crossValidate(result.enrich, result.ziweiMock, { lang: locale })
              return (
                <div className={`rounded-lg p-3 border ${cv.consistency === '同向印证' || cv.consistency === 'Aligned' ? 'bg-gold-500/10 border-gold-500/40' : cv.consistency === '互补印证' || cv.consistency === 'Complementary' ? 'bg-gold-500/10 border-gold-500/40' : 'bg-gold-500/10 border-gold-500/40'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-400">
                      {isCN ? '综合印证' : locale === 'ja' ? '総合検証' : locale === 'ko' ? '종합 검증' : 'Cross Validation'}
                    </span>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      cv.consistency === '同向印证' || cv.consistency === 'Aligned' ? 'bg-gold-500/10 text-gold-600' :
                      cv.consistency === '互补印证' || cv.consistency === 'Complementary' ? 'bg-gold-500/10 text-gold-600' : 'bg-gold-500/10 text-gold-600'
                    }`}>{cv.consistency}</span>
                  </div>
                  <p className="text-xs text-gray-300">{cv.axes.fusedAxis}</p>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 mt-2">
                    {cv.dims.map((d, i) => (
                      <div key={i} className="bg-dark-800/60 rounded p-1.5">
                        <p className="text-xs text-gray-500">{d.name} <span>{d.verdict}</span></p>
                        <p className="text-[10px] text-gray-400">{d.bazi}</p>
                      </div>
                    ))}
                  </div>

                  <p className="text-xs text-gray-400 mt-2">{cv.conclusion}</p>
                </div>
              )
            })()}
          </div>
        </div>
      )}
    </div>
  )
}
