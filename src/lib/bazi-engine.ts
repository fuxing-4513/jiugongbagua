// bazi-engine.ts — Shared Bazi calculation engine
// Extracted from BaziClient.tsx
// 神煞实现统一来自 ./bazi-shensha（2026-08-31，消除与 /bazi 页面的差异）
import { calcPillarShenSha, mergeShenSha, getPillarShenShaLabel } from './bazi-shensha'
export { calcPillarShenSha, mergeShenSha, getPillarShenShaLabel }

export interface PillarInfo {
  gz: string; gan: string; zhi: string;
  ny: string; wxG: string; wxZ: string;
  hd: string; hdSS: { gan: string; ss: string }[];
  ssG: string; ssZ: string;
}

export interface ShenShaItem { name: string; type: '吉'|'凶'|'中性'; meaning: string; resolve?: string }
export interface PillarShenSha { pillarName: string; items: { name: string; type: '吉'|'凶'|'中性' }[] }

export interface BaziChartResult {
  pills: PillarInfo[];
  wx: Record<string,number>;
  dg: string;
  str: { level: string; detail: string };
  zodiac: string;
  shenSha: ShenShaItem[];
  pillarShenSha: PillarShenSha[];
  dayun: { gz: string; age: number; startYear: number }[];
  analysis: {
    general: string[];
    classical: string[];
    personality: string;
    love: string;
    career: string;
    wealth: string;
    other: string[];
  };
  curAge: number;
  birthYear: number;
  baziStr: string;
}

// === Constants ===

export const wxM: Record<string,string> = {甲:'木',乙:'木',丙:'火',丁:'火',戊:'土',己:'土',庚:'金',辛:'金',壬:'水',癸:'水',子:'水',丑:'土',寅:'木',卯:'木',辰:'土',巳:'火',午:'火',未:'土',申:'金',酉:'金',戌:'土',亥:'水'}
export const ny: Record<string,string> = {甲子:'海中金',乙丑:'海中金',丙寅:'炉中火',丁卯:'炉中火',戊辰:'大林木',己巳:'大林木',庚午:'路旁土',辛未:'路旁土',壬申:'剑锋金',癸酉:'剑锋金',甲戌:'山头火',乙亥:'山头火',丙子:'涧下水',丁丑:'涧下水',戊寅:'城头土',己卯:'城头土',庚辰:'白蜡金',辛巳:'白蜡金',壬午:'杨柳木',癸未:'杨柳木',甲申:'泉中水',乙酉:'泉中水',丙戌:'屋上土',丁亥:'屋上土',戊子:'霹雳火',己丑:'霹雳火',庚寅:'松柏木',辛卯:'松柏木',壬辰:'长流水',癸巳:'长流水',甲午:'沙中金',乙未:'沙中金',丙申:'山下火',丁酉:'山下火',戊戌:'平地木',己亥:'平地木',庚子:'壁上土',辛丑:'壁上土',壬寅:'金箔金',癸卯:'金箔金',甲辰:'覆灯火',乙巳:'覆灯火',丙午:'天河水',丁未:'天河水',戊申:'大驿土',己酉:'大驿土',庚戌:'钗钏金',辛亥:'钗钏金',壬子:'桑柘木',癸丑:'桑柘木',甲寅:'大溪水',乙卯:'大溪水',丙辰:'沙中土',丁巳:'沙中土',戊午:'天上火',己未:'天上火',庚申:'石榴木',辛酉:'石榴木',壬戌:'大海水',癸亥:'大海水'}
export const ssM: Record<string,Record<string,string>> = {甲:{甲:'比肩',乙:'劫财',丙:'食神',丁:'伤官',戊:'偏财',己:'正财',庚:'七杀',辛:'正官',壬:'偏印',癸:'正印'},乙:{甲:'劫财',乙:'比肩',丙:'伤官',丁:'食神',戊:'正财',己:'偏财',庚:'正官',辛:'七杀',壬:'正印',癸:'偏印'},丙:{甲:'偏印',乙:'正印',丙:'比肩',丁:'劫财',戊:'食神',己:'伤官',庚:'偏财',辛:'正财',壬:'七杀',癸:'正官'},丁:{甲:'正印',乙:'偏印',丙:'劫财',丁:'比肩',戊:'伤官',己:'食神',庚:'正财',辛:'偏财',壬:'正官',癸:'七杀'},戊:{甲:'七杀',乙:'正官',丙:'偏印',丁:'正印',戊:'比肩',己:'劫财',庚:'食神',辛:'伤官',壬:'偏财',癸:'正财'},己:{甲:'正官',乙:'七杀',丙:'正印',丁:'偏印',戊:'劫财',己:'比肩',庚:'伤官',辛:'食神',壬:'正财',癸:'偏财'},庚:{甲:'偏财',乙:'正财',丙:'七杀',丁:'正官',戊:'偏印',己:'正印',庚:'比肩',辛:'劫财',壬:'食神',癸:'伤官'},辛:{甲:'正财',乙:'偏财',丙:'正官',丁:'七杀',戊:'正印',己:'偏印',庚:'劫财',辛:'比肩',壬:'伤官',癸:'食神'},壬:{甲:'食神',乙:'伤官',丙:'偏财',丁:'正财',戊:'七杀',己:'正官',庚:'偏印',辛:'正印',壬:'比肩',癸:'劫财'},癸:{甲:'伤官',乙:'食神',丙:'正财',丁:'偏财',戊:'正官',己:'七杀',庚:'正印',辛:'偏印',壬:'劫财',癸:'比肩'}}
export const hG: Record<string,string> = {子:'癸',丑:'己',寅:'甲',卯:'乙',辰:'戊',巳:'丙',午:'丁',未:'己',申:'庚',酉:'辛',戌:'戊',亥:'壬'}
export const hA: Record<string,string> = {子:'癸',丑:'己癸辛',寅:'甲丙戊',卯:'乙',辰:'戊乙癸',巳:'丙庚戊',午:'丁己',未:'己丁乙',申:'庚壬戊',酉:'辛',戌:'戊辛丁',亥:'壬甲'}

