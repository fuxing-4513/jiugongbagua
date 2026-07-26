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

/** 四化含义翻译（英/日/韩） */
const SI_HUA_MEANING_EN: Record<string, Record<string, string>> = {
  '紫微': { '权':'Zi Wei Hua Quan — gains power and status' },
  '天机': { '禄':'Tian Ji Hua Lu — wisdom generates wealth', '权':'Tian Ji Hua Quan — strategic power', '科':'Tian Ji Hua Ke — academic achievement', '忌':'Tian Ji Hua Ji — overthinking, anxiety' },
  '太阳': { '禄':'Tai Yang Hua Lu — fame rises', '权':'Tai Yang Hua Quan — career authority', '忌':'Tai Yang Hua Ji — reputation damage' },
  '武曲': { '禄':'Wu Qu Hua Lu — prosperous wealth', '权':'Wu Qu Hua Quan — financial power', '科':'Wu Qu Hua Ke — professional recognition', '忌':'Wu Qu Hua Ji — financial setbacks' },
  '天同': { '权':'Tian Tong Hua Quan — blessing transforms to action', '科':'Tian Tong Hua Ke — fame through blessings', '忌':'Tian Tong Hua Ji — mental stress' },
  '廉贞': { '禄':'Lian Zhen Hua Lu — evil turns to good', '权':'Lian Zhen Hua Quan — wields power', '忌':'Lian Zhen Hua Ji — disputes and caution' },
  '天府': { '科':'Tian Fu Hua Ke — talent rewarded' },
  '太阴': { '禄':'Tai Yin Hua Lu — steady wealth growth', '权':'Tai Yin Hua Quan — behind-the-scenes influence', '科':'Tai Yin Hua Ke — refined, artistic', '忌':'Tai Yin Hua Ji — emotional troubles' },
  '贪狼': { '禄':'Tan Lang Hua Lu — talent monetized, wealth+romance', '权':'Tan Lang Hua Quan — social power', '忌':'Tan Lang Hua Ji — desire conflicts' },
  '巨门': { '禄':'Ju Men Hua Lu — eloquence brings fame', '权':'Ju Men Hua Quan — words carry weight', '科':'Ju Men Hua Ke — academic success', '忌':'Ju Men Hua Ji — gossip multiplies' },
  '天相': { '禄':'Tian Xiang Hua Lu — benefactor help', '权':'Tian Xiang Hua Quan — assistance recognized', '科':'Tian Xiang Hua Ke — coordination skills' },
  '天梁': { '禄':'Tian Liang Hua Lu — blessings, misfortune turns', '科':'Tian Liang Hua Ke — reputation rises', '忌':'Tian Liang Hua Ji — good intentions misunderstood' },
  '七杀': { '禄':'Qi Sha Hua Lu — change brings wealth', '权':'Qi Sha Hua Quan — general gains power', '忌':'Qi Sha Hua Ji — excessive change, stay conservative' },
  '破军': { '禄':'Po Jun Hua Lu — break old, gain new wealth', '权':'Po Jun Hua Quan — reform success', '忌':'Po Jun Hua Ji — excessive loss, think twice' },
}

const SI_HUA_MEANING_JA: Record<string, Record<string, string>> = {
  '紫微': { '权':'紫微化権 — 権勢を得て地位向上' },
  '天机': { '禄':'天機化禄 — 知恵が財を生む', '权':'天機化権 — 戦略的に実権を得る', '科':'天機化科 — 学術研究で成果', '忌':'天機化忌 — 考えすぎて袋小路' },
  '太阳': { '禄':'太陽化禄 — 名声向上', '权':'太陽化権 — 事業成功、権威顕著', '忌':'太陽化忌 — 名声低下、心労' },
  '武曲': { '禄':'武曲化禄 — 財運隆盛、商売大吉', '权':'武曲化権 — 財権を掌握', '科':'武曲化科 — 専門技能が認められる', '忌':'武曲化忌 — 財運停滞、投資慎重' },
  '天同': { '权':'天同化権 — 福運が行動力に', '科':'天同化科 — 福運顕著、名声', '忌':'天同化忌 — 精神的プレッシャー' },
  '廉贞': { '禄':'廉貞化禄 — 邪気が正に転じる', '权':'廉貞化権 — 権柄を握る', '忌':'廉貞化忌 — トラブル多発' },
  '天府': { '科':'天府化科 — 才能が評価される' },
  '太阴': { '禄':'太陰化禄 — 財産が着実に増加', '权':'太陰化権 — 陰の実力者', '科':'太陰化科 — 清らかで芸術的', '忌':'太陰化忌 — 感情のもつれ' },
  '贪狼': { '禄':'貪狼化禄 — 才覚が収入に', '权':'貪狼化権 — 社交力で実権', '忌':'貪狼化忌 — 欲情の悩み' },
  '巨门': { '禄':'巨門化禄 — 弁舌で名声', '权':'巨門化権 — 言葉に重み', '科':'巨門化科 — 学術研究で成果', '忌':'巨門化忌 — 口舌倍増' },
  '天相': { '禄':'天相化禄 — 貴人助力', '权':'天相化権 — 補佐力が評価', '科':'天相化科 — 調整能力秀逸' },
  '天梁': { '禄':'天梁化禄 — 福運、凶転吉', '科':'天梁化科 — 名声向上', '忌':'天梁化忌 — 善意が誤解される' },
  '七杀': { '禄':'七殺化禄 — 変動が財に', '权':'七殺化権 — 将星、威勢顕著', '忌':'七殺化忌 — 変動多し、保守的に' },
  '破军': { '禄':'破軍化禄 — 破旧立新で財', '权':'破軍化権 — 改革成功', '忌':'破軍化忌 — 破耗過大' },
}

