'use client'

import { useLocale } from '@/lib/i18n'
import { Solar, Lunar } from 'lunar-typescript'
import WeatherWidget from './WeatherWidget'

function tKey(key: string, lang: Record<string, unknown>): string {
  const keys = key.split('.')
  let value: unknown = lang
  for (const k of keys) {
    if (typeof value !== 'object' || value === null) return key
    value = (value as Record<string, unknown>)[k]
  }
  return typeof value === 'string' ? value : key
}

// ── 黄历择日页面的完整 generateHuangli 逻辑 ──
function generateHuangli(year: number, month: number, day: number): {
  dateStr: string; lunarDate: string; lunarYear: string
  ganZhiYear: string; ganZhiMonth: string; ganZhiDay: string
  zodiac: string; birthGod: string; season: string
  suitable: string[]; avoid: string[]
  conflictZodiac: string; star: string; auspiciousDirection: string; twelveStar: string
  lunarFestival: string[]
} {
  try {
    const solar = Solar.fromYmd(year, month, day)
    const lunar = solar.getLunar()
    const eightChar = lunar.getEightChar()

    // 喜神
    const birthGodMap: Record<string, string> = {
      '甲':'东北','乙':'西北','丙':'西南','丁':'东南',
      '戊':'东南','己':'东北','庚':'西北','辛':'西南',
      '壬':'东北','癸':'东南',
    }
    const birthGod = birthGodMap[eightChar.getDay()] ?? '正南'

    // 季节
    const seasonNames = ['春季','夏季','秋季','冬季']
    const season = seasonNames[Math.floor((month % 12) / 3)] ?? ''

    // 宜忌（确定性算法）
    const suitablePool = ['嫁娶','开业','搬家','出行','祭祀','祈福','求财','入宅','动土','安床',
      '纳畜','订婚','入学','裁衣','交易','开光','问名','移徙','理发','修造']
    const avoidPool = ['破土','安葬','伐木','作灶','修造','远行','诉讼','交易','嫁娶','开业',
      '搬家','出行','入宅','开市','纳畜','订婚','祭祀','祈福','动土','上梁']
    const dateNum = year * 10000 + month * 100 + day

    const getDeterministicItems = (num: number, pool: string[], count: number): string[] => {
      const result: string[] = []
      const used = new Set<number>()
      for (let i = 0; i < count; i++) {
        let idx = (num * (i + 1) * 7 + i * 13) % pool.length
        while (used.has(idx)) idx = (idx + 1) % pool.length
        used.add(idx)
        result.push(pool[idx])
      }
      return result
    }
    const suitable = getDeterministicItems(dateNum, suitablePool, 4)
    const avoid = getDeterministicItems(dateNum + 100, avoidPool, 3)

    // 冲煞
    const conflictMap: Record<string, string> = {
      '子':'马','丑':'羊','寅':'猴','卯':'鸡','辰':'狗','巳':'猪',
      '午':'鼠','未':'牛','申':'虎','酉':'兔','戌':'龙','亥':'蛇',
    }
    const conflictZodiac = conflictMap[eightChar.getDayZhi()] ?? ''
    // 星宿
    const stars = ['角木蛟','亢金龙','氐土貉','房日兔','心月狐','尾火虎','箕水豹',
      '斗木獬','牛金牛','女土蝠','虚日鼠','危月燕','室火猪','壁水貐',
      '奎木狼','娄金狗','胃土雉','昴日鸡','毕月乌','觜火猴','参水猿',
      '井木犴','鬼金羊','柳土獐','星日马','张月鹿','翼火蛇','轸水蚓']
    const dayOfYear = Math.floor((new Date(year, month - 1, day).getTime() - new Date(year, 0, 0).getTime()) / 86400000)
    const star = stars[dayOfYear % 28]

    // 吉神方位
    const dirs = ['正东','正南','正西','正北','东南','西南','东北','西北']
    const auspiciousDirection = dirs[dayOfYear % 8]
    // 十二建星
    const twelveStars = ['建','除','满','平','定','执','破','危','成','收','开','闭']
    const twelveStar = twelveStars[dayOfYear % 12]

    // 农历节日
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
    if (lunarMonthNum === 12 && (lunarDayNum === 30 || lunarDayNum === 29)) festival.push('除夕')

    return {
      dateStr: `${year}年${month}月${day}日`,
      lunarDate: `${lunar.getMonthInChinese()}月${lunar.getDayInChinese()}`,
      lunarYear: `${lunar.getYearInChinese()}年`,
      ganZhiYear: eightChar.getYear(),
      ganZhiMonth: eightChar.getMonth(),
      ganZhiDay: eightChar.getDay(),
      zodiac: lunar.getYearShengXiao(),
      birthGod, season,
      suitable, avoid,
      conflictZodiac, star, auspiciousDirection, twelveStar,
      lunarFestival: festival,
    }
  } catch {
    // fallback minimal
    const monthNames = ['正','二','三','四','五','六','七','八','九','十','冬','腊']
    const dayNames = ['初一','初二','初三','初四','初五','初六','初七','初八','初九','初十',
      '十一','十二','十三','十四','十五','十六','十七','十八','十九','二十',
      '廿一','廿二','廿三','廿四','廿五','廿六','廿七','廿八','廿九','三十']
    const heavenlyStems = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸']
    const earthlyBranches = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥']
    const dateNum = year * 10000 + month * 100 + day
    return {
      dateStr: `${year}年${month}月${day}日`,
      lunarDate: `${monthNames[(month - 1) % 12]}月${dayNames[(day - 1) % 30]}`,
      lunarYear: `${year}年`,
      ganZhiYear: `${heavenlyStems[(year - 4) % 10]}${earthlyBranches[(year - 4) % 12]}`,
      ganZhiMonth: `${heavenlyStems[((year - 4) * 12 + month + 1) % 10]}${earthlyBranches[(month + 1) % 12]}`,
      ganZhiDay: `${heavenlyStems[dateNum % 10]}${earthlyBranches[dateNum % 12]}`,
      zodiac: ['鼠','牛','虎','兔','龙','蛇','马','羊','猴','鸡','狗','猪'][(year - 4) % 12],
      birthGod: '正南', season: ['春季','春季','春季','夏季','夏季','夏季','秋季','秋季','秋季','冬季','冬季','冬季'][month - 1] ?? '',
      suitable: [], avoid: [], conflictZodiac: '', star: '—', auspiciousDirection: '正南', twelveStar: '—',
      lunarFestival: [],
    }
  }
}

