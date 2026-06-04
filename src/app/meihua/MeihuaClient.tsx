'use client'

import { useState, useCallback } from 'react'
import { Solar, Lunar } from 'lunar-typescript'
import { getMaxDay, getLunarDaysInMonth } from '@/components/CalendarInput'
import { MEIHUA_DUANCI, GuaDuanCi, getGuaRelation, LIFETIME_GUA_EXPLANATION, getNayinWuxing } from '@/lib/meihua-duanci'
import { TIAN_GAN, DI_ZHI } from '@/lib/bazi-constants'

const TRIGRAMS: Record<string,{name:string,wx:string,attr:string}> = {
  '乾':{name:'乾为天',wx:'金',attr:'健'},
  '坤':{name:'坤为地',wx:'土',attr:'顺'},
  '震':{name:'震为雷',wx:'木',attr:'动'},
  '巽':{name:'巽为风',wx:'木',attr:'入'},
  '坎':{name:'坎为水',wx:'水',attr:'陷'},
  '离':{name:'离为火',wx:'火',attr:'附'},
  '艮':{name:'艮为山',wx:'土',attr:'止'},
  '兑':{name:'兑为泽',wx:'金',attr:'悦'},
}
const TRIGRAM_NUM: Record<string,string> = {'1':'乾','2':'兑','3':'离','4':'震','5':'巽','6':'坎','7':'艮','8':'坤'}
const GUA_NAMES: Record<string,{name:string;poem:string}> = {
  '乾兑':{name:'泽天夬',poem:'夬者决也，刚决柔也。当断则断，不受其乱。'},
  '乾离':{name:'火天大有',poem:'大有者，宽裕也。顺天休命，物阜民丰。'},
  '乾震':{name:'雷天大壮',poem:'大壮者，刚以动也。非礼弗履，刚健不怠。'},
  '乾巽':{name:'风天小畜',poem:'小畜者，柔得位也。风行天上，懿文德也。'},
  '乾坎':{name:'水天需',poem:'需者，须也。险在前也，刚健不陷。'},
  '乾艮':{name:'山天大畜',poem:'大畜者，蓄也。刚健笃实，辉光日新。'},
  '乾坤':{name:'天地否',poem:'否者，闭也。天地不交，万物不通。'},
  '兑乾':{name:'天泽履',poem:'履者，礼也。履虎尾，不咥人，亨。'},
  '兑兑':{name:'兑为泽',poem:'兑者，悦也。说以先民，民忘其劳。'},
  '兑离':{name:'火泽睽',poem:'睽者，乖也。二女同居，其志不同行。'},
  '兑震':{name:'雷泽归妹',poem:'归妹者，女之终也。征凶，无攸利。'},
  '兑巽':{name:'风泽中孚',poem:'中孚者，信也。信及豚鱼，诚信之至。'},
  '兑坎':{name:'水泽节',poem:'节者，止也。苦节不可贞，其道穷也。'},
  '兑艮':{name:'山泽损',poem:'损者，减也。损下益上，其道上行。'},
  '兑坤':{name:'地泽临',poem:'临者，大也。刚浸而长，悦而顺。'},
  '离乾':{name:'天火同人',poem:'同人者，亲也。与人同者，物必归焉。'},
  '离兑':{name:'泽火革',poem:'革者，改也。天地革而四时成，顺天应人。'},
  '离离':{name:'离为火',poem:'离者，丽也。日月丽乎天，重明以丽乎正。'},
  '离震':{name:'雷火丰',poem:'丰者，大也。日中则昃，月盈则食。'},
  '离巽':{name:'风火家人',poem:'家人者，正也。正家而天下定矣。'},
  '离坎':{name:'水火既济',poem:'既济者，成也。初吉终乱，其道穷也。'},
  '离艮':{name:'山火贲',poem:'贲者，饰也。观乎天文，以察时变。'},
  '离坤':{name:'地火明夷',poem:'明夷者，伤也。以蒙大难，利艰贞。'},
  '震乾':{name:'天雷无妄',poem:'无妄者，天德也。天命不佑，行矣哉。'},
  '震兑':{name:'泽雷随',poem:'随者，从也。随时之义大矣哉。'},
  '震离':{name:'火雷噬嗑',poem:'噬嗑者，合也。颐中有物，曰噬嗑。'},
  '震震':{name:'震为雷',poem:'震者，动也。震惊百里，不丧匕鬯。'},
  '震巽':{name:'风雷益',poem:'益者，增也。损上益下，民说无疆。'},
  '震坎':{name:'水雷屯',poem:'屯者，难也。刚柔始交而难生。'},
  '震艮':{name:'山雷颐',poem:'颐者，养也。观颐，自求口实。'},
  '震坤':{name:'地雷复',poem:'复者，反也。反复其道，七日来复。'},
  '巽乾':{name:'天风姤',poem:'姤者，遇也。天地相遇，品物咸章。'},
  '巽兑':{name:'泽风大过',poem:'大过者，颠也。栋桡本末弱也。'},
  '巽离':{name:'火风鼎',poem:'鼎者，器也。以木巽火，亨饪也。'},
  '巽震':{name:'雷风恒',poem:'恒者，久也。天地之道，恒久不已。'},
  '巽巽':{name:'巽为风',poem:'巽者，入也。随风巽，君子以申命行事。'},
  '巽坎':{name:'水风井',poem:'井者，通也。改邑不改井，无丧无得。'},
  '巽艮':{name:'山风蛊',poem:'蛊者，事也。干父之蛊，有子考无咎。'},
  '巽坤':{name:'地风升',poem:'升者，进也。积小以高大，允升大吉。'},
  '坎乾':{name:'天水讼',poem:'讼者，争也。天与水违行，君子以作事谋始。'},
  '坎兑':{name:'泽水困',poem:'困者，穷也。困而不失其所亨。'},
  '坎离':{name:'水火未济',poem:'未济者，未成也。小狐汔济，濡其尾。'},
  '坎震':{name:'雷水解',poem:'解者，缓也。雷雨作，百果草木皆甲坼。'},
  '坎巽':{name:'风水涣',poem:'涣者，散也。风行水上，涣奔其机。'},
  '坎坎':{name:'坎为水',poem:'坎者，陷也。习坎，重险也。维心亨。'},
  '坎艮':{name:'山水蒙',poem:'蒙者，昧也。山下出泉，童蒙求我。'},
  '坎坤':{name:'地水师',poem:'师者，众也。师出以律，丈人吉。'},
  '艮乾':{name:'天山遁',poem:'遁者，退也。天下有山，君子以远小人。'},
  '艮兑':{name:'泽山咸',poem:'咸者，感也。柔上而刚下，二气感应。'},
  '艮离':{name:'火山旅',poem:'旅者，客也。旅焚其次，丧其童仆。'},
  '艮震':{name:'雷山小过',poem:'小过者，过也。飞鸟遗之音，宜下不宜上。'},
  '艮巽':{name:'风山渐',poem:'渐者，进也。女归吉，进得位。'},
  '艮坎':{name:'水山蹇',poem:'蹇者，难也。利西南，不利东北。'},
  '艮艮':{name:'艮为山',poem:'艮者，止也。时止则止，时行则行。'},
  '艮坤':{name:'地山谦',poem:'谦者，退也。谦谦君子，卑以自牧。'},
  '坤乾':{name:'天地泰',poem:'泰者，通也。天地交而万物通，上下交而其志同。'},
  '坤兑':{name:'泽地萃',poem:'萃者，聚也。聚以正也，观其所聚。'},
  '坤离':{name:'火地晋',poem:'晋者，进也。明出地上，君子以自昭明德。'},
  '坤震':{name:'雷地豫',poem:'豫者，悦也。顺以动，天地如之。'},
  '坤巽':{name:'风地观',poem:'观者，示也。观天之神道，而四时不忒。'},
  '坤坎':{name:'水地比',poem:'比者，辅也。地上有水，亲比之象。'},
  '坤艮':{name:'山地剥',poem:'剥者，落也。剥烂也，柔变刚也。'},
  '坤坤':{name:'坤为地',poem:'坤者，顺也。厚德载物，君子以厚德载物。'},
}

