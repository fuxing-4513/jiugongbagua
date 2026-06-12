'use client'

import { useState } from 'react'
import { useT } from '@/lib/i18n'

interface Expert {
  id: number
  name: string
  avatar: string
  specialties: string[]
  experience: string
  intro: string
  rating: number
  consultations: number
}

const experts: Expert[] = [
  {
    id: 1,
    name: '李玄通',
    avatar: '🧞',
    specialties: ['八字命理', '紫微斗数', '风水堪舆'],
    experience: '25年',
    intro: '自幼跟随祖父研习玄学，对八字命理和紫微斗数有深入研究。曾为多家企业提供风水咨询服务，擅长通过命盘分析人生运势，为客户提供人生决策参考。',
    rating: 4.9,
    consultations: 3580,
  },
  {
    id: 2,
    name: '陈慧心',
    avatar: '💭',
    specialties: ['塔罗', '周公解梦', '姓名分析'],
    experience: '15年',
    intro: '资深塔罗师和解梦师，精通韦特塔罗和马赛塔罗体系。善于通过塔罗牌为来访者指引人生方向，在梦境解析方面有着独到的见解和方法。',
    rating: 4.8,
    consultations: 2810,
  },
  {
    id: 3,
    name: '张明德',
    avatar: '☯',
    specialties: ['六爻', '奇门遁甲', '择日择吉'],
    experience: '20年',
    intro: '道门正一派传人，深研易经数十年。精通六爻和奇门遁甲，在择日择吉方面经验丰富。提倡以传统智慧服务现代生活，帮助人们趋吉避凶。',
    rating: 4.7,
    consultations: 1950,
  },
]

export default function ExpertsClient() {
  const getT = useT()

  const [bookingId, setBookingId] = useState<number | null>(null)

  const handleBook = (id: number) => {
    setBookingId(id)
    setTimeout(() => {
      setBookingId(null)
      alert(`已成功预约${experts.find(e => e.id === id)?.name}老师！客服将在24小时内与您联系。`)
    }, 300)
  }

  const renderStars = (rating: number) => {
    const stars = []
    for (let i = 1; i <= 5; i++) {
      if (i <= Math.floor(rating)) {
        stars.push('⭐')
      } else if (i - rating < 0.5) {
        stars.push('🌟')
      } else {
        stars.push('☆')
      }
    }
    return stars.join('')
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-red-900 font-serif mb-3">{getT('experts.title')}</h1>
      <p className="text-gray-600 mb-8">{getT('experts.desc')}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {experts.map((expert) => (
          <div
            key={expert.id}
            className="bg-white rounded-xl border border-red-100 overflow-hidden hover:border-red-200 hover:shadow-md transition-all duration-200"
          >
            <div className="bg-gradient-to-r from-red-50 to-amber-50 p-6 text-center border-b border-red-100">
              <div className="text-5xl mb-3">{expert.avatar}</div>
              <h3 className="text-lg font-bold text-gray-800">{expert.name}</h3>
              <p className="text-xs text-gray-400 mt-1">
                {renderStars(expert.rating)} {expert.rating.toFixed(1)}
              </p>
              <p className="text-xs text-gray-400">
                已服务{expert.consultations.toLocaleString()} 人
              </p>
            </div>

            <div className="p-5">
              <div className="mb-4">
                <p className="text-xs text-gray-400 mb-1">{getT('experts.experience')}</p>
                <p className="text-sm font-medium text-gray-700">{expert.experience}</p>
              </div>

              <div className="mb-4">
                <p className="text-xs text-gray-400 mb-1">{getT('experts.specialties')}</p>
                <div className="flex flex-wrap gap-1.5">
                  {expert.specialties.map((spec) => (
                    <span
                      key={spec}
                      className="inline-block text-xs px-2 py-0.5 bg-red-50 text-red-700 rounded-full"
                    >
                      {spec}
                    </span>
                  ))}
                </div>
              </div>

              <p className="text-sm text-gray-600 leading-relaxed mb-5 line-clamp-3">
                {expert.intro}
              </p>

              <button
                onClick={() => handleBook(expert.id)}
                disabled={bookingId === expert.id}
                className={`w-full py-2.5 rounded-lg text-sm font-medium transition-all ${
                  bookingId === expert.id
                    ? 'bg-gray-200 text-gray-500 cursor-wait'
                    : 'bg-red-700 hover:bg-red-800 text-white active:scale-95'
                }`}
              >
                {bookingId === expert.id ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    预约中...
                  </span>
                ) : (
                  `📮 ${getT('experts.book')}`
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-amber-50 border border-amber-200 rounded-xl p-4">
        <p className="text-sm text-amber-800">
          💡 预约说明：点击&quot;预约&quot;按钮后，我们的客服将在24小时内与您联系，确认咨询服务时间和方式。所有咨询均通过线上进行，支持文字、语音和视频多种形式。
        </p>
      </div>
    </div>
  )
}
