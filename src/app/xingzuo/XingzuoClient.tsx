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

const PAIRING: Record<string,string> = {
  '白羊座×白羊座':'热情似火，双羊相争，激情有余而温和不足。',
  '白羊座×金牛座':'冲动与固执的碰撞，需要耐心磨合。',
  '白羊座×双子座':'趣味相投，充满新鲜感的组合。',
  '白羊座×巨蟹座':'需要互相包容，一个向前冲一个向后缩。',
  '白羊座×狮子座':'天生一对，火象三傻的热情组合。',
  '白羊座×处女座':'差异很大，一个粗心一个细致。',
  '白羊座×天秤座':'互相吸引的互补型，一个行动一个权衡。',
  '白羊座×天蝎座':'激情四射但也冲突不断。',
  '白羊座×射手座':'志趣相投，一起冒险的好搭档。',
  '白羊座×摩羯座':'互补型，一个冲动一个稳重。',
  '白羊座×水瓶座':'火花四射，创意无限的好组合。',
  '白羊座×双鱼座':'白羊的现实与双鱼的浪漫，互补美好。',
  '金牛座×金牛座':'稳定安逸，志同道合的默契组合。',
  '金牛座×双子座':'节奏不同，需要更多沟通。',
  '金牛座×巨蟹座':'温馨踏实，家庭观念一致的好组合。',
  '金牛座×狮子座':'互相吸引但也互不相让。',
  '金牛座×处女座':'务实搭档，三观高度一致。',
  '金牛座×天秤座':'优雅搭配，一个享受一个品味。',
  '金牛座×天蝎座':'深情组合，占有欲都强。',
  '金牛座×射手座':'差异大，一个求稳一个好动。',
  '金牛座×摩羯座':'天生一对，最务实的组合。',
  '金牛座×水瓶座':'需要包容，一个传统一个新潮。',
  '金牛座×双鱼座':'浪漫配对，温柔的组合。',
  '双子座×双子座':'趣味相投，永远不无聊的组合。',
  '双子座×巨蟹座':'理解包容，一个善变一个顾家。',
  '双子座×狮子座':'才子佳人的组合，互相欣赏。',
  '双子座×处女座':'都是智性恋，但一个随性一个认真。',
  '双子座×天秤座':'天生一对，风象星座的完美搭配。',
  '双子座×天蝎座':'深度吸引，但信任是课题。',
  '双子座×射手座':'自由组合，一起欢笑的伴侣。',
  '双子座×摩羯座':'互补型，一个灵活一个踏实。',
  '双子座×水瓶座':'灵魂伴侣，风象星座知己。',
  '双子座×双鱼座':'梦幻搭配，一个理性一个感性。',
  '巨蟹座×巨蟹座':'温馨顾家，互相取暖的好组合。',
  '巨蟹座×狮子座':'浪漫激情，霸道总裁爱上我。',
  '巨蟹座×处女座':'互补组合，一个感性一个理性。',
  '巨蟹座×天秤座':'优雅配对，一个居家一个社交。',
  '巨蟹座×天蝎座':'天生一对，水象星座的深情组合。',
  '巨蟹座×射手座':'理解包容，一个宅家一个好动。',
  '巨蟹座×摩羯座':'踏实依靠，家庭观念一致。',
  '巨蟹座×水瓶座':'差异大，需要更多理解。',
  '巨蟹座×双鱼座':'温柔浪漫，水象的梦幻组合。',
  '狮子座×狮子座':'双王组合，光芒四射但也互不相让。',
  '狮子座×处女座':'一个张扬一个低调，互相欣赏。',
  '狮子座×天秤座':'才子佳人，郎才女貌。',
  '狮子座×天蝎座':'王者对决，激情与掌控的碰撞。',
  '狮子座×射手座':'快乐组合，火象的活力拍档。',
  '狮子座×摩羯座':'一个耀眼一个稳重，互补吸弓。',
  '狮子座×水瓶座':'互相欣赏，都是特立独行的主。',
  '狮子座×双鱼座':'霸道总裁与温柔公主的组合。',
  '处女座×处女座':'完美主义二人组，互相挑剔也互相理解。',
  '处女座×天秤座':'优雅又理性的搭配。',
  '处女座×天蝎座':'深沉组合，对细节都敏感。',
  '处女座×射手座':'一个严谨一个随性，需要包容。',
  '处女座×摩羯座':'务实搭档，一起奋斗的黄金组合。',
  '处女座×水瓶座':'差异互补，一个注重细节一个看大局。',
  '处女座×双鱼座':'互补组合，完美的互补。',
  '天秤座×天秤座':'优雅和谐，太像反而需要火花。',
  '天秤座×天蝎座':'魅惑组合，互相吸引又互相试探。',
  '天秤座×射手座':'快乐组合，一起享受人生。',
  '天秤座×摩羯座':'一个社交一个务实，互补型。',
  '天秤座×水瓶座':'天生一对，风象的知性组合。',
  '天秤座×双鱼座':'浪漫优雅，文艺范十足。',
  '天蝎座×天蝎座':'深情也虐心，两个极端。',
  '天蝎座×射手座':'一个深沉一个开朗，需要磨合。',
  '天蝎座×摩羯座':'强强联手，做大事的组合。',
  '天蝎座×水瓶座':'深度吸引，神秘感十足。',
  '天蝎座×双鱼座':'天生一对，最深情浪漫的组合。',
  '射手座×射手座':'快乐加倍，一起冒险玩耍。',
  '射手座×摩羯座':'一个自由一个务实，需要包容。',
  '射手座×水瓶座':'自由组合，志同道合的好友兼伴侣。',
  '射手座×双鱼座':'一个乐观一个感性，互相感染。',
  '摩羯座×摩羯座':'务实二人组，一起奋斗事业。',
  '摩羯座×水瓶座':'互补型，一个稳重新潮。',
  '摩羯座×双鱼座':'踏实依靠，温柔浪漫的搭配。',
  '水瓶座×水瓶座':'灵魂伴侣，两个外星人的默契。',
  '水瓶座×双鱼座':'梦幻组合，充满想象力的搭配。',
  '双鱼座×双鱼座':'浪漫至极，一起做梦的组合。',
}

