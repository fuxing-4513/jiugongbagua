'use client'

import { useState, useCallback } from 'react'

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
for (let i = 9; i <= 10; i++) { if (!H[i]) H[i] = H[1] }

const TRI: Record<string, string> = { '乾': '☰', '兑': '☱', '离': '☲', '震': '☳', '巽': '☴', '坎': '☵', '艮': '☶', '坤': '☷' }

// ── 八宫五行 ──
const GONG_WX: Record<string, string> = { '乾': '金', '兑': '金', '离': '火', '震': '木', '巽': '木', '坎': '水', '艮': '土', '坤': '土' }
const WX_SHENG: Record<string, string> = { '金': '水', '水': '木', '木': '火', '火': '土', '土': '金' }
const WX_KE: Record<string, string> = { '金': '木', '木': '土', '土': '水', '水': '火', '火': '金' }
const LIUQIN: Record<string, string> = { 'tong': '兄弟', 'wo_sheng': '子孙', 'sheng_wo': '父母', 'wo_ke': '妻财', 'ke_wo': '官鬼' }

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
// 八宫序列：一世->二世->三世->四世->五世->游魂->归魂
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
      const yaoMap = [6, 1, 2, 3, 4, 5, 4, 3] // 纯->6, 一世->1, ..., 游魂->4, 归魂->3
      const shi = yaoMap[idx] || 6
      const ying = shi <= 3 ? shi + 3 : shi - 3
      return { gong, shiIdx: idx, shiYao: shi, yingYao: ying }
    }
  }
  return { gong: '乾', shiIdx: 0, shiYao: 6, yingYao: 3 }
}

// ── 爻五行(纳甲简化) ──
const YAO_WX: Record<string, string[]> = {
  '乾': ['木','木','土','土','水','水'], '坤': ['土','土','火','火','木','木'],
  '震': ['木','木','土','土','金','金'], '巽': ['木','木','火','火','金','金'],
  '坎': ['木','木','土','土','金','金'], '离': ['木','木','土','土','金','金'],
  '艮': ['木','木','水','水','金','金'], '兑': ['木','木','土','土','金','金'],
}

function YaoLine({ v, idx, shiYao, yingYao, gong, hexNum }: { v: number; idx: number; shiYao: number; yingYao: number; gong: string; hexNum: number }) {
  const isShi = idx === shiYao; const isYing = idx === yingYao
  const yaos = YAO_WX[gong] || YAO_WX['乾']
  const wx = yaos[6 - idx] || '土'
  const lq = getLiuQin(wx, GONG_WX[gong] || '金')
  return (<div className={`flex items-center gap-1 py-0.5 ${isShi || isYing ? 'bg-gold-900/15 -mx-2 px-2 rounded' : ''}`}>
    <span className="w-5 text-[9px] text-gray-500 text-right">{idx}</span>
    {v === 0 ? <><span className="block w-5 h-0.5 bg-gold-400 rounded" /><span className="block w-2 h-0.5 bg-dark-700" /><span className="block w-5 h-0.5 bg-gold-400 rounded" /></>
      : <><span className="block w-5 h-0.5 bg-amber-600 rounded" /><span className="block w-0.5 h-0.5 bg-amber-600 rounded-full" /><span className="block w-5 h-0.5 bg-amber-600 rounded" /></>}
    <span className={`text-[9px] ${LIUQIN_COLOR[lq]} w-8`}>{lq}</span>
    {isShi && <span className="text-[8px] text-gold-400 font-bold ml-1">世</span>}
    {isYing && <span className="text-[8px] text-gold-500 ml-1">应</span>}
  </div>)
}

