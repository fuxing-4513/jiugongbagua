// 干支关系 barrel——页面按 id/type 查找
import type { GanzhiRel } from './rel-schema'
import { TIAN_HE_RELS, TIAN_CHONG_RELS } from './rel-he'
import { DI_HE_RELS, DI_SANHE_RELS, DI_SANHUI_RELS } from './rel-sanhe'
import { DI_CHONG_RELS, DI_HAI_RELS, DI_XING_RELS, DI_PO_RELS } from './rel-chongxing'
import { CHANGSHENG_RELS } from './rel-changsheng'

export const ALL_RELS: GanzhiRel[] = [
  ...TIAN_HE_RELS, ...TIAN_CHONG_RELS,
  ...DI_HE_RELS, ...DI_SANHE_RELS, ...DI_SANHUI_RELS,
  ...DI_CHONG_RELS, ...DI_HAI_RELS, ...DI_XING_RELS, ...DI_PO_RELS,
  ...CHANGSHENG_RELS,
]

export function getRelById(id: string): GanzhiRel | undefined {
  return ALL_RELS.find(r => r.id === id)
}

export function getRelsByType(type: GanzhiRel['type']): GanzhiRel[] {
  return ALL_RELS.filter(r => r.type === type)
}

export const REL_GROUPS: { type: GanzhiRel['type']; }[] = [
  { type: 'tian-he' }, { type: 'tian-chong' }, { type: 'di-he' }, { type: 'di-sanhe' },
  { type: 'di-sanhue' }, { type: 'di-chong' }, { type: 'di-hai' }, { type: 'di-xing' },
  { type: 'di-po' }, { type: 'changsheng' },
]
