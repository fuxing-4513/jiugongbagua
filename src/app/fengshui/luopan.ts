/**
 * luopan.ts —— 风水罗盘 纯逻辑层（无 React / 无 DOM）
 * 约定：方位角 0° = 正北（子），顺时针增加；向 = 坐 + 180°。
 * 九宫飞星简版：五入中宫后按洛书轨迹顺飞（中 → 乾 → 兑 → 艮 → 离 → 坎 → 坤 → 震 → 巽），
 * 星随宫定（坎一白 / 坤二黑 / 震三碧 / 巽四绿 / 中五黄 / 乾六白 / 兑七赤 / 艮八白 / 离九紫）。
 */

export type Tone = '吉' | '平' | '凶'

/** 十二地支（坐山下拉选项）：每支 30°，0°=子=正北 */
export interface Zhi {
  ch: string
  deg: number
  wx: string
}
export const ZHI_12: Zhi[] = [
  { ch: '子', deg: 0, wx: '水' },
  { ch: '丑', deg: 30, wx: '土' },
  { ch: '寅', deg: 60, wx: '木' },
  { ch: '卯', deg: 90, wx: '木' },
  { ch: '辰', deg: 120, wx: '土' },
  { ch: '巳', deg: 150, wx: '火' },
  { ch: '午', deg: 180, wx: '火' },
  { ch: '未', deg: 210, wx: '土' },
  { ch: '申', deg: 240, wx: '金' },
  { ch: '酉', deg: 270, wx: '金' },
  { ch: '戌', deg: 300, wx: '土' },
  { ch: '亥', deg: 330, wx: '水' },
]

/** 八卦宫（按方位角升序，中心角 = 索引 × 45°，0°=坎=正北） */
export interface Palace {
  name: string // 坎
  sym: string // ☵
  dir: string // 北
  dirFull: string // 正北
  deg: number
  wx: string
  num: number // 洛书数
  star: string // 一白贪狼
  starShort: string // 一白
  tone: Tone
  attr: string // 卦象自然：水
  fam: string // 中男
  /** 向口落此宫的原创白话提示（一句，偏实操） */
  hint: string
}
export const PALACES: Palace[] = [
  {
    name: '坎', sym: '☵', dir: '北', dirFull: '正北', deg: 0, wx: '水', num: 1,
    star: '一白贪狼', starShort: '一白', tone: '吉', attr: '水', fam: '中男',
    hint: '北方主智主水，门开正北适合做需要静下心的事，贵人常从同辈朋友里来；北方最忌堆放杂物，留出流动感。',
  },
  {
    name: '艮', sym: '☶', dir: '东北', dirFull: '东北', deg: 45, wx: '土', num: 8,
    star: '八白左辅', starShort: '八白', tone: '吉', attr: '山', fam: '少男',
    hint: '八白是当令财星，落东北最实在。想催财就把常用抽屉、保险柜、发财树这类往东北角放，此方最怕脏乱压住财气。',
  },
  {
    name: '震', sym: '☳', dir: '东', dirFull: '正东', deg: 90, wx: '木', num: 3,
    star: '三碧禄存', starShort: '三碧', tone: '平', attr: '雷', fam: '长男',
    hint: '正东主行动与声名，三碧性子急，这面宜静不宜吵，少放镜子和尖角物；要谈合作、开新项目，坐东朝西说话更有气场。',
  },
  {
    name: '巽', sym: '☴', dir: '东南', dirFull: '东南', deg: 135, wx: '木', num: 4,
    star: '四绿文曲', starShort: '四绿', tone: '吉', attr: '风', fam: '长女',
    hint: '四绿文昌在东南，家里有读书考试的人，书桌朝向东南最顺；东南角放一盆高一点的绿植，思路和文笔都会活络。',
  },
  {
    name: '离', sym: '☲', dir: '南', dirFull: '正南', deg: 180, wx: '火', num: 9,
    star: '九紫右弼', starShort: '九紫', tone: '吉', attr: '火', fam: '中女',
    hint: '正南属火，主名望、喜事与好人缘。想脱单、想被看见、想开张做新生意，都可以往南边用力；火怕水冲，南面别摆鱼缸。',
  },
  {
    name: '坤', sym: '☷', dir: '西南', dirFull: '西南', deg: 225, wx: '土', num: 2,
    star: '二黑巨门', starShort: '二黑', tone: '凶', attr: '地', fam: '母',
    hint: '西南主厚德与容纳。二黑星宜静不宜动，这里少敲打、少放红得扎眼的东西，保持温和干净，家宅自然安稳。',
  },
  {
    name: '兑', sym: '☱', dir: '西', dirFull: '正西', deg: 270, wx: '金', num: 7,
    star: '七赤破军', starShort: '七赤', tone: '平', attr: '泽', fam: '少女',
    hint: '正西主口才与交际，七赤带口舌也带偏缘。想练表达、做直播、跑业务，西向能助开口；此方整洁少杂物，是非自然少。',
  },
  {
    name: '乾', sym: '☰', dir: '西北', dirFull: '西北', deg: 315, wx: '金', num: 6,
    star: '六白武曲', starShort: '六白', tone: '吉', attr: '天', fam: '父',
    hint: '西北是乾金主位，管贵人、事业与靠山。六白得用，重大决定、大额进出往西北方向谋事易遇扶持；此位宜高不宜矮。',
  },
]

