'use client'

import { useState } from 'react'
import { useLocale } from '@/lib/i18n'
import { Solar } from 'lunar-typescript'

function tk(key: string, lang: Record<string, unknown>): string {
  const keys = key.split('.'); let v: unknown = lang
  for (const k of keys) { if (typeof v !== 'object' || v === null) return key; v = (v as Record<string, unknown>)[k] }
  return typeof v === 'string' ? v : key
}

const hourOpts = [
  {v:'0',l:'子时 23:00-00:59'},{v:'1',l:'丑时 01:00-01:59'},{v:'2',l:'丑时 02:00-02:59'},
  {v:'3',l:'寅时 03:00-03:59'},{v:'4',l:'寅时 04:00-04:59'},{v:'5',l:'卯时 05:00-05:59'},
  {v:'6',l:'卯时 06:00-06:59'},{v:'7',l:'辰时 07:00-07:59'},{v:'8',l:'辰时 08:00-08:59'},
  {v:'9',l:'巳时 09:00-09:59'},{v:'10',l:'巳时 10:00-10:59'},{v:'11',l:'午时 11:00-11:59'},
  {v:'12',l:'午时 12:00-12:59'},{v:'13',l:'未时 13:00-13:59'},{v:'14',l:'未时 14:00-14:59'},
  {v:'15',l:'申时 15:00-15:59'},{v:'16',l:'申时 16:00-16:59'},{v:'17',l:'酉时 17:00-17:59'},
  {v:'18',l:'酉时 18:00-18:59'},{v:'19',l:'戌时 19:00-19:59'},{v:'20',l:'戌时 20:00-20:59'},
  {v:'21',l:'亥时 21:00-21:59'},{v:'22',l:'亥时 22:00-22:59'},{v:'23',l:'子时 23:00-23:59'},
]

const wxMap: Record<string,string> = {'甲':'木','乙':'木','丙':'火','丁':'火','戊':'土','己':'土','庚':'金','辛':'金','壬':'水','癸':'水','子':'水','丑':'土','寅':'木','卯':'木','辰':'土','巳':'火','午':'火','未':'土','申':'金','酉':'金','戌':'土','亥':'水'}
const nayi: Record<string,string> = {'甲子':'海中金','乙丑':'海中金','丙寅':'炉中火','丁卯':'炉中火','戊辰':'大林木','己巳':'大林木','庚午':'路旁土','辛未':'路旁土','壬申':'剑锋金','癸酉':'剑锋金','甲戌':'山头火','乙亥':'山头火','丙子':'涧下水','丁丑':'涧下水','戊寅':'城头土','己卯':'城头土','庚辰':'白蜡金','辛巳':'白蜡金','壬午':'杨柳木','癸未':'杨柳木','甲申':'泉中水','乙酉':'泉中水','丙戌':'屋上土','丁亥':'屋上土','戊子':'霹雳火','己丑':'霹雳火','庚寅':'松柏木','辛卯':'松柏木','壬辰':'长流水','癸巳':'长流水','甲午':'沙中金','乙未':'沙中金','丙申':'山下火','丁酉':'山下火','戊戌':'平地木','己亥':'平地木','庚子':'壁上土','辛丑':'壁上土','壬寅':'金箔金','癸卯':'金箔金','甲辰':'覆灯火','乙巳':'覆灯火','丙午':'天河水','丁未':'天河水','戊申':'大驿土','己酉':'大驿土','庚戌':'钗钏金','辛亥':'钗钏金','壬子':'桑柘木','癸丑':'桑柘木','甲寅':'大溪水','乙卯':'大溪水','丙辰':'沙中土','丁巳':'沙中土','戊午':'天上火','己未':'天上火','庚申':'石榴木','辛酉':'石榴木','壬戌':'大海水','癸亥':'大海水'}

