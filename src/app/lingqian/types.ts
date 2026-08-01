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
  '上吉':'text-jade-600 bg-jade-500/15 border-jade-500/30',
  '大吉':'text-jade-600 bg-jade-500/15 border-jade-500/30',
  '中吉':'text-jade-500 bg-jade-500/10 border-jade-500/25',
  '中平':'text-gray-500 bg-dark-700 border-dark-600',
  '中下':'text-tu-600 bg-tu-500/10 border-tu-500/25',
  '下下':'text-zhuhong bg-zhuhong/10 border-zhuhong/25',
  '下平':'text-zhuhong/80 bg-zhuhong/5 border-zhuhong/20',
}
