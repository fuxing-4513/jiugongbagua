// 干支深度分析 barrel——页面按 id 查找（十天干 + 十二地支分批建档）
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
import { YIN_DEEP } from './yin'
import { MAO_DEEP } from './mao'
import { WU_ZHI_DEEP } from './wu-zhi'
import { WEI_DEEP } from './wei'
import { ZI_DEEP } from './zi'
import { CHOU_DEEP } from './chou'
import { CHEN_DEEP } from './chen'
import { SI_DEEP } from './si'
import { SHEN_DEEP } from './shen'
import { YOU_DEEP } from './you'
import { XU_DEEP } from './xu'
import { HAI_DEEP } from './hai'

export const TIANGAN_DEEP: GanzhiDeep[] = [JIA_DEEP, YI_DEEP, BING_DEEP, DING_DEEP, WU_DEEP, JI_DEEP, GENG_DEEP, XIN_DEEP, REN_DEEP, GUI_DEEP]

// 十二地支深度分析（全 12 支已建档）
export const DIZHI_DEEP: GanzhiDeep[] = [ZI_DEEP, CHOU_DEEP, YIN_DEEP, MAO_DEEP, CHEN_DEEP, SI_DEEP, WU_ZHI_DEEP, WEI_DEEP, SHEN_DEEP, YOU_DEEP, XU_DEEP, HAI_DEEP]

export function getDeepById(id: string): GanzhiDeep | undefined {
  return TIANGAN_DEEP.find(d => d.id === id) ?? DIZHI_DEEP.find(d => d.id === id)
}