/** 九星吉凶白话表（按洛书数索引 1-9，5 = 中宫） */
export interface StarInfo {
  star: string
  el: string
  tone: Tone
  note: string
}
export const STARS: StarInfo[] = [
  { star: '一白贪狼', el: '水', tone: '吉', note: '主财缘与助力，属清水吉星，宜静宜洁，最利正职收入。' },
  { star: '二黑巨门', el: '土', tone: '凶', note: '俗称病符星，最忌在此方久坐或动土，保持明亮通风、少堆杂物可缓解。' },
  { star: '三碧禄存', el: '木', tone: '平', note: '主口舌争执，宜少放锋利之物，此方多摆绿植能化掉火气。' },
  { star: '四绿文曲', el: '木', tone: '吉', note: '文昌星，利读书考试与表达，书桌朝此、案头放文竹绿植最得力。' },
  { star: '五黄廉贞', el: '土', tone: '凶', note: '正关大煞，简版盘中坐镇中宫作枢纽，不占宫位便无须惊慌，忌在中宫久坐不动。' },
  { star: '六白武曲', el: '金', tone: '吉', note: '主偏财与贵人，谋事多遇扶持，此方宜高敞明亮，利事业升迁。' },
  { star: '七赤破军', el: '金', tone: '平', note: '主损耗口舌，也带偏桃花与表达力，此方整洁少杂物，是非自然少。' },
  { star: '八白左辅', el: '土', tone: '吉', note: '当令财星，催财首选方位，宜常走动、保持光洁，忌脏乱与水淹。' },
  { star: '九紫右弼', el: '火', tone: '吉', note: '喜庆星，主名声、喜事与姻缘，此方宜亮不宜湿，可小用暖色点缀。' },
]

/** 二十四山：每山 15°，从正北子起顺时针排 */
export interface Mountain {
  ch: string
  deg: number
  kind: 'zhi' | 'gan' | 'wei' // 地支 | 天干 | 四维（乾坤艮巽）
}
export const MOUNTAINS_24: Mountain[] = [
  { ch: '子', deg: 0, kind: 'zhi' },
  { ch: '癸', deg: 15, kind: 'gan' },
  { ch: '丑', deg: 30, kind: 'zhi' },
  { ch: '艮', deg: 45, kind: 'wei' },
  { ch: '寅', deg: 60, kind: 'zhi' },
  { ch: '甲', deg: 75, kind: 'gan' },
  { ch: '卯', deg: 90, kind: 'zhi' },
  { ch: '乙', deg: 105, kind: 'gan' },
  { ch: '辰', deg: 120, kind: 'zhi' },
  { ch: '巽', deg: 135, kind: 'wei' },
  { ch: '巳', deg: 150, kind: 'zhi' },
  { ch: '丙', deg: 165, kind: 'gan' },
  { ch: '午', deg: 180, kind: 'zhi' },
  { ch: '丁', deg: 195, kind: 'gan' },
  { ch: '未', deg: 210, kind: 'zhi' },
  { ch: '坤', deg: 225, kind: 'wei' },
  { ch: '申', deg: 240, kind: 'zhi' },
  { ch: '庚', deg: 255, kind: 'gan' },
  { ch: '酉', deg: 270, kind: 'zhi' },
  { ch: '辛', deg: 285, kind: 'gan' },
  { ch: '戌', deg: 300, kind: 'zhi' },
  { ch: '乾', deg: 315, kind: 'wei' },
  { ch: '亥', deg: 330, kind: 'zhi' },
  { ch: '壬', deg: 345, kind: 'gan' },
]

/** 八卦宫白话（卦意，沿用站内旧文案语气并润色） */
export const GUA_YI: Record<string, string> = {
  乾: '乾为天，性刚健，主领导与担当，类家中父亲。此宫讲究格局大气，适合摆放镇物或高大的实木家具。',
  兑: '兑为泽，性悦乐，主口才与人气，类家中少女。此宫宜亮宜净，说话办事都顺，适合做会客或直播角。',
  离: '离为火，主光明与文化，类家中中女。此宫宜明亮通透，利读书、名声与展示，忌阴暗潮湿。',
  震: '震为雷，主动力与开创，类家中长男。此宫宜有生气，放常绿盆栽能助行动力，忌长期闲置积灰。',
  巽: '巽为风，主渗透与往来，类家中长女。此宫主文书财路，宜通风整洁，利细水长流的进账。',
  坎: '坎为水，主智慧与流动，类家中中男。此宫宜清爽安静，利思考沉淀，忌堆成储物间。',
  艮: '艮为山，主静止与积蓄，类家中少男。此宫宜稳妥厚实，适合放保险柜、存钱罐，聚气不散。',
  坤: '坤为地，主柔顺与包容，类家中母亲。此宫宜温和安稳，家庭和睦多靠此方打理得舒服。',
}

