// 术语深度索引（deep-1~5 数据批完成后全量合并）
import type { TermDeep } from '@/components/TermDeepView'

const ALL_DEEP: TermDeep[] = [] as TermDeep[]

export function getTermDeep(slug: string): TermDeep | undefined {
  return ALL_DEEP.find(d => d.slug === slug)
}
