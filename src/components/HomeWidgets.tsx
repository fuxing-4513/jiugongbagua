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

export default function HomeWidgets() {
  const { t, locale } = useLocale()
  const lang = t as unknown as Record<string, unknown>

  const [huangli, setHuangli] = useState<HuangliData | null>(null)
  const [weatherCity, setWeatherCity] = useState<string>('')
  const [weatherQueried, setWeatherQueried] = useState(false)
  const [imgFailed, setImgFailed] = useState(false)

  // 定位城市
  useEffect(() => {
    // 先尝试 localStorage 缓存城市名（避免每次刷新都请求定位）
    const cached = localStorage.getItem('weatherCity')
    if (cached) {
      setWeatherCity(cached)
      setWeatherQueried(true)
      return
    }

    // 多策略定位
    ;(async () => {
      let city = ''
      let region = ''

      // 策略1: ip-api.com (JSONP 兼容性好，免费支持 HTTPS)
      try {
        const r = await fetch('https://ip-api.com/json/?lang=zh-CN&fields=city,regionName,countryCode')
        if (r.ok) {
          const d = await r.json()
          if (d.city) { city = d.city; region = d.regionName || '' }
        }
      } catch {
        // fall through
      }

      // 策略2: ipinfo.io (备用)
      if (!city) {
        try {
          const r = await fetch('https://ipinfo.io/json')
          if (r.ok) {
            const d = await r.json()
            city = d.city || ''; region = d.region || ''
          }
        } catch {
          // fall through
        }
      }

      // 策略3: 浏览器定位 + 反向地理编码
      if (!city) {
        try {
          const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 })
          })
          const r = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&accept-language=zh&zoom=10`
          )
          if (r.ok) {
            const d = await r.json()
            city = d.address?.city || d.address?.town || d.address?.county || ''
          }
        } catch {
          // fall through
        }
      }

      if (!city) { city = 'Beijing'; region = '' }

      // 选择 wttr.in 可识别的城市名
      // 国内城市用拼音或中文都行
      const finalCity = city
      if (region && region !== city) {
        localStorage.setItem('weatherCity', decodeURIComponent(finalCity))
      } else {
        localStorage.setItem('weatherCity', finalCity)
      }
      setWeatherCity(finalCity)
      setWeatherQueried(true)
    })()
  }, [])

  useEffect(() => {
    setHuangli(getTodayHuangli())
  }, [])

  if (!huangli) return null

  // wttr.in 图片 URL（不受 CORS 限制）
  const cityEncoded = encodeURIComponent(weatherCity || 'Beijing')
  const langParam = locale.startsWith('zh') ? 'zh' : 'en'

  // 当前实况 + 7日预报一体化图片
  // 0: 仅当前天气, 1: 当前+今日, 2: 当前+今日+明日
  // _0pq = 仅当前 + 透明 + 带边框
  // _2pnq = 当前+今明 + 窄版 + 静默
  const weatherImgUrl = `https://wttr.in/${cityEncoded}_2pq_lang=${langParam}_m.png`
  const forecastImgUrl = `https://wttr.in/${cityEncoded}_0p_lang=${langParam}_m.png`

  // 备用：如果城市获取失败，用北京
  const fallbackImgUrl = `https://wttr.in/Beijing_2pq_lang=${langParam}_m.png`
  const fallbackForecastUrl = `https://wttr.in/Beijing_0p_lang=${langParam}_m.png`

  return (
    <div className="max-w-6xl mx-auto px-4">
      <h2 className="text-2xl font-bold text-gold-400 font-serif mb-4 text-center">
        {tKey('homeWidgets.title', lang)}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {/* 黄历卡片 */}
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

        {/* 天气卡片（含当前实况 + 7日预报 + 趋势图） */}
        <div className="bg-dark-800/80 backdrop-blur rounded-xl border border-dark-600 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xl">🌤</span>
              <h3 className="text-base font-semibold text-gold-300">{tKey('homeWidgets.weather', lang)}</h3>
            </div>
            <button
              onClick={() => {
                localStorage.removeItem('weatherCity')
                setWeatherQueried(false)
                setImgFailed(false)
                setWeatherCity('')
                ;(async () => {
                  let city = ''
                  try {
                    const r = await fetch('https://ip-api.com/json/?lang=zh-CN&fields=city,regionName')
                    if (r.ok) {
                      const d = await r.json()
                      if (d.city) city = d.city
                    }
                  } catch {}
                  if (!city) {
                    try {
                      const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
                        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 })
                      )
                      const r = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&accept-language=zh&zoom=10`
                      )
                      if (r.ok) {
                        const d = await r.json()
                        city = d.address?.city || d.address?.town || d.address?.county || ''
                      }
                    } catch {}
                  }
                  const fc = city || 'Beijing'
                  localStorage.setItem('weatherCity', fc)
                  setWeatherCity(fc)
                  setWeatherQueried(true)
                })()
              }}
              className="text-xs text-gold-500 hover:text-gold-400 transition-colors"
            >
              {tKey('homeWidgets.weatherRefresh', lang)}
            </button>
          </div>

          {!weatherQueried && (
            <p className="text-sm text-gray-400">{tKey('homeWidgets.loadingWeather', lang)}</p>
          )}

          {weatherQueried && (
            <div>
              {/* 当前实况 + 今明预报 */}
              <div className="mb-3 text-center">
                <img
                  src={imgFailed ? fallbackImgUrl : weatherImgUrl}
                  alt="Weather"
                  className="max-w-full h-auto mx-auto rounded-lg"
                  crossOrigin="anonymous"
                  onError={(e) => {
                    const img = e.target as HTMLImageElement
                    // 尝试备用 city
                    if (!img.dataset.fallback) {
                      img.dataset.fallback = '1'
                      img.src = fallbackImgUrl
                    } else {
                      setImgFailed(true)
                    }
                  }}
                />
              </div>

              {/* 7日预报趋势图（合并在一张卡片内） */}
              <div className="mt-3 pt-3 border-t border-dark-700">
                <p className="text-xs text-gold-400 font-medium mb-2 text-center">
                  📊 {tKey('homeWidgets.forecast7', lang)}
                </p>
                <div className="text-center overflow-x-auto">
                  <img
                    src={imgFailed ? fallbackForecastUrl : forecastImgUrl}
                    alt="7日天气预报"
                    className="max-w-full h-auto mx-auto rounded-lg"
                    crossOrigin="anonymous"
                    onError={(e) => {
                      const img = e.target as HTMLImageElement
                      if (!img.dataset.fallback) {
                        img.dataset.fallback = '1'
                        img.src = imgFailed ? fallbackForecastUrl : forecastImgUrl.replace('_0p_', '_2p_')
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