// 十神
const ssMap: Record<string,Record<string,string>> = {
  '甲':{'甲':'比肩','乙':'劫财','丙':'食神','丁':'伤官','戊':'偏财','己':'正财','庚':'七杀','辛':'正官','壬':'偏印','癸':'正印'},
  '乙':{'甲':'劫财','乙':'比肩','丙':'伤官','丁':'食神','戊':'正财','己':'偏财','庚':'正官','辛':'七杀','壬':'正印','癸':'偏印'},
  '丙':{'甲':'偏印','乙':'正印','丙':'比肩','丁':'劫财','戊':'食神','己':'伤官','庚':'偏财','辛':'正财','壬':'七杀','癸':'正官'},
  '丁':{'甲':'正印','乙':'偏印','丙':'劫财','丁':'比肩','戊':'伤官','己':'食神','庚':'正财','辛':'偏财','壬':'正官','癸':'七杀'},
  '戊':{'甲':'七杀','乙':'正官','丙':'偏印','丁':'正印','戊':'比肩','己':'劫财','庚':'食神','辛':'伤官','壬':'偏财','癸':'正财'},
  '己':{'甲':'正官','乙':'七杀','丙':'正印','丁':'偏印','戊':'劫财','己':'比肩','庚':'伤官','辛':'食神','壬':'正财','癸':'偏财'},
  '庚':{'甲':'偏财','乙':'正财','丙':'七杀','丁':'正官','戊':'偏印','己':'正印','庚':'比肩','辛':'劫财','壬':'食神','癸':'伤官'},
  '辛':{'甲':'正财','乙':'偏财','丙':'正官','丁':'七杀','戊':'正印','己':'偏印','庚':'劫财','辛':'比肩','壬':'伤官','癸':'食神'},
  '壬':{'甲':'食神','乙':'伤官','丙':'偏财','丁':'正财','戊':'七杀','己':'正官','庚':'偏印','辛':'正印','壬':'比肩','癸':'劫财'},
  '癸':{'甲':'伤官','乙':'食神','丙':'正财','丁':'偏财','戊':'正官','己':'七杀','庚':'正印','辛':'偏印','壬':'劫财','癸':'比肩'},
}
// 地支藏干（取主气）
const hiddenGan: Record<string,string> = {'子':'癸','丑':'己','寅':'甲','卯':'乙','辰':'戊','巳':'丙','午':'丁','未':'己','申':'庚','酉':'辛','戌':'戊','亥':'壬'}
// 地支藏干（全部）
const hiddenAll: Record<string,string> = {'子':'癸','丑':'己癸辛','寅':'甲丙戊','卯':'乙','辰':'戊乙癸','巳':'丙庚戊','午':'丁己','未':'己丁乙','申':'庚壬戊','酉':'辛','戌':'戊辛丁','亥':'壬甲'}

// 日干命理描述
const dayDesc: Record<string,string> = {
  '甲':'甲木为阳木，如参天大树，性格正直坚定，有领导才能。仁慈宽厚，有上进心，但有时过于固执。', 
  '乙':'乙木为阴木，如花草藤萝，性格柔韧灵活，适应性强。温和善良，善于协调，但意志不够坚定。',
  '丙':'丙火为阳火，如太阳之火，性格热情开朗，慷慨大方。积极进取，乐于助人，但容易冲动。',
  '丁':'丁火为阴火，如灯烛之火，性格细腻含蓄，内心丰富。聪明灵秀，善于思考，但容易多虑。',
  '戊':'戊土为阳土，如高山厚土，性格稳重笃实，诚信可靠。包容宽厚，有领导风范，但略显保守。',
  '己':'己土为阴土，如田园沃土，性格温和谦逊，务实耐心。善解人意，有才华但不张扬，易自卑。',
  '庚':'庚金为阳金，如钢铁刀剑，性格刚毅果断，意志坚强。好胜心强，有魄力有担当，但容易冲动。',
  '辛':'辛金为阴金，如金银珠宝，性格细腻精致，追求完美。聪明敏锐，注意细节，但容易挑剔。',
  '壬':'壬水为阳水，如江河大海，性格聪慧包容，志向远大。机智灵活，善于变通，但心性不定。',
  '癸':'癸水为阴水，如雨露甘泉，性格深沉内敛，富有灵感。直觉敏锐，有艺术天赋，但情绪化。',
}

