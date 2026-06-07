// ziwei-data.ts — Shared Ziwei constants, star descriptions, and pattern detection
// Shared between standalone ZiweiClient and AI排盘 AppClient

export const BRIGHTNESS: Record<string, { label: string; color: string; level: number }> = {
  '庙': { label: '廟', color: 'text-green-400', level: 5 },
  '旺': { label: '旺', color: 'text-green-300', level: 4 },
  '得': { label: '得', color: 'text-blue-300',  level: 3 },
  '利': { label: '利', color: 'text-cyan-300',  level: 2 },
  '平': { label: '平', color: 'text-yellow-400', level: 1 },
  '不': { label: '不', color: 'text-orange-400', level: -1 },
  '陷': { label: '陷', color: 'text-red-400',   level: -2 },
  '':   { label: '—',  color: 'text-gray-400',  level: 0 },
}

export const STAR_DESC: Record<string, string> = {
  '紫微':'紫微於命宮：紫微星坐命，具帝王氣質，有領導才能，為人尊貴，處事公正。個性剛毅果斷，有威嚴，能為眾人所信服。一生衣食無憂，事業有成，受人敬重。但易有孤高之性，需注意人際關係。紫微帝星，喜得左輔、右弼拱照，謂之「君臣慶會」，格局更高。',
  '天府':'天府於命宮：天府為南斗主星，庫藏之星。為人穩重踏實，善於理財，一生財庫豐盈。個性溫和寬厚，待人誠懇，善於管理調度。天府坐命者，宜從事金融、地產、庫管等行業。女命天府坐命，端莊賢淑，旺夫益子。',
  '太阳':'太陽於命宮：太陽星坐命，為人光明磊落，熱情大方，性格外向開朗。日生人太陽得力，主名聲顯赫，事業輝煌。個性急躁，好打抱不平。太陽為官祿之主，適合公職、外交、公益事業。夜生人太陽無光，則力量減弱。',
  '太阴':'太陰於命宮：太陰星坐命，溫文儒雅，性格內向溫柔，心思細膩。擅理財，宜從事文職、藝術、美容行業。太陰為田宅主，重視家庭生活。夜生人太陰得力，更加富貴。其人外表秀麗，有潔癖傾向，一生福澤深厚。',
  '天同':'天同於命宮：天同星坐命，性情溫和，為人懶散隨和，知足常樂。有孩童之心，愛好享受，一生少有大波折。待人親切，人緣很好。但天同化忌時，反主內心孤獨、健康欠佳。宜從事服務業、文化娛樂等行業。',
  '天相':'天相於命宮：天相星坐命，為人正直，性格穩重，善於輔助他人。天相為印綬之星，主官非化解、文書吉祥。個性溫和善良，有正義感，善於溝通協調。宜從事行政管理、人事秘書等工作。天相逢煞星，則易受拖累。',
  '天梁':'天梁於命宮：天梁星坐命，為人老成持重，有老人緣，性格慈善。主壽元綿長，一生多遇貴人。喜助人為樂，但易受他人拖累。天梁為監察之星，適合醫藥、法律、公益、宗教行業。早年較辛勞，晚年安享清福。',
  '天机':'天機於命宮：天機星坐命，智慧過人，思維敏捷，口才出眾。擅長策劃謀略，應變能力強。但個性多變，心神不定，易有神經衰弱傾向。宜從事策劃、諮詢、外交、電腦行業。天機為兄弟主，手足緣分較好。',
  '武曲':'武曲於命宮：武曲星坐命，為人剛毅果決，做事果斷，重義氣。武曲為財帛之主，善於理財，宜從事金融、貿易、軍事、工業等行業。個性孤克，不善交際，晚婚或婚姻多有波折。武曲化祿則富貴雙全，化忌則財來財去。',
  '廉贞':'廉貞於命宮：廉貞星坐命，為人剛強，個性固執，有時略帶邪氣。才華出眾，擅長各種技藝。廉貞為次桃花星，情感豐富。命宮廉貞者，宜從事法律、政治、科技等行業。廉貞化忌於命，主官非訴訟、血光之災，需格外謹慎。',
  '贪狼':'貪狼於命宮：貪狼星坐命，為人多才多藝，擅長交際應酬，桃花運旺盛。貪狼為桃花之首，性格豪爽大方，但易沉溺於酒色。才華橫溢，宜從事演藝、公關、娛樂、廣告行業。貪狼化祿則富貴可期，化忌則情慾糾葛。',
  '巨门':'巨門於命宮：巨門星坐命，口才犀利，心思深沉，擅長分析研究。為人固執，好爭辯，易招口舌是非。巨門為暗曜，一生中需防小人中傷、是非纏身。宜從事法律、教育、媒體、傳播行業。巨門化祿則以口為業發達，化忌則口舌不斷。',
  '七杀':'七殺於命宮：七殺星坐命，具有將相性格，可獨力處理外務，也具經營者的行政能力。精明果決，冷酷不苟言笑，個性剛強率直，不怒而威，能為眾人所信服。七殺情緒不穩定，有衝動潛能，一生大變化的機率很高。利軍警武職。喜軍警、工程界。',
  '破军':'破軍於命宮：破軍星坐命，性格剛烈，有開創精神，喜破壞重建。變動不斷，一生多有波折起伏。破軍為先鋒，有冒險精神，宜開創新事業。個性急躁，做事衝動，需注意因衝動造成的損失。宜從事開創性工作、軍事、航海、探險等行業。',
}

