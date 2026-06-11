'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { astro } from 'iztro'
import { getMaxDay, lunarToSolarDate, getYearLeapMonth } from '@/components/CalendarInput'

// ── Types ──
type CalendarType = 'solar' | 'lunar'

// ── Brightness (iztro returns Chinese chars) ──
const BRIGHTNESS: Record<string, { label: string; color: string; level: number; score: number }> = {
  '庙': { label: '廟', color: 'text-green-400', level: 5, score: 100 },
  '旺': { label: '旺', color: 'text-green-300', level: 4, score: 80 },
  '得': { label: '得', color: 'text-blue-300',  level: 3, score: 60 },
  '利': { label: '利', color: 'text-cyan-300',  level: 2, score: 40 },
  '平': { label: '平', color: 'text-yellow-400', level: 1, score: 20 },
  '不': { label: '不', color: 'text-orange-400', level: -1, score: 10 },
  '陷': { label: '陷', color: 'text-red-400',   level: -2, score: 0 },
  '':   { label: '—',  color: 'text-gray-400',  level: 0,  score: 0 },
}

const MUTAGEN: Record<string, { label: string; color: string }> = {
  '禄': { label: '化祿', color: 'text-green-400' },
  '权': { label: '化權', color: 'text-purple-400' },
  '科': { label: '化科', color: 'text-blue-400' },
  '忌': { label: '化忌', color: 'text-red-400' },
}

const JI_XING = new Set(['左辅','右弼','文昌','文曲','天魁','天钺','禄存','天马','三台','八座','恩光','天贵','龙池','凤阁','台辅','封诰','天福','天官','天厨','天才','天寿','解神','天德','月德'])
const SHA_XING = new Set(['擎羊','陀罗','火星','铃星','地空','地劫','天刑','天姚','阴煞','劫煞','破碎','蜚廉','孤辰','寡宿','天哭','天虚','空亡','旬空','截路','天空','天殇','天使','年解'])

const HOUR_OPTIONS = [
  { value: '0', label: '子 23:00~00:59' }, { value: '1', label: '丑 01:00~02:59' },
  { value: '2', label: '寅 03:00~04:59' }, { value: '3', label: '卯 05:00~06:59' },
  { value: '4', label: '辰 07:00~08:59' }, { value: '5', label: '巳 09:00~10:59' },
  { value: '6', label: '午 11:00~12:59' }, { value: '7', label: '未 13:00~14:59' },
  { value: '8', label: '申 15:00~16:59' }, { value: '9', label: '酉 17:00~18:59' },
  { value: '10', label: '戌 19:00~20:59' }, { value: '11', label: '亥 21:00~22:59' },
]

// ── 4x4 table layout by earthlyBranch ──
const CHART_ROWS: (string | null)[][] = [
  ['巳', '午', '未', '申'],
  ['辰', null, null, '酉'],
  ['卯', '戌', null, null],
  ['寅', '丑', '子', '亥'],
]

// ── iztro palace names → traditional display ──
const IZTRO_TO_DISPLAY: Record<string, string> = {
  '命宫':'命宮','兄弟':'兄弟宮','夫妻':'夫妻宮','子女':'子女宮',
  '财帛':'財帛宮','疾厄':'疾厄宮','迁移':'遷移宮','仆役':'交友宮',
  '官禄':'事業宮','田宅':'田宅宮','福德':'福德宮','父母':'父母宮',
}

