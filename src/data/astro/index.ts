// 西洋占星深度数据 barrel
import type { ZodiacDeep, PlanetDeep, HouseDeep, AspectDeep } from './schema'
import { ZODIAC_DEEP_1 } from './zodiac-deep-1'
import { ZODIAC_DEEP_2 } from './zodiac-deep-2'
import { ZODIAC_DEEP_3 } from './zodiac-deep-3'
import { PLANET_DEEP } from './planet-deep'
import { HOUSE_DEEP } from './house-deep'
import { ASPECT_DEEP } from './aspect-deep'

export const ZODIAC_DEEP: ZodiacDeep[] = [...ZODIAC_DEEP_1, ...ZODIAC_DEEP_2, ...ZODIAC_DEEP_3]
export { PLANET_DEEP, HOUSE_DEEP, ASPECT_DEEP }
export type { ZodiacDeep, PlanetDeep, HouseDeep, AspectDeep }

export function getZodiacDeep(id: string): ZodiacDeep | undefined {
  return ZODIAC_DEEP.find(z => z.id === id)
}
