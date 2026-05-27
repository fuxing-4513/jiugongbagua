'use client'

import { useState, useMemo } from 'react'
import { useLocale } from '@/lib/i18n'

function tk(key: string, lang: Record<string, unknown>): string {
  const keys = key.split('.'); let v: unknown = lang
  for (const k of keys) { if (typeof v !== 'object' || v === null) return key; v = (v as Record<string, unknown>)[k] }
  return typeof v === 'string' ? v : key
}

type Mode = 'person' | 'company' | 'match'

const STROKES: Record<string, number> = {
  '一':1,
  '二':2,
  '三':3,
  '四':5,
  '五':4,
  '六':4,
  '七':2,
  '八':2,
  '九':2,
  '十':2,
  '王':4,
  '李':7,
  '张':7,
  '刘':6,
  '陈':7,
  '杨':7,
  '赵':9,
  '黄':11,
  '周':8,
  '吴':7,
  '徐':10,
  '孙':6,
  '马':3,
  '胡':9,
  '朱':6,
  '郭':10,
  '何':7,
  '高':10,
  '林':8,
  '罗':8,
  '郑':8,
  '梁':11,
  '谢':12,
  '宋':7,
  '唐':10,
  '韩':12,
  '曹':11,
  '许':6,
  '邓':9,
  '冯':5,
  '萧':11,
  '程':12,
  '蔡':14,
  '彭':12,
  '潘':15,
  '袁':10,
  '董':12,
  '田':5,
  '丁':2,
  '方':4,
  '石':5,
  '沈':7,
  '苏':7,
  '卢':5,
  '蒋':12,
  '魏':17,
  '贾':10,
  '范':8,
  '金':8,
  '孟':8,
  '秦':10,
  '顾':10,
  '乔':6,
  '白':5,
  '毛':4,
  '江':6,
  '谭':14,
  '廖':14,
  '崔':11,
  '邹':7,
  '熊':14,
  '任':6,
  '康':11,
  '郝':9,
  '叶':5,
  '陆':7,
  '段':9,
  '侯':9,
  '黎':15,
  '文':4,
  '武':8,
  '曾':12,
  '关':6,
  '夏':10,
  '严':7,
  '殷':10,
  '常':11,
  '卫':3,
  '史':5,
  '于':3,
  '苗':8,
  '姚':9,
  '姜':9,
  '薛':16,
  '邱':7,
  '汪':7,
  '倪':10,
  '汤':6,
  '大':3,
  '小':3,
  '中':4,
  '国':8,
  '人':2,
  '民':5,
  '和':8,
  '生':5,
  '年':6,
  '月':4,
  '日':4,
  '时':7,
  '上':3,
  '下':3,
  '永':5,
  '安':6,
  '平':5,
  '吉':6,
  '祥':10,
  '瑞':13,
  '福':13,
  '禄':12,
  '寿':7,
  '喜':12,
  '财':7,
  '富':12,
  '贵':9,
  '荣':9,
  '华':6,
  '昌':8,
  '盛':11,
  '兴':6,
  '隆':11,
  '伟':6,
  '杰':8,
  '军':9,
  '强':12,
  '刚':10,
  '勇':9,
  '毅':15,
  '志':7,
  '诚':8,
  '信':9,
  '忠':8,
  '孝':7,
  '仁':4,
  '义':3,
  '礼':5,
  '智':12,
  '明':8,
  '亮':9,
  '清':11,
  '洁':9,
  '丽':7,
  '美':9,
  '俊':9,
  '豪':14,
  '龙':5,
  '凤':4,
  '鹏':13,
  '鹤':15,
  '飞':3,
  '天':4,
  '地':6,
  '宇':6,
  '洪':9,
  '博':12,
  '贤':15,
  '良':7,
  '德':15,
  '道':12,
  '光':6,
  '辉':12,
  '海':10,
  '洋':9,
  '东':5,
  '南':9,
  '西':6,
  '北':5,
  '春':9,
  '秋':9,
  '冬':5,
  '建':8,
  '成':6,
  '功':5,
  '山':3,
  '川':3,
  '云':4,
  '雪':11,
  '梅':11,
  '兰':5,
  '竹':6,
  '菊':11,
  '松':8,
  '柏':9,
  '枫':8,
  '柳':9,
  '花':7,
  '玉':5,
  '宝':8,
  '莲':10,
  '萍':11,
  '琪':13,
  '琳':13,
  '慧':15,
  '敏':11,
  '婷':12,
  '娟':10,
  '欣':8,
  '悦':10,
  '嘉':14,
  '宁':5,
  '静':14,
  '怡':8,
  '彤':7,
  '鑫':24,
  '森':12,
  '磊':15,
  '晶':12,
  '锋':12,
  '锐':12,
  '锦':16,
  '铭':14,
  '泽':8,
  '浩':10,
  '宸':10,
  '哲':10,
  '航':10,
  '奕':9,
  '凯':8,
  '逸':11,
  '皓':12,
  '钧':9,
  '霆':15,
  '霖':16,
  '翰':16,
  '韬':14,
  '修':9,
  '旭':6,
  '睿':14,
  '奇':8,
  '钰':10,
  '玥':8,
  '柠':9,
  '汐':6,
  '洛':9,
  '涵':11,
  '泓':8,
  '淇':11,
  '淳':11,
  '滢':18,
  '萱':12,
  '燕':16,
  '蔓':14,
  '莹':10,
  '薇':16,
  '璃':15,
  '璇':15,
  '瑶':14,
  '瑾':15,
  '璐':17,
  '璟':16,
  '曦':20,
  '昊':8,
  '昕':8,
  '昀':8,
  '昂':8,
  '昙':8,
  '晟':11,
  '晖':13,
  '晏':10,
  '晞':11,
  '晴':12,
  '曜':18,
  '朗':10,
  '峰':10,
  '峻':10,
  '崇':11,
  '岚':7,
  '嵊':13,
  '州':6,
  '洲':9,
  '源':13,
  '润':10,
  '治':8,
  '法':8,
  '泰':10,
  '正':5,
  '长':8,
  '远':7,
  '久':3,
  '恒':9,
  '世':5,
  '代':5,
  '宗':8,
  '祖':10,
  '先':6,
  '裕':12,
  '丰':18,
  '盈':9,
  '茂':11,
  '繁':17,
  '衍':9,
  '庆':6,
  '贺':9,
  '颂':13,
  '祝':10,
  '祈':8,
  '祷':14,
  '佑':7,
  '禧':17,
  '祺':13,
  '祯':13,
  '祉':10,
  '祚':10,
  '祎':8,
  '禛':15,
  '祾':11,
  '禔':13,
  '禑':14,
}

