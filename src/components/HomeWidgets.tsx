'use client'

import { useLocale } from '@/lib/i18n'
import { Solar, Lunar } from 'lunar-typescript'
import WeatherWidget from './WeatherWidget'

function tKey(key: string, lang: Record<string, unknown>): string {
  const keys = key.split('.')
  let value: unknown = lang
  for (const k of keys) {
    if (typeof value !== 'object' || value === null) return key
    value = (value as Record<string, unknown>)[k]
  }
  return typeof value === 'string' ? value : key
}

export default function HomeWidgets() {
  const { t } = useLocale()
  const lang = t as unknown as Record<string, unknown>

  // 服务端直接计算黄历（同步，不依赖 useEffect）
  const now = new Date()
  const solar = Solar.fromDate(now)
  const lunar = solar.getLunar()
  const yi = lunar.getDayYi()
  const ji = lunar.getDayJi()
  const chongInfo = lunar.getDayChong()

  const huangli = {
    lunarYear: lunar.getYearInChinese(),
    lunarMonth: lunar.getMonthInChinese(),
    lunarDay: lunar.getDayInChinese(),
    ganzhiYear: lunar.getYearInGanZhi(),
    ganzhiMonth: lunar.getMonthInGanZhi(),
    ganzhiDay: lunar.getDayInGanZhi(),
    zodiac: lunar.getYearShengXiao(),
    suitable: yi,
    avoid: ji,
    chong: chongInfo,
    sha: lunar.getDaySha(),
    wuxin: lunar.getDayNaYin(),
  }

  return (
    <div className="max-w-6xl mx-auto px-4">
      <h2 className="text-2xl font-bold text-gold-400 font-serif mb-4 text-center">
        {tKey('homeWidgets.title', lang)}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {/* 黄历卡片 — 服务端渲染，立即显示 */}
        <div className="bg-dark-800/80 backdrop-blur rounded-xl border border-dark-600 p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">📅</span>
            <h3 className="text-base font-semibold text-gold-300">{tKey('homeWidgets.huangli', lang)}</h3>
          </div>
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-2xl font-bold text-gray-100 font-serif">{huangli.lunarMonth}月{huangli.lunarDay}</span>
            <span className="text-sm text-gray-400">{huangli.zodiac}年 · {huangli.ganzhiMonth}月 · {huangli.ganzhiDay}日</span>
          </div>
          <p className="text-xs text-gray-500 mb-3">{huangli.wuxin}</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-green-400 font-medium mb-1">✦ {tKey('homeWidgets.suitable', lang)}</p>
              <div className="flex flex-wrap gap-1">
                {huangli.suitable.map((item, i) => (
                  <span key={i} className="text-xs bg-green-900/40 text-green-300 px-2 py-0.5 rounded">{item}</span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs text-red-400 font-medium mb-1">✦ {tKey('homeWidgets.avoid', lang)}</p>
              <div className="flex flex-wrap gap-1">
                {huangli.avoid.map((item, i) => (
                  <span key={i} className="text-xs bg-red-900/40 text-red-300 px-2 py-0.5 rounded">{item}</span>
                ))}
              </div>
            </div>
          </div>
          {huangli.chong && (
            <div className="mt-3 pt-3 border-t border-dark-600 flex gap-4 text-xs text-gray-400">
              <span>{tKey('homeWidgets.chong', lang)}：{huangli.chong}</span>
              <span>{tKey('homeWidgets.sha', lang)}：{huangli.sha}</span>
            </div>
          )}
        </div>

        {/* 天气卡片 — 独立客户端组件，img 嵌入不受 CORS 限制 */}
        <WeatherWidget />
      </div>
    </div>
  )
}
