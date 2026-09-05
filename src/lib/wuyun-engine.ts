/**
 * 五运六气排盘引擎
 * 依据《黄帝内经·素问》运气七篇公开规则：
 * - 天干化五运（甲己土 乙庚金 丙辛水 丁壬木 戊癸火；阳干太过 阴干不及）
 * - 地支化六气司天/在泉（子午少阴君火 丑未太阴湿土 寅申少阳相火 卯酉阳明燥金 辰戌太阳寒水 巳亥厥阴风木）
 * - 主气六步固定（厥阴→少阴→少阳→太阴→阳明→太阳）
 * - 客气六步随司天排布
 */

export interface WuyunResult {
  year: number
  ganzhi: string       // 干支纪年
  tianGan: string      // 天干
  diZhi: string        // 地支
  zhongYun: { element: string; yinyang: string; desc: string }  // 中运（大运）
  siTian: { qi: string; element: string; desc: string }         // 司天
  zaiQuan: { qi: string; element: string; desc: string }        // 在泉
  zhuQi: { step: number; qi: string; time: string }[]           // 主气六步
  keQi: { step: number; qi: string }[]                          // 客气六步（含司天在泉位置标注）
  yunDesc: string      // 全年气候白话
  healthTips: string[] // 健康提示
}

const TIAN_GAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸']
const DI_ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']

// 天干化运：五行 + 太过(阳干)/不及(阴干)
const GAN_YUN: Record<string, { element: string; yinyang: string }> = {
  '甲': { element: '土', yinyang: '阳' }, '己': { element: '土', yinyang: '阴' },
  '乙': { element: '金', yinyang: '阴' }, '庚': { element: '金', yinyang: '阳' },
  '丙': { element: '水', yinyang: '阳' }, '辛': { element: '水', yinyang: '阴' },
  '丁': { element: '木', yinyang: '阴' }, '壬': { element: '木', yinyang: '阳' },
  '戊': { element: '火', yinyang: '阳' }, '癸': { element: '火', yinyang: '阴' },
}

// 地支化气（司天）
const ZHI_QI: Record<string, { qi: string; element: string }> = {
  '子': { qi: '少阴君火', element: '火' }, '午': { qi: '少阴君火', element: '火' },
  '丑': { qi: '太阴湿土', element: '土' }, '未': { qi: '太阴湿土', element: '土' },
  '寅': { qi: '少阳相火', element: '火' }, '申': { qi: '少阳相火', element: '火' },
  '卯': { qi: '阳明燥金', element: '金' }, '酉': { qi: '阳明燥金', element: '金' },
  '辰': { qi: '太阳寒水', element: '水' }, '戌': { qi: '太阳寒水', element: '水' },
  '巳': { qi: '厥阴风木', element: '木' }, '亥': { qi: '厥阴风木', element: '木' },
}

// 主气六步（固定）
const ZHU_QI = [
  { qi: '厥阴风木', time: '大寒→春分' },
  { qi: '少阴君火', time: '春分→小满' },
  { qi: '少阳相火', time: '小满→大暑' },
  { qi: '太阴湿土', time: '大暑→秋分' },
  { qi: '阳明燥金', time: '秋分→小雪' },
  { qi: '太阳寒水', time: '小雪→大寒' },
]

// 客气六步序（按司天定位：三之气为司天、六之气为在泉）
const KE_QI_ORDER = ['厥阴风木', '少阴君火', '太阴湿土', '少阳相火', '阳明燥金', '太阳寒水']

const YUN_DESC: Record<string, string> = {
  '木': '岁木太过，风气流行；易肝气偏旺，注意疏泄与情绪波动。',
  '火': '岁火太过，暑热流行；易心火偏亢，注意清心降火、护养心血。',
  '土': '岁土太过，雨湿流行；易脾湿困重，注意健脾祛湿、饮食清淡。',
  '金': '岁金太过，燥气流行；易肺燥津伤，注意润肺生津、护养皮毛。',
  '水': '岁水太过，寒气流行；易肾阳受抑，注意温阳散寒、护养腰膝。',
}

