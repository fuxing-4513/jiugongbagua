'use client'

import { useEffect, useState } from 'react'
import { Solar, Lunar } from 'lunar-typescript'
import { useLocale } from '@/lib/i18n'

function tKey(key: string, lang: Record<string, unknown>): string {
  const keys = key.split('.')
  let value: unknown = lang
  for (const k of keys) {
    if (typeof value !== 'object' || value === null) return key
    value = (value as Record<string, unknown>)[k]
  }
  return typeof value === 'string' ? value : key
}

interface WeatherCurrent {
  city: string
  temp: string
  humidity: string
  wind: string
  condition: string
  feelsLike: string
  uv: string
  visibility: string
}

interface WeatherForecastDay {
  date: string
  dayOfWeek: string
  tempMax: string
  tempMin: string
  condition: string
  humidity: string
  wind: string
  sunrise: string
  sunset: string
}

interface HuangliData {
  lunarYear: string
  lunarMonth: string
  lunarDay: string
  ganzhiYear: string
  ganzhiMonth: string
  ganzhiDay: string
  zodiac: string
  suitable: string[]
  avoid: string[]
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

const DAY_NAMES = ['日','一','二','三','四','五','六']

function conditionZh(desc: string): string {
  const map: Record<string,string> = {
    'Clear':'晴','Sunny':'晴','Cloudy':'多云','Overcast':'阴',
    'Rain':'雨','Drizzle':'小雨','Thunderstorm':'雷阵雨','Snow':'雪',
    'Fog':'雾','Mist':'薄雾','Haze':'霾','Partly cloudy':'多云',
    'Light rain':'小雨','Heavy rain':'大雨','Moderate rain':'中雨',
    'Patchy rain possible':'可能有雨','Light drizzle':'毛毛雨',
    'Light snow':'小雪','Heavy snow':'大雪','Ice pellets':'冰粒',
    'Blowing snow':'吹雪','Freezing rain':'冻雨','Thundery outbreaks':'雷雨',
  }
  for (const [en, zh] of Object.entries(map)) {
    if (desc.toLowerCase().includes(en.toLowerCase())) return zh
  }
  return desc
}

export default function HomeWidgets() {
  const { t, locale } = useLocale()
  const lang = t as unknown as Record<string, unknown>

  const [huangli, setHuangli] = useState<HuangliData | null>(null)
  const [current, setCurrent] = useState<WeatherCurrent | null>(null)
  const [forecast, setForecast] = useState<WeatherForecastDay[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    setHuangli(getTodayHuangli())
  }, [])

