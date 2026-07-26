'use client'

import { useState, useMemo } from 'react'
import { useLocale, useT } from '@/lib/i18n'
import { Solar } from 'lunar-typescript'

interface HuangliResult {
  dateStr: string
  lunarDate: string
  lunarYear: string
  ganZhiYear: string
  ganZhiMonth: string
  ganZhiDay: string
  zodiac: string
  birthGod: string
  season: string
  lunarFestival: string[]
  suitable: string[]
  avoid: string[]
  dayOfYear: number
  weekDay: string
  // 冲煞
  conflictZodiac: string
  // 星宿
  star: string
  // 吉神方位
  auspiciousDirection: string
  // 十二建星
  twelveStar: string
}

const weekDayNames = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']

const suitablePool = [
  '嫁娶', '开业', '搬家', '出行', '祭祀', '祈福', '求财', '入宅', '动土', '安床',
  '纳畜', '订婚', '入学', '裁衣', '交易', '开光', '问名', '移徙', '理发', '修造',
  '竖柱', '上梁', '开市', '立券', '纳财', '栽种', '牧养', '掘井', '开渠', '安葬',
]

const avoidPool = [
  '破土', '安葬', '伐木', '作灶', '修造', '远行', '诉讼', '交易', '嫁娶', '开业',
  '搬家', '出行', '入宅', '开市', '纳畜', '订婚', '祭祀', '祈福', '动土', '上梁',
  '竖柱', '移徙', '裁衣', '纳财', '栽种', '牧养', '掘井', '开渠', '理发', '问名',
]

function getDeterministicItems(dateNum: number, pool: string[], count: number): string[] {
  const result: string[] = []
  const used = new Set<number>()
  for (let i = 0; i < count; i++) {
    let idx = (dateNum * (i + 1) * 7 + i * 13) % pool.length
    while (used.has(idx)) {
      idx = (idx + 1) % pool.length
    }
    used.add(idx)
    result.push(pool[idx])
  }
  return result
}

function getConflictZodiac(dayZhi: string): string {
  const map: Record<string, string> = {
    '子': '马', '丑': '羊', '寅': '猴', '卯': '鸡',
    '辰': '狗', '巳': '猪', '午': '鼠', '未': '牛',
    '申': '虎', '酉': '兔', '戌': '龙', '亥': '蛇',
  }
  return map[dayZhi] ?? ''
}

function getStarName(dayNum: number): string {
  const stars = ['角木蛟', '亢金龙', '氐土貉', '房日兔', '心月狐', '尾火虎', '箕水豹',
    '斗木獬', '牛金牛', '女土蝠', '虚日鼠', '危月燕', '室火猪', '壁水貐',
    '奎木狼', '娄金狗', '胃土雉', '昴日鸡', '毕月乌', '觜火猴', '参水猿',
    '井木犴', '鬼金羊', '柳土獐', '星日马', '张月鹿', '翼火蛇', '轸水蚓']
  return stars[dayNum % 28]
}

function getTwelveStar(dayNum: number): string {
  const stars = ['建', '除', '满', '平', '定', '执', '破', '危', '成', '收', '开', '闭']
  return stars[dayNum % 12]
}

