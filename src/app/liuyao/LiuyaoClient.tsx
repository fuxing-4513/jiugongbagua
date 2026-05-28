'use client'

import { useState, useCallback, useEffect, useRef } from 'react'

// ── 64卦数据 ──
interface Hexagram { num: number; name: string; upper: string; lower: string; overall: string }

const H: Record<number, Hexagram> = {
  1:{num:1,name:'乾为天',upper:'乾',lower:'乾',overall:'乾卦：元亨利贞。天行健，君子以自强不息。象征创始、强健、刚毅。'},
  2:{num:2,name:'坤为地',upper:'坤',lower:'坤',overall:'坤卦：元亨。地势坤，君子以厚德载物。象征包容、柔顺、承载。'},
  3:{num:3,name:'水雷屯',upper:'坎',lower:'震',overall:'屯卦：元亨利贞。万物初生，困难重重，宜守不宜进，待时而动。'},
  4:{num:4,name:'山水蒙',upper:'艮',lower:'坎',overall:'蒙卦：亨。匪我求童蒙，童蒙求我。启蒙教育，虚心求教。'},
  5:{num:5,name:'水天需',upper:'坎',lower:'乾',overall:'需卦：有孚光亨。需者须也，等待时机，诚信守正则吉。'},
  6:{num:6,name:'天水讼',upper:'乾',lower:'坎',overall:'讼卦：有孚窒惕。争讼冲突，宜和解不宜争斗。'},
  7:{num:7,name:'地水师',upper:'坤',lower:'坎',overall:'师卦：贞丈人吉。师者众也，统率之象。'},
  8:{num:8,name:'水地比',upper:'坎',lower:'坤',overall:'比卦：吉。比者亲也，亲附有道。'},
  11:{num:11,name:'地天泰',upper:'坤',lower:'乾',overall:'泰卦：小往大来吉亨。天地交泰，万事通达。'},
  12:{num:12,name:'天地否',upper:'乾',lower:'坤',overall:'否卦：不利君子贞。天地不交，闭塞不通，宜隐忍。'},
  13:{num:13,name:'天火同人',upper:'乾',lower:'离',overall:'同人卦：同人于野亨。志同道合，团结协作。'},
  14:{num:14,name:'火天大有',upper:'离',lower:'乾',overall:'大有卦：元亨。大获所有，丰收富足。'},
  15:{num:15,name:'地山谦',upper:'坤',lower:'艮',overall:'谦卦：亨君子有终。谦逊退让，满招损谦受益。'},
  16:{num:16,name:'雷地豫',upper:'震',lower:'坤',overall:'豫卦：利建侯行师。愉悦安乐，顺势而为。'},
  17:{num:17,name:'泽雷随',upper:'兑',lower:'震',overall:'随卦：元亨利贞。随顺从时，择善而从。'},
  18:{num:18,name:'山风蛊',upper:'艮',lower:'巽',overall:'蛊卦：元亨。整治弊病，革故鼎新。'},
  19:{num:19,name:'地泽临',upper:'坤',lower:'兑',overall:'临卦：元亨利贞。以德临人，以诚待人。'},
  20:{num:20,name:'风地观',upper:'巽',lower:'坤',overall:'观卦：盥而不荐。观察审视，以智慧洞察。'},
  21:{num:21,name:'火雷噬嗑',upper:'离',lower:'震',overall:'噬嗑卦：亨利用狱。咬合治理，决断之象。'},
  22:{num:22,name:'山火贲',upper:'艮',lower:'离',overall:'贲卦：亨。修饰文饰，文质彬彬。'},
  23:{num:23,name:'山地剥',upper:'艮',lower:'坤',overall:'剥卦：不利有攸往。盛极而衰，宜守不宜进。'},
  24:{num:24,name:'地雷复',upper:'坤',lower:'震',overall:'复卦：亨七日来复。一阳来复，生机萌发。'},
  25:{num:25,name:'天雷无妄',upper:'乾',lower:'震',overall:'无妄卦：元亨利贞。不妄为，顺其自然。'},
  26:{num:26,name:'山天大畜',upper:'艮',lower:'乾',overall:'大畜卦：利贞。厚积薄发，蓄德养才。'},
  27:{num:27,name:'山雷颐',upper:'艮',lower:'震',overall:'颐卦：贞吉。颐养养生，自食其力。'},
  28:{num:28,name:'泽风大过',upper:'兑',lower:'巽',overall:'大过卦：栋桡。非常时期需非常之举。'},
  29:{num:29,name:'坎为水',upper:'坎',lower:'坎',overall:'坎卦：习坎有孚。险中之险，诚信可脱险。'},
  30:{num:30,name:'离为火',upper:'离',lower:'离',overall:'离卦：利贞亨。光明依附，文明照耀。'},
  31:{num:31,name:'泽山咸',upper:'兑',lower:'艮',overall:'咸卦：亨利贞。感应感通，以诚相感。'},
  32:{num:32,name:'雷风恒',upper:'震',lower:'巽',overall:'恒卦：亨无咎。持之以恒，坚守正道。'},
  33:{num:33,name:'天山遁',upper:'乾',lower:'艮',overall:'遁卦：亨。急流勇退，以退为进。'},
  34:{num:34,name:'雷天大壮',upper:'震',lower:'乾',overall:'大壮卦：利贞。刚健有为，不可恃强。'},
  35:{num:35,name:'火地晋',upper:'离',lower:'坤',overall:'晋卦：康侯用锡马。如日之升，步步高升。'},
  36:{num:36,name:'地火明夷',upper:'坤',lower:'离',overall:'明夷卦：利艰贞。韬光养晦以待时。'},
  37:{num:37,name:'风火家人',upper:'巽',lower:'离',overall:'家人卦：利女贞。各守其位，家道兴旺。'},
  38:{num:38,name:'火泽睽',upper:'离',lower:'兑',overall:'睽卦：小事吉。求同存异，和而不同。'},
  39:{num:39,name:'水山蹇',upper:'坎',lower:'艮',overall:'蹇卦：利西南。知难而进，逢凶化吉。'},
  40:{num:40,name:'雷水解',upper:'震',lower:'坎',overall:'解卦：利西南。脱离困境，险后坦途。'},
  41:{num:41,name:'山泽损',upper:'艮',lower:'兑',overall:'损卦：有孚元吉。损己利人，有舍有得。'},
  42:{num:42,name:'风雷益',upper:'巽',lower:'震',overall:'益卦：利有攸往。损上益下，助人天助。'},
  43:{num:43,name:'泽天夬',upper:'兑',lower:'乾',overall:'夬卦：扬于王庭。当断则断，果断行事。'},
  44:{num:44,name:'天风姤',upper:'乾',lower:'巽',overall:'姤卦：女壮勿取。不期而遇，机缘巧合。'},
  45:{num:45,name:'泽地萃',upper:'兑',lower:'坤',overall:'萃卦：亨。人才汇聚，群英荟萃。'},
  46:{num:46,name:'地风升',upper:'坤',lower:'巽',overall:'升卦：元亨。循序渐进，步步高升。'},
  47:{num:47,name:'泽水困',upper:'兑',lower:'坎',overall:'困卦：亨。坚守正道，安贫乐道。'},
  48:{num:48,name:'水风井',upper:'坎',lower:'巽',overall:'井卦：改邑不改井。修身养性，源源不绝。'},
  49:{num:49,name:'泽火革',upper:'兑',lower:'离',overall:'革卦：已日乃孚。除旧布新，改革图强。'},
  50:{num:50,name:'火风鼎',upper:'离',lower:'巽',overall:'鼎卦：元吉。革故鼎新，稳固基业。'},
  51:{num:51,name:'震为雷',upper:'震',lower:'震',overall:'震卦：亨。临危不乱，处变不惊。'},
  52:{num:52,name:'艮为山',upper:'艮',lower:'艮',overall:'艮卦：艮其背。适可而止，知止有定。'},
  53:{num:53,name:'风山渐',upper:'巽',lower:'艮',overall:'渐卦：女归吉。循序渐进，不可急躁。'},
  54:{num:54,name:'雷泽归妹',upper:'震',lower:'兑',overall:'归妹卦：征凶。名正言顺则吉。'},
  55:{num:55,name:'雷火丰',upper:'震',lower:'离',overall:'丰卦：亨。日中则昃，盛极防衰。'},
  56:{num:56,name:'火山旅',upper:'离',lower:'艮',overall:'旅卦：小亨。漂泊不定，宜谦逊。'},
  57:{num:57,name:'巽为风',upper:'巽',lower:'巽',overall:'巽卦：小亨。顺从而入，渐入佳境。'},
  58:{num:58,name:'兑为泽',upper:'兑',lower:'兑',overall:'兑卦：亨。以诚待人，和颜悦色。'},
  59:{num:59,name:'风水涣',upper:'巽',lower:'坎',overall:'涣卦：亨。散则复聚，聚合人心。'},
  60:{num:60,name:'水泽节',upper:'坎',lower:'兑',overall:'节卦：亨。适度节制，过刚则折。'},
  61:{num:61,name:'风泽中孚',upper:'巽',lower:'兑',overall:'中孚卦：豚鱼吉。真诚感动万物。'},
  62:{num:62,name:'雷山小过',upper:'震',lower:'艮',overall:'小过卦：亨。过犹不及，中庸之道。'},
  63:{num:63,name:'水火既济',upper:'坎',lower:'离',overall:'既济卦：亨小。功成守成，盛极将衰。'},
  64:{num:64,name:'火水未济',upper:'离',lower:'坎',overall:'未济卦：亨。事未竟成，继续努力。'},
}

