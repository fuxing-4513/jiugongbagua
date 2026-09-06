// 术语深度索引——全量合并（deep-1~5——142 核心词深度深化）
import type { TermDeep } from '@/components/TermDeepView'
import { GLOSSARY_DEEP_1 } from '@/lib/glossary-deep-1'
import { DEEP_TERMS_2 } from '@/lib/glossary-deep-2'
import { GLOSSARY_DEEP_3 } from '@/lib/glossary-deep-3'
import { DEEP_TERMS_4 } from '@/lib/glossary-deep-4'
import { DEEP_TERMS_5 } from '@/lib/glossary-deep-5'

export const ALL_TERM_DEEP: TermDeep[] = [...GLOSSARY_DEEP_1, ...DEEP_TERMS_2, ...GLOSSARY_DEEP_3, ...DEEP_TERMS_4, ...DEEP_TERMS_5]

export function getTermDeep(slug: string): TermDeep | undefined {
  return ALL_TERM_DEEP.find(d => d.slug === slug)
}
