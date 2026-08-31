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

// ═══════════ 四化深度（2026-08-31 新增） ═══════════
// 干系四化表（生年四化与宫干飞化共用）
export const GAN_SIHUA: Record<string, { lu: string; quan: string; ke: string; ji: string }> = {
  甲: { lu: '廉贞', quan: '破军', ke: '武曲', ji: '太阳' },
  乙: { lu: '天机', quan: '天梁', ke: '紫微', ji: '太阴' },
  丙: { lu: '天同', quan: '天机', ke: '文昌', ji: '廉贞' },
  丁: { lu: '太阴', quan: '天同', ke: '天机', ji: '巨门' },
  戊: { lu: '贪狼', quan: '太阴', ke: '右弼', ji: '天机' },
  己: { lu: '武曲', quan: '贪狼', ke: '天梁', ji: '文曲' },
  庚: { lu: '太阳', quan: '武曲', ke: '太阴', ji: '天同' },
  辛: { lu: '巨门', quan: '太阳', ke: '文曲', ji: '文昌' },
  壬: { lu: '天梁', quan: '紫微', ke: '左辅', ji: '武曲' },
  癸: { lu: '破军', quan: '巨门', ke: '太阴', ji: '贪狼' },
}

// 四化本质含义
export const HUA_MEANING: Record<string, string> = {
  禄: '化禄：财源、机遇与福气，主顺遂得利',
  权: '化权：掌控、地位与魄力，主掌权得势',
  科: '化科：名声、化解与贵人，主声名清贵',
  忌: '化忌：欠缺、执念与功课，主此宫为人生课题',
}

// 十二宫四化落宫含义（宫位 × 四化）
export const PALACE_HUA_MEANING: Record<string, Record<string, string>> = {
  命宫: { 禄: '一生际遇顺遂，多得众人助力，性格乐观进取', 权: '自我掌控欲强，有领袖气质，不甘人下', 科: '名声清贵，举止得体，多得贵人提携', 忌: '自我要求苛刻，易钻牛角尖，需学会放过自己' },
  兄弟: { 禄: '手足相助，兄弟缘分深厚，合作得力', 权: '兄弟中有掌权能人，可借力', 科: '手足名声佳，家风和睦', 忌: '兄弟缘薄，易生计较，宜各自安好' },
  夫妻: { 禄: '配偶带财，感情融洽，婚姻助力大', 权: '配偶强势能干，家中掌权', 科: '婚姻名声好，配偶得体大方', 忌: '感情执念深，易生口角，需多包容沟通' },
  子女: { 禄: '子女缘佳，聪慧有福，晚年有靠', 权: '子女有出息，能独当一面', 科: '子女名声好，教育有成', 忌: '为子女操心劳神，教育宜松紧有度' },
  财帛: { 禄: '财源广进，正财顺遂，赚钱机会多', 权: '理财有魄力，能掌财权，投资有决断', 科: '理财名声好，财路清白，稳中求进', 忌: '钱财易耗，宜守不宜攻，谨防冲动消费' },
  疾厄: { 禄: '健康顺遂，少病少痛，恢复力强', 权: '体质强健，精力充沛', 科: '有病易愈，常遇良医，注重养生', 忌: '健康易出问题，需定期检查，劳逸结合' },
  迁移: { 禄: '出外发展得利，贵人远来，异乡有成就', 权: '出外掌权，走动有成，见多识广', 科: '外出名声佳，交游广阔', 忌: '远行多阻，宜安土重迁，出行注意安全' },
  仆役: { 禄: '朋友得力，人脉生财，团队合作顺', 权: '朋友中有领导人物，能借势而上', 科: '广结善缘，口碑好，以诚待人', 忌: '因友损财，慎防小人，交友宜慎' },
  官禄: { 禄: '事业顺遂，升迁有望，工作得心应手', 权: '事业掌权，位高权重，管理能力强', 科: '事业名声佳，考试升迁多利', 忌: '事业多阻，压力较大，宜稳扎稳打' },
  田宅: { 禄: '置业运佳，家宅兴旺，不动产运好', 权: '房产有掌控力，家中有话语权', 科: '家宅名声好，居家清雅', 忌: '家宅不宁，慎防搬迁损耗，注意家居安全' },
  福德: { 禄: '精神富足，享福之命，内心安乐', 权: '内心强大，有主见，福由自造', 科: '心境平和，德望高，受人敬重', 忌: '内心焦虑，易多思虑，宜培养兴趣爱好' },
  父母: { 禄: '父母助力，家境不错，长辈缘好', 权: '父母能干强势，家教严格', 科: '父母名声好，书香门第', 忌: '父母缘分淡，或为其操心，宜多尽孝' },
}

