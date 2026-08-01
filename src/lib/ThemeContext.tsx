'use client'

import { createContext, useContext, useEffect, useState } from 'react'

export type ThemeMode = 'day' | 'cloud' | 'night'

const THEME_KEY = '***'

interface ThemeContextValue {
  theme: ThemeMode
  setTheme: (t: ThemeMode) => void
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'day',
  setTheme: () => {},
})

export const THEME_LABELS: Record<ThemeMode, { label: string; icon: string }> = {
  day: { label: '昼', icon: '☀️' },
  cloud: { label: '云', icon: '⛅' },
  night: { label: '夜', icon: '🌙' },
}

function getThemeStyle(mode: ThemeMode): string {
  const day = [
    `html, body { background: #faf9f6 !important; color: #2d2d3f !important; }`,
    `.glass-panel { background: rgba(255,255,255,0.65) !important; }`,
    `.bg-white { background: #ffffff !important; }`,
    `.bg-gray-50 { background: #f5f4f0 !important; }`,
    `.border-gray-100 { border-color: rgba(180,170,160,0.25) !important; }`,
    `.text-gray-200,.text-gray-300,.text-gray-400{color:#555568 !important}`,
    `.text-gray-500,.text-gray-600{color:#3d3d50 !important}`,
    `.text-gold-300,.text-gold-400,.text-gold-500{color:#8a7020 !important}`,
    `::selection{background:rgba(91,140,122,0.25)!important;color:#1a1a1a!important}`,
  ]
  const cloud = [
    `html,body{background:#eef1f5!important;color:#2a3344!important}`,
    `.glass-panel{background:rgba(240,245,250,0.72)!important}`,
    `.bg-white{background:#f0f3f7!important}`,
    `.bg-gray-50{background:#e8ecf2!important}`,
    `.border-gray-100,.border-gray-200{border-color:rgba(140,165,195,0.2)!important}`,
    `.text-gray-200,.text-gray-300,.text-gray-400{color:#7a8599!important}`,
    `.text-gray-500,.text-gray-600,.text-gray-700{color:#4a5568!important}`,
  ]
  const night = [
    `html,body{background:#0a0a18!important;color:#d0d8ec!important}`,
    `.glass-panel{background:rgba(10,10,24,0.88)!important;border-color:rgba(60,70,120,0.3)!important}`,
    `.bg-white{background:#0f0f24!important}`,
    `.bg-gray-50{background:#14142e!important}`,
    `.bg-jade-50{background:rgba(90,154,136,0.15)!important}`,
    `.bg-amber-50{background:rgba(180,140,60,0.15)!important}`,
    `.bg-sky-50{background:rgba(80,140,200,0.12)!important}`,
    `.bg-gold-50\\/30{background:rgba(180,160,80,0.08)!important}`,
    `.bg-gold-50\\/50{background:rgba(180,160,80,0.12)!important}`,
    `.border-gray-100,.border-gray-200,.border-gray-50{border-color:rgba(50,60,100,0.25)!important}`,
    `.border-gold-200\\/50{border-color:rgba(180,160,80,0.2)!important}`,
    `.border-gold-200\\/30{border-color:rgba(180,160,80,0.12)!important}`,
    `.text-gray-200,.text-gray-300,.text-gray-400{color:#586090!important}`,
    `.text-gray-500,.text-gray-600,.text-gray-700,.text-gray-800{color:#8890b0!important}`,
    `.text-gold-600,.text-gold-500{color:#c8a850!important}`,
    `.text-jade-500,.text-jade-600{color:#60a890!important}`,
    `.text-zhuhong,.text-zhuhong-dark{color:#e06058!important}`,
    `.text-shui-500,.text-shui-600,.text-shui-700{color:#7ab0d0!important}`,
    `.text-tu-500,.text-tu-600,.text-tu-700{color:#d0b080!important}`,
    `::selection{background:rgba(100,130,200,0.3)!important;color:#e0e4f0!important}`,
    `::-webkit-scrollbar-track{background:#0f0f24!important}`,
    `::-webkit-scrollbar-thumb{background:#2a2e50!important}`,
    `footer a,footer p{color:#8890b0!important}`,
  ]

  const rules = { day, cloud, night }[mode]
  return rules.join(' ')
}

