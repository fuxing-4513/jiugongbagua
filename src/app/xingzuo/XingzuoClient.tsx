'use client'

import { useState } from 'react'

const SIGNS = [
  {name:'白羊座',en:'Aries',date:'3.21-4.19',emoji:'♈',el:'火',ruler:'火星',traits:'热情、勇敢、直率、冲动'},
  {name:'金牛座',en:'Taurus',date:'4.20-5.20',emoji:'♉',el:'土',ruler:'金星',traits:'务实、稳重、固执、爱美'},
  {name:'双子座',en:'Gemini',date:'5.21-6.21',emoji:'♊',el:'风',ruler:'水星',traits:'聪明、善变、好奇、善沟通'},
  {name:'巨蟹座',en:'Cancer',date:'6.22-7.22',emoji:'♋',el:'水',ruler:'月亮',traits:'敏感、顾家、重感情、念旧'},
  {name:'狮子座',en:'Leo',date:'7.23-8.22',emoji:'♌',el:'火',ruler:'太阳',traits:'自信、慷慨、骄傲、领导力'},
  {name:'处女座',en:'Virgo',date:'8.23-9.22',emoji:'♍',el:'土',ruler:'水星',traits:'细致、完美主义、务实、挑剔'},
  {name:'天秤座',en:'Libra',date:'9.23-10.23',emoji:'♎',el:'风',ruler:'金星',traits:'优雅、公正、优柔寡断、社交'},
  {name:'天蝎座',en:'Scorpio',date:'10.24-11.22',emoji:'♏',el:'水',ruler:'冥王星、火星',traits:'深沉、敏锐、专一、神秘'},
  {name:'射手座',en:'Sagittarius',date:'11.23-12.21',emoji:'♐',el:'火',ruler:'木星',traits:'乐观、自由、直率、爱冒险'},
  {name:'摩羯座',en:'Capricorn',date:'12.22-1.19',emoji:'♑',el:'土',ruler:'土星',traits:'坚韧、务实、稳重、有野心'},
  {name:'水瓶座',en:'Aquarius',date:'1.20-2.18',emoji:'♒',el:'风',ruler:'天王星、土星',traits:'创新、独立、理性、古怪'},
  {name:'双鱼座',en:'Pisces',date:'2.19-3.20',emoji:'♓',el:'水',ruler:'海王星、木星',traits:'感性、浪漫、想象力丰富、善良'},
]

const HOROSCOPE = [
  {love:'桃花运旺盛，单身者有机会遇到心仪对象。',career:'工作顺利，表现受到认可，有晋升机会。',money:'财运不错，适合投资理财，但不宜冒进。',health:'精力充沛，注意劳逸结合即可。'},
  {love:'感情稳定，已婚者家庭和睦。',career:'职场表现稳健，宜稳扎稳打。',money:'财运平稳，以储蓄为主。',health:'注意肠胃健康，饮食规律。'},
  {love:'社交活跃，有机会通过朋友认识新对象。',career:'创意灵感多，适合从事创意类工作。',money:'偏财运佳，有意外之财。',health:'注意呼吸道健康。'},
  {love:'家庭温馨，适合与伴侣共度时光。',career:'事业上宜守不宜攻，静待时机。',money:'财运一般，注意控制开支。',health:'情绪波动较大，注意调节心态。'},
  {love:'魅力四射，桃花运旺盛。',career:'事业顺遂，领导能力得到展现。',money:'财运亨通，正财偏财均有收获。',health:'注意心脏保养，避免过度劳累。'},
  {love:'对待感情认真负责，宜多沟通。',career:'工作细致表现好，但不要过于追求完美。',money:'财运稳定，适合做长期规划。',health:'注意肠胃和消化系统。'},
  {love:'人缘好，社交圈扩大，有机会结识新朋友。',career:'人际关系佳，合作顺利，适合团队协作。',money:'财运平稳，不宜投机。',health:'注意腰椎和颈椎保养。'},
  {love:'感情投入深沉，对伴侣专一。',career:'事业专注，有突破性进展的可能。',money:'偏财运不错，宜把握投资机会。',health:'注意情绪管理和睡眠质量。'},
  {love:'热情主动，适合主动出击追求心仪对象。',career:'事业上有新机遇，适合拓展业务。',money:'财运较好，适合尝试新的理财方式。',health:'注意运动损伤，量力而行。'},
  {love:'感情务实，注重现实基础。',career:'事业稳健发展，有望得到上司赏识。',money:'财运稳定增长，适合长期投资。',health:'注意骨骼关节健康。'},
  {love:'感情理性，需要更多沟通。',career:'创新思维活跃，适合提出新方案。',money:'财运波动，宜保守理财。',health:'注意神经系统和睡眠。'},
  {love:'浪漫多情，感情生活丰富。',career:'直觉敏锐，适合从事艺术创意类工作。',money:'财运起伏，注意不要冲动消费。',health:'注意免疫力和过敏问题。'},
]

