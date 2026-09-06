// 西洋占星深度数据 schema（占星学核心体系——护城河深度）
export interface ZodiacDeep {
  id: string          // aries...
  name: string        // 白羊座
  en: string          // Aries
  date: string        // 3.21-4.19
  element: '火' | '土' | '风' | '水'
  mode: '基本' | '固定' | '变动'
  ruler: string       // 守护星（白羊=火星）
  symbol: string      // 符号意象（公羊——主动出击）
  core: string[]      // 性格核心深度（2-3 段——本质自我/优势/阴影——400+ 字合计）
  love: string[]      // 爱情与关系（1-2 段）
  career: string[]    // 事业与天赋（1-2 段）
  growth: string[]    // 成长课题（1 段——阴影转化/人生功课）
  myth: string        // 神话原型与占星学意义（守护星神话/符号来源——占星"核心科学"层）
}

export interface PlanetDeep {
  id: string          // sun/moon/mercury...
  name: string        // 太阳
  en: string          // Sun
  domain: string      // 主管领域（自我/人格核心）
  meaning: string[]   // 核心含义深度（2 段）
  dignity: string     // 庙旺陷落（太阳庙狮子/旺白羊/陷水瓶/弱天秤）
  myth: string        // 神话原型
}

export interface HouseDeep {
  n: number
  name: string        // 命宫/财帛宫...
  domain: string      // 人生领域
  meaning: string     // 含义
}

export interface AspectDeep {
  id: string          // conjunction...
  name: string        // 合相
  deg: string         // 0°
  meaning: string     // 含义（吉凶/心理动力）
}
