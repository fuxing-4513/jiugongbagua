'use client'

import { useState } from 'react'
import { useLocale } from '@/lib/i18n'

const dreamKeywords: Record<string, { title: string; meaning: string }> = {
  '掉牙': { title: '掉牙', meaning: '梦见掉牙通常表示内心的不安或对衰老的忧虑。也可能是对亲友健康的担忧。' },
  '牙齿': { title: '牙齿', meaning: '梦见牙齿通常表示内心的不安或对衰老的忧虑。也可能是对亲友健康的担忧。' },
  '蛇': { title: '蛇', meaning: '梦见蛇通常象征着智慧、转变或潜在的危险。也可能暗示着性意识或重生。' },
  '水': { title: '水', meaning: '水在梦中象征着情感和潜意识。清澈的水代表平静，浑浊的水暗示困扰。' },
  '飞翔': { title: '飞翔', meaning: '梦见飞翔代表对自由的渴望和追求成功的愿望。也可能表示你已摆脱了某种束缚。' },
  '飞': { title: '飞翔', meaning: '梦见飞翔代表对自由的渴望和追求成功的愿望。也可能表示你已摆脱了某种束缚。' },
  '死亡': { title: '死亡', meaning: '梦见死亡通常不表示真正的死亡，而是象征着重生、转变或一段关系的结束。' },
  '死人': { title: '死亡', meaning: '梦见死亡通常不表示真正的死亡，而是象征着重生、转变或一段关系的结束。' },
  '火': { title: '火', meaning: '火象征着激情、能量和转变。熊熊大火可能表示强烈的情绪或愤怒。' },
  '考试': { title: '考试', meaning: '梦见考试通常反映现实生活中的压力和对自己能力的质疑。' },
  '追': { title: '被追赶', meaning: '梦见被追赶表示你在现实中逃避某个问题或情感。' },
  '追赶': { title: '被追赶', meaning: '梦见被追赶表示你在现实中逃避某个问题或情感。' },
  '掉': { title: '坠落', meaning: '梦见坠落通常表示失去控制感或对失败的恐惧。' },
  '坠落': { title: '坠落', meaning: '梦见坠落通常表示失去控制感或对失败的恐惧。' },
  '结婚': { title: '结婚', meaning: '梦见结婚可能预示新的开始、合作关系或对承诺的思考。' },
  '怀孕': { title: '怀孕', meaning: '梦见怀孕象征着创造力、新想法或新项目的孕育。' },
  '小孩': { title: '小孩', meaning: '梦见小孩通常代表纯真、新的开始或你内心需要被照顾的部分。' },
  '钱': { title: '钱财', meaning: '梦见钱财可能反映你对物质安全的关注或自我价值感的体现。' },
  '血': { title: '流血', meaning: '梦见流血可能象征着生命力的流失或情感上的伤害。' },
}

export default function JiemengPage() {
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

  const [keyword, setKeyword] = useState('')
  const [result, setResult] = useState<{ title: string; meaning: string } | null>(null)
  const [notFound, setNotFound] = useState(false)

  const search = () => {
    const kw = keyword.trim()
    if (!kw) return

    // Try direct match first, then partial match
    const directMatch = dreamKeywords[kw]
    if (directMatch) {
      setResult(directMatch)
      setNotFound(false)
      return
    }

    const partialMatch = Object.entries(dreamKeywords).find(([key]) => kw.includes(key) || key.includes(kw))
    if (partialMatch) {
      setResult(partialMatch[1])
      setNotFound(false)
      return
    }

    setResult(null)
    setNotFound(true)
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-red-900 font-serif mb-3">{getT('jiemeng.title')}</h1>
      <p className="text-gray-600 mb-8">{getT('jiemeng.desc')}</p>

      <div className="bg-white rounded-xl border border-red-100 p-6 mb-8">
        <div className="mb-4">
          <label className="block text-sm text-gray-600 mb-1">{getT('jiemeng.keyword')}</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && search()}
              placeholder={getT('jiemeng.example')}
              className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-red-300"
            />
            <button onClick={search} className="bg-red-700 hover:bg-red-800 text-white px-6 py-2 rounded-lg transition-colors whitespace-nowrap">
              {getT('common.submit')}
            </button>
          </div>
        </div>
      </div>

      {result && (
        <div className="bg-white rounded-xl border border-red-100 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">{getT('jiemeng.resultTitle')}</h2>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="font-bold text-gray-800">{result.title}</p>
            <p className="text-sm text-gray-600 mt-2 leading-relaxed">{result.meaning}</p>
          </div>
        </div>
      )}

      {notFound && (
        <div className="bg-white rounded-xl border border-red-100 p-6">
          <p className="text-gray-500 text-center">{getT('jiemeng.notFound')}</p>
        </div>
      )}
    </div>
  )
}
