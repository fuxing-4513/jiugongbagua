/**
 * ziwei-enrich.ts — 紫微斗数格局增强
 * 
 * 为九宫紫微模块补充更完整的格局判定 + 四化深度分析
 * 与 iztro 库输出配合使用
 */

// ── 格局定义 ──
export interface ZiweiPattern {
  name: string
  rating: '上' | '中上' | '中' | '中下'
  desc: string
  conditions: string[]
}

// ── 扩展格局库（覆盖九宫现有 detectPatterns 之外的） ──
const EXTRA_PATTERNS: ZiweiPattern[] = [
  { name: '極居卯酉格', rating: '中', desc: '貪狼+天同或太陰在卯酉，易有宗教緣分', conditions: ['命宫在卯/酉', '有贪狼'] },
  { name: '雄宿乾元格', rating: '中上', desc: '貪狼在戌宮坐命，歷練後有成就', conditions: ['命宫在戌', '有贪狼'] },
  { name: '月出滄海格', rating: '中上', desc: '太陰在酉宮坐命', conditions: ['命宫在酉'] },
  { name: '日月並明格', rating: '上', desc: '太陽太陰在三方四正，陰陽調和', conditions: ['三方有太阳', '三方有太阴'] },
  { name: '祿馬佩印格', rating: '中上', desc: '祿存+天馬+天相會照，名利雙收', conditions: ['有禄存', '有天马', '有天相'] },
  { name: '科權祿拱格', rating: '上', desc: '化科化權化祿在三方拱照，富貴雙全', conditions: ['有化科', '有化权', '有化禄'] },
  { name: '雙祿交流格', rating: '中上', desc: '祿存+化祿在命遷線或三合會照', conditions: ['有禄存', '有化禄'] },
  { name: '天巫格', rating: '中', desc: '天巫星在命宮，學術研究有成', conditions: ['有天巫在命宫'] },
  { name: '天福格', rating: '中', desc: '天福星在命宮，福壽綿長', conditions: ['有天福在命宫'] },
  { name: '馬頭帶劍格', rating: '中', desc: '天馬遇擎羊或陀羅，奔波勞碌', conditions: ['有天马', '有擎羊/陀罗'] },
  { name: '刑囚夾印格', rating: '中下', desc: '天相被天刑+廉貞夾，官非之兆', conditions: ['有天相', '被天刑夹', '被廉贞夹'] },
  { name: '火貪格', rating: '中上', desc: '火星+貪狼會照，暴發之格局', conditions: ['有火星', '有贪狼'] },
  { name: '鈴貪格', rating: '中上', desc: '鈴星+貪狼會照，橫發之格局', conditions: ['有铃星', '有贪狼'] },
]

export function getExtraPatterns(): ZiweiPattern[] {
  return EXTRA_PATTERNS
}

// ── 四化深度分析 ──
export interface SiHuaAnalysis {
  lu: { star: string; gong: string; meaning: string }   // 化禄
  quan: { star: string; gong: string; meaning: string }  // 化权
  ke: { star: string; gong: string; meaning: string }    // 化科
  ji: { star: string; gong: string; meaning: string }    // 化忌
  summary: string
}

const SI_HUA_MEANING: Record<string, Record<string, string>> = {
  '紫微': { '权':'紫微化权，掌权得势，地位提升' },
  '天机': { '禄':'天机化禄，智慧生财，策划得力', '权':'天机化权，谋略过人有实权', '科':'天机化科，学术研究出成果', '忌':'天机化忌，思虑过多易钻牛角尖' },
  '太阳': { '禄':'太阳化禄，名望提升，积极进取', '权':'太阳化权，事业有成，权威显赫', '忌':'太阳化忌，名望受损，劳心费力' },
  '武曲': { '禄':'武曲化禄，财运亨通，经商大吉', '权':'武曲化权，理财有道掌财权', '科':'武曲化科，专业技能获认可', '忌':'武曲化忌，财运受阻，投资谨慎' },
  '天同': { '权':'天同化权，福气转化为执行力', '科':'天同化科，福泽显扬，得名望', '忌':'天同化忌，精神压力大需调节' },
  '廉贞': { '禄':'廉贞化禄，化邪为正，事业转顺', '权':'廉贞化权，掌权柄能服众', '忌':'廉贞化忌，是非多需谨慎' },
  '天府': { '科':'天府化科，才能受赏，理财有方' },
  '太阴': { '禄':'太阴化禄，财富稳步增长', '权':'太阴化权，幕后掌权有影响力', '科':'太阴化科，清贵之人有艺术缘', '忌':'太阴化忌，感情困扰，财务隐忧' },
  '贪狼': { '禄':'贪狼化禄，才华变现，桃花财运两旺', '权':'贪狼化权，交际手腕强有实权', '忌':'贪狼化忌，情欲困扰需克制' },
  '巨门': { '禄':'巨门化禄，以口为业声名远播', '权':'巨门化权，话语有分量', '科':'巨门化科，学术研究有成', '忌':'巨门化忌，口舌是非倍增' },
  '天相': { '禄':'天相化禄，贵人助力，文书有利', '权':'天相化权，辅佐力量获认可', '科':'天相化科，协调能力出众' },
  '天梁': { '禄':'天梁化禄，福荫加身，逢凶化吉', '科':'天梁化科，名望提升受人尊敬', '忌':'天梁化忌，好心反被误会' },
  '七杀': { '禄':'七杀化禄，变动力化为财富', '权':'七杀化权，将星掌权威势显', '忌':'七杀化忌，变动多端需保守' },
  '破军': { '禄':'破军化禄，破旧立新得财', '权':'破军化权，改革有成有魄力', '忌':'破军化忌，破耗过大需三思' },
}

