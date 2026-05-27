'use client'

import { useState, useCallback } from 'react'
import { useLocale } from '@/lib/i18n'

// ── i18n helper ──
function tk(key: string, lang: Record<string, unknown>): string {
  const keys = key.split('.')
  let v: unknown = lang
  for (const k of keys) {
    if (typeof v !== 'object' || v === null) return key
    v = (v as Record<string, unknown>)[k]
  }
  return typeof v === 'string' ? v : key
}

// ── 64卦完整数据 ──
interface Hexagram {
  num: number
  name: string
  upper: string
  lower: string
  overall: string
}

const HEXAGRAMS: Record<number, Hexagram> = {
  1: { num: 1, name: '乾为天', upper: '乾', lower: '乾', overall: '乾卦：元亨利贞。天行健，君子以自强不息。象征创始、强健、刚毅，是积极进取之象。' },
  2: { num: 2, name: '坤为地', upper: '坤', lower: '坤', overall: '坤卦：元亨，利牝马之贞。地势坤，君子以厚德载物。象征包容、柔顺、承载，以柔克刚之象。' },
  3: { num: 3, name: '水雷屯', upper: '坎', lower: '震', overall: '屯卦：元亨利贞，勿用有攸往。万物初生，困难重重，宜守不宜进，待时而动。' },
  4: { num: 4, name: '山水蒙', upper: '艮', lower: '坎', overall: '蒙卦：亨。匪我求童蒙，童蒙求我。象征启蒙、教育，虚心求教必有所得。' },
  5: { num: 5, name: '水天需', upper: '坎', lower: '乾', overall: '需卦：有孚，光亨，贞吉。需者须也，等待时机，诚信守正则吉。' },
  6: { num: 6, name: '天水讼', upper: '乾', lower: '坎', overall: '讼卦：有孚窒惕，中吉。象征争讼、冲突，宜和解不宜争斗。' },
  7: { num: 7, name: '地水师', upper: '坤', lower: '坎', overall: '师卦：贞丈人吉，无咎。师者众也，象征军队、统率，师出有名则吉。' },
  8: { num: 8, name: '水地比', upper: '坎', lower: '坤', overall: '比卦：吉。比者亲也，象征亲和、团结，亲附有道之人则吉。' },
  9: { num: 9, name: '风天小畜', upper: '巽', lower: '乾', overall: '小畜卦：亨。密云不雨，自我西郊。小有积蓄，蓄势待发之象。' },
  10: { num: 10, name: '天泽履', upper: '乾', lower: '兑', overall: '履卦：履虎尾，不咥人，亨。履行、实践，虽险亦吉，谨慎行之。' },
  11: { num: 11, name: '地天泰', upper: '坤', lower: '乾', overall: '泰卦：小往大来，吉亨。天地交泰，万事通达，吉祥如意之象。' },
  12: { num: 12, name: '天地否', upper: '乾', lower: '坤', overall: '否卦：否之匪人，不利君子贞。天地不交，闭塞不通，宜隐忍待时。' },
  13: { num: 13, name: '天火同人', upper: '乾', lower: '离', overall: '同人卦：同人于野，亨。志同道合，团结协作，天下为公之象。' },
  14: { num: 14, name: '大有', upper: '离', lower: '乾', overall: '大有卦：元亨。大获所有，丰收富足，光明普照之象。' },
  15: { num: 15, name: '地山谦', upper: '坤', lower: '艮', overall: '谦卦：亨，君子有终。谦逊退让，德行高尚，满招损谦受益。' },
  16: { num: 16, name: '雷地豫', upper: '震', lower: '坤', overall: '豫卦：利建侯行师。愉悦安乐，顺势而为，不可沉迷享乐。' },
  17: { num: 17, name: '泽雷随', upper: '兑', lower: '震', overall: '随卦：元亨利贞，无咎。随顺从时，随机应变，择善而从。' },
  18: { num: 18, name: '山风蛊', upper: '艮', lower: '巽', overall: '蛊卦：元亨。整治弊病，革故鼎新，在混乱中重建秩序。' },
  19: { num: 19, name: '地临', upper: '坤', lower: '兑', overall: '临卦：元亨利贞。面临、临近，以德临人，以诚待人。' },
  20: { num: 20, name: '风地观', upper: '巽', lower: '坤', overall: '观卦：盥而不荐，有孚颙若。观察、审视，以智慧洞察万物。' },
  21: { num: 21, name: '火雷噬嗑', upper: '离', lower: '震', overall: '噬嗑卦：亨。利用狱。咬合、治理，象征刑罚和决断。' },
  22: { num: 22, name: '山火贲', upper: '艮', lower: '离', overall: '贲卦：亨。修饰、文饰，文质彬彬，但不可过度浮华。' },
  23: { num: 23, name: '山地剥', upper: '艮', lower: '坤', overall: '剥卦：不利有攸往。剥落、侵蚀，盛极而衰，宜守不宣进。' },
  24: { num: 24, name: '地雷复', upper: '坤', lower: '震', overall: '复卦：亨。七日来复。回复、复兴，一阳来复，生机萌发。' },
  25: { num: 25, name: '天雷无妄', upper: '乾', lower: '震', overall: '无妄卦：元亨利贞。不妄为，顺其自然，诚实行事则吉。' },
  26: { num: 26, name: '山天大畜', upper: '艮', lower: '乾', overall: '大畜卦：利贞。大积蓄、大涵养，厚积薄发，蓄德养才。' },
  27: { num: 27, name: '山雷颐', upper: '艮', lower: '震', overall: '颐卦：贞吉。颐养、养生，自食其力，言语谨慎以养德。' },
  28: { num: 28, name: '泽风大过', upper: '兑', lower: '巽', overall: '大过卦：栋桡。过度、非常，力不胜任，非常时期需非常之举。' },
  29: { num: 29, name: '坎为水', upper: '坎', lower: '坎', overall: '坎卦：习坎，有孚。险中之险，面临重重困难，诚信可脱险。' },
  30: { num: 30, name: '离为火', upper: '离', lower: '离', overall: '离卦：利贞，亨。光明、依附，如日月之明，以文明照耀四方。' },
  31: { num: 31, name: '泽山咸', upper: '兑', lower: '艮', overall: '咸卦：亨，利贞。感应、感通，男女相悦，以诚相感。' },
  32: { num: 32, name: '雷风恒', upper: '震', lower: '巽', overall: '恒卦：亨，无咎。恒久、持久，持之以恒，坚守正道。' },
  33: { num: 33, name: '天山遁', upper: '乾', lower: '艮', overall: '遁卦：亨。退避、隐退，急流勇退，以退为进。' },
  34: { num: 34, name: '雷天大壮', upper: '震', lower: '乾', overall: '大壮卦：利贞。盛大、强盛，刚健有为，但不可恃强妄为。' },
  35: { num: 35, name: '火地晋', upper: '离', lower: '坤', overall: '晋卦：康侯用锡马蕃庶。前进、晋升，如日之升，步步高升。' },
  36: { num: 36, name: '地火明夷', upper: '坤', lower: '离', overall: '明夷卦：利艰贞。光明受伤，晦暗时期，韬光养晦以待时。' },
  37: { num: 37, name: '风火家人', upper: '巽', lower: '离', overall: '家人卦：利女贞。家庭、家道，各守其位，家道兴旺。' },
  38: { num: 38, name: '火泽睽', upper: '离', lower: '兑', overall: '睽卦：小事吉。乖离、分歧，求同存异，和而不同。' },
  39: { num: 39, name: '水山蹇', upper: '坎', lower: '艮', overall: '蹇卦：利西南，不利东北。艰难险阻，知难而进，逢凶化吉。' },
  40: { num: 40, name: '雷水解', upper: '震', lower: '坎', overall: '解卦：利西南。解脱、缓解，脱离困境，险难过后见坦途。' },
  41: { num: 41, name: '山泽损', upper: '艮', lower: '兑', overall: '损卦：有孚元吉。减损、损失，损己利人，有舍才有得。' },
  42: { num: 42, name: '风雷益', upper: '巽', lower: '震', overall: '益卦：利有攸往。增益、利益，损上益下，助人者天助之。' },
  43: { num: 43, name: '泽天夬', upper: '兑', lower: '乾', overall: '夬卦：扬于王庭。决断、决裂，当断则断，果断行事。' },
  44: { num: 44, name: '天风姤', upper: '乾', lower: '巽', overall: '姤卦：女壮。相遇、邂逅，不期而遇，机缘巧合。' },
  45: { num: 45, name: '泽地萃', upper: '兑', lower: '坤', overall: '萃卦：亨。聚集、荟萃，人才汇聚，群英荟萃之象。' },
  46: { num: 46, name: '地风升', upper: '坤', lower: '巽', overall: '升卦：元亨。上升、晋升，循序渐进，步步高升。' },
  47: { num: 47, name: '泽水困', upper: '兑', lower: '坎', overall: '困卦：亨。穷困、困境，坚守正道，安贫乐道终有亨通。' },
  48: { num: 48, name: '水风井', upper: '坎', lower: '巽', overall: '井卦：改邑不改井。井养万物，修身养性，源源不绝。' },
  49: { num: 49, name: '泽火革', upper: '兑', lower: '离', overall: '革卦：已日乃孚。变革、革命，除旧布新，改革图强。' },
  50: { num: 50, name: '火风鼎', upper: '离', lower: '巽', overall: '鼎卦：元吉。鼎立、鼎新，革故鼎新，稳固基业。' },
  51: { num: 51, name: '震为雷', upper: '震', lower: '震', overall: '震卦：亨。震惊、震动，临危不乱，处变不惊。' },
  52: { num: 52, name: '艮为山', upper: '艮', lower: '艮', overall: '艮卦：艮其背。停止、静止，适可而止，知止而后有定。' },
  53: { num: 53, name: '风山渐', upper: '巽', lower: '艮', overall: '渐卦：女归吉。渐进、渐入，循序渐进，不可急躁。' },
  54: { num: 54, name: '雷泽归妹', upper: '震', lower: '兑', overall: '归妹卦：征凶。少女出嫁，名分不正则凶，宜守正。' },
  55: { num: 55, name: '雷火丰', upper: '震', lower: '离', overall: '丰卦：亨。丰盛、丰饶，日中则昃，盛极防衰。' },
  56: { num: 56, name: '火山旅', upper: '离', lower: '艮', overall: '旅卦：小亨。旅行、旅居，漂泊不定，宜谦逊谨慎。' },
  57: { num: 57, name: '巽为风', upper: '巽', lower: '巽', overall: '巽卦：小亨。顺从、谦逊，如风之入，渐入佳境。' },
  58: { num: 58, name: '兑为泽', upper: '兑', lower: '兑', overall: '兑卦：亨。喜悦、快乐，以诚待人，和颜悦色。' },
  59: { num: 59, name: '风水涣', upper: '巽', lower: '坎', overall: '涣卦：亨。涣散、离散，散则复聚，聚合人心以渡难关。' },
  60: { num: 60, name: '水泽节', upper: '坎', lower: '兑', overall: '节卦：亨。节制、节俭，过刚则折，适度为宜。' },
  61: { num: 61, name: '风泽中孚', upper: '巽', lower: '兑', overall: '中孚卦：豚鱼吉。诚信、信实，如豚鱼之信，真诚感动万物。' },
  62: { num: 62, name: '雷山小过', upper: '震', lower: '艮', overall: '小过卦：亨。小有过失，过犹不及，宜守中庸之道。' },
  63: { num: 63, name: '水火既济', upper: '坎', lower: '离', overall: '既济卦：亨小。已经成功，功成名就，但盛极将衰，宜谨慎守成。' },
  64: { num: 64, name: '火水未济', upper: '离', lower: '坎', overall: '未济卦：亨。尚未成功，事未竟成，继续努力，前景可期。' },
}