export default function LiuyaoClient() {
  const [manualLines, setManualLines] = useState<number[]>([])
  const [mode, setMode] = useState<'auto' | 'manual'>('auto')
  const [result, setResult] = useState<any>(null)

  const tossCoin = () => Math.random() < 0.5

  const autoCast = () => {
    const lines: number[] = []
    const changing: number[] = []
    for (let i = 0; i < 6; i++) {
      const heads = [tossCoin(), tossCoin(), tossCoin()].filter(Boolean).length
      if (heads === 3) { lines.push(0); changing.push(i) }
      else if (heads === 2) { lines.push(1) }
      else if (heads === 1) { lines.push(0) }
      else { lines.push(1); changing.push(i) }
    }
    finishCast(lines, changing)
    setManualLines([])
  }

  const manualToss = () => {
    const heads = [tossCoin(), tossCoin(), tossCoin()].filter(Boolean).length
    let line: number
    if (heads === 3) line = 0
    else if (heads === 2) line = 1
    else if (heads === 1) line = 0
    else line = 1
    const newLines = [...manualLines, line]
    setManualLines(newLines)
    if (newLines.length === 6) finishCast(newLines, [])
  }

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

  const r = result

  return (<div className="max-w-3xl mx-auto px-4 py-10">
    <h1 className="text-3xl font-bold text-gold-400 font-serif mb-3">六爻占卜</h1>
    <p className="text-gray-400 mb-6">手动摇卦或自动起卦·世应·六亲·卦象全解</p>

    <div className="flex gap-2 mb-6">
      <button onClick={() => { setMode('auto'); setResult(null); setManualLines([]) }}
        className={`px-3 py-1.5 text-xs rounded-lg ${mode === 'auto' ? 'bg-gold-600 text-dark-900' : 'bg-dark-700 text-gray-400 border border-dark-600'}`}>⚡ 自动起卦</button>
      <button onClick={() => { setMode('manual'); setResult(null); setManualLines([]) }}
        className={`px-3 py-1.5 text-xs rounded-lg ${mode === 'manual' ? 'bg-gold-600 text-dark-900' : 'bg-dark-700 text-gray-400 border border-dark-600'}`}>🪙 手动摇卦</button>
    </div>

    {mode === 'auto' && (<div className="bg-dark-800/80 backdrop-blur rounded-xl border border-dark-600 p-6 mb-8 text-center">
      <button onClick={autoCast} className="bg-gold-600 hover:bg-gold-500 text-dark-900 font-semibold px-8 py-3 rounded-lg text-lg transition-all active:scale-95">☯ 一键起卦</button>
    </div>)}

    {mode === 'manual' && (<div className="bg-dark-800/80 backdrop-blur rounded-xl border border-dark-600 p-6 mb-8 text-center">
      <p className="text-xs text-gray-400 mb-3">摇卦：点击「摇一次」掷三枚硬币，共摇6次</p>
      <div className="flex items-center justify-center gap-2 mb-3">
        {manualLines.map((v, i) => (
          <span key={i} className={`text-xs px-2 py-1 rounded ${v === 0 ? 'bg-gold-700/40 text-gold-300' : 'bg-amber-700/40 text-amber-300'}`}>
            {v === 0 ? '⚊' : '⚋'} {i + 1}
          </span>
        ))}
        {Array.from({ length: 6 - manualLines.length }).map((_, i) => (
          <span key={i} className="text-xs px-2 py-1 rounded bg-dark-700 text-gray-600">_ {manualLines.length + i + 1}</span>
        ))}
      </div>
      <button onClick={manualToss} disabled={manualLines.length >= 6}
        className="bg-gold-600 hover:bg-gold-500 disabled:bg-dark-600 disabled:text-gray-500 text-dark-900 font-semibold px-6 py-2.5 rounded-lg transition-all active:scale-95">
        {manualLines.length >= 6 ? '已完成' : `摇一次（${manualLines.length}/6）`}
      </button>
    </div>)}

    {r && (<div className="space-y-4">
      <div className="bg-dark-800/80 backdrop-blur rounded-xl border border-dark-600 p-5">
        <div className="text-center mb-3">
          <p className="text-xs text-gray-400 mb-1">{r.hexagram.name}</p>
          <p className="text-2xl text-gold-400 font-serif">
            {TRI[r.hexagram.upper]}{TRI[r.hexagram.lower]} {r.hexagram.name} 第{r.hexagram.num}卦
          </p>
          <p className="text-xs text-gray-400">{r.hexagram.upper}上{r.hexagram.lower}下 · {r.gong}宫 {GONG_WX[r.gong]}属性</p>
        </div>
        <div className="flex flex-col items-center">
          {r.lines.map((v: number, i: number) => (
            <YaoLine key={5 - i} v={v} idx={6 - i} shiYao={r.shiYao} yingYao={r.yingYao} gong={r.gong} hexNum={r.hexagram.num} />
          ))}
        </div>
        {r.changing.length > 0 && <p className="text-xs text-gold-500 text-center mt-2">动爻：第{r.changing.map((c: number) => 6 - c).join('、')}爻</p>}
        <div className="mt-3 pt-3 border-t border-dark-600">
          <p className="text-sm text-gray-300 leading-relaxed">{r.hexagram.overall}</p>
        </div>
      </div>

      {r.cv && (<div className="bg-dark-800/80 backdrop-blur rounded-xl border border-gold-500/30 p-5">
        <div className="text-center mb-2">
          <p className="text-xs text-gold-500 mb-1">变卦</p>
          <p className="text-lg text-gold-400 font-serif">{TRI[r.cv.upper]}{TRI[r.cv.lower]} {r.cv.name}</p>
        </div>
        <p className="text-sm text-gray-300">{r.cv.overall}</p>
      </div>)}
    </div>)}
  </div>)
}
