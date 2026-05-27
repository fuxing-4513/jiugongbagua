'use client'

import { useEffect, useState } from 'react'
import { Solar, Lunar } from 'lunar-typescript'
import { useLocale } from '@/lib/i18n'

// ── i18n helper (same pattern used across the project) ──
function tKey(key: string, lang: Record<string, unknown>): string {
  const keys = key.split('.')
  let value: unknown = lang
  for (const k of keys) {
    if (typeof value !== 'object' || value === null) return key
    value = (value as Record<string, unknown>)[k]
  }
  return typeof value === 'string' ? value : key
}

// ── Types ──
interface WeatherData {
  city: string
  temp: string
  humidity: string
  wind: string
  condition: string
  icon: string
}

interface HuangliData {
  lunarYear: string
  lunarMonth: string
  lunarDay: string
  ganzhiYear: string
  ganzhiMonth: string
  ganzhiDay: string
  zodiac: string
  // 宜 / 忌
  suitable: string[]
  avoid: string[]
  // 冲煞
  chong: string
  sha: string
  wuxin: string
}

function getTodayHuangli(): HuangliData {
  const now = new Date()
  const solar = Solar.fromDate(now)
  const lunar = solar.getLunar()

  const yi = lunar.getDayYi()
  const ji = lunar.getDayJi()

  // 冲煞
  const chongInfo = lunar.getDayChong()

  return {
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
}

// ── Component ──
export default function HomeWidgets() {
  const { t, locale } = useLocale()
  const lang = t as unknown as Record<string, unknown>

  const [huangli, setHuangli] = useState<HuangliData | null>(null)
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [weatherLoading, setWeatherLoading] = useState(true)
  const [weatherError, setWeatherError] = useState(false)

  // 黄历 — 离线计算
  useEffect(() => {
    setHuangli(getTodayHuangli())
  }, [])

  // 天气 — 通过 IP 定位 + 免费 API
  const fetchWeather = async () => {
    setWeatherLoading(true)
    setWeatherError(false)
    try {
      // Step 1: Get location from IP
      const ipRes = await fetch('https://ipapi.co/json/')
      if (!ipRes.ok) throw new Error('IP lookup failed')
      const ipData = await ipRes.json()
      const city = ipData.city || ipData.region || ''

      // Step 2: Get weather from wttr.in (free, no key)
      const weatherRes = await fetch(
        `https://wttr.in/${encodeURIComponent(city)}?format=j1&lang=${locale === 'zh-TW' ? 'zh' : locale.slice(0, 2)}`
      )
      if (!weatherRes.ok) throw new Error('Weather fetch failed')
      const weatherData = await weatherRes.json()
      const current = weatherData.current_condition?.[0]

      if (current) {
        setWeather({
          city: weatherData.nearest_area?.[0]?.areaName?.[0]?.value || city,
          temp: current.temp_C || '',
          humidity: current.humidity || '',
          wind: current.winddir16Point || '',
          condition: current.weatherDesc?.[0]?.value || '',
          icon: '',
        })
      } else {
        throw new Error('No weather data')
      }
    } catch {
      setWeatherError(true)
    }
    setWeatherLoading(false)
  }

  useEffect(() => {
    fetchWeather()
  }, [locale])

  if (!huangli) return null

  return (
    <div className="max-w-6xl mx-auto px-4">
      <h2 className="text-2xl font-bold text-gold-400 font-serif mb-4 text-center">
        {tKey('homeWidgets.title', lang)}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {/* ── 黄历卡片 ── */}
        <div className="bg-dark-800/80 backdrop-blur rounded-xl border border-dark-600 p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">📅</span>
            <h3 className="text-base font-semibold text-gold-300">
              {tKey('homeWidgets.huangli', lang)}
            </h3>
          </div>

          {/* 农历日期 */}
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-2xl font-bold text-gray-100 font-serif">
              {huangli.lunarMonth}月{huangli.lunarDay}
            </span>
            <span className="text-sm text-gray-400">
              {huangli.zodiac}年 · {huangli.ganzhiMonth}月 · {huangli.ganzhiDay}日
            </span>
          </div>

          {/* 五行 */}
          <p className="text-xs text-gray-500 mb-3">{huangli.wuxin}</p>

          {/* 宜忌双栏 */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-green-400 font-medium mb-1">
                ✦ {tKey('homeWidgets.suitable', lang)}
              </p>
              <div className="flex flex-wrap gap-1">
                {huangli.suitable.map((item, i) => (
                  <span key={i} className="text-xs bg-green-900/40 text-green-300 px-2 py-0.5 rounded">
                    {item}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs text-red-400 font-medium mb-1">
                ✦ {tKey('homeWidgets.avoid', lang)}
              </p>
              <div className="flex flex-wrap gap-1">
                {huangli.avoid.map((item, i) => (
                  <span key={i} className="text-xs bg-red-900/40 text-red-300 px-2 py-0.5 rounded">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* 冲煞 */}
          {huangli.chong && (
            <div className="mt-3 pt-3 border-t border-dark-600 flex gap-4 text-xs text-gray-400">
              <span>{tKey('homeWidgets.chong', lang)}：{huangli.chong}</span>
              <span>{tKey('homeWidgets.sha', lang)}：{huangli.sha}</span>
            </div>
          )}
        </div>

        {/* ── 天气卡片 ── */}
        <div className="bg-dark-800/80 backdrop-blur rounded-xl border border-dark-600 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xl">🌤</span>
              <h3 className="text-base font-semibold text-gold-300">
                {tKey('homeWidgets.weather', lang)}
              </h3>
            </div>
            <button
              onClick={fetchWeather}
              disabled={weatherLoading}
              className="text-xs text-gold-500 hover:text-gold-400 transition-colors disabled:opacity-50"
            >
              {tKey('homeWidgets.weatherRefresh', lang)}
            </button>
          </div>

          {weatherLoading && (
            <p className="text-sm text-gray-400">{tKey('homeWidgets.loadingWeather', lang)}</p>
          )}

          {weatherError && !weatherLoading && (
            <p className="text-sm text-gray-500">—</p>
          )}

          {weather && !weatherLoading && (
            <div>
              <p className="text-lg font-medium text-gray-100 mb-2">{weather.city}</p>
              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="bg-dark-700 rounded-lg p-2">
                  <p className="text-xs text-gray-400 mb-0.5">
                    {tKey('homeWidgets.temperature', lang)}
                  </p>
                  <p className="text-sm font-semibold text-gray-100">{weather.temp}°C</p>
                </div>
                <div className="bg-dark-700 rounded-lg p-2">
                  <p className="text-xs text-gray-400 mb-0.5">
                    {tKey('homeWidgets.condition', lang)}
                  </p>
                  <p className="text-sm font-semibold text-gray-100">{weather.condition}</p>
                </div>
                <div className="bg-dark-700 rounded-lg p-2">
                  <p className="text-xs text-gray-400 mb-0.5">
                    {tKey('homeWidgets.humidity', lang)}
                  </p>
                  <p className="text-sm font-semibold text-gray-100">{weather.humidity}%</p>
                </div>
                <div className="bg-dark-700 rounded-lg p-2">
                  <p className="text-xs text-gray-400 mb-0.5">
                    {tKey('homeWidgets.wind', lang)}
                  </p>
                  <p className="text-sm font-semibold text-gray-100">{weather.wind}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