/** 归一化方位角到 [0,360) */
export function normDeg(deg: number): number {
  const d = ((deg % 360) + 360) % 360
  return d === 360 ? 0 : d
}

/** 度数 → 坐山对应地支（30° 一宫，中心在 30°×i） */
export function zhiAt(deg: number): Zhi {
  const raw = normDeg(deg)
  return ZHI_12[Math.floor((raw + 15) / 30) % 12]
}

/** 度数 → 二十四山（15° 一山，中心在 15°×i，列表从子=0° 起） */
export function mountainAt(deg: number): Mountain {
  const raw = normDeg(deg)
  return MOUNTAINS_24[Math.floor((raw + 7.5) / 15) % 24]
}

/** 度数 → 八卦宫（45° 一宫，中心在 45°×i，坎=0°） */
export function palaceAt(deg: number): Palace {
  const raw = normDeg(deg)
  return PALACES[Math.floor((raw + 22.5) / 45) % 8]
}

/** 坐向互推：坐 X 度 → 向 = X + 180 */
export function facingOfSitting(sitDeg: number): number {
  return normDeg(sitDeg + 180)
}

/** 九宫格展示（洛书布列，北在上的罗盘视角）行序：北侧排 → 中排 → 南侧排 */
export interface NineCell {
  key: string
  palace: Palace | null // 中宫为 null
  num: number
  starShort: string
  tone: Tone
}
const NINE_ROWS: (Palace | null)[][] = [
  [PALACES[7], PALACES[0], PALACES[1]], // 乾西北 坎北 艮东北
  [PALACES[6], null, PALACES[2]], // 兑西 中五 震东
  [PALACES[5], PALACES[4], PALACES[3]], // 坤西南 离南 巽东南
]
export const NINE_GRID: NineCell[][] = NINE_ROWS.map((row, r) =>
  row.map((p, c) => {
    if (!p) {
      return { key: `mid-${r}-${c}`, palace: null, num: 5, starShort: '五黄', tone: '凶' as Tone }
    }
    return {
      key: `c-${p.num}`,
      palace: p,
      num: p.num,
      starShort: p.starShort,
      tone: p.tone,
    }
  }),
)

/** 坐向综合解析结果 */
export interface LuopanResult {
  sittingDeg: number
  facingDeg: number
  sittingZhi: Zhi
  facingZhi: Zhi
  sittingMountain: Mountain
  facingMountain: Mountain
  sittingPalace: Palace
  facingPalace: Palace
  facingStar: StarInfo
  /** 向口白话总览（自写文案） */
  facingBlurb: string
  /** 坐山白话（卦意） */
  sittingBlurb: string
}

const TONE_TEXT: Record<Tone, string> = {
  吉: '，是吉星当口，做事容易借到势头',
  平: '，属中性星，用得好是助力，用不好添口舌',
  凶: '，属需留意的星，重在"宜静不宜动"',
}

/** 主解析入口：给朝向（度数）返回全套结果 */
export function analyzeFacing(facingDegRaw: number): LuopanResult {
  const facingDeg = normDeg(facingDegRaw)
  const sittingDeg = facingOfSitting(facingDeg)
  const facingZhi = zhiAt(facingDeg)
  const sittingZhi = zhiAt(sittingDeg)
  const facingMountain = mountainAt(facingDeg)
  const sittingMountain = mountainAt(sittingDeg)
  const facingPalace = palaceAt(facingDeg)
  const sittingPalace = palaceAt(sittingDeg)
  const facingStar = STARS[facingPalace.num - 1]

  const facingBlurb =
    `向口落在${facingPalace.dirFull}「${facingPalace.name}」宫，二十四山上看是「${facingMountain.ch}」山。` +
    `此宫属${facingPalace.wx}，对应洛书数 ${facingPalace.num}、${facingPalace.star}${TONE_TEXT[facingPalace.tone]}。` +
    facingPalace.hint +
    (facingStar.tone === '吉'
      ? ` ${facingPalace.star}${facingStar.note.replace('。', '，')}，适合把常用书桌、工位往这个方向摆。`
      : facingStar.tone === '凶'
        ? ` 这一宫临${facingPalace.star}：${facingStar.note}。`
        : ` 这一宫临${facingPalace.star}：${facingStar.note}`)

  const sittingBlurb =
    `坐山在${sittingPalace.dirFull}「${sittingPalace.name}」宫（二十四山「${sittingMountain.ch}」山），` +
    GUA_YI[sittingPalace.name] +
    ''

  return {
    sittingDeg,
    facingDeg,
    sittingZhi,
    facingZhi,
    sittingMountain,
    facingMountain,
    sittingPalace,
    facingPalace,
    facingStar,
    facingBlurb,
    sittingBlurb,
  }
}
