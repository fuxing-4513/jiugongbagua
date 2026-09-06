'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useLocale, useT, useTArray } from '@/lib/i18n'

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
// ── Bento 主卡：九宫三大核心（看周期 / 看结构 / 看时机） ──
const bentoMain = [
  { num: '01', emoji: '', title: '四柱八字', tag: '看人生周期', desc: '事业 · 财富 · 性格 · 大运——五行喜忌与十年大运的节奏', href: '/bazi', accent: 'gold' },
  { num: '02', emoji: '', title: '紫微斗数', tag: '看人生结构', desc: '十四主星十二宫——从命宫到人生剧本的完整结构', href: '/ziwei', accent: 'gold' },
  { num: '03', emoji: '', title: '奇门遁甲', tag: '看当下时机', desc: '决策 · 择时 · 策略——此刻是进是守，局中有象', href: '/qimen', accent: 'gold' },
]
// ── Bento 副卡（中排——AI 决策对话 + 延伸） ──
const bentoSub = [
  { emoji: '💬', title: 'AI 决策对话', tag: '古籍依据 · 透明推理', href: '/ai' },
  { emoji: '💑', title: '双人合盘', tag: '情侣契合 · 事业搭档', href: '/hehun' },
  { emoji: '📅', title: '每日宜忌', tag: '今日能量 · 吉神方位', href: '/huangli' },
]
// ── 轻工具（克制文字导航——探索更多东方术数） ──
const quickTools = [
  { name: '六爻', href: '/liuyao' },
  { name: '梅花易数', href: '/meihua' },
  { name: '小六壬', href: '/xiaoliuren' },
  { name: '灵签', href: '/lingqian' },
  { name: '周公解梦', href: '/jiemeng' },
  { name: '姓名', href: '/xingming' },
  { name: '塔罗', href: '/taluo' },
  { name: '称骨', href: '/chenggu' },
  { name: '号码', href: '/shuma' },
  { name: '星座', href: '/xingzuo' },
  { name: '占星', href: '/astro' },
  { name: '灵数', href: '/numerology' },
]

