// 干支关系数据模型——干支百科扩容（合/冲/刑/害/破/三合三会/十二长生）
export type RelType = 'tian-he' | 'tian-chong' | 'di-he' | 'di-sanhe' | 'di-sanhue' | 'di-chong' | 'di-hai' | 'di-xing' | 'di-po' | 'changsheng' | 'yinyang'

export interface GanzhiRel {
  id: string
  type: RelType
  title: string          // 名称（如"甲己合化土"）
  members: string[]      // 成员（甲/己）
  wuxing?: string        // 合化五行
  tags: string[]         // 标签（如"中正之合"/"夫妻之合"）
  condition: string      // 合化条件/触发机制（命理规则）
  meaning: string        // 意象含义（传统文化/命理象征）
  yinyang?: '阳' | '阴' | '中性'
  jiexi: string          // 命理解析（成/不成局的表现——应用断语）
  example?: string       // 古籍依据/歌诀（真实引用或"传统命理认为"）
  related?: string[]     // 相关（其他关系/干支/术语）
}

export const REL_TYPE_META: Record<RelType, { name: string; emoji: string; desc: string }> = {
  'tian-he': { name: '天干五合', emoji: '🔗', desc: '十天干阴阳相合——甲己合土、乙庚合金、丙辛合水、丁壬合木、戊癸合火——合而不化则生羁绊牵合' },
  'tian-chong': { name: '天干相冲', emoji: '⚡', desc: '同性相克为冲——甲庚、乙辛、丙壬、丁癸四组——天干冲克主对立冲突' },
  'di-he': { name: '地支六合', emoji: '💞', desc: '子丑合土、寅亥合木、卯戌合火、辰酉合金、巳申合水、午未合土——六合主亲密牵合' },
  'di-sanhe': { name: '地支三合局', emoji: '♻️', desc: '申子辰合水、亥卯未合木、寅午戌合火、巳酉丑合金——三合成局力量最大' },
  'di-sanhue': { name: '地支三会方', emoji: '🌊', desc: '寅卯辰会木、巳午未会火、申酉戌会金、亥子丑会水——三会一方之气最纯' },
  'di-chong': { name: '地支六冲', emoji: '💥', desc: '子午冲、丑未冲、寅申冲、卯酉冲、辰戌冲、巳亥冲——对宫相冲主动荡分离' },
  'di-hai': { name: '地支六害', emoji: '⚠️', desc: '子未害、丑午害、寅巳害、卯辰害、申亥害、酉戌害——六害主暗中妨害' },
  'di-xing': { name: '地支三刑', emoji: '⛓️', desc: '寅巳申无恩之刑、丑戌未恃势之刑、子卯无礼之刑——三刑主刑伤' },
  'di-po': { name: '地支六破', emoji: '💔', desc: '子酉破、丑辰破、寅亥破、卯午破、巳申破、未戌破——六破主暗中破损' },
  'changsheng': { name: '十二长生', emoji: '🕰️', desc: '五行在十二地支的旺衰历程——长生沐浴冠带临官帝旺衰病死墓绝胎养' },
  'yinyang': { name: '干支阴阳', emoji: '☯️', desc: '天干地支的阴阳属性划分——阳干阳支与阴干阴支' },
}
