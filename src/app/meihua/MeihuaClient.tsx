'use client'

import { useState, useCallback } from 'react'
import { Solar, Lunar } from 'lunar-typescript'

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

type QiguaMethod = 'number' | 'lunarTime' | 'solarTime' | 'auto'

export default function MeihuaClient() {
  const [method, setMethod] = useState<QiguaMethod>('number')
  const [gender, setGender] = useState('男')
  const [matter, setMatter] = useState('')

  // 数字起卦
  const [num1, setNum1] = useState('')
  const [num2, setNum2] = useState('')
  const [num3, setNum3] = useState('')

  // 农历时间起卦
  const [lYear, setLYear] = useState(String(new Date().getFullYear()))
  const [lMonth, setLMonth] = useState('1')
  const [lDay, setLDay] = useState('1')
  const [lHour, setLHour] = useState('0')
  const [lIsLeap, setLIsLeap] = useState(false)

  // 公历时间起卦
  const [sYear, setSYear] = useState(String(new Date().getFullYear()))
  const [sMonth, setSMonth] = useState(String(new Date().getMonth() + 1))
  const [sDay, setSDay] = useState(String(new Date().getDate()))
  const [sHour, setSHour] = useState('0')

  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')

  // 梅花易数：三数分别对应上卦、下卦、动爻
  const calcFromNumbers = useCallback((n1: number, n2: number, n3: number) => {
    const upperKey = ((n1 % 8 === 0) ? 8 : n1 % 8).toString()
    const lowerKey = ((n2 % 8 === 0) ? 8 : n2 % 8).toString()
    const moving = ((n3 % 6 === 0) ? 6 : n3 % 6)
    const upper = TRIGRAM_NUM[upperKey] || '乾'
    const lower = TRIGRAM_NUM[lowerKey] || '坤'
    const guaKey = upper + lower
    const gua = GUA_NAMES[guaKey] || {name:upper+lower+'卦',poem:'变化之象，随缘而行。'}
    const upperT = TRIGRAMS[upper]
    const lowerT = TRIGRAMS[lower]

    // 计算变卦（动爻变阴/阳）
    const yaoLines = Array.from({length:6}, (_,i) => {
      const idx = i + 1
      if (idx <= 3) {
        // 下卦（低位）
        const bin = ['坤','震','坎','兑','艮','离','巽','乾'].indexOf(lower)
        return (bin & (1 << (2 - i))) !== 0 ? '阳' : '阴'
      } else {
        const bin = ['坤','震','坎','兑','艮','离','巽','乾'].indexOf(upper)
        return (bin & (1 << (5 - i))) !== 0 ? '阳' : '阴'
      }
    })
    const changeYao = [...yaoLines]
    // 动爻：倒着数——第1爻是最下面，第6爻最上面
    const realMoving = moving
    const yaoIdx = 6 - realMoving // 从底部数
    changeYao[yaoIdx] = changeYao[yaoIdx] === '阳' ? '阴' : '阳'
    const changeUpperYao = changeYao.slice(3).join('')
    const changeLowerYao = changeYao.slice(0,3).join('')
    const changeUpperBin = ['坤','震','坎','兑','艮','离','巽','乾'].findIndex((_,i) => {
      const b = (changeLowerYao[2] === '阳' ? 4 : 0) + (changeLowerYao[1] === '阳' ? 2 : 0) + (changeLowerYao[0] === '阳' ? 1 : 0)
      return i === b
    })
    // 正确计算变卦的上卦
    const cub = (changeUpperYao[2] === '阳' ? 4 : 0) + (changeUpperYao[1] === '阳' ? 2 : 0) + (changeUpperYao[0] === '阳' ? 1 : 0)
    const changeUpper = ['坤','震','坎','兑','艮','离','巽','乾'][cub] || upper
    const clb = (changeLowerYao[2] === '阳' ? 4 : 0) + (changeLowerYao[1] === '阳' ? 2 : 0) + (changeLowerYao[0] === '阳' ? 1 : 0)
    const changeLower = ['坤','震','坎','兑','艮','离','巽','乾'][clb] || lower
    const changeGuaKey = changeUpper + changeLower
    const changeGua = GUA_NAMES[changeGuaKey] || {name:changeUpper+changeLower+'卦',poem:''}

    setResult({
      method: 'number',
      upper, lower, moving: realMoving,
      upperT, lowerT, gua, changeGua,
      changeUpper, changeLower,
      sourceStr: `数字 ${n1} · ${n2} · ${n3}`,
    })
  }, [])

  const doCalc = useCallback(() => {
    setError(''); setResult(null)
    if (method === 'number') {
      const n1 = parseInt(num1) || 0, n2 = parseInt(num2) || 0, n3 = parseInt(num3) || 0
      if (!n1 || !n2 || !n3) { setError('请填写三个数字'); return }
      calcFromNumbers(n1, n2, n3)
    } else if (method === 'lunarTime') {
      const y = parseInt(lYear), m = parseInt(lMonth), d = parseInt(lDay), h = parseInt(lHour)
      if (isNaN(y)||isNaN(m)||isNaN(d)||m<1||m>12||d<1||d>30) { setError('农历日期无效'); return }
      try {
        const lm = lIsLeap ? -m : m
        const lunar = Lunar.fromYmd(y, lm, d)
        // 取 年干序号+月+日 作为三数
        const tgIdx = '甲乙丙丁戊己庚辛壬癸'.indexOf(lunar.getYearGan()) + 1
        const n1 = tgIdx, n2 = lunar.getMonth(), n3 = lunar.getDay()
        // 上面计算出来的 n2 可能是负数（闰月），取绝对值
        const absN2 = Math.abs(n2)
        // h作为第四个参考，整体取和再取余
        const adjN1 = n1 + h, adjN2 = absN2 + m, adjN3 = n3 + d
        calcFromNumbers(adjN1, adjN2, adjN3)
        setResult((prev: any) => ({ ...prev,
          sourceStr: `农历 ${y}年${lIsLeap?'闰':''}${m}月${d}日 · ${lHour}时`,
          method: 'lunarTime',
        }))
      } catch(e) { setError('农历日期转换出错，请检查是否闰月或日期无效') }
    } else if (method === 'solarTime') {
      const y = parseInt(sYear), m = parseInt(sMonth), d = parseInt(sDay), h = parseInt(sHour)
      if (isNaN(y)||isNaN(m)||isNaN(d)||m<1||m>12||d<1||d>31) { setError('公历日期无效'); return }
      try {
        // 公历转农历再取数
        const solar = Solar.fromYmd(y, m, d)
        const lunar = solar.getLunar()
        const tgIdx = '甲乙丙丁戊己庚辛壬癸'.indexOf(lunar.getYearGan()) + 1
        const n1 = tgIdx + y % 10, n2 = lunar.getMonth(), n3 = lunar.getDay()
        const adjN1 = n1 + h, adjN2 = Math.abs(n2) + m, adjN3 = n3 + d
        calcFromNumbers(adjN1, adjN2, adjN3)
        setResult((prev: any) => ({ ...prev,
          sourceStr: `公历 ${y}年${m}月${d}日 · ${h}时`,
          method: 'solarTime',
        }))
      } catch(e) { setError('公历日期转换出错') }
    } else if (method === 'auto') {
      const n1 = Math.floor(Math.random() * 49) + 1
      const n2 = Math.floor(Math.random() * 49) + 1
      const n3 = Math.floor(Math.random() * 49) + 1
      calcFromNumbers(n1, n2, n3)
      setResult((prev: any) => ({ ...prev,
        sourceStr: `电脑自动起卦 ${n1} · ${n2} · ${n3}`,
        method: 'auto',
      }))
    }
  }, [method, num1, num2, num3, lYear, lMonth, lDay, lHour, lIsLeap, sYear, sMonth, sDay, sHour, calcFromNumbers])

  const r = result

  return (<div className="max-w-2xl mx-auto px-4 py-10">
    <h1 className="text-3xl font-bold text-gold-400 font-serif mb-1">梅花易数</h1>
    <p className="text-gray-400 mb-2">随心起卦，洞察先机。支持数字、时间、自动三种方式。</p>

    <div className="bg-dark-800/80 backdrop-blur rounded-xl border border-dark-600 p-5 mb-8">
      {/* 方式选择 */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button onClick={()=>setMethod('number')} className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${method==='number'?'bg-gold-600 text-dark-900 font-semibold':'bg-dark-700 text-gray-400 border border-dark-600'}`}>🔢 数字起卦</button>
        <button onClick={()=>setMethod('lunarTime')} className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${method==='lunarTime'?'bg-gold-600 text-dark-900 font-semibold':'bg-dark-700 text-gray-400 border border-dark-600'}`}>🌙 农历时间</button>
        <button onClick={()=>setMethod('solarTime')} className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${method==='solarTime'?'bg-gold-600 text-dark-900 font-semibold':'bg-dark-700 text-gray-400 border border-dark-600'}`}>☀️ 公历时间</button>
        <button onClick={()=>setMethod('auto')} className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${method==='auto'?'bg-gold-600 text-dark-900 font-semibold':'bg-dark-700 text-gray-400 border border-dark-600'}`}>🤖 电脑自动</button>
      </div>

      {/* 性别 + 事由 */}
      <div className="flex gap-3 mb-4">
        <select value={gender} onChange={e=>setGender(e.target.value)} className="px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-gray-200 text-xs">
          <option value="男">男</option><option value="女">女</option>
        </select>
        <input type="text" value={matter} onChange={e=>setMatter(e.target.value)} placeholder="预测何事（选填，如：工作、感情、财运...）" maxLength={50}
          className="flex-1 px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-gray-200 text-xs focus:outline-none focus:border-gold-500" />
      </div>

      {/* 数字起卦 */}
      {method === 'number' && (
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div><label className="text-xs text-gray-400 block mb-1">上卦数</label>
            <input type="number" value={num1} onChange={e=>setNum1(e.target.value)} placeholder="随意数字" className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-gray-200" /></div>
          <div><label className="text-xs text-gray-400 block mb-1">下卦数</label>
            <input type="number" value={num2} onChange={e=>setNum2(e.target.value)} placeholder="随意数字" className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-gray-200" /></div>
          <div><label className="text-xs text-gray-400 block mb-1">动爻数</label>
            <input type="number" value={num3} onChange={e=>setNum3(e.target.value)} placeholder="随意数字" className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-gray-200" /></div>
        </div>
      )}

      {/* 农历时间起卦 */}
      {method === 'lunarTime' && (
        <div className="mb-4">
          <div className="grid grid-cols-4 gap-3 mb-2">
            <div><label className="text-xs text-gray-400 block mb-1">农历年</label>
              <input type="number" value={lYear} onChange={e=>setLYear(e.target.value)} className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-gray-200" /></div>
            <div><label className="text-xs text-gray-400 block mb-1">农历月</label>
              <input type="number" min={1} max={12} value={lMonth} onChange={e=>setLMonth(e.target.value)} className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-gray-200" /></div>
            <div><label className="text-xs text-gray-400 block mb-1">农历日</label>
              <input type="number" min={1} max={30} value={lDay} onChange={e=>setLDay(e.target.value)} className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-gray-200" /></div>
            <div><label className="text-xs text-gray-400 block mb-1">时辰</label>
              <select value={lHour} onChange={e=>setLHour(e.target.value)} className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-gray-200 text-xs">
                {[{v:'0',l:'子时(23-01)'},{v:'2',l:'丑时(01-03)'},{v:'4',l:'寅时(03-05)'},{v:'6',l:'卯时(05-07)'},{v:'8',l:'辰时(07-09)'},{v:'10',l:'巳时(09-11)'},{v:'12',l:'午时(11-13)'},{v:'14',l:'未时(13-15)'},{v:'16',l:'申时(15-17)'},{v:'18',l:'酉时(17-19)'},{v:'20',l:'戌时(19-21)'},{v:'22',l:'亥时(21-23)'}].map(o=><option key={o.v} value={o.v}>{o.l}</option>)}
              </select></div>
          </div>
          <label className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer select-none">
            <input type="checkbox" checked={lIsLeap} onChange={e=>setLIsLeap(e.target.checked)} className="accent-gold-500" />
            闰月
          </label>
        </div>
      )}

      {/* 公历时间起卦 */}
      {method === 'solarTime' && (
        <div className="grid grid-cols-4 gap-3 mb-4">
          <div><label className="text-xs text-gray-400 block mb-1">年份</label>
            <input type="number" value={sYear} onChange={e=>setSYear(e.target.value)} className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-gray-200" /></div>
          <div><label className="text-xs text-gray-400 block mb-1">月份</label>
            <input type="number" min={1} max={12} value={sMonth} onChange={e=>setSMonth(e.target.value)} className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-gray-200" /></div>
          <div><label className="text-xs text-gray-400 block mb-1">日</label>
            <input type="number" min={1} max={31} value={sDay} onChange={e=>setSDay(e.target.value)} className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-gray-200" /></div>
          <div><label className="text-xs text-gray-400 block mb-1">时辰</label>
            <select value={sHour} onChange={e=>setSHour(e.target.value)} className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-gray-200 text-xs">
              {[{v:'0',l:'子时(23-01)'},{v:'2',l:'丑时(01-03)'},{v:'4',l:'寅时(03-05)'},{v:'6',l:'卯时(05-07)'},{v:'8',l:'辰时(07-09)'},{v:'10',l:'巳时(09-11)'},{v:'12',l:'午时(11-13)'},{v:'14',l:'未时(13-15)'},{v:'16',l:'申时(15-17)'},{v:'18',l:'酉时(17-19)'},{v:'20',l:'戌时(19-21)'},{v:'22',l:'亥时(21-23)'}].map(o=><option key={o.v} value={o.v}>{o.l}</option>)}
            </select></div>
        </div>
      )}

      {/* 电脑自动 - 无需输入 */}

      {error && <p className="text-xs text-red-400 mb-2">{error}</p>}
      <button onClick={doCalc} className="bg-gold-600 hover:bg-gold-500 text-dark-900 font-semibold px-6 py-2.5 rounded-lg transition-colors active:scale-95">起卦</button>
    </div>

    {r && (<div className="space-y-4">
      <div className="bg-dark-800/80 backdrop-blur rounded-xl border border-dark-600 p-4 text-center">
        <p className="text-[10px] text-gray-500 mb-1">{r.sourceStr}</p>
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
      </div>

      <div className="bg-dark-800/80 backdrop-blur rounded-xl border border-dark-600 p-5">
        <h3 className="text-sm font-semibold text-gold-400 mb-2">动爻解读</h3>
        <p className="text-xs text-gray-300">
          第{r.moving}爻变动，表示事情正在发展变化中。
          {r.moving <= 2 ? '初爻变动，事态初起，宜谨慎行动。' :
           r.moving <= 4 ? '中爻变动，事态发展之中，宜把握时机。' :
           '上爻变动，事态将定，宜守成。'}
        </p>
      </div>
    </div>)}
  </div>)
}
