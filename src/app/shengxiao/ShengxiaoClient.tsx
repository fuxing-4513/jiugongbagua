'use client'

import { useState } from 'react'
import sd from './shengxiao-data.json'

const DATA = sd as Record<string,Record<string,string>>

const ANIMALS = ['鼠','牛','虎','兔','龙','蛇','马','羊','猴','鸡','狗','猪']
const EMOJIS: Record<string,string> = {'鼠':'🐭','牛':'🐮','虎':'🐯','兔':'🐰','龙':'🐲','蛇':'🐍','马':'🐴','羊':'🐏','猴':'🐵','鸡':'🐔','狗':'🐶','猪':'🐷'}
const WX: Record<string,string> = {'鼠':'水','牛':'土','虎':'木','兔':'木','龙':'土','蛇':'火','马':'火','羊':'土','猴':'金','鸡':'金','狗':'土','猪':'水'}
const BRANCH: Record<string,string> = {'鼠':'子','牛':'丑','虎':'寅','兔':'卯','龙':'辰','蛇':'巳','马':'午','羊':'未','猴':'申','鸡':'酉','狗':'戌','猪':'亥'}

const SECTIONS = ['origin','legend','character','symbol','folk','fortune','conclusion']
const SECT_CN: Record<string,string> = {
  origin:'📜 起源与传说',
  legend:'🔮 神话传说',
  character:'💪 性格特征',
  symbol:'⭐ 文化象征',
  folk:'🎭 民俗与艺术',
  fortune:'📈 运势分析',
  conclusion:'📖 象征意义结语'
}

export default function ShengxiaoClient() {
  const [sel, setSel] = useState('鼠')

  const d = DATA[sel]

  return (
    <div className="bg-dark-800/80 rounded-2xl p-4 sm:p-6 max-w-4xl mx-auto">
      {/* 12生肖选择器 */}
      <div className="grid grid-cols-6 sm:grid-cols-12 gap-2 mb-6">
        {ANIMALS.map(a => (
          <button key={a} onClick={() => setSel(a)}
            className={`p-2 sm:p-3 rounded-xl text-center border transition-all ${
              sel===a ? 'bg-gold-600/20 border-gold-500 text-gold-300' : 'bg-dark-700/50 border-dark-600 text-gray-400 hover:border-gold-500/30'
            }`}>
            <div className="text-xl sm:text-2xl">{EMOJIS[a]}</div>
            <div className="text-xs font-medium">{a}</div>
          </button>
        ))}
      </div>

      {d && <div className="space-y-4 animate-fadeIn">
        {/* Header */}
        <div className="border-b border-dark-600 pb-3 mb-4">
          <h2 className="text-xl font-semibold text-gold-400 font-serif">
            {EMOJIS[sel]} {sel} <span className="text-sm text-gray-400 font-sans">地支：{BRANCH[sel]} · 五行：{WX[sel]}</span>
          </h2>
        </div>

        {SECTIONS.map(sk => (
          <div key={sk} className="p-4 bg-dark-700/30 rounded-xl border border-dark-600/50">
            <h3 className="text-sm font-medium text-gold-500 mb-2">{SECT_CN[sk]}</h3>
            {d[sk].split('\n').map((line:string,i:number) => (
              <p key={i} className={`text-sm text-gray-300 leading-relaxed ${i > 0 ? 'mt-2' : ''}`}>{line}</p>
            ))}
          </div>
        ))}
      </div>}
    </div>
  )
}