// ── 八卦符号 ──
const TRIGRAM_SYMBOLS: Record<string, string> = {
  '乾': '☰', '兑': '☱', '离': '☲', '震': '☳',
  '巽': '☴', '坎': '☵', '艮': '☶', '坤': '☷',
}

// ── 三枚硬币起卦法 ──
function castHexagram(): { lines: number[]; changing: number[] } {
  const lines: number[] = []
  const changing: number[] = []
  for (let i = 0; i < 6; i++) {
    let heads = 0; for (let c = 0; c < 3; c++) if (Math.random() < 0.5) heads++
    if (heads === 3) { lines.push(0); changing.push(i) }   // 老阳 → 变阴
    else if (heads === 2) { lines.push(1); changing.push(i) } // 少阴
    else if (heads === 1) { lines.push(0); changing.push(i) } // 少阳
    else { lines.push(1); changing.push(i) }                // 老阴 → 变阳
  }
  // 简化：2正1反=少阳(0)，1正2反=少阴(1)，3正=老阳变阴(0→1)，3反=老阴变阳(1→0)
  // 但让我们用更标准的方式表示：yang=0(阳爻), yin=1(阴爻)
  return { lines, changing }
}

// ── 获取卦序号 ──
function getHexagramNum(lines: number[]): number {
  // lines[0]=初爻, lines[5]=上爻
  // 下卦（内卦）= lines[0-2], 上卦（外卦）= lines[3-5]
  const lower = lines.slice(0, 3).reverse()
  const upper = lines.slice(3, 6).reverse()
  let lowerIdx = 0
  let upperIdx = 0
  for (let i = 0; i < 3; i++) {
    lowerIdx = (lowerIdx << 1) | lower[i]
    upperIdx = (upperIdx << 1) | upper[i]
  }
  return upperIdx * 8 + lowerIdx + 1
}

