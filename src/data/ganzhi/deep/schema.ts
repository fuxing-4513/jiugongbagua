// 干支深度分析 schema——每个天干/地支一个文件（ganzhi-deep/{id}.ts）
export interface GanzhiDeep {
  id: string
  guge: { title: string; text: string }[]        // 歌诀/经句（真实引用——注明出处或"传统命理认为"）
  jichu: { label: string; value: string }[]       // 基础定位（阴阳/本象/方位/季节/五常/人体等）
  xingge: { ji: string[]; xiong: string[] }       // 性格两面（得用/无制）
  xiji: string[]                                  // 核心喜忌（穷通宝鉴纲领分条——五行生克喜忌+要点）
  koujue?: string                                 // 关键口诀
  duibi: { title: string; desc: string; items: { a: string; b: string; label: string }[] } | null  // 对比（天干 vs 同五行阴干 / 地支 vs 同五行）
  hechong: { title: string; text: string }[]      // 合/冲/刑/害 详解（天干：五合+克冲；地支：六合三合三会六冲三刑六害）
  sishi: { season: string; text: string }[]       // 四时喜忌（春/夏/秋/冬）
  wanxiang: {                                      // 万物类象（8 域）
    benyi: string                                  // 核心本义
    tianshi: string[]                              // 天时天象
    dili: string[]                                 // 地理方位场所
    renwu: string[]                                // 人物职业/六亲/外形/性情
    shenti: string[]                               // 身体脏腑/形体/病症
    qiwu: string[]                                 // 器物静物
    dongwu: string[]                               // 动物
    zhiwu: string[]                                // 植物
    shiwu: string[]                                // 事务/抽象/数字颜色神煞
  }
  xinfa: string[]                                  // 取象心法（实战要点）
  yinyang: '阳' | '阴'
  wuxing: string
}