export const wxPersonality: Record<string,{positive:string;negative:string;style:string}> = {
  木:{positive:'仁慈宽厚、正直善良，有领导才能和担当精神。性情温和而不失原则，如参天大树般正直向上。',negative:'固执己见、缺乏变通，有时过于理想主义而不切实际。',style:'木主仁，其性直，其情和。外观清秀，骨格修长，有慈悲恻隐之心。'},
  火:{positive:'热情开朗、慷慨大方，积极进取且乐于助人。性情豪爽，待人真诚，如阳光般温暖人心。',negative:'性急冲动、缺乏耐心，容易三分钟热度，有时锋芒太露招人嫉妒。',style:'火主礼，其性急，其情恭。外观威仪，面色红润，待人彬彬有礼但内心刚烈。'},
  土:{positive:'稳重笃实、诚信可靠，胸怀宽广有容人之量。性情温和敦厚，做事踏实不浮夸。',negative:'保守固执、缺乏创新，有时做事拖沓不够果断。',style:'土主信，其性重，其情厚。外观敦厚，腰圆背阔，言必信行必果。'},
  金:{positive:'刚毅果断、意志坚强，好胜心强且富有魄力。性情刚直，做事雷厉风行不拖泥带水。',negative:'冲动急躁、易得罪人，有时过于刚烈不知变通。',style:'金主义，其性刚，其情烈。外观骨肉匀停，面色白净，为人慷慨讲义气。'},
  水:{positive:'聪慧包容、志向远大，机智灵活善于变通。性情深沉内敛，如渊似海有容人之量。',negative:'心性不定、容易动摇，有时过于圆滑让人捉摸不透。',style:'水主智，其性聪，其情善。外观丰腴，面色黑亮，头脑灵活足智多谋。'},
}

