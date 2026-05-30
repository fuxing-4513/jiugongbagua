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

export default function WeatherWidget() {
  const { t, locale } = useLocale()
  const lang = t as unknown as Record<string, unknown>

  const [weatherCity, setWeatherCity] = useState<string>('')
  const [weatherQueried, setWeatherQueried] = useState(false)
  const [imgFailed, setImgFailed] = useState(false)

  useEffect(() => {
    const cached = localStorage.getItem('weatherCity')
    if (cached) {
      setWeatherCity(cached)
      setWeatherQueried(true)
      return
    }
    ;(async () => {
      let city = ''
      // 策略1: ip-api.com
      try {
        const r = await fetch('https://ip-api.com/json/?lang=zh-CN&fields=city,regionName,countryCode')
        if (r.ok) {
          const d = await r.json()
          if (d.city) city = d.city
        }
      } catch {}
      // 策略2: ipinfo.io
      if (!city) {
        try {
          const r = await fetch('https://ipinfo.io/json')
          if (r.ok) {
            const d = await r.json()
            city = d.city || ''
          }
        } catch {}
      }
      // 策略3: 浏览器定位
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
        } catch {}
      }
      if (!city) city = 'Beijing'
      localStorage.setItem('weatherCity', city)
      setWeatherCity(city)
      setWeatherQueried(true)
    })()
  }, [])

  const refresh = () => {
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
  }

  const cityEncoded = encodeURIComponent(weatherCity || 'Beijing')
  const langParam = locale.startsWith('zh') ? 'zh' : 'en'
  const weatherImgUrl = `https://wttr.in/${cityEncoded}_2pq_lang=${langParam}_m.png`
  const forecastImgUrl = `https://wttr.in/${cityEncoded}_0p_lang=${langParam}_m.png`
  const fallbackImgUrl = `https://wttr.in/Beijing_2pq_lang=${langParam}_m.png`
  const fallbackForecastUrl = `https://wttr.in/Beijing_0p_lang=${langParam}_m.png`

  return (
    <div className="bg-dark-800/80 backdrop-blur rounded-xl border border-dark-600 p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">🌤</span>
          <h3 className="text-base font-semibold text-gold-300">{tKey('homeWidgets.weather', lang)}</h3>
        </div>
        <button onClick={refresh} className="text-xs text-gold-500 hover:text-gold-400 transition-colors">
          {tKey('homeWidgets.weatherRefresh', lang)}
        </button>
      </div>

      {!weatherQueried && (
        <p className="text-sm text-gray-400">{tKey('homeWidgets.loadingWeather', lang)}</p>
      )}

      {weatherQueried && (
        <div>
          <div className="mb-3 text-center">
            <img
              src={imgFailed ? fallbackImgUrl : weatherImgUrl}
              alt="Weather"
              className="max-w-full h-auto mx-auto rounded-lg"
              crossOrigin="anonymous"
              onError={(e) => {
                const img = e.target as HTMLImageElement
                if (!img.dataset.fallback) {
                  img.dataset.fallback = '1'
                  img.src = fallbackImgUrl
                } else {
                  setImgFailed(true)
                }
              }}
            />
          </div>
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
                  if (!img.dataset.fallback2) {
                    img.dataset.fallback2 = '1'
                  }
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
