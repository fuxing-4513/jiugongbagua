'use client'

import { useState } from 'react'
import { useLocale } from '@/lib/i18n'
import { Solar, Lunar } from 'lunar-typescript'

function tk(key: string, lang: Record<string, unknown>): string {
  const keys = key.split('.'); let v: unknown = lang
  for (const k of keys) { if (typeof v !== 'object' || v === null) return key; v = (v as Record<string, unknown>)[k] }
  return typeof v === 'string' ? v : key
}

const hourOpts = [
  {v:'0',l:'子初 23:00-00:59'},{v:'1',l:'丑初 01:00-01:59'},{v:'2',l:'丑正 02:00-02:59'},
  {v:'3',l:'寅初 03:00-03:59'},{v:'4',l:'寅正 04:00-04:59'},{v:'5',l:'卯初 05:00-05:59'},
  {v:'6',l:'卯正 06:00-06:59'},{v:'7',l:'辰初 07:00-07:59'},{v:'8',l:'辰正 08:00-08:59'},
  {v:'9',l:'巳初 09:00-09:59'},{v:'10',l:'巳正 10:00-10:59'},{v:'11',l:'午初 11:00-11:59'},
  {v:'12',l:'午正 12:00-12:59'},{v:'13',l:'未初 13:00-13:59'},{v:'14',l:'未正 14:00-14:59'},
  {v:'15',l:'申初 15:00-15:59'},{v:'16',l:'申正 16:00-16:59'},{v:'17',l:'酉初 17:00-17:59'},
  {v:'18',l:'酉正 18:00-18:59'},{v:'19',l:'戌初 19:00-19:59'},{v:'20',l:'戌正 20:00-20:59'},
  {v:'21',l:'亥初 21:00-21:59'},{v:'22',l:'亥正 22:00-22:59'},{v:'23',l:'子正 23:00-23:59'},
]

