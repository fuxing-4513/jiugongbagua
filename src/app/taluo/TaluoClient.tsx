'use client'

import { useState, useCallback } from 'react'
import { useLocale } from '@/lib/i18n'

function tk(key: string, lang: Record<string, unknown>): string {
  const keys = key.split('.')
  let v: unknown = lang
  for (const k of keys) {
    if (typeof v !== 'object' || v === null) return key
    v = (v as Record<string, unknown>)[k]
  }
  return typeof v === 'string' ? v : key
}

interface TarotCard {
  id: number; name: string; nameEn: string
  upright: string; reversed: string
  keywords: string; element: string; suit?: string
}

const MAJOR: TarotCard[] = [
  {id:0,name:'愚人',nameEn:'The Fool',keywords:'开始·冒险·纯真',upright:'新的开始、冒险精神、天真无邪、无限可能',reversed:'鲁莽行事、愚蠢的决定、冒险失败、停滞不前',element:'风'},
  {id:1,name:'魔术师',nameEn:'The Magician',keywords:'创造·能力·自信',upright:'创造力、技能娴熟、自信满满、资源充足',reversed:'才华浪费、欺骗、缺乏方向、犹豫不决',element:'水'},
  {id:2,name:'女祭司',nameEn:'The High Priestess',keywords:'直觉·智慧·神秘',upright:'直觉敏锐、内在智慧、神秘知识、静待时机',reversed:'直觉受阻、秘密泄露、表面肤浅、忽视内心',element:'水'},
  {id:3,name:'女皇',nameEn:'The Empress',keywords:'丰饶·自然·温柔',upright:'丰收富足、母性关怀、自然之美、舒适享受',reversed:'依赖他人、创造力受阻、家庭问题、挥霍无度',element:'土'},
  {id:4,name:'皇帝',nameEn:'The Emperor',keywords:'权威·稳定·领导',upright:'权力地位、稳定秩序、领导才能、父爱关怀',reversed:'专制独裁、缺乏自律、权力滥用、软弱无能',element:'火'},
  {id:5,name:'教皇',nameEn:'The Hierophant',keywords:'传统·信仰·教导',upright:'宗教信仰、传统价值、精神导师、教育学习',reversed:'打破常规、过度保守、固执己见、伪善',element:'土'},
  {id:6,name:'恋人',nameEn:'The Lovers',keywords:'爱情·选择·结合',upright:'爱情美满、重要选择、和谐结合、价值观统一',reversed:'感情破裂、错误的决定、分离、价值观冲突',element:'风'},
  {id:7,name:'战车',nameEn:'The Chariot',keywords:'胜利·意志·征服',upright:'战胜困难、意志坚定、勇往直前、获得胜利',reversed:'失去控制、方向迷失、停滞不前、意志薄弱',element:'水'},
  {id:8,name:'力量',nameEn:'Strength',keywords:'勇气·力量·耐心',upright:'内心力量、勇气可嘉、耐心坚持、以柔克刚',reversed:'软弱无力、自暴自弃、缺乏自信、情绪失控',element:'火'},
  {id:9,name:'隐士',nameEn:'The Hermit',keywords:'内省·独处·智慧',upright:'深入内省、寻求真理、独处思考、智慧指引',reversed:'孤独寂寞、固执己见、拒绝帮助、迷失方向',element:'土'},
  {id:10,name:'命运之轮',nameEn:'Wheel of Fortune',keywords:'变化·循环·命运',upright:'命运转折、好运到来、变化之中、因果循环',reversed:'厄运连连、计划受阻、抗拒变化、运道低迷',element:'火'},
  {id:11,name:'正义',nameEn:'Justice',keywords:'公正·平衡·法律',upright:'公正裁决、因果报应、法律事务、平衡协调',reversed:'不公、法律纠纷、失衡、逃避责任',element:'风'},
  {id:12,name:'倒吊人',nameEn:'The Hanged Man',keywords:'牺牲·等待·新视角',upright:'自愿牺牲、换位思考、耐心等待、新的视角',reversed:'无谓牺牲、拒绝放手、拖延症、钻牛角尖',element:'水'},
  {id:13,name:'死神',nameEn:'Death',keywords:'终结·转变·新生',upright:'结束旧阶段、不可避免的改变、重生转变、放下过去',reversed:'抗拒改变、停滞不前、恐惧未知、做无谓挣扎',element:'水'},
  {id:14,name:'节制',nameEn:'Temperance',keywords:'平衡·适中·调和',upright:'身心平衡、中庸之道、调和矛盾、耐心等待',reversed:'失衡、过度、急躁、缺乏协调',element:'火'},
  {id:15,name:'恶魔',nameEn:'The Devil',keywords:'束缚·欲望·物质',upright:'欲望束缚、物质主义、沉迷上瘾、负面模式',reversed:'挣脱束缚、觉醒解脱、戒除恶习、重获自由',element:'土'},
  {id:16,name:'高塔',nameEn:'The Tower',keywords:'崩塌·剧变·觉醒',upright:'突然崩塌、天翻地覆、意外变故、真相大白',reversed:'避免灾难、延迟危机、抵抗改变、风雨前夜',element:'火'},
  {id:17,name:'星星',nameEn:'The Star',keywords:'希望·宁静·灵感',upright:'希望重生、内心平静、灵感启发、治愈修复',reversed:'失望沮丧、灵感枯竭、丧失信心、悲观消极',element:'风'},
  {id:18,name:'月亮',nameEn:'The Moon',keywords:'幻想·恐惧·潜意识',upright:'潜意识觉醒、幻觉幻想、恐惧不安、迷雾重重',reversed:'恐惧消散、看清真相、走出迷茫、解除幻觉',element:'水'},
  {id:19,name:'太阳',nameEn:'The Sun',keywords:'成功·喜悦·活力',upright:'光辉灿烂、成功喜悦、活力充沛、健康快乐',reversed:'短暂阴霾、暂时挫折、缺乏热情、小波折',element:'火'},
  {id:20,name:'审判',nameEn:'Judgement',keywords:'复活·觉醒·审判',upright:'重获新生、觉醒觉悟、公正审判、因果报应',reversed:'自我怀疑、拒绝觉醒、逃避审判、悔不当初',element:'火'},
  {id:21,name:'世界',nameEn:'The World',keywords:'完成·圆满·整合',upright:'大功告成、圆满成功、旅程终点、和谐统一',reversed:'未完成、功败垂成、拖延结局、不完美收场',element:'土'},
]

