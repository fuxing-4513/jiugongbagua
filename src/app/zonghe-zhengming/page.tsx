import type { Metadata } from 'next'
import ZongheContent from './zonghe-content'

export const metadata: Metadata = {
  title: '八字紫微综合印证 - 同盘校验',
  description: '八字紫微斗数综合印证工具，同盘对比校验，分析命理体系的交叉验证结果。',
}

export default function ZongheZhengmingPage() {
  return <ZongheContent />
}