const wxM: Record<string,string> = {甲:'木',乙:'木',丙:'火',丁:'火',戊:'土',己:'土',庚:'金',辛:'金',壬:'水',癸:'水',子:'水',丑:'土',寅:'木',卯:'木',辰:'土',巳:'火',午:'火',未:'土',申:'金',酉:'金',戌:'土',亥:'水'}
const ny: Record<string,string> = {甲子:'海中金',乙丑:'海中金',丙寅:'炉中火',丁卯:'炉中火',戊辰:'大林木',己巳:'大林木',庚午:'路旁土',辛未:'路旁土',壬申:'剑锋金',癸酉:'剑锋金',甲戌:'山头火',乙亥:'山头火',丙子:'涧下水',丁丑:'涧下水',戊寅:'城头土',己卯:'城头土',庚辰:'白蜡金',辛巳:'白蜡金',壬午:'杨柳木',癸未:'杨柳木',甲申:'泉中水',乙酉:'泉中水',丙戌:'屋上土',丁亥:'屋上土',戊子:'霹雳火',己丑:'霹雳火',庚寅:'松柏木',辛卯:'松柏木',壬辰:'长流水',癸巳:'长流水',甲午:'沙中金',乙未:'沙中金',丙申:'山下火',丁酉:'山下火',戊戌:'平地木',己亥:'平地木',庚子:'壁上土',辛丑:'壁上土',壬寅:'金箔金',癸卯:'金箔金',甲辰:'覆灯火',乙巳:'覆灯火',丙午:'天河水',丁未:'天河水',戊申:'大驿土',己酉:'大驿土',庚戌:'钗钏金',辛亥:'钗钏金',壬子:'桑柘木',癸丑:'桑柘木',甲寅:'大溪水',乙卯:'大溪水',丙辰:'沙中土',丁巳:'沙中土',戊午:'天上火',己未:'天上火',庚申:'石榴木',辛酉:'石榴木',壬戌:'大海水',癸亥:'大海水'}
const ssM: Record<string,Record<string,string>> = {甲:{甲:'比肩',乙:'劫财',丙:'食神',丁:'伤官',戊:'偏财',己:'正财',庚:'七杀',辛:'正官',壬:'偏印',癸:'正印'},乙:{甲:'劫财',乙:'比肩',丙:'伤官',丁:'食神',戊:'正财',己:'偏财',庚:'正官',辛:'七杀',壬:'正印',癸:'偏印'},丙:{甲:'偏印',乙:'正印',丙:'比肩',丁:'劫财',戊:'食神',己:'伤官',庚:'偏财',辛:'正财',壬:'七杀',癸:'正官'},丁:{甲:'正印',乙:'偏印',丙:'劫财',丁:'比肩',戊:'伤官',己:'食神',庚:'正财',辛:'偏财',壬:'正官',癸:'七杀'},戊:{甲:'七杀',乙:'正官',丙:'偏印',丁:'正印',戊:'比肩',己:'劫财',庚:'食神',辛:'伤官',壬:'偏财',癸:'正财'},己:{甲:'正官',乙:'七杀',丙:'正印',丁:'偏印',戊:'劫财',己:'比肩',庚:'伤官',辛:'食神',壬:'正财',癸:'偏财'},庚:{甲:'偏财',乙:'正财',丙:'七杀',丁:'正官',戊:'偏印',己:'正印',庚:'比肩',辛:'劫财',壬:'食神',癸:'伤官'},辛:{甲:'正财',乙:'偏财',丙:'正官',丁:'七杀',戊:'正印',己:'偏印',庚:'劫财',辛:'比肩',壬:'伤官',癸:'食神'},壬:{甲:'食神',乙:'伤官',丙:'偏财',丁:'正财',戊:'七杀',己:'正官',庚:'偏印',辛:'正印',壬:'比肩',癸:'劫财'},癸:{甲:'伤官',乙:'食神',丙:'正财',丁:'偏财',戊:'正官',己:'七杀',庚:'正印',辛:'偏印',壬:'劫财',癸:'比肩'}}
const hG: Record<string,string> = {子:'癸',丑:'己',寅:'甲',卯:'乙',辰:'戊',巳:'丙',午:'丁',未:'己',申:'庚',酉:'辛',戌:'戊',亥:'壬'}
const hA: Record<string,string> = {子:'癸',丑:'己癸辛',寅:'甲丙戊',卯:'乙',辰:'戊乙癸',巳:'丙庚戊',午:'丁己',未:'己丁乙',申:'庚壬戊',酉:'辛',戌:'戊辛丁',亥:'壬甲'}
const dD: Record<string,string> = {甲:'甲木为阳木，如参天大树之象。其人性情正直、仁慈宽厚，有领导才干与担当精神。然甲木过旺则固执己见，过弱则缺乏主见。',乙:'乙木为阴木，如花草藤萝之象。其人性格柔韧、善于变通，温和善良且富有同情心。然乙木过旺则善变不专，过弱则意志不坚。',丙:'丙火为阳火，如太阳当空之象。其人热情开朗、慷慨大方，积极进取且乐于助人。然丙火过旺则性急冲动，过弱则缺乏热情。',丁:'丁火为阴火，如灯烛之光。其人细腻含蓄、聪慧灵秀，善于思考且富有洞察力。然丁火过旺则多疑善虑，过弱则魄力不足。',戊:'戊土为阳土，如巍峨高山之象。其人稳重笃实、诚信可靠，胸怀宽广有容人之量。然戊土过旺则固执保守，过弱则缺少主见。',己:'己土为阴土，如田园沃土之象。其人温和谦逊、务实耐心，善解人意而不张扬。然己土过旺则过于保守，过弱则优柔寡断。',庚:'庚金为阳金，如钢铁刀剑之象。其人刚毅果断、意志坚强，好胜心强且富有魄力。然庚金过旺则冲动伤人，过弱则缺少决断。',辛:'辛金为阴金，如珠宝金银之象。其人细腻精致、追求完美，聪明敏锐且注重细节。然辛金过旺则挑剔刻薄，过弱则魄力不足。',壬:'壬水为阳水，如江河大海之象。其人聪慧包容、志向远大，机智灵活且善于变通。然壬水过旺则心性不定，过弱则魄力不足。',癸:'癸水为阴水，如雨露甘泉之象。其人深沉内敛、灵感丰富，直觉敏锐且富有艺术天赋。然癸水过旺则情绪化，过弱则敏感多疑。'}
const zD: Record<string,string> = {鼠:'子鼠年生人，性机敏聪慧，善理财积蓄，然多疑少决。',牛:'丑牛年生人，性稳重踏实，任劳任怨，然固执少变。',虎:'寅虎年生人，性刚毅果敢，胸怀大志，然冲动易怒。',兔:'卯兔年生人，性温和善良，细腻周全，然优柔寡断。',龙:'辰龙年生人，性志向远大，自信豪迈，然刚愎自用。',蛇:'巳蛇年生人，性聪慧机敏，深谋远虑，然多疑善妒。',马:'午马年生人，性热情奔放，积极进取，然急躁冲动。',羊:'未羊年生人，性温和仁慈，善良敦厚，然缺乏主见。',猴:'申猴年生人，性机灵活泼，聪明多智，然喜新厌旧。',鸡:'酉鸡年生人，性精明干练，善于言辞，然好胜心强。',狗:'戌狗年生人，性忠诚正直，仗义执言，然固执不化。',猪:'亥猪年生人，性豁达乐观，随遇而安，然贪图安逸。'}

// ═══════════ 神煞系统 ═══════════
// 天乙贵人：甲戊见牛羊，乙己鼠猴乡，丙丁猪鸡位，壬癸兔蛇藏，庚辛逢虎马
const TIANYI: Record<string,string[]> = {
  甲:['丑','未'],乙:['子','申'],丙:['亥','酉'],丁:['亥','酉'],
  戊:['丑','未'],己:['子','申'],庚:['寅','午'],辛:['寅','午'],
  壬:['卯','巳'],癸:['卯','巳']
}
// 文昌贵人：甲巳乙午丙申，丁酉戊申己酉，庚亥辛子壬寅，癸卯
const WENCHANG: Record<string,string> = {甲:'巳',乙:'午',丙:'申',丁:'酉',戊:'申',己:'酉',庚:'亥',辛:'子',壬:'寅',癸:'卯'}
// 驿马：申子辰马在寅，寅午戌马在申，巳酉丑马在亥，亥卯未马在巳
const YIMA: Record<string,string> = {申:'寅',子:'寅',辰:'寅',寅:'申',午:'申',戌:'申',巳:'亥',酉:'亥',丑:'亥',亥:'巳',卯:'巳',未:'巳'}
// 桃花：申子辰在酉，寅午戌在卯，巳酉丑在午，亥卯未在子
const TAOHUA: Record<string,string> = {申:'酉',子:'酉',辰:'酉',寅:'卯',午:'卯',戌:'卯',巳:'午',酉:'午',丑:'午',亥:'子',卯:'子',未:'子'}
// 羊刃：甲卯乙寅丙午丁巳戊午己巳庚酉辛申壬子癸亥
const YANGREN: Record<string,string> = {甲:'卯',乙:'寅',丙:'午',丁:'巳',戊:'午',己:'巳',庚:'酉',辛:'申',壬:'子',癸:'亥'}
// 华盖：申子辰见辰，寅午戌见戌，巳酉丑见丑，亥卯未见未
const HUAGAI: Record<string,string> = {申:'辰',子:'辰',辰:'辰',寅:'戌',午:'戌',戌:'戌',巳:'丑',酉:'丑',丑:'丑',亥:'未',卯:'未',未:'未'}
// 劫煞：申子辰在巳，寅午戌在亥，巳酉丑在寅，亥卯未在申
const JIESHA: Record<string,string> = {申:'巳',子:'巳',辰:'巳',寅:'亥',午:'亥',戌:'亥',巳:'寅',酉:'寅',丑:'寅',亥:'申',卯:'申',未:'申'}
// 孤辰：亥子丑在寅，寅卯辰在巳，巳午未在申，申酉戌在亥
const GUCHEN: Record<string,string> = {亥:'寅',子:'寅',丑:'寅',寅:'巳',卯:'巳',辰:'巳',巳:'申',午:'申',未:'申',申:'亥',酉:'亥',戌:'亥'}
// 天德贵人（以月支查）
const TIANDE: Record<string,string> = {寅:'丁',卯:'申',辰:'壬',巳:'辛',午:'亥',未:'甲',申:'癸',酉:'寅',戌:'丙',亥:'乙',子:'巳',丑:'庚'}
// 月德贵人（以月支查）
const YUEDE: Record<string,string> = {寅:'丙',卯:'甲',辰:'壬',巳:'庚',午:'丙',未:'甲',申:'壬',酉:'庚',戌:'丙',亥:'甲',子:'壬',丑:'庚'}

