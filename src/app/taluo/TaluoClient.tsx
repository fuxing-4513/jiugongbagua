'use client'

import { useState } from 'react'
import { useLocale } from '@/lib/i18n'

interface TarotCard {
  id: number
  name: string
  nameEn: string
  keywords: string
  upright: string
  reversed: string
  element: string
}

const majorArcana: TarotCard[] = [
  { id: 0, name: '愚者', nameEn: 'The Fool', keywords: '开始、冒险、纯真', upright: '新的开始、冒险精神、天真无邪、无限可能', reversed: '鲁莽行事、愚蠢的决定、冒险失败、停滞不前', element: '风' },
  { id: 1, name: '魔术师', nameEn: 'The Magician', keywords: '创造、能力、自信', upright: '创造力、技能娴熟、自信满满、资源充足', reversed: '才华浪费、欺骗、缺乏方向、犹豫不决', element: '水' },
  { id: 2, name: '女祭司', nameEn: 'The High Priestess', keywords: '直觉、智慧、神秘', upright: '直觉敏锐、内在智慧、神秘知识、静待时机', reversed: '直觉受阻、秘密泄露、表面肤浅、忽视内心', element: '水' },
  { id: 3, name: '女皇', nameEn: 'The Empress', keywords: '丰饶、自然、温柔', upright: '丰收富足、母性关怀、自然之美、舒适享受', reversed: '依赖他人、创造力受阻、家庭问题、挥霍无度', element: '土' },
  { id: 4, name: '皇帝', nameEn: 'The Emperor', keywords: '权威、稳定、领导', upright: '权力地位、稳定秩序、领导才能、父爱关怀', reversed: '专制独裁、缺乏自律、权力滥用、软弱无能', element: '火' },
  { id: 5, name: '教皇', nameEn: 'The Hierophant', keywords: '传统、信仰、教导', upright: '宗教信仰、传统价值、精神导师、教育学习', reversed: '打破常规、过度保守、固执己见、伪善', element: '土' },
  { id: 6, name: '恋人', nameEn: 'The Lovers', keywords: '爱情、选择、结合', upright: '爱情美满、重要选择、和谐结合、价值观统一', reversed: '感情破裂、错误的决定、分离、价值观冲突', element: '风' },
  { id: 7, name: '战车', nameEn: 'The Chariot', keywords: '胜利、意志、征服', upright: '战胜困难、意志坚定、勇往直前、获得胜利', reversed: '失去控制、方向迷失、停滞不前、意志薄弱', element: '水' },
  { id: 8, name: '力量', nameEn: 'Strength', keywords: '勇气、力量、耐心', upright: '内心力量、勇气可嘉、耐心坚持、以柔克刚', reversed: '软弱无力、自暴自弃、缺乏自信、情绪失控', element: '火' },
  { id: 9, name: '隐士', nameEn: 'The Hermit', keywords: '内省、独处、智慧', upright: '深入内省、寻求真理、独处思考、智慧指引', reversed: '孤独寂寞、固执己见、拒绝帮助、迷失方向', element: '土' },
  { id: 10, name: '命运之轮', nameEn: 'Wheel of Fortune', keywords: '变化、循环、命运', upright: '命运转折、好运到来、变化之中、因果循环', reversed: '厄运连连、计划受阻、抗拒变化、运势低迷', element: '火' },
  { id: 11, name: '正义', nameEn: 'Justice', keywords: '公正、平衡、法律', upright: '公正裁决、因果报应、法律事务、平衡协调', reversed: '不公、法律纠纷、失衡、逃避责任', element: '风' },
  { id: 12, name: '倒吊人', nameEn: 'The Hanged Man', keywords: '牺牲、等待、新视角', upright: '自愿牺牲、换位思考、耐心等待、新的视角', reversed: '无谓牺牲、拒绝放手、拖延症、钻牛角尖', element: '水' },
  { id: 13, name: '死神', nameEn: 'Death', keywords: '终结、转变、新生', upright: '结束旧阶段、不可避免的改变、重生转变、放下过去', reversed: '抗拒改变、停滞不前、恐惧未知、做无谓挣扎', element: '水' },
  { id: 14, name: '节制', nameEn: 'Temperance', keywords: '平衡、适中、调和', upright: '身心平衡、中庸之道、调和矛盾、耐心等待', reversed: '失衡、过度、急躁、缺乏协调', element: '火' },
  { id: 15, name: '恶魔', nameEn: 'The Devil', keywords: '束缚、欲望、物质', upright: '欲望束缚、物质主义、沉迷上瘾、负面模式', reversed: '挣脱束缚、觉醒顿悟、戒除不良习惯、重获自由', element: '土' },
  { id: 16, name: '高塔', nameEn: 'The Tower', keywords: '崩塌、剧变、启示', upright: '突然变故、崩塌毁灭、醍醐灌顶、打破幻象', reversed: '避免灾难、拒绝改变、恐惧未来、危机中的转机', element: '火' },
  { id: 17, name: '星星', nameEn: 'The Star', keywords: '希望、宁静、灵感', upright: '充满希望、内心平静、灵光乍现、疗愈恢复', reversed: '失去希望、灵感枯竭、失望沮丧、信心动摇', element: '风' },
  { id: 18, name: '月亮', nameEn: 'The Moon', keywords: '幻觉、恐惧、潜意识', upright: '潜意识的浮现、内心恐惧、幻觉欺骗、不安困惑', reversed: '恐惧消散、看清真相、释放压抑、理解潜意识', element: '水' },
  { id: 19, name: '太阳', nameEn: 'The Sun', keywords: '喜悦、成功、活力', upright: '快乐喜悦、成功在望、活力四射、光明未来', reversed: '短暂的快乐、小挫折、乐观不足、成功延迟', element: '火' },
  { id: 20, name: '审判', nameEn: 'Judgement', keywords: '觉醒、重生、审判', upright: '内心觉醒、重新评估、获得救赎、新的开始', reversed: '自我怀疑、拒绝觉醒、逃避审判、犹豫不决', element: '火' },
  { id: 21, name: '世界', nameEn: 'The World', keywords: '完成、圆满、旅行', upright: '圆满达成、周期完成、成就荣耀、世界之旅', reversed: '未完成、缺憾、走捷径、未能实现目标', element: '土' },
]

