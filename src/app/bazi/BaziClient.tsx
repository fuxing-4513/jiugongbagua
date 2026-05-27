'use client'

import { useState } from 'react'
import { useLocale } from '@/lib/i18n'
import { Solar, Lunar } from 'lunar-typescript'

function tk(key: string, lang: Record<string, unknown>): string {
  const keys = key.split('.'); let v: unknown = lang
  for (const k of keys) { if (typeof v !== 'object' || v === null) return key; v = (v as Record<string, unknown>)[k] }
  return typeof v === 'string' ? v : key
}

const hourOpts = [
  {v:'0',l:'子初 23:00-00:59'},{v:'1',l:'丑初 01:00-01:59'},{v:'2',l:'丑正 02:00-02:59'},
  {v:'3',l:'寅初 03:00-03:59'},{v:'4',l:'寅正 04:00-04:59'},{v:'5',l:'卯初 05:00-05:59'},
  {v:'6',l:'卯正 06:00-06:59'},{v:'7',l:'辰初 07:00-07:59'},{v:'8',l:'辰正 08:00-08:59'},
  {v:'9',l:'巳初 09:00-09:59'},{v:'10',l:'巳正 10:00-10:59'},{v:'11',l:'午初 11:00-11:59'},
  {v:'12',l:'午正 12:00-12:59'},{v:'13',l:'未初 13:00-13:59'},{v:'14',l:'未正 14:00-14:59'},
  {v:'15',l:'申初 15:00-15:59'},{v:'16',l:'申正 16:00-16:59'},{v:'17',l:'酉初 17:00-17:59'},
  {v:'18',l:'酉正 18:00-18:59'},{v:'19',l:'戌初 19:00-19:59'},{v:'20',l:'戌正 20:00-20:59'},
  {v:'21',l:'亥初 21:00-21:59'},{v:'22',l:'亥正 22:00-22:59'},{v:'23',l:'子正 23:00-23:59'},
]

