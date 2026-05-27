'use client'

import { useState } from 'react'

const SIGNS = [
  { name: '白羊座', en: 'Aries', date: '3.21-4.19', emoji: '♈', el: '火', ruler: '火星', traits: '热情、勇敢、直率、冲动' },
  { name: '金牛座', en: 'Taurus', date: '4.20-5.20', emoji: '♉', el: '土', ruler: '金星', traits: '务实、稳重、固执、爱美' },
  { name: '双子座', en: 'Gemini', date: '5.21-6.21', emoji: '♊', el: '风', ruler: '水星', traits: '聪明、善变、好奇、善沟通' },
  { name: '巨蟹座', en: 'Cancer', date: '6.22-7.22', emoji: '♋', el: '水', ruler: '月亮', traits: '敏感、顾家、重感情、念旧' },
  { name: '狮子座', en: 'Leo', date: '7.23-8.22', emoji: '♌', el: '火', ruler: '太阳', traits: '自信、慷慨、骄傲、领导力' },
  { name: '处女座', en: 'Virgo', date: '8.23-9.22', emoji: '♍', el: '土', ruler: '水星', traits: '细致、完美主义、务实、挑剔' },
  { name: '天秤座', en: 'Libra', date: '9.23-10.23', emoji: '♎', el: '风', ruler: '金星', traits: '优雅、公正、优柔寡断、社交' },
  { name: '天蝎座', en: 'Scorpio', date: '10.24-11.22', emoji: '♏', el: '水', ruler: '冥王星、火星', traits: '深沉、敏锐、专一、神秘' },
  { name: '射手座', en: 'Sagittarius', date: '11.23-12.21', emoji: '♐', el: '火', ruler: '木星', traits: '乐观、自由、直率、爱冒险' },
  { name: '摩羯座', en: 'Capricorn', date: '12.22-1.19', emoji: '♑', el: '土', ruler: '土星', traits: '坚韧、务实、稳重、有野心' },
  { name: '水瓶座', en: 'Aquarius', date: '1.20-2.18', emoji: '♒', el: '风', ruler: '天王星、土星', traits: '创新、独立、理性、古怪' },
  { name: '双鱼座', en: 'Pisces', date: '2.19-3.20', emoji: '♓', el: '水', ruler: '海王星、木星', traits: '感性、浪漫、想象力丰富、善良' },
]

const HOROSCOPE: Record<string, { love: string; career: string; money: string; health: string }> = {
  '白羊座': { love: '桃花运旺盛，单身者脱单机会多', career: '事业顺利，表现受认可，有晋升机遇', money: '财运不错，宜投资理财但勿冒进', health: '精力充沛，注意劳逸结合' },
  '金牛座': { love: '感情稳定，家庭和睦温馨', career: '职场稳健，宜稳扎稳打', money: '财运平稳，以储蓄为主', health: '注意肠胃，饮食规律' },
  '双子座': { love: '社交活跃，朋友中易遇良缘', career: '创意思维活跃，适合策划类工作', money: '偏财运佳，有意外之财', health: '注意呼吸道健康' },
  '巨蟹座': { love: '家庭温馨，适合与伴侣共处', career: '宜守不宜攻，静待时机', money: '财运一般，控制开支', health: '情绪波动大，注意调节' },
  '狮子座': { love: '魅力四射，桃花运旺盛', career: '事业顺遂，领导力展现', money: '财运亨通，正偏财双收', health: '注意心脏，勿过度劳累' },
  '处女座': { love: '感情认真负责，宜多沟通', career: '工作细致表现好，勿过于完美主义', money: '财运稳定，宜长期规划', health: '注意肠胃消化系统' },
  '天秤座': { love: '人缘佳，社交圈扩大', career: '人际关系顺畅，团队协作佳', money: '财运平稳，不宜投机', health: '注意腰椎颈椎' },
  '天蝎座': { love: '感情投入深沉，对伴侣专一', career: '事业专注，有突破性进展', money: '偏财运不错，把握投资机会', health: '注意情绪与睡眠质量' },
  '射手座': { love: '热情主动，宜主动出击', career: '事业新机遇，适合拓展业务', money: '财运较好，尝试新理财方式', health: '注意运动损伤' },
  '摩羯座': { love: '感情务实，注重现实基础', career: '事业稳健发展，得上司赏识', money: '财运稳定增长，宜长期投资', health: '注意骨骼关节' },
  '水瓶座': { love: '感情理性，需多沟通交流', career: '创新思维活跃，提新方案佳', money: '财运波动，宜保守理财', health: '注意神经系统与睡眠' },
  '双鱼座': { love: '浪漫多情，感情生活丰富', career: '直觉敏锐，适合创意类工作', money: '财运起伏，勿冲动消费', health: '注意免疫力与过敏' },
}

