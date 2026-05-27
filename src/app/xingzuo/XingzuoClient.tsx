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

export default function XingzuoClient() {
  const [bd, setBd] = useState('')
  const [s1, setS1] = useState('白羊座')
  const [s2, setS2] = useState('金牛座')
  const [out, setOut] = useState<any>(null)

  function getSign(birthday: string): number {
    const p = birthday.split('-').map(Number)
    if (p.length !== 3) return -1
    const m = p[1], d = p[2]
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

  function look(idx: number) {
    const s = SIGNS[idx]
    const h = HOROSCOPE[s.name]
    setOut({ type: 'star', sign: s, idx, horos: h })
  }

  return (<div className="max-w-2xl mx-auto px-4 py-10">
    <h1 className="text-3xl font-bold text-gold-400 font-serif mb-3">星座占卜</h1>
    <p className="text-gray-400 mb-6">按「查看运势」显示结果</p>

    <div className="bg-dark-800/80 backdrop-blur rounded-xl border border-dark-600 p-6 mb-4">
      <label className="text-xs text-gray-400 block mb-2">出生日期</label>
      <input type="text" value={bd} onChange={e => setBd(e.target.value)} placeholder="如 1990-10-14"
        className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-gray-200 mb-3" />
      <button onClick={() => { const idx = getSign(bd); if (idx >= 0) look(idx); }}
        className="bg-gold-600 hover:bg-gold-500 text-dark-900 font-semibold px-6 py-2.5 rounded-lg">查看运势</button>
    </div>

    {/* 结果区块 - 点击后才出现 */}
    {out && out.type === 'star' && (
      <div className="space-y-4">
        <div className="bg-dark-800/80 backdrop-blur rounded-xl border border-dark-600 p-5 text-center">
          <p className="text-3xl mb-1">{out.sign.emoji}</p>
          <p className="text-xl font-bold text-gold-400">{out.sign.name} {out.sign.en}</p>
          <p className="text-xs text-gray-400">{out.sign.date} · {out.sign.el}象 · 守护星{out.sign.ruler}</p>
          <p className="text-xs text-gray-500 mt-1">{out.sign.traits}</p>
        </div>
        {['love', 'career', 'money', 'health'].map(cat => (
          <div key={cat} className="bg-dark-800/80 backdrop-blur rounded-xl border border-dark-600 p-4">
            <h3 className="text-xs font-semibold text-gold-400 mb-1">{cat === 'love' ? '💖 爱情运势' : cat === 'career' ? '💼 事业运势' : cat === 'money' ? '💰 财运运势' : '🏥 健康运势'}</h3>
            <p className="text-xs text-gray-300">{out.horos[cat]}</p>
          </div>
        ))}
      </div>
    )}

    {/* 星座配对 */}
    <div className="mt-10 bg-dark-800/80 backdrop-blur rounded-xl border border-dark-600 p-6">
      <h3 className="text-sm font-semibold text-gold-400 mb-3">💑 星座配对</h3>
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <label className="text-xs text-gray-400 block mb-1">星座一</label>
          <select value={s1} onChange={e => setS1(e.target.value)} className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-gray-200 text-sm">
            {SIGNS.map(s => <option key={s.name} value={s.name}>{s.emoji} {s.name}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-400 block mb-1">星座二</label>
          <select value={s2} onChange={e => setS2(e.target.value)} className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-gray-200 text-sm">
            {SIGNS.map(s => <option key={s.name} value={s.name}>{s.emoji} {s.name}</option>)}
          </select>
        </div>
      </div>
      <button onClick={() => {
        const k1 = s1 + '×' + s2, k2 = s2 + '×' + s1
        const PAIRING: Record<string, string> = {
          '白羊座×白羊座': '热情似火，双羊相争', '白羊座×金牛座': '冲动与固执，需耐心磨合', '白羊座×双子座': '趣味相投', '白羊座×巨蟹座': '需互相包容',
          '白羊座×狮子座': '天生一对，火象热情', '白羊座×处女座': '差异大', '白羊座×天秤座': '互补型', '白羊座×天蝎座': '激情四射',
          '白羊座×射手座': '志趣相投', '白羊座×摩羯座': '互补', '白羊座×水瓶座': '火花四射', '白羊座×双鱼座': '互补美好',
          '金牛座×金牛座': '稳定安逸', '金牛座×双子座': '节奏不同', '金牛座×巨蟹座': '温馨踏实', '金牛座×狮子座': '互相吸引',
          '金牛座×处女座': '务实搭档', '金牛座×天秤座': '优雅搭配', '金牛座×天蝎座': '深情组合', '金牛座×射手座': '差异大',
          '金牛座×摩羯座': '天生一对', '金牛座×水瓶座': '需包容', '金牛座×双鱼座': '浪漫配对', '双子座×双子座': '永不无聊',
          '双子座×巨蟹座': '理解包容', '双子座×狮子座': '互相欣赏', '双子座×处女座': '智性恋', '双子座×天秤座': '天生一对',
          '双子座×天蝎座': '深度吸引', '双子座×射手座': '自由组合', '双子座×摩羯座': '互补', '双子座×水瓶座': '灵魂伴侣',
          '双子座×双鱼座': '梦幻搭配', '巨蟹座×巨蟹座': '温馨顾家', '巨蟹座×狮子座': '浪漫激情', '巨蟹座×处女座': '互补',
          '巨蟹座×天秤座': '优雅配对', '巨蟹座×天蝎座': '天生一对', '巨蟹座×射手座': '理解包容', '巨蟹座×摩羯座': '踏实依靠',
          '巨蟹座×水瓶座': '差异大', '巨蟹座×双鱼座': '温柔浪漫', '狮子座×狮子座': '双王组合', '狮子座×处女座': '互相欣赏',
          '狮子座×天秤座': '才子佳人', '狮子座×天蝎座': '王者对决', '狮子座×射手座': '快乐组合', '狮子座×摩羯座': '互补',
          '狮子座×水瓶座': '互相欣赏', '狮子座×双鱼座': '霸道总裁与公主', '处女座×处女座': '完美主义', '处女座×天秤座': '优雅理性',
          '处女座×天蝎座': '深沉组合', '处女座×射手座': '需包容', '处女座×摩羯座': '务实黄金组合', '处女座×水瓶座': '差异互补',
          '处女座×双鱼座': '完美互补', '天秤座×天秤座': '优雅和谐', '天秤座×天蝎座': '魅惑组合', '天秤座×射手座': '快乐组合',
          '天秤座×摩羯座': '互补', '天秤座×水瓶座': '天生一对', '天秤座×双鱼座': '浪漫优雅', '天蝎座×天蝎座': '深情也虐心',
          '天蝎座×射手座': '需磨合', '天蝎座×摩羯座': '强强联手', '天蝎座×水瓶座': '深度吸引', '天蝎座×双鱼座': '天生一对',
          '射手座×射手座': '快乐加倍', '射手座×摩羯座': '需包容', '射手座×水瓶座': '自由组合', '射手座×双鱼座': '互相感染',
          '摩羯座×摩羯座': '务实奋斗', '摩羯座×水瓶座': '互补', '摩羯座×双鱼座': '踏实浪漫', '水瓶座×水瓶座': '灵魂伴侣',
          '水瓶座×双鱼座': '梦幻组合', '双鱼座×双鱼座': '浪漫至极',
        }
        setOut({ type: 'pair', s1, s2, comment: PAIRING[k1] || PAIRING[k2] || '缘分不错的组合' })
      }} className="bg-gold-600 hover:bg-gold-500 text-dark-900 font-semibold px-6 py-2.5 rounded-lg">查看配对</button>
    </div>

    {out && out.type === 'pair' && (
      <div className="mt-4 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-dark-800/80 backdrop-blur rounded-xl border border-dark-600 p-4 text-center">
            <p className="text-2xl mb-1">{SIGNS.find(x => x.name === out.s1)?.emoji}</p>
            <p className="text-sm font-bold text-gold-400">{out.s1}</p>
          </div>
          <div className="bg-dark-800/80 backdrop-blur rounded-xl border border-dark-600 p-4 text-center">
            <p className="text-2xl mb-1">{SIGNS.find(x => x.name === out.s2)?.emoji}</p>
            <p className="text-sm font-bold text-gold-400">{out.s2}</p>
          </div>
        </div>
        <div className="bg-dark-800/80 backdrop-blur rounded-xl border border-dark-600 p-5 text-center">
          <p className="text-sm font-semibold text-gold-400 mb-2">💕 配对分析</p>
          <p className="text-sm text-gray-300">{out.comment}</p>
        </div>
      </div>
    )}
  </div>)
}