export interface SihuaDeepEntry {
  star: string
  hua: '禄' | '权' | '科' | '忌'
  palace: string
  meaning: string
}

interface PalaceLike {
  name: string
  heavenlyStem?: string
  earthlyBranch?: string
  majorStars?: { name: string; mutagen?: string }[]
  minorStars?: { name: string; mutagen?: string }[]
  adjectiveStars?: { name: string; mutagen?: string }[]
}

export interface SihuaDeepResult {
  born: SihuaDeepEntry[]
  byPalace: { palace: string; branch: string; items: SihuaDeepEntry[] }[]
  flying: {
    palace: string
    branch: string
    stem: string
    items: { hua: '禄' | '权' | '科' | '忌'; star: string; dest: string }[]
    isSoul: boolean
    isBody: boolean
  }[]
  summary: string
}

export function getSihuaDeep(palaces: PalaceLike[], opts?: { soulBranch?: string; bodyBranch?: string }): SihuaDeepResult {
  const allStars: { star: string; mutagen: string; palace: string }[] = []
  for (const p of palaces) {
    for (const arr of [p.majorStars, p.minorStars, p.adjectiveStars]) {
      for (const s of arr || []) {
        if (s.mutagen && (s.mutagen === '禄' || s.mutagen === '权' || s.mutagen === '科' || s.mutagen === '忌')) {
          allStars.push({ star: s.name, mutagen: s.mutagen, palace: p.name })
        }
      }
    }
  }

  const born: SihuaDeepEntry[] = allStars.map(x => ({
    star: x.star, hua: x.mutagen as SihuaDeepEntry['hua'], palace: x.palace,
    meaning: sihuaFullMeaning(x.star, x.mutagen, x.palace),
  }))

  const byPalace = palaces
    .filter(p => allStars.some(x => x.palace === p.name))
    .map(p => ({
      palace: p.name,
      branch: p.earthlyBranch || '',
      items: allStars.filter(x => x.palace === p.name).map(x => ({
        star: x.star, hua: x.mutagen as SihuaDeepEntry['hua'], palace: x.palace,
        meaning: sihuaFullMeaning(x.star, x.mutagen, x.palace),
      })),
    }))

  // 宫干飞化：以每宫天干起四化，化星飞入其所在宫位
  const starPalaceMap: Record<string, string> = {}
  for (const p of palaces) {
    for (const arr of [p.majorStars, p.minorStars, p.adjectiveStars]) {
      for (const s of arr || []) starPalaceMap[s.name] = p.name
    }
  }
  const flying = palaces.map(p => {
    const stem = p.heavenlyStem || ''
    const t = GAN_SIHUA[stem]
    const items = (t ? [['禄', t.lu], ['权', t.quan], ['科', t.ke], ['忌', t.ji]] as const : [])
      .map(([hua, star]) => ({ hua, star, dest: starPalaceMap[star] || '—' }))
    return {
      palace: p.name,
      branch: p.earthlyBranch || '',
      stem,
      items,
      isSoul: opts?.soulBranch === p.earthlyBranch,
      isBody: opts?.bodyBranch === p.earthlyBranch,
    }
  })

  const parts: string[] = []
  const lu = born.find(b => b.hua === '禄'), quan = born.find(b => b.hua === '权'), ke = born.find(b => b.hua === '科'), ji = born.find(b => b.hua === '忌')
  if (lu) parts.push(`化禄${lu.star}入${lu.palace}`)
  if (quan) parts.push(`化权${quan.star}入${quan.palace}`)
  if (ke) parts.push(`化科${ke.star}入${ke.palace}`)
  if (ji) parts.push(`化忌${ji.star}入${ji.palace}`)
  let summary = ''
  if (lu && quan && ke) summary = '禄权科三奇嘉会，富贵双全之命'
  else if (lu && quan) summary = '禄权交驰，财权兼备'
  else if (lu && ke) summary = '禄科双美，名利双收'
  if (ji) summary = (summary ? summary + '；' : '') + `化忌在${ji.palace}宫，此宫即此生功课所在`
  if (parts.length) summary = (summary ? summary + '。' : '') + '生年四化：' + parts.join('；')

  return { born, byPalace, flying, summary }
}

function sihuaFullMeaning(star: string, hua: string, palace: string): string {
  const starM = SI_HUA_MEANING[star]?.[hua] || `${star}化${hua}`
  const palM = PALACE_HUA_MEANING[palace]?.[hua] || ''
  return `${starM}。落${palace}宫：${palM}`
}