const SI_HUA_MEANING_KO: Record<string, Record<string, string>> = {
  '紫微': { '权':'자미화권 — 권세를 얻고 지위 상승' },
  '天机': { '禄':'천기화록 — 지혜가 재물을 낳음', '权':'천기화권 — 전략적으로 실권 획득', '科':'천기화과 — 학술 연구 성과', '忌':'천기화기 — 생각이 많아짐' },
  '太阳': { '禄':'태양화록 — 명성 상승', '权':'태양화권 — 사업 성공', '忌':'태양화기 — 명성 손상' },
  '武曲': { '禄':'무곡화록 — 재운 번창', '权':'무곡화권 — 재정 권력', '科':'무곡화과 — 전문 기술 인정', '忌':'무곡화기 — 재정적 손실' },
  '天同': { '权':'천동화권 — 복이 행동력으로', '科':'천동화과 — 복이 드러나 명성', '忌':'천동화기 — 정신적 스트레스' },
  '廉贞': { '禄':'렴정화록 — 사악이 선으로', '权':'렴정화권 — 권력 장악', '忌':'렴정화기 — 분쟁 조심' },
  '天府': { '科':'천부화과 — 재능 인정' },
  '太阴': { '禄':'태음화록 — 재산 꾸준히 증가', '权':'태음화권 — 배후 실력자', '科':'태음화과 — 청아하고 예술적', '忌':'태음화기 — 감정 문제' },
  '贪狼': { '禄':'탐랑화록 — 재능이 수입으로', '权':'탐랑화권 — 사교적 실권', '忌':'탐랑화기 — 욕망 갈등' },
  '巨门': { '禄':'거문화록 — 언변으로 명성', '权':'거문화권 — 말에 무게', '科':'거문화과 — 학문 성취', '忌':'거문화기 — 구설 배가' },
  '天相': { '禄':'천상화록 — 귀인 도움', '权':'천상화권 — 보좌 능력 인정', '科':'천상화과 — 조정 능력 탁월' },
  '天梁': { '禄':'천량화록 — 복운, 흉이 길로', '科':'천량화과 — 명성 상승', '忌':'천량화기 — 선의가 오해받음' },
  '七杀': { '禄':'칠살화록 — 변화가 재물로', '权':'칠살화권 — 장군 위세', '忌':'칠살화기 — 변화 과다, 보수적으로' },
  '破军': { '禄':'파군화록 — 구질서 파괴하고 재물', '权':'파군화권 — 개혁 성공', '忌':'파군화기 — 손실 과다' },
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

function getSiHuaMeaning(star: string, hua: string, lang?: string): string {
  const l = lang || 'zh-CN'
  if (l === 'en') return SI_HUA_MEANING_EN[star]?.[hua] || `${star} Hua ${hua}`
  if (l === 'ja') return SI_HUA_MEANING_JA[star]?.[hua] || `${star}化${hua}`
  if (l === 'ko') return SI_HUA_MEANING_KO[star]?.[hua] || `${star}화${hua}`
  return SI_HUA_MEANING[star]?.[hua] || `${star}化${hua}`
}

export function analyzeSiHua(sihuaList: { star: string; hua: string; gong: string }[], lang?: string): SiHuaAnalysis {
  const result: SiHuaAnalysis = {
    lu: { star: '', gong: '', meaning: '' },
    quan: { star: '', gong: '', meaning: '' },
    ke: { star: '', gong: '', meaning: '' },
    ji: { star: '', gong: '', meaning: '' },
    summary: ''
  }

  const huaMap: Record<string, string[]> = { '禄': [], '权': [], '科': [], '忌': [] }

  for (const item of sihuaList) {
    const meaning = getSiHuaMeaning(item.star, item.hua, lang)
    const entry = { star: item.star, gong: item.gong, meaning }
    if (item.hua === '禄') result.lu = entry
    else if (item.hua === '权') result.quan = entry
    else if (item.hua === '科') result.ke = entry
    else if (item.hua === '忌') result.ji = entry
    if (huaMap[item.hua]) huaMap[item.hua].push(item.star)
  }

  // 综合判断（多语言）
  const isCN = !lang || lang === 'zh-CN' || lang === 'zh-TW'
  const parts: string[] = []
  if (result.lu.star) {
    parts.push(isCN ? `祿：${result.lu.star}在${result.lu.gong}` : lang === 'en' ? `Lu: ${result.lu.star} at ${result.lu.gong}` : lang === 'ja' ? `禄：${result.lu.star}（${result.lu.gong}）` : `록：${result.lu.star}（${result.lu.gong}）`)
  }
  if (result.quan.star) {
    parts.push(isCN ? `權：${result.quan.star}在${result.quan.gong}` : lang === 'en' ? `Quan: ${result.quan.star} at ${result.quan.gong}` : lang === 'ja' ? `権：${result.quan.star}（${result.quan.gong}）` : `권：${result.quan.star}（${result.quan.gong}）`)
  }
  if (result.ke.star) {
    parts.push(isCN ? `科：${result.ke.star}在${result.ke.gong}` : lang === 'en' ? `Ke: ${result.ke.star} at ${result.ke.gong}` : lang === 'ja' ? `科：${result.ke.star}（${result.ke.gong}）` : `과：${result.ke.star}（${result.ke.gong}）`)
  }
  if (result.ji.star) {
    parts.push(isCN ? `忌：${result.ji.star}在${result.ji.gong}` : lang === 'en' ? `Ji: ${result.ji.star} at ${result.ji.gong}` : lang === 'ja' ? `忌：${result.ji.star}（${result.ji.gong}）` : `기：${result.ji.star}（${result.ji.gong}）`)
  }

  const smap: Record<string, Record<string, string>> = {
    'zh-CN': { 'lu-quan-ke':'科權祿三奇嘉會，富貴雙全之命', 'lu-quan':'祿權交馳，財權兼備', 'lu-ke':'祿科雙美，名利雙收', 'ji-only':`忌星在${result.ji.gong}，此宮位為此生功課所在` },
    'zh-TW': { 'lu-quan-ke':'科權祿三奇嘉會，富貴雙全之命', 'lu-quan':'祿權交馳，財權兼備', 'lu-ke':'祿科雙美，名利雙收', 'ji-only':`忌星在${result.ji.gong}，此宮位為此生功課所在` },
    'en': { 'lu-quan-ke':'Ke-Quan-Lu Triple Auspicious Meeting — wealth and honor', 'lu-quan':'Lu and Quan combined — wealth and power', 'lu-ke':'Lu and Ke combined — fame and profit', 'ji-only':`Ji star at ${result.ji.gong} — this palace is your life lesson` },
    'ja': { 'lu-quan-ke':'科権禄三奇嘉会 — 富貴双全の命', 'lu-quan':'禄権交馳 — 財権兼備', 'lu-ke':'禄科双美 — 名利双収', 'ji-only':`忌星が${result.ji.gong}に — この宮位が人生の課題` },
    'ko': { 'lu-quan-ke':'과권록 삼기 가회 — 부귀쌍전', 'lu-quan':'록권 교치 — 재권 겸비', 'lu-ke':'록과 쌍미 — 명리 쌍수', 'ji-only':`기성이 ${result.ji.gong}에 — 이 궁위가 인생의 과제` },
  }
  const l = (lang || 'zh-CN') as keyof typeof smap
  const s = smap[l] || smap['zh-CN']

  if (result.lu.star && result.quan.star && result.ke.star) {
    result.summary = s['lu-quan-ke']
  } else if (result.lu.star && result.quan.star) {
    result.summary = s['lu-quan']
  } else if (result.lu.star && result.ke.star) {
    result.summary = s['lu-ke']
  } else if (result.ji.star) {
    result.summary = s['ji-only']
  }

  if (parts.length > 0) {
    result.summary = (result.summary ? result.summary + (isCN ? '；' : '; ') : '') + parts.join(isCN ? '；' : '; ')
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

const WX_JU_MEANING_EN: Record<string, string> = {
  '金四局': 'Metal Bureau — resolute, decisive, suited for military/police/finance',
  '木三局': 'Wood Bureau — benevolent, ambitious, suited for education/management',
  '水二局': 'Water Bureau — intelligent, adaptable, suited for trade/diplomacy',
  '火六局': 'Fire Bureau — passionate, proactive, suited for tech/entrepreneurship',
  '土五局': 'Earth Bureau — steady, reliable, suited for real estate/agriculture',
}

const WX_JU_MEANING_JA: Record<string, string> = {
  '金四局': '金局 — 堅毅果断、軍警・金融に適す',
  '木三局': '木局 — 仁慈向上、教育・管理に適す',
  '水二局': '水局 — 聰明柔軟、貿易・外交に適す',
  '火六局': '火局 — 情熱積極、科技・起業に適す',
  '土五局': '土局 — 穩重篤実、不動産・農牧に適す',
}

const WX_JU_MEANING_KO: Record<string, string> = {
  '金四局': '금국 — 강인하고 결단력 있음, 군경·금융 적합',
  '木三局': '목국 — 인자하고 진취적, 교육·관리 적합',
  '水二局': '수국 — 총명하고 융통성 있음, 무역·외교 적합',
  '火六局': '화국 — 열정적이고 적극적, 기술·창업 적합',
  '土五局': '토국 — 안정적이고 성실, 부동산·농목 적합',
}

export function getWuXingJuMeaning(ju: string, lang?: string): string {
  if (!lang || lang === 'zh-CN' || lang === 'zh-TW') return WU_XING_JU_MEANING[ju] || ''
  if (lang === 'en') return WX_JU_MEANING_EN[ju] || ''
  if (lang === 'ja') return WX_JU_MEANING_JA[ju] || ''
  if (lang === 'ko') return WX_JU_MEANING_KO[ju] || ''
  return WU_XING_JU_MEANING[ju] || ''
}

// ── 紫微大限分析 ──
export interface DaXianAnalysis {
  current: { startAge: number; endAge: number; gong: string; summary: string }
  future: { startAge: number; endAge: number; gong: string; summary: string }
}

export function analyzeDaXian(daxianList: any[], curAge: number, lang?: string): DaXianAnalysis {
  const current = daxianList.find((dx: any) => curAge >= dx.startAge && curAge <= dx.endAge)
  const future = daxianList.find((dx: any) => dx.startAge > curAge)

  const isCN = !lang || lang === 'zh-CN' || lang === 'zh-TW'

  function formatSummary(label: string, start: number, end: number, gong: string): string {
    if (isCN) return `當前大限${start}-${end}歲${gong ? '，在'+gong : ''}`
    if (lang === 'en') return `Current decade ${start}-${end} years old${gong ? ', at '+gong : ''}`
    if (lang === 'ja') return `現在の大限${start}-${end}歳${gong ? '、'+gong : ''}`
    if (lang === 'ko') return `현재 대운 ${start}-${end}세${gong ? ', '+gong : ''}`
    return `當前大限${start}-${end}歲${gong ? '，在'+gong : ''}`
  }
  function formatFuture(label: string, start: number, end: number, gong: string): string {
    if (isCN) return `下個大限${start}-${end}歲${gong ? '，在'+gong : ''}`
    if (lang === 'en') return `Next decade ${start}-${end} years old${gong ? ', at '+gong : ''}`
    if (lang === 'ja') return `次の大限${start}-${end}歳${gong ? '、'+gong : ''}`
    if (lang === 'ko') return `다음 대운 ${start}-${end}세${gong ? ', '+gong : ''}`
    return `下個大限${start}-${end}歲${gong ? '，在'+gong : ''}`
  }

  return {
    current: current ? { startAge: current.startAge, endAge: current.endAge, gong: current.gong || '', summary: formatSummary('當前', current.startAge, current.endAge, current.gong || '') } : { startAge: 0, endAge: 0, gong: '', summary: '' },
    future: future ? { startAge: future.startAge, endAge: future.endAge, gong: future.gong || '', summary: formatFuture('下個', future.startAge, future.endAge, future.gong || '') } : { startAge: 0, endAge: 0, gong: '', summary: '' },
  }
}