const wxM: Record<string,string> = {甲:'木',乙:'木',丙:'火',丁:'火',戊:'土',己:'土',庚:'金',辛:'金',壬:'水',癸:'水',子:'水',丑:'土',寅:'木',卯:'木',辰:'土',巳:'火',午:'火',未:'土',申:'金',酉:'金',戌:'土',亥:'水'}
const ny: Record<string,string> = {甲子:'海中金',乙丑:'海中金',丙寅:'炉中火',丁卯:'炉中火',戊辰:'大林木',己巳:'大林木',庚午:'路旁土',辛未:'路旁土',壬申:'剑锋金',癸酉:'剑锋金',甲戌:'山头火',乙亥:'山头火',丙子:'涧下水',丁丑:'涧下水',戊寅:'城头土',己卯:'城头土',庚辰:'白蜡金',辛巳:'白蜡金',壬午:'杨柳木',癸未:'杨柳木',甲申:'泉中水',乙酉:'泉中水',丙戌:'屋上土',丁亥:'屋上土',戊子:'霹雳火',己丑:'霹雳火',庚寅:'松柏木',辛卯:'松柏木',壬辰:'长流水',癸巳:'长流水',甲午:'沙中金',乙未:'沙中金',丙申:'山下火',丁酉:'山下火',戊戌:'平地木',己亥:'平地木',庚子:'壁上土',辛丑:'壁上土',壬寅:'金箔金',癸卯:'金箔金',甲辰:'覆灯火',乙巳:'覆灯火',丙午:'天河水',丁未:'天河水',戊申:'大驿土',己酉:'大驿土',庚戌:'钗钏金',辛亥:'钗钏金',壬子:'桑柘木',癸丑:'桑柘木',甲寅:'大溪水',乙卯:'大溪水',丙辰:'沙中土',丁巳:'沙中土',戊午:'天上火',己未:'天上火',庚申:'石榴木',辛酉:'石榴木',壬戌:'大海水',癸亥:'大海水'}
const ssM: Record<string,Record<string,string>> = {甲:{甲:'比肩',乙:'劫财',丙:'食神',丁:'伤官',戊:'偏财',己:'正财',庚:'七杀',辛:'正官',壬:'偏印',癸:'正印'},乙:{甲:'劫财',乙:'比肩',丙:'伤官',丁:'食神',戊:'正财',己:'偏财',庚:'正官',辛:'七杀',壬:'正印',癸:'偏印'},丙:{甲:'偏印',乙:'正印',丙:'比肩',丁:'劫财',戊:'食神',己:'伤官',庚:'偏财',辛:'正财',壬:'七杀',癸:'正官'},丁:{甲:'正印',乙:'偏印',丙:'劫财',丁:'比肩',戊:'伤官',己:'食神',庚:'正财',辛:'偏财',壬:'正官',癸:'七杀'},戊:{甲:'七杀',乙:'正官',丙:'偏印',丁:'正印',戊:'比肩',己:'劫财',庚:'食神',辛:'伤官',壬:'偏财',癸:'正财'},己:{甲:'正官',乙:'七杀',丙:'正印',丁:'偏印',戊:'劫财',己:'比肩',庚:'伤官',辛:'食神',壬:'正财',癸:'偏财'},庚:{甲:'偏财',乙:'正财',丙:'七杀',丁:'正官',戊:'偏印',己:'正印',庚:'比肩',辛:'劫财',壬:'食神',癸:'伤官'},辛:{甲:'正财',乙:'偏财',丙:'正官',丁:'七杀',戊:'正印',己:'偏印',庚:'劫财',辛:'比肩',壬:'伤官',癸:'食神'},壬:{甲:'食神',乙:'伤官',丙:'偏财',丁:'正财',戊:'七杀',己:'正官',庚:'偏印',辛:'正印',壬:'比肩',癸:'劫财'},癸:{甲:'伤官',乙:'食神',丙:'正财',丁:'偏财',戊:'正官',己:'七杀',庚:'正印',辛:'偏印',壬:'劫财',癸:'比肩'}}
const hG: Record<string,string> = {子:'癸',丑:'己',寅:'甲',卯:'乙',辰:'戊',巳:'丙',午:'丁',未:'己',申:'庚',酉:'辛',戌:'戊',亥:'壬'}
const hA: Record<string,string> = {子:'癸',丑:'己癸辛',寅:'甲丙戊',卯:'乙',辰:'戊乙癸',巳:'丙庚戊',午:'丁己',未:'己丁乙',申:'庚壬戊',酉:'辛',戌:'戊辛丁',亥:'壬甲'}
const dD: Record<string,string> = {甲:'甲木为阳木，如参天大树之象。其人性情正直、仁慈宽厚，有领导才干与担当精神。然甲木过旺则固执己见，过弱则缺乏主见。',乙:'乙木为阴木，如花草藤萝之象。其人性格柔韧、善于变通，温和善良且富有同情心。然乙木过旺则善变不专，过弱则意志不坚。',丙:'丙火为阳火，如太阳当空之象。其人热情开朗、慷慨大方，积极进取且乐于助人。然丙火过旺则性急冲动，过弱则缺乏热情。',丁:'丁火为阴火，如灯烛之光。其人细腻含蓄、聪慧灵秀，善于思考且富有洞察力。然丁火过旺则多疑善虑，过弱则魄力不足。',戊:'戊土为阳土，如巍峨高山之象。其人稳重笃实、诚信可靠，胸怀宽广有容人之量。然戊土过旺则固执保守，过弱则缺少主见。',己:'己土为阴土，如田园沃土之象。其人温和谦逊、务实耐心，善解人意而不张扬。然己土过旺则过于保守，过弱则优柔寡断。',庚:'庚金为阳金，如钢铁刀剑之象。其人刚毅果断、意志坚强，好胜心强且富有魄力。然庚金过旺则冲动伤人，过弱则缺少决断。',辛:'辛金为阴金，如珠宝金银之象。其人细腻精致、追求完美，聪明敏锐且注重细节。然辛金过旺则挑剔刻薄，过弱则魄力不足。',壬:'壬水为阳水，如江河大海之象。其人聪慧包容、志向远大，机智灵活且善于变通。然壬水过旺则心性不定，过弱则魄力不足。',癸:'癸水为阴水，如雨露甘泉之象。其人深沉内敛、灵感丰富，直觉敏锐且富有艺术天赋。然癸水过旺则情绪化，过弱则敏感多疑。'}
const zD: Record<string,string> = {鼠:'子鼠年生人，性机敏聪慧，善理财积蓄，然多疑少决。'}