function getSign(birthday: string): { name: string; idx: number } | null {
  const p = birthday.split('-').map(Number)
  if (p.length !== 3) return null
  const m = p[1], d = p[2]
  let idx = -1
  if ((m === 3 && d >= 21) || (m === 4 && d <= 19)) idx = 0
  else if ((m === 4 && d >= 20) || (m === 5 && d <= 20)) idx = 1
  else if ((m === 5 && d >= 21) || (m === 6 && d <= 21)) idx = 2
  else if ((m === 6 && d >= 22) || (m === 7 && d <= 22)) idx = 3
  else if ((m === 7 && d >= 23) || (m === 8 && d <= 22)) idx = 4
  else if ((m === 8 && d >= 23) || (m === 9 && d <= 22)) idx = 5
  else if ((m === 9 && d >= 23) || (m === 10 && d <= 23)) idx = 6
  else if ((m === 10 && d >= 24) || (m === 11 && d <= 22)) idx = 7
  else if ((m === 11 && d >= 23) || (m === 12 && d <= 21)) idx = 8
  else if ((m === 12 && d >= 22) || (m === 1 && d <= 19)) idx = 9
  else if ((m === 1 && d >= 20) || (m === 2 && d <= 18)) idx = 10
  else idx = 11
  return { name: SIGNS[idx].name, idx }
}

const PAIRING: Record<string, string> = {
  '白羊座×白羊座': '热情似火，双羊相争，激情有余温和不足',
  '白羊座×金牛座': '冲动与固执的碰撞，需要耐心磨合',
  '白羊座×双子座': '趣味相投，充满新鲜感的组合',
  '白羊座×巨蟹座': '需要互相包容，一个向前冲一个向后缩',
  '白羊座×狮子座': '天生一对，火象的热情组合',
  '白羊座×处女座': '差异大，一个粗心一个细致',
  '白羊座×天秤座': '互相吸引的互补型',
  '白羊座×天蝎座': '激情四射但也冲突不断',
  '白羊座×射手座': '志趣相投，一起冒险的好搭档',
  '白羊座×摩羯座': '互补型，一个冲动一个稳重',
  '白羊座×水瓶座': '火花四射，创意无限的好组合',
  '白羊座×双鱼座': '白羊的现实与双鱼的浪漫，互补美好',
  '金牛座×金牛座': '稳定安逸，志同道合的默契组合',
  '金牛座×双子座': '节奏不同，需更多沟通',
  '金牛座×巨蟹座': '温馨踏实，家庭观念一致',
  '金牛座×狮子座': '互相吸引也互不相让',
  '金牛座×处女座': '务实搭档，三观高度一致',
  '金牛座×天秤座': '优雅搭配，一个享受一个品味',
  '金牛座×天蝎座': '深情组合，占有欲都强',
  '金牛座×射手座': '差异大，一个求稳一个好动',
  '金牛座×摩羯座': '天生一对，最务实的组合',
  '金牛座×水瓶座': '需包容，一个传统一个新潮',
  '金牛座×双鱼座': '浪漫配对，温柔的组合',
  '双子座×双子座': '趣味相投，永不无聊',
  '双子座×巨蟹座': '理解包容，一个善变一个顾家',
  '双子座×狮子座': '才子佳人组合，互相欣赏',
  '双子座×处女座': '都是智性恋，一个随性一个认真',
  '双子座×天秤座': '天生一对，风象完美搭配',
  '双子座×天蝎座': '深度吸引，但信任是课题',
  '双子座×射手座': '自由组合，一起欢笑',
  '双子座×摩羯座': '互补型，一个灵活一个踏实',
  '双子座×水瓶座': '灵魂伴侣，风象知己',
  '双子座×双鱼座': '梦幻搭配，理性与感性',
  '巨蟹座×巨蟹座': '温馨顾家，互相取暖',
  '巨蟹座×狮子座': '浪漫激情，霸道总裁爱上我',
  '巨蟹座×处女座': '互补组合，一个感性一个理性',
  '巨蟹座×天秤座': '优雅配对，一个居家一个社交',
  '巨蟹座×天蝎座': '天生一对，水象深情组合',
  '巨蟹座×射手座': '理解包容，一个宅家一个好动',
  '巨蟹座×摩羯座': '踏实依靠，家庭观念一致',
  '巨蟹座×水瓶座': '差异大，需更多理解',
  '巨蟹座×双鱼座': '温柔浪漫，水象梦幻组合',
  '狮子座×狮子座': '双王组合，光芒四射也互不相让',
  '狮子座×处女座': '一个张扬一个低调，互相欣赏',
  '狮子座×天秤座': '才子佳人，郎才女貌',
  '狮子座×天蝎座': '王者对决，激情与掌控碰撞',
  '狮子座×射手座': '快乐组合，火象活力拍档',
  '狮子座×摩羯座': '一个耀眼一个稳重，互补型',
  '狮子座×水瓶座': '互相欣赏，都是特立独行的主',
  '狮子座×双鱼座': '霸道总裁与温柔公主',
  '处女座×处女座': '完美主义二人组，互相挑剔也互相理解',
  '处女座×天秤座': '优雅又理性的搭配',
  '处女座×天蝎座': '深沉组合，对细节都敏感',
  '处女座×射手座': '一个严谨一个随性，需包容',
  '处女座×摩羯座': '务实搭档，一起奋斗的黄金组合',
  '处女座×水瓶座': '差异互补，一个细节一个大局',
  '处女座×双鱼座': '互补组合，完美互补',
  '天秤座×天秤座': '优雅和谐，太像反而需火花',
  '天秤座×天蝎座': '魅惑组合，互相吸引互相试探',
  '天秤座×射手座': '快乐组合，一起享受人生',
  '天秤座×摩羯座': '一个社交一个务实，互补型',
  '天秤座×水瓶座': '天生一对，风象知性组合',
  '天秤座×双鱼座': '浪漫优雅，文艺范十足',
  '天蝎座×天蝎座': '深情也虐心，两个极端',
  '天蝎座×射手座': '一个深沉一个开朗，需磨合',
  '天蝎座×摩羯座': '强强联手，做大事的组合',
  '天蝎座×水瓶座': '深度吸引，神秘感十足',
  '天蝎座×双鱼座': '天生一对，最深情浪漫的组合',
  '射手座×射手座': '快乐加倍，一起冒险玩耍',
  '射手座×摩羯座': '一个自由一个务实，需包容',
  '射手座×水瓶座': '自由组合，志同道合好友兼伴侣',
  '射手座×双鱼座': '一个乐观一个感性，互相感染',
  '摩羯座×摩羯座': '务实二人组，一起奋斗事业',
  '摩羯座×水瓶座': '互补型，一个稳重一个新潮',
  '摩羯座×双鱼座': '踏实依靠，温柔浪漫搭配',
  '水瓶座×水瓶座': '灵魂伴侣，外星人默契',
  '水瓶座×双鱼座': '梦幻组合，充满想象力',
  '双鱼座×双鱼座': '浪漫至极，一起做梦的组合',
}