function makeMinor(suitCN: string, suitEN: string, el: string): TarotCard[] {
  const ranks = [
    {n:'Ace',v:'1',k:'开始·种子·潜力',u:'新开始、潜力无限、创造的源泉、机会降临',r:'错失机会、潜力受阻、延迟开始、缺乏动力'},
    {n:'2',v:'2',k:'平衡·选择·联合',u:'平衡协调、合作关系、对立统一、正确选择',r:'失衡、关系破裂、选择困难、对立冲突'},
    {n:'3',v:'3',k:'成长·协作·成果',u:'团队协作、初步成果、技能提升、进步发展',r:'协作不畅、技能不足、延迟成果、缺乏配合'},
    {n:'4',v:'4',k:'稳定·巩固·休息',u:'稳固基础、休养生息、阶段性成果、安心自在',r:'停滞不前、过度安逸、懒惰懈怠、缺乏动力'},
    {n:'5',v:'5',k:'冲突·竞争·分歧',u:'激烈竞争、意见分歧、挑战磨练、突破困境',r:'冲突加剧、两败俱伤、避免对抗、和解可能'},
    {n:'6',v:'6',k:'和谐·分享·胜利',u:'和谐胜利、分享喜悦、团队成功、合作共赢',r:'不公平分配、单方面获利、和谐破裂、自满骄傲'},
    {n:'7',v:'7',k:'评估·挑战·策略',u:'策略思考、评估局势、坚持立场、内在力量',r:'优柔寡断、自我怀疑、逃避挑战、策略失误'},
    {n:'8',v:'8',k:'行动·快速·前进',u:'快速行动、勇往直前、突破瓶颈、达成目标',r:'行动迟缓、方向错误、鲁莽冲动、资源浪费'},
    {n:'9',v:'9',k:'坚持·力量· resilience',u:'坚韧不拔、积累力量、近在咫尺、最后冲刺',r:'精疲力尽、功亏一篑、缺乏耐力、放弃在即'},
    {n:'10',v:'10',k:'完成·负担·结束',u:'阶段完成、责任沉重、苦尽甘来、新的循环',r:'不堪重负、过度压力、崩溃边缘、难以承受'},
    {n:'侍从',v:'11',k:'学习·探索·消息',u:'学习探索、好奇心、新消息到来、年轻活力',r:'缺乏经验、拖延消息、不成熟、轻率行事'},
    {n:'骑士',v:'12',k:'追求·行动·热情',u:'热情追求、积极行动、为理想奋斗、勇往直前',r:'冲动鲁莽、行动受阻、三分钟热度、方向偏航'},
    {n:'皇后',v:'13',k:'成熟·力量·温暖',u:'成熟魅力、坚定自信、温暖包容、领导才能',r:'缺乏安全感、控制欲强、嫉妒心重、依赖他人'},
    {n:'国王',v:'14',k:'权威·掌控·成就',u:'权威领导、掌控局面、事业成就、经验丰富',r:'专制霸道、滥用权力、缺乏远见、固执老旧'},
  ]
  return ranks.map((r, i) => ({
    id: 22 + suitEN.charCodeAt(0) * 14 + i,
    name: suitCN + r.n, nameEn: `${r.n} of ${suitEN}`,
    keywords: r.k, upright: r.u, reversed: r.r,
    element: el, suit: suitCN,
  }))
}

const MINOR = [
  ...makeMinor('权杖','Wands','火'),
  ...makeMinor('圣杯','Cups','水'),
  ...makeMinor('宝剑','Swords','风'),
  ...makeMinor('钱币','Pentacles','土'),
]

