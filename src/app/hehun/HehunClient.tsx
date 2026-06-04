'use client'
import { useState, useCallback } from 'react'
import { Solar, Lunar, LunarYear } from 'lunar-typescript'
import { getMaxDay } from '@/components/CalendarInput'
import CalendarInput, { type CalendarType } from '@/components/CalendarInput'

// ── 五行基础 ──
const WX_TG: Record<string, string> = {甲:'木',乙:'木',丙:'火',丁:'火',戊:'土',己:'土',庚:'金',辛:'金',壬:'水',癸:'水'}
const WX_DZ: Record<string, string> = {子:'水',丑:'土',寅:'木',卯:'木',辰:'土',巳:'火',午:'火',未:'土',申:'金',酉:'金',戌:'土',亥:'水'}
const WXC: Record<string, string> = {木:'text-green-400',火:'text-red-400',土:'text-yellow-400',金:'text-gray-300',水:'text-blue-400'}
const WXBG: Record<string, string> = {木:'bg-green-900/40 border-green-500/30',火:'bg-red-900/40 border-red-500/30',土:'bg-amber-900/40 border-amber-500/30',金:'bg-gray-800/40 border-gray-500/30',水:'bg-blue-900/40 border-blue-500/30'}
const WXBAR: Record<string, string> = {木:'from-green-400 to-green-600',火:'from-red-400 to-red-600',土:'from-amber-400 to-amber-600',金:'from-yellow-400 to-yellow-600',水:'from-blue-400 to-blue-600'}
const SHENG: Record<string, string> = {木:'火',火:'土',土:'金',金:'水',水:'木'}
const KE: Record<string, string> = {木:'土',土:'水',水:'火',火:'金',金:'木'}

// ── 纳音 ──
const NAYIN: Record<string, string> = {
 甲子:'海中金',乙丑:'海中金',丙寅:'炉中火',丁卯:'炉中火',戊辰:'大林木',己巳:'大林木',
 庚午:'路旁土',辛未:'路旁土',壬申:'剑锋金',癸酉:'剑锋金',甲戌:'山头火',乙亥:'山头火',
 丙子:'涧下水',丁丑:'涧下水',戊寅:'城头土',己卯:'城头土',庚辰:'白蜡金',辛巳:'白蜡金',
 壬午:'杨柳木',癸未:'杨柳木',甲申:'泉中水',乙申:'泉中水',丙戌:'屋上土',丁亥:'屋上土',
 戊子:'霹雳火',己丑:'霹雳火',庚寅:'松柏木',辛卯:'松柏木',壬辰:'长流水',癸巳:'长流水',
 甲午:'沙中金',乙未:'沙中金',丙申:'山下火',丁酉:'山下火',戊戌:'平地木',己亥:'平地木',
 庚子:'壁上土',辛丑:'壁上土',壬寅:'金箔金',癸卯:'金箔金',甲辰:'覆灯火',乙巳:'覆灯火',
 丙午:'天河水',丁未:'天河水',戊申:'大驿土',己酉:'大驿土',庚戌:'钗钏金',辛亥:'钗钏金',
 壬子:'桑柘木',癸丑:'桑柘木',甲寅:'大溪水',乙卯:'大溪水',丙辰:'沙中土',丁巳:'沙中土',
 戊午:'天上火',己未:'天上火',庚申:'石榴木',辛酉:'石榴木',壬戌:'大海水',癸亥:'大海水'
}

// ── 藏干 ──
const CANG: Record<string, string> = {
 子:'癸',丑:'己癸辛',寅:'甲丙戊',卯:'乙',辰:'戊乙癸',巳:'丙戊庚',
 午:'丁己',未:'己丁乙',申:'庚壬戊',酉:'辛',戌:'戊辛丁',亥:'壬甲'
}// ── 生肖 ──
const SX = ['鼠','牛','虎','兔','龙','蛇','马','羊','猴','鸡','狗','猪']
const SHENGXIAO: Record<string, {liuhe:string;sanhe:string[];chong:string;hai:string;po:string}> = {
 鼠:{liuhe:'牛',sanhe:['猴','龙'],chong:'马',hai:'羊',po:'兔'},
 牛:{liuhe:'鼠',sanhe:['蛇','鸡'],chong:'羊',hai:'马',po:'龙'},
 虎:{liuhe:'猪',sanhe:['马','狗'],chong:'猴',hai:'蛇',po:'牛'},
 兔:{liuhe:'狗',sanhe:['猪','羊'],chong:'鸡',hai:'龙',po:'鼠'},
 龙:{liuhe:'鸡',sanhe:['鼠','猴'],chong:'狗',hai:'兔',po:'牛'},
 蛇:{liuhe:'猴',sanhe:['牛','鸡'],chong:'猪',hai:'虎',po:'羊'},
 马:{liuhe:'羊',sanhe:['虎','狗'],chong:'鼠',hai:'牛',po:'兔'},
 羊:{liuhe:'马',sanhe:['猪','兔'],chong:'牛',hai:'鼠',po:'蛇'},
 猴:{liuhe:'蛇',sanhe:['鼠','龙'],chong:'虎',hai:'猪',po:'兔'},
 鸡:{liuhe:'龙',sanhe:['牛','蛇'],chong:'兔',hai:'狗',po:'马'},
 狗:{liuhe:'兔',sanhe:['虎','马'],chong:'龙',hai:'鸡',po:'牛'},
 猪:{liuhe:'虎',sanhe:['兔','羊'],chong:'蛇',hai:'猴',po:'狗'}
}

