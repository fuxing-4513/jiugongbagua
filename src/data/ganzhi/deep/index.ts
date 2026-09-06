// 十天干深度分析 barrel——页面按 id 查找
import type { GanzhiDeep } from './schema'
import { JIA_DEEP } from './jia'
import { YI_DEEP } from './yi'
import { BING_DEEP } from './bing'
import { DING_DEEP } from './ding'
import { WU_DEEP } from './wu'
import { JI_DEEP } from './ji'
import { GENG_DEEP } from './geng'
import { XIN_DEEP } from './xin'
import { REN_DEEP } from './ren'
import { GUI_DEEP } from './gui'

export const TIANGAN_DEEP: GanzhiDeep[] = [JIA_DEEP, YI_DEEP, BING_DEEP, DING_DEEP, WU_DEEP, JI_DEEP, GENG_DEEP, XIN_DEEP, REN_DEEP, GUI_DEEP]

export function getDeepById(id: string): GanzhiDeep | undefined {
  return TIANGAN_DEEP.find(d => d.id === id)
}
