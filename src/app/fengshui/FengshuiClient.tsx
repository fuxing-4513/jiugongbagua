'use client'

import { useState } from 'react'
import { useT, useLocale } from '@/lib/i18n'

const BA_GUA = [
  {name:'乾',emoji:'☰',wx:'金',dir:'西北',num:6,attr:'天'},
  {name:'兑',emoji:'☱',wx:'金',dir:'西',num:7,attr:'泽'},
  {name:'离',emoji:'☲',wx:'火',dir:'南',num:3,attr:'火'},
  {name:'震',emoji:'☳',wx:'木',dir:'东',num:4,attr:'雷'},
  {name:'巽',emoji:'☴',wx:'木',dir:'东南',num:5,attr:'风'},
  {name:'坎',emoji:'☵',wx:'水',dir:'北',num:1,attr:'水'},
  {name:'艮',emoji:'☶',wx:'土',dir:'东北',num:8,attr:'山'},
  {name:'坤',emoji:'☷',wx:'土',dir:'西南',num:2,attr:'地'},
]


const LUOPAN_MEANING: Record<string,string> = {
  '乾': '乾为天，代表刚健、领导、父亲。在此方位布置有助于事业权威和领导力提升。',
  '兑': '兑为泽，代表悦乐、沟通、少女。此方位有利于人际关系和口才表达。',
  '离': '离为火，代表光明、文化、中女。此方位有助于学业文化和名声。',
  '震': '震为雷，代表行动、长子、动力。此方位有利于事业发展和新项目启动。',
  '巽': '巽为风，代表渗透、长女、入。此方位有利于财运和人际关系。',
  '坎': '坎为水，代表险陷、中男、智慧。此方位有利于智慧和财运。',
  '艮': '艮为山，代表静止、少男、止。此方位有利于积蓄和稳定。',
  '坤': '坤为地，代表柔顺、母亲、包容。此方位有利于家庭和睦和财运稳定。',
}

const EIGHT_DOORS: Record<string,string> = {
  '休门':'吉，主休息、修养、旅游。','生门':'大吉，主财运、生意、发展。',
  '伤门':'凶，主争斗、损失、伤害。','杜门':'平，主堵塞、隐藏、保密。',
  '景门':'平，主消息、文书、计划。','死门':'大凶，主终结、死亡、不动。',
  '惊门':'凶，主惊恐、是非、官非。','开门':'大吉，主开放、事业、开始。',
}

const NINE_STARS: Record<string,string> = {
  '天蓬星':'凶，主盗贼、破财。','天芮星':'凶，主疾病、问题。',
  '天冲星':'平，主变动、冲击。','天辅星':'吉，主文化、教育。',
  '天禽星':'大吉，主中正、平稳。','天心星':'吉，主医疗、策划。',
  '天柱星':'凶，主破坏、口舌。','天任星':'吉，主稳重、积累。',
  '天英星':'平，主光明、名气。',
}

