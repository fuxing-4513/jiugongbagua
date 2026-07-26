'use client'

import { useTheme, type ThemeMode } from '@/lib/ThemeContext'

const themes: { id: ThemeMode; icon: string; label: string }[] = [
  { id: 'day', icon: '☀️', label: '昼' },
  { id: 'cloud', icon: '⛅', label: '云' },
  { id: 'night', icon: '🌙', label: '夜' },
]

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <div
      className="flex items-center rounded-full bg-white/60 border border-gray-200/60 shadow-sm overflow-hidden"
      role="radiogroup"
      aria-label="切换主题"
    >
      {themes.map((t, i) => {
        const active = theme === t.id
        return (
          <button
            key={t.id}
            onClick={() => setTheme(t.id)}
            aria-checked={active}
            role="radio"
            className={`
              flex items-center gap-1 px-3 py-1.5 text-xs font-medium
              transition-all duration-300 select-none
              ${active
                ? 'text-gray-800 shadow-sm'
                : 'text-gray-400 hover:text-gray-600'
              }
              ${i < themes.length - 1 ? 'border-r border-gray-200/30' : ''}
            `}
            style={active ? {
              background: theme === 'day' ? '#f0ede8' :
                          theme === 'cloud' ? '#dce4ee' :
                          '#282d45',
              color: theme === 'night' ? '#e0e4f0' : '#3d3d50',
            } : undefined}
          >
            <span className={active ? '' : 'opacity-60'}>{t.icon}</span>
            <span>{t.label}</span>
          </button>
        )
      })}
    </div>
  )
}
