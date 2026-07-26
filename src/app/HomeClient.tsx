'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useLocale, useT } from '@/lib/i18n'

import HeritageSection from '@/components/HeritageSection'
import ClassicQuotes from '@/components/ClassicQuotes'
import BottomCTA from '@/components/BottomCTA'
import CalendarInput, { type CalendarType, getMaxDay, lunarToSolarDate } from '@/components/CalendarInput'

interface ModuleInfo {
  key: string
  nameKey: string
  descKey: string
  sourceKey: string
  emoji: string
  href: string
}

const modules: ModuleInfo[] = [
  { key: 'bazi', nameKey: 'modules.bazi.name', descKey: 'modules.bazi.desc', sourceKey: 'modules.bazi.source', emoji: '📜', href: '/bazi' },
  { key: 'ziwei', nameKey: 'modules.ziwei.name', descKey: 'modules.ziwei.desc', sourceKey: 'modules.ziwei.source', emoji: '⭐', href: '/ziwei' },
  { key: 'zonghe', nameKey: 'modules.zonghe.name', descKey: 'modules.zonghe.desc', sourceKey: 'modules.zonghe.source', emoji: '🔗', href: '/zonghe-zhengming' },
  { key: 'liuyao', nameKey: 'modules.liuyao.name', descKey: 'modules.liuyao.desc', sourceKey: 'modules.liuyao.source', emoji: '☯', href: '/liuyao' },
  { key: 'jiemeng', nameKey: 'modules.jiemeng.name', descKey: 'modules.jiemeng.desc', sourceKey: 'modules.jiemeng.source', emoji: '💤', href: '/jiemeng' },
  { key: 'fengshui', nameKey: 'modules.fengshui.name', descKey: 'modules.fengshui.desc', sourceKey: 'modules.fengshui.source', emoji: '🧭', href: '/fengshui' },
  { key: 'chenggu', nameKey: 'modules.chenggu.name', descKey: 'modules.chenggu.desc', sourceKey: 'modules.chenggu.source', emoji: '⚖️', href: '/chenggu' },
  { key: 'xingzuo', nameKey: 'modules.xingzuo.name', descKey: 'modules.xingzuo.desc', sourceKey: 'modules.xingzuo.source', emoji: '♈', href: '/xingzuo' },
  { key: 'qimen', nameKey: 'modules.qimen.name', descKey: 'modules.qimen.desc', sourceKey: 'modules.qimen.source', emoji: '🌀', href: '/qimen' },
  { key: 'meihua', nameKey: 'modules.meihua.name', descKey: 'modules.meihua.desc', sourceKey: 'modules.meihua.source', emoji: '🌸', href: '/meihua' },
  { key: 'lingqian', nameKey: 'modules.lingqian.name', descKey: 'modules.lingqian.desc', sourceKey: 'modules.lingqian.source', emoji: '🏮', href: '/lingqian' },
  { key: 'xingming', nameKey: 'modules.xingming.name', descKey: 'modules.xingming.desc', sourceKey: 'modules.xingming.source', emoji: '📝', href: '/xingming' },
  { key: 'shuma', nameKey: 'modules.shuma.name', descKey: 'modules.shuma.desc', sourceKey: 'modules.shuma.source', emoji: '🔢', href: '/shuma' },
  { key: 'huangli', nameKey: 'modules.huangli.name', descKey: 'modules.huangli.desc', sourceKey: 'modules.huangli.source', emoji: '📅', href: '/huangli' },
  { key: 'taluo', nameKey: 'modules.taluo.name', descKey: 'modules.taluo.desc', sourceKey: 'modules.taluo.source', emoji: '🃏', href: '/taluo' },
  { key: 'wenku', nameKey: 'modules.wenku.name', descKey: 'modules.wenku.desc', sourceKey: 'modules.wenku.source', emoji: '📚', href: '/wenku' },
  { key: 'hehun', nameKey: 'modules.hehun.name', descKey: 'modules.hehun.desc', sourceKey: 'modules.hehun.source', emoji: '💑', href: '/hehun' },
  { key: 'experts', nameKey: 'modules.experts.name', descKey: 'modules.experts.desc', sourceKey: 'modules.experts.source', emoji: '👨🏫', href: '/experts' },
]