// 生肖性格
const zodiacDesc: Record<string,string> = {
  '鼠':'精力旺盛，聪明机敏，适应力强。善交际，有远见，但有时多疑。',
  '牛':'勤劳踏实，忠厚老实，有毅力有耐心。做事稳重，但固执保守。',
  '虎':'威猛果敢，自信热情，有领袖气质。敢于冒险，但容易冲动。',
  '兔':'温和文雅，机敏谨慎，善于交际。有品味有修养，但优柔寡断。',
  '龙':'气宇轩昂，才华横溢，有远大志向。领导力强，但自负好强。',
  '蛇':'深思熟虑，智慧过人，神秘内敛。直觉敏锐，但多疑心重。',
  '马':'热情奔放，自由洒脱，行动力强。乐观开朗，但缺乏耐心。',
  '羊':'温和善良，艺术气质，想象力丰富。重视家庭，但优柔寡断。',
  '猴':'聪明伶俐，灵活多变，善于创新。幽默风趣，但心性不定。',
  '鸡':'精明能干，讲究效率，组织力强。有主见有担当，但爱唠叨。',
  '狗':'忠诚可靠，正直善良，有责任心。讲义气重感情，但多疑敏感。',
  '猪':'宽厚仁爱，乐观豁达，知足常乐。诚实善良，但缺乏进取心。',
}

const WXC: Record<string,string> = {'金':'bg-yellow-900/40 text-yellow-300','木':'bg-green-900/40 text-green-300','水':'bg-blue-900/40 text-blue-300','火':'bg-red-900/40 text-red-300','土':'bg-amber-900/40 text-amber-300'}
const SS_C: Record<string,string> = {'比肩':'text-cyan-300','劫财':'text-cyan-400','食神':'text-green-300','伤官':'text-green-400','偏财':'text-yellow-300','正财':'text-yellow-400','七杀':'text-red-300','正官':'text-red-400','偏印':'text-purple-300','正印':'text-purple-400'}

interface Pillar { gz: string; gan: string; zhi: string; nayi: string; wxGan: string; wxZhi: string; hidden: string; ssGan: string; ssZhi: string; diShi: string }

function getPillar(gz: string, gan: string, zhi: string, dayGan: string, dish: string): Pillar {
  return { gz, gan, zhi, nayi: nayi[gz] || '—', wxGan: wxMap[gan] || '', wxZhi: wxMap[zhi] || '', hidden: hiddenAll[zhi] || '—', ssGan: ssMap[dayGan]?.[gan] || '', ssZhi: ssMap[dayGan]?.[hiddenGan[zhi] || ''] || '', diShi: dish }
}

