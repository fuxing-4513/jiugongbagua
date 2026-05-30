import XingzuoClient from './XingzuoClient'

export const metadata = {
  title: '星座运势 - 九宫八卦',
  description: '十二星座百科与年度运势，了解星座起源、性格特征、事业财运、健康生活和年度运程。',
}

export default function XingzuoPage() {
  return (
    <div className="min-h-screen py-6 px-3">
      <div className="max-w-5xl mx-auto mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gold-400 font-serif text-center">✨ 星座运势</h1>
        <p className="text-center text-gray-500 text-sm mt-1">十二星座百科与年度运势解析</p>
      </div>
      <XingzuoClient />
    </div>
  )
}