const ALLEGORIES: { object: string; trigram: string; meaning: string; emoji: string }[] = [
  { object: '太阳', trigram: '离', meaning: '光明、热情、显赫之事', emoji: '☀️' },
  { object: '月亮', trigram: '坎', meaning: '隐秘、情感、阴柔之事', emoji: '🌙' },
  { object: '雷电', trigram: '震', meaning: '震动、突变、惊醒', emoji: '⚡' },
  { object: '风', trigram: '巽', meaning: '渗透、传播、犹豫不决', emoji: '🌬️' },
  { object: '雨', trigram: '坎', meaning: '滋润、困顿、考验', emoji: '🌧️' },
  { object: '云', trigram: '巽', meaning: '飘忽不定、变化莫测', emoji: '☁️' },
  { object: '雾', trigram: '坎', meaning: '迷茫、混沌、看不清', emoji: '🌫️' },
  { object: '雪', trigram: '坤', meaning: '纯洁、覆盖、积蓄', emoji: '❄️' },
  { object: '彩虹', trigram: '离', meaning: '希望、连接、美丽短暂', emoji: '🌈' },
  { object: '晴天', trigram: '乾', meaning: '明朗、刚健、顺利', emoji: '☀️' },
  { object: '阴天', trigram: '坤', meaning: '沉闷、等待、积累', emoji: '☁️' },
  { object: '山', trigram: '艮', meaning: '阻挡、停止、稳重', emoji: '⛰️' },
  { object: '水', trigram: '坎', meaning: '流动、险陷、智慧', emoji: '💧' },
  { object: '火', trigram: '离', meaning: '热情、燃烧、文明', emoji: '🔥' },
  { object: '河', trigram: '坎', meaning: '流逝、阻隔、机遇', emoji: '🏞️' },
  { object: '湖', trigram: '兑', meaning: '积聚、愉悦、涵养', emoji: '🏖️' },
  { object: '海', trigram: '坎', meaning: '深远、莫测、广阔', emoji: '🌊' },
  { object: '路', trigram: '震', meaning: '前行、道路、途径', emoji: '🛤️' },
  { object: '桥', trigram: '巽', meaning: '连接、过渡、沟通', emoji: '🌉' },
  { object: '石', trigram: '艮', meaning: '坚硬、固执、基础', emoji: '🪨' },
  { object: '土', trigram: '坤', meaning: '大地、包容、孕育', emoji: '🪐' },
  { object: '树林', trigram: '震', meaning: '生长、生机、众多', emoji: '🌲' },
  { object: '花', trigram: '兑', meaning: '美丽、绽放、短暂', emoji: '🌸' },
  { object: '竹', trigram: '巽', meaning: '坚韧、虚心、节节高', emoji: '🎋' },
  { object: '草原', trigram: '坤', meaning: '广阔、包容、自由', emoji: '🌿' },
  { object: '沙漠', trigram: '艮', meaning: '干旱、孤独、考验', emoji: '🏜️' },
  { object: '冰', trigram: '乾', meaning: '寒冷、坚硬、凝结', emoji: '🧊' },
  { object: '龙', trigram: '震', meaning: '威严、力量、变化', emoji: '🐲' },
  { object: '凤', trigram: '离', meaning: '吉祥、高贵、重生', emoji: '🦅' },
  { object: '马', trigram: '乾', meaning: '奔跑、自由、刚健', emoji: '🐴' },
  { object: '牛', trigram: '坤', meaning: '勤劳、稳重、奉献', emoji: '🐂' },
  { object: '虎', trigram: '艮', meaning: '威严、勇猛、王者', emoji: '🐯' },
  { object: '兔', trigram: '震', meaning: '灵巧、谨慎、温和', emoji: '🐰' },
  { object: '蛇', trigram: '巽', meaning: '智慧、隐藏、蜕变', emoji: '🐍' },
  { object: '鸟', trigram: '离', meaning: '自由、消息、高处', emoji: '🐦' },
  { object: '鱼', trigram: '坎', meaning: '自由、繁衍、财富', emoji: '🐟' },
  { object: '龟', trigram: '艮', meaning: '长寿、稳重、耐力', emoji: '🐢' },
  { object: '蝴蝶', trigram: '巽', meaning: '蜕变、美丽、轻灵', emoji: '🦋' },
  { object: '狗', trigram: '艮', meaning: '忠诚、守护、陪伴', emoji: '🐕' },
  { object: '猫', trigram: '坎', meaning: '灵性、独立、神秘', emoji: '🐱' },
  { object: '鼠', trigram: '坎', meaning: '机敏、隐秘、繁衍', emoji: '🐭' },
  { object: '狼', trigram: '艮', meaning: '团结、野性、机智', emoji: '🐺' },
  { object: '鹤', trigram: '离', meaning: '长寿、高洁、超然', emoji: '🦩' },
  { object: '鹰', trigram: '乾', meaning: '高远、锐利、俯瞰', emoji: '🦅' },
  { object: '剑', trigram: '兑', meaning: '锋利、决断、攻击', emoji: '⚔️' },
  { object: '镜', trigram: '离', meaning: '映照、反思、明晰', emoji: '🪞' },
  { object: '钟', trigram: '乾', meaning: '时间、警醒、规律', emoji: '🕰️' },
  { object: '鼓', trigram: '震', meaning: '振奋、宣告、节奏', emoji: '🥁' },
  { object: '书', trigram: '离', meaning: '智慧、学识、传承', emoji: '📖' },
  { object: '笔', trigram: '震', meaning: '书写、表达、创造', emoji: '✏️' },
  { object: '车', trigram: '震', meaning: '出行、前进、承载', emoji: '🚗' },
  { object: '船', trigram: '坎', meaning: '航行、过渡、漂泊', emoji: '⛵' },
  { object: '钥匙', trigram: '兑', meaning: '开启、解决、解锁', emoji: '🔑' },
  { object: '锁', trigram: '艮', meaning: '封闭、守护、秘密', emoji: '🔒' },
  { object: '灯', trigram: '离', meaning: '光明、指引、希望', emoji: '💡' },
  { object: '扇子', trigram: '巽', meaning: '散风、优雅、引动', emoji: '🪭' },
  { object: '伞', trigram: '巽', meaning: '庇护、保护、遮挡', emoji: '☂️' },
  { object: '戒指', trigram: '兑', meaning: '契约、承诺、圆满', emoji: '💍' },
  { object: '铜钱', trigram: '兑', meaning: '财富、交易、运势', emoji: '🪙' },
  { object: '香', trigram: '巽', meaning: '虔诚、净化、祈愿', emoji: '🪔' },
  { object: '琴', trigram: '兑', meaning: '雅致、和谐、感怀', emoji: '🎵' },
  { object: '棋', trigram: '震', meaning: '谋略、博弈、智慧', emoji: '♟️' },
  { object: '茶', trigram: '坎', meaning: '清雅、品味、沉淀', emoji: '🍵' },
  { object: '酒', trigram: '离', meaning: '热烈、释放、欢庆', emoji: '🍷' },
  { object: '门', trigram: '艮', meaning: '出入、界限、选择', emoji: '🚪' },
  { object: '窗', trigram: '离', meaning: '视线、通透、希望', emoji: '🪟' },
  { object: '塔', trigram: '震', meaning: '高远、目标、镇守', emoji: '🗼' },
  { object: '庙', trigram: '坤', meaning: '神圣、庇护、心灵', emoji: '🏯' },
  { object: '井', trigram: '坎', meaning: '源泉、深处、资源', emoji: '🪣' },
  { object: '城墙', trigram: '艮', meaning: '守护、边界、防御', emoji: '🧱' },
  { object: '宫殿', trigram: '乾', meaning: '尊贵、权力、辉煌', emoji: '🏛️' },
  { object: '屋', trigram: '坤', meaning: '家宅、安居、庇护', emoji: '🏠' },
  { object: '笑', trigram: '兑', meaning: '喜悦、接纳、和谐', emoji: '😄' },
  { object: '哭', trigram: '兑', meaning: '悲伤、宣泄、真情', emoji: '😢' },
  { object: '梦', trigram: '坎', meaning: '潜意识、预示、幻觉', emoji: '💭' },
  { object: '心', trigram: '离', meaning: '情感、中心、本心', emoji: '❤️' },
  { object: '箭', trigram: '离', meaning: '目标、方向、迅速', emoji: '🏹' },
  { object: '旗', trigram: '巽', meaning: '标志、方向、引领', emoji: '🚩' },
  { object: '骨', trigram: '艮', meaning: '根本、骨骼、支撑', emoji: '🦴' },
  { object: '头发', trigram: '巽', meaning: '思绪、烦恼、盘绕', emoji: '💇' },
  { object: '血', trigram: '坎', meaning: '生命、代价、情感', emoji: '🩸' },
  { object: '烟', trigram: '巽', meaning: '飘散、消散、模糊', emoji: '🚬' },
  { object: '灰', trigram: '坤', meaning: '消亡、余烬、重生', emoji: '🪦' },
  { object: '风铃', trigram: '巽', meaning: '提醒、感应、清脆', emoji: '🔔' },
  { object: '网格', trigram: '离', meaning: '规则、束缚、结构', emoji: '🔲' },
  { object: '曲线', trigram: '巽', meaning: '婉转、柔和、迂回', emoji: '〰️' },
  { object: '圆', trigram: '乾', meaning: '圆满、循环、无缺', emoji: '⭕' },
  { object: '方', trigram: '坤', meaning: '方正、规矩、稳重', emoji: '⬜' },
  { object: '十字', trigram: '震', meaning: '交汇、选择、焦点', emoji: '✝️' },
  { object: '星', trigram: '离', meaning: '闪耀、希望、指引', emoji: '⭐' },
]