// ── Comprehensive Star Descriptions ──
const STAR_DESC: Record<string, string> = {
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
  '七杀':'七殺於命宮：七殺星坐命，具有將相性格，可獨力處理外務，也具經營者的行政能力，也擅理財。精明果決，冷酷不苟言笑，個性剛強率直，不怒而威，能為眾人所信服。七殺情緒不穩定，有衝動潛能。七殺一生大變化的機率很高。利軍警武職。有離鄉背井機會。眼大有霸氣。個性好勝，明知故犯。爽直，自信心太高。霸道沖動。暴戾，難交知心友。喜軍警、工程界。',
  '破军':'破軍於命宮：破軍星坐命，性格剛烈，有開創精神，喜破壞重建。變動不斷，一生多有波折起伏。破軍為先鋒，有冒險精神，宜開創新事業。個性急躁，做事衝動，需注意因衝動造成的損失。宜從事開創性工作、軍事、航海、探險等行業。',
  '左辅':'左輔：貴人星，主得貴人相助，增加人緣。左輔入命，為人敦厚，善於輔助他人，一生多得長輩上司提攜。',
  '右弼':'右弼：貴人星，增加助力與機會。右弼入命，善於變通，桃花運佳，得異性貴人之助。',
  '文昌':'文昌：文星，主科甲功名、文采風流。文昌入命，為人聰明好學，善於表達，有文藝才華，利於考試升學。',
  '文曲':'文曲：文星，主口才辯才、技藝才華。文曲入命，擅長言辭，精通技藝，口才出眾，宜從事演藝、教學等行業。',
  '天魁':'天魁：貴人星，主得尊貴之人提拔。天魁入命，氣質高雅，得一品貴人之助，一生事業順利。天魁為晝貴人。',
  '天钺':'天鉞：貴人星，天鉞入命，多得異性長輩貴人之助。為人溫和，善於溝通，有才華，宜從事公職。天鉞為夜貴人。',
  '禄存':'祿存：財星，主一生財源穩定。祿存入命，為人節儉保守，聚財能力強，不喜冒險投資。一生財庫穩定，晚年安逸。',
  '天马':'天馬：遷移星，主奔波勞碌、變動快速。天馬入命，為人好動，不喜安逸，宜從事交通、貿易、旅遊等流動性行業。',
  '擎羊':'擎羊：煞星，主刑傷、血光、衝動。擎羊入命，性格剛烈急躁，易與人發生衝突，需注意車禍、刀傷。',
  '陀罗':'陀羅：煞星，主拖累、拖延、暗算。陀羅入命，做事拖延不決，常遇小人暗害，需注意慢性疾病。',
  '火星':'火星：煞星，主火災、意外、暴發。火星入命，性格暴躁，做事衝動急躁，爆發力強，有成敗在一瞬間之象。',
  '铃星':'鈴星：煞星，主陰火、暗災、怨恨。鈴星入命，個性陰沉，心思深重，悶燒型脾氣，需注意心血管疾病。',
  '地空':'地空：煞星，主虛空、幻想、破敗。地空入命，想法天馬行空，不切實際，需注意投資失利、感情虛幻。',
  '地劫':'地劫：煞星，主劫難、損失、消耗。地劫入命，一生多有損耗，財來財去，需注意意外耗財。',
  '天刑':'天刑：主刑罰、訴訟、官非。天刑入命，需注意法律問題，從事法律行業反而有利。',
  '天姚':'天姚：桃花星，主感情糾葛、風流韻事。天姚入命，桃花運旺，但多爛桃花，需注意感情陷阱。',
  '阴煞':'陰煞：主小人、暗害、邪祟。陰煞入命，易招小人，運勢低迷時尤甚。',
  '劫煞':'劫煞：主劫奪、失竊、意外損失。劫煞入命，需注意防盜、防騙。',
  '破碎':'破碎：破壞，飛來是非。破碎入命，小事不斷，磨難較多。',
  '蜚廉':'蜚廉：主是非、口舌、流言蜚語。蜚廉入命，易陷入是非漩渦。',
  '孤辰':'孤辰：主孤獨、性格孤僻。孤辰入命，性格較孤獨內向，六親緣淡。',
  '寡宿':'寡宿：主獨居、寡言。寡宿入命，不喜熱鬧，適合獨自工作生活。',
  '天哭':'天哭：主悲傷、憂愁。天哭入命，易悲觀消極，需調適心情。',
  '天虚':'天虛：主虛弱、虛幻。天虛入命，體質可能較弱，精神易疲勞。',
  '红鸾':'紅鸞：正桃花星，主喜慶姻緣。紅鸞入命，桃花運佳，異性緣好，適合談婚論嫁。',
  '天喜':'天喜：喜慶星，主歡樂好事。天喜入命，性格開朗，喜事連連。',
  '龙池':'龍池：文貴星，主學術研究。龍池入命，聰明好學，宜學術、研究領域。',
  '凤阁':'鳳閣：文貴星，主藝術才華。鳳閣入命，有藝術天份，宜文學、藝術行業。',
  '三台':'三台：官貴星，主掌權。三台入命，有管理才能，宜行政管理。',
  '八座':'八座：官貴星，主顯達。八座入命，有社會地位，受人尊敬。',
  '恩光':'恩光：貴人星，主恩寵提拔。恩光入命，得上司賞識，有升遷機會。',
  '天贵':'天貴：貴氣星，主高貴氣質。天貴入命，氣質非凡，有貴族風範。',
  '天官':'天官：官祿星，主事業發展。天官入命，宜從事公職，事業有成。',
  '天厨':'天廚：飲食星，主飲食之福。天廚入命，有口福，宜餐飲行業。',
  '天才':'天才：才智星，主天賦聰穎。天才入命，才華橫溢，學習能力強。',
  '天寿':'天壽：壽元星，主長壽健康。天壽入命，健康長壽，晚年福厚。',
  '解神':'解神：化解星，主逢凶化吉。解神入命，能化解災厄，轉危為安。',
  '天巫':'天巫：宗教星，主信仰之緣。天巫入命，與宗教、玄學有緣。',
  '天月':'天月：病符星，主慢性疾病。天月入命，需注意健康保養。',
  '截路':'截路：障礙星，主中途受阻。截路入命，事業多有波折。',
  '空亡':'空亡：虛空星，主成敗無常。空亡入命，運勢起伏不定。',
  '旬空':'旬空：虛空星，主計劃落空。旬空入命，計劃易生變數。',
  '天空':'天空：幻想星，主不切實際。天空入命，想法天馬行空。',
  '天殇':'天殤：夭折星，主早年困苦。天殤入命，早年多磨難。',
  '天使':'天使：死亡星，主意外。天使入命，需注意人身安全。',
}

// ── Pattern/格局 Library ──
interface PatternDef { name: string; desc: string; rating: string }
interface StarInfo { name: string; brightness?: string; mutagen?: string }

type PalaceForPattern = { name: string; majorStars: StarInfo[]; minorStars: StarInfo[]; adjectiveStars: StarInfo[]; earthlyBranch: string }