const HEALTH_TIPS: Record<string, string[]> = {
  '厥阴风木': ['风气偏盛之年，注意调畅情志、疏肝理气', '春季防风邪，肝木过旺者忌大怒', '可常按太冲、行间穴以疏肝'],
  '少阴君火': ['君火主政，注意养心安神、避免心火亢盛', '暑热时节护心气，午间宜小憩', '可食莲子、百合清心'],
  '少阳相火': ['相火偏旺，防肝胆火、口苦咽干', '注意规律作息，忌熬夜耗阴', '可饮菊花茶清泄相火'],
  '太阴湿土': ['湿土当令，健脾祛湿为要，忌生冷油腻', '可食薏米、赤小豆、山药健脾', '居住环境注意防潮'],
  '阳明燥金': ['燥金司天，润肺生津为先，防皮肤口鼻干燥', '可食梨、银耳、蜂蜜润燥', '秋季尤须护肺'],
  '太阳寒水': ['寒水主政，温阳散寒护肾，注意腰腿保暖', '冬令进补宜温补，忌寒凉', '可艾灸关元、命门温阳'],
}

export function getYearGanzhi(year: number): string {
  const g = TIAN_GAN[(year - 4) % 10]
  const d = DI_ZHI[(year - 4) % 12]
  return g + d
}

export function computeWuyun(year: number): WuyunResult {
  const ganzhi = getYearGanzhi(year)
  const tianGan = ganzhi[0]
  const diZhi = ganzhi[1]
  const yun = GAN_YUN[tianGan]
  const st = ZHI_QI[diZhi]
  const zaiQuanElement = ['厥阴风木', '少阴君火', '太阴湿土', '少阳相火', '阳明燥金', '太阳寒水']
  // 在泉 = 司天相对之气（三阴三阳对应：司天在 3 之气，在泉在 6 之气——客气序中司天位置 +3）
  const siTianIdx = KE_QI_ORDER.indexOf(st.qi)
  const zaiQuanQi = KE_QI_ORDER[(siTianIdx + 3) % 6]
  const zaiQuan = { qi: zaiQuanQi, element: zaiQuanQi.includes('木') ? '木' : zaiQuanQi.includes('火') ? '火' : zaiQuanQi.includes('土') ? '土' : zaiQuanQi.includes('金') ? '金' : '水', desc: '' }

  // 客气六步：从司天后一位起排（初之气 = 司天前两位……标准：客气以司天为三之气，逆推）
  // 客气次序固定（一阴二阴三阴一阳二阳三阳）：初之气起于司天的前两位
  const keQi = []
  for (let i = 0; i < 6; i++) {
    // 客气步序：初之气在司天之前 2 位（即 siTianIdx - 2 起顺排）
    const idx = (siTianIdx - 2 + i + 6) % 6
    const qi = KE_QI_ORDER[idx]
    keQi.push({ step: i + 1, qi })
  }

  const zhuQi = ZHU_QI.map((q, i) => ({ step: i + 1, qi: q.qi, time: q.time }))

  const yunDesc = YUN_DESC[yun.element] || ''
  const healthTips = [...new Set([
    ...(HEALTH_TIPS[st.qi] || []),
    ...(HEALTH_TIPS[zaiQuan.qi] || []),
    ...(HEALTH_TIPS[yun.element === '土' ? '太阴湿土' : yun.element === '木' ? '厥阴风木' : yun.element === '火' ? '少阳相火' : yun.element === '金' ? '阳明燥金' : '太阳寒水'] || []),
  ])].slice(0, 4)

  return {
    year, ganzhi, tianGan, diZhi,
    zhongYun: { element: yun.element, yinyang: yun.yinyang, desc: `${yun.yinyang}干之年，${yun.element}运${yun.yinyang === '阳' ? '太过' : '不及'}` },
    siTian: { ...st, desc: `${diZhi}年司天为${st.qi}` },
    zaiQuan: { ...zaiQuan, desc: `在泉为${zaiQuanQi}` },
    zhuQi, keQi, yunDesc, healthTips,
  }
}