// ── 地支六合三合相冲相刑 ──
const DZ_LIUHE: Record<string, string> = {子:'丑',丑:'子',寅:'亥',亥:'寅',卯:'戌',戌:'卯',辰:'酉',酉:'辰',巳:'申',申:'巳',午:'未',未:'午'}
const DZ_SANHE: Record<string, string[]> = {申:['子','辰'],子:['申','辰'],辰:['子','申'],亥:['卯','未'],卯:['亥','未'],未:['卯','亥'],寅:['午','戌'],午:['寅','戌'],戌:['寅','午'],巳:['酉','丑'],酉:['巳','丑'],丑:['巳','酉']}
const DZ_CHONG: Record<string, string> = {子:'午',午:'子',丑:'未',未:'丑',寅:'申',申:'寅',卯:'酉',酉:'卯',辰:'戌',戌:'辰',巳:'亥',亥:'巳'}
const DZ_XING: Record<string, string[]> = {
 子:['卯'],卯:['子'],寅:['巳'],巳:['申'],申:['寅'],丑:['未'],未:['戌'],戌:['丑'],辰:[],午:[],酉:[],亥:[]
}

const SHI_CHEN: Record<number, string> = {0:'子',2:'丑',4:'寅',6:'卯',8:'辰',10:'巳',12:'午',14:'未',16:'申',18:'酉',20:'戌',22:'亥'}
const HOUR_OPTS: {v:string;l:string}[] = [
  {v:'0',l:'子时 23:00-01:00'},{v:'2',l:'丑时 01:00-03:00'},{v:'4',l:'寅时 03:00-05:00'},{v:'6',l:'卯时 05:00-07:00'},
  {v:'8',l:'辰时 07:00-09:00'},{v:'10',l:'巳时 09:00-11:00'},{v:'12',l:'午时 11:00-13:00'},{v:'14',l:'未时 13:00-15:00'},
  {v:'16',l:'申时 15:00-17:00'},{v:'18',l:'酉时 17:00-19:00'},{v:'20',l:'戌时 19:00-21:00'},{v:'22',l:'亥时 21:00-23:00'}
]

// ── 时干起法 ──
const SHI_GAN: Record<string, Record<string, string>> = {
 '甲':{子:'甲',丑:'乙',寅:'丙',卯:'丁',辰:'戊',巳:'己',午:'庚',未:'辛',申:'壬',酉:'癸',戌:'甲',亥:'乙'},
 '乙':{子:'丙',丑:'丁',寅:'戊',卯:'己',辰:'庚',巳:'辛',午:'壬',未:'癸',申:'甲',酉:'乙',戌:'丙',亥:'丁'},
 '丙':{子:'戊',丑:'己',寅:'庚',卯:'辛',辰:'壬',巳:'癸',午:'甲',未:'乙',申:'丙',酉:'丁',戌:'戊',亥:'己'},
 '丁':{子:'庚',丑:'辛',寅:'壬',卯:'癸',辰:'甲',巳:'乙',午:'丙',未:'丁',申:'戊',酉:'己',戌:'庚',亥:'辛'},
 '戊':{子:'壬',丑:'癸',寅:'甲',卯:'乙',辰:'丙',巳:'丁',午:'戊',未:'己',申:'庚',酉:'辛',戌:'壬',亥:'癸'},
 '己':{子:'甲',丑:'乙',寅:'丙',卯:'丁',辰:'戊',巳:'己',午:'庚',未:'辛',申:'壬',酉:'癸',戌:'甲',亥:'乙'},
 '庚':{子:'丙',丑:'丁',寅:'戊',卯:'己',辰:'庚',巳:'辛',午:'壬',未:'癸',申:'甲',酉:'乙',戌:'丙',亥:'丁'},
 '辛':{子:'戊',丑:'己',寅:'庚',卯:'辛',辰:'壬',巳:'癸',午:'甲',未:'乙',申:'丙',酉:'丁',戌:'戊',亥:'己'},
 '壬':{子:'庚',丑:'辛',寅:'壬',卯:'癸',辰:'甲',巳:'乙',午:'丙',未:'丁',申:'戊',酉:'己',戌:'庚',亥:'辛'},
 '癸':{子:'壬',丑:'癸',寅:'甲',卯:'乙',辰:'丙',巳:'丁',午:'戊',未:'己',申:'庚',酉:'辛',戌:'壬',亥:'癸'},
};
interface BaziResult { tg: string[]; dz: string[]; gz: string[]; nayin: string[]; wxTg: string[]; wxDz: string[]; cang: string[]; riZhu: string; riZhuWx: string }
interface AnalysisResult { wxCount: Record<string, number>; bodyStrength: string; yongShen: string }
interface FullResult { bazi: BaziResult; analysis: AnalysisResult; name: string; animal: string }
interface HehunDim { label: string; score: number; detail: string; desc: string }

function getAnimal(y: number): string { return SX[(y - 4) % 12] }