const TRI: Record<string, string> = { '乾': '☰', '兑': '☱', '离': '☲', '震': '☳', '巽': '☴', '坎': '☵', '艮': '☶', '坤': '☷' }
const TRI_SYMBOL: Record<number, string> = { 0: '☰', 1: '☱', 2: '☲', 3: '☳', 4: '☴', 5: '☵', 6: '☶', 7: '☷' }

// ── 八宫五行六亲 ──
const GONG_WX: Record<string, string> = { '乾': '金', '兑': '金', '离': '火', '震': '木', '巽': '木', '坎': '水', '艮': '土', '坤': '土' }
const WX_SHENG: Record<string, string> = { '金': '水', '水': '木', '木': '火', '火': '土', '土': '金' }
const WX_KE: Record<string, string> = { '金': '木', '木': '土', '土': '水', '水': '火', '火': '金' }

function getLiuQin(yaoWx: string, gongWx: string): string {
  if (yaoWx === gongWx) return '兄弟'
  if (WX_SHENG[gongWx] === yaoWx) return '子孙'
  if (WX_SHENG[yaoWx] === gongWx) return '父母'
  if (WX_KE[gongWx] === yaoWx) return '妻财'
  return '官鬼'
}

const LIUQIN_COLOR: Record<string, string> = {
  '父母': 'text-purple-300', '兄弟': 'text-blue-300', '子孙': 'text-green-300',
  '妻财': 'text-yellow-300', '官鬼': 'text-red-300',
}

