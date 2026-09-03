'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useLocale, useT } from '@/lib/i18n'

import RotatingCompass from '@/components/visual/RotatingCompass'
import StarField from '@/components/visual/StarField'
import HeritageSection from '@/components/HeritageSection'
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
  { key: 'xiaoliuren', nameKey: 'modules.xiaoliuren.name', descKey: 'modules.xiaoliuren.desc', sourceKey: 'modules.xiaoliuren.source', emoji: '👋', href: '/xiaoliuren' },
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
  { key: 'hehun', nameKey: 'modules.hehun.name', descKey: 'modules.hehun.desc', sourceKey: 'modules.hehun.source', emoji: '💑', href: '/hehun' },
  { key: 'experts', nameKey: 'modules.experts.name', descKey: 'modules.experts.desc', sourceKey: 'modules.experts.source', emoji: '🎓', href: '/experts' },
]

// ── Bento 主卡（上排：三大精算引擎） ──
const bentoMain = [
  { emoji: '📜', title: '四柱八字', tag: 'AI 精算 · 能量周期 · 财官节点', desc: '五行喜忌、大运走势、性格画像——你的「人生周期表」', href: '/bazi', accent: 'violet' },
  { emoji: '⭐', title: '紫微斗数', tag: 'AI 精算 · 格局 · 心理画像', desc: '十四主星十二宫，从命宫到人生剧本，白话讲给你听', href: '/ziwei', accent: 'gold' },
  { emoji: '💬', title: 'AI 决策对话', tag: '古籍依据 · 透明推理', desc: '排完盘直接问：现在适合跳槽吗？今年该不该创业？', href: '/ai', accent: 'cyan' },
]
// ── Bento 副卡（中排） ──
const bentoSub = [
  { emoji: '🧭', title: '奇门遁甲', tag: '特定时空 · 择吉 · 策略', href: '/qimen' },
  { emoji: '💑', title: '双人合盘', tag: '情侣契合 · 事业搭档', href: '/hehun' },
  { emoji: '📅', title: '每日宜忌', tag: '今日能量 · 吉神方位', href: '/huangli' },
]
// ── 轻工具横条 ──
const quickTools = [
  { emoji: '💤', name: '解梦', href: '/jiemeng' },
  { emoji: '📝', name: '姓名', href: '/xingming' },
  { emoji: '☯', name: '六爻', href: '/liuyao' },
  { emoji: '👋', name: '小六壬', href: '/xiaoliuren' },
  { emoji: '🌸', name: '梅花', href: '/meihua' },
  { emoji: '🏮', name: '灵签', href: '/lingqian' },
  { emoji: '🃏', name: '塔罗', href: '/taluo' },
  { emoji: '🔢', name: '号码', href: '/shuma' },
  { emoji: '⚖️', name: '称骨', href: '/chenggu' },
  { emoji: '♈', name: '星座', href: '/xingzuo' },
]

// ── 三大痛点场景卡（九宫语：决策参考·去宿命化·共情） ──
const scenarioCards = [
  {
    q: '该坚持，还是该转身？',
    empathy: '不甘心的人才会问这个问题。你的大运走到哪一步、流年推着哪颗星——时机这件事，古人琢磨了三千年。',
    cta: '看我的大运周期',
    href: '/bazi',
  },
  {
    q: '对的人，还是错的时间？',
    empathy: '合盘不是算谁配谁，是看两个人的能量在哪里重叠、在哪里错位——把隐秘的羁绊摊开，很多纠结自然就懂了。',
    cta: '看双人能量场',
    href: '/hehun',
  },
  {
    q: '往前冲，还是先稳住？',
    empathy: '命运不设坦途，也不埋陷阱。关键是看清眼前是风口还是暗礁——古籍教人知进退，从不教人认命。',
    cta: '看近期进退节律',
    href: '/app',
  },
]