function detectPatterns(palaces: PalaceForPattern[], bornSihua: { star: string }[]): PatternDef[] {
  const patterns: PatternDef[] = []
  const getP = (n: string) => palaces.find(p => p.name === n)
  const getStars = (n: string) => (getP(n)?.majorStars || []).map((s: StarInfo) => s.name)
  const soul = getP('命宫')
  const ss = soul ? getStars('命宫') : []
  const sb = soul?.earthlyBranch || ''
  const has = (n: string, star: string) => (getStars(n) || []).includes(star)
  const hasAny = (n: string, stars: string[]) => stars.some(s => (getStars(n) || []).includes(s))

  // 三方四正：命宫 + 财帛 + 官禄
  const triStars = (p: string) => {
    const q = getP(p); if (!q) return []
    return [...(q.majorStars || []).map(s => s.name), ...(q.minorStars || []).map(s => s.name), ...(q.adjectiveStars || []).map(s => s.name)]
  }
  const triAll = [...new Set([...triStars('命宫'), ...triStars('财帛'), ...triStars('官禄')])]
  const triHas = (star: string) => triAll.includes(star)
  const triHasAny = (stars: string[]) => stars.some(s => triAll.includes(s))
  const triHasAll = (stars: string[]) => stars.every(s => triAll.includes(s))

  // 迁移宫（对宫）
  const qiStars = (getP('迁移')?.majorStars || []).map(s => s.name)

  const sihuaStars = bornSihua.map(s => s.star)

  // ═══════════════════════════════════════════
  // 顶级格局（上格）
  // ═══════════════════════════════════════════

  // 紫府同宫
  if (has('命宫', '紫微') && has('命宫', '天府'))
    patterns.push({ name: '紫府同宮格', desc: '紫微天府二帝星同守命宮，帝王之象，主貴氣非凡，一生衣食無憂，事業有成。' + (sb === '寅' || sb === '申' ? '寅申為正格，格局更高。' : ''), rating: '上' })

  // 君臣庆会
  if (has('命宫', '紫微') && hasAny('命宫', ['左辅', '右弼']))
    patterns.push({ name: '君臣慶會格', desc: '紫微帝星得左右輔弼拱照，君臣相得，主貴氣加身，有領導才能，得貴人相助。', rating: '上' })

  // 日照雷门
  if (has('命宫', '太阳') && sb === '卯')
    patterns.push({ name: '日照雷門格', desc: '旭日東升於卯，如日照雷門，光輝燦爛。主早年發達，聲名遠播。', rating: '上' })

  // 日丽中天
  if (has('命宫', '太阳') && sb === '午')
    patterns.push({ name: '日麗中天格', desc: '太陽居午宮，如日中天，光輝至極。主權勢顯赫，名揚四海。', rating: '上' })

  // 月朗天门
  if (has('命宫', '太阴') && sb === '亥')
    patterns.push({ name: '月朗天門格', desc: '太陰在亥為月朗天門，主溫潤清貴，智慧過人，適合文職、藝術。', rating: '上' })

  // 月生沧海
  if (has('命宫', '太阴') && sb === '酉')
    patterns.push({ name: '月生滄海格', desc: '太陰在酉，如月出海，主富貴清雅，宜文職才藝。', rating: '上' })

  // 七杀朝斗
  if (has('命宫', '七杀') && hasAny('迁移', ['紫微', '天府']))
    patterns.push({ name: '七殺朝斗格', desc: '七殺在命，對宮紫微天府照拱，為上貴格局。作風強勢，攻擊力強，有領導力。' + (sb === '寅' || sb === '申' ? '寅申為正格。' : ''), rating: '上' })

  // 武贪格
  if (has('命宫', '武曲') && has('命宫', '贪狼'))
    patterns.push({ name: '武貪不發少年格', desc: '武曲貪狼守命，主中年後大發達，少年辛苦磨練。' + (sb === '丑' || sb === '未' ? '丑未為正格。' : ''), rating: '上' })

  // 紫微朝垣（三方见紫微）
  if (!has('命宫', '紫微') && triHas('紫微'))
    patterns.push({ name: '紫微朝垣格', desc: '三方四正中紫微照拱，貴氣加身，得上司提攜，有領導才能。', rating: '上' })

  // 三奇加会（科权禄）
  const sihuaLabels = bornSihua.map(s => s.star)
  if (sihuaLabels.length >= 3 && ['禄', '权', '科'].every(t => bornSihua.some(s => s.star.includes(t) || t === '')))
    patterns.push({ name: '三奇加會格', desc: '科權祿三奇會合，主才華出眾，名利雙收，一生有特殊成就。', rating: '上' })

  // ═══════════════════════════════════════════
  // 中上级格局
  // ═══════════════════════════════════════════

  // 府相朝垣
  if (triHas('天府') && triHas('天相'))
    patterns.push({ name: '府相朝垣格', desc: '天府天相在三方四正朝照，穩重踏實，一生衣食豐足，宜從事金融、管理行業。', rating: '中上' })

  // 机月同梁
  if (['天机', '太阴', '天同', '天梁'].filter(x => triHas(x)).length >= 3)
    patterns.push({ name: '機月同梁格', desc: '天機、太陰、天同、天梁在三方四正齊聚，主智謀機變，宜公職、策劃、文秘之職。吏人優裕之格。', rating: '中上' })

  // 阳梁昌禄
  if (triHas('太阳') && triHas('天梁') && triHasAny(['文昌', '禄存']))
    patterns.push({ name: '陽梁昌祿格', desc: '太陽天梁配文昌或祿存，主科甲功名，利學業考試，適合學術研究。', rating: '中上' })

  // 文星拱命
  if (['文昌', '文曲', '左辅', '右弼', '天魁', '天钺'].filter(x => triHas(x)).length >= 4)
    patterns.push({ name: '文星拱命格', desc: '輔弼昌曲魁鉞會照，聰明多藝，宜文職、學術研究，文采出眾。', rating: '中上' })

  // 紫微+七杀/破军/贪狼
  if (has('命宫', '紫微') && has('命宫', '七杀'))
    patterns.push({ name: '紫殺格', desc: '紫微七殺同守命宮，化殺為權，威權顯赫，宜軍警、管理。', rating: '中上' })
  if (has('命宫', '紫微') && has('命宫', '破军'))
    patterns.push({ name: '紫破格', desc: '紫微破軍同守命宮，開創性強，宜創業、革新，但變動較大。', rating: '中上' })
  if (has('命宫', '紫微') && has('命宫', '贪狼'))
    patterns.push({ name: '紫貪格', desc: '紫微貪狼同守命宮，多才多藝，桃花旺盛，宜演藝、公關行業。', rating: '中' })

  // 廉贞组合
  if (has('命宫', '廉贞') && has('命宫', '七杀'))
    patterns.push({ name: '廉貞七殺格', desc: '廉貞七殺同守命宮，積富之人。性格果決剛毅，做事雷厲風行。', rating: '中上' })
  if (has('命宫', '廉贞') && has('命宫', '破军'))
    patterns.push({ name: '廉貞破軍格', desc: '廉貞破軍同守命宮，浪裡行舟，變動多端，宜開拓型事業。', rating: '中' })
  if (has('命宫', '廉贞') && has('命宫', '天府'))
    patterns.push({ name: '廉府格', desc: '廉貞天府同守命宮，才華內斂，能文能武，宜管理、行政。', rating: '中上' })
  if (has('命宫', '廉贞') && has('命宫', '天相'))
    patterns.push({ name: '廉相格', desc: '廉貞天相同守命宮，能文能武，宜公務、服務行業。', rating: '中' })
  if (has('命宫', '廉贞') && has('命宫', '贪狼') && (sb === '巳' || sb === '亥'))
    patterns.push({ name: '泛水桃花格', desc: '廉貞貪狼居巳亥，泛水桃花，風流倜儻，才華出眾，但感情複雜。', rating: '中' })

  // 武曲组合
  if (has('命宫', '武曲') && has('命宫', '七杀'))
    patterns.push({ name: '武殺格', desc: '武曲七殺同守命宮，剛毅果決，宜軍警、工業、外科醫生。', rating: '中' })
  if (has('命宫', '武曲') && has('命宫', '破军'))
    patterns.push({ name: '武破格', desc: '武曲破軍同守命宮，動盪中求發展，宜開創新事業。', rating: '中' })
  if (has('命宫', '武曲') && has('命宫', '天府'))
    patterns.push({ name: '武府格', desc: '武曲天府同守命宮，文武兼備，剛柔並濟，宜管理崗位，財運穩定。', rating: '中上' })
  if (has('命宫', '武曲') && has('命宫', '天相'))
    patterns.push({ name: '武相格', desc: '武曲天相同守命宮，剛正不阿，宜公職、企業管理。', rating: '中上' })

  // ═══════════════════════════════════════════
  // 中级格局
  // ═══════════════════════════════════════════

  // 巨日
  if (has('命宫', '巨门') && has('命宫', '太阳'))
    patterns.push({ name: '巨日同宮格', desc: '巨門與太陽同宮，以口為業，宜律師、教師、媒體等行業，能言善辯。', rating: '中' })

  // 巨机
  if (has('命宫', '巨门') && has('命宫', '天机'))
    patterns.push({ name: '巨機同臨格', desc: '巨門天機同守命宮，智慧過人，口才出眾，宜研究、顧問行業。', rating: '中' })

  // 杀破狼
  if (['七杀', '破军', '贪狼'].filter(x => triHas(x)).length >= 2)
    patterns.push({ name: '殺破狼格', desc: '七殺、破軍、貪狼在三方四正，主變動、開創、冒險精神強。一生波瀾壯闊，宜創業從商。', rating: '中' })

  // 同梁
  if (triHas('天同') && triHas('天梁'))
    patterns.push({ name: '同梁拱照格', desc: '天同天梁在三方照拱，福壽雙全，宜慈善、宗教、公務行業。', rating: '中上' })

  // 同阴
  if (has('命宫', '天同') && has('命宫', '太阴'))
    patterns.push({ name: '同陰格', desc: '天同太陰同守命宮，溫柔體貼，宜服務、藝術行業。', rating: '中' })

  // 禄马交驰
  if ((has('命宫', '禄存') && triHas('天马')) || (triHas('禄存') && triHas('天马')))
    patterns.push({ name: '祿馬交馳格', desc: '祿存天馬交會，主奔波勞碌而招財，宜外地發展、經商貿易。', rating: '中' })

  // 六吉汇聚
  const liuji = ['左辅', '右弼', '文昌', '文曲', '天魁', '天钺']
  const liujiCount = liuji.filter(x => triHas(x)).length
  if (liujiCount >= 3)
    patterns.push({ name: '六吉拱命格', desc: `六吉星中${liujiCount}顆會照三方四正，貴人多助，處處逢源，事半功倍。`, rating: liujiCount >= 5 ? '上' : '中上' })

  // 六煞回避
  const liusha = ['擎羊', '陀罗', '火星', '铃星', '地空', '地劫']
  const liushaCount = liusha.filter(x => triHas(x)).length
  if (liushaCount >= 3)
    patterns.push({ name: '六煞聚會格', desc: `六煞星中${liushaCount}顆在三方四正，一生多波折考驗，需修身養性，行善積德化解。`, rating: '中下' })

  // 空劫拱命
  if (triHas('地空') && triHas('地劫'))
    patterns.push({ name: '空劫夾命格', desc: '地空地劫在三方四正，思想獨特，不入俗流，宜創意、藝術行業，但需防虛幻不實。', rating: '中' })

  // 昌曲夹命
  if (triHas('文昌') && triHas('文曲'))
    patterns.push({ name: '昌曲拱命格', desc: '文昌文曲在三方四正，文采出眾，學業有成，宜學術、文學、藝術。', rating: '中上' })

  // 魁钺夹命
  if (triHas('天魁') && triHas('天钺'))
    patterns.push({ name: '魁鉞拱命格', desc: '天魁天鉞在三方四正，貴人運極佳，得上司長輩提攜，宜公職。', rating: '中上' })

  // 日月并明
  if (triHas('太阳') && triHas('太阴'))
    patterns.push({ name: '日月並明格', desc: '太陽太陰在三方四正，陰陽調和，事業家庭兩全，一生光明磊落。', rating: '中上' })

  // 辅弼拱主
  if (has('命宫', '紫微') && triHasAny(['左辅', '右弼']))
    patterns.push({ name: '輔弼拱主格', desc: '紫微坐命，左輔右弼在三方拱照，帝星得輔，權威更盛。', rating: '上' })

  return patterns
}