// ── 卦宫归属 ──
const GONG_SHIXU: Record<string, number[]> = {
  '乾': [1,44,13,10,9,14,43,5], '坎': [29,59,60,3,63,47,48,6],
  '艮': [52,53,62,56,31,33,39,15], '震': [51,16,40,54,55,34,17,24],
  '巽': [57,9,37,42,50,44,28,32], '离': [30,56,22,36,21,55,38,7],
  '坤': [2,20,35,45,16,12,46,11], '兑': [58,47,45,5,38,43,54,17],
}

function getGong(num: number): { gong: string; shiIdx: number; shiYao: number; yingYao: number } {
  for (const [gong, nums] of Object.entries(GONG_SHIXU)) {
    const idx = nums.indexOf(num)
    if (idx >= 0) {
      const yaoMap = [6, 1, 2, 3, 4, 5, 4, 3]
      const shi = yaoMap[idx] || 6
      const ying = shi <= 3 ? shi + 3 : shi - 3
      return { gong, shiIdx: idx, shiYao: shi, yingYao: ying }
    }
  }
  return { gong: '乾', shiIdx: 0, shiYao: 6, yingYao: 3 }
}

// ── 爻五行 ──
const YAO_WX: Record<string, string[]> = {
  '乾': ['木','木','土','土','水','水'], '坤': ['土','土','火','火','木','木'],
  '震': ['木','木','土','土','金','金'], '巽': ['木','木','火','火','金','金'],
  '坎': ['木','木','土','土','金','金'], '离': ['木','木','土','土','金','金'],
  '艮': ['木','木','水','水','金','金'], '兑': ['木','木','土','土','金','金'],
}

