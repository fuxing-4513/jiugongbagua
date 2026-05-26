'use client'

import { useState } from 'react'
import { useLocale } from '@/lib/i18n'

interface CharacterData {
  char: string
  strokes: number
  wuxing: string
  meaning: string
  interpretation: string
}

const characterDict: Record<string, CharacterData> = {
  '福': { char: '福', strokes: 13, wuxing: '水', meaning: '福气、幸福、福运', interpretation: '福字寓意福气临门，衣食丰足。测到此字主家运兴旺，事业顺遂，但需防福极生骄，当以谦逊持之。' },
  '禄': { char: '禄', strokes: 12, wuxing: '火', meaning: '俸禄、官禄、福禄', interpretation: '禄字象征功名利禄，仕途亨通。测到此字主事业有成，财运亨通，宜把握良机，稳步进取。' },
  '寿': { char: '寿', strokes: 7, wuxing: '金', meaning: '长寿、寿命、寿考', interpretation: '寿字象征健康长寿，福寿绵长。测到此字主身体健康，家宅平安，德高望重，福泽后人。' },
  '喜': { char: '喜', strokes: 12, wuxing: '水', meaning: '欢喜、喜悦、喜事', interpretation: '喜字象征欢欣鼓舞，好事临门。测到此字主婚姻美满，升迁在望，喜从天降，万事如意。' },
  '财': { char: '财', strokes: 10, wuxing: '金', meaning: '财富、钱财、财运', interpretation: '财字象征财源广进，富足有余。测到此字主财运旺盛，投资获利，经商得利，但须防财多招妒。' },
  '吉': { char: '吉', strokes: 6, wuxing: '木', meaning: '吉祥、吉利、平安', interpretation: '吉字象征万事大吉，顺风顺水。测到此字主所谋顺遂，出行平安，百事亨通，无往不利。' },
  '安': { char: '安', strokes: 6, wuxing: '土', meaning: '平安、安全、安宁', interpretation: '安字象征平安稳定，岁月静好。测到此字主家宅安宁，身心康泰，宜守不宜攻，稳中求进。' },
  '和': { char: '和', strokes: 8, wuxing: '土', meaning: '和谐、和睦、和平', interpretation: '和字象征和气生财，万事和睦。测到此字主人际关系融洽，合作顺利，家和万事兴。' },
  '龙': { char: '龙', strokes: 16, wuxing: '土', meaning: '龙腾、祥瑞、权威', interpretation: '龙字象征尊贵不凡，气势磅礴。测到此字主大展宏图，事业腾飞，贵人相助，前程似锦。' },
  '凤': { char: '凤', strokes: 14, wuxing: '水', meaning: '凤凰、祥瑞、美丽', interpretation: '凤字象征吉祥美丽，高贵典雅。测到此字主姻缘美满，才艺出众，女性运势尤佳。' },
  '缘': { char: '缘', strokes: 12, wuxing: '土', meaning: '缘分、因缘、机缘', interpretation: '缘字象征因缘际会，千里相会。测到此字主姻缘到来，人际遇合，机缘巧合，顺其自然。' },
  '梦': { char: '梦', strokes: 11, wuxing: '木', meaning: '梦想、梦境、愿景', interpretation: '梦字象征心怀梦想，志存高远。测到此字主理想远大，需脚踏实地，求梦需醒，观心自如。' },
  '心': { char: '心', strokes: 4, wuxing: '火', meaning: '心灵、心意、心态', interpretation: '心字象征内心世界，方寸之地。测到此字主心有所想，事有所成，但需修心养性，心静则明。' },
  '德': { char: '德', strokes: 15, wuxing: '火', meaning: '道德、品德、德行', interpretation: '德字象征德行高尚，厚德载物。测到此字主品德贵重，名望日增，积善之家必有余庆。' },
  '善': { char: '善', strokes: 12, wuxing: '金', meaning: '善良、完善、善于', interpretation: '善字象征上善若水，与人为善。测到此字主心地善良，福报自来，行善积德，必有后福。' },
  '诚': { char: '诚', strokes: 13, wuxing: '金', meaning: '诚信、真诚、诚意', interpretation: '诚字象征诚实守信，精诚所至。测到此字主事业根基稳固，金石为开，诚信立身，前程无量。' },
  '智': { char: '智', strokes: 12, wuxing: '火', meaning: '智慧、聪明、智谋', interpretation: '智字象征智慧超群，明辨是非。测到此字主学业有成，事业精进，智慧生财，谋略过人。' },
  '仁': { char: '仁', strokes: 4, wuxing: '金', meaning: '仁爱、仁义、仁厚', interpretation: '仁字象征仁者爱人，宽厚待人。测到此字主有仁德之心，得道多助，仁者寿也，福泽绵长。' },
  '义': { char: '义', strokes: 3, wuxing: '木', meaning: '义气、正义、道义', interpretation: '义字象征义薄云天，正道直行。测到此字主为人仗义，朋友遍天下，义之所至，无往不胜。' },
  '信': { char: '信', strokes: 9, wuxing: '金', meaning: '信用、信任、信念', interpretation: '信字象征言行一致，一诺千金。测到此字主信誉良好，事业兴旺，人无信不立，业无信不兴。' },
  '运': { char: '运', strokes: 7, wuxing: '土', meaning: '运气、运动、运势', interpretation: '运字象征气运流转，时来运转。测到此字主运势转好，时运到来，但需积极行动，运随人转。' },
  '泰': { char: '泰', strokes: 10, wuxing: '火', meaning: '泰然、安定、通达', interpretation: '泰字象征国泰民安，否极泰来。测到此字主万事通达，运势转好，身心安泰，前途光明。' },
  '康': { char: '康', strokes: 11, wuxing: '木', meaning: '健康、安康、康庄', interpretation: '康字象征体魄强健，五福安康。测到此字主身体健康，道路平坦，家中安宁，万事顺心。' },
  '顺': { char: '顺', strokes: 12, wuxing: '金', meaning: '顺利、顺心、顺从', interpretation: '顺字象征一帆风顺，万事顺遂。测到此字主事业顺利，步步高升，家庭和睦，百事顺心。' },
  '旺': { char: '旺', strokes: 8, wuxing: '火', meaning: '兴旺、旺盛、旺财', interpretation: '旺字象征事业兴旺，财源滚滚。测到此字主人气旺盛，事业如日中天，宜乘势而上，大展宏图。' },
  '发': { char: '发', strokes: 5, wuxing: '水', meaning: '发展、发财、发扬', interpretation: '发字象征奋发图强，鹏程万里。测到此字主财运亨通，事业发展，富有爆发力和进取心。' },
  '家': { char: '家', strokes: 10, wuxing: '木', meaning: '家庭、家乡、家族', interpretation: '家字象征家庭和睦，安居乐业。测到此字主家庭幸福，根基稳固，家人平安，宜珍惜眼前。' },
  '乐': { char: '乐', strokes: 5, wuxing: '火', meaning: '快乐、欢乐、乐观', interpretation: '乐字象征喜乐无忧，知足常乐。测到此字主心态乐观，生活欢愉，随遇而安，快乐自在。' },
  '美': { char: '美', strokes: 9, wuxing: '水', meaning: '美好、美丽、美德', interpretation: '美字象征生活美好，事事如意。测到此字主外表美丽，内心善良，好事成双，生活美满。' },
  '天': { char: '天', strokes: 4, wuxing: '火', meaning: '天空、天意、天赋', interpretation: '天字象征天命所归，志向高远。测到此字主胸怀大志，运势强盛，天人合一，所向披靡。' },
  '地': { char: '地', strokes: 6, wuxing: '土', meaning: '大地、地方、地位', interpretation: '地字象征脚踏实地，厚德载物。测到此字主根基深厚，稳扎稳打，宜务实求进，不宜好高骛远。' },
}