function getStroke(char: string): number { return STROKES[char] || ((char.charCodeAt(0) - 0x4e00) % 20 + 1) }

const WUGE: Record<number,{score:string;meaning:string;wuxing:string}> = {
1:{score:'大吉',meaning:'天地开泰，万事顺利',wuxing:'木'},2:{score:'凶',meaning:'混沌未开，进退保守',wuxing:'木'},3:{score:'大吉',meaning:'吉祥如意，百事顺遂',wuxing:'火'},4:{score:'凶',meaning:'坎坷多难，辛苦遭逢',wuxing:'火'},5:{score:'大吉',meaning:'福寿双全，名利双收',wuxing:'土'},6:{score:'吉',meaning:'安稳顺利，余庆绵绵',wuxing:'土'},7:{score:'吉',meaning:'刚毅果断，进取功名',wuxing:'金'},8:{score:'吉',meaning:'勤恳务实，成功可期',wuxing:'金'},9:{score:'凶',meaning:'困苦艰难，劳而无功',wuxing:'水'},10:{score:'凶',meaning:'黑暗无光，万事徒劳',wuxing:'水'},11:{score:'大吉',meaning:'草木逢春，枝叶沾露',wuxing:'木'},12:{score:'凶',meaning:'薄弱无力，孤独无援',wuxing:'木'},13:{score:'大吉',meaning:'天赋吉运，得人信赖',wuxing:'火'},14:{score:'凶',meaning:'多招灾难，浮沉不定',wuxing:'火'},15:{score:'大吉',meaning:'谦恭做事，必得人和',wuxing:'土'},16:{score:'大吉',meaning:'能获众望，成就大业',wuxing:'土'},17:{score:'吉',meaning:'排除万难，贵人相助',wuxing:'金'},18:{score:'吉',meaning:'经商做事，顺利昌隆',wuxing:'金'},19:{score:'凶',meaning:'虽有智谋，功败垂成',wuxing:'水'},20:{score:'凶',meaning:'进退两难，万事难成',wuxing:'水'},21:{score:'大吉',meaning:'明月照天，独立权威',wuxing:'木'},22:{score:'凶',meaning:'秋草逢霜，怀才不遇',wuxing:'木'},23:{score:'大吉',meaning:'旭日东升，名显四方',wuxing:'火'},24:{score:'大吉',meaning:'白手起家，财源广进',wuxing:'火'},25:{score:'吉',meaning:'天时地利，再得人和',wuxing:'土'},26:{score:'凶',meaning:'波浪起伏，千变万化',wuxing:'土'},27:{score:'吉',meaning:'一成一败，一盛一衰',wuxing:'金'},28:{score:'凶',meaning:'鱼临旱地，难逃厄运',wuxing:'金'},29:{score:'大吉',meaning:'青云直上，才略奏功',wuxing:'水'},30:{score:'吉',meaning:'吉凶参半，得失相伴',wuxing:'水'},31:{score:'大吉',meaning:'智勇兼备，可成大业',wuxing:'木'},32:{score:'大吉',meaning:'侥幸多望，贵人相助',wuxing:'木'},33:{score:'大吉',meaning:'意气用事，人和必失',wuxing:'火'},34:{score:'凶',meaning:'灾难不绝，成功难望',wuxing:'火'},35:{score:'吉',meaning:'温和平安，文昌技艺',wuxing:'土'},36:{score:'凶',meaning:'波澜重迭，常陷穷困',wuxing:'土'},37:{score:'大吉',meaning:'逢凶化吉，风调雨顺',wuxing:'金'},38:{score:'吉',meaning:'名虽可得，利则难获',wuxing:'金'},39:{score:'大吉',meaning:'云开见月，前途光明',wuxing:'水'},40:{score:'凶',meaning:'一盛一衰，浮沉不定',wuxing:'水'},41:{score:'大吉',meaning:'天赋吉运，德望兼备',wuxing:'木'},42:{score:'凶',meaning:'博学多才，十艺不成',wuxing:'木'},43:{score:'凶',meaning:'雨夜之花，外祥内苦',wuxing:'火'},44:{score:'凶',meaning:'虽用心计，事难遂愿',wuxing:'火'},45:{score:'大吉',meaning:'顺风扬帆，万事如意',wuxing:'土'},46:{score:'凶',meaning:'坎坷不平，困难重重',wuxing:'土'},47:{score:'大吉',meaning:'万事可成，财源滚滚',wuxing:'金'},48:{score:'大吉',meaning:'智谋兼备，德望高崇',wuxing:'金'},49:{score:'凶',meaning:'遇吉则吉，遇凶则凶',wuxing:'水'},50:{score:'凶',meaning:'吉凶互见，一成一败',wuxing:'水'},51:{score:'吉',meaning:'盛衰交加，波澜重迭',wuxing:'木'},52:{score:'大吉',meaning:'卓识达眼，先见之明',wuxing:'木'},53:{score:'凶',meaning:'盛衰交加，内忧外患',wuxing:'火'},54:{score:'凶',meaning:'功败垂成，事不如意',wuxing:'火'},55:{score:'吉',meaning:'外观昌隆，内隐祸患',wuxing:'土'},56:{score:'凶',meaning:'事与愿违，终难成功',wuxing:'土'},57:{score:'吉',meaning:'虽有困难，终得成功',wuxing:'金'},58:{score:'吉',meaning:'半凶半吉，浮沉多端',wuxing:'金'},59:{score:'凶',meaning:'犹豫不决，错失良机',wuxing:'水'},60:{score:'凶',meaning:'黑暗无光，心神不宁',wuxing:'水'},61:{score:'大吉',meaning:'名利双收，繁荣昌盛',wuxing:'木'},62:{score:'凶',meaning:'基础薄弱，难获成功',wuxing:'木'},63:{score:'大吉',meaning:'万物化育，繁荣之象',wuxing:'火'},64:{score:'凶',meaning:'徒劳无功，坐困愁城',wuxing:'火'},65:{score:'大吉',meaning:'吉运自来，可享盛名',wuxing:'土'},66:{score:'凶',meaning:'进退维谷，事不如意',wuxing:'土'},67:{score:'大吉',meaning:'天时地利，一帆风顺',wuxing:'金'},68:{score:'大吉',meaning:'智虑周密，志气如刚',wuxing:'金'},69:{score:'凶',meaning:'动摇不定，常陷逆境',wuxing:'水'},70:{score:'凶',meaning:'惨淡经营，难免贫困',wuxing:'水'},71:{score:'吉',meaning:'吉凶参半，顺逆难料',wuxing:'木'},72:{score:'凶',meaning:'利害混集，难得平安',wuxing:'木'},73:{score:'吉',meaning:'安乐自来，自然吉祥',wuxing:'火'},74:{score:'凶',meaning:'无计可施，坐立不安',wuxing:'火'},75:{score:'吉',meaning:'进不如守，安分守己',wuxing:'土'},76:{score:'凶',meaning:'倾覆离散，破产之象',wuxing:'土'},77:{score:'吉',meaning:'先苦后甘，先败后成',wuxing:'金'},78:{score:'吉',meaning:'虽有困难，终得福贵',wuxing:'金'},79:{score:'凶',meaning:'云遮半月，暗淡无光',wuxing:'水'},80:{score:'凶',meaning:'辛苦遭逢，万事难成',wuxing:'水'},81:{score:'大吉',meaning:'万物回春，还复元始',wuxing:'木'},
}