function calcBazi(y: number, m: number, d: number, hDz: string): BaziResult {
  const tgList = '甲乙丙丁戊己庚辛壬癸', dzList = '子丑寅卯辰巳午未申酉戌亥'
  const nianGan = tgList[(y - 4) % 10], nianZhi = dzList[(y - 4) % 12], nianGz = nianGan + nianZhi
  const yueGanIdx = ((y - 4) % 5) * 2 + m - 1
  const yueGan = tgList[yueGanIdx % 10], yueZhi = '寅卯辰巳午未申酉戌亥子丑'[m - 1], yueGz = yueGan + yueZhi
  const baseDt = new Date(2026,4,29), targetDt = new Date(y,m-1,d)
  const diff = Math.round((targetDt.getTime() - baseDt.getTime()) / 86400000)
  const riGan = tgList[(2 + (diff % 10) + 10) % 10], riZhi = dzList[(6 + (diff % 12) + 12) % 12], riGz = riGan + riZhi
  const shiGan = SHI_GAN[riGan]?.[hDz] || '甲', shiGz = shiGan + hDz
  const tg = [nianGan, yueGan, riGan, shiGan], dz = [nianZhi, yueZhi, riZhi, hDz], gz = [nianGz, yueGz, riGz, shiGz]
  return { tg, dz, gz, nayin: gz.map(g => NAYIN[g] || '—'), wxTg: tg.map(c => WX_TG[c] || '土'), wxDz: dz.map(c => WX_DZ[c] || '土'), cang: dz.map(c => CANG[c] || ''), riZhu: riGan, riZhuWx: WX_TG[riGan] || '土' }
}

function analyzeWx(b: BaziResult): AnalysisResult {
  const wxCount: Record<string, number> = {木:0,火:0,土:0,金:0,水:0}
  for (let i = 0; i < 4; i++) {
    if (WX_TG[b.tg[i]]) wxCount[WX_TG[b.tg[i]]]++
    if (WX_DZ[b.dz[i]]) wxCount[WX_DZ[b.dz[i]]]++
    for (const ch of (CANG[b.dz[i]] || '')) { if (WX_TG[ch]) wxCount[WX_TG[ch]] += 0.3 }
  }
  const self = wxCount[b.riZhuWx] || 0
  const bodyStrength = self >= 2.5 ? '身强' : self <= 1 ? '身弱' : '中和'
  let yongShen: string
  if (bodyStrength === '身强') yongShen = KE[b.riZhuWx] || '土'
  else if (bodyStrength === '身弱') yongShen = SHENG[b.riZhuWx] || '水'
  else { let mv = 999, mw = '土'; for (const [wx,v] of Object.entries(wxCount)) { if (v < mv) { mv = v; mw = wx } }; yongShen = mw }
  return { wxCount, bodyStrength, yongShen: yongShen || '土' }
}

function calcAnimalScore(a1: string, a2: string): number {
  const x = SHENGXIAO[a1]; if (!x) return 50
  if (x.liuhe === a2) return 95; if (x.sanhe.includes(a2)) return 85
  if (x.chong === a2) return 25; if (x.hai === a2) return 35; if (x.po === a2) return 40
  return 55
}

function calcDzPairScore(mDz: string, wDz: string): number {
  if (DZ_LIUHE[mDz] === wDz) return 95; if ((DZ_SANHE[mDz] || []).includes(wDz)) return 80
  if (mDz === wDz) return 45; if (DZ_CHONG[mDz] === wDz) return 20
  if ((DZ_XING[mDz] || []).includes(wDz)) return 30; return 55
}

function calcYongShenScore(mY: string, wY: string): number {
  if (KE[mY] === wY || KE[wY] === mY) return 90; if (mY === wY) return 65
  if (SHENG[mY] === wY || SHENG[wY] === mY) return 80; return 50
}

function calcRiZhuScore(mWx: string, wWx: string): number {
  if (SHENG[mWx] === wWx || SHENG[wWx] === mWx) return 85; if (mWx === wWx) return 50
  if (KE[mWx] === wWx || KE[wWx] === mWx) return 35; return 55
}

function calcWxScore(mWc: Record<string,number>, wWc: Record<string,number>): number {
  const mT = Object.values(mWc).reduce((a,b)=>a+b,0) || 1, wT = Object.values(wWc).reduce((a,b)=>a+b,0) || 1
  let score = 0
  for (const wx of ['木','火','土','金','水']) {
    const mP = (mWc[wx]||0)/mT, wP = (wWc[wx]||0)/wT, d = Math.abs(mP - wP)
    if (mP > 0.25 && wP > 0.25 && d < 0.1) score += 10
    else if (mP > 0.3 && wP < 0.15) score += 15; else if (mP < 0.15 && wP > 0.3) score += 15
    else if (d < 0.1) score += 8; else score += 5
  }
  return Math.min(Math.round(score * 1.8), 100)
}

function calcNayinScore(mN: string, wN: string): number {
  if (!mN || !wN) return 50; const mL = mN.slice(-1), wL = wN.slice(-1)
  if (SHENG[mL] === wL || SHENG[wL] === mL) return 80; if (mL === wL) return 55
  if (KE[mL] === wL || KE[wL] === mL) return 30; return 50
}function getPersonalityDesc(wx: string, dz: string[], tg: string[]): string {
  const wxPerson: Record<string, string> = {
    木:'仁慈宽厚，有同情心，上进心强，但有时过于固执',
    火:'热情开朗，充满活力，善于表达，但急躁冲动',
    土:'稳重踏实，诚信可靠，有包容心，但偏保守',
    金:'果断刚毅，有魄力，讲原则，但过于刚硬',
    水:'聪明灵活，善于变通，情感丰富，但变化无常'
  }
  const parts: string[] = [wxPerson[wx] || '性格独特，不随波逐流']
  if ((CANG[dz[0]]||'').length > 1) parts.push('内在有多重性格潜质')
  const same = tg.filter(t => WX_TG[t] === wx).length
  if (same >= 3) parts.push('同类天干多，性格鲜明直率'); else if (same <= 1) parts.push('天干较分散，性格灵活多变')
  return parts.join('；')
}