const QT: Record<string,Record<number,string>> = {
  甲:{1:'正月余寒未退。庚金劈木为用，丙火调候为喜，非丙不暖，非庚不劈。',2:'二月甲临帝旺。庚金七杀雕琢为用，丁火泄秀为美，庚丁两透大贵之格。',3:'三月木老根深。先庚后丁，庚金劈木引火，丁火泄秀。',4:'巳月火旺木渴。癸水润木为用，丁火泄秀，庚金为佐。',5:'午月火旺焚木。癸丁并用，癸水调候为先，无癸则木自焚。',6:'未月燥土当令。癸水调候为先，庚金为辅。',7:'申月金旺克木。丁火泄秀制金为用，庚金当令可为佐。',8:'酉月金锐木伤。丁火丙火并用，庚金劈木引火。',9:'戌月土燥木枯。先壬水润土，再用甲木庚金。',10:'亥月水旺木湿。庚丁并用，丁火暖局为先。',11:'子月天寒地冻。丁火暖局，庚金劈木，寒木向阳方有生机。',12:'丑月冻土当令。丁火暖局为急，庚金劈木次之。'},
  乙:{1:'正月余寒未退。丙火暖局为主，癸水润木为辅。',2:'二月乙木逢春。丙火癸水并用，以丙火泄秀为先。',3:'辰月土旺木渴。癸水润土，丙火泄秀为美。',4:'巳月火炎木渴。癸水为先，辛金七杀为佐。',5:'午月火旺之极。癸水调候，丙火次之。',6:'未月燥土克水。癸丙并用，以癸水调候为先。',7:'申月金旺克木。癸水化金生木，丙火泄秀。',8:'酉月金锐锋锐。癸水泄金生木，辛金七杀可借力。',9:'戌月土燥木枯。癸辛并用，先癸后辛。',10:'亥月寒木向暖。丙火戊土为用，以丙暖木为先。',11:'子月冰寒水冷。丙火暖局为第一要务。',12:'丑月冻土寒木。丙火调候，癸水次之。'},
  丙:{1:'寅月木旺火相。壬水为先，庚金为佐。',2:'卯月木旺生火。壬水庚金并用。',3:'辰月土旺晦火。壬甲并用，壬水为先。',4:'巳月火炎土燥。壬水为先，庚金发源。',5:'午月火旺至极。壬庚并用，以壬水调候为急。',6:'未月燥土晦火。壬庚并用，水为先。',7:'申月金多火熄。壬水戊土，以壬水调候为先。',8:'酉月金旺火衰。壬水为先。',9:'戌月燥土晦火。甲壬并用。',10:'亥月水旺克火。甲木戊土为用。',11:'子月水冷火熄。壬戊并用，甲木为辅。',12:'丑月寒土困火。壬甲并用。'},
  丁:{1:'寅月木旺火相。甲木引丁火，庚金劈甲为贵。',2:'卯月木旺火炽。庚金劈甲引丁。',3:'辰月土旺晦火。甲木为用，庚金为佐。',4:'巳月火炎土燥。甲庚并用。',5:'午月火旺极。壬水调候，庚金发源。',6:'未月燥土晦丁。甲壬庚，壬水为先。',7:'申月金旺火褪。甲庚丙戊为用。',8:'酉月金旺火晦。甲庚丙戊并用。',9:'戌月燥土困火。甲庚戊，以甲木疏土为先。',10:'亥月寒水克火。甲庚戊并用。',11:'子月寒气逼人。甲庚为用。',12:'丑月冻土寒冰。甲庚为用，丙火暖局。'},
  戊:{1:'寅月木当令克土。丙火甲木，以丙火化木生土为先。',2:'卯月木旺土死。丙甲癸并用。',3:'辰月土当令。甲丙癸，以甲木疏土为先。',4:'巳月火旺土燥。甲丙癸，甲木为先。',5:'午月火旺土焦。壬甲丙，壬水调候为先。',6:'未月燥土厚重。癸甲丙，癸水调候为先。',7:'申月金旺泄土。丙甲癸，丙火为先。',8:'酉月金旺泄土。丙癸为用。',9:'戌月燥土当令。甲丙癸，甲木疏土为先。',10:'亥月水旺湿土。丙甲并用。',11:'子月寒水冻土。丙甲并用。',12:'丑月冻土寒冰。丙甲并用。'},
  己:{1:'寅月木旺克土。丙甲庚并用。',2:'卯月木旺土死。甲癸丙。',3:'辰月土旺湿厚。丙甲癸，丙火暖土为先。',4:'巳月火炎土燥。癸丙辛，癸水调候为先。',5:'午月火旺土焦。癸丙并用。',6:'未月燥土当令。癸丙并用。',7:'申月金旺泄土。丙癸并用。',8:'酉月金旺泄土。丙癸并用。',9:'戌月燥土厚重。甲丙癸，甲木为先。',10:'亥月水旺湿土。丙甲戊，丙火为先。',11:'子月寒水冻土。丙戊甲。',12:'丑月冻土寒冰。丙戊甲。'},
  庚:{1:'寅月木旺金囚。丙甲丁，以丙火暖金为先。',2:'卯月木旺金衰。丁甲庚丙。',3:'辰月土旺生金。甲丁壬，甲木疏土为先。',4:'巳月火旺金熔。壬丙丁戊，以壬水调候为先。',5:'午月火炎金熔。壬癸为用。',6:'未月燥土生金。丁甲为用。',7:'申月金当令。丁甲为用，丁火炼金为利器。',8:'酉月金旺极。丁丙并用。',9:'戌月燥土埋金。甲壬并用。',10:'亥月水冷金寒。丁丙并用。',11:'子月冰寒金凝。丁甲丙并用。',12:'丑月冻土金埋。丙丁甲。'},
  辛:{1:'寅月木旺金囚。己壬庚，以己土生金为先。',2:'卯月木旺金衰。壬甲并用。',3:'辰月土旺金埋。壬甲并用。',4:'巳月火旺金熔。壬甲癸，壬水调候为先。',5:'午月火炎金熔。壬己癸。',6:'未月燥土生金。壬庚甲，壬水调候。',7:'申月金当令。壬甲并用。',8:'酉月金旺极。壬甲并用。',9:'戌月燥土埋金。壬甲并用。',10:'亥月水冷金寒。壬丙为用。',11:'子月冰寒水冷。丙戊壬甲。',12:'丑月冻土埋金。丙壬戊己。'},
  壬:{1:'寅月木旺泄水。庚丙戊，以庚金发源为先。',2:'卯月木旺水衰。戊辛庚。',3:'辰月水库当令。甲庚并用。',4:'巳月火旺水渴。壬辛为用，辛金发源。',5:'午月火旺水衰。癸庚辛。',6:'未月燥土克水。辛甲为用。',7:'申月金旺生水。戊丁为用。',8:'酉月金旺生水。甲庚并用。',9:'戌月燥土克水。甲丙并用。',10:'亥月水当令旺。戊庚丁，戊土为先。',11:'子月水旺极。戊辛为用。',12:'丑月寒水凝冰。丙丁甲。'},
  癸:{1:'寅月木旺泄水。辛丙并用，辛金发源为先。',2:'卯月木旺水衰。庚辛并用。',3:'辰月水库当令。丙辛甲，丙火暖水为先。',4:'巳月火旺水枯。辛金为用。',5:'午月火炎水涸。庚壬癸。',6:'未月燥土克水。庚辛并用。',7:'申月金旺生水。丁火为用。',8:'酉月金旺生水。辛丙并用。',9:'戌月燥土克水。辛甲癸壬。',10:'亥月水当令。庚辛戊丁。',11:'子月水冷冰寒。丙辛并用。',12:'丑月冻水成冰。丙丁为用。'},
}