export default function XingzuoClient() {
  const [pageMode, setPageMode] = useState<'star' | 'pair'>('star')
  const [bd, setBd] = useState('')
  const [s1, setS1] = useState('白羊座')
  const [s2, setS2] = useState('金牛座')
  const [r, setR] = useState<any>(null)

  return (<div className="max-w-2xl mx-auto px-4 py-10">
    <h1 className="text-3xl font-bold text-gold-400 font-serif mb-3">星座占卜</h1>
    <p className="text-gray-400 mb-6">查看星座运势或进行配对分析</p>

    <div className="flex gap-2 mb-6">
      <button onClick={() => { setPageMode('star'); setR(null) }}
        className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${pageMode === 'star' ? 'bg-gold-600 text-dark-900' : 'bg-dark-700 text-gray-400 border border-dark-600'}`}>♈ 星座运势</button>
      <button onClick={() => { setPageMode('pair'); setR(null) }}
        className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${pageMode === 'pair' ? 'bg-gold-600 text-dark-900' : 'bg-dark-700 text-gray-400 border border-dark-600'}`}>💑 星座配对</button>
    </div>

    {/* 星座运势模式 */}
    {pageMode === 'star' && (
      <div>
        <div className="bg-dark-800/80 backdrop-blur rounded-xl border border-dark-600 p-6 mb-8">
          <label className="text-xs text-gray-400 block mb-2">出生日期</label>
          <input type="text" value={bd} onChange={e => setBd(e.target.value)} placeholder="例如：1990-10-14"
            className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-gray-200 mb-3" />
          <button onClick={() => {
            const s = getSign(bd)
            if (!s) return
            const d = HOROSCOPE[s.name] || { love: '—', career: '—', money: '—', health: '—' }
            setR({ type: 'star', sign: s, details: d })
          }}
            className="bg-gold-600 hover:bg-gold-500 text-dark-900 font-semibold px-6 py-2.5 rounded-lg transition-colors active:scale-95">查看运势</button>
        </div>

        {/* 运势结果 - 内联在star模式 */}
        {r && r.type === 'star' && (
          <div className="space-y-4">
            <div className="bg-dark-800/80 backdrop-blur rounded-xl border border-dark-600 p-5 text-center">
              <p className="text-3xl mb-1">{SIGNS[r.sign.idx].emoji}</p>
              <p className="text-xl font-bold text-gold-400">{r.sign.name}</p>
              <p className="text-xs text-gray-400">{SIGNS[r.sign.idx].date} · {SIGNS[r.sign.idx].el}象 · 守护星{SIGNS[r.sign.idx].ruler}</p>
              <p className="text-xs text-gray-500 mt-1">{SIGNS[r.sign.idx].traits}</p>
            </div>
            <div className="bg-dark-800/80 backdrop-blur rounded-xl border border-dark-600 p-4">
              <h3 className="text-xs font-semibold text-gold-400 mb-1">💖 爱情运势</h3>
              <p className="text-xs text-gray-300">{r.details.love}</p>
            </div>
            <div className="bg-dark-800/80 backdrop-blur rounded-xl border border-dark-600 p-4">
              <h3 className="text-xs font-semibold text-gold-400 mb-1">💼 事业运势</h3>
              <p className="text-xs text-gray-300">{r.details.career}</p>
            </div>
            <div className="bg-dark-800/80 backdrop-blur rounded-xl border border-dark-600 p-4">
              <h3 className="text-xs font-semibold text-gold-400 mb-1">💰 财运运势</h3>
              <p className="text-xs text-gray-300">{r.details.money}</p>
            </div>
            <div className="bg-dark-800/80 backdrop-blur rounded-xl border border-dark-600 p-4">
              <h3 className="text-xs font-semibold text-gold-400 mb-1">🏥 健康运势</h3>
              <p className="text-xs text-gray-300">{r.details.health}</p>
            </div>
          </div>
        )}
      </div>
    )}

    {/* 配对模式 */}
    {pageMode === 'pair' && (
      <div>
        <div className="bg-dark-800/80 backdrop-blur rounded-xl border border-dark-600 p-6 mb-8">
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <label className="text-xs text-gray-400 block mb-1">星座一</label>
              <select value={s1} onChange={e => setS1(e.target.value)}
                className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-gray-200 text-sm">
                {SIGNS.map(s => <option key={s.name} value={s.name}>{s.emoji} {s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1">星座二</label>
              <select value={s2} onChange={e => setS2(e.target.value)}
                className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-gray-200 text-sm">
                {SIGNS.map(s => <option key={s.name} value={s.name}>{s.emoji} {s.name}</option>)}
              </select>
            </div>
          </div>
          <button onClick={() => {
            if (!s1 || !s2) return
            const k1 = s1 + '×' + s2
            const k2 = s2 + '×' + s1
            setR({ type: 'pair', s1, s2, comment: PAIRING[k1] || PAIRING[k2] || '缘分不错的组合，相处愉快！' })
          }}
            className="bg-gold-600 hover:bg-gold-500 text-dark-900 font-semibold px-6 py-2.5 rounded-lg transition-colors active:scale-95">查看配对</button>
        </div>

        {/* 配对结果 - 内联 */}
        {r && r.type === 'pair' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-dark-800/80 backdrop-blur rounded-xl border border-dark-600 p-4 text-center">
                <p className="text-2xl mb-1">{SIGNS.find(x => x.name === r.s1)?.emoji}</p>
                <p className="text-sm font-bold text-gold-400">{r.s1}</p>
              </div>
              <div className="bg-dark-800/80 backdrop-blur rounded-xl border border-dark-600 p-4 text-center">
                <p className="text-2xl mb-1">{SIGNS.find(x => x.name === r.s2)?.emoji}</p>
                <p className="text-sm font-bold text-gold-400">{r.s2}</p>
              </div>
            </div>
            <div className="bg-dark-800/80 backdrop-blur rounded-xl border border-dark-600 p-5 text-center">
              <p className="text-sm font-semibold text-gold-400 mb-2">💕 配对分析</p>
              <p className="text-sm text-gray-300 leading-relaxed">{r.comment}</p>
            </div>
          </div>
        )}
      </div>
    )}
  </div>)
}