function getEmotionDesc(mRiWx: string, wRiWx: string, mY: string, wY: string): string[] {
  const qg: Record<string, string> = {
    '水-火':'情感上水火既济，互相制衡，热烈与冷静并存',
    '火-水':'一个热情似火，一个柔情似水，若能包容则佳',
    '木-火':'木生火，双方互有吸引力，沟通顺畅',
    '火-土':'火生土，一方主动一方稳重，互补和谐',
    '土-金':'土生金，一方包容一方果断，合作默契',
    '金-水':'金生水，一方理性一方感性，互相成就',
    '水-木':'水生木，相互滋养，情感基础稳固',
    '木-土':'木克土，需要特别注意沟通方式',
    '土-水':'土克水，一方固执一方善变，需磨合',
    '火-金':'火克金，一个想主导一个不服输',
    '金-木':'金克木，价值观差异可能较大'
  }
  const items: string[] = [qg[mRiWx+'-'+wRiWx] || qg[wRiWx+'-'+mRiWx] || '日主五行组合一般，需要多培养共同话题']
  if (mY === wY) items.push('用神一致，人生方向趋同，婚恋易达成共识')
  else if (SHENG[mY] === wY || SHENG[wY] === mY) items.push('用神相生，能互相补益')
  else items.push('用神不同，需注意各自追求的方向差异')
  return items
}

function getCareerDesc(b: BaziResult, a: AnalysisResult): string[] {
  const career: Record<string, string> = {
    木:'适合教育、文化、艺术、环保、医疗等木属性行业',
    火:'适合传媒、演艺、餐饮、能源、互联网等火属性行业',
    土:'适合房地产、建筑、农业、管理、金融等土属性行业',
    金:'适合金融、法律、科技、机械、军警等金属性行业',
    水:'适合贸易、物流、旅游、咨询、交通等水属性行业'
  }
  const items: string[] = [career[b.riZhuWx] || '行业选择较广']
  if (a.bodyStrength === '身强') items.push('身强精力旺盛，适合挑战性高的工作')
  else if (a.bodyStrength === '身弱') items.push('身弱注意劳逸结合，适合专业性强的工作')
  if ((CANG[b.dz[2]]||'').length > 1) items.push('配偶宫藏干多，婚后事业运受配偶影响较大')
  return items
}

function getWealthDesc(a: AnalysisResult): string[] {
  const items: string[] = [], entries = Object.entries(a.wxCount).sort((a,b)=>b[1]-a[1])
  if (entries.length >= 2) {
    const [tw, tc] = entries[0]; const [, sc] = entries[1]
    if (tc >= 3) items.push(tw + '旺，财运有根基')
    if (tc - sc > 1) items.push('五行偏旺，财运大起大落需理财规划'); else items.push('五行均衡，财运平稳')
  }
  if (a.bodyStrength === '身强') items.push('身强能担财，适合投资创业')
  else if (a.bodyStrength === '身弱') items.push('身弱需稳扎稳打，不宜冒进')
  return items
}

function getOtherInsights(mB: BaziResult, wB: BaziResult): string[] {
  const items: string[] = []
  for (let i = 0; i < 4; i++) {
    const mn = mB.nayin[i], wn = wB.nayin[i]; const pn = i===0?'年':i===1?'月':i===2?'日':'时'
    if (mn && wn && mn.includes('金') && wn.includes('水')) items.push(pn+'柱纳音金水相生，吉')
    else if (mn && wn && mn.includes('火') && wn.includes('木')) items.push(pn+'柱纳音木火相生，吉')
    else if (mn && wn && mn.slice(-1) === wn.slice(-1)) items.push(pn+'柱纳音同类，有共同语言')
  }
  const rm = mB.dz[2], rw = wB.dz[2]
  if (DZ_LIUHE[rm] === rw) items.push('日支六合，夫妻感情深厚')
  else if ((DZ_SANHE[rm]||[]).includes(rw)) items.push('日支三合，婚姻基础稳固')
  else if (DZ_CHONG[rm] === rw) items.push('日支相冲，需多加包容磨合')
  else if ((DZ_XING[rm]||[]).includes(rw)) items.push('日支相刑，小心沟通误会')
  const ym = mB.dz[1], yw = wB.dz[1]
  if (DZ_LIUHE[ym] === yw) items.push('月支六合，家庭关系和顺')
  return items
}

function calcTotalScore(dims: HehunDim[]): number {
  const weights: Record<string, number> = {
    '生肖婚配': 0.10, '八字合冲': 0.12, '日主五行': 0.10, '用神互补': 0.15,
    '五行互补': 0.12, '纳音年命': 0.05, '月支合局': 0.06, '日支合局': 0.15, '性格契合': 0.08, '感情契合': 0.07
  }
  let total = 0, wSum = 0
  for (const d of dims) { const w = weights[d.label] || 0.05; total += d.score * w; wSum += w }
  return Math.round(total / (wSum || 1))
}

function getMaritalLevel(score: number): string {
  if (score >= 85) return '上等婚'; if (score >= 65) return '中上婚'; if (score >= 45) return '中等婚'; return '下等婚'
}