function strength(wx: Record<string,number>, dg: string): { level: string; detail: string } {
  const dw = wxM[dg]; const sheng: Record<string,string> = {木:'水',火:'木',土:'火',金:'土',水:'金'}
  const ke: Record<string,string> = {木:'土',火:'金',土:'水',金:'木',水:'火'}
  const xie: Record<string,string> = {木:'火',火:'土',土:'金',金:'水',水:'木'}
  let bf = wx[dw] + (wx[sheng[dw]] || 0)
  let kx = (wx[ke[dw]] || 0) + (wx[xie[dw]] || 0) + (wx[sheng[ke[dw]]] || 0)
  let level = ''
  if (bf >= 6) level = '身旺'
  else if (bf >= 4) level = '中和'
  else level = '身弱'
  let detail = `日主${dg}属${dw}，八字中${dw}${wx[dw]}个`
  return { level, detail }
}

// 命理分析（基于规则）
function fateAnalysis(dg: string, dz: string, wx: Record<string,number>, pillars: any[], zodiac: string, lunar: any): string[] {
  const lines: string[] = []
  const dw = wxM[dg]

  // 日主强弱
  lines.push(`【日主】日干为${dg}，五行属${dw}。${dD[dg]}`)

  // 五行旺衰
  const wxSorted = Object.entries(wx).sort((a,b) => b[1]-a[1])
  const wxMax = wxSorted[0]; const wxMin = wxSorted[wxSorted.length-1]
  lines.push(`【五行】八字${wxMin[1]===0 ? '缺'+wxMin[0] : ''}以${wxMax[0]}最旺（${wxMax[1]}个），${wxMin[0]}最弱（${wxMin[1]}个）。`)

  // 用神忌神
  const shengWx: Record<string,string> = {木:'水',火:'木',土:'火',金:'土',水:'金'}
  const keWx: Record<string,string> = {木:'土',火:'金',土:'水',金:'木',水:'火'}
  const xieWx: Record<string,string> = {木:'火',火:'土',土:'金',金:'水',水:'木'}
  const yongshen = shengWx[dw]
  const jishen = keWx[dw]
  const xieshen = xieWx[dw]
  const bf = wx[dw] + (wx[shengWx[dw]] || 0)
  const kx = (wx[keWx[dw]] || 0) + (wx[xieWx[dw]] || 0)

  if (bf > kx + 2) {
    lines.push(`【用神】日主偏旺，以${xieshen}（泄秀）、${jishen}（克）为用神，喜${xieshen}${jishen}运。`)
    lines.push(`【忌神】忌${shengWx[dw]}（生扶）运，逢${shengWx[dw]}运易有阻滞。`)
  } else if (kx > bf + 2) {
    lines.push(`【用神】日主偏弱，以${shengWx[dw]}（生）、${dw}（帮）为用神，喜${shengWx[dw]}金水运。`)
    lines.push(`【忌神】忌${xieshen}（泄）、${jishen}（克）运，逢${jishen}运需谨慎。`)
  } else {
    lines.push(`【用神】日主中和，宜根据大运流年灵活调整，喜${dw}${shengWx[dw]}运。`)
  }

  // 十神分析
  const ssList = pillars.map((p: any) => p.ssGan).filter(Boolean)
  const hasGY = ssList.includes('正官') || ssList.includes('七杀')
  const hasCY = ssList.includes('正财') || ssList.includes('偏财')
  const hasSY = ssList.includes('正印') || ssList.includes('偏印')
  if (hasGY) lines.push('【官杀】命带官杀，主事业心强，有管理才能，宜公职或企业管理。')
  if (hasCY) lines.push('【财星】命带财星，主财运亨通，经商得利，宜实业投资。')
  if (hasSY) lines.push('【印星】命带印星，主学业聪慧，文化修养佳，宜文教科研。')

  // 婚姻
  const ssDz = pillars[2]?.ssZhi
  if (ssDz === '正财' || ssDz === '偏财') lines.push('【婚姻】男命财星入夫妻宫，主婚姻美满，配偶贤惠。')
  else if (ssDz === '正官' || ssDz === '七杀') lines.push('【婚姻】女命官星入夫妻宫，主婚姻顺遂，配偶有为。')
  else lines.push('【婚姻】夫妻宫平和，婚姻稳定，需互敬互谅。')

  // 四柱十神落宫
  const ssN = pillars.map((p: any) => p.ssGan)
  if (ssN[0] === '七杀' || ssN[0] === '正官') lines.push('【祖上】年柱见官杀，祖上或有功名之人。')
  if (ssN[1] === '偏财' || ssN[1] === '正财') lines.push('【父母】月柱见财星，父母经商或家境殷实。')
  if (ssN[3] === '食神' || ssN[3] === '伤官') lines.push('【晚运】时柱见食伤，子女聪慧，晚年享受清福。')

  // 生肖
  lines.push(`【生肖】${zodiac}年生，${zD[zodiac] || '性格随和，一生平顺。'}`)

  // 三命通会简批
  const gz = pillars.map((p: any) => p.gz).join(' ')
  lines.push(`【三命通会简批】八字排盘为${gz}，根据${zodiac}年生人结合日主${dg}木，五行宜调和，大运顺逆需详推。`)

  return lines
}

