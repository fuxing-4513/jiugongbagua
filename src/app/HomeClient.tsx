'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useLocale, useT } from '@/lib/i18n'

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
  { num: '01', title: '四柱八字', tag: '看人生周期', desc: '科技 · 事业 · 财富 · 大运——五行喜忌与十年大运的节奏', href: '/bazi', sub: ['科技', '事业', '财富', '大运'], bg: '/assets/card-bazi.webp' },
  { num: '02', title: '紫微斗数', tag: '看人生结构', desc: '十二宫 · 桃花 · 事业 · 财富——从命宫到人生剧本的完整结构', href: '/ziwei', sub: ['十二宫', '桃花', '事业', '财富'], bg: '/assets/card-ziwei.webp' },
  { num: '03', title: '奇门遁甲', tag: '看当下时机', desc: '决策 · 何时 · 把握 · 时机——此刻是进是守，局中有象', href: '/qimen', sub: ['决策', '何时', '把握', '时机'], bg: '/assets/card-qimen.webp' },
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

  // 场景卡（i18n 双语——五问入口——决策直达 AI）
  const scenarioCards = [
    { q: getT('home.scenarios.career.question'), empathy: getT('home.scenarios.career.empathy'), cta: getT('home.scenarios.career.cta'), href: '/ai?q=' + encodeURIComponent('我最近适合换工作吗？想看清现在该坚持还是转身。') },
    { q: getT('home.scenarios.love.question'), empathy: getT('home.scenarios.love.empathy'), cta: getT('home.scenarios.love.cta'), href: '/ai?q=' + encodeURIComponent('这段感情值得继续吗？想看清我们是不是在对的时间。') },
    { q: getT('home.scenarios.wealth.question'), empathy: getT('home.scenarios.wealth.empathy'), cta: getT('home.scenarios.wealth.cta'), href: '/ai?q=' + encodeURIComponent('今年适合创业或投资吗？想看清财富周期的进退节奏。') },
    { q: getT('home.scenarios.life.question'), empathy: getT('home.scenarios.life.empathy'), cta: getT('home.scenarios.life.cta'), href: '/ai?q=' + encodeURIComponent('我是不是该换一种活法了？想看清自己处在人生周期的哪一段。') },
    { q: getT('home.scenarios.risk.question'), empathy: getT('home.scenarios.risk.empathy'), cta: getT('home.scenarios.risk.cta'), href: '/ai?q=' + encodeURIComponent('现在该往前冲还是先稳住？想看清眼前的机遇与风险。') },
  ]
  // FAQ（i18n 双语）

  return (
    <>
      {/* ════ Hero：东方山水 × 时空仪盘 Artwork（规格 22 项施工） ════ */}
        <section className="relative overflow-hidden mb-16" style={{ background: '#050708' }}>
          {/* 山水背景（hero-mountain.svg——天空/五层山/雾/水面/金光） */}
          <img src="/assets/hero-cn.webp" alt="" aria-hidden
            className="absolute inset-0 w-full h-full object-cover object-center select-none pointer-events-none" />
          {/* 右侧金色天光强调 */}
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: 'radial-gradient(60% 40% at 78% 8%, rgba(176,138,60,0.14) 0%, transparent 70%)' }} />

          {/* 水面微光带 */}
          <div className="absolute inset-x-0 bottom-0 h-14 pointer-events-none opacity-60"
            style={{ background: 'linear-gradient(to top, rgba(176,138,60,0.10), transparent)' }} />

          {/* 文案层（左 44%——巨大呼吸空间） */}
          <div className="relative z-10 w-full px-8 md:px-14" style={{ minHeight: '680px' }}>
            {/* 时空盘（内容区右侧——大 580 悬浮——露出背景太极） */}
            <div className="absolute select-none pointer-events-none"
              style={{ right: '-1%', top: '50%', transform: 'translateY(-50%)', width: 'min(46vw, 580px)', opacity: 0.97 }}>
              <img src="/assets/hero-time-wheel.svg" alt="九宫时空盘——东方天文仪器" className="w-full h-auto" />
            </div>
            {/* 水面倒影 */}
            <div className="absolute select-none pointer-events-none"
              style={{ right: '4%', bottom: '-2%', width: 'min(36vw, 450px)', opacity: 0.14, transform: 'scaleY(-1)',
                filter: 'blur(5px)', maskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.55), transparent 82%)', WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.55), transparent 82%)' }}>
              <img src="/assets/hero-time-wheel.svg" alt="" aria-hidden className="w-full h-auto" />
            </div>
            <div className="flex flex-col justify-center" style={{ width: '44%', minHeight: '680px', padding: '104px 0 120px' }}>
              <p className="text-[12px] tracking-[0.3em] text-[#C9A85B]/80 mb-7">{getT('home.heroChip')}</p>
              <h1 className="text-[42px] leading-[1.14] md:text-[64px] font-normal font-serif text-[#F5F2EA] mb-7"
                style={{ textShadow: '0 2px 30px rgba(0,0,0,0.5)' }}>
                在关键时刻，
                <br />
                <span style={{ color: '#C9A85B' }}>看清真实处境。</span>
              </h1>
              <p className="text-[13px] md:text-[15px] font-serif tracking-[0.42em] text-[#BDB7AA] mb-9">
                观时 · 察势 · 明心 · 决策
              </p>
              <p className="text-[13px] text-[#9B968B] leading-relaxed mb-10 max-w-sm hidden sm:block">
                不给你宿命断言，只帮你照见能量与时机——理性做出你自己的决定。
              </p>
              {/* 四问（主题 + 具体问题——图稿） */}
              <div className="flex items-stretch gap-7 mb-12">
                {[
                  { t: '事业', q: '换工作？' },
                  { t: '财富', q: '今年该创业吗？' },
                  { t: '感情', q: '这段关系该继续吗？' },
                  { t: '人生', q: '我何时迎来转折？' },
                ].map((x, i) => (
                  <div key={x.t} className="relative pl-3">
                    {i > 0 && <span className="absolute left-0 top-1 bottom-1 w-px bg-[#3a3d3a]" />}
                    <p className="text-[13px] text-[#C9A85B] tracking-widest mb-1.5">{x.t}</p>
                    <p className="text-[12px] text-[#8a8478] whitespace-nowrap">{x.q}</p>
                  </div>
                ))}
              </div>
              {/* CTA */}
              <div>
                <Link href="/app"
                  className="inline-flex items-center gap-2.5 px-9 py-4 text-[#F5F2EA] text-[15px] tracking-[0.15em] transition-all hover:brightness-110 hover:-translate-y-0.5"
                  style={{ background: 'rgba(178,58,58,0.92)', border: '1px solid rgba(245,242,234,0.18)', boxShadow: '0 14px 40px rgba(178,58,58,0.22)' }}>
                  开始我的人生推演 →
                </Link>
              </div>
            {/* 右侧竖排文案（图稿——竖排小字） */}
            <div className="hidden xl:block absolute right-10 top-1/2 -translate-y-1/2 select-none pointer-events-none text-right">
              <p className="writing-vertical text-[12px] tracking-[0.3em] text-[#9B968B]/80 leading-loose" style={{ writingMode: 'vertical-rl' }}>
                天时地利人和 · 关键时刻是否 · 用在参谋人生
              </p>
            </div>
            </div>
          </div>
        </section>

        {/* ════ 内容区（rest——max-w 容器） ════ */}
        <div className="max-w-6xl mx-auto px-4">

        {/* ════ Bento Grid：三大精算引擎 ════ */}
        <section className="mb-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {bentoMain.map(c => (
              <Link key={c.href} href={c.href}
                className="group relative overflow-hidden flex flex-col items-center text-center transition-all duration-300 hover:-translate-y-1"
                style={{ background: "var(--paper)", border: "1px solid var(--border-light)", boxShadow: "var(--shadow-card)" }}>
                <div className="relative z-10 flex flex-col items-center px-8 pt-9 pb-5 w-full">
                  {/* 中央圆形图腾 */}
                  <div className="w-[92px] h-[92px] rounded-full border border-gold-500/40 flex items-center justify-center mb-4 group-hover:border-gold-400/70 transition-colors"
                    style={{ background: 'radial-gradient(circle, rgba(176,138,60,0.10), transparent 70%)' }}>
                    <span className="text-[26px] font-serif text-gold-600 dark:text-gold-300 font-normal">{c.num}</span>
                  </div>
                  <h2 className="text-xl font-serif font-medium text-gray-900 dark:text-gray-50 mb-1">{c.title}</h2>
                  <p className="text-[12px] font-medium tracking-[0.25em] text-gold-600/90 dark:text-gold-400/80 mb-4">{c.tag}</p>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed mb-5">{c.desc}</p>
                  {/* 四小项 */}
                  <div className="flex gap-5 mb-2">
                    {c.sub.map(x => (
                      <span key={x} className="text-[11px] text-gray-600 dark:text-gray-300 tracking-wider">{x}</span>
                    ))}
                  </div>
                  <span className="text-[11px] text-gray-400 group-hover:text-gold-600 transition-colors mt-2">了解更多 →</span>
                </div>
                {/* 卡底部背景图（淡墨山水横条——图稿） */}
                <div className="relative w-full h-[120px] overflow-hidden">
                  <img src={c.bg} alt="" aria-hidden className="absolute inset-0 w-full h-full object-cover object-center" />
                  <div className="absolute inset-0 bg-gradient-to-t from-transparent to-[var(--paper)]" style={{ background: 'linear-gradient(to top, var(--paper), rgba(245,242,234,0.2))' }} />
                </div>
              </Link>
            ))}
          </div>

          {/* 三核心下注（克制——不排副卡平铺） */}
          <p className="text-[11px] text-[#9B968B] tracking-wide mt-6 text-center">
            另有 双人合盘 · 每日宜忌 · 六爻 · 梅花 · 小六壬 等二十余术数 → <Link href="/tools" className="text-gold hover:text-gold-light underline-offset-4 hover:underline">术数大全</Link>
          </p>
        </section>

        {/* ════ AI 决策分析（规范 03：深色 40/60——人生推演报告） ════ */}
        <section className="mb-24">
          <div className="relative overflow-hidden">
            {/* 背景图（深墨山水+人影——图稿 AI 区） */}
            <img src="/assets/ai-area.webp" alt="" aria-hidden className="absolute inset-0 w-full h-full object-cover object-center" />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(105deg, rgba(8,11,12,0.10) 0%, rgba(8,11,12,0.32) 30%, rgba(8,11,12,0.82) 92%)' }} />
            <div className="relative z-10 grid md:grid-cols-[30fr_70fr] items-stretch">
              {/* 左 30%：人影区（留空——人物显现不被遮挡） */}
              <div className="hidden md:block" aria-hidden></div>
              {/* 右 70%：内容（文字 + 按钮 + AI 卡） */}
              <div className="md:grid md:grid-cols-[44fr_56fr] items-center">
                <div className="p-8 md:p-12 flex flex-col justify-center">
                  <p className="text-[12px] tracking-[0.3em] text-[#B23A3A] font-normal mb-4">AI 决策分析</p>
                  <h2 className="text-[26px] md:text-[34px] font-normal font-serif text-[#F5F2EA] leading-snug mb-5">
                    不只是算命，<br />更是决策参考。
                  </h2>
                  <p className="text-[13px] text-[#9B968B] leading-relaxed mb-7 max-w-sm">
                    结合你的命盘 · 时机与古籍智慧——把"该不该、能不能、何时动"推演成一份可行动的建议，每一句都可溯源到原典。
                  </p>
                  {/* 体验 AI 个人分析 →（图稿按钮——链 AI 测算页） */}
                  <Link href="/ai" className="inline-flex items-center gap-2 text-[#F5F2EA] text-[14px] tracking-[0.1em] px-6 py-3 w-max transition-all hover:brightness-110 hover:-translate-y-0.5"
                    style={{ background: '#B23A3A', boxShadow: '0 8px 24px rgba(178,58,58,0.3)' }}>
                    体验 AI 个人分析 →
                  </Link>
                </div>
              {/* 右 60%：AI 分析卡（人生推演报告——glass 报告而非聊天框） */}
              <div className="p-8 md:p-14 flex items-center" style={{ background: 'rgba(255,255,255,0.02)', borderLeft: '1px solid rgba(176,138,60,0.18)' }}>
                <div className="w-full max-w-[520px] ml-auto"
                  style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(176,138,60,0.28)', borderRadius: '14px', backdropFilter: 'blur(16px)' }}>
                  {/* 报告头 */}
                  <div className="px-7 pt-6 pb-4" style={{ borderBottom: '1px solid rgba(176,138,60,0.15)' }}>
                    <p className="text-[10px] tracking-[0.25em] text-[#9B968B] mb-2">人生推演报告 · 2026</p>
                    <p className="text-[15px] font-serif text-[#F5F2EA]">我最近应该换工作吗？</p>
                  </div>
                  {/* 报告体：趋势/机会/风险/建议 */}
                  <div className="px-7 py-5 space-y-4">
                    {[
                      { k: '趋势', v: '大运交接的蓄势段——能量先收后放，2026 秋起转升', c: '#C9A85B' },
                      { k: '机会', v: '10 月后窗口开启：主动争取、扩大影响力为佳', c: '#8A9A78' },
                      { k: '风险', v: '高杠杆与情绪性离职需谨慎——上半年宜稳', c: '#A86F73' },
                      { k: '建议', v: '先稳后动：Q3 积累筹码，Q4 把握窗口再做决定', c: '#B08A3C' },
                    ].map(r => (
                      <div key={r.k} className="flex gap-4">
                        <span className="w-10 shrink-0 text-[11px] tracking-widest pt-0.5" style={{ color: r.c }}>{r.k}</span>
                        <p className="text-[12px] leading-relaxed text-[#BDB7AA] flex-1">{r.v}</p>
                      </div>
                    ))}
                  </div>
                  {/* 报告尾：古籍依据 */}
                  <div className="px-7 pb-6 pt-4" style={{ borderTop: '1px solid rgba(176,138,60,0.15)' }}>
                    <p className="text-[10px] text-[#68645C] leading-relaxed">📜 依据：《滴天髓》气象论 · 命盘日主 × 大运十神 × 流年时机 —— <span className="text-[#9B968B]">进入 AI 决策看完整推演</span></p>
                  </div>
                </div>
              </div>
              </div>
            </div>
          </div>
        </section>

        {/* ════ 古籍信任 + 易学书馆 ════ */}
        <section className="mb-14">
          <div className="relative overflow-hidden rounded-3xl border border-gold-300/40 dark:border-gold-500/20 p-8 md:p-10"
            style={{ background: 'var(--paper-dark, #F0EBDF)' }}>
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

        {/* ════ 免费排盘（建立你的个人命盘） ════ */}
        <div className="jg-card p-6 md:p-8 mb-14">
          <FreeChartWidget />
        </div>

        {/* ════ 使命句（图稿：传承东方智慧 · 用科技解读命运） ════ */}
        <section className="mb-14 text-center">
          <p className="text-[10px] tracking-[0.35em] text-gold-600/80 dark:text-gold-400/70 mb-3">东方智慧 × 未来科技</p>
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-gray-900 dark:text-gray-50 leading-snug mb-4">
            传承东方智慧，
            <span className="text-cinnabar-500 dark:text-cinnabar-400">用科技解读命运</span>
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
            一百四十余部公版古籍、数千年观时之术——以确定性算法排盘、以古籍为据推演、以 AI 白话解读，
            让先人的智慧，成为今天每一个决定的参考。
          </p>
        </section>

        {/* ════ 为什么选择九宫八卦？（信任区——图稿底部） ════ */}
        <section className="mb-14">
          <div className="rounded-3xl border border-gray-200/80 dark:border-gray-700/50 bg-white/80 dark:bg-[#131210]/70 p-7 md:p-9">
            <div className="flex items-end justify-between flex-wrap gap-3 mb-6">
              <div>
                <h2 className="text-2xl md:text-[26px] font-serif font-bold text-gray-900 dark:text-gray-50">为什么选择九宫八卦？</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">我们不做黑盒——数据、流派、古籍、AI、验证、隐私，全部透明。</p>
              </div>
              <Link href="/why-jiugong" className="text-xs text-cinnabar-500 hover:underline shrink-0 font-medium">六层信任体系全公开 →</Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { k: '🔢', t: '数据可复验', d: '历法排盘依据公开——同一生辰，任何权威软件排盘结果一致。' },
                { k: '🏮', t: '流派讲清楚', d: '子平法为主、兼顾滴天髓旺衰与真诠格局——分歧处不隐瞒。' },
                { k: '📜', t: '古籍全溯源', d: '140+ 公版古籍原文——每一句结论都可溯源到原典。' },
                { k: '🤖', t: 'AI 不胡编', d: 'RAG 检索增强——先检索原文再作答，没依据就不硬答。' },
                { k: '🧪', t: '排盘可验证', d: '确定性算法先排盘、AI 只解读盘面事实——结果可对照。' },
                { k: '🔒', t: '生辰不存储', d: '出生信息仅当次计算——不存服务器、不留档、无需注册。' },
              ].map(x => (
                <div key={x.t} className="rounded-xl border border-gray-200/70 dark:border-gray-700/50 p-4 bg-white/70 dark:bg-[#171614]/60 hover:border-gold-400/40 transition-colors">
                  <p className="text-lg mb-1.5">{x.k}</p>
                  <p className="text-[13px] font-semibold text-gray-800 dark:text-gray-100 mb-1">{x.t}</p>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">{x.d}</p>
                </div>
              ))}
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

        {/* ════ 08 终 CTA（开始你的第一次人生推演——深色横幅） ════ */}
        <section className="mb-24 text-center overflow-hidden relative"
          style={{ background: 'radial-gradient(100% 140% at 50% 0%, #111617 0%, #080B0C 70%)' }}>
          <div className="px-8 py-20 md:py-28 relative z-10">
            <p className="text-[12px] tracking-[0.3em] text-[#9B968B] mb-5">东方智慧 · AI 时空推演</p>
            <h2 className="text-[32px] md:text-[48px] font-normal font-serif text-[#F5F2EA] leading-snug mb-8">
              开始你的<span style={{ color: '#C9A85B' }}>第一次</span>人生推演。
            </h2>
            <div className="flex justify-center">
              <Link href="/app"
                className="inline-flex items-center gap-2.5 px-10 py-4 text-[#F5F2EA] text-[15px] tracking-[0.15em] transition-all hover:brightness-110 hover:-translate-y-0.5"
                style={{ background: '#B23A3A', boxShadow: '0 12px 36px rgba(178,58,58,0.28)' }}>
                生成我的人生图谱 →
              </Link>
            </div>
            <p className="text-[11px] text-[#68645C] mt-8">免费 · 无需注册 · 生辰不存储 · 已服务上万次推演</p>
            <p className="text-[11px] text-[#68645C] mt-2">
              常见问题？ <Link href="/faq" className="text-[#9B968B] hover:text-[#C9A85B] underline-offset-4 hover:underline">查看帮助中心 →</Link>
            </p>
          </div>
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