export default function HomeClient() {
  const getT = useT()
  const router = useRouter()
  const [aiQ, setAiQ] = useState('')
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  // 场景卡（i18n 双语——五问入口——决策直达 AI）
  const scenarioCards = [
    { q: getT('home.scenarios.career.question'), empathy: getT('home.scenarios.career.empathy'), cta: getT('home.scenarios.career.cta'), href: '/ai?q=' + encodeURIComponent('我最近适合换工作吗？想看清现在该坚持还是转身。') },
    { q: getT('home.scenarios.love.question'), empathy: getT('home.scenarios.love.empathy'), cta: getT('home.scenarios.love.cta'), href: '/ai?q=' + encodeURIComponent('这段感情值得继续吗？想看清我们是不是在对的时间。') },
    { q: getT('home.scenarios.wealth.question'), empathy: getT('home.scenarios.wealth.empathy'), cta: getT('home.scenarios.wealth.cta'), href: '/ai?q=' + encodeURIComponent('今年适合创业或投资吗？想看清财富周期的进退节奏。') },
    { q: getT('home.scenarios.life.question'), empathy: getT('home.scenarios.life.empathy'), cta: getT('home.scenarios.life.cta'), href: '/ai?q=' + encodeURIComponent('我是不是该换一种活法了？想看清自己处在人生周期的哪一段。') },
    { q: getT('home.scenarios.risk.question'), empathy: getT('home.scenarios.risk.empathy'), cta: getT('home.scenarios.risk.cta'), href: '/ai?q=' + encodeURIComponent('现在该往前冲还是先稳住？想看清眼前的机遇与风险。') },
  ]
  // FAQ（i18n 双语）
  const faqItems = useTArray()('home.faq.items') as { q: string; a: string }[]

  const askAi = (e: React.FormEvent) => {
    e.preventDefault()
    const q = aiQ.trim()
    router.push(q ? `/ai?q=${encodeURIComponent(q)}` : '/ai')
  }

  return (
    <>
      <div className="max-w-6xl mx-auto px-4">
        {/* ════ Hero：科技罗盘 + AI 入口 ════ */}
        <section className="relative pt-14 md:pt-16 pb-10 overflow-hidden">
          {/* 背景：星点（细腻点缀，不喧宾夺主） */}
          <div className="absolute inset-0 pointer-events-none">
            <StarField className="absolute inset-0 w-full h-full opacity-40 dark:opacity-60" />
          </div>

          <div className="relative z-10 grid lg:grid-cols-[1.15fr_1fr] gap-12 items-center">
            {/* 左：文案 + AI 输入 */}
            <div>
              <span className="jg-chip mb-6">{getT('home.heroChip')}</span>
              <h1 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-gray-50 leading-tight mb-8">
                在关键时刻，
                <br />
                <span className="jg-text-grad">看清真实处境</span>
              </h1>

              {/* ═══ 三大痛点场景（先共情，再给方法） ═══ */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-8">
                {scenarioCards.map(s => (
                  <Link key={s.href} href={s.href}
                    className="group jg-card-plain p-4 hover:border-violet-400/50! transition-colors flex flex-col">
                    <p className="text-[13.5px] font-bold text-gray-800 dark:text-gray-100 leading-relaxed mb-2 group-hover:text-violet-600 dark:group-hover:text-violet-300 transition-colors">
                      {s.q}
                    </p>
                    <p className="text-[11.5px] text-gray-500 dark:text-gray-400 leading-relaxed mb-3 flex-1">
                      {s.empathy}
                    </p>
                    <span className="text-[10.5px] font-medium jg-text-accent">{s.cta} →</span>
                  </Link>
                ))}
              </div>

              <p className="text-base md:text-lg text-gray-600 dark:text-gray-300 max-w-xl mb-7 leading-relaxed">
                事业进退、感情迷局、人生转折——不给你宿命断言，
                只帮你照见能量与时机，<span className="font-medium text-gray-800 dark:text-gray-100">理性做出你自己的决定</span>。
              </p>

              {/* AI 发光输入框（昼=金色柔光 / 夜=紫色光晕） */}
              <form onSubmit={askAi} className="max-w-xl mb-6">
                <div className="relative">
                  <div className="absolute -inset-[1.5px] rounded-2xl bg-gradient-to-r from-amber-400/25 via-yellow-500/15 to-amber-400/25 dark:from-violet-500/60 dark:via-cyan-400/30 dark:to-violet-500/60 opacity-70 blur-[5px]" />
                  <input
                    value={aiQ}
                    onChange={e => setAiQ(e.target.value)}
                    placeholder={getT('home.aiInputPlaceholder')}
                    className="jg-input jg-input-glow w-full py-4! pr-28! text-sm"
                  />
                  <button type="submit" className="jg-btn-ai absolute right-1.5 top-1/2 -translate-y-1/2 py-2.5! px-4! text-xs z-10">
                    AI 解读 →
                  </button>
                </div>
              </form>

              {/* 信任胶囊 */}
              <div className="flex flex-wrap gap-2.5 mb-4">
                {(useTArray()('home.trustPills') as string[]).map(t => (
                  <span key={t} className="text-[11px] px-3 py-1 rounded-full border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400">
                    ✓ {t}
                  </span>
                ))}
              </div>
              <Link href="/why-jiugong" className="inline-block text-[11px] text-gray-400 hover:text-gold-500 mb-6 transition-colors">
                🛡️ 为什么相信九宫八卦？——数据 / 流派 / 古籍 / AI / 隐私 全透明 →
              </Link>

              {/* CTA */}
              <div className="flex flex-wrap gap-3.5">
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
                className="jg-tile group relative overflow-hidden p-6 min-h-[210px] flex flex-col">
                <div className="relative z-10 flex flex-col h-full">
                  <div className="flex items-baseline gap-3 mb-3">
                    <span className="text-2xl font-serif font-bold text-gold-500/70 dark:text-gold-400/60 group-hover:text-gold-500 dark:group-hover:text-gold-300 transition-colors">{c.num}</span>
                    <h2 className="text-lg font-bold font-serif text-gray-900 dark:text-gray-50">{c.title}</h2>
                  </div>
                  <p className="text-[11px] font-medium tracking-[0.2em] text-gold-600/80 dark:text-gold-400/70 mb-2">{c.tag}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-4 flex-1">{c.desc}</p>
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300 group-hover:text-gold-600 dark:group-hover:text-gold-300 transition-colors">
                    开始推演 →
                  </span>
                </div>
              </Link>
            ))}
          </div>

          {/* 副卡排 */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
            {bentoSub.map(c => (
              <Link key={c.href} href={c.href}
                className="jg-card group p-5 flex items-center gap-4 hover:border-gold-400/40! transition-colors">
                <div className="text-2xl w-11 h-11 flex items-center justify-center rounded-xl bg-gold-500/8 group-hover:scale-110 transition-transform duration-300">
                  {c.emoji}
                </div>
                <div>
                  <h3 className="text-sm font-semibold font-serif text-gray-800 dark:text-gray-100">{c.title}</h3>
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

        {/* ════ 术数大全（克制文字导航——SEO 长尾保留——视觉降级） ════ */}
        <section className="mb-14">
          <div className="flex items-end justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold font-serif text-gray-900 dark:text-gray-50">探索更多东方术数</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">六爻 · 梅花 · 小六壬 · 灵签 · 塔罗 · 占星——传统术数的更多切面</p>
            </div>
            <Link href="/tools" className="text-xs jg-text-accent hover:underline shrink-0">术数大全 →</Link>
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-2.5">
            {quickTools.map(t => (
              <Link key={t.href} href={t.href}
                className="text-[13px] text-gray-600 dark:text-gray-400 hover:text-gold-600 dark:hover:text-gold-300 transition-colors border-b border-transparent hover:border-gold-400/50 pb-0.5">
                {t.name}
              </Link>
            ))}
          </div>
          <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-4">
            {getT('home.tools.footnote')}
          </p>
        </section>

        {/* ════ 古籍信任 + 易学书馆 ════ */}
        <section className="mb-14">
          <div className="relative overflow-hidden rounded-3xl border border-gold-300/40 dark:border-gold-500/20 p-8 md:p-10"
            style={{ background: 'linear-gradient(135deg, #efe9da 0%, #f7f3e8 55%, #efe7d2 100%)' }}>
            {/* 极淡纸纹 */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.5]"
              style={{ background: 'repeating-linear-gradient(0deg, rgba(176,138,60,0.03) 0px, rgba(176,138,60,0.03) 1px, transparent 1px, transparent 3px)' }} />
            <div className="relative z-10 grid md:grid-cols-[auto_1fr] gap-8 md:gap-10 items-center">
              {/* 古籍书封陈列（东方档案馆——四册） */}
              <div className="flex gap-3 justify-center md:justify-start">
                {[{ n: '滴天髓', sub: '命理' }, { n: '三命通会', sub: '汇典' }, { n: '紫微斗数全书', sub: '斗数' }, { n: '焦氏易林', sub: '易占' }].map((b, i) => (
                  <div key={b.n} className="group cursor-pointer w-[92px] md:w-[104px]" onClick={() => { if (typeof window !== 'undefined') window.location.href = '/xueguan' }}>
                    <div className="relative aspect-[3/4.4] rounded-md border border-gold-600/50 dark:border-gold-500/40 shadow-[2px_3px_10px_rgba(120,90,30,0.25)] overflow-hidden transition-transform duration-300 group-hover:-translate-y-1.5 group-hover:shadow-[3px_6px_16px_rgba(120,90,30,0.35)]"
                      style={{ background: 'linear-gradient(150deg,#a3713a 0%,#8a5a28 45%,#6e4518 100%)' }}>
                      <div className="absolute inset-x-0 top-0 h-[6px]" style={{ background: 'linear-gradient(90deg,#c9a86a,#8a6d3a,#c9a86a)' }} />
                      <div className="absolute inset-x-0 bottom-0 h-[6px]" style={{ background: 'linear-gradient(90deg,#8a6d3a,#c9a86a,#8a6d3a)' }} />
                      <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-px bg-gold-300/30" />
                      <div className="absolute inset-0 flex flex-col items-center justify-center px-1.5 text-center">
                        <span className="text-[15px] md:text-base font-serif font-bold text-[#f2e6c8] tracking-[0.3em] [writing-mode:vertical-rl] leading-relaxed">{b.n}</span>
                        <span className="mt-2 text-[8px] text-[#d8c290] tracking-widest border border-[#d8c290]/40 px-1.5 py-0.5 rounded-sm">{b.sub}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div>
                <h2 className="text-2xl md:text-[26px] font-bold font-serif text-[#4a3413] mb-3 leading-snug">易学书馆 · 数百年东方智慧</h2>
                <p className="text-sm text-[#6b5230] leading-relaxed max-w-2xl">
                  《滴天髓》《三命通会》《紫微斗数全书》……一百四十余部公版典籍全文——
                  <b className="text-[#4a3413]">每一句结论都可溯源到原典</b>。原典 · 注疏 · 白话导读 · AI 解读，
                  像一座可以翻阅的东方智慧档案馆。
                </p>
                <p className="text-[11px] text-[#8a6d3a] mt-3 tracking-wide">📖 原典全文 · 全文检索 · 白话导读 · 版本考订 —— 持续收录中</p>
                <div className="mt-5">
                  <Link href="/xueguan" className="inline-block px-7 py-2.5 rounded-lg text-sm font-medium text-[#f2e6c8] transition-all hover:brightness-110"
                    style={{ background: 'linear-gradient(135deg,#8a5a28,#6e4518)', boxShadow: '0 2px 8px rgba(110,69,24,0.3)' }}>
                    进入易学书馆 →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ════ 学派源流（精简） ════ */}
        <section className="mb-14">
          <HeritageSection />
        </section>

        {/* ════ 九宫文库（独立板块——知识体系，同易学书馆金框样式） ════ */}
        <section className="mb-14">
          <div className="jg-tile relative overflow-hidden p-7 md:p-9 jg-frame-gold">
            <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-6 md:gap-8">
              <div className="text-5xl md:text-6xl shrink-0 mx-auto md:mx-0">📚</div>
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-50 mb-2">{getT('home.wenku.title')}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed max-w-2xl">
                  {getT('home.wenku.desc')}
                </p>
                <p className="text-[11px] text-gold-600/80 dark:text-gold-400/70 mt-2.5">
                  {getT('home.wenku.note')}
                </p>
              </div>
              <div className="shrink-0 flex justify-center">
                <Link href="/wenku" className="jg-btn-primary px-8! py-3.5!">{getT('home.wenku.cta')}</Link>
              </div>
            </div>
          </div>
        </section>

        {/* ════ 常见问题（打消顾虑：原理/用法/隐私） ════ */}
        <section className="mb-14">
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-50 mb-1.5">{getT('home.faq.title')}</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">{getT('home.faq.subtitle')}</p>
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
            <Link href="/faq" className="text-xs jg-text-accent hover:underline">{getT('home.faq.viewAll')}</Link>
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
      <div className="text-center mb-4">
        <h2 className="text-xl md:text-2xl font-serif font-bold text-gray-900 dark:text-gray-50">建立你的个人命盘</h2>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 max-w-sm mx-auto leading-relaxed">
          你的出生时空，是一张独一无二的人生地图——输入生辰，生成人生图谱
        </p>
      </div>

      <div className="flex items-center gap-4 mb-4 justify-center">
        <span className="text-sm text-gray-500 dark:text-gray-400">性别</span>
        <div className="flex gap-2">
          {['男', '女'].map(g => (
            <button
              key={g}
              onClick={() => setGender(g)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                gender === g
                  ? 'bg-gold-500/12 text-gold-700 dark:text-gold-300 border border-gold-400/40'
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
            ? 'jg-btn-primary w-full! min-h-[46px]!'
            : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed pointer-events-none'
        }`}
        onClick={e => { if (!isValid) e.preventDefault() }}
      >
        生成我的人生图谱 →
      </Link>

      <p className="text-center text-[10px] text-gray-400 dark:text-gray-500 mt-3">
        支持阳历 / 阴历 · 精确到时辰 · 八字/紫微/奇门 三盘同开 · AI 白话解读
      </p>
    </section>
  )
}