export default function FengshuiClient() {
  const getT = useT()
  useLocale()
  const [dir, setDir] = useState('')
  const [gua, setGua] = useState<typeof BA_GUA[number] | null>(null)
  const [door, setDoor] = useState('')
  const [star, setStar] = useState('')

  const checkDirection = () => {
    const d = dir.trim()
    if (!d) return
    const found = BA_GUA.find(g => g.dir === d || g.name === d)
    setGua(found || null)
    if (found) {
      const doors = Object.entries(EIGHT_DOORS)
      setDoor(doors[Math.floor(Math.random() * doors.length)][0])
      const stars = Object.entries(NINE_STARS)
      setStar(stars[Math.floor(Math.random() * stars.length)][0])
    }
  }

  return (<div className="max-w-2xl mx-auto px-4 py-10">
    <h1 className="text-3xl font-bold text-gold-400 font-serif mb-3">{getT('fengshuiPage.title')}</h1>
    <p className="text-gray-400 mb-6">{getT('fengshuiPage.desc')}</p>

    {/* 八卦罗盘 */}
    <div className="bg-dark-800/80 rounded-xl border border-dark-600 p-6 mb-8">
      <h3 className="text-sm font-semibold text-gold-400 mb-3 text-center">{getT('fengshuiPage.luopanTitle')}</h3>
      <div className="grid grid-cols-4 gap-2 max-w-sm mx-auto">
        <div></div>
        <div className="text-center bg-dark-700 rounded-lg p-2 border border-dark-600">
          <p className="text-lg font-bold text-gold-400">☰</p>
          <p className="text-[10px] text-gray-300">乾·西北</p>
        </div>
        <div></div>
        <div></div>
        <div className="text-center bg-dark-700 rounded-lg p-2 border border-dark-600">
          <p className="text-lg font-bold text-gold-400">☱</p>
          <p className="text-[10px] text-gray-300">兑·西</p>
        </div>
        <div className="text-center bg-gold-700/30 rounded-lg p-2 border border-gold-700">
          <p className="text-lg font-bold text-gold-400">坎</p>
          <p className="text-[10px] text-gray-300">北·☵</p>
        </div>
        <div className="text-center bg-dark-700 rounded-lg p-2 border border-dark-600">
          <p className="text-lg font-bold text-gold-400">☲</p>
          <p className="text-[10px] text-gray-300">离·南</p>
        </div>
        <div className="text-center bg-dark-700 rounded-lg p-2 border border-dark-600">
          <p className="text-lg font-bold text-gold-400">☳</p>
          <p className="text-[10px] text-gray-300">震·东</p>
        </div>
        <div></div>
        <div></div>
        <div></div>
        <div className="text-center bg-dark-700 rounded-lg p-2 border border-dark-600">
          <p className="text-lg font-bold text-gold-400">☷</p>
          <p className="text-[10px] text-gray-300">坤·西南</p>
        </div>
        <div></div>
        <div></div>
        <div></div>
        <div className="text-center bg-dark-700 rounded-lg p-2 border border-dark-600">
          <p className="text-lg font-bold text-gold-400">☴</p>
          <p className="text-[10px] text-gray-300">巽·东南</p>
        </div>
        <div></div>
        <div></div>
        <div></div>
        <div className="text-center bg-dark-700 rounded-lg p-2 border border-dark-600">
          <p className="text-lg font-bold text-gold-400">☶</p>
          <p className="text-[10px] text-gray-300">艮·东北</p>
        </div>
      </div>
    </div>

    {/* 方位查询 */}
    <div className="bg-dark-800/80 rounded-xl border border-dark-600 p-6 mb-8">
      <h3 className="text-sm font-semibold text-gold-400 mb-3">{getT('fengshuiPage.queryTitle')}</h3>
      <div className="flex gap-2 mb-4">
        <input type="text" value={dir} onChange={e=>setDir(e.target.value)} placeholder={getT('fengshuiPage.queryPlaceholder')} className="flex-1 px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-gray-200 text-sm" />
        <button onClick={checkDirection} className="bg-gold-600 hover:bg-gold-500 text-dark-900 font-semibold px-4 py-2 rounded-lg text-sm">{getT('fengshuiPage.queryButton')}</button>
      </div>
      {gua && (<div className="space-y-3">
        <div className="bg-dark-700 rounded-lg p-3">
          <p className="text-xs text-gold-400 font-semibold">{gua.dir} · {gua.name}卦（{gua.emoji}）</p>
          <p className="text-[10px] text-gray-400">{getT('fengshuiPage.wx')}{gua.wx} · {getT('fengshuiPage.attr')}{gua.attr} · {getT('fengshuiPage.luoshuNum')}{gua.num}</p>
        </div>
        <div className="bg-dark-700 rounded-lg p-3">
          <p className="text-xs text-gray-300 leading-relaxed">{LUOPAN_MEANING[gua.name]}</p>
        </div>
        {door && star && (<div className="grid grid-cols-2 gap-2">
          <div className="bg-dark-700 rounded-lg p-3"><p className="text-[10px] text-gray-400">{getT('fengshuiPage.eightDoors')}</p><p className="text-xs text-gold-400">{door}：{EIGHT_DOORS[door]}</p></div>
          <div className="bg-dark-700 rounded-lg p-3"><p className="text-[10px] text-gray-400">{getT('fengshuiPage.nineStars')}</p><p className="text-xs text-gold-400">{star}：{NINE_STARS[star]}</p></div>
        </div>)}
      </div>)}
    </div>

    {/* 八卦列表 */}
    <div className="bg-dark-800/80 rounded-xl border border-dark-600 p-5">
      <h3 className="text-xs font-semibold text-gray-200 mb-3">{getT('fengshuiPage.detailTable')}</h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {BA_GUA.map(g => (
          <div key={g.name} className="bg-dark-700 rounded-lg p-2 text-center border border-dark-600">
            <p className="text-lg">{g.emoji}</p>
            <p className="text-xs font-bold text-gold-400">{g.name}</p>
            <p className="text-[9px] text-gray-500">{g.dir} · {g.wx}</p>
          </div>
        ))}
      </div>
    </div>
  </div>)
}
