import ShengxiaoClient from './ShengxiaoClient'

export const metadata = {
  title: '十二生肖 - 九宫八卦',
  description: '十二生肖百科，了解每个生肖的起源传说、性格特征、文化象征、民俗艺术与运势分析。',
}

export default function ShengxiaoPage() {
  return (
    <div className="min-h-screen py-6 px-3">
      <div className="max-w-5xl mx-auto mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gold-400 font-serif text-center">🐉 十二生肖</h1>
        <p className="text-center text-gray-500 text-sm mt-1">子鼠丑牛寅虎卯兔·辰龙巳蛇午马未羊·申猴酉鸡戌狗亥猪</p>
      </div>
      <ShengxiaoClient />
    </div>
  )
}