// ── 首页 FAQ（打消顾虑：原理/用法/隐私） ──
const faqItems = [
  {
    q: '命理分析的结果，应该怎么看？',
    a: '把它当「决策参考」，别当「判决书」。命盘是古人观察人生命运周期的经验框架——同一种格局，有人乘风而起，有人困守原地，差别全在后天的选择与行动。平台结论只做情境提示，重大决定请综合理性判断。',
  },
  {
    q: '九宫和市面上的免费算命软件，有什么区别？',
    a: '三点：① 依据不同——我们直接溯源 135 部公版古籍全文（滴天髓/紫微斗数全书/三命通会等），不做网络二手内容的搬运；② 过程透明——结论附古籍依据可展开核对，不是黑盒；③ 内容原创——解梦 7,749 词条、姓名详解等均为逐条整理编写。',
  },
  {
    q: '我不懂专业术语，能看懂吗？',
    a: '能。结果页以白话解读为主，术语都有通俗解释；四柱视角用图表呈现干支关系，直观不烧脑。想深入时再展开「专业模式」看星曜、十神等盘面细节。',
  },
  {
    q: 'AI 真的能理解「命运」吗？',
    a: '坦诚说：AI 不通灵。它是「古籍推理框架 + 你的命盘数据」的运算助手——把传统命理的分析逻辑跑一遍，再用白话讲给你听。它的价值在帮你梳理处境、看见盲区，而非预测未来。',
  },
  {
    q: '我的出生日期等隐私安全吗？',
    a: '安全。① 排盘计算在你的浏览器本地完成，生辰不上传服务器；② 即使使用 AI 对话，也只发送必要的命盘摘要，服务端不留存对话记录；③ 网站不注册、不收集个人身份信息。',
  },
  {
    q: '用九宫要收费吗？大师咨询怎么算？',
    a: '基础功能全部免费：八字/紫微排盘、白话解读、每日宜忌、解梦、姓名等。大师深度咨询明码标价、按次沟通，价格与流程在「大师深度解读」页公开，绝无隐藏消费。',
  },
]

