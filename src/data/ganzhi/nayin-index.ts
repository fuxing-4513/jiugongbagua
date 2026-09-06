// 六十甲子纳音 barrel
import { NAYIN_PART1 } from './nayin-part1'
import { NAYIN_PART2 } from './nayin-part2'
import { NAYIN_PART3 } from './nayin-part3'
import { NAYIN_PART4 } from './nayin-part4'

export interface NayinEntry { id: string; ganzhi: string; nayin: string; element: string; desc: string }

export const ALL_NAYIN: NayinEntry[] = [...NAYIN_PART1, ...NAYIN_PART2, ...NAYIN_PART3, ...NAYIN_PART4]

export const ELEMENT_COLOR: Record<string, string> = {
  金: 'text-yellow-600 dark:text-yellow-300 bg-yellow-500/10',
  木: 'text-emerald-600 dark:text-emerald-300 bg-emerald-500/10',
  水: 'text-blue-600 dark:text-blue-300 bg-blue-500/10',
  火: 'text-rose-500 dark:text-rose-300 bg-rose-500/10',
  土: 'text-amber-600 dark:text-amber-300 bg-amber-500/10',
}
