import type { Metadata } from 'next'
import AstroClient from './AstroClient'

export const metadata: Metadata = {
  title: '西洋占星 · 星盘排盘 · 九宫',
  description: '现代西洋占星星盘在线排盘：上升星座、太阳月亮星座、行星落宫落座、相位分析——基于瑞士星历同精度天文算法（VSOP87）。',
}

export default function AstroPage() {
  return <AstroClient />
}