function matchAllegory(text: string) {
  const trimmed = text.trim()
  const exact = ALLEGORIES.find(a => a.object === trimmed)
  if (exact) return exact
  const contains = ALLEGORIES.find(a => trimmed.includes(a.object))
  if (contains) return contains
  let best: typeof ALLEGORIES[number] | null = null
  let bestLen = 0
  for (const a of ALLEGORIES) {
    if (trimmed.includes(a.object) && a.object.length > bestLen) {
      best = a; bestLen = a.object.length
    }
  }
  return best
}

type QiguaMethod = 'number' | 'lunarTime' | 'solarTime' | 'auto' | 'symbolism' | 'lifetime'

export default function MeihuaClient() {
  const [method, setMethod] = useState<QiguaMethod>('number')
  const [gender, setGender] = useState('男')
  const [matter, setMatter] = useState('')
  const [num1, setNum1] = useState(''); const [num2, setNum2] = useState(''); const [num3, setNum3] = useState('')
  const [lYear, setLYear] = useState(String(new Date().getFullYear()))
  const [lMonth, setLMonth] = useState('1'); const [lDay, setLDay] = useState('1'); const [lHour, setLHour] = useState('0')
  const [lIsLeap, setLIsLeap] = useState(false)
  const [sYear, setSYear] = useState(String(new Date().getFullYear()))
  const [sMonth, setSMonth] = useState(String(new Date().getMonth() + 1))
  const [sDay, setSDay] = useState(String(new Date().getDate())); const [sHour, setSHour] = useState('0')
  const [symbolText, setSymbolText] = useState('')
  const [symbolMode, setSymbolMode] = useState<'auto' | 'stroke' | 'word'>('auto')
  const [ltYear, setLtYear] = useState(String(new Date().getFullYear()))
  const [ltMonth, setLtMonth] = useState('1'); const [ltDay, setLtDay] = useState('1')
  const [ltHour, setLtHour] = useState('0'); const [ltGender, setLtGender] = useState('男')
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')

  const calcFromNumbers = useCallback((n1: number, n2: number, n3: number) => {
    const upperKey = ((n1 % 8 === 0) ? 8 : n1 % 8).toString()
    const lowerKey = ((n2 % 8 === 0) ? 8 : n2 % 8).toString()
    const moving = ((n3 % 6 === 0) ? 6 : n3 % 6)
    const upper = TRIGRAM_NUM[upperKey] || '乾'
    const lower = TRIGRAM_NUM[lowerKey] || '坤'
    const guaKey = upper + lower
    const gua = GUA_NAMES[guaKey] || { name: upper + lower + '卦', poem: '变化之象，随缘而行。' }
    const upperT = TRIGRAMS[upper]; const lowerT = TRIGRAMS[lower]
    const yaolines = Array.from({ length: 6 }, (_, i) => {
      const lowerbin = ['坤', '震', '坎', '兑', '艮', '离', '巽', '乾'].indexOf(lower)
      const upperbin = ['坤', '震', '坎', '兑', '艮', '离', '巽', '乾'].indexOf(upper)
      if (i < 3) return (lowerbin & (1 << (2 - i))) !== 0 ? '阳' : '阴'
      return (upperbin & (1 << (5 - i))) !== 0 ? '阳' : '阴'
    })
    const changeYao = [...yaolines]
    const yaoIdx = 6 - moving
    changeYao[yaoIdx] = changeYao[yaoIdx] === '阳' ? '阴' : '阳'
    const cub = (changeYao[5] === '阳' ? 4 : 0) + (changeYao[4] === '阳' ? 2 : 0) + (changeYao[3] === '阳' ? 1 : 0)
    const clb = (changeYao[2] === '阳' ? 4 : 0) + (changeYao[1] === '阳' ? 2 : 0) + (changeYao[0] === '阳' ? 1 : 0)
    const changeUpper = ['坤', '震', '坎', '兑', '艮', '离', '巽', '乾'][cub] || upper
    const changeLower = ['坤', '震', '坎', '兑', '艮', '离', '巽', '乾'][clb] || lower
    const changeGuaKey = changeUpper + changeLower
    const changeGua = GUA_NAMES[changeGuaKey] || { name: changeUpper + changeLower + '卦', poem: '' }
    const yaoInt = moving <= 2 ? '初爻变动，事态初起，宜谨慎行动。' : moving <= 4 ? '中爻变动，事态发展之中，宜把握时机。' : '上爻变动，事态将定，宜守成。'
    return { upper, lower, moving, upperT, lowerT, gua, changeGua, changeUpper, changeLower, yaoInt }
  }, [])

  function approxStrokes(ch: string): number {
    const c = ch.charCodeAt(0)
    if (c >= 0x4e00 && c <= 0x9fff) return ((c - 0x4e00) % 20) + 1
    if (c >= 0x3400 && c <= 0x4dbf) return ((c - 0x3400) % 18) + 1
    return 2
  }

  const doCalc = useCallback(() => {
    setError(''); setResult(null)
    if (method === 'number') {
      const n1 = parseInt(num1) || 0, n2 = parseInt(num2) || 0, n3 = parseInt(num3) || 0
      if (!n1 || !n2 || !n3) { setError('请填写三个数字'); return }
      const r = calcFromNumbers(n1, n2, n3)
      setResult({ ...r, sourceStr: `数字 ${n1} · ${n2} · ${n3}`, method: 'number' })
    } else if (method === 'lunarTime') {
      const y = parseInt(lYear), m = parseInt(lMonth), d = parseInt(lDay), h = parseInt(lHour)
      if (isNaN(y) || isNaN(m) || isNaN(d) || m < 1 || m > 12 || d < 1 || d > 30) { setError('农历日期无效'); return }
      try {
        const lm = lIsLeap ? -m : m
        const lunar = Lunar.fromYmd(y, lm, d)
        const tgIdx = '甲乙丙丁戊己庚辛壬癸'.indexOf(lunar.getYearGan()) + 1
        const r = calcFromNumbers(tgIdx + h, Math.abs(lunar.getMonth()) + m, lunar.getDay() + d)
        setResult({ ...r, sourceStr: `农历 ${y}年${lIsLeap ? '闰' : ''}${m}月${d}日 · ${['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'][h/2]}时`, method: 'lunarTime' })
      } catch { setError('农历日期转换出错') }
    } else if (method === 'solarTime') {
      const y = parseInt(sYear), m = parseInt(sMonth), d = parseInt(sDay), h = parseInt(sHour)
      if (isNaN(y) || isNaN(m) || isNaN(d) || m < 1 || m > 12 || d < 1 || d > 31) { setError('公历日期无效'); return }
      try {
        const solar = Solar.fromYmd(y, m, d)
        const lunar = solar.getLunar()
        const tgIdx = '甲乙丙丁戊己庚辛壬癸'.indexOf(lunar.getYearGan()) + 1
        const r = calcFromNumbers(tgIdx + h, Math.abs(lunar.getMonth()) + m, lunar.getDay() + d)
        setResult({ ...r, sourceStr: `公历 ${y}年${m}月${d}日 · ${['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'][h/2]}时`, method: 'solarTime' })
      } catch { setError('公历日期转换出错') }
    } else if (method === 'auto') {
      const n1 = Math.floor(Math.random() * 49) + 1
      const n2 = Math.floor(Math.random() * 49) + 1
      const n3 = Math.floor(Math.random() * 49) + 1
      const r = calcFromNumbers(n1, n2, n3)
      setResult({ ...r, sourceStr: `电脑自动起卦 ${n1} · ${n2} · ${n3}`, method: 'auto' })
    } else if (method === 'symbolism') {
      const text = symbolText.trim()
      if (!text) { setError('请输入所见之物象或心中所想之事物'); return }
      if (text.length > 50) { setError('文字太长了，限制50字以内'); return }
      const matched = matchAllegory(text)
      const charCount = text.length
      const strokes = [...text].map(approxStrokes)
      const totalStrokes = strokes.reduce((a, b) => a + b, 0)
      let n1: number, n2: number, n3: number
      let detailLines: string[] = []
      let sourceStr = ''
      if (matched) {
        const trigWx = TRIGRAMS[matched.trigram]?.wx || '土'
        const wxIdx = '金木水火土'.indexOf(trigWx) + 1
        detailLines.push(`🔮 类象匹配：「${matched.emoji} ${matched.object}」→ ${matched.trigram}卦（${trigWx}·${matched.meaning}）`)
        if (symbolMode === 'stroke' || (symbolMode === 'auto' && charCount <= 3)) {
          n1 = strokes[0] + wxIdx
          n2 = strokes.length > 1 ? strokes[1] + charCount : strokes[0] + wxIdx
          n3 = totalStrokes + charCount
          sourceStr = `万物取象「${text}」· 笔画法`
          detailLines.push(`📝 笔画：${strokes.join('·')} = ${totalStrokes}画`)
        } else {
          const firstPart = Math.ceil(charCount / 2) || 1
          const secondPart = charCount - firstPart || 1
          n1 = firstPart + wxIdx
          n2 = secondPart + wxIdx
          n3 = charCount + wxIdx
          sourceStr = `万物取象「${text}」· 字数法`
          detailLines.push(`📝 ${charCount}字，分${firstPart}·${secondPart}`)
        }
        detailLines.push(`🏷️ ${matched.trigram}卦属${trigWx}，数理加成+${wxIdx}`)
      } else {
        detailLines.push(`📝 文字「${text}」未匹配特定类象，按文字数理起卦`)
        if (symbolMode === 'stroke' || (symbolMode === 'auto' && charCount <= 5)) {
          n1 = strokes[0] || 3
          n2 = strokes.length > 1 ? strokes[1] : (strokes[0] || 3)
          n3 = totalStrokes
          sourceStr = `万物取象「${text}」· 笔画法`
          detailLines.push(`📝 笔画：${strokes.join('·')} = ${totalStrokes}画`)
        } else {
          const firstPart = Math.ceil(charCount / 2) || 1
          const secondPart = charCount - firstPart || 1
          n1 = firstPart
          n2 = secondPart
          n3 = charCount + firstPart
          sourceStr = `万物取象「${text}」· 字数法`
          detailLines.push(`📝 ${charCount}字，分${firstPart}·${secondPart}`)
        }
      }
      const r = calcFromNumbers(n1, n2, n3)
      setResult({ ...r, sourceStr, method: 'symbolism', detailLines, symbolText: text, matched })
    } else if (method === 'lifetime') {
      const y = parseInt(ltYear), m = parseInt(ltMonth), d = parseInt(ltDay), h = parseInt(ltHour)
      if (isNaN(y) || isNaN(m) || isNaN(d) || m < 1 || m > 12 || d < 1 || d > 31) { setError('出生日期无效'); return }
      try {
        const solar = Solar.fromYmd(y, m, d)
        const lunar = solar.getLunar()
        const yearGanZhi = lunar.getYearInGanZhi() // 如 '甲子'
        const monthGanZhi = lunar.getMonthInGanZhi()
        const dayGanZhi = lunar.getDayInGanZhi()
        const hourGanZhi = lunar.getTimeInGanZhi()
        // 纳音五行
        const nayin = getNayinWuxing(y)
        // 上卦: 年天干 + 月天干 => 数字
        const yearGan = yearGanZhi[0]
        const monthGan = monthGanZhi[0]
        const dayGan = dayGanZhi[0]
        const hourGan = hourGanZhi[0]
        const yearGanIdx = '甲乙丙丁戊己庚辛壬癸'.indexOf(yearGan) + 1
        const monthGanIdx = '甲乙丙丁戊己庚辛壬癸'.indexOf(monthGan) + 1
        const dayGanIdx = '甲乙丙丁戊己庚辛壬癸'.indexOf(dayGan) + 1
        const hourGanIdx = '甲乙丙丁戊己庚辛壬癸'.indexOf(hourGan) + 1
        // 上卦 = (年天干序 + 月天干序) % 8
        const n1 = yearGanIdx + monthGanIdx
        // 下卦 = (日天干序 + 时天干序) % 8
        const n2 = dayGanIdx + hourGanIdx
        // 动爻 = (年 + 月 + 日) % 6
        const n3 = yearGanIdx + monthGanIdx + dayGanIdx + parseInt(ltHour) / 2
        const r = calcFromNumbers(Math.max(n1, 1), Math.max(n2, 1), Math.max(Math.round(n3), 1))
        setResult({
          ...r, method: 'lifetime',
          sourceStr: `终身卦 · 出生 ${y}年${m}月${d}日 · ${['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'][h/2]}时`,
          ltInfo: {
            birthday: `${y}/${m}/${d}`, hour: `${['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'][h/2]}时`,
            ganzhi: `${yearGanZhi}年 ${monthGanZhi}月 ${dayGanZhi}日 ${hourGanZhi}时`,
            nayin, gender: ltGender,
          }
        })
      } catch (e: any) {
        setError('出生日期转换出错: ' + (e?.message || ''))
      }
    }
  }, [method, num1, num2, num3, lYear, lMonth, lDay, lHour, lIsLeap, sYear, sMonth, sDay, sHour, symbolText, symbolMode, ltYear, ltMonth, ltDay, ltHour, ltGender, calcFromNumbers])

  const r = result

  const btnClass = (m: QiguaMethod) =>
    `px-3 py-1.5 text-xs rounded-lg transition-colors ${method === m ? 'bg-gold-600 text-dark-900 font-semibold' : 'bg-dark-700 text-gray-400 border border-dark-600'}`

  const hourlyOptions = [{ v: '0', l: '子时(23-01)' }, { v: '2', l: '丑时(01-03)' }, { v: '4', l: '寅时(03-05)' }, { v: '6', l: '卯时(05-07)' }, { v: '8', l: '辰时(07-09)' }, { v: '10', l: '巳时(09-11)' }, { v: '12', l: '午时(11-13)' }, { v: '14', l: '未时(13-15)' }, { v: '16', l: '申时(15-17)' }, { v: '18', l: '酉时(17-19)' }, { v: '20', l: '戌时(19-21)' }, { v: '22', l: '亥时(21-23)' }]

  return (<div className="max-w-2xl mx-auto px-4 py-10">
    <h1 className="text-3xl font-bold text-gold-400 font-serif mb-1">梅花易数</h1>
    <p className="text-gray-400 mb-2">随心起卦，洞察先机。支持数字、时间、自动、万物取象、终身卦五种方式。</p>

    <div className="bg-dark-800/80 backdrop-blur rounded-xl border border-dark-600 p-5 mb-8">
      <div className="flex flex-wrap gap-2 mb-4">
        <button onClick={() => setMethod('number')} className={btnClass('number')}>🔢 数字起卦</button>
        <button onClick={() => setMethod('lunarTime')} className={btnClass('lunarTime')}>🌙 农历时间</button>
        <button onClick={() => setMethod('solarTime')} className={btnClass('solarTime')}>☀️ 公历时间</button>
        <button onClick={() => setMethod('symbolism')} className={btnClass('symbolism')}>🌿 万物取象</button>
        <button onClick={() => setMethod('auto')} className={btnClass('auto')}>🤖 电脑自动</button>
        <button onClick={() => setMethod('lifetime')} className={btnClass('lifetime')}>♾️ 终身卦</button>
      </div>

      <div className="flex gap-3 mb-4">
        <select value={gender} onChange={e => setGender(e.target.value)} className="px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-gray-200 text-xs">
          <option value="男">男</option><option value="女">女</option>
        </select>
        <input type="text" value={matter} onChange={e => setMatter(e.target.value)} placeholder="预测何事（选填）" maxLength={50}
          className="flex-1 px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-gray-200 text-xs focus:outline-none focus:border-gold-500" />
      </div>

      {method === 'number' && (
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div><label className="text-xs text-gray-400 block mb-1">上卦数</label>
            <input type="number" value={num1} onChange={e => setNum1(e.target.value)} placeholder="随意数字" className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-gray-200" /></div>
          <div><label className="text-xs text-gray-400 block mb-1">下卦数</label>
            <input type="number" value={num2} onChange={e => setNum2(e.target.value)} placeholder="随意数字" className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-gray-200" /></div>
          <div><label className="text-xs text-gray-400 block mb-1">动爻数</label>
            <input type="number" value={num3} onChange={e => setNum3(e.target.value)} placeholder="随意数字" className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-gray-200" /></div>
        </div>
      )}

      {method === 'lunarTime' && (
        <div className="mb-4">
          <div className="grid grid-cols-4 gap-3 mb-2">
            <div><label className="text-xs text-gray-400 block mb-1">农历年</label>
              <input type="number" value={lYear} onChange={e => setLYear(e.target.value)} className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-gray-200" /></div>
            <div><label className="text-xs text-gray-400 block mb-1">农历月</label>
              <input type="number" min={1} max={12} value={lMonth} onChange={e => setLMonth(e.target.value)} className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-gray-200" /></div>
            <div><label className="text-xs text-gray-400 block mb-1">农历日</label>
              <input type="number" min={1} max={getLunarDaysInMonth(+lYear, +lMonth)} value={lDay} onChange={e => setLDay(e.target.value)} className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-gray-200" /></div>
            <div><label className="text-xs text-gray-400 block mb-1">时辰</label>
              <select value={lHour} onChange={e => setLHour(e.target.value)} className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-gray-200 text-xs">
                {hourlyOptions.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
              </select></div>
          </div>
          <label className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer select-none">
            <input type="checkbox" checked={lIsLeap} onChange={e => setLIsLeap(e.target.checked)} className="accent-gold-500" />闰月
          </label>
        </div>
      )}

      {method === 'solarTime' && (
        <div className="grid grid-cols-4 gap-3 mb-4">
          <div><label className="text-xs text-gray-400 block mb-1">年份</label>
            <input type="number" value={sYear} onChange={e => setSYear(e.target.value)} className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-gray-200" /></div>
          <div><label className="text-xs text-gray-400 block mb-1">月份</label>
            <input type="number" min={1} max={12} value={sMonth} onChange={e => setSMonth(e.target.value)} className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-gray-200" /></div>
          <div><label className="text-xs text-gray-400 block mb-1">日</label>
            <input type="number" min={1} max={getMaxDay('solar', +sYear, +sMonth)} value={sDay} onChange={e => setSDay(e.target.value)} className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-gray-200" /></div>
          <div><label className="text-xs text-gray-400 block mb-1">时辰</label>
            <select value={sHour} onChange={e => setSHour(e.target.value)} className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-gray-200 text-xs">
              {hourlyOptions.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
            </select></div>
        </div>
      )}

      {method === 'lifetime' && (
        <div className="mb-4">
          <p className="text-xs text-gray-400 mb-3 leading-relaxed">{LIFETIME_GUA_EXPLANATION}</p>
          <div className="grid grid-cols-5 gap-3 mb-2">
            <div><label className="text-xs text-gray-400 block mb-1">出生年</label>
              <input type="number" value={ltYear} onChange={e => setLtYear(e.target.value)} className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-gray-200" /></div>
            <div><label className="text-xs text-gray-400 block mb-1">月</label>
              <input type="number" min={1} max={12} value={ltMonth} onChange={e => setLtMonth(e.target.value)} className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-gray-200" /></div>
            <div><label className="text-xs text-gray-400 block mb-1">日</label>
              <input type="number" min={1} max={getMaxDay('solar', +ltYear, +ltMonth)} value={ltDay} onChange={e => setLtDay(e.target.value)} className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-gray-200" /></div>
            <div><label className="text-xs text-gray-400 block mb-1">时辰</label>
              <select value={ltHour} onChange={e => setLtHour(e.target.value)} className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-gray-200 text-xs">
                {hourlyOptions.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
              </select></div>
            <div><label className="text-xs text-gray-400 block mb-1">性别</label>
              <select value={ltGender} onChange={e => setLtGender(e.target.value)} className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-gray-200 text-xs">
                <option value="男">男</option><option value="女">女</option>
              </select></div>
          </div>
        </div>
      )}

      {method === 'symbolism' && (
        <div className="mb-4">
          <div className="flex gap-2 mb-2">
            <input type="text" value={symbolText} onChange={e => setSymbolText(e.target.value)}
              placeholder="输入所见之物象，如：太阳、下雨、红绿灯、一只黑猫…"
              className="flex-1 px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-gray-200 text-xs focus:outline-none focus:border-gold-500" />
          </div>
          <div className="flex gap-2">
            {(['auto', 'stroke', 'word'] as const).map(mode => (
              <button key={mode} onClick={() => setSymbolMode(mode)}
                className={`px-2.5 py-1 text-[10px] rounded transition-colors ${symbolMode === mode ? 'bg-gold-700 text-dark-900 font-semibold' : 'bg-dark-700 text-gray-400 border border-dark-600'}`}
              >{mode === 'auto' ? '🔄 自动' : mode === 'stroke' ? '✏️ 笔画' : '🔤 字数'}</button>
            ))}
          </div>
          <p className="text-[10px] text-gray-500 mt-2">万物皆可为象 — 你看到的、听到的、心中所想的任何事物都可以起卦。</p>
          <details className="mt-2">
            <summary className="text-[10px] text-gold-500 cursor-pointer hover:text-gold-400">📖 查看万物类象表（{ALLEGORIES.length}项）</summary>
            <div className="mt-1 grid grid-cols-5 gap-x-2 gap-y-1 max-h-48 overflow-y-auto">
              {ALLEGORIES.map(a => (
                <button key={a.object} onClick={() => setSymbolText(a.object)}
                  className="text-[10px] text-left text-gray-400 hover:text-gold-400 hover:bg-dark-700/50 px-1 py-0.5 rounded transition-colors">
                  {a.emoji} {a.object}
                </button>
              ))}
            </div>
          </details>
        </div>
      )}

      {error && <p className="text-xs text-red-400 mb-2">{error}</p>}
      <button onClick={doCalc} className="bg-gold-600 hover:bg-gold-500 text-dark-900 font-semibold px-6 py-2.5 rounded-lg transition-colors active:scale-95">起卦</button>
    </div>

    {r && (<div className="space-y-4">
      <div className="bg-dark-800/80 backdrop-blur rounded-xl border border-dark-600 p-4 text-center">
        <p className="text-[10px] text-gray-500 mb-1">{r.sourceStr}</p>
        {r.detailLines && r.detailLines.map((line: string, i: number) => (
          <p key={i} className="text-[10px] text-gray-500">{line}</p>
        ))}
        <p className="text-lg font-bold text-gold-400 font-serif mb-1">本卦：{r.gua.name}</p>
        <p className="text-xs text-gray-500">
          上卦：{r.upper}（{r.upperT?.name}·{r.upperT?.wx}·{r.upperT?.attr}） ·
          下卦：{r.lower}（{r.lowerT?.name}·{r.lowerT?.wx}·{r.lowerT?.attr}）
        </p>
        <p className="text-xs text-gray-400 mt-1">动爻：第{r.moving}爻（从下往上数） · 变卦：{r.changeGua?.name || `${r.changeUpper}${r.changeLower}卦`}</p>
        {gender && <p className="text-[10px] text-gray-500 mt-1">占者：{gender} · {matter || '预测何事'}</p>}
      </div>

      <div className="bg-dark-800/80 backdrop-blur rounded-xl border border-dark-600 p-5">
        <h3 className="text-sm font-semibold text-gold-400 mb-2">本卦 · 卦辞</h3>
        <p className="text-sm text-gray-300 leading-relaxed">{r.gua.poem}</p>
      </div>

      {r.changeGua?.poem && (
        <div className="bg-dark-800/80 backdrop-blur rounded-xl border border-dark-600 p-5">
          <h3 className="text-sm font-semibold text-gold-400 mb-2">变卦 · 卦辞</h3>
          <p className="text-sm text-gray-300 leading-relaxed">{r.changeGua.poem}</p>
        </div>
      )}

      <div className="bg-dark-800/80 backdrop-blur rounded-xl border border-dark-600 p-5">
        <h3 className="text-sm font-semibold text-gold-400 mb-2">五行生克</h3>
        <p className="text-xs text-gray-300">
          上卦{r.upper}属{r.upperT?.wx}，下卦{r.lower}属{r.lowerT?.wx}。
          {r.upperT?.wx === r.lowerT?.wx ? '比和之象，诸事顺利。' :
           (r.upperT?.wx === '金' && r.lowerT?.wx === '土' || r.upperT?.wx === '木' && r.lowerT?.wx === '水' || r.upperT?.wx === '水' && r.lowerT?.wx === '金' || r.upperT?.wx === '火' && r.lowerT?.wx === '木' || r.upperT?.wx === '土' && r.lowerT?.wx === '火') ? '上卦生下卦，主吉，根基牢固。' :
           (r.upperT?.wx === '金' && r.lowerT?.wx === '火' || r.upperT?.wx === '火' && r.lowerT?.wx === '水' || r.upperT?.wx === '水' && r.lowerT?.wx === '土' || r.upperT?.wx === '土' && r.lowerT?.wx === '木' || r.upperT?.wx === '木' && r.lowerT?.wx === '金') ? '上卦克下卦，先难后易。' : '相克之象，需谨慎应对。'}
        </p>
        {(() => {
          const guaKey = r.upper + r.lower
          const duan = (MEIHUA_DUANCI as any)[guaKey] as GuaDuanCi | undefined
          if (!duan) return null
          return (
            <div className="mt-4 space-y-3">
              <div>
                <h4 className="text-xs font-semibold text-gold-500 mb-1">📜 梅花易数断辞</h4>
                <p className="text-xs text-gray-300 leading-relaxed">{duan.overall}</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-dark-700/40 rounded-lg p-3">
                  <p className="text-[10px] text-cyan-400 font-medium mb-1">💼 事业</p>
                  <p className="text-[11px] text-gray-300 leading-relaxed">{duan.career}</p>
                </div>
                <div className="bg-dark-700/40 rounded-lg p-3">
                  <p className="text-[10px] text-pink-400 font-medium mb-1">❤️ 感情</p>
                  <p className="text-[11px] text-gray-300 leading-relaxed">{duan.love}</p>
                </div>
                <div className="bg-dark-700/40 rounded-lg p-3">
                  <p className="text-[10px] text-green-400 font-medium mb-1">🌿 健康</p>
                  <p className="text-[11px] text-gray-300 leading-relaxed">{duan.health}</p>
                </div>
                <div className="bg-dark-700/40 rounded-lg p-3">
                  <p className="text-[10px] text-yellow-400 font-medium mb-1">💰 财运</p>
                  <p className="text-[11px] text-gray-300 leading-relaxed">{duan.wealth}</p>
                </div>
              </div>
            </div>
          )
        })()}
      </div>

      <div className="bg-dark-800/80 backdrop-blur rounded-xl border border-dark-600 p-5">
        <h3 className="text-sm font-semibold text-gold-400 mb-2">动爻解读</h3>
        <p className="text-xs text-gray-300">第{r.moving}爻变动，表示事情正在发展变化中。{r.yaoInt}</p>
      </div>

      {method === 'symbolism' && r.matched && (
        <div className="bg-dark-800/80 backdrop-blur rounded-xl border border-gold-700/50 p-5">
          <h3 className="text-sm font-semibold text-gold-400 mb-2">🌿 取象解析</h3>
          <p className="text-xs text-gray-300">
            你所见之「{r.symbolText}」匹配《梅花易数》万物类象中的「{r.matched.object}」,
            属{r.matched.trigram}卦，其象为：{r.matched.meaning}。
            以此物象入卦，得本卦{r.gua.name}，变卦{r.changeGua?.name}。
          </p>
        </div>
      )}

      {method === 'lifetime' && r.ltInfo && (
        <div className="bg-dark-800/80 backdrop-blur rounded-xl border border-dark-600 p-5">
          <h3 className="text-sm font-semibold text-gold-400 mb-3">📋 终身卦信息</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="bg-dark-700/50 rounded-lg p-2.5">
              <p className="text-gray-500 mb-0.5">出生</p>
              <p className="text-gray-200 font-medium">{r.ltInfo.birthday}</p>
            </div>
            <div className="bg-dark-700/50 rounded-lg p-2.5">
              <p className="text-gray-500 mb-0.5">时辰</p>
              <p className="text-gray-200 font-medium">{r.ltInfo.hour}</p>
            </div>
            <div className="bg-dark-700/50 rounded-lg p-2.5">
              <p className="text-gray-500 mb-0.5">性别</p>
              <p className="text-gray-200 font-medium">{r.ltInfo.gender}</p>
            </div>
            <div className="bg-dark-700/50 rounded-lg p-2.5">
              <p className="text-gray-500 mb-0.5">纳音</p>
              <p className="text-gray-200 font-medium">{r.ltInfo.nayin}</p>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-2">{r.ltInfo.ganzhi}</p>
        </div>
      )}
    </div>)}
  </div>)
}