export default function XingzuoClient() {
  const [mode, setMode] = useState<'horoscope' | 'match'>('horoscope')
  const [birthday, setBirthday] = useState('')
  const [matchS1, setMatchS1] = useState('白羊座')
  const [matchS2, setMatchS2] = useState('金牛座')
  const [result, setResult] = useState<any>(null)

  const analyzeHoroscope = () => {
    if (!birthday) return
    const idx = getSign(birthday)
    if (idx < 0) return
    setResult({ type: 'horoscope', sign: SIGNS[idx], horoscope: HOROSCOPE[idx] })
  }

  const analyzeMatch = () => {
    if (!matchS1 || !matchS2) return
    const key = matchS1 + '\u00d7' + matchS2
    const key2 = matchS2 + '\u00d7' + matchS1
    const comment = PAIRING[key] || PAIRING[key2] || '缘分不错的组合，相处愉快。'
    setResult({ type: 'match', s1: matchS1, s2: matchS2, comment })
  }

  const active = (m: string) => mode === m

  return (<div className="max-w-2xl mx-auto px-4 py-10">
    <h1 className="text-3xl font-bold text-gold-400 font-serif mb-3">星座占卜</h1>
    <p className="text-gray-400 mb-6">查看星座运势或进行星座配对分析</p>

    <div className="flex gap-2 mb-6">
      <button onClick={() => { setMode('horoscope'); setResult(null) }}
        className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${active('horoscope') ? 'bg-gold-600 text-dark-900' : 'bg-dark-700 text-gray-400 border border-dark-600'}`}>
        ♈ 星座运势
      </button>
      <button onClick={() => { setMode('match'); setResult(null) }}
        className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${active('match') ? 'bg-gold-600 text-dark-900' : 'bg-dark-700 text-gray-400 border border-dark-600'}`}>
        💑 星座配对
      </button>
    </div>

    {mode === 'horoscope' && (<div>
      <div className="bg-dark-800/80 backdrop-blur rounded-xl border border-dark-600 p-6 mb-8">
        <label className="text-xs text-gray-400 block mb-2">出生日期</label>
        <input type="text" value={birthday} onChange={e => setBirthday(e.target.value)} placeholder="例如：1990-10-14"
          className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-gray-200 mb-3" />
        <button onClick={analyzeHoroscope}
          className="bg-gold-600 hover:bg-gold-500 text-dark-900 font-semibold px-6 py-2.5 rounded-lg transition-colors active:scale-95">查看运势</button>
      </div>
    </div>)}

    {mode === 'match' && (<div>
      <div className="bg-dark-800/80 backdrop-blur rounded-xl border border-dark-600 p-6 mb-8">
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label className="text-xs text-gray-400 block mb-1">星座一</label>
            <select value={matchS1} onChange={e => setMatchS1(e.target.value)}
              className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-gray-200 text-sm">
              {SIGNS.map(s => <option key={s.name} value={s.name}>{s.emoji} {s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-400 block mb-1">星座二</label>
            <select value={matchS2} onChange={e => setMatchS2(e.target.value)}
              className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-gray-200 text-sm">
              {SIGNS.map(s => <option key={s.name} value={s.name}>{s.emoji} {s.name}</option>)}
            </select>
          </div>
        </div>
        <button onClick={analyzeMatch}
          className="bg-gold-600 hover:bg-gold-500 text-dark-900 font-semibold px-6 py-2.5 rounded-lg transition-colors active:scale-95">查看配对</button>
      </div>
    </div>)}

    {result && result.type === 'horoscope' && (<div className="space-y-4">
      <div className="bg-dark-800/80 backdrop-blur rounded-xl border border-dark-600 p-5 text-center">
        <p className="text-3xl mb-1">{result.sign.emoji}</p>
        <p className="text-xl font-bold text-gold-400">{result.sign.name} {result.sign.en}</p>
        <p className="text-xs text-gray-400">{result.sign.date} · {result.sign.el}象 · 守护星{result.sign.ruler}</p>
        <p className="text-xs text-gray-500 mt-1">{result.sign.traits}</p>
      </div>
      {(['love','career','money','health'] as const).map(cat => (
        <div key={cat} className="bg-dark-800/80 backdrop-blur rounded-xl border border-dark-600 p-4">
          <h3 className="text-xs font-semibold text-gold-400 mb-1">
            {{love:'爱情运势',career:'事业运势',money:'财运运势',health:'健康运势'}[cat]}
          </h3>
          <p className="text-xs text-gray-300">{result.horoscope[cat]}</p>
        </div>
      ))}
    </div>)}

    {result && result.type === 'match' && (<div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-dark-800/80 backdrop-blur rounded-xl border border-dark-600 p-4 text-center">
          <p className="text-2xl mb-1">{SIGNS.find(s=>s.name===result.s1)?.emoji}</p>
          <p className="text-sm font-bold text-gold-400">{result.s1}</p>
        </div>
        <div className="bg-dark-800/80 backdrop-blur rounded-xl border border-dark-600 p-4 text-center">
          <p className="text-2xl mb-1">{SIGNS.find(s=>s.name===result.s2)?.emoji}</p>
          <p className="text-sm font-bold text-gold-400">{result.s2}</p>
        </div>
      </div>
      <div className="bg-dark-800/80 backdrop-blur rounded-xl border border-dark-600 p-5 text-center">
        <p className="text-sm font-semibold text-gold-400 mb-2">💕 配对分析</p>
        <p className="text-sm text-gray-300 leading-relaxed">{result.comment}</p>
      </div>
    </div>)}
  </div>)
}