function calcShenSha(dg: string, yearZhi: string, monthZhi: string, dayZhi: string): string[] {
  const result: string[] = []
  const allZhi = [yearZhi, monthZhi, dayZhi]
  const allGan = [dg]

  // 天乙贵人
  const ty = TIANYI[dg] || []
  for (const z of allZhi) { if (ty.includes(z)) { result.push(`天乙贵人（${z}）`); break } }

  // 文昌贵人
  const wc = WENCHANG[dg]
  if (wc && allZhi.includes(wc)) result.push(`文昌贵人（${wc}）`)

  // 驿马（以年支或日支查）
  const ym = YIMA[yearZhi]
  if (ym && allZhi.slice(1).includes(ym)) result.push(`驿马（${ym}）`)

  // 桃花
  const th = TAOHUA[yearZhi]
  if (th && allZhi.includes(th)) result.push(`桃花（${th}）`)

  // 羊刃
  const yr = YANGREN[dg]
  if (yr && allZhi.includes(yr)) result.push(`羊刃（${yr}）`)

  // 华盖
  const hg = HUAGAI[yearZhi]
  if (hg && allZhi.includes(hg)) result.push(`华盖（${hg}）`)

  // 劫煞
  const js = JIESHA[yearZhi]
  if (js && allZhi.includes(js)) result.push(`劫煞（${js}）`)

  // 孤辰
  const gc = GUCHEN[yearZhi]
  if (gc && allZhi.includes(gc)) result.push(`孤辰（${gc}）`)

  // 天德（月支查）
  const td = TIANDE[monthZhi]
  if (td && allGan.includes(td)) result.push(`天德贵人`)

  // 月德（月支查）
  const yd = YUEDE[monthZhi]
  if (yd && allGan.includes(yd)) result.push(`月德贵人`)

  return result.length > 0 ? result : ['无特殊神煞']
}