function generateHuangli(year: number, month: number, day: number): HuangliResult {
  try {
    const solar = Solar.fromYmd(year, month, day)
    const lunar = solar.getLunar()

    const lunarYear = lunar.getYearInChinese()
    const lunarMonth = lunar.getMonthInChinese()
    const lunarDay = lunar.getDayInChinese()

    const eightChar = lunar.getEightChar()

    const ganZhiYear = `${eightChar.getYear()}`
    const ganZhiMonth = `${eightChar.getMonth()}`
    const ganZhiDay = `${eightChar.getDay()}`

    const zodiacIndex = (lunar.getYear() - 4) % 12
    const zodiacArr = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪']
    const zodiac = zodiacArr[((zodiacIndex % 12) + 12) % 12]

    // Birth God (喜神)
    const birthGodMap: Record<string, string> = {
      '甲': '东北', '乙': '西北', '丙': '西南', '丁': '东南',
      '戊': '东南', '己': '东北', '庚': '西北', '辛': '西南',
      '壬': '东北', '癸': '东南',
    }
    const birthGod = birthGodMap[eightChar.getDay()] ?? '正南'

    // Season
    const seasonNames = ['春季', '夏季', '秋季', '冬季']
    const season = seasonNames[Math.floor((month % 12) / 3)] ?? ''

    // Suitable / Avoid
    const dateNum = year * 10000 + month * 100 + day
    const suitable = getDeterministicItems(dateNum, suitablePool, 4)
    const avoid = getDeterministicItems(dateNum + 100, avoidPool, 3)

    // Lunar festivals
    const lunarMonthNum = lunar.getMonth()
    const lunarDayNum = lunar.getDay()
    const festival: string[] = []
    if (lunarMonthNum === 1 && lunarDayNum === 1) festival.push('春节')
    if (lunarMonthNum === 1 && lunarDayNum === 15) festival.push('元宵节')
    if (lunarMonthNum === 5 && lunarDayNum === 5) festival.push('端午节')
    if (lunarMonthNum === 7 && lunarDayNum === 7) festival.push('七夕节')
    if (lunarMonthNum === 7 && lunarDayNum === 15) festival.push('中元节')
    if (lunarMonthNum === 8 && lunarDayNum === 15) festival.push('中秋节')
    if (lunarMonthNum === 9 && lunarDayNum === 9) festival.push('重阳节')
    if (lunarMonthNum === 12 && lunarDayNum === 30) festival.push('除夕')
    if (lunarMonthNum === 12 && lunarDayNum === 29) festival.push('除夕')

    // Conflict zodiac
    const conflictZodiac = getConflictZodiac(eightChar.getDayZhi())

    // Star
    const dayOfYear = Math.floor((new Date(year, month - 1, day).getTime() - new Date(year, 0, 0).getTime()) / 86400000)
    const star = getStarName(dayOfYear)

    // Auspicious direction
    const dirs = ['正东', '正南', '正西', '正北', '东南', '西南', '东北', '西北']
    const auspiciousDirection = dirs[dayOfYear % 8]

    // Twelve Star
    const twelveStar = getTwelveStar(dayOfYear)

    return {
      dateStr: `${year}年${month}月${day}日`,
      lunarDate: `${lunarMonth}月${lunarDay}`,
      lunarYear: `${lunarYear}年`,
      ganZhiYear,
      ganZhiMonth,
      ganZhiDay,
      zodiac,
      birthGod,
      season,
      lunarFestival: festival,
      suitable,
      avoid,
      dayOfYear,
      weekDay: weekDayNames[new Date(year, month - 1, day).getDay()],
      conflictZodiac,
      star,
      auspiciousDirection,
      twelveStar,
    }
  } catch {
    return generateHuangliFallback(year, month, day)
  }
}