export default function BaziClient() {
  const { t } = useLocale(); const lang = t as unknown as Record<string, unknown>
  const now = new Date()
  const [cal, setCal] = useState<'solar'|'lunar'>('solar')
  const [year, setYear] = useState(String(now.getFullYear()))
  const [month, setMonth] = useState(String(now.getMonth() + 1))
  const [day, setDay] = useState(String(now.getDate()))
  const [hour, setHour] = useState('11')
  const [gender, setGender] = useState('男')
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')

  // 日历切换时自动转换年/月/日的值
  const switchCal = (newCal: 'solar'|'lunar') => {
    const y=parseInt(year),m=parseInt(month),d=parseInt(day)
    if (!isNaN(y)&&!isNaN(m)&&!isNaN(d)&&m>=1&&m<=12&&d>=1&&d<=31) {
      try {
        if (newCal==='solar' && cal==='lunar') {
          // 农历→公历
          const lun=Lunar.fromYmd(y,m,d)
          const sol=lun.getSolar()
          setYear(String(sol.getYear()))
          setMonth(String(sol.getMonth()))
          setDay(String(sol.getDay()))
        } else if (newCal==='lunar' && cal==='solar') {
          // 公历→农历
          const sol=Solar.fromYmd(y,m,d)
          const lun=sol.getLunar()
          setYear(String(lun.getYear()))
          setMonth(String(lun.getMonth()))
          setDay(String(lun.getDay()))
        }
      } catch {}
    }
    setCal(newCal)
  }

  const doCalc = () => {
    setError('')
    const y = parseInt(year), m = parseInt(month), d = parseInt(day), h = parseInt(hour)
    if (isNaN(y)||isNaN(m)||isNaN(d)||isNaN(h)||m<1||m>12||d<1||d>31||h<0||h>23){setError('日期无效');return}
    try {
      let ec, solar, lunar
      if (cal === 'lunar') {
        lunar = Lunar.fromYmd(y, m, d)
        // 农历转公历后，用公历日期+用户选择的时辰来排盘
        const ls = lunar.getSolar()
        solar = Solar.fromYmdHms(ls.getYear(), ls.getMonth(), ls.getDay(), h, 0, 0)
        ec = solar.getLunar().getEightChar()
      } else {
        solar = Solar.fromYmdHms(y, m, d, h, 0, 0)
        lunar = solar.getLunar()
        ec = lunar.getEightChar()
      }
      const dg = ec.getDayGan(), dz = ec.getDayZhi()
      function mk(gz: string, gan: string, zhi: string) {
        return {gz, gan, zhi, ny: ny[gz]||'—', wxG: wxM[gan]||'', wxZ: wxM[zhi]||'', hd: hA[zhi]||'—', ssG: ssM[dg]?.[gan]||'', ssZ: ssM[dg]?.[hG[zhi]||'']||'', ds: '' }
      }
      const pills = [
        mk(ec.getYear(), ec.getYearGan(), ec.getYearZhi()),
        mk(ec.getMonth(), ec.getMonthGan(), ec.getMonthZhi()),
        mk(ec.getDay(), dg, dz),
        mk(ec.getTime(), ec.getTimeGan(), ec.getTimeZhi()),
      ]
      const wx: Record<string,number> = {金:0,木:0,水:0,火:0,土:0}
      for (const p of pills) {
        // 天干五行
        if (wxM[p.gan] && wx[wxM[p.gan]]!==undefined) wx[wxM[p.gan]]++
        // 地支藏干五行（已包含地支本气，不重复算地支本身）
        for (const c of (hA[p.zhi] || '')) {
          if (wxM[c] && wx[wxM[c]]!==undefined) wx[wxM[c]]++
        }
      }
      const str = strength(wx, dg)
      const zodiac = lunar.getYearShengXiao()
      const dayun: any[] = []
      try { const yun=ec.getYun(2); const stems=['甲','乙','丙','丁','戊','己','庚','辛','壬','癸']; const branches=['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥']; for(const x of yun.getDaYun()){const sy=x.getStartYear();const years=[];for(let i=0;i<10;i++){const yy=sy+i;years.push({year:yy,gz:stems[((yy-4)%10+10)%10]+branches[((yy-4)%12+12)%12],age:x.getStartAge()+i})};dayun.push({gz:x.getGanZhi(),age:x.getStartAge(),startYear:sy,years})} } catch{}
      const analysis = fateAnalysis(dg, dz, wx, pills, zodiac, lunar)

      setResult({
        cal, dateStr: `${cal==='solar'?`公历${solar.toFullString()}`:`农历${lunar.toFullString()}`} · ${gender}命`,
        bazi: `${pills[0].gz}年 ${pills[1].gz}月 ${pills[2].gz}日 ${pills[3].gz}时`,
        solarStr: `公历${solar.getYear()}年${solar.getMonth()}月${solar.getDay()}日`,
        lunarStr: `农历${lunar.getYearInChinese()}年${lunar.getMonthInChinese()}月${lunar.getDayInChinese()}`,
        pills, wx, dg, str, zodiac,
        mingGong: ec.getMingGong(), shenGong: ec.getShenGong(), taiYuan: ec.getTaiYuan(),
        xunKong: ec.getDayXunKong(),
        yearDiShi: ec.getYearDiShi(), monthDiShi: ec.getMonthDiShi(),
        dayDiShi: ec.getDayDiShi(), timeDiShi: ec.getTimeDiShi(),
        dayun, analysis,
      })
    } catch(e){ setError('计算出错，请检查日期') }
  }

  return (<div className="max-w-4xl mx-auto px-4 py-10">
    <h1 className="text-3xl font-bold text-gold-400 font-serif mb-3">生辰八字算命</h1>
    <p className="text-gray-400 mb-8">输入出生日期，基于真太阳时排盘，详批五行旺衰、喜用忌神、大运流年。</p>

    {/* 表单 */}
    <div className="bg-dark-800/80 backdrop-blur rounded-xl border border-dark-600 p-6 mb-8">
      {/* 日历切换 */}
      <div className="flex gap-3 mb-4">
        <button onClick={()=>switchCal('solar')}
          className={`px-4 py-1.5 rounded-lg text-xs transition-colors ${cal==='solar'?'bg-gold-600 text-dark-900 font-semibold':'bg-dark-700 text-gray-400 border border-dark-600'}`}>
          公历（阳历）
        </button>
        <button onClick={()=>switchCal('lunar')}
          className={`px-4 py-1.5 rounded-lg text-xs transition-colors ${cal==='lunar'?'bg-gold-600 text-dark-900 font-semibold':'bg-dark-700 text-gray-400 border border-dark-600'}`}>
          农历（阴历）
        </button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-3">
        {[{l:'年',v:year,s:setYear},{l:'月',v:month,s:setMonth},{l:'日',v:day,s:setDay}].map((f,i)=>(
          <div key={i}><label className="block text-xs text-gray-500 mb-1">{f.l}</label>
          <input type="number" value={f.v} onChange={e=>f.s(e.target.value)}
            className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-gray-200 focus:outline-none focus:border-gold-500 text-sm" min={1900} max={2100} /></div>
        ))}
        <div><label className="block text-xs text-gray-500 mb-1">时</label>
          <select value={hour} onChange={e=>setHour(e.target.value)}
            className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-gray-200 text-sm focus:outline-none focus:border-gold-500">
            {hourOpts.map(o=><option key={o.v} value={o.v}>{o.l}</option>)}
          </select>
        </div>
        <div><label className="block text-xs text-gray-500 mb-1">性别</label>
          <select value={gender} onChange={e=>setGender(e.target.value)}
            className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-gray-200 text-sm focus:outline-none focus:border-gold-500">
            <option value="男">男</option><option value="女">女</option>
          </select>
        </div>
      </div>
      {error && <p className="text-xs text-red-400 mb-2">{error}</p>}
      <button onClick={doCalc}
        className="bg-gold-600 hover:bg-gold-500 text-dark-900 font-semibold px-6 py-2 rounded-lg text-sm transition-colors active:scale-95">
        开始算命
      </button>
    </div>

    {result && (<div className="space-y-4">
      {/* 八字 */}
      <div className="bg-dark-800/80 backdrop-blur rounded-xl border border-dark-600 p-4 text-center">
        <p className="text-xs text-gray-500 mb-1">{result.dateStr}</p>
        <p className="text-base font-bold text-gold-400 font-serif">{result.bazi}</p>
        <p className="text-xs text-gray-500 mt-1">{result.solarStr} · {result.lunarStr}</p>
      </div>

      {/* 四柱命盘表 */}
      <div className="bg-dark-800/80 backdrop-blur rounded-xl border border-dark-600 p-4">
        <h3 className="text-sm font-semibold text-gold-300 font-serif mb-3 text-center">四柱命盘</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead><tr className="bg-dark-700"><th className="p-2 border border-dark-600 text-gray-500"></th>
              {['年柱','月柱','日柱','时柱'].map((l,i)=><th key={i} className="p-2 border border-dark-600 text-gold-400 font-serif">{l}</th>)}
            </tr></thead>
            <tbody>
              <tr><td className="p-2 border border-dark-600 text-gray-500 bg-dark-700">天干十神</td>
                {result.pills.map((x:any,i:number)=><td key={i} className="p-2 border border-dark-600 text-center font-medium text-purple-300">{x.ssG}</td>)}
              </tr>
              <tr><td className="p-2 border border-dark-600 text-gray-500 bg-dark-700">天干</td>
                {result.pills.map((x:any,i:number)=><td key={i} className="p-2 border border-dark-600 text-center font-bold text-gold-400 font-serif text-base">{x.gan}</td>)}
              </tr>
              <tr><td className="p-2 border border-dark-600 text-gray-500 bg-dark-700">地支</td>
                {result.pills.map((x:any,i:number)=><td key={i} className="p-2 border border-dark-600 text-center font-bold text-amber-400 font-serif">{x.zhi}</td>)}
              </tr>
              <tr><td className="p-2 border border-dark-600 text-gray-500 bg-dark-700">藏干</td>
                {result.pills.map((x:any,i:number)=><td key={i} className="p-2 border border-dark-600 text-center text-gray-400">{x.hd}</td>)}
              </tr>
              <tr><td className="p-2 border border-dark-600 text-gray-500 bg-dark-700">地支十神</td>
                {result.pills.map((x:any,i:number)=><td key={i} className="p-2 border border-dark-600 text-center font-medium text-cyan-300">{x.ssZ}</td>)}
              </tr>
              <tr><td className="p-2 border border-dark-600 text-gray-500 bg-dark-700">五行</td>
                {result.pills.map((x:any,i:number)=><td key={i} className="p-2 border border-dark-600 text-center">{x.wxG}{x.wxZ}</td>)}
              </tr>
              <tr><td className="p-2 border border-dark-600 text-gray-500 bg-dark-700">纳音</td>
                {result.pills.map((x:any,i:number)=><td key={i} className="p-2 border border-dark-600 text-center text-gray-400">{x.ny}</td>)}
              </tr>
              <tr><td className="p-2 border border-dark-600 text-gray-500 bg-dark-700">十二长生</td>
                {[result.yearDiShi,result.monthDiShi,result.dayDiShi,result.timeDiShi].map((v:any,i:number)=><td key={i} className="p-2 border border-dark-600 text-center text-gray-400">{v}</td>)}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 五行 + 用神 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="bg-dark-800/80 backdrop-blur rounded-xl border border-dark-600 p-4">
          <h3 className="text-sm font-semibold text-gray-200 mb-3">五行分布</h3>
          <div className="grid grid-cols-5 gap-1.5 mb-3">
            {Object.entries(result.wx).map(([w,c]:any)=>(
              <div key={w} className={`rounded-lg p-2 text-center border border-dark-600 ${w==='金'?'bg-yellow-900/40 text-yellow-300':w==='木'?'bg-green-900/40 text-green-300':w==='水'?'bg-blue-900/40 text-blue-300':w==='火'?'bg-red-900/40 text-red-300':'bg-amber-900/40 text-amber-300'}`}>
                <p className="text-sm font-bold mb-0.5">{w}</p><p className="text-xs text-gray-400">{c}个</p>
              </div>
            ))}
          </div>
          <div className="bg-dark-700 rounded-lg p-3 text-xs space-y-1">
            <p className="text-gray-300">日主{result.dg}五行属{wxM[result.dg]} · {result.str.level}</p>
          </div>
        </div>
        <div className="bg-dark-800/80 backdrop-blur rounded-xl border border-dark-600 p-4">
          <h3 className="text-sm font-semibold text-gray-200 mb-3">神煞</h3>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-dark-700 rounded-lg p-2"><span className="text-gray-500">命宫</span><p className="text-gray-200">{result.mingGong}</p></div>
            <div className="bg-dark-700 rounded-lg p-2"><span className="text-gray-500">身宫</span><p className="text-gray-200">{result.shenGong}</p></div>
            <div className="bg-dark-700 rounded-lg p-2"><span className="text-gray-500">胎元</span><p className="text-gray-200">{result.taiYuan}</p></div>
            <div className="bg-dark-700 rounded-lg p-2"><span className="text-gray-500">旬空</span><p className="text-gray-200">{result.xunKong}</p></div>
          </div>
        </div>
      </div>

      {/* 命理分析 */}
      <div className="bg-dark-800/80 backdrop-blur rounded-xl border border-gold-500/30 p-4">
        <h3 className="text-sm font-semibold text-gold-300 mb-3">📜 命理批断</h3>
        <div className="space-y-2">
          {result.analysis.map((line:string,i:number)=>(
            <p key={i} className="text-xs text-gray-300 leading-relaxed">{line}</p>
          ))}
        </div>
      </div>

      {/* 大运 */}
      {result.dayun.length > 0 && (<div className="bg-dark-800/80 backdrop-blur rounded-xl border border-dark-600 p-4">
        <h3 className="text-sm font-semibold text-gray-200 mb-2">十年大运 · 逐年流年</h3>
        <div className="space-y-2">
          {result.dayun.map((dy:any,i:number)=>(
            <details key={i}>
              <summary className="text-xs bg-amber-900/30 text-amber-300 px-2.5 py-1 rounded-lg border border-amber-700/40 font-serif cursor-pointer hover:bg-amber-900/40 inline-block">
                {dy.gz}运（{dy.age}~{dy.age+9}岁）
              </summary>
              <div className="mt-1.5 flex flex-wrap gap-1">
                {dy.years?.map((y:any,j:number)=>(
                  <span key={j} className={`text-[10px] px-1.5 py-0.5 rounded border ${y.gz.includes('寅')||y.gz.includes('申')?'text-rose-300 border-rose-700/40 bg-rose-900/20':y.gz.includes('戊')?'text-amber-300 border-amber-700/40 bg-amber-900/20':'text-gray-400 border-dark-600 bg-dark-700'}`}>
                    {y.year}年 {y.gz}（{y.age}岁）
                  </span>
                ))}
              </div>
            </details>
          ))}
        </div>
      </div>)}
    </div>)}
  </div>)
}