export default function HomeClient() {
  const getT = useT()
  const router = useRouter()
  const [aiQ, setAiQ] = useState('')
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  const askAi = (e: React.FormEvent) => {
    e.preventDefault()
    const q = aiQ.trim()
    router.push(q ? `/ai?q=${encodeURIComponent(q)}` : '/ai')
  }

  return (
    <>
      <div className="max-w-6xl mx-auto px-4">
        {/* ════ Hero：科技罗盘 + AI 入口 ════ */}
        <section className="relative pt-12 pb-8 overflow-hidden">
          {/* 背景：星点（细腻点缀，不喧宾夺主） */}
          <div className="absolute inset-0 pointer-events-none">
            <StarField className="absolute inset-0 w-full h-full opacity-40 dark:opacity-60" />
          </div>

          <div className="relative z-10 grid lg:grid-cols-[1.15fr_1fr] gap-10 items-center">
            {/* 左：文案 + AI 输入 */}
            <div>
              <span className="jg-chip mb-5">✦ AI 时空决策引擎 · 古籍原典 · 135 部全文</span>
              <h1 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-gray-50 leading-tight mb-6">
                在关键时刻，
                <br />
                <span className="jg-text-grad">看清真实处境</span>
              </h1>

              {/* ═══ 三大痛点场景（先共情，再给方法） ═══ */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                {scenarioCards.map(s => (
                  <Link key={s.href} href={s.href}
                    className="group jg-card-plain p-3.5 hover:!border-violet-400/50 transition-colors flex flex-col">
                    <p className="text-[13px] font-bold text-gray-800 dark:text-gray-100 leading-snug mb-1.5 group-hover:text-violet-600 dark:group-hover:text-violet-300 transition-colors">
                      {s.q}
                    </p>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed mb-2.5 flex-1">
                      {s.empathy}
                    </p>
                    <span className="text-[10px] font-medium jg-text-accent">{s.cta} →</span>
                  </Link>
                ))}
              </div>

              <p className="text-base md:text-lg text-gray-600 dark:text-gray-300 max-w-xl mb-5 leading-relaxed">
                事业进退、感情迷局、人生转折——不给你宿命断言，
                只帮你照见能量与时机，<span className="font-medium text-gray-800 dark:text-gray-100">理性做出你自己的决定</span>。
              </p>

              {/* AI 发光输入框 */}
              <form onSubmit={askAi} className="max-w-xl mb-4">
                <div className="relative">
                  <input
                    value={aiQ}
                    onChange={e => setAiQ(e.target.value)}
                    placeholder="输入出生年月日时，或直接问：最近适合换工作吗？"
                    className="jg-input w-full !py-3.5 !pr-28 text-sm"
                  />
                  <button type="submit" className="jg-btn-ai absolute right-1.5 top-1/2 -translate-y-1/2 !py-2 !px-4 text-xs">
                    AI 解读 →
                  </button>
                </div>
              </form>

              {/* 信任胶囊 */}
              <div className="flex flex-wrap gap-2 mb-6">
                {['古籍原典可溯源', '推理过程全透明', 'AI 免费解读', '生辰不存服务器'].map(t => (
                  <span key={t} className="text-[11px] px-2.5 py-1 rounded-full border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400">
                    ✓ {t}
                  </span>
                ))}
              </div>

              {/* CTA */}
              <div className="flex flex-wrap gap-3">
                <Link href="/bazi" className="jg-btn-primary">📜 免费排八字</Link>
                <Link href="/ziwei" className="jg-btn">⭐ 排紫微盘</Link>
                <Link href="/tools" className="jg-btn-ghost">全部工具 →</Link>
              </div>
            </div>

            {/* 右：科技罗盘 */}
            <div className="flex justify-center lg:justify-end">
              <RotatingCompass size={440} className="relative z-10" />
            </div>
          </div>
        </section>

        {/* ════ Bento Grid：三大精算引擎 ════ */}
        <section className="mb-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {bentoMain.map(c => (
              <Link key={c.href} href={c.href}
                className={`jg-tile group relative overflow-hidden p-6 min-h-[210px] flex flex-col ${c.accent === 'cyan' ? '!border-cyan-400/30' : ''}`}>
                <div className="relative z-10 flex flex-col h-full">
                  <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-300 w-fit">{c.emoji}</div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-gray-50 mb-1">{c.title}</h2>
                  <p className="text-[11px] font-medium text-violet-500 dark:text-violet-300 mb-2 tracking-wide">{c.tag}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-4 flex-1">{c.desc}</p>
                  <span className="text-xs font-semibold jg-text-accent group-hover:translate-x-1 transition-transform duration-300">
                    开始测算 →
                  </span>
                </div>
              </Link>
            ))}
          </div>

          {/* 副卡排 */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
            {bentoSub.map(c => (
              <Link key={c.href} href={c.href}
                className="jg-card group p-5 flex items-center gap-4 hover:!border-violet-400/40 transition-colors">
                <div className="text-2xl w-11 h-11 flex items-center justify-center rounded-xl bg-violet-500/10 group-hover:scale-110 transition-transform duration-300">
                  {c.emoji}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">{c.title}</h3>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">{c.tag}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ════ 免费排盘 ════ */}
        <div className="jg-card p-6 md:p-8 mb-14">
          <FreeChartWidget />
        </div>

        {/* ════ 轻工具横条 ════ */}
        <section className="mb-14">
          <div className="flex items-end justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-50">✨ 今天，想测点什么？</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">全部免费 · 即点即测 · 无需注册</p>
            </div>
            <Link href="/tools" className="text-xs jg-text-accent hover:underline shrink-0">查看全部 →</Link>
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-10 gap-2.5">
            {quickTools.map(t => (
              <Link key={t.href} href={t.href}
                className="jg-card-plain group flex flex-col items-center gap-1.5 py-3.5 px-1 text-center hover:!border-violet-400/40 transition-colors">
                <span className="text-xl group-hover:scale-110 transition-transform duration-200">{t.emoji}</span>
                <span className="text-[11px] text-gray-600 dark:text-gray-300 group-hover:text-violet-500 dark:group-hover:text-violet-300 transition-colors">
                  {t.name}
                </span>
              </Link>
            ))}
          </div>
          <p className="text-center text-[10px] text-gray-400 dark:text-gray-500 mt-3">
            解梦 7,749 词条 · 姓名 2,808 字详解 · 古籍 135 部全文 —— 内容均为原创整理
          </p>
        </section>

        {/* ════ 古籍信任 + 易学书馆 ════ */}
        <section className="mb-14">
          <div className="jg-tile relative overflow-hidden p-6">
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center gap-5">
              <div className="text-4xl group-hover:scale-110">📜</div>
              <div className="flex-1">
                <h2 className="text-lg font-bold text-gray-900 dark:text-gray-50 mb-1">易学书馆 · 135 部古籍全文</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                  《滴天髓》《紫微斗数全书》《三命通会》……每一句结论都可溯源到原典。
                  免费阅读、全文检索——古籍是公版文化资产，我们只做整理与白话导读。
                </p>
              </div>
              <Link href="/xueguan" className="jg-btn shrink-0">进入书馆 →</Link>
            </div>
          </div>
        </section>

        {/* ════ 学派源流（精简） ════ */}
        <section className="mb-14">
          <HeritageSection />
        </section>

        {/* ════ 常见问题（打消顾虑：原理/用法/隐私） ════ */}
        <section className="mb-14">
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-50 mb-1.5">常见问题</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">关于九宫八卦的技术原理、使用方式与数据安全——你关心的，我们坦诚答</p>
          </div>
          <div className="max-w-2xl mx-auto space-y-2.5">
            {faqItems.map((f, i) => (
              <div key={i} className="jg-card-plain overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between gap-3 px-4 py-3.5 text-left"
                  aria-expanded={openFaq === i}
                >
                  <span className="text-sm font-medium text-gray-800 dark:text-gray-100">{f.q}</span>
                  <span className={`text-violet-500 dark:text-violet-300 text-xs transition-transform duration-200 ${openFaq === i ? 'rotate-45' : ''}`}>＋</span>
                </button>
                {openFaq === i && (
                  <p className="px-4 pb-4 text-xs text-gray-600 dark:text-gray-400 leading-relaxed border-t border-gray-100 dark:border-gray-800 pt-3">
                    {f.a}
                  </p>
                )}
              </div>
            ))}
          </div>
          <p className="text-center mt-4">
            <Link href="/faq" className="text-xs jg-text-accent hover:underline">还有疑问？查看完整 FAQ →</Link>
          </p>
        </section>
      </div>
    </>
  )
}

// ── 免费排盘 Widget（含日历选择） ──
function FreeChartWidget() {
  useLocale()
  const [calendarType, setCalendarType] = useState<CalendarType>('solar')
  const [year, setYear] = useState('')
  const [month, setMonth] = useState('')
  const [day, setDay] = useState('')
  const [hour, setHour] = useState('6')
  const [isLeapMonth, setIsLeapMonth] = useState(false)
  const [gender, setGender] = useState('男')

  useEffect(() => {
    const now = new Date()
    setYear(String(now.getFullYear()))
    setMonth(String(now.getMonth() + 1))
    setDay(String(now.getDate()))
  }, [])

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
      <div className="flex items-center gap-2 justify-center mb-4">
        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-50">🔮 立即排盘</h2>
        <span className="text-[10px] px-2 py-0.5 rounded-full jg-chip">30 秒出盘</span>
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400 text-center mb-5">输入出生信息，AI 即刻为您白话解读</p>

      <div className="flex items-center gap-4 mb-4 justify-center">
        <span className="text-sm text-gray-500 dark:text-gray-400">性别</span>
        <div className="flex gap-2">
          {['男', '女'].map(g => (
            <button
              key={g}
              onClick={() => setGender(g)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                gender === g
                  ? 'bg-violet-500/15 text-violet-600 dark:text-violet-300 border border-violet-400/40'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-gray-300'
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
        className={`block w-full mt-6 min-h-[46px] py-3 rounded-xl text-center font-semibold text-base transition-all ${
          isValid
            ? 'jg-btn-primary !w-full !min-h-[46px]'
            : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed pointer-events-none'
        }`}
        onClick={e => { if (!isValid) e.preventDefault() }}
      >
        直接排盘 🚀
      </Link>

      <p className="text-center text-[10px] text-gray-400 dark:text-gray-500 mt-3">
        支持阳历 / 阴历 · 精确到时辰 · 19+ 命理模块 · AI 白话解读
      </p>
    </section>
  )
}