// ═══════════ 《穷通宝鉴》调侯用神 ═══════════
// 格式：日干 + 月份 → 调侯用神描述
const QT: Record<string,Record<number,string>> = {
  甲:{1:'庚金劈木为用，丙火调候为喜。正月余寒未退，非庚不劈，非丙不暖。',2:'庚金七杀为用，丁火泄秀为喜。二月甲木临帝旺，宜庚金雕琢。',3:'先庚后丁，庚金劈木，丁火透干。三月甲木根基渐老。',4:'癸水润木为用，丁火泄秀。巳月火旺，宜癸水调候。',5:'癸丁并用，庚金为佐。午月火旺木渴，癸水为先。',6:'癸水调候为先，庚金为佐。未月燥土当令。',7:'丁火泄秀为先，庚金雕琢为佐。申月金旺之地。',8:'丁火丙火并用，再加庚金劈木引火。酉月金锐。',9:'甲木与庚丁为用。戌月土燥，先壬水润土。',10:'庚丁并用，丁火为先。亥月寒木向阳。',11:'庚丁戊三用，丁火暖局为先。子月天寒地冻。',12:'丁火暖局，庚金劈木。丑月冻土，调候为急。'},
  乙:{1:'丙火暖局，癸水润木。正月余寒未退。',2:'丙火癸水并用。二月乙木逢春。',3:'癸水丙火并用。辰月土旺木渴。',4:'癸水为先，辛金为辅。巳月火炎木渴。',5:'癸水调候，丙火次之。午月火旺。',6:'癸丙并用，以癸为先。未月燥土。',7:'癸水丙火，申月金旺。',8:'癸水辛金，辛杀为用。酉月金锐。',9:'癸辛并用。戌月土燥。',10:'丙戊庚为用。亥月寒木。',11:'丙火为先，暖木为先。子月冰寒。',12:'丙火调候，癸水次之。丑月冻土。'},
  丙:{1:'壬水为先，庚金为佐。寅月初春。',2:'壬水庚金并用。卯月木旺。',3:'壬甲并用。辰月土旺。',4:'壬水为先，庚金发源。巳月火炎。',5:'壬庚并用，壬水为先。午月火旺极。',6:'壬庚并用，水为先。未月燥土。',7:'壬水戊土，壬水为先。申月金多。',8:'壬水为先。酉月金寒。',9:'甲壬并用。戌月燥土。',10:'甲戊庚为用。亥月寒水。',11:'壬戊并用，甲木为辅。子月寒冷。',12:'壬甲并用。丑月寒土。'},
  丁:{1:'甲木庚金为用，甲引丁火。寅月初春。',2:'庚金劈甲引丁。卯月木旺。',3:'甲木为用，庚金为佐。辰月土旺。',4:'甲庚并用。巳月火旺。',5:'壬水调候，庚金发源。午月火旺极。',6:'甲壬庚，壬水为先。未月燥土。',7:'甲庚丙戊。申月金多。',8:'甲庚丙戊。酉月金寒。',9:'甲庚戊。戌月燥土。',10:'甲庚戊。亥月寒水。',11:'甲庚为用。子月冰寒。',12:'甲庚为用。丑月寒土。'},
  戊:{1:'丙火甲木，丙火为先。寅月木当令。',2:'丙甲癸，丙为先。卯月四阳。',3:'甲丙癸，甲为先。辰月土当令。',4:'甲丙癸，甲为先。巳月火旺。',5:'壬甲丙。午月炎燥。',6:'癸甲丙。未月燥土。',7:'丙甲癸。申月金多。',8:'丙癸。酉月金旺。',9:'甲丙癸。戌月燥土。',10:'甲丙。亥月湿土。',11:'丙甲。子月寒冻。',12:'丙甲。丑月冻土。'},
  己:{1:'丙甲庚。寅月木当令。',2:'甲癸丙。卯月木旺。',3:'丙甲癸。辰月土旺。',4:'癸丙辛。巳月火旺。',5:'癸丙。午月燥。',6:'癸丙。未月燥土。',7:'丙癸。申月金多。',8:'丙癸。酉月金旺。',9:'甲丙癸。戌月燥土。',10:'丙甲戊。亥月湿土。',11:'丙戊甲。子月寒冷。',12:'丙戊甲。丑月冻土。'},
  庚:{1:'丙甲丁。寅月木当令。',2:'丁甲庚丙。卯月木旺。',3:'甲丁壬。辰月土旺。',4:'壬丙丁戊。巳月火旺。',5:'壬癸。午月火旺金溶。',6:'丁甲。未月燥土。',7:'丁甲。申月金当令。',8:'丁丙。酉月金旺。',9:'甲壬。戌月燥土。',10:'丁丙。亥月寒水。',11:'丁甲丙。子月寒冷。',12:'丙丁甲。丑月冻土。'},
  辛:{1:'己壬庚。寅月木当令。',2:'壬甲。卯月木旺。',3:'壬甲。辰月土旺。',4:'壬甲癸。巳月火旺金溶。',5:'壬己癸。午月火旺。',6:'壬庚甲。未月燥土。',7:'壬甲。申月金当令。',8:'壬甲。酉月金旺。',9:'壬甲。戌月燥土。',10:'壬丙。亥月寒水。',11:'丙戊壬甲。子月寒冷。',12:'丙壬戊己。丑月冻土。'},
  壬:{1:'庚丙戊。寅月木当令。',2:'戊辛庚。卯月木旺。',3:'甲庚。辰月土旺。',4:'壬辛。巳月火旺水渴。',5:'癸庚辛。午月火炎。',6:'辛甲。未月燥土。',7:'戊丁。申月金生水。',8:'甲庚。酉月金旺。',9:'甲丙。戌月燥土。',10:'戊庚丁。亥月水当令。',11:'戊辛。子月水旺。',12:'丙丁甲。丑月寒冻。'},
  癸:{1:'辛丙。寅月木当令。',2:'庚辛。卯月木旺。',3:'丙辛甲。辰月土旺。',4:'辛。巳月火旺。',5:'庚壬癸。午月火炎。',6:'庚辛。未月燥土。',7:'丁。申月金生水。',8:'辛丙。酉月金旺。',9:'辛甲癸壬。戌月燥土。',10:'庚辛戊丁。亥月水当令。',11:'丙辛。子月寒水。',12:'丙丁。丑月冻土。'},
}

// ═══════════ 日柱五行强度分析 ═══════════
function strength(wx: Record<string,number>, dg: string): { level: string; detail: string } {
  const dw = wxM[dg]; const sheng: Record<string,string> = {木:'水',火:'木',土:'火',金:'土',水:'金'}
  const ke: Record<string,string> = {木:'土',火:'金',土:'水',金:'木',水:'火'}
  let bf = wx[dw] + (wx[sheng[dw]] || 0)
  let level = bf >= 5 ? '身旺' : bf >= 3 ? '中和' : '身弱'
  return { level, detail: `日主${dg}属${dw}，八字中${dw}${wx[dw]}个` }
}