export default function HomeClient() {
  const getT = useT()
  const [showGuide, setShowGuide] = useState(true)
  const [heritageOpen, setHeritageOpen] = useState(false)

  // ── 新手引导：首次访问时展示 ──
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const visited = localStorage.getItem('jiugong_visited')
      if (visited) setShowGuide(false)
    }
  }, [])

  const dismissGuide = () => {
    setShowGuide(false)
    if (typeof window !== 'undefined') {
      localStorage.setItem('jiugong_visited', '1')
    }
  }

  return (
    <>
      <div className="max-w-6xl mx-auto px-4">

      {/* ===== 新手引导（仅首次访问展示） ===== */}
      {showGuide && (
        <FirstVisitGuide onDismiss={dismissGuide} />
      )}

      {/* ===== Hero 区域 ===== */}
      <section className="text-center pt-12 pb-8 md:pt-16 md:pb-12">
        <p className="text-sm sm:text-base text-gold-600/80 tracking-widest mb-3">
          {getT('site.tagline')}
        </p>
        <h1 className="text-3xl md:text-5xl font-bold text-gold-600 font-serif mb-4 leading-tight">
          {getT('home.heroTitle')}
        </h1>
        <p className="text-base md:text-lg text-gray-400 max-w-2xl mx-auto mb-4 leading-relaxed">
          {getT('home.heroDesc')}
        </p>
        <ClassicQuotes />
      </section>

      {/* ── 分隔线 ── */}
      <div className="w-16 h-px mx-auto bg-dark-500/40 mb-10"></div>

      {/* ===== 核心功能：免费排盘 ⭐ ===== */}
      <FreeChartWidget />

      {/* ── 次级信息区（默认折叠） ── */}
      <div className="mt-10">

        {/* 快速工具入口 */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-gold-600 font-serif mb-4 text-center">🔮 其他命理工具</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {modules.slice(0, 6).map((mod) => (
              <Link
                key={mod.key}
                href={mod.href}
                className="group rounded-xl border border-dark-600/50 p-4 text-center hover:border-jade-400/60 transition-all duration-200"
              >
                <div className="text-2xl mb-2 group-hover:scale-110 transition-transform duration-200">
                  {mod.emoji}
                </div>
                <h3 className="text-sm font-semibold text-gray-700 group-hover:text-jade-500 transition-colors mb-1">
                  {getT(mod.nameKey)}
                </h3>
              </Link>
            ))}
            <Link
              href="/xueguan"
              className="group rounded-xl border border-dark-600/50 p-4 text-center hover:border-jade-400/60 transition-all duration-200"
            >
              <div className="text-2xl mb-2 group-hover:scale-110 transition-transform duration-200">📚</div>
              <h3 className="text-sm font-semibold text-gray-700 group-hover:text-jade-500 transition-colors mb-1">易学书馆</h3>
            </Link>
          </div>
        </section>

        {/* ===== 十二生肖百科 ===== */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-gold-600 font-serif mb-4 text-center">🐉 十二生肖</h2>
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-12 gap-2">
            {[
              {emoji:'🐭',name:'鼠'},{emoji:'🐮',name:'牛'},{emoji:'🐯',name:'虎'},{emoji:'🐰',name:'兔'},
              {emoji:'🐲',name:'龙'},{emoji:'🐍',name:'蛇'},{emoji:'🐴',name:'马'},{emoji:'🐏',name:'羊'},
              {emoji:'🐵',name:'猴'},{emoji:'🐔',name:'鸡'},{emoji:'🐶',name:'狗'},{emoji:'🐷',name:'猪'}
            ].map(s => (
              <Link key={s.name} href="/shengxiao"
                className="group flex flex-col items-center p-3 rounded-xl border border-dark-600/50 hover:border-jade-400/50 transition-all duration-200">
                <span className="text-2xl mb-1">{s.emoji}</span>
                <span className="text-xs font-medium text-gray-600 group-hover:text-jade-500">{s.name}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* ===== 学派源流（默认折叠） ===== */}
        <section className="mb-8">
          <button
            onClick={() => setHeritageOpen(!heritageOpen)}
            className="w-full text-left flex items-center justify-between p-3 rounded-xl border border-dark-600/50 bg-dark-800/40 hover:bg-dark-800/60 transition-colors"
            aria-expanded={heritageOpen}
          >
            <span className="text-base font-semibold text-gold-600 font-serif">🏛️ 学派源流</span>
            <span className={`text-gray-500 transition-transform ${heritageOpen ? 'rotate-180' : ''}`}>▼</span>
          </button>
          {heritageOpen && (
            <div className="mt-4 animate-fadeIn">
              <HeritageSection />
            </div>
          )}
        </section>

        {/* ===== 全部工具 Grid（完整列表） ===== */}
        <section className="mb-8">
          <details className="group">
            <summary className="cursor-pointer text-base font-semibold text-gold-600 font-serif text-center p-3 rounded-xl border border-dark-600/50 bg-dark-800/40 hover:bg-dark-800/60 transition-colors list-none">
              <span className="group-open:hidden">📂 展开全部工具列表</span>
              <span className="hidden group-open:inline">📂 收起全部工具列表</span>
            </summary>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 animate-fadeIn">
              {modules.map((mod) => (
                <Link
                  key={mod.key}
                  href={mod.href}
                  className="group rounded-xl border border-dark-600/50 p-5 hover:border-jade-400/60 transition-all duration-200"
                >
                  <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-200">
                    {mod.emoji}
                  </div>
                  <h3 className="text-base font-semibold text-gray-800 group-hover:text-jade-500 transition-colors mb-1">
                    {getT(mod.nameKey)}
                  </h3>
                  <p className="text-xs text-gray-500 leading-relaxed mb-2">
                    {getT(mod.descKey)}
                  </p>
                  {getT(mod.sourceKey) && getT(mod.sourceKey) !== mod.sourceKey && (
                    <p className="text-[10px] text-gold-900 font-serif italic">
                      {getT(mod.sourceKey)}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          </details>
        </section>
      </div>

      {/* ===== 底部 CTA ===== */}
      <BottomCTA />
    </div>


    </>
  )
}

// ── 新手引导组件 ──
function FirstVisitGuide({ onDismiss }: { onDismiss: () => void }) {
  return (
    <div className="relative mb-6 rounded-2xl border border-gold-400/40 bg-gradient-to-br from-amber-50/90 to-gold-50/90 p-6 shadow-lg animate-fadeIn">
      <button onClick={onDismiss} className="absolute top-3 right-3 text-gold-500/60 hover:text-gold-600 text-sm w-7 h-7 flex items-center justify-center rounded-full hover:bg-gold-100" aria-label="关闭向导">✕</button>
      <div className="flex items-start gap-4">
        <span className="text-3xl shrink-0 mt-1">🧭</span>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-gold-700 font-serif mb-2">欢迎来到九宫八卦</h3>
          <div className="space-y-2 text-sm text-amber-800/90 leading-relaxed">
            <p><span className="font-semibold text-gold-700">第一步</span> 在下方输入您的出生信息（公历/农历均可）</p>
            <p><span className="font-semibold text-gold-700">第二步</span> 点击「直接排盘」按钮，AI 即刻为您批算</p>
            <p><span className="font-semibold text-gold-700">第三步</span> 浏览四柱命盘、五行分布、神煞详解与命理分析</p>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link href="/bazi" className="inline-flex items-center gap-1 px-4 py-2 rounded-lg bg-gold-500 text-dark-900 text-sm font-semibold hover:bg-gold-400 transition-colors guide-pulse">
              📜 排八字
            </Link>
            <Link href="/app" className="inline-flex items-center gap-1 px-4 py-2 rounded-lg bg-dark-800 text-gray-200 text-sm font-medium border border-gold-400/30 hover:border-gold-400/60 transition-all">
              ⭐ AI 智能排盘
            </Link>
            <button onClick={onDismiss} className="px-4 py-2 rounded-lg text-sm text-gold-600/70 hover:text-gold-600 transition-colors">
              知道了，开始使用 →
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── 免费排盘 Widget ──
function FreeChartWidget() {
  useLocale()
  const [calendarType, setCalendarType] = useState<CalendarType>('solar')
  const [year, setYear] = useState(String(new Date().getFullYear()))
  const [month, setMonth] = useState(String(new Date().getMonth() + 1))
  const [day, setDay] = useState(String(new Date().getDate()))
  const [hour, setHour] = useState('6')
  const [isLeapMonth, setIsLeapMonth] = useState(false)
  const [gender, setGender] = useState('男')

  const y = parseInt(year) || 2000
  const m = parseInt(month) || 1
  const d = parseInt(day) || 1

  const chartHref = (() => {
    const h = parseInt(hour)
    const maxDay = getMaxDay(calendarType, y, m)
    if (y < 1900 || y > 2100 || m < 1 || m > 12 || d < 1 || d > maxDay) return '#'
    let solarDate: string
    if (calendarType === 'solar') {
      solarDate = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    } else {
      solarDate = lunarToSolarDate(y, m, d, isLeapMonth)
    }
    return `/app?date=${solarDate}&hour=${h}&calendar=${calendarType}&gender=${gender}`
  })()

  const isValid = !chartHref.startsWith('#')

  return (
    <section className="max-w-xl mx-auto">
      <h2 className="text-xl font-semibold text-gold-600 font-serif mb-1 text-center">🔮 立即排盘</h2>
      <p className="text-xs text-gray-600 text-center mb-6">输入出生信息，AI 即刻为您深度批命</p>

      {/* 性别选择 */}
      <div className="flex items-center gap-4 mb-4 justify-center">
        <span className="text-sm text-gray-500">性别</span>
        <div className="flex gap-2">
          {['男','女'].map(g => (
            <button
              key={g}
              onClick={() => setGender(g)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                gender === g
                  ? 'bg-gold-500/20 text-gold-400 border border-gold-500/40'
                  : 'bg-dark-700 text-gray-400 border border-dark-600 hover:border-dark-500'
              }`}
            >
              {g === '男' ? '♂ 男' : '♀ 女'}
            </button>
          ))}
        </div>
      </div>

      <CalendarInput
        calendarType={calendarType}
        year={year}
        month={month}
        day={day}
        hour={hour}
        isLeapMonth={isLeapMonth}
        onCalendarTypeChange={setCalendarType}
        onYearChange={setYear}
        onMonthChange={setMonth}
        onDayChange={setDay}
        onHourChange={setHour}
        onLeapMonthChange={setIsLeapMonth}
        label=""
      />

      <Link
        href={chartHref}
        className={`block w-full mt-6 min-h-[44px] py-3 rounded-lg text-center font-semibold text-lg transition-all ${
          isValid
            ? 'bg-gold-500 text-dark-900 hover:bg-gold-400 shadow-lg shadow-gold-500/20 hover:shadow-gold-500/40 active:scale-[0.98]'
            : 'bg-dark-600 text-gray-500 cursor-not-allowed pointer-events-none'
        }`}
        onClick={e => { if (!isValid) e.preventDefault() }}
      >
        直接排盘 🚀
      </Link>

      <p className="text-center text-[10px] text-gray-600 mt-3">
        支持阳历/阴历 · 精确到时辰 · 19+ 命理模块 · AI 深度解读
      </p>
    </section>
  )
}