const ALL_CARDS = [...MAJOR, ...MINOR]

type SpreadType = 'single' | 'three' | 'celtic'

interface DrawnCard {
  card: TarotCard
  reversed: boolean
  position?: string
}

export default function TaluoClient() {
  const { t } = useLocale()
  const lang = t as unknown as Record<string, unknown>

  const [spread, setSpread] = useState<SpreadType>('single')
  const [drawn, setDrawn] = useState<DrawnCard[]>([])
  const [flipped, setFlipped] = useState<boolean[]>([])

  const drawCards = useCallback(() => {
    const counts = { single: 1, three: 3, celtic: 10 }
    const count = counts[spread]
    const shuffled = [...ALL_CARDS].sort(() => Math.random() - 0.5).slice(0, count)

    const positions: Record<string, string[]> = {
      single: ['今日运势'],
      three: ['过去', '现在', '未来'],
      celtic: ['现状', '阻碍', '目标', '过去基础', '近期发展', '未来趋势', '自我态度', '环境因素', '希望恐惧', '最终结果'],
    }

    const result = shuffled.map((card, i) => ({
      card,
      reversed: Math.random() > 0.5,
      position: (positions[spread] || [])[i] || '',
    }))
    setDrawn(result)
    setFlipped(new Array(count).fill(false))

    // 逐个翻转动画
    result.forEach((_, i) => {
      setTimeout(() => setFlipped(prev => {
        const next = [...prev]
        next[i] = true
        return next
      }), (i + 1) * 500)
    })
  }, [spread])

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gold-400 font-serif mb-3">{tk('taluo.title', lang)}</h1>
      <p className="text-gray-400 mb-8">{tk('taluo.desc', lang)}</p>

      {/* 牌阵选择 */}
      <div className="bg-dark-800/80 backdrop-blur rounded-xl border border-dark-600 p-6 mb-6">
        <div className="flex flex-wrap gap-3 items-center">
          {(['single', 'three', 'celtic'] as SpreadType[]).map(s => {
            const labels: Record<SpreadType, string> = { single: '单张牌', three: '三张牌', celtic: '凯尔特十字' }
            return (
              <button key={s}
                onClick={() => { setSpread(s); setDrawn([]) }}
                className={`px-4 py-2 rounded-lg text-sm transition-colors ${spread === s ? 'bg-gold-600 text-dark-900 font-semibold' : 'bg-dark-700 text-gray-300 border border-dark-600 hover:border-gold-500'}`}>
                {labels[s]}
              </button>
            )
          })}
          <button onClick={drawCards}
            className="ml-auto bg-gold-600 hover:bg-gold-500 text-dark-900 font-semibold px-6 py-2.5 rounded-lg transition-all active:scale-95">
            🃏 {tk('common.submit', lang)}
          </button>
        </div>
      </div>

      {/* 卡牌区域 */}
      {drawn.length > 0 && (
        <div className={`grid gap-4 ${spread === 'celtic' ? 'grid-cols-2 sm:grid-cols-5' : spread === 'three' ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-1 sm:grid-cols-1 max-w-sm mx-auto'}`}>
          {drawn.map((item, i) => {
            const isFlipped = flipped[i]
            const borderColor = item.reversed ? 'border-rose-500/50' : 'border-gold-500/50'

            return (
              <div key={i} className="group">
                {item.position && <p className="text-xs text-gray-500 text-center mb-1">{item.position}</p>}

                <div className={`relative h-64 cursor-pointer [perspective:600px]`}>
                  <div className={`relative w-full h-full transition-transform duration-700 [transform-style:preserve-3d] ${isFlipped ? '[transform:rotateY(180deg)]' : ''}`}>
                    {/* 牌背 */}
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-gold-700 to-dark-800 border-2 border-gold-600 flex items-center justify-center [backface-visibility:hidden]">
                      <span className="text-5xl opacity-50">🃏</span>
                    </div>
                    {/* 牌面 */}
                    <div className={`absolute inset-0 rounded-xl bg-dark-700 border-2 ${borderColor} p-3 [transform:rotateY(180deg)] [backface-visibility:hidden] flex flex-col overflow-auto`}>
                      <p className="text-xs font-semibold text-gold-400 text-center">{item.card.name}</p>
                      <p className="text-[10px] text-gray-500 text-center">{item.card.nameEn}</p>
                      <p className={`text-[10px] text-center mt-1 font-medium ${item.reversed ? 'text-rose-400' : 'text-green-400'}`}>
                        {item.reversed ? '逆位' : '正位'}
                      </p>
                      <p className="text-[10px] text-gray-500 text-center mt-0.5">{item.card.element} · {item.card.suit || '大阿卡纳'}</p>
                      <p className="text-[10px] text-gray-400 text-center mt-1">{item.card.keywords}</p>
                      <div className="mt-auto pt-1 border-t border-dark-600">
                        <p className="text-[9px] text-gray-400 leading-relaxed">
                          {item.reversed ? item.card.reversed : item.card.upright}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