// ═══════════ 命理分析（古籍融合版）═══════════
function fateAnalysis(dg: string, dz: string, wx: Record<string,number>, pillars: any[], zodiac: string, lunar: any, monthZhi: string): string[] {
  const lines: string[] = []
  const dw = wxM[dg]
  const shengWx: Record<string,string> = {木:'水',火:'木',土:'火',金:'土',水:'金'}
  const keWx: Record<string,string> = {木:'土',火:'金',土:'水',金:'木',水:'火'}
  const xieWx: Record<string,string> = {木:'火',火:'土',土:'金',金:'水',水:'木'}
  const yongshen = shengWx[dw]
  const jishen = keWx[dw]
  const xieshen = xieWx[dw]
  const bf = wx[dw] + (wx[yongshen] || 0)
  const kx = (wx[jishen] || 0) + (wx[xieshen] || 0)

  // 日主分析
  lines.push(`【日主】日干${dg}，五行属${dw}。${dD[dg]}`)

  // 五行分布
  const wxSorted = Object.entries(wx).sort((a,b) => b[1]-a[1])
  const wxMax = wxSorted[0]
  lines.push(`【五行】八字以${wxMax[0]}最旺（${wxMax[1]}个），${wxSorted[4][0]}最弱（${wxSorted[4][1]}个）。${wxSorted[4][1]===0?'命局缺'+wxSorted[4][0]+'，宜在后天补救。':''}`)

  // 用神
  if (bf > kx + 2) {
    lines.push(`【用忌】日主偏旺，以${xieshen}（泄秀）、${jishen}（克制）为用神。喜行${xieshen}${jishen}运，忌${yongshen}${dw}运。`)
  } else if (kx > bf + 2) {
    lines.push(`【用忌】日主偏弱，以${yongshen}（生扶）、${dw}（帮扶）为用神。喜行${yongshen}${dw}运，忌${xieshen}${jishen}运。`)
  } else {
    lines.push(`【用忌】日主中和，宜根据大运流年灵活取用。喜${dw}${yongshen}运帮扶。`)
  }

  // ═══ 《穷通宝鉴》调侯 ═══
  const lMonth = lunar.getMonth()
  const qtText = QT[dg]?.[lMonth]
  if (qtText) {
    lines.push(`【《穷通宝鉴》调侯】生于${lMonth}月，${qtText}`)
  }

  // ═══ 《三命通会》月令简批 ═══
  const monthNames = ['','正月','二月','三月','四月','五月','六月','七月','八月','九月','十月','十一月','十二月']
  const monthAnalysis: Record<string,string[]> = {
    '正月':['寅月木当令，阳气渐生，寒木向阳。','调候以丙火为急，庚金为辅。'],
    '二月':['卯月木临帝旺，生机蓬勃。','庚金雕琢为美，丁火泄秀为佳。'],
    '三月':['辰月土旺，木之根基深厚。','先庚后丁，以庚金劈木引火。'],
    '四月':['巳月火旺，木性枯渴。','癸水调候为先，庚金为佐。'],
    '五月':['午月火旺至极，调候为急。','癸丁庚并用，以癸水为急务。'],
    '六月':['未月燥土，木根已老。','癸水调候，庚金雕琢。'],
    '七月':['申月金旺，木被金克。','丁火泄秀炼金，庚金正当令。'],
    '八月':['酉月金锐锋利，木逢金刃。','丁火制金，丙火为佐。'],
    '九月':['戌月燥土，木性将枯。','壬水润土为先，甲木次之。'],
    '十月':['亥月水旺，木得滋润。','庚丁并用，以庚金劈木。'],
    '十一月':['子月天寒地冻，木性受克。','丙火暖局为先，无丙则木不长。'],
    '十二月':['丑月冻土当令，调候为急。','丁火暖局，庚金劈木。'],
  }
  const mName = monthNames[lMonth] || '当月'
  const smAnalysis = monthAnalysis[mName]
  if (smAnalysis) {
    lines.push(`【《三命通会》月令】生于${mName}：${smAnalysis.join('')}`)
  }

  // 十神分析
  const ssList = pillars.map((p: any) => p.ssGan).filter(Boolean)
  const hasGY = ssList.includes('正官') || ssList.includes('七杀')
  const hasCY = ssList.includes('正财') || ssList.includes('偏财')
  const hasSY = ssList.includes('正印') || ssList.includes('偏印')
  if (hasGY) lines.push('【官杀】命带官杀者，事业心强，有管理才能。官杀为喜则仕途顺遂，为忌则有压力是非。')
  if (hasCY) lines.push('【财星】命带财星者，财运亨通。财为喜则经营得利，财为忌则需谨慎投资。')
  if (hasSY) lines.push('【印星】命带印星，学业聪慧。印为喜则学历有成人缘佳，印为忌则思虑过多。')

  // 婚姻
  const ssDz = pillars[2]?.ssZhi
  if (ssDz === '正财' || ssDz === '偏财') lines.push('【婚姻】财星入夫妻宫，配偶贤惠持家。男命得妻财之助。')
  else if (ssDz === '正官' || ssDz === '七杀') lines.push('【婚姻】官星入夫妻宫，配偶有为。女命得夫贵之福。')
  else lines.push('【婚姻】夫妻宫平和，婚姻稳定需互敬互谅。')

  // 四柱落宫
  const ssN = pillars.map((p: any) => p.ssGan)
  if (ssN[0] === '七杀' || ssN[0] === '正官') lines.push('【祖荫】年柱见官杀，祖上或有功名，出身不差。')
  if (ssN[1] === '偏财' || ssN[1] === '正财') lines.push('【父母】月柱见财星，父母有财运或经商背景。')
  if (ssN[3] === '食神' || ssN[3] === '伤官') lines.push('【晚运】时柱见食伤，子女有才华，晚年得享清福。')

  // 生肖
  lines.push(`【生肖】${zodiac}年生。${zD[zodiac] || '性格随和，一生平顺。'}`)

  return lines
}

