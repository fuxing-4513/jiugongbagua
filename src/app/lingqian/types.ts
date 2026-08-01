// 灵签类型定义
export interface LingqianItem {
  id: number
  title: string        // 签题/典故
  level: '上上'|'上吉'|'大吉'|'中吉'|'中平'|'中下'|'下下'|'下平'
  poem: string         // 签诗
  verdict: string      // 断语
  meaning: string      // 签意/解签
  advice?: string      // 建议
}

export interface LingqianCategory {
  key: string
  name: string
  icon: string
  total: number
  items: LingqianItem[]
}

// 颜色映射
export const LEVEL_COLORS: Record<string,string> = {
  '上上':'text-gold-600 bg-gold-500/15 border-gold-500/30',
  '上吉':'text-gold-600 bg-gold-500/15 border-gold-500/30',
  '大吉':'text-gold-600 bg-gold-500/15 border-gold-500/30',
  '中吉':'text-gold-600 bg-gold-500/10 border-gold-500/25',
  '中平':'text-gray-500 bg-dark-700 border-dark-600',
  '中下':'text-gold-600 bg-gold-500/10 border-gold-500/25',
  '下下':'text-gold-600 bg-gold-500/10 border-gold-500/25',
  '下平':'text-gold-600/80 bg-gold-500/5 border-gold-500/20',
}