function getMarriageAdvice(dims: HehunDim[], mRes: FullResult, wRes: FullResult): string[] {
  const tips: string[] = [], low = dims.filter(d=>d.score<50), high = dims.filter(d=>d.score>=70)
  if (high.length >= 4) tips.push('综合来看缘分深厚，多项指标契合度高，是难得的良配。')
  else if (high.length >= 2) tips.push('多项合婚指标较好，有较深的缘分基础。')
  else tips.push('合婚指标一般，需要通过后天努力维系感情。')
  if (low.length > 0) { tips.push('需要特别注意以下方面：'); for (const d of low.slice(0,3)) tips.push('• '+d.label+'（'+d.score+'分）：'+d.desc) }
  if (mRes.analysis.bodyStrength !== wRes.analysis.bodyStrength) tips.push('双方身强弱互补——强的一方多担待，弱的一方多体谅。')
  if (DZ_CHONG[mRes.bazi.dz[2]] === wRes.bazi.dz[2]) tips.push('日支相冲，这是婚姻中的主要挑战，学会求同存异是关键。')
  return tips
}

interface PersonForm { name: string; cal: 'solar' | 'lunar'; year: string; month: string; day: string; hour: string; isLeap: boolean }export default function HehunClient() {
  const [m, setM] = useState<PersonForm>({name:'',cal:'solar',year:'1990',month:'1',day:'1',hour:'0',isLeap:false})
  const [w, setW] = useState<PersonForm>({name:'',cal:'solar',year:'1992',month:'1',day:'1',hour:'0',isLeap:false})
  const [res, setRes] = useState<{mRes:FullResult;wRes:FullResult;dims:HehunDim[];total:number;level:string;tips:string[]}|null>(null)
  const [err, setErr] = useState('')

  const doCalc = useCallback(() => {
    setErr(''); const my=+m.year,mm=+m.month,md=+m.day,mh=+m.hour,wy=+w.year,wm=+w.month,wd=+w.day,wh=+w.hour
    if (isNaN(my)||isNaN(mm)||isNaN(md)||isNaN(wy)||isNaN(wm)||isNaN(wd)) { setErr('请完善双方出生信息'); return }
    if (!my||!mm||!md||!wy||!wm||!wd) { setErr('请选择有效的出生日期'); return }
    try {
      const mDz=SHI_CHEN[mh]||'子', wDz=SHI_CHEN[wh]||'子'
      const mL=m.cal==='solar'?Solar.fromYmd(my,mm,md).getLunar():Lunar.fromYmd(my, m.isLeap?-mm:mm, md)
      const wL=w.cal==='solar'?Solar.fromYmd(wy,wm,wd).getLunar():Lunar.fromYmd(wy, w.isLeap?-wm:wm, wd)
      const mB=calcBazi(mL.getYear(),mL.getMonth(),mL.getDay(),mDz), wB=calcBazi(wL.getYear(),wL.getMonth(),wL.getDay(),wDz)
      const mA=analyzeWx(mB), wA=analyzeWx(wB), mAn=getAnimal(mL.getYear()), wAn=getAnimal(wL.getYear())
      const dims: HehunDim[] = [
        {label:'生肖婚配',score:calcAnimalScore(mAn,wAn),detail:mAn+'×'+wAn,desc:(()=>{const sx=SHENGXIAO[mAn];if(sx?.liuhe===wAn)return'六合贵人';if(sx?.sanhe.includes(wAn))return'三合缘分';if(sx?.chong===wAn)return'相冲需包容';if(sx?.hai===wAn)return'相害易摩擦';if(sx?.po===wAn)return'相破不合';return'平平'})()},
        {label:'八字合冲',score:Math.round(calcDzPairScore(mB.dz[0],wB.dz[0])*0.2+calcDzPairScore(mB.dz[1],wB.dz[1])*0.3+calcDzPairScore(mB.dz[2],wB.dz[2])*0.3+calcDzPairScore(mB.dz[3],wB.dz[3])*0.2),detail:[0,1,2,3].map(i=>mB.dz[i]+'↔'+wB.dz[i]).join(' '),desc:(()=>{const r=DZ_LIUHE[mB.dz[1]]===wB.dz[1]||DZ_LIUHE[mB.dz[2]]===wB.dz[2];const ch=DZ_CHONG[mB.dz[1]]===wB.dz[1]||DZ_CHONG[mB.dz[2]]===wB.dz[2];if(r)return'有六合/三合局';if(ch)return'有相冲';return'正常'})()},
        {label:'日主五行',score:calcRiZhuScore(mB.riZhuWx,wB.riZhuWx),detail:mB.riZhu+'('+mB.riZhuWx+')×'+wB.riZhu+'('+wB.riZhuWx+')',desc:(()=>{if(SHENG[mB.riZhuWx]===wB.riZhuWx||SHENG[wB.riZhuWx]===mB.riZhuWx)return'日主相生';if(mB.riZhuWx===wB.riZhuWx)return'日主相同';return'日主相克'})()},
        {label:'用神互补',score:calcYongShenScore(mA.yongShen,wA.yongShen),detail:mA.yongShen+'↔'+wA.yongShen,desc:mA.yongShen===wA.yongShen?'用神一致':'用神互补'},
        {label:'五行互补',score:calcWxScore(mA.wxCount,wA.wxCount),detail:(()=>{const ms=Object.entries(mA.wxCount).sort((a,b)=>b[1]-a[1]).slice(0,2).map(([k,v])=>k+v.toFixed(1)).join(' ');const ws=Object.entries(wA.wxCount).sort((a,b)=>b[1]-a[1]).slice(0,2).map(([k,v])=>k+v.toFixed(1)).join(' ');return'男:'+ms+' 女:'+ws})(),desc:'五行整体配合理性分析'},
        {label:'纳音年命',score:calcNayinScore(mB.nayin[0],wB.nayin[0]),detail:mB.nayin[0]+'×'+wB.nayin[0],desc:''},
        {label:'月支合局',score:calcDzPairScore(mB.dz[1],wB.dz[1]),detail:mB.dz[1]+'↔'+wB.dz[1],desc:''},
        {label:'日支合局',score:calcDzPairScore(mB.dz[2],wB.dz[2]),detail:mB.dz[2]+'↔'+wB.dz[2],desc:''},
        {label:'性格契合',score:(()=>{if(SHENG[mB.riZhuWx]===wB.riZhuWx||SHENG[wB.riZhuWx]===mB.riZhuWx)return 80;if(mB.riZhuWx===wB.riZhuWx)return 60;return 45})(),detail:mB.riZhuWx+'性×'+wB.riZhuWx+'性',desc:(()=>{const mp=getPersonalityDesc(mB.riZhuWx,mB.dz,mB.tg).split('；')[0];const wp=getPersonalityDesc(wB.riZhuWx,wB.dz,wB.tg).split('；')[0];return'男：'+mp.slice(0,20)+'；女：'+wp.slice(0,20)})()},
        {label:'感情契合',score:(()=>{const em=getEmotionDesc(mB.riZhuWx,wB.riZhuWx,mA.yongShen,wA.yongShen);if(em.some(e=>e.includes('佳')||e.includes('深厚')||e.includes('稳固')))return 80;if(em.some(e=>e.includes('和谐')||e.includes('默契')))return 65;return 45})(),detail:mB.riZhuWx+'×'+wB.riZhuWx,desc:getEmotionDesc(mB.riZhuWx,wB.riZhuWx,mA.yongShen,wA.yongShen).join('；')}
      ]
      const total = calcTotalScore(dims); const level = getMaritalLevel(total)
      const tips = getMarriageAdvice(dims,{bazi:mB,analysis:mA,name:m.name||'男方',animal:mAn},{bazi:wB,analysis:wA,name:w.name||'女方',animal:wAn})
      setRes({mRes:{bazi:mB,analysis:mA,name:m.name||'男方',animal:mAn},wRes:{bazi:wB,analysis:wA,name:w.name||'女方',animal:wAn},dims,total,level,tips})
    } catch(e) { setErr('排盘出错，请检查日期') }
  },[m,w])