// ── 铜钱动画组件 ──
interface CoinData { result: boolean; settled: boolean }

function Coin({ result, settled, delay, tossing }: { result: boolean; settled: boolean; delay: number; tossing: boolean }) {
  return (
    <div className="relative w-12 h-12 sm:w-14 sm:h-14" style={{ perspective: '300px' }}>
      <div
        className="relative w-full h-full"
        style={{
          transformStyle: 'preserve-3d',
          transition: settled ? 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)' : 'none',
          transform: settled
            ? `rotateY(${result ? 0 : 180}deg)`
            : 'rotateY(0deg)',
          animation: tossing ? `coinFlip${delay % 3} 0.5s linear infinite` : 'none',
        }}
      >
        {/* 正面：字面（乾） */}
        <div
          className="absolute inset-0 rounded-full flex items-center justify-center"
          style={{
            backfaceVisibility: 'hidden',
            background: 'radial-gradient(circle at 40% 40%, #f0d080, #c89640 50%, #8b6914 100%)',
            border: '3px solid #b8860b',
            boxShadow: '0 2px 8px rgba(0,0,0,0.5), inset 0 1px 3px rgba(255,255,200,0.4)',
          }}
        >
          {/* 方孔 */}
          <div className="w-3 h-3 border-2 border-gold-800 rounded-[1px] bg-dark-900/40" />
          <span className="absolute text-[7px] font-bold text-amber-900/70 top-0.5">乾</span>
          <span className="absolute text-[7px] font-bold text-amber-900/70 bottom-0.5">隆</span>
          <span className="absolute text-[7px] font-bold text-amber-900/70 left-0.5">通</span>
          <span className="absolute text-[7px] font-bold text-amber-900/70 right-0.5">寶</span>
        </div>
        {/* 背面：满文/花纹 */}
        <div
          className="absolute inset-0 rounded-full flex items-center justify-center"
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            background: 'radial-gradient(circle at 40% 40%, #e8c860, #b8860b 50%, #7a5c00 100%)',
            border: '3px solid #a07828',
            boxShadow: '0 2px 8px rgba(0,0,0,0.5), inset 0 1px 3px rgba(255,255,200,0.4)',
          }}
        >
          <div className="w-3 h-3 border-2 border-amber-800 rounded-[1px] bg-dark-900/40" />
          <div className="absolute inset-2 rounded-full border border-amber-800/30" />
          <span className="absolute text-[6px] text-amber-800/60" style={{ top: '2px' }}>滿</span>
        </div>
      </div>
    </div>
  )
}

// ── 单爻渲染 ──
function YaoLine({ v, idx, shiYao, yingYao, gong, hexNum }: { v: number; idx: number; shiYao: number; yingYao: number; gong: string; hexNum: number }) {
  const isShi = idx === shiYao; const isYing = idx === yingYao
  const yaos = YAO_WX[gong] || YAO_WX['乾']
  const wx = yaos[6 - idx] || '土'
  const lq = getLiuQin(wx, GONG_WX[gong] || '金')
  return (
    <div className={`flex items-center gap-1 py-0.5 ${isShi || isYing ? 'bg-gold-900/15 -mx-2 px-2 rounded' : ''}`}>
      <span className="w-5 text-[9px] text-gray-500 text-right">{idx}</span>
      {v === 0 ? (
        <><span className="block w-5 h-0.5 bg-gold-400 rounded" /><span className="block w-2 h-0.5 bg-dark-700" /><span className="block w-5 h-0.5 bg-gold-400 rounded" /></>
      ) : (
        <><span className="block w-5 h-0.5 bg-amber-600 rounded" /><span className="block w-0.5 h-0.5 bg-amber-600 rounded-full" /><span className="block w-5 h-0.5 bg-amber-600 rounded" /></>
      )}
      <span className={`text-[9px] ${LIUQIN_COLOR[lq]} w-8`}>{lq}</span>
      {isShi && <span className="text-[8px] text-gold-400 font-bold ml-1">世</span>}
      {isYing && <span className="text-[8px] text-gold-500 ml-1">应</span>}
    </div>
  )
}