// === Strength & Analysis ===

export function strength(wx: Record<string,number>, dg: string): { level: string; detail: string } {
  const dw = wxM[dg]; const sheng: Record<string,string> = {木:'水',火:'木',土:'火',金:'土',水:'金'}
  const bf = wx[dw] + (wx[sheng[dw]] || 0)
  return { level: bf >= 5 ? '身旺' : bf >= 3 ? '中和' : '身弱', detail: `日主${dg}属${dw}` }
}

export function comprehensiveAnalysis(dg: string, dz: string, wx: Record<string,number>, pills: PillarInfo[], zodiac: string, lunar: { getMonth(): number }, monthZhi: string, shenSha: ShenShaItem[], gender: string) {
  const dw = wxM[dg]
  const shengWx: Record<string,string> = {木:'水',火:'木',土:'火',金:'土',水:'金'}
  const keWx: Record<string,string> = {木:'土',火:'金',土:'水',金:'木',水:'火'}
  const xieWx: Record<string,string> = {木:'火',火:'土',土:'金',金:'水',水:'木'}
  const yongshen = shengWx[dw]; const jishen = keWx[dw]; const xieshen = xieWx[dw]
  const bf = wx[dw] + (wx[yongshen] || 0); const kx = (wx[jishen] || 0) + (wx[xieshen] || 0)
  const wxSorted = Object.entries(wx).sort((a,b) => b[1]-a[1])
  const wxMax = wxSorted[0]
  const lMonth = lunar.getMonth()
  const monthNames = ['','正月','二月','三月','四月','五月','六月','七月','八月','九月','十月','十一月','十二月']
  const mName = monthNames[lMonth] || '当月'
  const ssN = pills.map(p => p.ssG)

  const general: string[] = []
  general.push(`日干${dg}，五行属${dw}，名曰「${ny[pills[2].gz] || dw}」。${wxSorted[4][1]===0?'命局缺'+wxSorted[4][0]+'，宜在后天补益。':''}八字中${wxMax[0]}最旺（${wxMax[1]}个）、${wxSorted[4][0]}最弱（${wxSorted[4][1]}个）。`)
  if (bf > kx + 2) general.push(`日主偏旺，以${xieshen}（泄秀）、${jishen}（克制）为用神。`)
  else if (kx > bf + 2) general.push(`日主偏弱，以${yongshen}（生扶）、${dw}（帮扶）为用神。`)
  else general.push(`日主中和，宜根据大运流年灵活取用。`)

  const classical: string[] = []
  const qtText = QT[dg]?.[lMonth]
  if (qtText) classical.push(`《穷通宝鉴》云：生于${lMonth}月，${qtText}`)
  classical.push(`《三命通会》曰：生于${mName}，日主${dg}属${dw}。`)

  const wp = wxPersonality[dw]
  const bjCount = ssN.filter((s:string) => s === '比肩' || s === '劫财').length
  const sslCount = ssN.filter((s:string) => s === '食神' || s === '伤官').length
  const cxCount = ssN.filter((s:string) => s === '正财' || s === '偏财').length
  const gsCount = ssN.filter((s:string) => s === '正官' || s === '七杀').length
  const yxCount = ssN.filter((s:string) => s === '正印' || s === '偏印').length
  const ssPersonality: string[] = []
  if (bjCount >= 2) ssPersonality.push('比劫旺，独立自主，竞争意识强')
  if (sslCount >= 2) ssPersonality.push('食伤旺，才华横溢，富于创造')
  if (cxCount >= 2) ssPersonality.push('财星旺，务实精明，善于理财')
  if (gsCount >= 2) ssPersonality.push('官杀旺，自律严谨，有领导才能')
  if (yxCount >= 2) ssPersonality.push('印星旺，温文尔雅，知书达理')
  let personality = `日主${dg}属${dw}。${wp.positive}${wp.style}`
  if (bf > kx + 2) personality += `身旺，${wp.negative}`
  else if (kx > bf + 2) personality += `身弱，性子偏软，容易犹豫。`
  else personality += `中和之命，性格刚柔并济。`
  if (ssPersonality.length > 0) personality += ` 十神方面：${ssPersonality.join('；')}。`

  const riZhiSS = pills[2]?.ssZ
  const hasTH = shenSha.some(s => s.name.includes('桃花'))
  const hasGC = shenSha.some(s => s.name.includes('孤辰'))
  let love = ''
  if (gender === '男') {
    if (cxCount >= 2) love += '财星旺，异性缘佳，易得贤妻。'
    else if (cxCount === 0) love += '财星不显，感情方面较为被动。'
    else love += '财星有度，感情运势平稳。'
    if (riZhiSS === '正财' || riZhiSS === '偏财') love += '财星入夫妻宫，配偶贤惠。'
    else if (riZhiSS === '正官' || riZhiSS === '七杀') love += '官杀入夫妻宫，配偶较有主见。'
    else love += '夫妻宫平和，婚姻需共同经营。'
  } else {
    if (gsCount >= 2) love += '官杀旺，异性缘佳，夫君有为。'
    else if (gsCount === 0) love += '官杀不显，姻缘较迟。'
    else love += '官星有度，婚姻运势平稳。'
    if (riZhiSS === '正官' || riZhiSS === '七杀') love += '官星入夫妻宫，夫贵妻荣。'
    else if (riZhiSS === '正财' || riZhiSS === '偏财') love += '财星入夫妻宫，配偶经济好。'
    else love += '夫妻宫平和。'
  }
  if (hasTH) love += ' 桃花入命，情路多姿多彩。'
  if (hasGC) love += ' 孤辰入命，感情偏晚成。'

  const hasCY = cxCount > 0; const hasGY = gsCount > 0
  const hasSY = yxCount > 0; const hasSS = sslCount > 0
  let career = ''
  if (hasGY && hasSY) career += '官印相生，贵格。宜公务员、事业单位、教育科研。'
  else if (hasSS && hasCY) career += '食伤生财，富格。宜经商、创业、自由职业。'
  else if (hasGY) career += '官杀旺，宜管理、军警、司法等工作。'
  else if (hasCY) career += '财星旺，宜经商投资、金融贸易。'
  else if (hasSY) career += '印星旺，宜文教科研、出版文化。'
  else if (hasSS) career += '食伤旺，宜艺术设计、演艺创作。'
  else career += '八字平和，宜稳定职业。'

  let wealth = ''
  if (cxCount >= 2) wealth += '财星旺，财运亨通，正财偏财皆旺。'
  else if (cxCount === 1) wealth += '财星有度，财运平稳增长。'
  else if (hasSS) wealth += '食伤生财之意，宜以才华技艺谋财。'
  else if (hasSY) wealth += '印星护身，宜稳健理财。'
  else wealth += '财运平稳，宜量入为出。'

  const other: string[] = []
  if (ssN[0] === '七杀' || ssN[0] === '正官') other.push('【祖荫】年柱见官杀，祖上或有功名。')
  if (ssN[1] === '偏财' || ssN[1] === '正财') other.push('【父母】月柱见财星，父母有财运或经商背景。')
  if (ssN[3] === '食神' || ssN[3] === '伤官') other.push('【晚运】时柱见食伤，子女有才华，晚年享福。')

  return { general, classical, personality, love, career, wealth, other }
}