  const fetchWeather = async () => {
    setLoading(true)
    setError(false)

    let cityName = ''
    let regionName = ''

    // 策略1: ip-api.com
    try {
      const r1 = await fetch('https://ip-api.com/json/?lang=zh-CN&fields=city,regionName,country,countryCode,query')
      if (r1.ok) {
        const d = await r1.json()
        if (d.city) { cityName = d.city; regionName = d.regionName || '' }
      }
    } catch {}

    // 策略2: ipinfo.io
    if (!cityName) {
      try {
        const r2 = await fetch('https://ipinfo.io/json')
        if (r2.ok) {
          const d = await r2.json()
          cityName = d.city || ''; regionName = d.region || ''
        }
      } catch {}
    }

    // 策略3: 浏览器定位
    if (!cityName) {
      try {
        const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 })
        })
        const r3 = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&accept-language=zh&zoom=10`)
        if (r3.ok) {
          const d = await r3.json()
          cityName = d.address?.city || d.address?.town || d.address?.county || ''
        }
      } catch {}
    }

    if (!cityName) { cityName = 'Beijing'; regionName = '' }

    const langParam = locale.startsWith('zh') ? 'zh' : 'en'

    try {
      const queryCity = encodeURIComponent(cityName)
      const wr = await fetch(`https://wttr.in/${queryCity}?format=j1&lang=${langParam}&m`)
      if (!wr.ok) throw new Error('Weather fetch failed: ' + wr.status)
      const wd = await wr.json()

      const cc = wd.current_condition?.[0]
      const areaName = wd.nearest_area?.[0]?.areaName?.[0]?.value || cityName
      const regionFromApi = wd.nearest_area?.[0]?.region?.[0]?.value || regionName

      let displayCity = areaName
      if (!/[\u4e00-\u9fff]/.test(displayCity)) displayCity = cityName
      if (regionFromApi && displayCity.indexOf(regionFromApi) === -1 && regionFromApi !== displayCity) {
        displayCity += ' · ' + regionFromApi
      }

      let cond = cc.weatherDesc?.[0]?.value || ''
      if (cc.lang_zh?.[0]?.value) cond = cc.lang_zh[0].value
      cond = conditionZh(cond)

      if (cc) {
        setCurrent({
          city: displayCity,
          temp: cc.temp_C || '',
          humidity: cc.humidity || '',
          wind: cc.winddir16Point || (cc.windspeedKmph ? cc.windspeedKmph + ' km/h' : ''),
          condition: cond,
          feelsLike: cc.FeelsLikeC || '',
          uv: cc.uvIndex || '',
          visibility: cc.visibility || '',
        })
      }

      // 7日预报
      if (wd.weather && Array.isArray(wd.weather)) {
        const fcast = wd.weather.map((d: any, i: number) => {
          const dt = new Date()
          dt.setDate(dt.getDate() + i)
          const h0: any = d.hourly?.[0]
          const a0: any = d.astronomy?.[0]
          return {
            date: String(d.date || ''),
            dayOfWeek: DAY_NAMES[dt.getDay()],
            tempMax: String(d.maxtempC || ''),
            tempMin: String(d.mintempC || ''),
            condition: conditionZh(String(h0?.weatherDesc?.[0]?.value || '')),
            humidity: String(a0?.humidity || ''),
            wind: String(h0?.windspeedKmph || ''),
            sunrise: String(a0?.sunrise || ''),
            sunset: String(a0?.sunset || ''),
          }
        })
        setForecast(fcast.slice(0, 7))
      }
    } catch {
      setError(true)
    }
    setLoading(false)
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
        {/* 黄历 */}
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

        {/* 天气实况 */}
        <div className="bg-dark-800/80 backdrop-blur rounded-xl border border-dark-600 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xl">🌤</span>
              <h3 className="text-base font-semibold text-gold-300">{tKey('homeWidgets.weather', lang)}</h3>
            </div>
            <button onClick={fetchWeather} disabled={loading}
              className="text-xs text-gold-500 hover:text-gold-400 transition-colors disabled:opacity-50">
              {tKey('homeWidgets.weatherRefresh', lang)}
            </button>
          </div>

          {loading && <p className="text-sm text-gray-400">{tKey('homeWidgets.loadingWeather', lang)}</p>}

          {error && !loading && (
            <div>
              <p className="text-sm text-gray-500">—</p>
              <div className="mt-2">
                <img src="https://wttr.in/Beijing_0pqm_lang=zh.png" alt="Weather" className="w-full max-w-md mx-auto rounded-lg" crossOrigin="anonymous" />
              </div>
            </div>
          )}

          {current && !loading && (
            <div>
              <p className="text-base font-medium text-gray-100 mb-2">{current.city}</p>
              <div className="grid grid-cols-3 gap-2 text-center mb-3">
                <div className="bg-dark-700 rounded-lg p-2">
                  <p className="text-xs text-gray-400 mb-0.5">{tKey('homeWidgets.temperature', lang)}</p>
                  <p className="text-lg font-bold text-gold-400">{current.temp}°C</p>
                  <p className="text-xs text-gray-500">体感 {current.feelsLike}°C</p>
                </div>
                <div className="bg-dark-700 rounded-lg p-2">
                  <p className="text-xs text-gray-400 mb-0.5">{tKey('homeWidgets.condition', lang)}</p>
                  <p className="text-lg font-bold text-gray-100">{current.condition}</p>
                </div>
                <div className="bg-dark-700 rounded-lg p-2">
                  <p className="text-xs text-gray-400 mb-0.5">{tKey('homeWidgets.humidity', lang)}</p>
                  <p className="text-lg font-bold text-gray-100">{current.humidity}%</p>
                </div>
                <div className="bg-dark-700 rounded-lg p-2">
                  <p className="text-xs text-gray-400 mb-0.5">{tKey('homeWidgets.wind', lang)}</p>
                  <p className="text-sm font-semibold text-gray-100">{current.wind}</p>
                </div>
                <div className="bg-dark-700 rounded-lg p-2">
                  <p className="text-xs text-gray-400 mb-0.5">紫外线</p>
                  <p className="text-sm font-semibold text-gray-100">{current.uv || '—'}</p>
                </div>
                <div className="bg-dark-700 rounded-lg p-2">
                  <p className="text-xs text-gray-400 mb-0.5">能见度</p>
                  <p className="text-sm font-semibold text-gray-100">{current.visibility ? current.visibility + ' km' : '—'}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 7日天气预报 */}
      {forecast.length > 0 && !loading && (
        <div className="max-w-6xl mx-auto px-4 mb-8">
          <h3 className="text-base font-semibold text-gold-400 font-serif mb-3 text-center">
            📊 {tKey('homeWidgets.forecast7', lang)}
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
            {forecast.map((day, i) => (
              <div key={i} className="bg-dark-800/60 backdrop-blur rounded-xl border border-dark-600 p-3 text-center">
                <p className="text-sm font-medium text-gold-400 mb-1">
                  {i === 0 ? tKey('homeWidgets.today', lang) : tKey('homeWidgets.day' + day.dayOfWeek, lang) || '周' + day.dayOfWeek}
                </p>
                <p className="text-xs text-gray-500 mb-2">{day.date}</p>
                <div className="text-2xl mb-1">
                  {day.condition.includes('晴') ? '☀️' :
                   day.condition.includes('云') ? '⛅' :
                   day.condition.includes('阴') ? '☁️' :
                   day.condition.includes('雨') ? '🌧️' :
                   day.condition.includes('雷') ? '⛈️' :
                   day.condition.includes('雪') ? '❄️' :
                   day.condition.includes('雾') || day.condition.includes('霾') ? '🌫️' : '☀️'}
                </div>
                <p className="text-xs text-gray-400 mb-1">{day.condition}</p>
                <div className="flex justify-center gap-1 text-sm">
                  <span className="text-red-400 font-medium">{day.tempMax}°</span>
                  <span className="text-blue-400 font-medium">{day.tempMin}°</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">{day.humidity ? '💧' + day.humidity + '%' : ''}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 天气趋势图 */}
      {!loading && (
        <div className="max-w-6xl mx-auto px-4 mb-8">
          <h3 className="text-base font-semibold text-gold-400 font-serif mb-3 text-center">
            🌡 {tKey('homeWidgets.forecastGraph', lang)}
          </h3>
          <div className="bg-dark-800/80 backdrop-blur rounded-xl border border-dark-600 p-4 overflow-x-auto text-center">
            <div className="inline-block">
              <img src="https://wttr.in/Beijing_0pq_lang=zh.png" alt="7日天气趋势"
                className="max-w-full h-auto rounded-lg" crossOrigin="anonymous" />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
