'use client'

import { useState } from 'react'
import cd from './constellation-data.json'
import y26 from './y2026.json'
import y27 from './y2027.json'
import m26 from './m2026.json'
import m27 from './m2027.json'

const CONSTELLATION_DATA = cd as Record<string,Record<string,string>>
const yearlyFortune: Record<string,Record<string,Record<string,string>>> = {'2026': y26, '2027': y27}
const monthlyMatters: Record<string,Record<string,string[]>> = {'2026': m26, '2027': m27}

const SIGNS = [
  { name:'白羊座', en:'Aries', date:'3.21-4.19', emoji:'♈', el:'火', ruler:'火星' },
  { name:'金牛座', en:'Taurus', date:'4.20-5.20', emoji:'♉', el:'土', ruler:'金星' },
  { name:'双子座', en:'Gemini', date:'5.21-6.21', emoji:'♊', el:'风', ruler:'水星' },
  { name:'巨蟹座', en:'Cancer', date:'6.22-7.22', emoji:'♋', el:'水', ruler:'月亮' },
  { name:'狮子座', en:'Leo', date:'7.23-8.22', emoji:'♌', el:'火', ruler:'太阳' },
  { name:'处女座', en:'Virgo', date:'8.23-9.22', emoji:'♍', el:'土', ruler:'水星' },
  { name:'天秤座', en:'Libra', date:'9.23-10.23', emoji:'♎', el:'风', ruler:'金星' },
  { name:'天蝎座', en:'Scorpio', date:'10.24-11.22', emoji:'♏', el:'水', ruler:'冥王星、火星' },
  { name:'射手座', en:'Sagittarius', date:'11.23-12.21', emoji:'♐', el:'火', ruler:'木星' },
  { name:'摩羯座', en:'Capricorn', date:'12.22-1.19', emoji:'♑', el:'土', ruler:'土星' },
  { name:'水瓶座', en:'Aquarius', date:'1.20-2.18', emoji:'♒', el:'风', ruler:'天王星、土星' },
  { name:'双鱼座', en:'Pisces', date:'2.19-3.20', emoji:'♓', el:'水', ruler:'海王星、木星' },
]

const getSign = (n:string) => SIGNS.findIndex(s => s.name === n)
const SECTIONS = ['origin','myth','character','love','career','health','symbol','conclusion']
const SECT_CN: Record<string,string> = {
  origin:'📜 起源与神话', myth:'🔮 神话传说', character:'💪 性格特征',
  love:'💕 爱情与人际关系', career:'💼 事业与财富', health:'🏃 健康与生活',
  symbol:'⭐ 象征意义', conclusion:'📖 结语'
}

