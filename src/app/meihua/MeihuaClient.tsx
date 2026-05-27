'use client'

import { useState } from 'react'

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

export default function MeihuaClient() {
  const [num1, setNum1] = useState('')
  const [num2, setNum2] = useState('')
  const [num3, setNum3] = useState('')
  const [result, setResult] = useState<any>(null)

  const calc = () => {
    const n1 = parseInt(num1) || 0, n2 = parseInt(num2) || 0, n3 = parseInt(num3) || 0
    if (!n1 || !n2 || !n3) return
    const upperKey = ((n1 % 8 === 0) ? 8 : n1 % 8).toString()
    const lowerKey = ((n2 % 8 === 0) ? 8 : n2 % 8).toString()
    const moving = ((n3 % 6 === 0) ? 6 : n3 % 6)
    const upper = TRIGRAM_NUM[upperKey] || '乾'
    const lower = TRIGRAM_NUM[lowerKey] || '坤'
    const guaKey = upper + lower
    const gua = GUA_NAMES[guaKey] || {name:upper+lower+'卦',poem:'变化之象，随缘而行。'}
    const upperT = TRIGRAMS[upper]
    const lowerT = TRIGRAMS[lower]
    setResult({ upper, lower, gua, moving, upperT, lowerT, n1, n2, n3 })
  }

  const r = result

  return (<div className="max-w-2xl mx-auto px-4 py-10">
    <h1 className="text-3xl font-bold text-gold-400 font-serif mb-3">梅花易数</h1>
    <p className="text-gray-400 mb-6">输入三个数字（或随意想三个数），起卦预测吉凶</p>

    <div className="bg-dark-800/80 backdrop-blur rounded-xl border border-dark-600 p-6 mb-8">
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div><label className="text-xs text-gray-400 block mb-1">上卦数</label>
          <input type="number" value={num1} onChange={e=>setNum1(e.target.value)} placeholder="随意数字" className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-gray-200" /></div>
        <div><label className="text-xs text-gray-400 block mb-1">下卦数</label>
          <input type="number" value={num2} onChange={e=>setNum2(e.target.value)} placeholder="随意数字" className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-gray-200" /></div>
        <div><label className="text-xs text-gray-400 block mb-1">动爻</label>
          <input type="number" value={num3} onChange={e=>setNum3(e.target.value)} placeholder="随意数字" className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-gray-200" /></div>
      </div>
      <button onClick={calc} className="bg-gold-600 hover:bg-gold-500 text-dark-900 font-semibold px-6 py-2.5 rounded-lg transition-colors active:scale-95">起卦</button>
    </div>

    {r && (<div className="space-y-4">
      <div className="bg-dark-800/80 backdrop-blur rounded-xl border border-dark-600 p-5 text-center">
        <p className="text-lg font-bold text-gold-400 font-serif mb-1">本卦：{r.gua.name}</p>
        <p className="text-xs text-gray-500">
          上卦：{r.upper}（{r.upperT?.name}·{r.upperT?.wx}·{r.upperT?.attr}） · 
          下卦：{r.lower}（{r.lowerT?.name}·{r.lowerT?.wx}·{r.lowerT?.attr}）
        </p>
        <p className="text-xs text-gray-400 mt-1">动爻：第{r.moving}爻（从下往上数）</p>
      </div>
      <div className="bg-dark-800/80 backdrop-blur rounded-xl border border-dark-600 p-5">
        <h3 className="text-sm font-semibold text-gold-400 mb-2">卦辞</h3>
        <p className="text-sm text-gray-300 leading-relaxed">{r.gua.poem}</p>
      </div>
      <div className="bg-dark-800/80 backdrop-blur rounded-xl border border-dark-600 p-5">
        <h3 className="text-sm font-semibold text-gold-400 mb-2">五行生克</h3>
        <p className="text-xs text-gray-300">
          上卦{r.upper}属{r.upperT?.wx}，下卦{r.lower}属{r.lowerT?.wx}。
          {r.upperT?.wx === r.lowerT?.wx ? '比和之象，诸事顺利。' :
           (r.upperT?.wx === '金' && r.lowerT?.wx === '土' || r.upperT?.wx === '木' && r.lowerT?.wx === '水') ? '上卦生下卦，主吉。' :
           (r.upperT?.wx === '金' && r.lowerT?.wx === '火') ? '下卦克上卦，先吉后凶，宜谨慎。' :
           (r.upperT?.wx === '火' && r.lowerT?.wx === '木') ? '下卦生上卦，得贵人助。' : '相克之象，需谨慎应对。'}
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