function generateHuangliFallback(year: number, month: number, day: number): HuangliResult {
  const lunarInfo = ['初一', '初二', '初三', '初四', '初五', '初六', '初七', '初八', '初九', '初十',
    '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十',
    '廿一', '廿二', '廿三', '廿四', '廿五', '廿六', '廿七', '廿八', '廿九', '三十']
  const lunarMonthNames = ['正', '二', '三', '四', '五', '六', '七', '八', '九', '十', '冬', '腊']
  const heavenlyStems = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸']
  const earthlyBranches = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']
  const zodiacArr = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪']

  const dateNum = year * 10000 + month * 100 + day
  const ganZhiYear = `${heavenlyStems[(year - 4) % 10]}${earthlyBranches[(year - 4) % 12]}`
  const ganZhiMonth = `${heavenlyStems[((year - 4) * 12 + month + 1) % 10]}${earthlyBranches[(month + 1) % 12]}`
  const ganZhiDay = `${heavenlyStems[dateNum % 10]}${earthlyBranches[dateNum % 12]}`

  return {
    dateStr: `${year}年${month}月${day}日`,
    lunarDate: `${lunarMonthNames[(month - 1) % 12]}月${lunarInfo[(day - 1) % 30]}`,
    lunarYear: `${year}年`,
    ganZhiYear,
    ganZhiMonth,
    ganZhiDay,
    zodiac: zodiacArr[(year - 4) % 12],
    birthGod: '正南',
    season: ['春季', '春季', '春季', '夏季', '夏季', '夏季', '秋季', '秋季', '秋季', '冬季', '冬季', '冬季'][month - 1] ?? '',
    lunarFestival: [],
    suitable: getDeterministicItems(dateNum, suitablePool, 4),
    avoid: getDeterministicItems(dateNum + 100, avoidPool, 3),
    dayOfYear: Math.floor((new Date(year, month - 1, day).getTime() - new Date(year, 0, 0).getTime()) / 86400000),
    weekDay: weekDayNames[new Date(year, month - 1, day).getDay()],
    conflictZodiac: '无',
    star: '—',
    auspiciousDirection: '正南',
    twelveStar: '—',
  }
}


// ── 二十四节气数据（带详细描述） ──
const SOLAR_TERMS = [
  {name:"小寒",en:"Minor Cold",date:"1月5日",desc:"小寒是第23个节气，太阳达黄经285°。北方进入严寒，民间有小寒胜大寒之说。"},
  {name:"大寒",en:"Major Cold",date:"1月20日",desc:"全年最后一个节气，太阳达黄经300°。一年中最冷的时候，冬季即将结束。"},
  {name:"立春",en:"Start of Spring",date:"2月4日",desc:"二十四节气之首，太阳达黄经315°。春季正式开始，万物复苏，立春一过就回暖。"},
  {name:"雨水",en:"Rain Water",date:"2月19日",desc:"太阳达黄经330°。降水增多气候转暖，春雨贵如油，正是春耕好时节。"},
  {name:"惊蛰",en:"Awakening of Insects",date:"3月5日",desc:"太阳达黄经345°。春雷始鸣惊动蛰伏昆虫，气温回升快，春耕重要节气。"},
  {name:"春分",en:"Spring Equinox",date:"3月20日",desc:"太阳达黄经0°。昼夜等长各12小时，春季正中，北半球白昼渐长。"},
  {name:"清明",en:"Clear and Bright",date:"4月5日",desc:"太阳达黄经15°。天气晴朗草木繁茂，既是节气也是传统祭祖节日。"},
  {name:"谷雨",en:"Grain Rain",date:"4月20日",desc:"太阳达黄经30°。降水增多滋润谷物，春季最后一个节气。"},
  {name:"立夏",en:"Start of Summer",date:"5月5日",desc:"太阳达黄经45°。夏季开始气温升高，雷雨增多，农作物旺盛生长。"},
  {name:"小满",en:"Grain Buds",date:"5月21日",desc:"太阳达黄经60°。麦类夏收作物籽粒开始饱满但未成熟。"},
  {name:"芒种",en:"Grain in Ear",date:"6月6日",desc:"太阳达黄经75°。有芒麦子可收割，有芒稻谷可播种，最忙农事。"},
  {name:"夏至",en:"Summer Solstice",date:"6月21日",desc:"太阳达黄经90°。北半球白昼最长，阳气最盛，夏至过后昼渐短。"},
  {name:"小暑",en:"Minor Heat",date:"7月7日",desc:"太阳达黄经105°。天气开始炎热但未到最热，江淮梅雨先后结束。"},
  {name:"大暑",en:"Major Heat",date:"7月22日",desc:"太阳达黄经120°。一年中最热的时期，正值三伏天中伏前后。"},
  {name:"立秋",en:"Start of Autumn",date:"8月7日",desc:"太阳达黄经135°。秋季开始暑去凉来，部分地区仍有秋老虎。"},
  {name:"处暑",en:"End of Heat",date:"8月23日",desc:"太阳达黄经150°。暑气至此而止，天气转凉，秋意渐浓。"},
  {name:"白露",en:"White Dew",date:"9月7日",desc:"太阳达黄经165°。天凉水汽在叶片上凝结成白色露珠，典型秋季节气。"},
  {name:"秋分",en:"Autumnal Equinox",date:"9月23日",desc:"太阳达黄经180°。昼夜再次等长，秋季正中，白昼渐短气温下降。"},
  {name:"寒露",en:"Cold Dew",date:"10月8日",desc:"太阳达黄经195°。露水更冷快要凝霜，北方深秋景象红叶飘零。"},
  {name:"霜降",en:"First Frost",date:"10月23日",desc:"太阳达黄经210°。天气渐冷开始有霜，秋季到冬季的过渡节气。"},
  {name:"立冬",en:"Start of Winter",date:"11月7日",desc:"太阳达黄经225°。冬季正式开始万物收藏，北方吃饺子南方进补。"},
  {name:"小雪",en:"Minor Snow",date:"11月22日",desc:"太阳达黄经240°。开始降雪但雪量不大，气温持续走低。"},
  {name:"大雪",en:"Major Snow",date:"12月7日",desc:"太阳达黄经255°。降雪增多气温下降，是冬令进补好时机。"},
  {name:"冬至",en:"Winter Solstice",date:"12月22日",desc:"太阳达黄经270°。白昼最短阴极阳生，北方吃饺子南方吃汤圆。"},
]
function getSeason(m:number){if(m>=3&&m<=5)return"春";if(m>=6&&m<=8)return"夏";if(m>=9&&m<=11)return"秋";return"冬"}