export default function XingzuoClient() {
  const [tab, setTab] = useState('baike')
  const [selSign, setSelSign] = useState('白羊座')
  const [selYear, setSelYear] = useState('2026')
  const [selYf, setSelYf] = useState('白羊座')

  const data = CONSTELLATION_DATA[selSign]
  const yf = yearlyFortune[selYear]?.[selYf]
  const mm = monthlyMatters[selYear]?.[selYf]

  return (
    <div className="bg-dark-800/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 max-w-4xl mx-auto">
      <div className="flex flex-wrap gap-2 mb-6">
        {['baike','yearly'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab===t ? 'bg-gold-600 text-dark-900' : 'bg-dark-700 text-gray-400 hover:text-gold-400'
            }`}>
            {t==='baike' ? '📚 星座百科' : '📅 年度运势'}
          </button>
        ))}
      </div>

      {tab==='baike' && <>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 mb-6">
          {SIGNS.map(s => (
            <button key={s.name} onClick={() => setSelSign(s.name)}
              className={`p-3 rounded-xl text-center border transition-all ${
                selSign===s.name ? 'bg-gold-600/20 border-gold-500 text-gold-300' : 'bg-dark-700/50 border-dark-600 text-gray-400 hover:border-gold-500/30'
              }`}>
              <div className="text-2xl mb-1">{s.emoji}</div>
              <div className="text-xs font-medium">{s.name}</div>
              <div className="text-[9px] text-gray-500 mt-0.5">{s.date}</div>
            </button>
          ))}
        </div>

        {data && <div className="space-y-4 animate-fadeIn">
          <div className="border-b border-dark-600 pb-3 mb-4">
            <h2 className="text-xl font-semibold text-gold-400 font-serif">{selSign} <span className="text-sm text-gray-500 font-sans">{SIGNS[getSign(selSign)]?.emoji} {SIGNS[getSign(selSign)]?.en} | {SIGNS[getSign(selSign)]?.el}象 | {SIGNS[getSign(selSign)]?.ruler}守护</span></h2>
          </div>
          {SECTIONS.map(sk => (
            <div key={sk} className="p-4 bg-dark-700/30 rounded-xl border border-dark-600/50">
              <h3 className="text-sm font-medium text-gold-500 mb-2">{SECT_CN[sk]}</h3>
              <p className="text-sm text-gray-300 leading-relaxed">{data[sk]}</p>
            </div>
          ))}
        </div>}
      </>}

      {tab==='yearly' && <>
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="flex gap-2">
            {['2026','2027'].map(y => (
              <button key={y} onClick={() => setSelYear(y)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  selYear===y ? 'bg-gold-600 text-dark-900' : 'bg-dark-700 text-gray-400 hover:text-gold-400'
                }`}>{y}年</button>
            ))}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {SIGNS.map(s => (
              <button key={s.name} onClick={() => setSelYf(s.name)}
                className={`px-2.5 py-1.5 rounded text-xs border transition-all ${
                  selYf===s.name ? 'bg-gold-600/20 border-gold-500 text-gold-300' : 'bg-dark-700/50 border-dark-600 text-gray-400 hover:border-gold-500/30'
                }`}>{s.emoji} {s.name}</button>
            ))}
          </div>
        </div>

        {yf && <div className="space-y-4 animate-fadeIn">
          <div className="border-b border-dark-600 pb-3 mb-4">
            <h2 className="text-xl font-semibold text-gold-400 font-serif">{selYf} {selYear}年运势</h2>
          </div>

          <div className="p-4 bg-dark-700/30 rounded-xl border border-dark-600/50">
            <h3 className="text-sm font-medium text-gold-500 mb-2">🌟 整体运势概览</h3>
            <p className="text-sm text-gray-300 leading-relaxed">{yf.general}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[{k:'career',icon:'💼',label:'事业运势'},{k:'wealth',icon:'💰',label:'财运走势'},{k:'love',icon:'💕',label:'感情与人际'},{k:'health',icon:'🏃',label:'健康提醒'}].map(s => (
              <div key={s.k} className="p-4 bg-dark-700/30 rounded-xl border border-dark-600/50">
                <h3 className="text-sm font-medium text-gold-500 mb-2">{s.icon} {s.label}</h3>
                <p className="text-sm text-gray-300 leading-relaxed">{yf[s.k]}</p>
              </div>
            ))}
          </div>

          <div className="p-4 bg-dark-700/30 rounded-xl border border-dark-600/50">
            <h3 className="text-sm font-medium text-gold-500 mb-3">📋 每月重点提示</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {(mm||[]).map((m:string,i:number) => (
                <div key={i} className="p-2 bg-dark-800/50 rounded-lg text-xs text-gray-400">
                  <span className="text-gold-600 font-medium">{i+1}月</span> {m}
                </div>
              ))}
            </div>
          </div>

          {yf.conclusion && <div className="p-4 bg-dark-700/30 rounded-xl border border-dark-600/50">
            <h3 className="text-sm font-medium text-gold-500 mb-2">📖 结语</h3>
            <p className="text-sm text-gray-300 leading-relaxed">{yf.conclusion}</p>
          </div>}
        </div>}
      </>}
    </div>
  )
}