function analyzeBazi(y: number, m: number, d: number, h: number) {
  const solar = Solar.fromYmdHms(y, m, d, h, 0, 0)
  const ec = solar.getLunar().getEightChar()
  const dg = ec.getDayGan(); const dz = ec.getDayZhi()
  const p = [
    getPillar(ec.getYear(), ec.getYearGan(), ec.getYearZhi(), dg, ec.getYearDiShi()),
    getPillar(ec.getMonth(), ec.getMonthGan(), ec.getMonthZhi(), dg, ec.getMonthDiShi()),
    getPillar(ec.getDay(), dg, dz, dg, ec.getDayDiShi()),
    getPillar(ec.getTime(), ec.getTimeGan(), ec.getTimeZhi(), dg, ec.getTimeDiShi()),
  ]
  const wx: Record<string,number> = {金:0,木:0,水:0,火:0,土:0}
  for (const x of p) { if (wxMap[x.gan] && wx[wxMap[x.gan]]!==undefined) wx[wxMap[x.gan]]++; if (wxMap[x.zhi] && wx[wxMap[x.zhi]]!==undefined) wx[wxMap[x.zhi]]++ }
  // 帮扶日主: 生我+同我 克泄耗: 我克+克我+我生
  const dWx = wxMap[dg] || ''
  const sheng: Record<string,string> = {木:'水',火:'木',土:'火',金:'土',水:'金'}
  const ke: Record<string,string> = {木:'土',火:'金',土:'水',金:'木',水:'火'}
  const shengBy: Record<string,string> = {木:'火',火:'土',土:'金',金:'水',水:'木'}
  let bf=0, kx=0
  for (const [w,c] of Object.entries(wx)) {
    if (w === dWx || w === sheng[dWx]) bf += c
    if (w === ke[dWx] || w === shengBy[dWx] || shengBy[w] === dWx) kx += c
  }
  const lunar = solar.getLunar()
  const zodiac = lunar.getYearShengXiao()
  const hourStr = `${String(h).padStart(2,'0')}:00`
  return {
    gender: '未知', dateStr: `${y}年${m}月${d}日 ${hourStr}`, baziStr: `${p[0].gz}年 ${p[1].gz}月 ${p[2].gz}日 ${p[3].gz}时`,
    pillars: p, wuxing: wx, dayGan: dg, dayZhi: dz,
    bf, kx, zodiac,
    mingGong: ec.getMingGong(), shenGong: ec.getShenGong(), taiYuan: ec.getTaiYuan(),
    dayun: [] as { gz: string; age: number }[],
    dayDesc: dayDesc[dg] || '',
    zodiacDesc: zodiacDesc[zodiac] || '',
  }
}

