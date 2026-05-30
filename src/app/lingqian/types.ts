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
  '上上':'text-emerald-400 bg-emerald-900/30 border-emerald-700',
  '上吉':'text-green-400 bg-green-900/30 border-green-700',
  '大吉':'text-green-400 bg-green-900/30 border-green-700',
  '中吉':'text-lime-400 bg-lime-900/30 border-lime-700',
  '中平':'text-yellow-400 bg-yellow-900/30 border-yellow-700',
  '中下':'text-orange-400 bg-orange-900/30 border-orange-700',
  '下下':'text-red-400 bg-red-900/30 border-red-700',
  '下平':'text-rose-400 bg-rose-900/30 border-rose-700',
}