function getWuge(val: number) {
  const idx = val > 81 ? val % 80 : (val <= 0 ? 1 : val)
  return { value: val, ...(WUGE[idx] || WUGE[1]) }
}

function analyzeName(text: string, mode: 'person' | 'company') {
  const chars = [...text].map(c => ({ c, s: getStroke(c) }))
  const totalStrokes = chars.reduce((a, c) => a + c.s, 0)

  let tiange: number, renge: number, dige: number, zongge: number, waige: number
  if (mode === 'company') {
    // 公司名：全名笔画和+1=天格，全名笔画和=总格，中间两格简化
    tiange = totalStrokes + 1
    renge = totalStrokes
    dige = totalStrokes % 81
    zongge = totalStrokes
    waige = (totalStrokes - renge) + 1
  } else {
    // 人名：标准五格
    if (chars.length >= 2) {
      const lnEnd = chars[0].s
      const fnStart = chars[1]?.s || 0
      tiange = chars[0].s + 1
      renge = lnEnd + fnStart
      dige = chars.slice(1).reduce((a, c) => a + c.s, 0) + (chars.length === 2 ? 1 : 0)
    } else {
      tiange = chars[0].s + 1; renge = chars[0].s + 1; dige = 1
    }
    zongge = totalStrokes
    waige = zongge - renge + 1
  }

  const ti = getWuge(tiange); const re = getWuge(renge); const di = getWuge(dige)
  const wa = getWuge(waige); const zo = getWuge(zongge)

  const sancai = `${ti.wuxing}→${re.wuxing}→${di.wuxing}`
  const scoreMap: Record<string, number> = { '大吉': 100, '吉': 80, '中吉': 65, '中': 50, '凶': 30, '大凶': 10 }
  const avgScore = Math.round([ti, re, di, wa, zo].reduce((s, g) => s + (scoreMap[g.score] || 50), 0) / 5)

  return {
    tiange: ti, renge: re, dige: di, waige: wa, zongge: zo,
    sancai, avgScore,
    charDetails: chars.map(c => `${c.c}(${c.s}画)`).join('+'),
    mode,
  }
}

