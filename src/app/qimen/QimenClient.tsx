'use client'

import { useState } from 'react'
import { useLocale } from '@/lib/i18n'

const QIMEN_DOORS = [
  {name:'休门',dir:'北',luck:'吉',meaning:'休养生息，百事可为。宜祭祀、求财、婚姻、嫁娶。'},
  {name:'生门',dir:'东北',luck:'大吉',meaning:'生生不息，万事亨通。宜求财、创业、出行、上任。'},
  {name:'伤门',dir:'东',luck:'凶',meaning:'伤筋动骨，不宜行动。宜捕猎、索债、诉讼。'},
  {name:'杜门',dir:'东南',luck:'平',meaning:'堵塞不通，宜隐不宜出。宜躲藏、保密、修行。'},
  {name:'景门',dir:'南',luck:'平',meaning:'景色明丽，宜献策、上书、考试。'},
  {name:'死门',dir:'西南',luck:'大凶',meaning:'死气沉沉，百事不利。宜吊丧、送葬、捕猎。'},
  {name:'惊门',dir:'西',luck:'凶',meaning:'惊恐不安，宜防盗、诉讼、捕捉。'},
  {name:'开门',dir:'西北',luck:'大吉',meaning:'开门大吉，万事通达。宜开业、出行、求财、嫁娶。'},
]

const QIMEN_STARS = [
  {name:'天蓬',dir:'北',luck:'凶',meaning:'天蓬星属水，主盗贼破财。宜安抚边疆，不宜主动出击。'},
  {name:'天芮',dir:'西南',luck:'凶',meaning:'天芮星属土，主疾病问题。宜屯兵固守，不宜用兵。'},
  {name:'天冲',dir:'东',luck:'平',meaning:'天冲星属木，主冲击变动。宜行军作战，不宜宴乐。'},
  {name:'天辅',dir:'东南',luck:'吉',meaning:'天辅星属木，主文化教育。宜入学考试、讲学。'},
  {name:'天禽',dir:'中',luck:'大吉',meaning:'天禽星属土，主中正平和。百事皆宜，大吉之象。'},
  {name:'天心',dir:'西北',luck:'吉',meaning:'天心星属金，主医疗策划。宜治病吃药、谋划策略。'},
  {name:'天柱',dir:'西',luck:'凶',meaning:'天柱星属金，主破坏口舌。宜屯兵固守，不宜出战。'},
  {name:'天任',dir:'东北',luck:'吉',meaning:'天任星属土，主稳重积累。宜筑城、上任、求财。'},
  {name:'天英',dir:'南',luck:'平',meaning:'天英星属火，主光明名气。宜上书献策，不宜私事。'},
]

const QIMEN_GODS = ['值符','螣蛇','太阴','六合','白虎','玄武','九地','九天']

interface QimenResult {
  hourGan: string; hourZhi: string; doorIndex: number; starIndex: number; godIndex: number
}

function calcQimen(hIndex: number): QimenResult {
  const doorIndex = hIndex % 8
  const starIndex = hIndex % 9
  const godIndex = hIndex % 8
  const HOUR_GAN = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸']
  const HOUR_ZHI = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥']
  return {
    hourGan: HOUR_GAN[hIndex % 10],
    hourZhi: HOUR_ZHI[hIndex],
    doorIndex, starIndex, godIndex
  }
}

const YIN_YANG: Record<string,string> = {
  '甲':'阳木','乙':'阴木','丙':'阳火','丁':'阴火','戊':'阳土','己':'阴土','庚':'阳金','辛':'阴金','壬':'阳水','癸':'阴水'
}