  const doSwitch = useCallback((g:'m'|'w',nc:'solar'|'lunar') => {
    const p=g==='m'?m:w,sp=g==='m'?setM:setW; const y=+p.year,mm=+p.month,d=+p.day
    if(!isNaN(y)&&!isNaN(mm)&&!isNaN(d)){try{if(nc==='solar'&&p.cal==='lunar'){const s=Lunar.fromYmd(y,p.isLeap?-mm:mm,d).getSolar();sp({...p,cal:nc,year:s.getYear()+'',month:s.getMonth()+'',day:s.getDay()+'',isLeap:false})}else if(nc==='lunar'&&p.cal==='solar'){const l=Solar.fromYmd(y,mm,d).getLunar();sp({...p,cal:nc,year:l.getYear()+'',month:l.getMonth()+'',day:l.getDay()+'',isLeap:false})}else sp({...p,cal:nc,isLeap:false})}catch{sp({...p,cal:nc,isLeap:false})}}else sp({...p,cal:nc,isLeap:false})
  },[m,w])
  const cy = new Date().getFullYear()

  const renderResult = !res ? null : (
    <div className="space-y-6">
      {[res.mRes, res.wRes].map((p,i) => {
        if (!p) return null
        const b = p.bazi, a = p.analysis, pl = ['年','月','日','时']
        const total = Object.values(a.wxCount).reduce((a,b)=>a+b,0) || 1
        return (
          <div key={i} className={'bg-dark-800/80 backdrop-blur rounded-xl border p-5 '+(i===0?'border-blue-500/20':'border-pink-500/20')}>
            <h3 className={'text-sm font-semibold mb-4 '+(i===0?'text-blue-400':'text-pink-400')}>{(i===0?'👨 男方':'👩 女方')} {p.name}</h3>
            <p className="text-[11px] text-gray-500 mb-3">生肖 {p.animal}</p>
            <div className="overflow-x-auto mb-3">
              <table className="w-full text-xs">
                <thead><tr className="border-b border-dark-600"><th className="px-2 py-1.5 text-left text-gray-500 w-10"></th>{pl.map((l,j)=><th key={j} className="px-2 py-1.5 text-center text-gray-400 font-medium">{l}柱</th>)}</tr></thead>
                <tbody>
                  <tr><td className="px-2 py-1.5 text-gray-500">天干</td>{b.tg.map((c,j)=><td key={j} className={'px-2 py-1.5 text-center text-sm font-bold '+(WXC[b.wxTg[j]]||'text-gray-300')}>{c}</td>)}</tr>
                  <tr><td className="px-2 py-1.5 text-gray-500">地支</td>{b.dz.map((c,j)=><td key={j} className={'px-2 py-1.5 text-center text-sm font-bold '+(WXC[b.wxDz[j]]||'text-gray-300')}>{c}</td>)}</tr>
                  <tr><td className="px-2 py-1.5 text-gray-500">藏干</td>{b.cang.map((c,j)=><td key={j} className="px-2 py-1.5 text-center text-[10px] text-gray-400">{c||'—'}</td>)}</tr>
                  <tr className="border-t border-dark-600/50"><td className="px-2 py-1.5 text-gray-500">纳音</td>{b.nayin.map((n,j)=><td key={j} className="px-2 py-1.5 text-center text-[10px] text-gold-400">{n||'—'}</td>)}</tr>
                </tbody>
              </table>
            </div>
            <div className="flex gap-1.5 mb-3">
              {['木','火','土','金','水'].map(wx => {
                const cnt = a.wxCount[wx] || 0, pct = Math.round((cnt/total)*100) || 0
                return <div key={wx} className="flex-1"><div className="text-center text-[9px] mb-0.5"><span className={'font-semibold '+(WXC[wx]||'text-gray-400')}>{wx}</span></div><div className={'h-12 rounded overflow-hidden flex flex-col justify-end '+(WXBG[wx]||'bg-dark-700')}><div className={'rounded-t bg-gradient-to-t '+(WXBAR[wx]||'from-amber-500 to-amber-700')} style={{height:Math.max(pct,5)+'%'}}></div></div><div className="text-center text-[9px] text-gray-600">{cnt.toFixed(1)}</div></div>
              })}
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="bg-dark-700 rounded-lg p-2"><span className="text-gray-500 block text-[10px]">日主</span><span className={'text-sm font-bold '+(WXC[b.riZhuWx]||'text-gray-200')}>{b.riZhu}({b.riZhuWx})</span></div>
              <div className="bg-dark-700 rounded-lg p-2"><span className="text-gray-500 block text-[10px]">身强弱</span><span className={'text-sm font-semibold '+(a.bodyStrength==='身强'?'text-red-400':a.bodyStrength==='身弱'?'text-blue-400':'text-yellow-400')}>{a.bodyStrength}</span></div>
              <div className="bg-dark-700 rounded-lg p-2"><span className="text-gray-500 block text-[10px]">用神</span><span className={'text-sm font-bold '+(WXC[a.yongShen]||'text-gold-400')}>{a.yongShen}</span></div>
            </div>
          </div>
        )
      })}
    </div>
  )