// ── Star info type ──
interface FullStarInfo { name: string; brightness: string; mutagen: string; type: string; scope: string }

// ── Component ──
export default function ZiweiClient() {
  const now = new Date()
  const [calendarType, setCalendarType] = useState<CalendarType>('solar')
  const [year, setYear] = useState(String(now.getFullYear()))
  const [month, setMonth] = useState(String(now.getMonth() + 1))
  const [day, setDay] = useState(String(now.getDate()))
  const [hour, setHour] = useState('6')
  const [gender, setGender] = useState<'M' | 'F'>('M')
  const [isLeap, setIsLeap] = useState(false)
  const [result, setResult] = useState<Record<string, unknown> | null>(null)
  const [error, setError] = useState('')

  const y = parseInt(year) || 2000
  const m = parseInt(month) || 1
  const d = parseInt(day) || 1

  const maxDay = useMemo(() => getMaxDay(calendarType, y, m), [calendarType, y, m])
  // 日期修正：历法切换或年月变化时自动修正
  useEffect(() => {
    if (parseInt(day) > maxDay) {
      setDay(String(maxDay))
    }
  }, [calendarType, year, month, maxDay])
  const yearLeap = useMemo(() => calendarType === 'lunar' ? getYearLeapMonth(y) : 0, [calendarType, y])
  const hasLeap = calendarType === 'lunar' && yearLeap === m

  const validationMsg = useMemo(() => {
    if (y < 1 || y > 3400) return '年份需在 1-3400 之間'
    if (m < 1 || m > 12) return '請輸入有效月份'
    if (d < 1 || d > maxDay) return `${calendarType === 'solar' ? `${y}年${m}月` : `農曆${m}月`}有 ${maxDay} 天`
    return ''
  }, [y, m, d, maxDay, calendarType])

  const analyze = useCallback(() => {
    setError('')
    if (validationMsg) { setError(validationMsg); return }
    try {
      const h = parseInt(hour)
      const sd = calendarType === 'solar'
        ? `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
        : lunarToSolarDate(y, m, d, isLeap)
      const r = astro.bySolar(sd, h, gender === 'M' ? 'male' : 'female')
      setResult(r as unknown as Record<string, unknown>)
    } catch (e: unknown) { setError((e as Error)?.message || '日期格式有誤') }
  }, [y, m, d, hour, calendarType, isLeap, gender, validationMsg])

  // ── Derived data ──
  type PalaceRaw = { name: string; earthlyBranch: string; heavenlyStem: string; isBodyPalace?: boolean; majorStars: FullStarInfo[]; minorStars: FullStarInfo[]; adjectiveStars: FullStarInfo[]; decadal?: { range: [number, number] }; ages?: { range: [number, number] } }
  const palaces = (result?.palaces || []) as PalaceRaw[]
  const palaceMap = useMemo(() => Object.fromEntries(palaces.map(p => [p.earthlyBranch, p])), [palaces])
  const soulPalace = palaces.find(p => p.name === '命宫')
  const bodyBranch = result?.earthlyBranchOfBodyPalace as string | undefined

  // ── Sihua (scan all palaces) ──
  const bornSihua = useMemo(() => {
    const list: { star: string; label: string; color: string }[] = []
    for (const p of palaces) {
      for (const s of p.majorStars || []) {
        if (s.mutagen && MUTAGEN[s.mutagen]) {
          list.push({ star: s.name, label: MUTAGEN[s.mutagen].label, color: MUTAGEN[s.mutagen].color })
        }
      }
    }
    return list
  }, [palaces])

  // ── Brightness score ──
  const brightnessScore = useMemo(() => {
    const ms = (soulPalace?.majorStars || []) as FullStarInfo[]
    if (ms.length === 0) return 50
    return Math.round(ms.reduce((sum, s) => sum + (BRIGHTNESS[s.brightness || ''] || BRIGHTNESS['']).score, 0) / ms.length)
  }, [soulPalace])

  // ── Auspicious stats (命宫 + 迁移宫) ──
  const auspiciousStats = useMemo(() => {
    const qy = palaceMap['申'] // opposite palace (迁移)
    const allSoulStars = [
      ...(soulPalace?.majorStars || []).map((s: FullStarInfo) => s.name),
      ...(soulPalace?.minorStars || []).map((s: FullStarInfo) => s.name),
      ...(soulPalace?.adjectiveStars || []).map((s: FullStarInfo) => s.name),
    ]
    const allQyStars = qy ? [
      ...(qy.majorStars || []).map((s: FullStarInfo) => s.name),
      ...(qy.minorStars || []).map((s: FullStarInfo) => s.name),
      ...(qy.adjectiveStars || []).map((s: FullStarInfo) => s.name),
    ] : []
    const combined = [...allSoulStars, ...allQyStars]
    const ji = combined.filter(x => JI_XING.has(x)).length
    const sha = combined.filter(x => SHA_XING.has(x)).length
    const jiList = combined.filter(x => JI_XING.has(x))
    const shaList = combined.filter(x => SHA_XING.has(x))
    return { ji, sha, jiList: jiList.join(' '), shaList: shaList.join(' ') }
  }, [soulPalace, palaceMap])

  const { ji: auspCount, sha: inauspCount } = auspiciousStats
  const auspIndex = auspCount + inauspCount > 0 ? Math.round((auspCount / (auspCount + inauspCount)) * 100) : 50
  const fortuneScore = Math.round((brightnessScore + auspIndex) / 2)

  // ── Patterns ──
  const patterns = useMemo(() => {
    if (!soulPalace) return []
    return detectPatterns(palaces as PalaceForPattern[], bornSihua as { star: string }[])
  }, [soulPalace, palaces, bornSihua])
  const patternIndex = patterns.length > 0 ? Math.min(100, 50 + patterns.length * 15) : 50

  // ── Star descriptions ──
  const soulStarDescs = useMemo(() => {
    if (!soulPalace) return []
    const ms = (soulPalace.majorStars || []).map((s: FullStarInfo) => s.name)
    const ns = [...(soulPalace.minorStars || []), ...(soulPalace.adjectiveStars || [])].map((s: FullStarInfo) => s.name)
    const descs: { name: string; desc: string }[] = []
    for (const name of ms) if (STAR_DESC[name]) descs.push({ name, desc: STAR_DESC[name] })
    for (const name of ns) if (STAR_DESC[name]) descs.push({ name, desc: STAR_DESC[name] })
    return descs
  }, [soulPalace])

  const soulDisplayName = soulPalace ? (IZTRO_TO_DISPLAY[soulPalace.name] || soulPalace.name) : '—'
  const zodiac = (result?.zodiac as string) || ''
  const fiveElem = (result?.fiveElementsClass as string) || ''
  const soul = (result?.soul as string) || ''
  const body = (result?.body as string) || ''
  const solarDate = (result?.solarDate as string) || ''
  const lunarDate = (result?.lunarDate as string) || ''
  const chineseDate = (result?.chineseDate as string) || ''
  const timeRange = (result?.timeRange as string) || HOUR_OPTIONS.find(o => o.value === hour)?.label || ''

  // ═══ BUILD PALACE CELL DATA ═══
  const renderPalaceCell = (branch: string) => {
    const p = palaceMap[branch]
    if (!p) return <td key={branch} className="border border-dark-600 p-1.5 bg-dark-900/30 text-[9px] text-gray-600 align-top">{branch}</td>
    const isSoul = p.name === '命宫'
    const isBody = p.isBodyPalace
    const displayName = IZTRO_TO_DISPLAY[p.name] || p.name
    const majors = (p.majorStars || []) as FullStarInfo[]
    const minors = [...(p.minorStars || []), ...(p.adjectiveStars || [])] as FullStarInfo[]
    const bg = isSoul ? 'bg-gold-900/25 border-gold-400 shadow-[0_0_8px_rgba(200,160,80,0.3)]'
      : isBody ? 'bg-gold-900/15 border-gold-500/50'
      : 'bg-dark-800/70 border-dark-600'
    return (
      <td key={branch} className={`border p-1.5 align-top ${bg}`}>
        <p className="text-[9px] text-gray-600 mb-0.5">{p.heavenlyStem}{p.earthlyBranch}</p>
        <p className={`font-semibold text-xs mb-0.5 ${isSoul ? 'text-gold-300' : 'text-gold-400'}`}>
          {displayName}
          {isBody && <span className="text-[8px] text-gold-500 ml-0.5">身</span>}
        </p>
        {p.decadal?.range && <p className="text-[8px] text-gray-500">大限:{p.decadal.range[0]}-{p.decadal.range[1]}</p>}
        {majors.length > 0 ? (
          <div className="mt-0.5">
            {majors.map((s, i) => {
              const b = BRIGHTNESS[s.brightness || ''] || BRIGHTNESS['']
              const mu = s.mutagen && MUTAGEN[s.mutagen] ? MUTAGEN[s.mutagen] : null
              return (
                <span key={i} className="text-[10px] text-gold-300 font-semibold">
                  {s.name}{b.label !== '—' && <span className={`text-[8px] ${b.color}`}>{b.label}</span>}
                  {mu && <span className={`text-[8px] ${mu.color}`}>{mu.label}</span>}
                  {i < majors.length - 1 && ' '}
                </span>
              )
            })}
          </div>
        ) : <p className="text-[9px] text-gray-600 italic">—</p>}
        {minors.length > 0 && (
          <p className="text-[8px] text-gray-500 leading-relaxed mt-0.5">
            {minors.map((s, i) => (
              <span key={i} className={SHA_XING.has(s.name) ? 'text-red-400/80' : 'text-cyan-300/80'}>
                {s.name}{i < minors.length - 1 ? ',' : ''}
              </span>
            ))}
          </p>
        )}
      </td>
    )
  }

  // ═══ RENDER ═══
  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gold-400 font-serif mb-2">紫微斗數</h1>
      <p className="text-gray-400 mb-6 text-sm">四化 · 廟旺 · 大限 · 格局全解析 — 承《紫微斗數全書》古籍原文</p>

      {/* ═══ Input Form ═══ */}
      <div className="bg-dark-800/80 backdrop-blur rounded-xl border border-dark-600 p-5 mb-8 max-w-2xl mx-auto">
        <table className="w-full text-sm"><tbody>
          <tr>
            <td className="text-gray-400 pr-3 py-1.5 w-12 align-middle">性別</td>
            <td className="py-1.5">
              <label className="inline-flex items-center gap-1 cursor-pointer mr-5">
                <input type="radio" name="gender" checked={gender === 'M'} onChange={() => setGender('M')} className="accent-blue-500" />
                <span className="text-gray-200">男</span>
              </label>
              <label className="inline-flex items-center gap-1 cursor-pointer">
                <input type="radio" name="gender" checked={gender === 'F'} onChange={() => setGender('F')} className="accent-pink-500" />
                <span className="text-gray-200">女</span>
              </label>
            </td>
          </tr>
          <tr>
            <td className="text-gray-400 pr-3 py-1.5 align-middle">日期</td>
            <td className="py-1.5 flex items-center gap-1.5 flex-wrap">
              <select value={calendarType} onChange={e => { setCalendarType(e.target.value as CalendarType); setIsLeap(false) }}
                className="px-2 py-1.5 bg-dark-700 border border-dark-500 rounded text-gray-200 text-sm">
                <option value="solar">國曆</option>
                <option value="lunar">農曆</option>
              </select>
              <select value={year} onChange={e => setYear(e.target.value)}
                className="px-1.5 py-1.5 bg-dark-700 border border-dark-500 rounded text-gray-200 text-sm text-center">
                {Array.from({ length: 200 }, (_, i) => 1900 + i).map(v => <option key={v} value={v}>{v}</option>)}
              </select>
              <span className="text-gray-500 text-sm">年</span>
              <select value={month} onChange={e => { setMonth(e.target.value); setIsLeap(false) }}
                className="px-1.5 py-1.5 bg-dark-700 border border-dark-500 rounded text-gray-200 text-sm">
                {Array.from({ length: 12 }, (_, i) => <option key={i + 1} value={i + 1}>{i + 1}</option>)}
              </select>
              <span className="text-gray-500 text-sm">月</span>
              {hasLeap && (
                <label className="flex items-center gap-1 text-[10px] text-amber-400 cursor-pointer">
                  <input type="checkbox" checked={isLeap} onChange={e => setIsLeap(e.target.checked)} /> 閏月
                </label>
              )}
              <select value={day} onChange={e => setDay(e.target.value)}
                className="px-1.5 py-1.5 bg-dark-700 border border-dark-500 rounded text-gray-200 text-sm">
                {Array.from({ length: maxDay }, (_, i) => <option key={i + 1} value={i + 1}>{i + 1}</option>)}
              </select>
              <span className="text-gray-500 text-sm">日</span>
              <select value={hour} onChange={e => setHour(e.target.value)}
                className="px-1 py-1.5 bg-dark-700 border border-dark-500 rounded text-gray-200 text-[11px]">
                {HOUR_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </td>
          </tr>
        </tbody></table>
        {error && <p className="text-xs text-red-400 mt-2">{error}</p>}
        {validationMsg && <p className="text-xs text-amber-400 mt-2">⚠ {validationMsg}</p>}
        <div className="mt-4 flex gap-2">
          <button onClick={analyze} disabled={!!validationMsg}
            className="bg-gold-600 hover:bg-gold-500 text-dark-900 font-semibold px-6 py-1.5 rounded-lg text-sm transition-colors disabled:opacity-50">
            送出
          </button>
          <button onClick={() => { setResult(null); setError('') }}
            className="border border-dark-500 text-gray-400 hover:text-gray-200 px-4 py-1.5 rounded-lg text-sm transition-colors">
            清除
          </button>
        </div>
      </div>

      {/* ═══ Results ═══ */}
      {result && (
        <div className="space-y-6">
          {/* ── Control Bar ── */}
          <div className="bg-dark-800/60 rounded-lg border border-dark-600 p-3 text-sm flex items-center gap-4 flex-wrap">
            <span className="text-gray-400 text-xs">流月起始宮位</span>
            <label className="text-gray-200 text-xs"><input type="radio" name="flow" defaultChecked className="mr-1 accent-gold-500" />流月起始宮位</label>
            <label className="text-gray-500 text-xs"><input type="radio" name="flow" className="mr-1" />流年本宮</label>
            <label className="text-gray-500 text-xs"><input type="radio" name="flow" className="mr-1" />流年斗君</label>
            <span className="text-gray-600 mx-1">|</span>
            <select className="px-2 py-1 bg-dark-700 border border-dark-500 rounded text-gray-200 text-xs">
              <option>國曆</option><option>農曆</option>
            </select>
            <select className="px-1.5 py-1 bg-dark-700 border border-dark-500 rounded text-gray-200 text-xs" value={year} onChange={e => setYear(e.target.value)}>
              {Array.from({ length: 200 }, (_, i) => 1900 + i).map(v => <option key={v} value={v}>{v}</option>)}
            </select>
            <button className="px-2 py-1 text-xs bg-gold-600/20 border border-gold-500/30 rounded text-gold-400 hover:bg-gold-600/40">流年</button>
            <button className="px-2 py-1 text-xs border border-dark-500 rounded text-gray-500 hover:text-gray-300">流月</button>
            <button className="px-2 py-1 text-xs border border-dark-500 rounded text-gray-500 hover:text-gray-300">流日</button>
            <button className="px-2 py-1 text-xs border border-dark-500 rounded text-gray-500 hover:text-gray-300">流時</button>
          </div>

          {/* ── 12-Palace Table ── */}
          <h2 className="text-lg font-semibold text-gold-400 font-serif">
            本命：{soulDisplayName}
            <span className="text-xs text-gray-500 font-normal ml-3">
              好運指數:<span className={`font-bold ${fortuneScore >= 80 ? 'text-green-400' : fortuneScore >= 60 ? 'text-yellow-400' : fortuneScore >= 40 ? 'text-orange-400' : 'text-red-400'}`}>{fortuneScore}</span>
            </span>
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse" style={{ minWidth: 600 }}>
              <tbody>
                {CHART_ROWS.map((row, ri) => (
                  <tr key={ri}>
                    {row.map((branch, ci) => {
                      if (ri === 1 && ci === 1) {
                        return (
                          <td key="center" colSpan={2} className="border border-dark-600 bg-dark-850/80 p-3 text-center align-middle">
                            <div className="text-[10px] leading-relaxed text-gray-300 space-y-0.5">
                              <p>陽曆：{solarDate} {timeRange} {gender === 'M' ? '陽男' : '陰女'}</p>
                              <p>農曆：{lunarDate}</p>
                              <p>干支：{chineseDate}</p>
                              <p>五行局：{fiveElem}</p>
                              <p className="text-[9px]">
                                生年四化：{bornSihua.length > 0
                                  ? bornSihua.map((s, i) => <span key={i} className={`${s.color} font-semibold`}>{s.star}{s.label}{i < bornSihua.length - 1 ? '、' : ''}</span>)
                                  : <span className="text-gray-500">—</span>}
                              </p>
                              <p>命主：{soul}　身主：{body}</p>
                              <p className="text-gray-500">生肖：{zodiac}</p>
                            </div>
                          </td>
                        )
                      }
                      if (!branch) {
                        if (ri === 2 && (ci === 2 || ci === 3)) return <td key={ci} className="border border-dark-600 bg-dark-900/30" />
                        return null
                      }
                      return renderPalaceCell(branch)
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ── Brightness & Auspicious Analysis ── */}
          <div className="bg-dark-800/80 rounded-xl border border-gold-500/20 p-6">
            <h3 className="text-base font-semibold text-gold-400 font-serif mb-4">主星亮度與吉凶分析</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <table className="w-full text-xs"><tbody>
                  <tr className="border-b border-dark-600"><td className="py-1.5 text-gray-400 font-medium">主星</td><td className="py-1.5 text-gray-400 font-medium">亮度強弱</td></tr>
                  {soulPalace && (soulPalace.majorStars as FullStarInfo[]).length > 0 ? (soulPalace.majorStars as FullStarInfo[]).map((s, i) => {
                    const b = BRIGHTNESS[s.brightness || ''] || BRIGHTNESS['']
                    return <tr key={i} className="border-b border-dark-700">
                      <td className="py-1.5 text-gray-200 font-semibold">{s.name}</td>
                      <td className={`py-1.5 ${b.color} font-semibold`}>{b.label} ({b.score})</td>
                    </tr>
                  }) : <tr><td colSpan={2} className="py-1.5 text-gray-500 text-xs">命宮無主星（借對宮安星）</td></tr>}
                </tbody></table>
                <p className="text-xs text-gray-400 mt-2">主星亮度指數=<span className="text-gold-400 font-semibold">{brightnessScore}%</span></p>
              </div>
              <div>
                <table className="w-full text-xs"><tbody>
                  <tr className="border-b border-dark-600"><td className="py-1.5 text-green-400 font-medium">六吉星</td><td className="py-1.5 text-red-400 font-medium">六煞星</td></tr>
                  <tr className="border-b border-dark-700">
                    <td className="py-1.5 text-green-300/80 text-[10px]">{auspiciousStats.jiList || '—'}</td>
                    <td className="py-1.5 text-red-300/80 text-[10px]">{auspiciousStats.shaList || '—'}</td>
                  </tr>
                  <tr>
                    <td className="py-1.5 text-green-400 font-semibold">吉星共{auspCount}個</td>
                    <td className="py-1.5 text-red-400 font-semibold">凶星共{inauspCount}個</td>
                  </tr>
                </tbody></table>
                <p className="text-xs text-gray-400 mt-2">吉凶指數=({auspCount}/({auspCount}+{inauspCount}))*100%=<span className="text-gold-400 font-semibold">{auspIndex}%</span></p>
                <p className="text-xs text-gray-400 mt-1">綜合好運指數=<span className={`font-bold ${fortuneScore >= 80 ? 'text-green-400' : fortuneScore >= 60 ? 'text-yellow-400' : fortuneScore >= 40 ? 'text-orange-400' : 'text-red-400'}`}>{fortuneScore}</span></p>
              </div>
            </div>
          </div>

          {/* ── Pattern Analysis ── */}
          <div className="bg-dark-800/80 rounded-xl border border-gold-500/20 p-6">
            <h3 className="text-base font-semibold text-gold-400 font-serif mb-4">格局分析</h3>
            {patterns.length > 0 ? (
              <div className="space-y-3">
                <table className="w-full text-xs"><tbody>
                  {patterns.map((p, i) => (
                    <tr key={i} className="border-b border-dark-700">
                      <td className="py-2 w-36 text-gold-300 font-semibold align-top">【{p.name}】</td>
                      <td className="py-2 text-gray-400 leading-relaxed">{p.desc}</td>
                    </tr>
                  ))}
                </tbody></table>
                <p className="text-xs text-gray-400">格局總數 共{patterns.length}吉0兇</p>
                <p className="text-xs text-gray-400">格局吉凶指數=<span className="text-gold-400 font-semibold">{patternIndex}%</span></p>
              </div>
            ) : <p className="text-xs text-gray-500">命盤暫未發現明顯格局。</p>}
          </div>

          {/* ── Star Descriptions ── */}
          <div className="bg-dark-800/80 rounded-xl border border-gold-500/20 p-6">
            <h3 className="text-base font-semibold text-gold-400 font-serif mb-4">本命：{soulDisplayName}之各星說明</h3>
            {soulStarDescs.length > 0 ? (
              <table className="w-full text-xs"><tbody>
                {soulStarDescs.map(({ name, desc }, i) => (
                  <tr key={i} className="border-b border-dark-700">
                    <td className="py-2 w-16 text-gold-300 font-semibold align-top">{name}</td>
                    <td className="py-2 text-gray-400 leading-relaxed">{desc}</td>
                  </tr>
                ))}
              </tbody></table>
            ) : (
              <div className="text-xs text-gray-500">
                <p className="mb-2">命宮暫無詳細星曜數據。請確認已正確輸入生辰並成功排盤。</p>
                {soulPalace && <p className="text-gray-600">命宮數據：{(soulPalace.majorStars as FullStarInfo[])?.map((s: FullStarInfo) => s.name).join(', ') || '(無主星)'}</p>}
              </div>
            )}
          </div>

          {/* ── Introduction ── */}
          <div className="bg-dark-800/60 rounded-xl border border-dark-600 p-5 text-xs text-gray-400 leading-relaxed space-y-1.5">
            <h3 className="text-sm font-semibold text-gold-400 font-serif mb-2">【紫微斗數簡介與說明】</h3>
            <p>紫微斗數是一種起源於中國的傳統命理學，被視為一種分析個人命運、性格特質和人生趨勢的工具。它以中國古代的天文學、陰陽五行、干支等理論為基礎，透過分析個人出生的時間和地點，推算出「命盤」，並從中進行解讀。</p>
            <p>本程式可根據您輸入的生辰八字，幫您計算排出您的命盤。</p>
            <p>紫微斗數命盤包含十二個「宮位」，分別代表人生的不同方面，例如命宮（性格和命運）、財帛宮（財運）、夫妻宮（婚姻）、事業宮（職業發展）等。</p>
            <p>大限也叫「大運」，是指人生每十年的主要運勢變化。您可直接查看命盤內各宮的大限區間。</p>
            <p>流年就是指每一年的整體運勢，基於你的命盤來分析該年的主要發展方向，例如工作、感情、財運等。</p>
          </div>
        </div>
      )}
    </div>
  )
}