// ── 爻画图形 ──
function YaoLine({ value, isChanging, idx }: { value: number; isChanging: boolean; idx: number }) {
  return (
    <div className={`flex items-center gap-2 py-1 ${isChanging ? 'bg-gold-900/20 -mx-2 px-2 rounded' : ''}`}>
      <span className="w-6 text-xs text-gray-500 text-right">{idx}</span>
      <div className="flex items-center gap-1">
        {value === 0 ? (
          <div className="flex items-center gap-1">
            <span className="block w-6 h-1 bg-gold-400 rounded" />
            <span className="block w-3 h-1 bg-dark-700" />
            <span className="block w-6 h-1 bg-gold-400 rounded" />
          </div>
        ) : (
          <div className="flex items-center gap-1">
            <span className="block w-6 h-1 bg-amber-600 rounded" />
            <span className="block w-1 h-1 bg-amber-600 rounded-full" />
            <span className="block w-6 h-1 bg-amber-600 rounded" />
          </div>
        )}
        {isChanging && <span className="text-xs text-gold-500 ml-1">⚊→⚋</span>}
      </div>
    </div>
  )
}

// ── Component ──
export default function LiuyaoClient() {
  const { t } = useLocale()
  const lang = t as unknown as Record<string, unknown>

  const [result, setResult] = useState<{
    lines: number[]
    changing: number[]
    hexagram: Hexagram
    changingHexagram: Hexagram | null
  } | null>(null)

  const [history, setHistory] = useState<typeof result[]>([])

  const cast = useCallback(() => {
    const { lines, changing } = castHexagram()
    const num = getHexagramNum(lines)
    const hexagram = HEXAGRAMS[num] || HEXAGRAMS[1]

    let changingHexagram: Hexagram | null = null
    if (changing.length > 0) {
      const changedLines = lines.map((v, i) => changing.includes(i) ? (v === 0 ? 1 : 0) : v)
      const changedNum = getHexagramNum(changedLines)
      changingHexagram = HEXAGRAMS[changedNum] || null
    }

    const newResult = { lines, changing, hexagram, changingHexagram }
    setResult(newResult)
    setHistory(prev => [newResult, ...prev].slice(0, 5))
  }, [])

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gold-400 font-serif mb-3">{tk('liuyao.title', lang)}</h1>
      <p className="text-gray-400 mb-8">{tk('liuyao.desc', lang)}</p>

      <div className="bg-dark-800/80 backdrop-blur rounded-xl border border-dark-600 p-6 mb-8 text-center">
        <button
          onClick={cast}
          className="bg-gold-600 hover:bg-gold-500 text-dark-900 font-semibold px-8 py-3 rounded-lg text-lg transition-all active:scale-95"
        >
          ☯ {tk('liuyao.startDivination', lang)}
        </button>
      </div>

      {/* 结果 */}
      {result && (
        <div className="space-y-5">
          {/* 本卦 */}
          <div className="bg-dark-800/80 backdrop-blur rounded-xl border border-dark-600 p-5">
            <div className="text-center mb-4">
              <p className="text-xs text-gray-500 mb-1">本卦</p>
              <p className="text-xl font-bold text-gold-400 font-serif">
                {TRIGRAM_SYMBOLS[result.hexagram.upper]}{TRIGRAM_SYMBOLS[result.hexagram.lower]}
                {' '}{result.hexagram.name}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {result.hexagram.upper}上{result.hexagram.lower}下 · 第{result.hexagram.num}卦
              </p>
            </div>

            {/* 爻画 */}
            <div className="flex flex-col items-center py-2">
              {result.lines.map((v, i) => (
                <YaoLine key={5 - i} value={v} isChanging={result.changing.includes(5 - i)} idx={5 - i + 1} />
              ))}
            </div>

            {/* 动爻标注 */}
            {result.changing.length > 0 && (
              <div className="text-center mt-2">
                <p className="text-xs text-gold-500">
                  动爻：第{result.changing.map(c => 6 - c).join('、')}爻
                </p>
              </div>
            )}

            {/* 卦辞 */}
            <div className="mt-4 pt-4 border-t border-dark-600">
              <p className="text-sm text-gray-300 leading-relaxed">{result.hexagram.overall}</p>
            </div>
          </div>

          {/* 变卦 */}
          {result.changingHexagram && (
            <div className="bg-dark-800/80 backdrop-blur rounded-xl border border-gold-500/30 p-5">
              <div className="text-center mb-3">
                <p className="text-xs text-gold-500 mb-1">变卦</p>
                <p className="text-lg font-bold text-gold-400 font-serif">
                  {TRIGRAM_SYMBOLS[result.changingHexagram.upper]}
                  {TRIGRAM_SYMBOLS[result.changingHexagram.lower]}
                  {' '}{result.changingHexagram.name}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {result.changingHexagram.upper}上{result.changingHexagram.lower}下 · 第{result.changingHexagram.num}卦
                </p>
              </div>
              <p className="text-sm text-gray-300 leading-relaxed">{result.changingHexagram.overall}</p>
            </div>
          )}
        </div>
      )}

      {/* 历史记录 */}
      {history.length > 1 && (
        <details className="mt-6">
          <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-300">历史记录 ({history.length - 1})</summary>
          <div className="mt-2 space-y-2">
            {history.slice(1).map((h, i) => h && (
              <div key={i} className="bg-dark-800/60 rounded-lg p-3 text-xs text-gray-400">
                {h.hexagram.name}
                {h.changingHexagram && <> → {h.changingHexagram.name}</>}
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  )
}