const cardEmojis: Record<number, string> = {
  0: '🦋', 1: '🎩', 2: '🌙', 3: '👑', 4: '⚔️', 5: '⛪', 6: '💑', 7: '🏛️',
  8: '🦁', 9: '🏮', 10: '🎡', 11: '⚖️', 12: '🪢', 13: '💀', 14: '⚗️',
  15: '😈', 16: '🗼', 17: '⭐', 18: '🌕', 19: '☀️', 20: '📯', 21: '🌍',
}

export default function TaluoClient() {
  const { t } = useLocale()

  const getT = (key: string): string => {
    const keys = key.split('.')
    let value: unknown = t
    for (const k of keys) {
      if (typeof value !== 'object' || value === null) return key
      value = (value as Record<string, unknown>)[k]
    }
    return typeof value === 'string' ? value : key
  }

  const [card, setCard] = useState<TarotCard | null>(null)
  const [isReversed, setIsReversed] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [drawnOnce, setDrawnOnce] = useState(false)

  const drawCard = () => {
    setIsAnimating(true)

    setTimeout(() => {
      const randomCard = majorArcana[Math.floor(Math.random() * majorArcana.length)]
      const reversed = Math.random() < 0.3
      setCard(randomCard)
      setIsReversed(reversed)
      setIsAnimating(false)
      setDrawnOnce(true)
    }, 800)
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-red-900 font-serif mb-3">{getT('taluo.title')}</h1>
      <p className="text-gray-600 mb-8">{getT('taluo.desc')}</p>

      {/* Draw Button */}
      <div className="bg-white rounded-xl border border-red-100 p-6 mb-8 text-center">
        <button
          onClick={drawCard}
          disabled={isAnimating}
          className={`bg-red-700 hover:bg-red-800 text-white px-8 py-3 rounded-lg text-lg transition-all ${
            isAnimating ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {isAnimating ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              抽取中...
            </span>
          ) : drawnOnce ? '再抽一张' : getT('taluo.drawCard')}
        </button>
      </div>

      {/* Card Display */}
      {card && !isAnimating && (
        <div className="bg-white rounded-xl border border-red-100 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-6 text-center">
            {getT('taluo.resultTitle')}
          </h2>

          {/* Large Tarot Card */}
          <div className="flex justify-center mb-6">
            <div className={`relative w-64 bg-gradient-to-br from-red-900 via-red-800 to-amber-900 rounded-2xl p-6 shadow-xl border-2 border-amber-400/50 ${
              isReversed ? 'rotate-180' : ''
            } transition-transform duration-500`}>
              <div className="absolute top-2 left-2 text-amber-400/60 text-xs">✦</div>
              <div className="absolute top-2 right-2 text-amber-400/60 text-xs">✦</div>
              <div className="text-center mb-2">
                <span className="text-xs text-amber-300/70 font-mono">
                  {card.id === 0 ? '—' : `No.${card.id.toString().padStart(2, '0')}`}
                </span>
              </div>
              <div className="flex items-center justify-center h-28 mb-2">
                <span className="text-6xl filter drop-shadow-lg">
                  {cardEmojis[card.id] ?? '🃏'}
                </span>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-amber-200 font-serif">{card.name}</p>
                <p className="text-xs text-amber-300/70 mt-0.5 italic">{card.nameEn}</p>
              </div>
              <div className={`absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-xs font-bold ${
                isReversed ? 'bg-purple-600 text-white' : 'bg-amber-500 text-red-900'
              }`}>
                {isReversed ? '逆位' : '正位'}
              </div>
              <div className="absolute bottom-2 left-2 text-amber-400/60 text-xs rotate-90">✦</div>
              <div className="absolute bottom-2 right-2 text-amber-400/60 text-xs -rotate-90">✦</div>
            </div>
          </div>

          {/* Interpretation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs text-gray-400 mb-1">元素</p>
              <p className="text-sm font-medium text-gray-700">{card.element}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs text-gray-400 mb-1">关键词</p>
              <p className="text-sm font-medium text-gray-700">{card.keywords}</p>
            </div>
          </div>

          <div className="bg-red-50 rounded-lg p-4">
            <p className="text-sm font-semibold text-gray-800 mb-2">
              {isReversed ? '🔮 逆位解读' : '🔮 正位解读'}
            </p>
            <p className="text-sm text-gray-700 leading-relaxed">
              {isReversed ? card.reversed : card.upright}
            </p>
          </div>
        </div>
      )}

      {/* Initial State */}
      {!drawnOnce && !card && (
        <div className="bg-white rounded-xl border border-red-100 p-12 text-center">
          <div className="text-6xl mb-4">🃏</div>
          <p className="text-gray-500">点击上方按钮，抽取一张塔罗牌</p>
        </div>
      )}
    </div>
  )
}
