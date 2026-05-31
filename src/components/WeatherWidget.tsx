'use client'

import { useEffect, useState } from 'react'
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

interface WeatherData {
  city: string
  temp: string
  feelsLike: string
  high: string
  low: string
  humidity: string
  windDir: string
  windSpeed: string
  windLevel: string
  vis: string
  pressure: string
  uv: string
  aqi: string
  aqiLevel: string
  condition: string
  conditionIcon: string
}

// wttr.in condition code → emoji + label
const COND_MAP: Record<string, [string, string]> = {
  '113': ['☀️', '晴'],
  '116': ['⛅', '多云'],
  '119': ['☁️', '阴'],
  '122': ['☁️', '阴'],
  '143': ['🌫️', '雾'],
  '176': ['🌦️', '小雨'],
  '179': ['🌧️', '雨'],
  '182': ['🌧️', '雨夹雪'],
  '185': ['🌧️', '冻雨'],
  '200': ['⛈️', '雷阵雨'],
  '227': ['🌨️', '小雪'],
  '230': ['🌨️', '大雪'],
  '248': ['🌫️', '雾'],
  '260': ['🌫️', '雾'],
  '263': ['🌦️', '小雨'],
  '266': ['🌦️', '小雨'],
  '281': ['🌧️', '冻雨'],
  '284': ['🌧️', '冻雨'],
  '293': ['🌦️', '小雨'],
  '296': ['🌦️', '小雨'],
  '299': ['🌧️', '中雨'],
  '302': ['🌧️', '中雨'],
  '305': ['🌧️', '大雨'],
  '308': ['🌧️', '大雨'],
  '311': ['🌧️', '雨'],
  '314': ['🌧️', '雨'],
  '317': ['🌧️', '雨'],
  '320': ['🌨️', '小雪'],
  '323': ['🌨️', '雪'],
  '326': ['🌨️', '雪'],
  '329': ['❄️', '大雪'],
  '332': ['❄️', '大雪'],
  '335': ['❄️', '大雪'],
  '338': ['❄️', '大雪'],
  '350': ['🧊', '冰雹'],
  '353': ['🌦️', '小雨'],
  '356': ['🌧️', '大雨'],
  '359': ['🌧️', '暴雨'],
  '362': ['🌧️', '大雨'],
  '365': ['🌧️', '暴雨'],
  '368': ['🌨️', '小雪'],
  '371': ['❄️', '大雪'],
  '374': ['🧊', '冰雹'],
  '377': ['🧊', '冰雹'],
  '386': ['⛈️', '雷阵雨'],
  '389': ['⛈️', '雷阵雨'],
  '392': ['⛈️', '雷阵雨'],
  '395': ['🌨️', '雷雪'],
}

const AQI_LABELS: Record<string, string> = {
  '1': '优', '2': '良', '3': '轻度', '4': '中度', '5': '重度', '6': '严重',
}
const AQI_COLORS: Record<string, string> = {
  '1': 'text-green-400 border-green-700/40',
  '2': 'text-lime-400 border-lime-700/40',
  '3': 'text-yellow-400 border-yellow-700/40',
  '4': 'text-orange-400 border-orange-700/40',
  '5': 'text-red-400 border-red-700/40',
  '6': 'text-purple-400 border-purple-700/40',
}

function parseWttrJson(raw: any): WeatherData | null {
  if (!raw?.current_condition?.[0]) return null
  const cc = raw.current_condition[0]
  const area = raw.nearest_area?.[0]?.areaName?.[0]?.value || raw.request?.[0]?.query || ''
  const condCode = cc.weatherCode || '113'
  const [emoji, label] = COND_MAP[condCode] || ['🌤', '未知']
  return {
    city: area,
    temp: cc.temp_C || '—',
    feelsLike: cc.FeelsLikeC || cc.temp_C || '—',
    high: cc.tempMax_C || cc.temp_C || '—',
    low: cc.tempMin_C || cc.temp_C || '—',
    humidity: cc.humidity || '—',
    windDir: cc.winddir16Point || cc.winddirDegree || '—',
    windSpeed: cc.windspeedKmph || '0',
    windLevel: cc.windGustKmph ? Math.round(parseInt(cc.windGustKmph) / 8).toString() : '—',
    vis: cc.visibility || '—',
    pressure: cc.pressure || '—',
    uv: cc.uvIndex || '0',
    aqi: cc.airQuality?.['us-epa-index'] || cc.airQuality?.['gb-defra-index'] || '—',
    aqiLevel: cc.airQuality?.['us-epa-index'] ? AQI_LABELS[cc.airQuality['us-epa-index']] || '—' : '—',
    condition: label,
    conditionIcon: emoji,
  }
}

function WindLevelIcon(level: string): string {
  const n = parseInt(level)
  if (isNaN(n) || n <= 1) return '🍃'
  if (n <= 3) return '🌬️'
  if (n <= 5) return '💨'
  if (n <= 7) return '🌪️'
  return '🌀'
}

function UVLevel(uv: string): [string, string] {
  const n = parseFloat(uv)
  if (isNaN(n)) return ['—', 'text-gray-500']
  if (n <= 2) return ['低', 'text-green-400']
  if (n <= 5) return ['中', 'text-yellow-400']
  if (n <= 7) return ['高', 'text-orange-400']
  if (n <= 10) return ['很高', 'text-red-400']
  return ['极高', 'text-purple-400']
}