function gradeColor(s: string) {
  const m: Record<string, string> = {'大吉':'text-green-400','吉':'text-green-500','中吉':'text-yellow-400','中':'text-yellow-500','凶':'text-red-400','大凶':'text-red-500'}
  return m[s] || 'text-gray-400'
}

const WXC: Record<string, string> = {'木':'bg-green-900/40 text-green-300','火':'bg-red-900/40 text-red-300','土':'bg-amber-900/40 text-amber-300','金':'bg-yellow-900/40 text-yellow-300','水':'bg-blue-900/40 text-blue-300'}

export default function XingmingClient() {
  const { t } = useLocale()
  const lang = t as unknown as Record<string, unknown>
  const [mode, setMode] = useState<Mode>('person')
  const [name1, setName1] = useState('')
  const [name2, setName2] = useState('')
  const [result, setResult] = useState<any>(null)
  const [matchResult, setMatchResult] = useState<any>(null)

  const analyze = () => {
    const text = name1.trim()
    if (!text) return
    if (mode === 'match') {
      // 姓名配对
      const r1 = analyzeName(name1.trim(), 'person')
      const r2 = analyzeName(name2.trim(), 'person')
      const match = Math.round((r1.avgScore + r2.avgScore) / 2)
      setMatchResult({
        name1: name1.trim(), name2: name2.trim(),
        score: match,
        items: [
          { label: `${name1.trim()}评分`, value: r1.avgScore },
          { label: `${name2.trim()}评分`, value: r2.avgScore },
          { label: '配对指数', value: match },
        ]
      })
      setResult(null)
    } else {
      setResult(analyzeName(text, mode as any))
      setMatchResult(null)
    }
  }

  const r = result
  const m = matchResult

  return (<div className="max-w-3xl mx-auto px-4 py-10">
    <h1 className="text-3xl font-bold text-gold-400 font-serif mb-3">
      {mode === 'match' ? '姓名配对' : mode === 'company' ? '公司测名' : '姓名测试打分'}
    </h1>
    <p className="text-gray-400 mb-6">
      {mode === 'match' ? '输入两个姓名，测算配对指数和缘分' : mode === 'company' ? '输入公司/品牌/商标名，基于五格数理分析吉凶' : '基于五格数理和三才五行配置进行姓名分析评分'}
    </p>

    {/* 模式切换 */}
    <div className="flex gap-2 mb-6">
      {(['person','company','match'] as Mode[]).map(m => (
        <button key={m} onClick={() => { setMode(m); setResult(null); setMatchResult(null) }}
          className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${mode === m ? 'bg-gold-600 text-dark-900 font-semibold' : 'bg-dark-700 text-gray-400 border border-dark-600'}`}>
          {m === 'person' ? '人名测试' : m === 'company' ? '公司/商标测名' : '姓名配对'}
        </button>
      ))}
    </div>

    {/* 输入 */}
    <div className="bg-dark-800/80 backdrop-blur rounded-xl border border-dark-600 p-6 mb-6">
      {mode === 'match' ? (
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div><label className="block text-xs text-gray-400 mb-1">姓名一</label>
            <input type="text" value={name1} onChange={e => setName1(e.target.value)}
              className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-gray-200 focus:outline-none focus:border-gold-500" /></div>
          <div><label className="block text-xs text-gray-400 mb-1">姓名二</label>
            <input type="text" value={name2} onChange={e => setName2(e.target.value)}
              className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-gray-200 focus:outline-none focus:border-gold-500" /></div>
        </div>
      ) : (
        <div className="mb-4">
          <label className="block text-xs text-gray-400 mb-1">
            {mode === 'company' ? '公司/品牌/商标名' : '姓名（姓+名）'}
          </label>
          <input type="text" value={name1} onChange={e => setName1(e.target.value)}
            className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-gray-200 focus:outline-none focus:border-gold-500" />
        </div>
      )}
      <button onClick={analyze}
        className="bg-gold-600 hover:bg-gold-500 text-dark-900 font-semibold px-6 py-2.5 rounded-lg transition-colors active:scale-95">
        {mode === 'match' ? '测算配对' : '开始分析'}
      </button>
    </div>

    {/* 人名/公司分析结果 */}
    {r && (<div className="space-y-4">
      <div className="bg-dark-800/80 backdrop-blur rounded-xl border border-dark-600 p-5 text-center">
        <p className="text-xs text-gray-500 mb-1">
          {r.mode === 'company' ? '公司名' : '姓名'}：{name1} = {r.charDetails}
        </p>
        <p className={`text-4xl font-bold ${r.avgScore >= 80 ? 'text-green-400' : r.avgScore >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>{r.avgScore}</p>
        <p className={`text-sm font-semibold mt-1 ${r.avgScore >= 80 ? 'text-green-400' : r.avgScore >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>综合评分</p>
        <p className="text-xs text-gray-500 mt-1">三才配置：{r.sancai}</p>
      </div>

      <div className="bg-dark-800/80 backdrop-blur rounded-xl border border-dark-600 p-5">
        <h3 className="text-sm font-semibold text-gray-200 mb-3">五格数理</h3>
        <div className="grid grid-cols-5 gap-2">
          {[
            { key: 'tiange', label: '天格' }, { key: 'renge', label: '人格' },
            { key: 'dige', label: '地格' }, { key: 'waige', label: '外格' }, { key: 'zongge', label: '总格' }
          ].map(item => {
            const d = r[item.key] as { value: number; score: string; meaning: string; wuxing: string }
            return (<div key={item.key} className="bg-dark-700 rounded-lg p-2 text-center border border-dark-600">
              <p className="text-[10px] text-gray-500 mb-0.5">{item.label}</p>
              <p className="text-sm font-bold text-gray-100">{d.value}</p>
              <p className={`text-[10px] font-semibold ${gradeColor(d.score)}`}>{d.score}</p>
              <p className={`text-[8px] mt-0.5 px-1 py-0.5 rounded inline-block ${WXC[d.wuxing] || ''}`}>{d.wuxing}</p>
              <p className="text-[8px] text-gray-500 mt-0.5">{d.meaning}</p>
            </div>)
          })}
        </div>
      </div>
    </div>)}

    {/* 配对结果 */}
    {m && (<div className="space-y-4">
      <div className="bg-dark-800/80 backdrop-blur rounded-xl border border-dark-600 p-5 text-center">
        <p className="text-xs text-gray-500 mb-1">配对分析</p>
        <p className={`text-4xl font-bold ${m.score >= 80 ? 'text-green-400' : m.score >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>{m.score}分</p>
        <p className={`text-sm mt-1 font-semibold ${m.score >= 80 ? 'text-green-400' : m.score >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>
          {m.score >= 80 ? '天作之合' : m.score >= 60 ? '相得益彰' : '有待磨合'}
        </p>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {m.items.map((item: any, i: number) => (
          <div key={i} className="bg-dark-800/80 backdrop-blur rounded-lg border border-dark-600 p-4 text-center">
            <p className="text-xs text-gray-500 mb-1">{item.label}</p>
            <p className={`text-2xl font-bold ${item.value >= 80 ? 'text-green-400' : item.value >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>{item.value}</p>
          </div>
        ))}
      </div>
      <div className="bg-dark-800/80 backdrop-blur rounded-xl border border-dark-600 p-4">
        <h3 className="text-sm font-semibold text-gray-200 mb-2">缘分评语</h3>
        <p className="text-xs text-gray-300 leading-relaxed">
          {m.score >= 90 ? '两人的姓名数理高度匹配，是天造地设的一对。在一起能够相互促进，共同进步。' :
           m.score >= 80 ? '两人姓名数理相合，缘分很好。在一起能够和谐相处，关系稳定。' :
           m.score >= 70 ? '两人缘分不错，性格互补。需要多一些沟通和理解。' :
           m.score >= 60 ? '两人有一定的缘分，但需要在相处中多包容对方的缺点。' :
           '两人的姓名数理不太匹配，需要更多的磨合和努力。缘分可以经营，关键看双方的态度。'}
        </p>
      </div>
    </div>)}
  </div>)
}