  const renderDetails = !res ? null : (
    <div className="space-y-4">
      <div className="bg-gradient-to-br from-dark-800 to-dark-900 backdrop-blur rounded-2xl border border-gold-500/20 p-8 text-center">
        <p className="text-xs text-gray-400 mb-1">综合匹配度</p>
        <p className={'text-5xl font-bold font-serif mb-2 '+(res.total>=70?'text-green-400':res.total>=45?'text-yellow-400':'text-red-400')}>{res.total}%</p>
        <span className={'inline-block px-5 py-1.5 rounded-full text-sm font-semibold border '+(res.total>=70?'border-green-500/40 bg-green-900/20 text-green-400':res.total>=45?'border-yellow-500/40 bg-yellow-900/20 text-yellow-400':'border-red-500/40 bg-red-900/20 text-red-400')}>{res.level} 💍</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {res.dims.map((d,i)=>(
          <div key={i} className="bg-dark-800/80 backdrop-blur rounded-xl border border-dark-600 p-4">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-gray-400">{d.label}</span>
              <span className={'text-base font-bold '+(d.score>=70?'text-green-400':d.score>=45?'text-yellow-400':'text-red-400')}>{d.score}</span>
            </div>
            <div className="w-full h-1.5 bg-dark-700 rounded-full overflow-hidden mb-1">
              <div className={'h-full rounded-full transition-all duration-500 '+(d.score>=70?'bg-green-500':d.score>=45?'bg-yellow-500':'bg-red-500')} style={{width:d.score+'%'}}></div>
            </div>
            <p className="text-[10px] text-gray-500">{d.detail}</p>
            <p className="text-[10px] text-gray-400 mt-0.5">{d.desc}</p>
          </div>
        ))}
      </div>      <div className="bg-dark-800/80 backdrop-blur rounded-xl border border-dark-600 p-5">
        <h3 className="text-xs font-semibold text-gray-200 mb-3">🔮 性格分析</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="bg-dark-700/50 rounded-lg p-3 border border-blue-500/10">
            <p className="text-[10px] text-blue-400 font-semibold mb-1">{res.mRes.name}</p>
            <p className="text-[11px] text-gray-400 leading-relaxed">{getPersonalityDesc(res.mRes.bazi.riZhuWx,res.mRes.bazi.dz,res.mRes.bazi.tg)}</p>
          </div>
          <div className="bg-dark-700/50 rounded-lg p-3 border border-pink-500/10">
            <p className="text-[10px] text-pink-400 font-semibold mb-1">{res.wRes.name}</p>
            <p className="text-[11px] text-gray-400 leading-relaxed">{getPersonalityDesc(res.wRes.bazi.riZhuWx,res.wRes.bazi.dz,res.wRes.bazi.tg)}</p>
          </div>
        </div>
      </div>
      <div className="bg-dark-800/80 backdrop-blur rounded-xl border border-dark-600 p-5">
        <h3 className="text-xs font-semibold text-gray-200 mb-3">💕 感情分析</h3>
        <ul className="space-y-1">{getEmotionDesc(res.mRes.bazi.riZhuWx,res.wRes.bazi.riZhuWx,res.mRes.analysis.yongShen,res.wRes.analysis.yongShen).map((t,i)=><li key={i} className="text-[11px] text-gray-400 leading-relaxed flex gap-1"><span className="text-gold-400 shrink-0 mt-0.5">•</span><span>{t}</span></li>)}</ul>
      </div>
      <div className="bg-dark-800/80 backdrop-blur rounded-xl border border-dark-600 p-5">
        <h3 className="text-xs font-semibold text-gray-200 mb-3">💼 事业分析</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="bg-dark-700/50 rounded-lg p-3 border border-blue-500/10">
            <p className="text-[10px] text-blue-400 font-semibold mb-1">{res.mRes.name}</p>
            <ul className="space-y-0.5">{getCareerDesc(res.mRes.bazi,res.mRes.analysis).map((t,i)=><li key={i} className="text-[11px] text-gray-400 leading-relaxed flex gap-1"><span className="text-amber-400 shrink-0 mt-0.5">•</span><span>{t}</span></li>)}</ul>
          </div>
          <div className="bg-dark-700/50 rounded-lg p-3 border border-pink-500/10">
            <p className="text-[10px] text-pink-400 font-semibold mb-1">{res.wRes.name}</p>
            <ul className="space-y-0.5">{getCareerDesc(res.wRes.bazi,res.wRes.analysis).map((t,i)=><li key={i} className="text-[11px] text-gray-400 leading-relaxed flex gap-1"><span className="text-amber-400 shrink-0 mt-0.5">•</span><span>{t}</span></li>)}</ul>
          </div>
        </div>
      </div>
      <div className="bg-dark-800/80 backdrop-blur rounded-xl border border-dark-600 p-5">
        <h3 className="text-xs font-semibold text-gray-200 mb-3">💰 财运分析</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="bg-dark-700/50 rounded-lg p-3 border border-blue-500/10">
            <p className="text-[10px] text-blue-400 font-semibold mb-1">{res.mRes.name}</p>
            <ul className="space-y-0.5">{getWealthDesc(res.mRes.analysis).map((t,i)=><li key={i} className="text-[11px] text-gray-400 leading-relaxed flex gap-1"><span className="text-gold-400 shrink-0 mt-0.5">•</span><span>{t}</span></li>)}</ul>
          </div>
          <div className="bg-dark-700/50 rounded-lg p-3 border border-pink-500/10">
            <p className="text-[10px] text-pink-400 font-semibold mb-1">{res.wRes.name}</p>
            <ul className="space-y-0.5">{getWealthDesc(res.wRes.analysis).map((t,i)=><li key={i} className="text-[11px] text-gray-400 leading-relaxed flex gap-1"><span className="text-gold-400 shrink-0 mt-0.5">•</span><span>{t}</span></li>)}</ul>
          </div>
        </div>
      </div>
      <div className="bg-dark-800/80 backdrop-blur rounded-xl border border-dark-600 p-5">
        <h3 className="text-xs font-semibold text-gray-200 mb-3">🌟 其他看点</h3>
        <ul className="space-y-1">{(getOtherInsights(res.mRes.bazi,res.wRes.bazi).length>0?getOtherInsights(res.mRes.bazi,res.wRes.bazi):['无特殊看点']).map((t,i)=><li key={i} className="text-[11px] text-gray-400 leading-relaxed flex gap-1"><span className="text-gold-400 shrink-0 mt-0.5">•</span><span>{t}</span></li>)}</ul>
      </div>
      <div className="bg-gradient-to-br from-dark-800 to-dark-900 backdrop-blur rounded-xl border border-gold-500/10 p-5">
        <h3 className="text-xs font-semibold text-gray-200 mb-3">💡 婚姻建议</h3>
        <ul className="space-y-1.5">{res.tips.map((t,i)=><li key={i} className="text-[11px] text-gray-400 leading-relaxed flex gap-1"><span className="text-gold-400 shrink-0 mt-0.5">•</span><span>{t}</span></li>)}</ul>
      </div>
    </div>
  )

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gold-400 font-serif text-center mb-1">💑 合婚测算</h1>
      <p className="text-gray-500 text-sm text-center mb-6">八字合婚·生肖五行·年命纳音·十神婚配 全方位分析</p>
      <div className="bg-dark-800/80 backdrop-blur rounded-xl border border-dark-600 p-5 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {[{l:'男方',p:m,sp:setM,g:'m' as const},{l:'女方',p:w,sp:setW,g:'w' as const}].map(s => (
            <div key={s.l}>
              <h3 className={'text-sm font-semibold mb-3 '+(s.l==='男方'?'text-blue-400':'text-pink-400')}>{s.l==='男方'?'👨':'👩'} {s.l}</h3>
              <input value={s.p.name} onChange={e=>s.sp({...s.p,name:e.target.value})} placeholder={s.l+'姓名'} maxLength={10} className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-gray-200 text-sm mb-3 focus:outline-none focus:border-gold-500"/>
              <CalendarInput
                calendarType={s.p.cal as CalendarType}
                year={s.p.year}
                month={s.p.month}
                day={s.p.day}
                hour={s.p.hour}
                isLeapMonth={s.p.isLeap}
                onCalendarTypeChange={(newCal) => { if (newCal !== s.p.cal) doSwitch(s.g, newCal) }}
                onYearChange={(v) => s.sp({...s.p, year: v})}
                onMonthChange={(v) => { s.sp({...s.p, month: v, isLeap: false}) }}
                onDayChange={(v) => s.sp({...s.p, day: v})}
                onHourChange={(v) => s.sp({...s.p, hour: v})}
                onLeapMonthChange={(v) => s.sp({...s.p, isLeap: v})}
                label='' compact
              />
            </div>
          ))}
        </div>
        <div className="flex justify-center mt-5"><button onClick={doCalc} className="bg-gold-600 hover:bg-gold-500 text-dark-900 font-semibold px-8 py-2.5 rounded-lg transition-colors active:scale-95 text-sm">开始合婚</button></div>
        {err && <p className="text-xs text-red-400 text-center mt-2">{err}</p>}
      </div>
      {renderResult}
      {renderDetails}
    </div>
  )
}