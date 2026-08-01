'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'

/**
 * 顶部加载进度条 — 监听路由变化自动显示
 */
export default function TopLoadingBar() {
  const pathname = usePathname()
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const t0 = setTimeout(() => {
      setLoading(true)
      setProgress(30)
    }, 0)
    const t1 = setTimeout(() => setProgress(60), 100)
    const t2 = setTimeout(() => setProgress(85), 300)
    const t3 = setTimeout(() => {
      setProgress(100)
      setTimeout(() => setLoading(false), 200)
    }, 500)
    return () => { clearTimeout(t0); clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [pathname])

  if (!loading) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] h-0.5 bg-dark-800">
      <div
        className="h-full bg-gradient-to-r from-gold-500 to-gold-500 transition-all duration-300 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}