export default function WeatherWidget() {
  const { t, locale } = useLocale()
  const lang = t as unknown as Record<string, unknown>

  const [data, setData] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [city, setCity] = useState('')

  const fetchWeather = async (cityName: string) => {
    setLoading(true)
    setError('')
    try {
      const r = await fetch(`https://wttr.in/${encodeURIComponent(cityName)}?format=j1&lang=${locale.startsWith('zh') ? 'zh' : 'en'}`)
      if (!r.ok) throw new Error('HTTP ' + r.status)
      const json = await r.json()
      const wd = parseWttrJson(json)
      if (wd) {
        setData(wd)
        setCity(cityName)
        localStorage.setItem('weatherCity', cityName)
      } else {
        throw new Error('parse fail')
      }
    } catch {
      setError('天气数据获取失败')
    }
    setLoading(false)
  }

  useEffect(() => {
    const cached = localStorage.getItem('weatherCity')
    if (cached) {
      fetchWeather(cached)
      return
    }
    ;(async () => {
      let detected = ''
      try {
        const r = await fetch('https://ip-api.com/json/?lang=zh-CN&fields=city,regionName')
        if (r.ok) {
          const d = await r.json()
          if (d.city) detected = d.city
        }
      } catch {}
      if (!detected) {
        try {
          const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 })
          )
          const r = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&accept-language=zh&zoom=10`
          )
          if (r.ok) {
            const d = await r.json()
            detected = d.address?.city || d.address?.town || d.address?.county || ''
          }
        } catch {}
      }
      if (!detected) detected = 'Beijing'
      fetchWeather(detected)
    })()
  }, [])

  const refresh = () => {
    localStorage.removeItem('weatherCity')
    setData(null)
    setLoading(true)
    ;(async () => {
      let detected = ''
      try {
        const r = await fetch('https://ip-api.com/json/?lang=zh-CN&fields=city,regionName')
        if (r.ok) {
          const d = await r.json()
          if (d.city) detected = d.city
        }
      } catch {}
      if (!detected) detected = 'Beijing'
      fetchWeather(detected)
    })()
  }

  return (
    <div className="bg-dark-800/80 backdrop-blur rounded-xl border border-dark-600 p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">🌤</span>
          <h3 className="text-base font-semibold text-gold-300">{tKey('homeWidgets.weather', lang)}</h3>
        </div>
        <button onClick={refresh} className="text-xs text-gold-500 hover:text-gold-400 transition-colors" disabled={loading}>
          {loading ? '⌛' : '⟳'}
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-pulse text-gray-500 text-sm">{tKey('homeWidgets.loadingWeather', lang)}</div>
        </div>
      )}

      {error && (
        <div className="text-center py-6">
          <p className="text-red-400/70 text-sm">{error}</p>
          <button onClick={refresh} className="mt-2 text-xs text-gold-500 hover:text-gold-400">重试</button>
        </div>
      )}

      {data && !loading && (
        <div>
          {/* 城市 + 当前温度 + 天气图标 */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs text-gray-400">{data.city}</p>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold text-gray-100">{data.temp}°</span>
                <span className="text-xs text-gray-500">体感 {data.feelsLike}°</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-4xl">{data.conditionIcon}</span>
              <p className="text-xs text-gray-400 mt-1">{data.condition}</p>
            </div>
          </div>

          {/* 高/低温 */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            <div className="bg-dark-700/60 rounded-lg px-3 py-2 text-center">
              <span className="text-xs text-red-400">▲ {data.high}°</span>
            </div>
            <div className="bg-dark-700/60 rounded-lg px-3 py-2 text-center">
              <span className="text-xs text-blue-400">▼ {data.low}°</span>
            </div>
          </div>

          {/* 核心指标网格 */}
          <div className="grid grid-cols-3 gap-2">
            {/* 湿度 */}
            <div className="bg-dark-700/40 rounded-lg p-2.5 text-center">
              <p className="text-lg mb-0.5">💧</p>
              <p className="text-sm font-semibold text-gray-200">{data.humidity}%</p>
              <p className="text-[10px] text-gray-500">湿度</p>
            </div>

            {/* 风力 */}
            <div className="bg-dark-700/40 rounded-lg p-2.5 text-center">
              <p className="text-lg mb-0.5">{WindLevelIcon(data.windLevel)}</p>
              <p className="text-sm font-semibold text-gray-200">{data.windSpeed}km/h</p>
              <p className="text-[10px] text-gray-500">{data.windDir} · {data.windLevel}级</p>
            </div>

            {/* 能见度 */}
            <div className="bg-dark-700/40 rounded-lg p-2.5 text-center">
              <p className="text-lg mb-0.5">👁️</p>
              <p className="text-sm font-semibold text-gray-200">{data.vis}km</p>
              <p className="text-[10px] text-gray-500">能见度</p>
            </div>

            {/* 气压 */}
            <div className="bg-dark-700/40 rounded-lg p-2.5 text-center">
              <p className="text-lg mb-0.5">🔄</p>
              <p className="text-sm font-semibold text-gray-200">{data.pressure}hPa</p>
              <p className="text-[10px] text-gray-500">气压</p>
            </div>

            {/* UV指数 */}
            <div className="bg-dark-700/40 rounded-lg p-2.5 text-center">
              <p className="text-lg mb-0.5">☀️</p>
              <p className="text-sm font-semibold text-gray-200">{data.uv}</p>
              <p className={`text-[10px] ${UVLevel(data.uv)[1]}`}>UV {UVLevel(data.uv)[0]}</p>
            </div>

            {/* 空气质量 */}
            <div className="bg-dark-700/40 rounded-lg p-2.5 text-center">
              <p className="text-lg mb-0.5">🌿</p>
              <p className={`text-sm font-semibold ${AQI_COLORS[data.aqi]?.split(' ')[0] || 'text-gray-200'}`}>
                AQI {data.aqi}
              </p>
              <p className={`text-[10px] ${AQI_COLORS[data.aqi]?.split(' ')[0] || 'text-gray-500'}`}>
                {data.aqiLevel || '—'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