// ── 星空动画（纯CSS，不依赖Tailwind） ──
const STARS_CSS = `
@keyframes star-drift {
  0% { background-position: 0% 0%, 50% 50%, 0% 0%; }
  25% { background-position: 25% 50%, 75% 25%, 10% 30%; }
  50% { background-position: 50% 0%, 25% 75%, 20% 60%; }
  75% { background-position: 75% 50%, 50% 25%, 30% 10%; }
  100% { background-position: 0% 0%, 50% 50%, 0% 0%; }
}
.starry-bg {
  position: fixed; inset: 0; pointer-events: none;
  background: transparent;
  background-image:
    radial-gradient(2.5px 2.5px at 5% 10%, rgba(255,255,255,0.9) 50%, transparent 50%),
    radial-gradient(2px 2px at 8% 25%, rgba(200,220,255,0.7) 50%, transparent 50%),
    radial-gradient(1.5px 1.5px at 12% 42%, rgba(255,255,255,0.8) 50%, transparent 50%),
    radial-gradient(3px 3px at 15% 3%, rgba(255,255,255,0.95) 50%, transparent 50%),
    radial-gradient(2px 2px at 18% 60%, rgba(210,230,255,0.75) 50%, transparent 50%),
    radial-gradient(1.5px 1.5px at 22% 15%, rgba(255,255,255,0.85) 50%, transparent 50%),
    radial-gradient(2.5px 2.5px at 25% 78%, rgba(220,240,255,0.8) 50%, transparent 50%),
    radial-gradient(2px 2px at 30% 35%, rgba(255,255,255,0.7) 50%, transparent 50%),
    radial-gradient(1.5px 1.5px at 35% 5%, rgba(255,255,255,0.9) 50%, transparent 50%),
    radial-gradient(3px 3px at 38% 50%, rgba(210,230,255,0.85) 50%, transparent 50%),
    radial-gradient(2px 2px at 42% 85%, rgba(255,255,255,0.75) 50%, transparent 50%),
    radial-gradient(1.5px 1.5px at 48% 20%, rgba(255,255,255,0.8) 50%, transparent 50%),
    radial-gradient(2.5px 2.5px at 52% 65%, rgba(220,240,255,0.7) 50%, transparent 50%),
    radial-gradient(2px 2px at 55% 10%, rgba(255,255,255,0.9) 50%, transparent 50%),
    radial-gradient(1.5px 1.5px at 60% 40%, rgba(255,255,255,0.85) 50%, transparent 50%),
    radial-gradient(3px 3px at 65% 90%, rgba(210,230,255,0.75) 50%, transparent 50%),
    radial-gradient(2px 2px at 70% 15%, rgba(255,255,255,0.8) 50%, transparent 50%),
    radial-gradient(1.5px 1.5px at 75% 55%, rgba(255,255,255,0.7) 50%, transparent 50%),
    radial-gradient(2.5px 2.5px at 78% 30%, rgba(220,240,255,0.85) 50%, transparent 50%),
    radial-gradient(2px 2px at 82% 70%, rgba(255,255,255,0.9) 50%, transparent 50%),
    radial-gradient(1.5px 1.5px at 88% 8%, rgba(255,255,255,0.8) 50%, transparent 50%),
    radial-gradient(3px 3px at 92% 45%, rgba(210,230,255,0.75) 50%, transparent 50%),
    radial-gradient(2px 2px at 95% 80%, rgba(255,255,255,0.85) 50%, transparent 50%),
    radial-gradient(1.5px 1.5px at 98% 25%, rgba(255,255,255,0.7) 50%, transparent 50%);
  background-size: 100% 100%;
  background-repeat: no-repeat;
  animation: star-drift 60s ease-in-out infinite;
  transition: opacity 0.6s;
}
.starry-bg::after {
  content:''; position:absolute; inset:0;
  background-image:
    radial-gradient(ellipse 250px 120px at 20% 30%, rgba(100,160,230,0.08) 0%, transparent 100%),
    radial-gradient(ellipse 200px 100px at 65% 55%, rgba(80,140,220,0.06) 0%, transparent 100%),
    radial-gradient(ellipse 180px 80px at 45% 75%, rgba(120,170,240,0.05) 0%, transparent 100%);
}
`

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>('day')
  const [mounted, setMounted] = useState(false)
  const [starsInjected, setStarsInjected] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem(THEME_KEY) as ThemeMode | null
    if (saved && ['day','cloud','night'].includes(saved)) {
      setThemeState(saved)
    }
    setMounted(true)
  }, [])

  // Inject starry sky CSS once
  useEffect(() => {
    if (!starsInjected) {
      const id = '-starry-sky-css'
      if (!document.getElementById(id)) {
        const el = document.createElement('style')
        el.id = id
        el.textContent = STARS_CSS
        document.head.appendChild(el)
      }
      setStarsInjected(true)
    }
  }, [starsInjected])

  const setTheme = (t: ThemeMode) => {
    setThemeState(t)
    localStorage.setItem(THEME_KEY, t)
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {mounted && <style dangerouslySetInnerHTML={{ __html: getThemeStyle(theme) }} />}
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