export default function BaziClient() {
  const { t } = useLocale(); const lang = t as unknown as Record<string, unknown>
  const now = new Date()
  const [cal, setCal] = useState<'solar'|'lunar'>('solar')
  const [year, setYear] = useState(String(now.getFullYear()))
  const [month, setMonth] = useState(String(now.getMonth() + 1))
  const [day, setDay] = useState(String(now.getDate()))
  const [hour, setHour] = useState('11')
  const [gender, setGender] = useState('男')
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')

  const switchCal = (newCal: 'solar'|'lunar') => {
    const y=parseInt(year),m=parseInt(month),d=parseInt(day)
    if (!isNaN(y)&&!isNaN(m)&&!isNaN(d)&&m>=1&&m<=12&&d>=1&&d<=31) {
      try {
        if (newCal==='solar' && cal==='lunar') {
          const lun=Lunar.fromYmd(y,m,d); const sol=lun.getSolar()
          setYear(String(sol.getYear())); setMonth(String(sol.getMonth())); setDay(String(sol.getDay()))
        } else if (newCal==='lunar' && cal==='solar') {
          const sol=Solar.fromYmd(y,m,d); const lun=sol.getLunar()
          setYear(String(lun.getYear())); setMonth(String(lun.getMonth())); setDay(String(lun.getDay()))
        }
      } catch {}
    }
    setCal(newCal)
  }

  const doCalc = () => {
    setError('')
    const y = parseInt(year), m = parseInt(month), d = parseInt(day), h = parseInt(hour)
    if (isNaN(y)||isNaN(m)||isNaN(d)||isNaN(h)||m<1||m>12||d<1||d>31||h<0||h>23){setError('日期无效');return}
    try {
      let ec, solar, lunar
      if (cal === 'lunar') {
        lunar = Lunar.fromYmd(y, m, d)
        const ls = lunar.getSolar()
        solar = Solar.fromYmdHms(ls.getYear(), ls.getMonth(), ls.getDay(), h, 0, 0)
        ec = solar.getLunar().getEightChar()
      } else {
        solar = Solar.fromYmdHms(y, m, d, h, 0, 0)
        lunar = solar.getLunar()
        ec = lunar.getEightChar()
      }
      const dg = ec.getDayGan(), dz = ec.getDayZhi()
      const yearGan = ec.getYearGan(), yearZhi = ec.getYearZhi()
      const monthZhi = ec.getMonthZhi()

      function mk(gz: string, gan: string, zhi: string) {
        const hiddenStems = (hA[zhi] || '').split('')
        const hdSS = hiddenStems.map((hs: string) => {
          const ss = ssM[dg]?.[hs] || ''
          return { gan: hs, ss }
        })
        return {gz, gan, zhi, ny: ny[gz]||'—', wxG: wxM[gan]||'', wxZ: wxM[zhi]||'', hd: hA[zhi]||'—', hdSS, ssG: ssM[dg]?.[gan]||'', ssZ: ssM[dg]?.[hG[zhi]||'']||'' }
      }
      const pills = [
        mk(ec.getYear(), ec.getYearGan(), ec.getYearZhi()),
        mk(ec.getMonth(), ec.getMonthGan(), ec.getMonthZhi()),
        mk(ec.getDay(), dg, dz),
        mk(ec.getTime(), ec.getTimeGan(), ec.getTimeZhi()),
      ]
      const wx: Record<string,number> = {金:0,木:0,水:0,火:0,土:0}
      for (const p of pills) {
        if (wxM[p.gan] && wx[wxM[p.gan]]!==undefined) wx[wxM[p.gan]]++
        for (const c of (hA[p.zhi] || '')) {
          if (wxM[c] && wx[wxM[c]]!==undefined) wx[wxM[c]]++
        }
      }
      const str = strength(wx, dg)
      const zodiac = lunar.getYearShengXiao()

      // 神煞
      const shenSha = calcShenSha(dg, yearZhi, monthZhi, dz)

      // 大运
      const dayun: any[] = []
      try { const yun=ec.getYun(gender==='男'?1:0); const stems=['甲','乙','丙','丁','戊','己','庚','辛','壬','癸']; const branches=['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥']; for(const x of yun.getDaYun()){const gz=x.getGanZhi();if(!gz)continue;const sy=x.getStartYear();const years=[];for(let i=0;i<10;i++){const yy=sy+i;years.push({year:yy,gz:stems[((yy-4)%10+10)%10]+branches[((yy-4)%12+12)%12],age:x.getStartAge()+i})};dayun.push({gz,age:x.getStartAge(),startYear:sy,years})} } catch{}

      const analysis = fateAnalysis(dg, dz, wx, pills, zodiac, lunar, monthZhi)

      setResult({
        cal, dateStr: `${cal==='solar'?`公历${solar.toFullString()}`:`农历${lunar.toFullString()}`} · ${gender}命`,
        bazi: `${pills[0].gz}年 ${pills[1].gz}月 ${pills[2].gz}日 ${pills[3].gz}时`,
        solarStr: `公历${solar.getYear()}年${solar.getMonth()}月${solar.getDay()}日`,
        lunarStr: `农历${lunar.getYearInChinese()}年${lunar.getMonthInChinese()}月${lunar.getDayInChinese()}`,
        pills, wx, dg, str, zodiac, shenSha,
        mingGong: ec.getMingGong(), shenGong: ec.getShenGong(), taiYuan: ec.getTaiYuan(),
        xunKong: ec.getDayXunKong(),
        yearDiShi: ec.getYearDiShi(), monthDiShi: ec.getMonthDiShi(),
        dayDiShi: ec.getDayDiShi(), timeDiShi: ec.getTimeDiShi(),
        dayun, analysis,
      })
    } catch(e){ setError('计算出错，请检查日期') }
  }

  // 十神颜色
  const ssColor = (s: string) => {
    if (!s) return 'text-gray-500'
    if (s.includes('比肩')||s.includes('劫财')) return 'text-blue-300'
    if (s.includes('食神')||s.includes('伤官')) return 'text-green-300'
    if (s.includes('正财')||s.includes('偏财')) return 'text-yellow-300'
    if (s.includes('正官')||s.includes('七杀')) return 'text-red-300'
    if (s.includes('正印')||s.includes('偏印')) return 'text-purple-300'
    return 'text-gray-400'
  }

  return (<div className="max-w-4xl mx-auto px-4 py-10">
    <h1 className="text-3xl font-bold text-gold-400 font-serif mb-3">生辰八字算命</h1>
    <p className="text-gray-400 mb-8">真太阳时排盘 · 神煞详解 · 《穷通宝鉴》调侯 · 《三命通会》月令论断</p>

    {/* 表单 */}
    <div className="bg-dark-800/80 backdrop-blur rounded-xl border border-dark-600 p-6 mb-8">
      <div className="flex gap-3 mb-4">
        <button onClick={()=>switchCal('solar')}
          className={`px-4 py-1.5 rounded-lg text-xs transition-colors ${cal==='solar'?'bg-gold-600 text-dark-900 font-semibold':'bg-dark-700 text-gray-400 border border-dark-600'}`}>公历（阳历）</button>
        <button onClick={()=>switchCal('lunar')}
          className={`px-4 py-1.5 rounded-lg text-xs transition-colors ${cal==='lunar'?'bg-gold-600 text-dark-900 font-semibold':'bg-dark-700 text-gray-400 border border-dark-600'}`}>农历（阴历）</button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-3">
        {[{l:'年',v:year,s:setYear},{l:'月',v:month,s:setMonth},{l:'日',v:day,s:setDay}].map((f,i)=>(
          <div key={i}><label className="block text-xs text-gray-500 mb-1">{f.l}</label>
          <input type="number" value={f.v} onChange={e=>f.s(e.target.value)}
            className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-gray-200 focus:outline-none focus:border-gold-500 text-sm" min={1900} max={2100} /></div>
        ))}
        <div><label className="block text-xs text-gray-500 mb-1">时</label>
          <select value={hour} onChange={e=>setHour(e.target.value)}
            className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-gray-200 text-sm focus:outline-none focus:border-gold-500">
            {hourOpts.map(o=><option key={o.v} value={o.v}>{o.l}</option>)}
          </select>
        </div>
        <div><label className="block text-xs text-gray-500 mb-1">性别</label>
          <select value={gender} onChange={e=>setGender(e.target.value)}
            className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-gray-200 text-sm focus:outline-none focus:border-gold-500">
            <option value="男">男</option><option value="女">女</option>
          </select>
        </div>
      </div>
      {error && <p className="text-xs text-red-400 mb-2">{error}</p>}
      <button onClick={doCalc} className="bg-gold-600 hover:bg-gold-500 text-dark-900 font-semibold px-6 py-2 rounded-lg text-sm transition-colors active:scale-95">开始算命</button>
    </div>

    {result && (<div className="space-y-4">
      {/* 八字概览 */}
      <div className="bg-dark-800/80 backdrop-blur rounded-xl border border-dark-600 p-4 text-center">
        <p className="text-xs text-gray-500 mb-1">{result.dateStr}</p>
        <p className="text-base font-bold text-gold-400 font-serif">{result.bazi}</p>
        <p className="text-xs text-gray-500 mt-1">{result.solarStr} · {result.lunarStr}</p>
      </div>

      {/* 四柱命盘 */}
      <div className="bg-dark-800/80 backdrop-blur rounded-xl border border-dark-600 p-4">
        <h3 className="text-sm font-semibold text-gold-300 font-serif mb-3 text-center">四柱命盘</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead><tr className="bg-dark-700"><th className="p-2 border border-dark-600 text-gray-500 w-20"></th>
              {['年柱','月柱','日柱','时柱'].map((l,i)=><th key={i} className="p-2 border border-dark-600 text-gold-400 font-serif">{l}</th>)}
            </tr></thead>
            <tbody>
              <tr><td className="p-2 border border-dark-600 text-gray-500 bg-dark-700">天干</td>
                {result.pills.map((x:any,i:number)=><td key={i} className="p-2 border border-dark-600 text-center font-bold text-gold-400 font-serif text-base">{x.gan}</td>)}
              </tr>
              <tr><td className="p-2 border border-dark-600 text-gray-500 bg-dark-700">天干十神</td>
                {result.pills.map((x:any,i:number)=><td key={i} className={`p-2 border border-dark-600 text-center font-medium ${ssColor(x.ssG)}`}>{x.ssG}</td>)}
              </tr>
              <tr><td className="p-2 border border-dark-600 text-gray-500 bg-dark-700">地支</td>
                {result.pills.map((x:any,i:number)=><td key={i} className="p-2 border border-dark-600 text-center font-bold text-amber-400 font-serif">{x.zhi}</td>)}
              </tr>
              <tr><td className="p-2 border border-dark-600 text-gray-500 bg-dark-700">地支十神</td>
                {result.pills.map((x:any,i:number)=><td key={i} className={`p-2 border border-dark-600 text-center font-medium text-cyan-300`}>{x.ssZ}</td>)}
              </tr>
              <tr><td className="p-2 border border-dark-600 text-gray-500 bg-dark-700">藏干</td>
                {result.pills.map((x:any,i:number)=><td key={i} className="p-2 border border-dark-600 text-center text-gray-400">{x.hd}</td>)}
              </tr>
              <tr><td className="p-2 border border-dark-600 text-gray-500 bg-dark-700">藏干十神</td>
                {result.pills.map((x:any,i:number)=><td key={i} className="p-2 border border-dark-600 text-center">
                  {x.hdSS?.map((h:any,j:number)=><span key={j} className={ssColor(h.ss)}>{h.gan}({h.ss}){' '}</span>)}
                </td>)}
              </tr>
              <tr><td className="p-2 border border-dark-600 text-gray-500 bg-dark-700">五行</td>
                {result.pills.map((x:any,i:number)=><td key={i} className="p-2 border border-dark-600 text-center">{x.wxG}{x.wxZ}</td>)}
              </tr>
              <tr><td className="p-2 border border-dark-600 text-gray-500 bg-dark-700">纳音</td>
                {result.pills.map((x:any,i:number)=><td key={i} className="p-2 border border-dark-600 text-center text-gray-400">{x.ny}</td>)}
              </tr>
              <tr><td className="p-2 border border-dark-600 text-gray-500 bg-dark-700">十二长生</td>
                {[result.yearDiShi,result.monthDiShi,result.dayDiShi,result.timeDiShi].map((v:any,i:number)=><td key={i} className="p-2 border border-dark-600 text-center text-gray-400">{v}</td>)}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 五行 + 神煞 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="bg-dark-800/80 backdrop-blur rounded-xl border border-dark-600 p-4">
          <h3 className="text-sm font-semibold text-gray-200 mb-3">五行分布</h3>
          <div className="grid grid-cols-5 gap-1.5 mb-3">
            {Object.entries(result.wx).map(([w,c]:any)=>(
              <div key={w} className={`rounded-lg p-2 text-center border border-dark-600 ${w==='金'?'bg-yellow-900/40 text-yellow-300':w==='木'?'bg-green-900/40 text-green-300':w==='水'?'bg-blue-900/40 text-blue-300':w==='火'?'bg-red-900/40 text-red-300':'bg-amber-900/40 text-amber-300'}`}>
                <p className="text-sm font-bold mb-0.5">{w}</p><p className="text-xs text-gray-400">{c}个</p>
              </div>
            ))}
          </div>
          <div className="bg-dark-700 rounded-lg p-3 text-xs space-y-1">
            <p className="text-gray-300">日主{result.dg}属{wxM[result.dg]} · {result.str.level}</p>
          </div>
        </div>
        <div className="bg-dark-800/80 backdrop-blur rounded-xl border border-dark-600 p-4">
          <h3 className="text-sm font-semibold text-gray-200 mb-3">神煞</h3>
          <div className="space-y-1.5">
            {result.shenSha.map((s:string,i:number)=>(
              <span key={i} className={`inline-block text-xs mr-1.5 mb-1 px-2 py-1 rounded ${
                s.includes('天乙')||s.includes('天德')||s.includes('月德')?'bg-gold-900/30 text-gold-300 border border-gold-700/40':
                s.includes('文昌')?'bg-green-900/30 text-green-300 border border-green-700/40':
                s.includes('驿马')?'bg-cyan-900/30 text-cyan-300 border border-cyan-700/40':
                s.includes('桃花')?'bg-pink-900/30 text-pink-300 border border-pink-700/40':
                s.includes('羊刃')||s.includes('劫煞')?'bg-red-900/30 text-red-300 border border-red-700/40':
                s.includes('华盖')?'bg-purple-900/30 text-purple-300 border border-purple-700/40':
                s.includes('孤辰')?'bg-gray-700 text-gray-400 border border-dark-600':
                'bg-dark-700 text-gray-400 border border-dark-600'
              }`}>{s}</span>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-dark-600 grid grid-cols-2 gap-2 text-[10px]">
            <div><span className="text-gray-500">命宫</span><span className="text-gray-300 ml-2">{result.mingGong}</span></div>
            <div><span className="text-gray-500">身宫</span><span className="text-gray-300 ml-2">{result.shenGong}</span></div>
            <div><span className="text-gray-500">胎元</span><span className="text-gray-300 ml-2">{result.taiYuan}</span></div>
            <div><span className="text-gray-500">旬空</span><span className="text-gray-300 ml-2">{result.xunKong}</span></div>
          </div>
        </div>
      </div>

      {/* 命理批断 */}
      <div className="bg-dark-800/80 backdrop-blur rounded-xl border border-gold-500/30 p-4">
        <h3 className="text-sm font-semibold text-gold-300 mb-3">📜 命理批断</h3>
        <div className="space-y-2">
          {result.analysis.map((line:string,i:number)=>(
            <p key={i} className={`text-xs leading-relaxed ${line.startsWith('【《')?'text-amber-300 font-medium':line.startsWith('【用忌')?'text-blue-300':'text-gray-300'}`}>{line}</p>
          ))}
        </div>
      </div>

      {/* 大运 */}
      {result.dayun.length > 0 && (<div className="bg-dark-800/80 backdrop-blur rounded-xl border border-dark-600 p-4">
        <h3 className="text-sm font-semibold text-gray-200 mb-3">十年大运 · 逐年流年</h3>
        <div className="space-y-3">
          {result.dayun.map((dy:any,i:number)=>(
            <div key={i}>
              <p className="text-xs text-gold-400 font-serif font-semibold mb-1.5">{dy.gz}运（{dy.age}~{dy.age+9}岁）</p>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-1">
                {dy.years?.map((y:any,j:number)=>(
                  <span key={j} className="text-[11px] px-2 py-1 rounded border bg-dark-700 border-dark-600 hover:border-gold-500/50 transition-colors text-center">
                    <span className="text-gray-400">{y.year}</span> <span className="text-amber-300 font-serif">{y.gz}</span> <span className="text-gray-500">({y.age}岁)</span>
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>)}
    </div>)}
  </div>)
}