export function analyzeSiHua(sihuaList: { star: string; hua: string; gong: string }[]): SiHuaAnalysis {
  const result: SiHuaAnalysis = {
    lu: { star: '', gong: '', meaning: '' },
    quan: { star: '', gong: '', meaning: '' },
    ke: { star: '', gong: '', meaning: '' },
    ji: { star: '', gong: '', meaning: '' },
    summary: ''
  }

  const huaMap: Record<string, string[]> = { '禄': [], '权': [], '科': [], '忌': [] }

  for (const item of sihuaList) {
    const meaning = SI_HUA_MEANING[item.star]?.[item.hua] || `${item.star}化${item.hua}`
    const entry = { star: item.star, gong: item.gong, meaning }
    if (item.hua === '禄') result.lu = entry
    else if (item.hua === '权') result.quan = entry
    else if (item.hua === '科') result.ke = entry
    else if (item.hua === '忌') result.ji = entry
    if (huaMap[item.hua]) huaMap[item.hua].push(item.star)
  }

  // 综合判断
  const parts: string[] = []
  if (result.lu.star) parts.push(`祿：${result.lu.star}在${result.lu.gong}`)
  if (result.quan.star) parts.push(`權：${result.quan.star}在${result.quan.gong}`)
  if (result.ke.star) parts.push(`科：${result.ke.star}在${result.ke.gong}`)
  if (result.ji.star) parts.push(`忌：${result.ji.star}在${result.ji.gong}`)

  if (result.lu.star && result.quan.star && result.ke.star) {
    result.summary = '科權祿三奇嘉會，富貴雙全之命'
  } else if (result.lu.star && result.quan.star) {
    result.summary = '祿權交馳，財權兼備'
  } else if (result.lu.star && result.ke.star) {
    result.summary = '祿科雙美，名利雙收'
  } else if (result.ji.star) {
    result.summary = `忌星在${result.ji.gong}，此宮位為此生功課所在`
  }

  if (parts.length > 0) {
    result.summary = (result.summary ? result.summary + '；' : '') + parts.join('；')
  }

  return result
}

// ── 十二宫五行局 → 命格倾向 ──
const WU_XING_JU_MEANING: Record<string, string> = {
  '金四局': '金局堅毅果斷，做事有魄力，宜軍警金融',
  '木三局': '木局仁慈上進，有領導才能，宜文教管理',
  '水二局': '水局聰明靈活，善變通，宜貿易外交',
  '火六局': '火局熱情主動，積極進取，宜科技創業',
  '土五局': '土局穩重篤實，誠信可靠，宜地產農牧',
}

export function getWuXingJuMeaning(ju: string): string {
  return WU_XING_JU_MEANING[ju] || ''
}

// ── 紫微大限分析 ──
export interface DaXianAnalysis {
  current: { startAge: number; endAge: number; gong: string; summary: string }
  future: { startAge: number; endAge: number; gong: string; summary: string }
}

export function analyzeDaXian(daxianList: any[], curAge: number): DaXianAnalysis {
  const current = daxianList.find((dx: any) => curAge >= dx.startAge && curAge <= dx.endAge)
  const future = daxianList.find((dx: any) => dx.startAge > curAge)

  return {
    current: current ? { startAge: current.startAge, endAge: current.endAge, gong: current.gong || '', summary: `當前大限${current.startAge}-${current.endAge}歲${current.gong ? '，在'+current.gong : ''}` } : { startAge: 0, endAge: 0, gong: '', summary: '' },
    future: future ? { startAge: future.startAge, endAge: future.endAge, gong: future.gong || '', summary: `下個大限${future.startAge}-${future.endAge}歲${future.gong ? '，在'+future.gong : ''}` } : { startAge: 0, endAge: 0, gong: '', summary: '' },
  }
}