function getSign(birthday: string): number {
  const parts = birthday.split('-').map(Number)
  if (parts.length !== 3) return -1
  const m = parts[1], d = parts[2]
  if ((m === 3 && d >= 21) || (m === 4 && d <= 19)) return 0
  if ((m === 4 && d >= 20) || (m === 5 && d <= 20)) return 1
  if ((m === 5 && d >= 21) || (m === 6 && d <= 21)) return 2
  if ((m === 6 && d >= 22) || (m === 7 && d <= 22)) return 3
  if ((m === 7 && d >= 23) || (m === 8 && d <= 22)) return 4
  if ((m === 8 && d >= 23) || (m === 9 && d <= 22)) return 5
  if ((m === 9 && d >= 23) || (m === 10 && d <= 23)) return 6
  if ((m === 10 && d >= 24) || (m === 11 && d <= 22)) return 7
  if ((m === 11 && d >= 23) || (m === 12 && d <= 21)) return 8
  if ((m === 12 && d >= 22) || (m === 1 && d <= 19)) return 9
  if ((m === 1 && d >= 20) || (m === 2 && d <= 18)) return 10
  return 11
}

const MATCH: Record<string,{[k:string]:string}> = {
  '白羊座':{'白羊座':'热情似火','金牛座':'需要磨合','双子座':'有趣组合','巨蟹座':'需包容','狮子座':'天生一对','处女座':'差异大','天秤座':'互相吸引','天蝎座':'激情碰撞','射手座':'志趣相投','摩羯座':'互补型','水瓶座':'火花四射','双鱼座':'浪漫组合'},
  '金牛座':{'金牛座':'稳定安逸','双子座':'需要沟通','巨蟹座':'温馨组合','狮子座':'互有吸引','处女座':'务实搭档','天秤座':'优雅搭配','天蝎座':'深情组合','射手座':'差异大','摩羯座':'天生一对','水瓶座':'需要包容','双鱼座':'浪漫配对'},
  '水瓶座':{'水瓶座':'灵魂伴侣','双鱼座':'梦幻组合','白羊座':'志同道合','金牛座':'需要磨合','双子座':'趣味相投','巨蟹座':'理解包容','狮子座':'互相欣赏','处女座':'差异互补','天秤座':'天生一对','天蝎座':'深度吸引','射手座':'自由组合','摩羯座':'互补型'},
  '双鱼座':{'双鱼座':'浪漫至极','白羊座':'互相吸引','金牛座':'温暖组合','双子座':'梦幻搭配','巨蟹座':'天生一对','狮子座':'浪漫激情','处女座':'互补组合','天秤座':'优雅配对','天蝎座':'深情相拥','射手座':'理解包容','摩羯座':'踏实依靠','水瓶座':'梦幻组合'},
}