export default function BaziClient() {
  const { t } = useLocale(); const lang = t as unknown as Record<string, unknown>
  const now = new Date()
  const [year, setYear] = useState(String(now.getFullYear()))
  const [month, setMonth] = useState(String(now.getMonth() + 1))
  const [day, setDay] = useState(String(now.getDate()))
  const [hour, setHour] = useState('11')
  const [gender, setGender] = useState('男')
  const [result, setResult] = useState<ReturnType<typeof analyzeBazi> | null>(null)
  const [error, setError] = useState('')

  const doCalc = () => {
    setError('')
    const y=parseInt(year),m=parseInt(month),d=parseInt(day),h=parseInt(hour)
    if (isNaN(y)||isNaN(m)||isNaN(d)||isNaN(h)||m<1||m>12||d<1||d>31||h<0||h>23) { setError('请输入有效日期'); return }
    try {
      const r = analyzeBazi(y,m,d,h)
      r.gender = gender
      // 大运
      try { const solar=Solar.fromYmdHms(y,m,d,h,0,0); const ec=solar.getLunar().getEightChar(); const yun=ec.getYun(2); const dy=yun.getDaYun(); for(const x of dy) r.dayun.push({gz:x.getGanZhi(),age:x.getStartAge()}) } catch{}
      setResult(r)
    } catch(e){ setError('计算出错') }
  }

  const p = result?.pillars || []

  return (<div className="max-w-4xl mx-auto px-4 py-10">
    <h1 className="text-3xl font-bold text-gold-400 font-serif mb-3">{tk('bazi.title', lang)}</h1>
    <p className="text-gray-400 mb-8">{tk('bazi.desc', lang)}</p>

    <div className="bg-dark-800/80 backdrop-blur rounded-xl border border-dark-600 p-6 mb-8">
      <h2 className="text-sm font-semibold text-gray-200 mb-4">{tk('bazi.birthInfo', lang)}</h2>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-3">
        {[{l:tk('common.year',lang),v:year,s:setYear},{l:tk('common.month',lang),v:month,s:setMonth},{l:tk('common.day',lang),v:day,s:setDay}].map((f,i)=>(
          <div key={i}><label className="block text-xs text-gray-500 mb-1">{f.l}</label>
          <input type="number" value={f.v} onChange={e=>f.s(e.target.value)} className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-gray-200 focus:outline-none focus:border-gold-500 text-sm" min={1900} max={2100} /></div>
        ))}
        <div><label className="block text-xs text-gray-500 mb-1">{tk('common.hour',lang)}</label>
          <select value={hour} onChange={e=>setHour(e.target.value)} className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-gray-200 text-sm focus:outline-none focus:border-gold-500">
            {hourOpts.map(o=><option key={o.v} value={o.v}>{o.l}</option>)}
          </select>
        </div>
        <div><label className="block text-xs text-gray-500 mb-1">性别</label>
          <select value={gender} onChange={e=>setGender(e.target.value)} className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-gray-200 text-sm focus:outline-none focus:border-gold-500">
            <option value="男">男</option><option value="女">女</option>
          </select>
        </div>
      </div>
      {error && <p className="text-xs text-red-400 mb-2">{error}</p>}
      <button onClick={doCalc} className="bg-gold-600 hover:bg-gold-500 text-dark-900 font-semibold px-6 py-2 rounded-lg text-sm transition-colors active:scale-95">{tk('common.submit',lang)}</button>
    </div>

    {result && (<div className="space-y-4">
      {/* 八字基本信息 */}
      <div className="bg-dark-800/80 backdrop-blur rounded-xl border border-dark-600 p-4">
        <p className="text-xs text-gray-500 mb-1">{result.dateStr}</p>
        <p className="text-base font-bold text-gold-400 font-serif">{result.baziStr}</p>
      </div>

      {/* 四柱命盘表 */}
      <div className="bg-dark-800/80 backdrop-blur rounded-xl border border-dark-600 p-4">
        <h3 className="text-sm font-semibold text-gold-300 font-serif mb-3 text-center">四柱命盘</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead><tr className="bg-dark-700"><th className="p-2 border border-dark-600 text-gray-500 font-medium"></th>
              {['年柱','月柱','日柱','时柱'].map((l,i)=><th key={i} className="p-2 border border-dark-600 text-gold-400 font-serif">{l}</th>)}
            </tr></thead>
            <tbody>
              <tr><td className="p-2 border border-dark-600 text-gray-500 font-medium bg-dark-700">干支</td>
                {p.map((x,i)=><td key={i} className="p-2 border border-dark-600 text-center text-base font-bold text-gold-400 font-serif">{x.gz}</td>)}
              </tr>
              <tr><td className="p-2 border border-dark-600 text-gray-500 font-medium bg-dark-700">天干十神</td>
                {p.map((x,i)=><td key={i} className={`p-2 border border-dark-600 text-center font-medium ${SS_C[x.ssGan] || 'text-gray-300'}`}>{x.ssGan}</td>)}
              </tr>
              <tr><td className="p-2 border border-dark-600 text-gray-500 font-medium bg-dark-700">地支</td>
                {p.map((x,i)=><td key={i} className="p-2 border border-dark-600 text-center font-bold text-amber-400 font-serif">{x.zhi}</td>)}
              </tr>
              <tr><td className="p-2 border border-dark-600 text-gray-500 font-medium bg-dark-700">藏干</td>
                {p.map((x,i)=><td key={i} className="p-2 border border-dark-600 text-center text-gray-400">{x.hidden}</td>)}
              </tr>
              <tr><td className="p-2 border border-dark-600 text-gray-500 font-medium bg-dark-700">地支十神</td>
                {p.map((x,i)=><td key={i} className={`p-2 border border-dark-600 text-center font-medium ${SS_C[x.ssZhi] || 'text-gray-300'}`}>{x.ssZhi}</td>)}
              </tr>
              <tr><td className="p-2 border border-dark-600 text-gray-500 font-medium bg-dark-700">五行</td>
                {p.map((x,i)=><td key={i} className="p-2 border border-dark-600 text-center">{wxMap[x.gan] && wxMap[x.zhi] ? `${wxMap[x.gan]}${wxMap[x.zhi]}` : '—'}</td>)}
              </tr>
              <tr><td className="p-2 border border-dark-600 text-gray-500 font-medium bg-dark-700">纳音</td>
                {p.map((x,i)=><td key={i} className="p-2 border border-dark-600 text-center text-gray-400">{x.nayi}</td>)}
              </tr>
              <tr><td className="p-2 border border-dark-600 text-gray-500 font-medium bg-dark-700">十二长生</td>
                {p.map((x,i)=><td key={i} className="p-2 border border-dark-600 text-center text-gray-400">{x.diShi}</td>)}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 五行分析 */}
      <div className="bg-dark-800/80 backdrop-blur rounded-xl border border-dark-600 p-4">
        <h3 className="text-sm font-semibold text-gray-200 mb-3">五行分析</h3>
        <div className="grid grid-cols-5 gap-2 mb-3">
          {Object.entries(result.wuxing).map(([w,c]) => (
            <div key={w} className={`rounded-lg p-2 text-center border border-dark-600 ${WXC[w] || 'bg-dark-700'}`}>
              <p className="text-sm font-bold mb-0.5">{w}</p>
              <p className="text-xs text-gray-400">{c}个</p>
            </div>
          ))}
        </div>
        <div className="bg-dark-700 rounded-lg p-3 text-xs text-gray-300 space-y-1">
          <p>✦ 日主（{result.dayGan}）属{wxMap[result.dayGan]}</p>
          <p>✦ 帮扶日主（生我+同我）：{result.bf}个（日主身{result.bf >= 5 ? '旺' : result.bf >= 3 ? '中' : '弱'}）</p>
          <p>✦ 克泄耗日主（我克+克我+我生）：{result.kx}个</p>
        </div>
      </div>

      {/* 命宫 身宫 胎元 旬空 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div className="bg-dark-800/80 backdrop-blur rounded-lg border border-dark-600 p-3 text-center">
          <p className="text-[10px] text-gray-500">命宫</p><p className="text-sm font-semibold text-gray-200">{result.mingGong}</p>
        </div>
        <div className="bg-dark-800/80 backdrop-blur rounded-lg border border-dark-600 p-3 text-center">
          <p className="text-[10px] text-gray-500">身宫</p><p className="text-sm font-semibold text-gray-200">{result.shenGong}</p>
        </div>
        <div className="bg-dark-800/80 backdrop-blur rounded-lg border border-dark-600 p-3 text-center">
          <p className="text-[10px] text-gray-500">胎元</p><p className="text-sm font-semibold text-gray-200">{result.taiYuan}</p>
        </div>
        <div className="bg-dark-800/80 backdrop-blur rounded-lg border border-dark-600 p-3 text-center">
          <p className="text-[10px] text-gray-500">生肖</p><p className="text-sm font-semibold text-gray-200">{result.zodiac}</p>
        </div>
      </div>

      {/* 日柱命理 */}
      <div className="bg-dark-800/80 backdrop-blur rounded-xl border border-dark-600 p-4">
        <h3 className="text-sm font-semibold text-gold-300 mb-2">✨ 日柱命理</h3>
        <p className="text-xs text-gray-300 leading-relaxed">{result.dayDesc}</p>
      </div>

      {/* 生肖 */}
      <div className="bg-dark-800/80 backdrop-blur rounded-xl border border-dark-600 p-4">
        <h3 className="text-sm font-semibold text-gold-300 mb-2">🐾 年命生肖 · {result.zodiac}</h3>
        <p className="text-xs text-gray-300 leading-relaxed">{result.zodiacDesc}</p>
      </div>

      {/* 大运 */}
      {result.dayun.length > 0 && (<div className="bg-dark-800/80 backdrop-blur rounded-xl border border-dark-600 p-4">
        <h3 className="text-sm font-semibold text-gray-200 mb-2">大运</h3>
        <div className="flex flex-wrap gap-1.5">
          {result.dayun.map((dy,i)=>(
            <span key={i} className="text-xs bg-amber-900/30 text-amber-300 px-2 py-1 rounded-full border border-amber-700/40 font-serif">
              {dy.gz} ({dy.age}岁){i<result.dayun.length-1 && <span className="text-amber-700 mx-0.5">→</span>}
            </span>
          ))}
        </div>
      </div>)}
    </div>)}
  </div>)
}