export default function HomeWidgets() {
  const { t } = useLocale()
  const lang = t as unknown as Record<string, unknown>

  // 服务端直接计算黄历
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1
  const day = now.getDate()
  const data = generateHuangli(year, month, day)

  return (
    <div className="max-w-6xl mx-auto px-4">
      <h2 className="text-2xl font-bold text-gold-400 font-serif mb-4 text-center">
        {tKey('homeWidgets.title', lang)}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {/* 黄历卡片 — 完整版（同黄历择日页面） */}
        <div className="bg-dark-800/80 backdrop-blur rounded-xl border border-dark-600 p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">📅</span>
            <h3 className="text-base font-semibold text-gold-300">{tKey('homeWidgets.huangli', lang)}</h3>
          </div>

          {/* 农历日期 + 年柱月柱日柱 */}
          <p className="text-sm text-gray-400 mb-2">{data.dateStr} · {data.lunarYear}</p>
          <div className="bg-dark-700/60 rounded-lg p-3 mb-4 flex items-center justify-around">
            <div className="text-center">
              <p className="text-[10px] text-gray-500">农历</p>
              <p className="text-base font-bold text-gold-400 font-serif">{data.lunarDate}</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] text-gray-500">年柱</p>
              <p className="text-sm font-bold text-red-400 font-serif">{data.ganZhiYear}</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] text-gray-500">月柱</p>
              <p className="text-sm font-bold text-red-300 font-serif">{data.ganZhiMonth}</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] text-gray-500">日柱</p>
              <p className="text-sm font-bold text-red-300 font-serif">{data.ganZhiDay}</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] text-gray-500">生肖</p>
              <p className="text-sm font-bold text-gray-200">{data.zodiac}</p>
            </div>
          </div>

          {/* 四格信息：季节 / 喜神 / 冲煞 / 星宿 / 建星 / 财神方位 */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="bg-dark-700/40 rounded-lg p-2 text-center">
              <p className="text-[10px] text-gray-500">季节</p>
              <p className="text-xs font-medium text-gray-300">{data.season}</p>
            </div>
            <div className="bg-dark-700/40 rounded-lg p-2 text-center">
              <p className="text-[10px] text-gray-500">喜神</p>
              <p className="text-xs font-medium text-amber-400">{data.birthGod}</p>
            </div>
            <div className="bg-dark-700/40 rounded-lg p-2 text-center">
              <p className="text-[10px] text-gray-500">冲煞</p>
              <p className="text-xs font-medium text-gray-300">冲{data.conflictZodiac}</p>
            </div>
            <div className="bg-dark-700/40 rounded-lg p-2 text-center">
              <p className="text-[10px] text-gray-500">星宿</p>
              <p className="text-xs font-medium text-gray-300">{data.star}</p>
            </div>
            <div className="bg-dark-700/40 rounded-lg p-2 text-center">
              <p className="text-[10px] text-gray-500">建星</p>
              <p className="text-xs font-medium text-gray-300">{data.twelveStar}</p>
            </div>
            <div className="bg-dark-700/40 rounded-lg p-2 text-center">
              <p className="text-[10px] text-gray-500">吉神方位</p>
              <p className="text-xs font-medium text-green-400">{data.auspiciousDirection}</p>
            </div>
          </div>

          {/* 农历节日 */}
          {data.lunarFestival.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {data.lunarFestival.map((f, i) => (
                <span key={i} className="bg-red-700/60 text-red-200 text-xs px-2.5 py-0.5 rounded-full">
                  🎉 {f}
                </span>
              ))}
            </div>
          )}

          {/* 宜忌 */}
          <div className="space-y-3">
            <div>
              <p className="text-xs text-green-400 font-medium mb-1.5">✦ {tKey('homeWidgets.suitable', lang)}</p>
              <div className="flex flex-wrap gap-1.5">
                {data.suitable.map((item, i) => (
                  <span key={i} className="text-xs bg-green-900/40 text-green-300 px-2 py-0.5 rounded-full border border-green-700/40">{item}</span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs text-red-400 font-medium mb-1.5">✦ {tKey('homeWidgets.avoid', lang)}</p>
              <div className="flex flex-wrap gap-1.5">
                {data.avoid.map((item, i) => (
                  <span key={i} className="text-xs bg-red-900/40 text-red-300 px-2 py-0.5 rounded-full border border-red-700/40">{item}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 天气卡片 */}
        <WeatherWidget />
      </div>
    </div>
  )
}