export interface PatternDef { name: string; desc: string; rating: string }
type StarInfo = { name: string; brightness?: string; mutagen?: string }
type PalaceForPattern = { name: string; majorStars: StarInfo[]; minorStars: StarInfo[]; adjectiveStars: StarInfo[]; earthlyBranch: string }

export function detectPatterns(palaces: PalaceForPattern[]): PatternDef[] {
  const patterns: PatternDef[] = []
  const getP = (n: string) => palaces.find(p => p.name === n)
  const getMajors = (n: string) => (getP(n)?.majorStars || []).map((s: StarInfo) => s.name)
  const soul = getP('命宫')
  const sb = soul?.earthlyBranch || ''
  const has = (n: string, star: string) => (getMajors(n) || []).includes(star)
  const hasAny = (n: string, stars: string[]) => stars.some(s => getMajors(n).includes(s))

  const triStars = (p: string) => {
    const q = getP(p); if (!q) return [] as string[]
    return [...(q.majorStars || []).map(s => s.name), ...(q.minorStars || []).map(s => s.name), ...(q.adjectiveStars || []).map(s => s.name)]
  }
  const triAll = [...new Set([...triStars('命宫'), ...triStars('财帛'), ...triStars('官禄')])]
  const triHas = (star: string) => triAll.includes(star)
  const triHasAny = (stars: string[]) => stars.some(s => triAll.includes(s))

  // 顶级格局
  if (has('命宫', '紫微') && has('命宫', '天府')) patterns.push({ name: '紫府同宮格', desc: '紫微天府二帝星同守命宮，帝王之象，主貴氣非凡，一生衣食無憂。', rating: '上' })
  if (has('命宫', '紫微') && hasAny('命宫', ['左辅', '右弼'])) patterns.push({ name: '君臣慶會格', desc: '紫微帝星得左右輔弼拱照，主貴氣加身，有領導才能。', rating: '上' })
  if (has('命宫', '太阳') && sb === '卯') patterns.push({ name: '日照雷門格', desc: '旭日東升於卯，主早年發達，聲名遠播。', rating: '上' })
  if (has('命宫', '太阳') && sb === '午') patterns.push({ name: '日麗中天格', desc: '太陽居午宮如日中天，主權勢顯赫，名揚四海。', rating: '上' })
  if (has('命宫', '太阴') && sb === '亥') patterns.push({ name: '月朗天門格', desc: '太陰在亥，主溫潤清貴，智慧過人。', rating: '上' })
  if (has('命宫', '太阴') && sb === '酉') patterns.push({ name: '月生滄海格', desc: '太陰在酉，如月出海，主富貴清雅。', rating: '上' })
  if (has('命宫', '七杀') && hasAny('迁移', ['紫微', '天府'])) patterns.push({ name: '七殺朝斗格', desc: '七殺在命，對宮紫微天府照拱，為上貴格局。', rating: '上' })
  if (has('命宫', '武曲') && has('命宫', '贪狼')) patterns.push({ name: '武貪不發少年格', desc: '武曲貪狼守命，主中年後大發達，少年辛苦磨練。', rating: '上' })
  if (!has('命宫', '紫微') && triHas('紫微')) patterns.push({ name: '紫微朝垣格', desc: '三方四正中紫微照拱，得上司提攜。', rating: '上' })
  if (triHas('天府') && triHas('天相')) patterns.push({ name: '府相朝垣格', desc: '天府天相在三方四正朝照，穩重踏實，一生衣食豐足。', rating: '中上' })
  if (['天机', '太阴', '天同', '天梁'].filter(x => triHas(x)).length >= 3) patterns.push({ name: '機月同梁格', desc: '天機太陰天同天梁在三方四正齊聚，主智謀機變，宜公職策劃。', rating: '中上' })
  if (triHas('太阳') && triHas('天梁') && triHasAny(['文昌', '禄存'])) patterns.push({ name: '陽梁昌祿格', desc: '太陽天梁配文昌或祿存，主科甲功名，利學業考試。', rating: '中上' })
  if (['文昌', '文曲', '左辅', '右弼', '天魁', '天钺'].filter(x => triHas(x)).length >= 4) patterns.push({ name: '文星拱命格', desc: '輔弼昌曲魁鉞會照，聰明多藝，文采出眾。', rating: '中上' })
  if (has('命宫', '紫微') && has('命宫', '七杀')) patterns.push({ name: '紫殺格', desc: '紫微七殺同守命宮，化殺為權，威權顯赫。', rating: '中上' })
  if (has('命宫', '紫微') && has('命宫', '破军')) patterns.push({ name: '紫破格', desc: '紫微破軍同守命宮，開創性強，變動較大。', rating: '中上' })
  if (has('命宫', '紫微') && has('命宫', '贪狼')) patterns.push({ name: '紫貪格', desc: '紫微貪狼同守命宮，多才多藝，桃花旺盛。', rating: '中' })
  if (has('命宫', '廉贞') && has('命宫', '七杀')) patterns.push({ name: '廉貞七殺格', desc: '廉貞七殺同守命宮，積富之人，性格果決剛毅。', rating: '中上' })
  if (has('命宫', '廉贞') && has('命宫', '破军')) patterns.push({ name: '廉貞破軍格', desc: '廉貞破軍同守命宮，變動多端，宜開拓型事業。', rating: '中' })
  if (has('命宫', '廉贞') && has('命宫', '天府')) patterns.push({ name: '廉府格', desc: '廉貞天府同守命宮，才華內斂，能文能武。', rating: '中上' })
  if (has('命宫', '武曲') && has('命宫', '七杀')) patterns.push({ name: '武殺格', desc: '武曲七殺同守命宮，剛毅果決，宜軍警工業。', rating: '中' })
  if (has('命宫', '武曲') && has('命宫', '天府')) patterns.push({ name: '武府格', desc: '武曲天府同守命宮，文武兼備，財運穩定。', rating: '中上' })
  if (has('命宫', '武曲') && has('命宫', '天相')) patterns.push({ name: '武相格', desc: '武曲天相同守命宮，剛正不阿，宜公職管理。', rating: '中上' })
  if (has('命宫', '巨门') && has('命宫', '太阳')) patterns.push({ name: '巨日同宮格', desc: '巨門與太陽同宮，以口為業，能言善辯。', rating: '中' })
  if (['七杀', '破军', '贪狼'].filter(x => triHas(x)).length >= 2) patterns.push({ name: '殺破狼格', desc: '七殺破軍貪狼在三方四正，主變動開創，一生波瀾壯闊。', rating: '中' })
  if (triHas('天同') && triHas('天梁')) patterns.push({ name: '同梁拱照格', desc: '天同天梁在三方照拱，福壽雙全，宜慈善公務。', rating: '中上' })
  if ((has('命宫', '禄存') && triHas('天马')) || (triHas('禄存') && triHas('天马'))) patterns.push({ name: '祿馬交馳格', desc: '祿存天馬交會，主奔波勞碌而招財。', rating: '中' })
  const liuji = ['左辅', '右弼', '文昌', '文曲', '天魁', '天钺']
  const liujiCount = liuji.filter(x => triHas(x)).length
  if (liujiCount >= 3) patterns.push({ name: '六吉拱命格', desc: `六吉星中${liujiCount}顆在三方四正，貴人多助。`, rating: liujiCount >= 5 ? '上' : '中上' })
  if (triHas('文昌') && triHas('文曲')) patterns.push({ name: '昌曲拱命格', desc: '文昌文曲在三方四正，文采出眾，學業有成。', rating: '中上' })
  if (triHas('天魁') && triHas('天钺')) patterns.push({ name: '魁鉞拱命格', desc: '天魁天鉞在三方四正，貴人運極佳。', rating: '中上' })
  if (triHas('太阳') && triHas('太阴')) patterns.push({ name: '日月並明格', desc: '太陽太陰在三方四正，陰陽調和，事業家庭兩全。', rating: '中上' })

  return patterns
}