const wuxingColors: Record<string, string> = {
  '金': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  '木': 'bg-green-100 text-green-800 border-green-200',
  '水': 'bg-blue-100 text-blue-800 border-blue-200',
  '火': 'bg-red-100 text-red-800 border-red-200',
  '土': 'bg-amber-100 text-amber-800 border-amber-200',
}

export default function CeziClient() {
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

  const [input, setInput] = useState('')
  const [result, setResult] = useState<CharacterData | null>(null)
  const [notFound, setNotFound] = useState(false)

  const handleAnalyze = () => {
    setResult(null)
    setNotFound(false)

    const char = input.trim()
    if (char.length !== 1) return

    const data = characterDict[char]
    if (data) {
      setResult(data)
    } else {
      setNotFound(true)
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-red-900 font-serif mb-3">{getT('cezi.title')}</h1>
      <p className="text-gray-600 mb-8">{getT('cezi.desc')}</p>

      {/* Input */}
      <div className="bg-white rounded-xl border border-red-100 p-6 mb-8">
        <label className="block text-sm font-medium text-gray-700 mb-2">{getT('cezi.input')}</label>
        <div className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={e => {
              setInput(e.target.value.slice(0, 1))
              setResult(null)
              setNotFound(false)
            }}
            onKeyDown={e => e.key === 'Enter' && handleAnalyze()}
            placeholder="如：福、禄、寿"
            maxLength={1}
            className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-lg text-center focus:outline-none focus:border-red-300 focus:ring-1 focus:ring-red-200"
          />
          <button
            onClick={handleAnalyze}
            disabled={input.length !== 1}
            className="bg-red-700 hover:bg-red-800 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-lg transition-colors"
          >
            {getT('common.submit')}
          </button>
        </div>
      </div>

      {/* Not Found */}
      {notFound && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center">
          <div className="text-4xl mb-2">{input}</div>
          <p className="text-amber-800">
            目前暂未收录 "{input}" 字的解读，请尝试其他汉字。
          </p>
          <p className="text-xs text-amber-500 mt-2">
            支持约30个常见汉字的测字解读：福、禄、寿、喜、财、吉、安、和、龙、凤、缘、梦、心、德、善、诚、智、仁、义、信、运、泰、康、顺、旺、发、家、乐、美、天、地
          </p>
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="bg-white rounded-xl border border-red-100 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-6 text-center">{getT('cezi.resultTitle')}</h2>

          {/* Big Character Display */}
          <div className="flex justify-center mb-6">
            <div className="w-32 h-32 bg-gradient-to-br from-red-50 to-amber-50 rounded-2xl border-2 border-red-200 flex items-center justify-center shadow-lg">
              <span className="text-6xl font-bold text-red-900 font-serif">{result.char}</span>
            </div>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <p className="text-xs text-gray-400 mb-1">笔画</p>
              <p className="text-lg font-bold text-gray-800">{result.strokes}画</p>
            </div>
            <div className={`rounded-lg p-3 text-center border ${wuxingColors[result.wuxing] ?? 'bg-gray-50'}`}>
              <p className="text-xs text-gray-500 mb-1">五行</p>
              <p className="text-lg font-bold">{result.wuxing}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <p className="text-xs text-gray-400 mb-1">寓意</p>
              <p className="text-sm font-medium text-gray-700">{result.meaning}</p>
            </div>
          </div>

          {/* Interpretation */}
          <div className="bg-gradient-to-r from-red-50 to-amber-50 rounded-xl p-5 border border-red-100">
            <h3 className="text-sm font-semibold text-red-800 mb-3">测字解读</h3>
            <p className="text-sm text-gray-700 leading-relaxed">
              {result.interpretation}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
