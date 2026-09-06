// 六十四卦深度分析 barrel（前 32 卦已建档——按 guaNN id 查）
import type { HexagramDeep } from './schema'
import { GUA01_DEEP } from './gua01'
import { GUA02_DEEP } from './gua02'
import { GUA03_DEEP } from './gua03'
import { GUA04_DEEP } from './gua04'
import { GUA05_DEEP } from './gua05'
import { GUA06_DEEP } from './gua06'
import { GUA07_DEEP } from './gua07'
import { GUA08_DEEP } from './gua08'
import { GUA09_DEEP } from './gua09'
import { GUA10_DEEP } from './gua10'
import { GUA11_DEEP } from './gua11'
import { GUA12_DEEP } from './gua12'
import { GUA13_DEEP } from './gua13'
import { GUA14_DEEP } from './gua14'
import { GUA15_DEEP } from './gua15'
import { GUA16_DEEP } from './gua16'
import { GUA17_DEEP } from './gua17'
import { GUA18_DEEP } from './gua18'
import { GUA19_DEEP } from './gua19'
import { GUA20_DEEP } from './gua20'
import { GUA21_DEEP } from './gua21'
import { GUA22_DEEP } from './gua22'
import { GUA23_DEEP } from './gua23'
import { GUA24_DEEP } from './gua24'
import { GUA25_DEEP } from './gua25'
import { GUA26_DEEP } from './gua26'
import { GUA27_DEEP } from './gua27'
import { GUA28_DEEP } from './gua28'
import { GUA29_DEEP } from './gua29'
import { GUA30_DEEP } from './gua30'
import { GUA31_DEEP } from './gua31'
import { GUA32_DEEP } from './gua32'

export const GUA_DEEP_1_32: HexagramDeep[] = [
  GUA01_DEEP, GUA02_DEEP, GUA03_DEEP, GUA04_DEEP, GUA05_DEEP, GUA06_DEEP, GUA07_DEEP, GUA08_DEEP,
  GUA09_DEEP, GUA10_DEEP, GUA11_DEEP, GUA12_DEEP, GUA13_DEEP, GUA14_DEEP, GUA15_DEEP, GUA16_DEEP,
  GUA17_DEEP, GUA18_DEEP, GUA19_DEEP, GUA20_DEEP, GUA21_DEEP, GUA22_DEEP, GUA23_DEEP, GUA24_DEEP,
  GUA25_DEEP, GUA26_DEEP, GUA27_DEEP, GUA28_DEEP, GUA29_DEEP, GUA30_DEEP, GUA31_DEEP, GUA32_DEEP,
]

export function getGuaDeepById(id: string): HexagramDeep | undefined {
  return GUA_DEEP_1_32.find(d => d.id === id)
}