export default function QimenClient() {
  const { locale } = useLocale()
  const [hourIndex, setHourIndex] = useState(0)
  const [result, setResult] = useState<QimenResult | null>(null)

  const calc = () => {
    setResult(calcQimen(parseInt(hourIndex.toString())))
  }

  const r = result

  return (<div className="max-w-2xl mx-auto px-4 py-10">
    <h1 className="text-3xl font-bold text-gold-400 font-serif mb-3">{locale === 'en' ? 'Qi Men Dun Jia' : locale === 'ja' ? '奇門遁甲' : locale === 'ko' ? '기문둔갑' : '奇门遁甲'}</h1>
    <p className="text-gray-400 mb-6">{locale === 'en' ? 'Qi Men charting — eight doors, nine stars, spirit overview' : locale === 'ja' ? '奇門遁甲の盤、八門九星神煞の簡析' : locale === 'ko' ? '기문둔갑 배열, 팔문구성신살 간단 해석' : '奇门遁甲排盘，八门九星神煞简析'}</p>

    <div className="bg-dark-800/80 rounded-xl border border-dark-600 p-6 mb-8">
      <p className="text-xs text-gray-400 mb-3">{locale === 'en' ? 'Select hour (or current hour)' : locale === 'ja' ? '時辰を選ぶ（または現在の時辰）' : locale === 'ko' ? '시진 선택 (또는 현재 시진)' : '选择时辰（或当前时辰）'}</p>
      <div className="grid grid-cols-4 gap-2 mb-4 max-w-sm">
        {['子(23-1)','丑(1-3)','寅(3-5)','卯(5-7)','辰(7-9)','巳(9-11)','午(11-13)','未(13-15)','申(15-17)','酉(17-19)','戌(19-21)','亥(21-23)'].map((label,i)=>(
          <button key={i} onClick={()=>setHourIndex(i)}
            className={`text-[10px] px-2 py-1.5 rounded-lg ${hourIndex===i?'bg-gold-600 text-dark-900':'bg-dark-700 text-gray-400 border border-dark-600'}`}>{label}</button>
        ))}
      </div>
      <button onClick={calc} className="bg-gold-600 hover:bg-gold-500 text-dark-900 font-semibold px-6 py-2.5 rounded-lg transition-colors active:scale-95">{locale === 'en' ? 'Chart' : locale === 'ja' ? '排盤' : locale === 'ko' ? '배반' : '排盘'}</button>
    </div>

    {r && (<div className="space-y-4">
      <div className="bg-dark-800/80 rounded-xl border border-dark-600 p-5 text-center">
        <p className="text-lg font-bold text-gold-400">时柱：{r.hourGan}{r.hourZhi}</p>
        <p className="text-[10px] text-gray-400">{YIN_YANG[r.hourGan]} · {r.hourZhi}{locale === 'en' ? ' hour' : locale === 'ja' ? '時' : locale === 'ko' ? '시' : '时'}</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-dark-800/80 rounded-xl border border-dark-600 p-4 text-center">
          <p className={`text-sm font-bold ${QIMEN_DOORS[r.doorIndex].luck==='大吉'?'text-green-400':QIMEN_DOORS[r.doorIndex].luck==='凶'||QIMEN_DOORS[r.doorIndex].luck==='大凶'?'text-red-400':'text-yellow-400'}`}>{QIMEN_DOORS[r.doorIndex].name}门</p>
          <p className="text-[10px] text-gray-500">{QIMEN_DOORS[r.doorIndex].dir} · {QIMEN_DOORS[r.doorIndex].luck}</p>
        </div>
        <div className="bg-dark-800/80 rounded-xl border border-dark-600 p-4 text-center">
          <p className={`text-sm font-bold ${QIMEN_STARS[r.starIndex].luck==='大吉'?'text-green-400':QIMEN_STARS[r.starIndex].luck==='凶'?'text-red-400':'text-yellow-400'}`}>{QIMEN_STARS[r.starIndex].name}星</p>
          <p className="text-[10px] text-gray-500">{QIMEN_STARS[r.starIndex].dir} · {QIMEN_STARS[r.starIndex].luck}</p>
        </div>
        <div className="bg-dark-800/80 rounded-xl border border-dark-600 p-4 text-center">
          <p className="text-sm font-bold text-gold-400">{QIMEN_GODS[r.godIndex]}</p>
          <p className="text-[10px] text-gray-500">{locale === 'en' ? 'Spirit' : locale === 'ja' ? '神煞' : locale === 'ko' ? '신살' : '神煞'}</p>
        </div>
      </div>

      <div className="bg-dark-800/80 rounded-xl border border-dark-600 p-4">
        <h3 className="text-xs font-semibold text-gold-400 mb-2">{locale === 'en' ? 'Eight Doors Meaning' : locale === 'ja' ? '八門解釈' : locale === 'ko' ? '팔문 해석' : '八门释义'}</h3>
        <p className="text-xs text-gray-300">{QIMEN_DOORS[r.doorIndex].meaning}</p>
      </div>
      <div className="bg-dark-800/80 rounded-xl border border-dark-600 p-4">
        <h3 className="text-xs font-semibold text-gold-400 mb-2">{locale === 'en' ? 'Nine Stars Meaning' : locale === 'ja' ? '九星解釈' : locale === 'ko' ? '구성 해석' : '九星释义'}</h3>
        <p className="text-xs text-gray-300">{QIMEN_STARS[r.starIndex].meaning}</p>
      </div>

      <div className="bg-dark-800/80 rounded-xl border border-dark-600 p-4">
        <h3 className="text-xs font-semibold text-gray-200 mb-2">{locale === 'en' ? 'Comprehensive Advice' : locale === 'ja' ? '総合アドバイス' : locale === 'ko' ? '종합 조언' : '综合建议'}</h3>
        <p className="text-[11px] text-gray-300 leading-relaxed">
          {locale === 'en' ? `Currently ${QIMEN_DOORS[r.doorIndex].name} Door (${QIMEN_DOORS[r.doorIndex].luck}). Favorable direction: ${QIMEN_DOORS[r.doorIndex].dir} or ${QIMEN_STARS[r.starIndex].dir}. Avoid the ${QIMEN_DOORS.find(d=>d.luck==='大凶')?.dir || 'opposing'} direction.` :
           locale === 'ja' ? `現在${QIMEN_DOORS[r.doorIndex].name}門（${QIMEN_DOORS[r.doorIndex].luck}）。${QIMEN_DOORS[r.doorIndex].dir}方または${QIMEN_STARS[r.starIndex].dir}方を向くのが良く、${QIMEN_DOORS.find(d=>d.luck==='大凶')?.dir || '对冲'}方は避けよ。` :
           locale === 'ko' ? `현재 ${QIMEN_DOORS[r.doorIndex].name}문(${QIMEN_DOORS[r.doorIndex].luck}). ${QIMEN_DOORS[r.doorIndex].dir}쪽이나 ${QIMEN_STARS[r.starIndex].dir}쪽을 향하는 것이 좋고, ${QIMEN_DOORS.find(d=>d.luck==='大凶')?.dir || '대충'}쪽은 피하세요.` :
           `当前${QIMEN_DOORS[r.doorIndex].name}${QIMEN_DOORS[r.doorIndex].luck}，宜${QIMEN_DOORS[r.doorIndex].meaning.split('宜')[1]?.split('。')[0] || '平稳行事'}。坐向宜朝向${QIMEN_DOORS[r.doorIndex].dir}方或${QIMEN_STARS[r.starIndex].dir}方，避${QIMEN_DOORS.find(d=>d.luck==='大凶')?.dir || '对冲'}方。`}
        </p>
      </div>
    </div>)}
  </div>)
}