// ── 动爻标记 ──
function YaoLineWithChange({ v, idx, shiYao, yingYao, gong, hexNum, changing }: { v: number; idx: number; shiYao: number; yingYao: number; gong: string; hexNum: number; changing: number[] }) {
  const isChanging = changing.includes(6 - idx)
  return (
    <div className="flex items-center gap-1 py-0.5">
      <YaoLine v={v} idx={idx} shiYao={shiYao} yingYao={yingYao} gong={gong} hexNum={hexNum} />
      {isChanging && (
        <span className="text-[8px] text-amber-500 animate-pulse">○</span>
      )}
    </div>
  )
}

export default function LiuyaoClient() {
  const [mode, setMode] = useState<'auto' | 'manual'>('manual')
  const [result, setResult] = useState<any>(null)

  // ── 手动摇卦状态 ──
  const [manualLines, setManualLines] = useState<number[]>([])
  const [manualChangings, setManualChangings] = useState<number[]>([])
  const [isTossing, setIsTossing] = useState(false)
  const [coinResults, setCoinResults] = useState<boolean[]>([])
  const [coinSettled, setCoinSettled] = useState(false)
  const [tossCount, setTossCount] = useState(0)
  const [showResult, setShowResult] = useState(false)
  const [currentLineDesc, setCurrentLineDesc] = useState('')

  // ── 自动起卦动画状态 ──
  const [autoAnimating, setAutoAnimating] = useState(false)
  const [autoAnimLines, setAutoAnimLines] = useState<number[]>([])
  const [autoAnimStep, setAutoAnimStep] = useState(0)
  const autoTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  const tossCoin = () => Math.random() < 0.5

  // ── 解析投掷结果 ──
  const parseToss = (heads: number) => {
    // 3阳 = 老阳 (变爻) → line 0, changing
    // 2阳1阴 = 少阳 → line 1
    // 1阳2阴 = 少阴 → line 0
    // 3阴 = 老阴 (变爻) → line 1, changing
    if (heads === 3) return { line: 0, changing: true }
    if (heads === 2) return { line: 1, changing: false }
    if (heads === 1) return { line: 0, changing: false }
    return { line: 1, changing: true }
  }

  const getLineDesc = (heads: number) => {
    if (heads === 3) return '老阳 ▬▬▬ ⟶ ▬ ▬'
    if (heads === 2) return '少阳 ▬▬▬▬▬'
    if (heads === 1) return '少阴 ▬ ▬'
    return '老阴 ▬ ▬ ⟶ ▬▬▬'
  }

  // ── 手动摇卦：一次投掷 ──
  const doToss = () => {
    if (isTossing || tossCount >= 6) return
    setIsTossing(true)
    setCoinSettled(false)
    setCoinResults([])
    setShowResult(false)

    // 预计算结果
    const coins = [tossCoin(), tossCoin(), tossCoin()]

    // 先展示翻转动效
    setTimeout(() => {
      setCoinResults(coins)
      setCoinSettled(true)
      const heads = coins.filter(Boolean).length
      const { line, changing } = parseToss(heads)
      setCurrentLineDesc(getLineDesc(heads))

      const newLines = [...manualLines, line]
      const newChangings = changing ? [...manualChangings, tossCount] : manualChangings
      setManualLines(newLines)
      setManualChangings(newChangings)
      setIsTossing(false)

      // 1.5s后淡出当前结果
      setTimeout(() => {
        setShowResult(true)
        setTossCount(tossCount + 1)
        if (tossCount + 1 >= 6) {
          finishCast(newLines, newChangings)
        }
      }, 800)
    }, 1300)
  }

  // ── 自动起卦（带动画） ──
  const autoCast = () => {
    if (autoAnimating) return
    setResult(null)
    setManualLines([])
    setManualChangings([])
    setTossCount(0)
    setAutoAnimating(true)
    setAutoAnimLines([])
    setAutoAnimStep(0)

    const lines: number[] = []
    const changing: number[] = []
    for (let i = 0; i < 6; i++) {
      const heads = [tossCoin(), tossCoin(), tossCoin()].filter(Boolean).length
      const { line, changing: ch } = parseToss(heads)
      lines.push(line)
      if (ch) changing.push(i)
    }

    // 逐行动画
    let step = 0
    const animateStep = () => {
      if (step >= 6) {
        setAutoAnimating(false)
        finishCast(lines, changing)
        return
      }
      setAutoAnimLines(prev => [...prev, lines[step]])
      setAutoAnimStep(step + 1)
      step++
      autoTimerRef.current = setTimeout(animateStep, 700)
    }
    autoTimerRef.current = setTimeout(animateStep, 400)
  }

  useEffect(() => {
    return () => { if (autoTimerRef.current) clearTimeout(autoTimerRef.current) }
  }, [])

  // ── 完成占卜 ──
  const finishCast = (lines: number[], changing: number[]) => {
    const lower = lines.slice(0, 3).reverse(); const upper = lines.slice(3, 6).reverse()
    let li = 0, ui = 0; for (let i = 0; i < 3; i++) { li = (li << 1) | lower[i]; ui = (ui << 1) | upper[i] }
    const num = ui * 8 + li + 1
    const h = H[num] || H[1]
    const { gong, shiYao, yingYao } = getGong(num)
    let cv: any = null
    if (changing.length > 0) {
      const cl = lines.map((v, i) => changing.includes(i) ? (v === 0 ? 1 : 0) : v)
      const cl2 = cl.slice(0, 3).reverse(); const cu = cl.slice(3, 6).reverse()
      let cli = 0, cui = 0; for (let i = 0; i < 3; i++) { cli = (cli << 1) | cl2[i]; cui = (cui << 1) | cu[i] }
      const cnum = cui * 8 + cli + 1
      cv = H[cnum] || H[1]
    }
    setResult({ lines, changing, hexagram: h, cv, gong, shiYao, yingYao })
  }

  // ── 重置 ──
  const reset = () => {
    setResult(null)
    setManualLines([])
    setManualChangings([])
    setTossCount(0)
    setCoinResults([])
    setCoinSettled(false)
    setIsTossing(false)
    setShowResult(false)
    setCurrentLineDesc('')
    setAutoAnimating(false)
    setAutoAnimLines([])
    setAutoAnimStep(0)
    if (autoTimerRef.current) clearTimeout(autoTimerRef.current)
  }

  const r = result
  const YAO_NAMES = ['初爻', '二爻', '三爻', '四爻', '五爻', '上爻']
  const completedCount = manualLines.length

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gold-400 font-serif mb-3">六爻占卜</h1>
      <p className="text-gray-400 mb-6">三枚铜钱 · 逐爻摇卦 · 世应六亲 · 卦象全解</p>

      {/* 模式切换 */}
      <div className="flex gap-2 mb-6">
        <button onClick={() => { reset(); setMode('manual') }}
          className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${mode === 'manual' ? 'bg-gold-600 text-dark-900' : 'bg-dark-700 text-gray-400 border border-dark-600'}`}>
          🪙 手动摇卦
        </button>
        <button onClick={() => { reset(); setMode('auto') }}
          className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${mode === 'auto' ? 'bg-gold-600 text-dark-900' : 'bg-dark-700 text-gray-400 border border-dark-600'}`}>
          ⚡ 自动起卦
        </button>
      </div>

      {/* ============ 手动摇卦区域 ============ */}
      {mode === 'manual' && !r && (
        <div className="bg-dark-800/80 backdrop-blur rounded-xl border border-dark-600 p-6 mb-8">
          {/* 卦象进度 */}
          <div className="flex justify-center mb-6">
            <div className="flex flex-col-reverse items-center gap-0.5">
              {[5, 4, 3, 2, 1, 0].map(i => (
                <div key={i} className="flex items-center gap-1">
                  <span className="text-[9px] text-gray-500 w-8 text-right">{YAO_NAMES[i]}</span>
                  {i < completedCount ? (
                    manualLines[i] === 0 ? (
                      <div className="flex items-center gap-1">
                        <span className="block w-6 h-0.5 bg-gold-400 rounded" />
                        <span className="block w-2 h-0.5 bg-dark-700" />
                        <span className="block w-6 h-0.5 bg-gold-400 rounded" />
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <span className="block w-6 h-0.5 bg-amber-600 rounded" />
                        <span className="block w-0.5 h-0.5 bg-amber-600 rounded-full" />
                        <span className="block w-6 h-0.5 bg-amber-600 rounded" />
                      </div>
                    )
                  ) : (
                    <span className="text-gray-700 text-xs w-[58px] text-center">
                      {i === completedCount ? (isTossing ? '...' : '←') : '—'}
                    </span>
                  )}
                  {manualChangings.includes(i) && (
                    <span className="text-[8px] text-amber-500">○动</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 铜钱展示区 */}
          <div className="flex items-center justify-center gap-4 sm:gap-6 mb-4 min-h-[80px]">
            {[0, 1, 2].map(i => (
              <Coin
                key={`${tossCount}-${i}`}
                result={coinResults[i] ?? true}
                settled={coinSettled}
                delay={i}
                tossing={isTossing}
              />
            ))}
          </div>

          {/* 当前爻说明 */}
          {coinSettled && !showResult && (
            <div className="text-center mb-3 animate-fadeIn">
              <p className="text-sm text-gray-300">
                {coinResults.filter(Boolean).length} 阳 {coinResults.filter(b => !b).length} 阴
              </p>
              <p className="text-sm font-semibold text-gold-400 mt-1">{currentLineDesc}</p>
            </div>
          )}

          {/* 摇卦按钮 */}
          <div className="text-center">
            {tossCount < 6 ? (
              <button
                onClick={doToss}
                disabled={isTossing}
                className="bg-gold-600 hover:bg-gold-500 disabled:bg-dark-600 disabled:text-gray-500 text-dark-900 font-semibold px-8 py-3 rounded-lg text-lg transition-all active:scale-95 disabled:cursor-not-allowed"
              >
                {isTossing ? '🪙 铜钱翻转中...' : `🪙 摇第 ${tossCount + 1} 次`}
              </button>
            ) : (
              <p className="text-gold-400 text-sm">卦已成形 ↓</p>
            )}
            <p className="text-[10px] text-gray-600 mt-2">
              {tossCount < 6 ? `三枚铜钱 · 共摇六次 · 已完成 ${completedCount}/6` : '六爻齐备'}
            </p>
          </div>

          {/* 已完成的爻记录 */}
          {completedCount > 0 && (
            <div className="mt-4 pt-4 border-t border-dark-600">
              <p className="text-[10px] text-gray-500 mb-2">摇卦记录</p>
              <div className="flex flex-wrap gap-1.5">
                {manualLines.map((v, i) => (
                  <span key={i} className={`text-[10px] px-2 py-0.5 rounded ${
                    v === 0
                      ? 'bg-gold-900/30 text-gold-400 border border-gold-700/40'
                      : 'bg-amber-900/20 text-amber-400 border border-amber-700/40'
                  }`}>
                    {YAO_NAMES[i]} {v === 0 ? '⚊' : '⚋'}
                    {manualChangings.includes(i) && ' ○'}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============ 自动起卦区域 ============ */}
      {mode === 'auto' && !r && (
        <div className="bg-dark-800/80 backdrop-blur rounded-xl border border-dark-600 p-6 mb-8">
          {autoAnimating ? (
            <div className="flex flex-col items-center gap-4">
              <p className="text-gold-400 text-sm animate-pulse">☯ 铜钱翻转中...</p>
              <div className="flex flex-col-reverse items-center gap-0.5">
                {[5, 4, 3, 2, 1, 0].map(i => (
                  <div key={i} className="flex items-center gap-1">
                    <span className="text-[9px] text-gray-500 w-8 text-right">{YAO_NAMES[i]}</span>
                    {i < autoAnimStep ? (
                      autoAnimLines[i] === 0 ? (
                        <div className="flex items-center gap-1 animate-fadeIn">
                          <span className="block w-6 h-0.5 bg-gold-400 rounded" />
                          <span className="block w-2 h-0.5 bg-dark-700" />
                          <span className="block w-6 h-0.5 bg-gold-400 rounded" />
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 animate-fadeIn">
                          <span className="block w-6 h-0.5 bg-amber-600 rounded" />
                          <span className="block w-0.5 h-0.5 bg-amber-600 rounded-full" />
                          <span className="block w-6 h-0.5 bg-amber-600 rounded" />
                        </div>
                      )
                    ) : i === autoAnimStep ? (
                      <span className="text-amber-500 text-xs animate-pulse">🪙</span>
                    ) : (
                      <span className="text-gray-700 text-xs">—</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center">
              <button onClick={autoCast} className="bg-gold-600 hover:bg-gold-500 text-dark-900 font-semibold px-8 py-3 rounded-lg text-lg transition-all active:scale-95">
                ☯ 一键起卦
              </button>
              <p className="text-[10px] text-gray-500 mt-2">自动模拟六次铜钱投掷</p>
            </div>
          )}
        </div>
      )}

      {/* ============ 解卦结果 ============ */}
      {r && (
        <div className="space-y-4 animate-fadeIn">
          <div className="bg-dark-800/80 backdrop-blur rounded-xl border border-dark-600 p-5">
            <div className="text-center mb-3">
              <p className="text-2xl text-gold-400 font-serif">
                {TRI[r.hexagram.upper]}{TRI[r.hexagram.lower]} {r.hexagram.name}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                第{r.hexagram.num}卦 · {r.hexagram.upper}上{r.hexagram.lower}下 · {r.gong}宫{GONG_WX[r.gong]}属性
              </p>
            </div>

            {/* 卦象展示 */}
            <div className="flex justify-center mb-3">
              <div className="flex flex-col items-center">
                {r.lines.map((v: number, i: number) => (
                  <YaoLineWithChange
                    key={5 - i}
                    v={v}
                    idx={6 - i}
                    shiYao={r.shiYao}
                    yingYao={r.yingYao}
                    gong={r.gong}
                    hexNum={r.hexagram.num}
                    changing={r.changing}
                  />
                ))}
              </div>
            </div>

            {r.changing.length > 0 && (
              <p className="text-xs text-gold-500 text-center mb-3">
                动爻：第{r.changing.map((c: number) => 6 - c).join('、')}爻
              </p>
            )}

            <div className="pt-3 border-t border-dark-600">
              <p className="text-sm text-gray-300 leading-relaxed">{r.hexagram.overall}</p>
            </div>
          </div>

          {/* 变卦 */}
          {r.cv && (
            <div className="bg-dark-800/80 backdrop-blur rounded-xl border border-gold-500/30 p-5">
              <div className="text-center mb-2">
                <p className="text-xs text-gold-500 mb-1">变卦</p>
                <p className="text-lg text-gold-400 font-serif">
                  {TRI[r.cv.upper]}{TRI[r.cv.lower]} {r.cv.name}
                </p>
              </div>
              <p className="text-sm text-gray-300 leading-relaxed">{r.cv.overall}</p>
            </div>
          )}

          {/* 重新起卦 */}
          <div className="text-center">
            <button onClick={reset} className="text-xs text-gray-500 hover:text-gold-400 underline transition-colors">
              重新起卦
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