export default function XingzuoClient() {
  const [birthday, setBirthday] = useState('')
  const [sign1, setSign1] = useState('')
  const [sign2, setSign2] = useState('')
  const [result, setResult] = useState<any>(null)
  const [matchR, setMatchR] = useState<any>(null)

  const analyze = () => {
    if (!birthday) return
    const idx = getSign(birthday)
    if (idx < 0) return
    const s = SIGNS[idx]
    const h = HOROSCOPE[idx]
    setResult({ sign: s, horoscope: h })
    setMatchR(null)
  }

  const match = () => {
    const i1 = SIGNS.findIndex(s => s.name === sign1)
    const i2 = SIGNS.findIndex(s => s.name === sign2)
    if (i1 < 0 || i2 < 0) return
    const s1 = SIGNS[i1], s2 = SIGNS[i2]
    const pairKey = sign1 in MATCH ? sign1 : (sign2 in MATCH ? sign2 : null)
    const comment = pairKey ? MATCH[pairKey]?.[sign1 === pairKey ? sign2 : sign1] || '有缘组合' : '有缘组合'
    setResult(null)
    setMatchR({ s1, s2, comment })
  }

  const r = result, m = matchR

  return (<div className="max-w-2xl mx-auto px-4 py-10">
    <h1 className="text-3xl font-bold text-gold-400 font-serif mb-3">星座占卜</h1>
    <p className="text-gray-400 mb-6">输入生日查看星座运势，或进行星座配对</p>

    <div className="flex gap-2 mb-6">
      <button onClick={()=>{analyze}} className={`px-3 py-1.5 text-xs rounded-lg ${!matchR ? 'bg-gold-600 text-dark-900' : 'bg-dark-700 text-gray-400 border border-dark-600'}`}>星座运势</button>
      <button onClick={()=>{}} className={`px-3 py-1.5 text-xs rounded-lg ${matchR ? 'bg-gold-600 text-dark-900' : 'bg-dark-700 text-gray-400 border border-dark-600'}`}>星座配对</button>
    </div>

    {/* 运势模式 */}
    <div className="bg-dark-800/80 backdrop-blur rounded-xl border border-dark-600 p-6 mb-8">
      <label className="text-xs text-gray-400 block mb-2">出生日期（如：1990-10-14）</label>
      <input type="text" value={birthday} onChange={e=>setBirthday(e.target.value)} placeholder="YYYY-MM-DD" className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-gray-200 mb-3" />
      <button onClick={analyze} className="bg-gold-600 hover:bg-gold-500 text-dark-900 font-semibold px-6 py-2.5 rounded-lg transition-colors active:scale-95">查看运势</button>
    </div>

    {r && (<div className="space-y-4">
      <div className="bg-dark-800/80 backdrop-blur rounded-xl border border-dark-600 p-5 text-center">
        <p className="text-3xl">{r.sign.emoji}</p>
        <p className="text-xl font-bold text-gold-400">{r.sign.name} {r.sign.en}</p>
        <p className="text-xs text-gray-400">{r.sign.date} · {r.sign.el}象 · 守护星{r.sign.ruler}</p>
        <p className="text-xs text-gray-500 mt-1">{r.sign.traits}</p>
      </div>
      {(['love','career','money','health'] as const).map(cat => (
        <div key={cat} className="bg-dark-800/80 backdrop-blur rounded-xl border border-dark-600 p-4">
          <h3 className="text-xs font-semibold text-gold-400 mb-1">{{love:'爱情运势',career:'事业运势',money:'财运运势',health:'健康运势'}[cat]}</h3>
          <p className="text-xs text-gray-300">{r.horoscope[cat]}</p>
        </div>
      ))}
    </div>)}

    {/* 配对模式 */}
    {m && (<div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-dark-800/80 backdrop-blur rounded-xl border border-dark-600 p-4 text-center">
          <p className="text-2xl">{m.s1.emoji}</p>
          <p className="text-sm font-bold text-gold-400">{m.s1.name}</p>
        </div>
        <div className="bg-dark-800/80 backdrop-blur rounded-xl border border-dark-600 p-4 text-center">
          <p className="text-2xl">{m.s2.emoji}</p>
          <p className="text-sm font-bold text-gold-400">{m.s2.name}</p>
        </div>
      </div>
      <div className="bg-dark-800/80 backdrop-blur rounded-xl border border-dark-600 p-5 text-center">
        <p className="text-sm text-gold-400 font-semibold">配对评价</p>
        <p className="text-sm text-gray-300 mt-1">{m.comment}</p>
      </div>
    </div>)}
  </div>)
}
