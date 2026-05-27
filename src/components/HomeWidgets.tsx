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

  // 天气 — 多 API 兜底（HTTPS + 无 key）
  const fetchWeather = async () => {
    setWeatherLoading(true)
    setWeatherError(false)
    try {
      // Step 1: 先用 ip-api.com 免费 HTTPS 接口
      let ipData = null
      let cityName = ''
      try {
        // ip-api.com 免费版不支持浏览器 HTTPS，所以用 ip-api.com 的备用方案
        const r = await fetch('https://ip-api.com/json/?lang=zh-CN&fields=city,regionName,country,query')
        if (r.ok) ipData = await r.json()
      } catch {}
      
      if (!ipData || !ipData.city) {
        try {
          const r = await fetch('https://ipinfo.io/json')
          if (r.ok) {
            const d = await r.json()
            ipData = { city: d.city || '', regionName: d.region || '', country: d.country || '' }
          }
        } catch {}
      }
      
      if (!ipData || !ipData.city) throw new Error('IP lookup failed')
      cityName = ipData.city || ''
      const regionName = ipData.regionName || ''
      
      // Step 2: 用 wttr.in 查询天气（中文）
      const langParam = 'zh'
      const queryCity = encodeURIComponent(cityName)
      const weatherRes = await fetch(`https://wttr.in/${queryCity}?format=j1&lang=${langParam}&m`)
      
      if (!weatherRes.ok) throw new Error('Weather fetch failed: ' + weatherRes.status)
      const weatherData = await weatherRes.json()
      const current = weatherData.current_condition?.[0]

      if (current) {
        // 尝试获取中文城市名
        let displayCity = weatherData.nearest_area?.[0]?.areaName?.[0]?.value || cityName
        // 如果仍然英文，用 ip-api 的中文名覆盖
        if (!/[\u4e00-\u9fff]/.test(displayCity) && cityName) {
          displayCity = cityName
        }
        if (regionName && displayCity.indexOf(regionName) === -1 && regionName !== displayCity) {
          displayCity += ' · ' + regionName
        }

        // 中文天气描述优先
        let condition = current.weatherDesc?.[0]?.value || ''
        if (current.lang_zh?.[0]?.value) {
          condition = current.lang_zh[0].value
        }
        // 简单翻译英文天气词
        const wxMap: Record<string,string> = {'Clear':'晴','Sunny':'晴','Cloudy':'多云','Overcast':'阴','Rain':'雨','Drizzle':'小雨','Thunderstorm':'雷阵雨','Snow':'雪','Fog':'雾','Mist':'薄雾','Haze':'霾','Partly cloudy':'多云','Light rain':'小雨','Heavy rain':'大雨','Moderate rain':'中雨','Patchy rain possible':'可能有雨','Light drizzle':'毛毛雨'}
        for (const [en, zh] of Object.entries(wxMap)) {
          if (condition.toLowerCase().includes(en.toLowerCase())) { condition = zh; break }
        }

        setWeather({
          city: displayCity,
          temp: current.temp_C || '',
          humidity: current.humidity || '',
          wind: current.winddir16Point || '',
          condition: condition || '',
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
