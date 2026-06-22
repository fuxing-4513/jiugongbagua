'use client'

import { useState } from 'react'
// ── 中国主要城市经度 ──
const CITIES: { name: string; lng: number }[] = [
  { name: '北京', lng: 116.4 }, { name: '上海', lng: 121.5 }, { name: '天津', lng: 117.2 },
  { name: '重庆', lng: 106.5 }, { name: '广州', lng: 113.3 }, { name: '深圳', lng: 114.1 },
  { name: '成都', lng: 104.1 }, { name: '杭州', lng: 120.2 }, { name: '武汉', lng: 114.3 },
  { name: '西安', lng: 108.9 }, { name: '南京', lng: 118.8 }, { name: '郑州', lng: 113.7 },
  { name: '长沙', lng: 113.0 }, { name: '沈阳', lng: 123.4 }, { name: '青岛', lng: 120.4 },
  { name: '大连', lng: 121.6 }, { name: '厦门', lng: 118.1 }, { name: '福州', lng: 119.3 },
  { name: '昆明', lng: 102.7 }, { name: '贵阳', lng: 106.7 }, { name: '南宁', lng: 108.3 },
  { name: '海口', lng: 110.3 }, { name: '哈尔滨', lng: 126.6 }, { name: '长春', lng: 125.3 },
  { name: '呼和浩特', lng: 111.7 }, { name: '乌鲁木齐', lng: 87.6 }, { name: '拉萨', lng: 91.1 },
  { name: '西宁', lng: 101.8 }, { name: '兰州', lng: 103.8 }, { name: '银川', lng: 106.3 },
  { name: '济南', lng: 117.0 }, { name: '太原', lng: 112.5 }, { name: '合肥', lng: 117.3 },
  { name: '南昌', lng: 115.9 }, { name: '石家庄', lng: 114.5 }, { name: '香港', lng: 114.2 },
  { name: '澳门', lng: 113.5 }, { name: '台北', lng: 121.5 },
]


interface Props {
  enabled: boolean
  onToggle: (enabled: boolean) => void
  longitude: number
  onLongitudeChange: (lng: number) => void
  timezone?: number
  onTimezoneChange?: (offset: number) => void
  compact?: boolean
}

export default function TrueSolarTime({
  enabled, onToggle, longitude, onLongitudeChange,
  timezone = 8, onTimezoneChange, compact = false,
}: Props) {
  const [customLng, setCustomLng] = useState('')
  const [showCustom, setShowCustom] = useState(false)
  const [showTz, setShowTz] = useState(false)

  const selectedCity = CITIES.find(c => Math.abs(c.lng - longitude) < 0.05)

  const timezones = [
    { label: '北京时间 UTC+8', value: 8 },
    { label: '东京 UTC+9', value: 9 },
    { label: '曼谷 UTC+7', value: 7 },
    { label: '纽约 UTC-5', value: -5 },
    { label: '洛杉矶 UTC-8', value: -8 },
    { label: '伦敦 UTC+0', value: 0 },
    { label: '巴黎 UTC+1', value: 1 },
    { label: '悉尼 UTC+10', value: 10 },
    { label: '迪拜 UTC+4', value: 4 },
    { label: '莫斯科 UTC+3', value: 3 },
  ]

  if (compact) {
    return (
      <div className="space-y-2">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={enabled}
            onChange={e => onToggle(e.target.checked)}
            className="accent-gold-500 w-3.5 h-3.5"
          />
          <span className="text-xs text-gray-400">真太阳时</span>
        </label>
        {enabled && (
          <div className="flex items-center gap-2">
            <select
              value={longitude}
              onChange={e => onLongitudeChange(parseFloat(e.target.value))}
              className="bg-dark-700 border border-dark-600 rounded text-xs px-2 py-1 text-gray-200"
            >
              {CITIES.map(c => (
                <option key={c.name} value={c.lng}>{c.name} {c.lng}°E</option>
              ))}
            </select>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="bg-dark-700/50 rounded-lg border border-dark-600 p-3 space-y-3">
      {/* 开关 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={enabled}
              onChange={e => onToggle(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-dark-600 rounded-full peer peer-checked:bg-gold-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all" />
          </label>
          <span className="text-sm text-gray-300 font-medium">真太阳时</span>
        </div>
        {enabled && selectedCity && (
          <span className="text-xs text-gold-600">
            {selectedCity.name} · {longitude.toFixed(1)}°E
          </span>
        )}
      </div>

      {/* 城市选择 */}
      {enabled && (
        <>
          <div className="flex items-center gap-2">
            <select
              value={longitude}
              onChange={e => {
                const v = parseFloat(e.target.value)
                if (v > 0) { onLongitudeChange(v); setShowCustom(false) }
              }}
              className="flex-1 bg-dark-700 border border-dark-600 rounded-lg text-sm px-3 py-1.5 text-gray-200 focus:outline-none focus:border-gold-500"
            >
              <option value={0}>选择城市...</option>
              {CITIES.map(c => (
                <option key={c.name} value={c.lng}>{c.name}（{c.lng.toFixed(1)}°E）</option>
              ))}
            </select>
            <button
              onClick={() => setShowCustom(!showCustom)}
              className="text-xs text-gray-500 hover:text-gold-600 px-2 py-1.5 border border-dark-600 rounded-lg"
            >
              自定义
            </button>
          </div>

          {showCustom && (
            <div className="flex items-center gap-2">
              <input
                type="number"
                step="0.1"
                min="70"
                max="140"
                placeholder="输入经度..."
                value={customLng}
                onChange={e => {
                  setCustomLng(e.target.value)
                  const v = parseFloat(e.target.value)
                  if (!isNaN(v)) onLongitudeChange(v)
                }}
                className="w-32 bg-dark-700 border border-dark-600 rounded-lg text-sm px-2 py-1.5 text-gray-200 placeholder-gray-500 focus:outline-none focus:border-gold-500"
              />
              <span className="text-xs text-gray-500">°E（70~140）</span>
            </div>
          )}
        </>
      )}

      {/* 时区选择 */}
      {onTimezoneChange && (
        <div className="pt-2 border-t border-dark-600">
          <button
            onClick={() => setShowTz(!showTz)}
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-300"
          >
            🌍 时区：{timezones.find(t => t.value === timezone)?.label || `UTC${timezone >= 0 ? '+' : ''}${timezone}`}
            <span className="text-[10px]">▾</span>
          </button>
          {showTz && (
            <div className="mt-2 grid grid-cols-2 gap-1">
              {timezones.map(tz => (
                <button
                  key={tz.value}
                  onClick={() => { onTimezoneChange(tz.value); setShowTz(false) }}
                  className={`text-xs px-2 py-1 rounded border transition-colors ${
                    timezone === tz.value
                      ? 'border-gold-500 bg-gold-500/20 text-gold-600'
                      : 'border-dark-600 text-gray-400 hover:border-dark-500'
                  }`}
                >
                  {tz.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {enabled && (
        <p className="text-[10px] text-gray-600 leading-relaxed">
          真太阳时 = 北京时间 - (120° - 当地经度) × 4分钟 + 均时差。如成都（104.1°E）比北京时间晚约63.6分钟。
        </p>
      )}
    </div>
  )
}