function genShiChen(g:string,d:string,n:number){
  const c=["子","丑","寅","卯","辰","巳","午","未","申","酉","戌","亥"]
  const t=["23-01","01-03","03-05","05-07","07-09","09-11","11-13","13-15","15-17","17-19","19-21","21-23"]
  const sg=[["司命","吉"],["勾陈","凶"],["青龙","吉"],["明堂","吉"],["天刑","凶"],["朱雀","凶"],["金匮","吉"],["天德","吉"],["白虎","凶"],["玉堂","吉"],["天牢","凶"],["玄武","凶"]]
  const wg:Record<string,string[]>={甲:["东北","正北","东北","正东","东南","正南","西南","正西","西北","正西","西北","正北"],乙:["西北","正北","东北","正东","东南","正南","西南","正西","西北","正北","正西","西北"],丙:["西南","正北","东北","正东","东南","正南","西南","正西","西北","正西","西北","正北"],丁:["东南","正北","东北","正东","东南","正南","西南","正西","西北","正西","正北","西北"],戊:["东南","正北","东北","正东","东南","正南","西南","正西","西北","正西","正北","西北"],己:["东北","正北","东北","正东","东南","正南","西南","正西","西北","正西","西北","正北"],庚:["西北","正北","东北","正东","东南","正南","西南","正西","西北","正北","正西","西北"],辛:["西南","正北","东北","正东","东南","正南","西南","正西","西北","正西","西北","正北"],壬:["东北","正北","东北","正东","东南","正南","西南","正西","西北","正西","西北","正北"],癸:["东南","正北","东北","正东","东南","正南","西南","正西","西北","正西","正北","西北"]}
  const cf=["冲马","冲羊","冲猴","冲鸡","冲狗","冲猪","冲鼠","冲牛","冲虎","冲兔","冲龙","冲蛇"]
  const su:{[k:string]:string[]}={子:["祭祀","祈福","求嗣","嫁娶"],丑:["祭祀","祈福","求嗣","会友"],寅:["嫁娶","移徙","入宅","开市"],卯:["祭祀","祈福","出行","嫁娶"],辰:["祭祀","祈福","出行","嫁娶"],巳:["祈福","求嗣","出行","嫁娶"],午:["祭祀","祈福","出行","嫁娶"],未:["祭祀","祈福","出行","求嗣"],申:["出行","嫁娶","移徙","入宅"],酉:["祭祀","祈福","求嗣","会友"],戌:["祭祀","祈福","求嗣","出行"],亥:["祭祀","祈福","出行","嫁娶"]}
  const av:{[k:string]:string[]}={子:["开仓","破土","安葬"],丑:["出行","嫁娶","移徙"],寅:["祭祀","祈福","安葬"],卯:["开市","交易","安葬"],辰:["出行","移徙","开业"],巳:["开市","交易","嫁娶"],午:["安葬","破土","伐木"],未:["出行","嫁娶","开市"],申:["祭祀","祈福","安葬"],酉:["出行","开市","交易"],戌:["开市","交易","出行"],亥:["开仓","破土","安葬"]}
  const w=(wg[g]||wg["甲"])??[]
  return c.map((x,i)=>({name:x+"时",timeRange:t[i],starGod:sg[(n+i)%12][0]+"("+sg[(n+i)%12][1]+")",conflict:cf[(n+i)%12],suitable:(su[x]||["祭祀","祈福"]).slice(0,4).join("、"),avoid:(av[x]||["安葬"]).slice(0,3).join("、"),wealthGod:(w??["正南","正北","东北","正东"])[i%((w??["正南","正北","东北","正东"]).length)]+"方"}))
}
export default function HuangliClient() {
  useLocale()
  const getT = useT()

  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [day, setDay] = useState(now.getDate())

  const data = useMemo(() => generateHuangli(year, month, day), [year, month, day])

  const goToday = () => {
    const d = new Date()
    setYear(d.getFullYear())
    setMonth(d.getMonth() + 1)
    setDay(d.getDate())
  }

  const prevDay = () => {
    const d = new Date(year, month - 1, day - 1)
    setYear(d.getFullYear())
    setMonth(d.getMonth() + 1)
    setDay(d.getDate())
  }

  const nextDay = () => {
    const d = new Date(year, month - 1, day + 1)
    setYear(d.getFullYear())
    setMonth(d.getMonth() + 1)
    setDay(d.getDate())
  }


  return (<>
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-red-900 font-serif mb-3">{getT('modules.huangli.name')}</h1>
      <p className="text-gray-600 mb-8">{getT('modules.huangli.desc')}</p>

      {/* Date Navigator */}
      <div className="bg-white rounded-xl border border-red-100 p-4 mb-6">
        <div className="flex items-center justify-between">
          <button onClick={prevDay} className="w-10 h-10 flex items-center justify-center rounded-lg bg-red-50 text-red-700 hover:bg-red-100 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              <input
                type="number"
                value={year}
                onChange={e => setYear(parseInt(e.target.value) || now.getFullYear())}
                className="w-20 px-2 py-1 text-center border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-red-300"
                min={1900} max={2100}
              />
              <span className="text-sm text-gray-500">{getT('huangliPage.yearLabel')}</span>
              <input
                type="number"
                value={month}
                onChange={e => setMonth(Math.min(12, Math.max(1, parseInt(e.target.value) || 1)))}
                className="w-16 px-2 py-1 text-center border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-red-300"
                min={1} max={12}
              />
              <span className="text-sm text-gray-500">{getT('huangliPage.monthLabel')}</span>
              <input
                type="number"
                value={day}
                onChange={e => setDay(Math.min(31, Math.max(1, parseInt(e.target.value) || 1)))}
                className="w-16 px-2 py-1 text-center border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-red-300"
                min={1} max={31}
              />
              <span className="text-sm text-gray-500">{getT('huangliPage.dayLabel')}</span>
            </div>
            <button onClick={goToday} className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200 transition-colors">
              {getT('huangliPage.goToday')}
            </button>
          </div>

          <button onClick={nextDay} className="w-10 h-10 flex items-center justify-center rounded-lg bg-red-50 text-red-700 hover:bg-red-100 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Main Huangli Card */}
      <div className="bg-white rounded-xl border border-red-100 p-4 mb-4">
        <h2 className="text-lg font-semibold text-red-900 mb-2">{getT('modules.huangli.today')}</h2>
        <p className="text-sm text-gray-500 mb-4">{data.dateStr} {data.weekDay}</p>

        {/* Quick Info */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="bg-red-50 rounded-lg p-3 text-center">
            <p className="text-xs text-gray-500">{getT('modules.huangli.lunarDate')}</p>
            <p className="text-base font-semibold text-gray-800 font-serif">{data.lunarDate}</p>
          </div>
          <div className="bg-red-50 rounded-lg p-3 text-center">
            <p className="text-xs text-gray-500">{getT('modules.huangli.zodiac')}</p>
            <p className="text-base font-semibold text-gray-800">{data.zodiac}</p>
          </div>
          <div className="bg-red-50 rounded-lg p-3 text-center">
            <p className="text-xs text-gray-500">{getT('modules.huangli.fiveElements')}</p>
            <p className="text-base font-semibold text-gray-800">{data.season}</p>
          </div>
          <div className="bg-red-50 rounded-lg p-3 text-center">
            <p className="text-xs text-gray-500">{getT('modules.huangli.auspiciousDirection')}</p>
            <p className="text-base font-semibold text-gray-800">{data.auspiciousDirection}</p>
          </div>
        </div>

        {/* Gan-Zhi */}
        <div className="bg-gradient-to-r from-red-50 to-amber-50 rounded-xl p-4 mb-6 border border-red-100">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="text-xs text-gray-500 mb-1">{getT('huangliPage.yearPillarLabel')}</p>
              <p className="text-lg font-bold text-red-900 font-serif">{data.ganZhiYear}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">{getT('huangliPage.monthPillarLabel')}</p>
              <p className="text-lg font-bold text-red-900 font-serif">{data.ganZhiMonth}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">{getT('huangliPage.dayPillarLabel')}</p>
              <p className="text-lg font-bold text-red-900 font-serif">{data.ganZhiDay}</p>
            </div>
          </div>
        </div>

        {/* More Info Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="bg-gray-50 rounded-lg p-2.5 text-center">
            <p className="text-xs text-gray-400">{getT('huangliPage.xiShen')}</p>
            <p className="text-sm font-medium text-gray-700">{data.birthGod}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-2.5 text-center">
            <p className="text-xs text-gray-400">{getT('huangliPage.chongSha')}</p>
            <p className="text-sm font-medium text-gray-700">冲{data.conflictZodiac}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-2.5 text-center">
            <p className="text-xs text-gray-400">{getT('huangliPage.star')}</p>
            <p className="text-sm font-medium text-gray-700">{data.star}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-2.5 text-center">
            <p className="text-xs text-gray-400">{getT('huangliPage.jianStar')}</p>
            <p className="text-sm font-medium text-gray-700">{data.twelveStar}</p>
          </div>
        </div>

        {/* Lunar Festivals */}
        {data.lunarFestival.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-2">
              {data.lunarFestival.map((f, i) => (
                <span key={i} className="bg-red-600 text-white text-sm px-3 py-1 rounded-full font-medium">
                  🎉 {f}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Suitable & Avoid */}
        <div className="space-y-4">
          <div>
            <p className="text-sm font-semibold text-green-700 mb-2">{getT('modules.huangli.suitable')}</p>
            <div className="flex flex-wrap gap-2">
              {data.suitable.map((item, i) => (
                <span key={i} className="bg-green-50 text-green-700 text-sm px-3 py-1 rounded-full border border-green-200">
                  {item}
                </span>
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold text-red-700 mb-2">{getT('modules.huangli.avoid')}</p>
            <div className="flex flex-wrap gap-2">
              {data.avoid.map((item, i) => (
                <span key={i} className="bg-red-50 text-red-700 text-sm px-3 py-1 rounded-full border border-red-200">
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>

      {/* 老黄历吉时查询 */}
      <div className="max-w-3xl mx-auto px-4">
      <div className="bg-white rounded-xl border border-red-100 p-4 mb-4">
        <h2 className="text-base font-bold text-red-900 mb-1">{getT('huangliPage.auspiciousHourTitle')}</h2>
        <p className="text-xs text-gray-400 mb-3">{getT('huangliPage.auspiciousHourDesc')}</p>
        {(()=>{const sc=genShiChen(data.ganZhiDay.charAt(0),data.ganZhiDay.charAt(1),data.dayOfYear);return(
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {sc.map((s,i)=>(
              <div key={i} className={`rounded-lg px-3 py-2 text-xs border ${s.starGod.includes("吉")?"bg-green-50/50 border-green-200/60":"bg-red-50/30 border-red-200/50"} hover:shadow-sm transition-shadow`}>
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="text-sm font-bold text-gray-800">{s.name}</span>
                  <span className="text-[10px] text-gray-400">{s.timeRange}</span>
                  <span className={`ml-auto text-[10px] px-1.5 py-0.5 rounded-full font-medium ${s.starGod.includes("吉")?"bg-green-100 text-green-700":"bg-red-100 text-red-600"}`}>{s.starGod.substring(0,2)}</span>
                </div>
                <div className="flex gap-3 text-[10px] text-gray-500">
                  <span>{getT('huangliPage.chongPrefix')}{s.conflict}</span>
                  <span>{getT('huangliPage.caiShenPrefix')}{s.wealthGod}</span>
                </div>
                <div className="flex gap-2 mt-1 text-[10px]">
                  <span className="text-green-700">{getT('huangliPage.suitable')} {s.suitable}</span>
                  <span className="text-red-500">{getT('huangliPage.avoid')} {s.avoid}</span>
                </div>
              </div>
            ))}
          </div>
        )})()}
      </div>
      </div>

      {/* 二十四节气时间表 */}
      <div className="max-w-3xl mx-auto px-4">
      <div className="bg-white rounded-xl border border-red-100 p-4 mb-4">
        <h2 className="text-base font-bold text-red-900 mb-1">{getT('huangliPage.solarTermsTitle')}</h2>
        <p className="text-xs text-gray-400 mb-3">{getT('huangliPage.solarTermsDesc').replace('{year}', String(year))}</p>
        <div className="divide-y divide-gray-100">
          {SOLAR_TERMS.map((st,i)=>{
            const m=parseInt(st.date)
            const se=m>=3&&m<=5?"春":m>=6&&m<=8?"夏":m>=9&&m<=11?"秋":"冬"
            const sb=se==="春"?"bg-green-50 border-green-200 text-green-700":se==="夏"?"bg-orange-50 border-orange-200 text-orange-600":se==="秋"?"bg-amber-50 border-amber-200 text-amber-700":"bg-blue-50 border-blue-200 text-blue-700"
            const bgs=sb.split(" ");const si=bgs[0];const bi=bgs[1];const ti=bgs[2]
            return(
              <div key={i} className={`flex items-start gap-3 py-2.5 px-1 rounded-lg ${se===getSeason(month)?"bg-red-50/50 -mx-1 px-2":""}`}>
                <div className={`flex-shrink-0 w-14 h-12 rounded-lg flex flex-col items-center justify-center border ${si+" "+bi}`}>
                  <span className={`text-xs font-bold ${ti}`}>{st.name}</span>
                  <span className="text-[9px] text-gray-500">{st.date}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className={`text-xs font-semibold ${ti}`}>#{se}</span>
                    <span className="text-[10px] text-gray-300">|</span>
                    <span className="text-[10px] text-gray-400">{st.en}</span>
                    {se===getSeason(month)&&<span className="text-[10px] font-medium text-red-600 ml-auto">● {getT('huangliPage.currentLabel')}</span>}
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">{st.desc}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
      </div>

  </>)
}