// === Main Compute Function ===

export function computeBaziChart(params: { tg: string[]; dz: string[]; birthYear: number; gender: string }): BaziChartResult {
  const { tg, dz, birthYear, gender } = params;
  const dg = tg[2];

  function mk(gz: string, gan: string, zhi: string): PillarInfo {
    const hdStems = (hA[zhi] || '').split('')
    const hdSS = hdStems.map(hs => ({ gan: hs, ss: ssM[dg]?.[hs] || '' }))
    return {gz, gan, zhi, ny: ny[gz]||'—', wxG: wxM[gan]||'', wxZ: wxM[zhi]||'', hd: hA[zhi]||'—', hdSS, ssG: ssM[dg]?.[gan]||'', ssZ: ssM[dg]?.[hG[zhi]||'']||''}
  }

  const pills = [mk(tg[0]+dz[0], tg[0], dz[0]), mk(tg[1]+dz[1], tg[1], dz[1]), mk(tg[2]+dz[2], tg[2], dz[2]), mk(tg[3]+dz[3], tg[3], dz[3])]

  const wx: Record<string,number> = {金:0,木:0,水:0,火:0,土:0}
  for (const p of pills) {
    if (wxM[p.gan] && wx[wxM[p.gan]]!==undefined) wx[wxM[p.gan]]++
    for (const c of (hA[p.zhi] || '')) { if (wxM[c] && wx[wxM[c]]!==undefined) wx[wxM[c]]++ }
  }

  const str = strength(wx, dg)
  const pillarShenSha = calcPillarShenSha(tg, dz, dg, dz[2], tg[2]+dz[2]);
  const shenSha = mergeShenSha(pillarShenSha)
  const zodiac = ['鼠','牛','虎','兔','龙','蛇','马','羊','猴','鸡','狗','猪'][((birthYear - 4) % 12 + 12) % 12]
  const lunar = { getYear: () => birthYear, getMonth: () => 1, getDay: () => 1, getYearShengXiao: () => zodiac, toFullString: () => '', getYearInChinese: () => '', getMonthInChinese: () => '', getDayInChinese: () => '' }
  const analysis = comprehensiveAnalysis(dg, dz[2], wx, pills, zodiac, lunar, dz[1], shenSha, gender)

  const tgIdx = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'].indexOf(tg[0])
  const isYang = tgIdx % 2 === 0
  const forward = (isYang && gender === '男') || (!isYang && gender === '女')
  const stems = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸']
  const branches = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥']
  let mTgIdx = stems.indexOf(tg[1]), mDzIdx = branches.indexOf(dz[1])
  const dayunArr: { gz: string; age: number; startYear: number }[] = []
  for (let step = 0; step < 8; step++) {
    if (forward) { mTgIdx = (mTgIdx + 1) % 10; mDzIdx = (mDzIdx + 1) % 12 }
    else { mTgIdx = (mTgIdx + 9) % 10; mDzIdx = (mDzIdx + 11) % 12 }
    dayunArr.push({ gz: stems[mTgIdx] + branches[mDzIdx], age: 3 + step * 10, startYear: birthYear + 3 + step * 10 })
  }

  return { pills, wx, dg, str, zodiac, shenSha, pillarShenSha, dayun: dayunArr, analysis,
    curAge: new Date().getFullYear() - birthYear, birthYear,
    baziStr: tg[0]+dz[0]+'年 '+tg[1]+dz[1]+'月 '+tg[2]+dz[2]+'日 '+tg[3]+dz[3]+'时' }
}
