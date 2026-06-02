'use client'

import Link from 'next/link'
import { useLocale } from '@/lib/i18n'
import HomeWidgets from '@/components/HomeWidgets'
import HeritageSection from '@/components/HeritageSection'
import ClassicQuotes from '@/components/ClassicQuotes'
import BottomCTA from '@/components/BottomCTA'

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
  { key: 'cezi', nameKey: 'modules.cezi.name', descKey: 'modules.cezi.desc', sourceKey: 'modules.cezi.source', emoji: '🖌', href: '/cezi' },
  { key: 'wenku', nameKey: 'modules.wenku.name', descKey: 'modules.wenku.desc', sourceKey: 'modules.wenku.source', emoji: '📚', href: '/wenku' },
  { key: 'hehun', nameKey: 'modules.hehun.name', descKey: 'modules.hehun.desc', sourceKey: 'modules.hehun.source', emoji: '💑', href: '/hehun' },
  { key: 'experts', nameKey: 'modules.experts.name', descKey: 'modules.experts.desc', sourceKey: 'modules.experts.source', emoji: '👨‍🏫', href: '/experts' },
]

export default function HomeClient() {
  const { t } = useLocale()

  const getT = (key: string) => {
    const keys = key.split('.')
    let value: unknown = t
    for (const k of keys) {
      if (typeof value !== 'object' || value === null) return key
      value = (value as Record<string, unknown>)[k]
    }
    return typeof value === 'string' ? value : key
  }

  return (
    <div className="max-w-6xl mx-auto px-4">
      {/* ===== Hero 区域 ===== */}
      <section className="text-center py-12 md:py-16">
        <p className="text-sm text-gold-400/70 tracking-widest mb-3">
          {getT('site.tagline')}
        </p>
        <h1 className="text-3xl md:text-5xl font-bold text-gold-400 font-serif mb-4 leading-tight">
          {getT('home.heroTitle')}
        </h1>
        <p className="text-base md:text-lg text-gray-400 max-w-2xl mx-auto mb-4 leading-relaxed">
          {getT('home.heroDesc')}
        </p>
        {/* 古籍引用 */}
        <ClassicQuotes />

        {/* CTA 按钮组 */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6">
          <Link href="/app"
            className="px-8 py-3 bg-gold-400 text-dark-900 rounded-lg font-semibold text-lg hover:bg-gold-300 transition-all shadow-lg shadow-gold-400/20 hover:shadow-gold-400/40"
          >
            {getT('home.heroCta')}
          </Link>
          <Link href="#heritage"
            className="px-6 py-3 border border-gold-400/30 rounded-lg text-gold-400 font-medium hover:bg-gold-400/10 transition-colors"
          >
            {getT('home.heroHeritage')}
          </Link>
        </div>

        {/* 信任横条 */}
        <p className="mt-6 text-xs text-gray-500 tracking-wide">
          {getT('home.trustStrip')}
        </p>
      </section>

      {/* ===== Home Widgets: 黄历 + 天气 ===== */}
      <HomeWidgets />

      {/* ===== 八字命理课堂 ===== */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold text-gold-400 font-serif mb-4 text-center">
          {getT('home.classroom')}
        </h2>
        <p className="text-center text-gray-500 text-sm mb-5">
          {getT('home.classroomDesc')}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[0,1,2,3,4,5,6,7].map((i) => {
            const raw = (t as any)?.baziClassroom?.topics?.[i]
            if (!raw) return null
            return (
              <Link key={i} href="/wenku"
                className="group bg-dark-700/60 rounded-xl border border-dark-600 p-4 hover:border-gold-500/50 hover:bg-dark-700 transition-all duration-200"
              >
                <h3 className="text-sm font-semibold text-gray-200 group-hover:text-gold-400 transition-colors mb-1.5">
                  {raw.title}
                </h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  {raw.desc}
                </p>
              </Link>
            )
          })}
        </div>
      </section>

      {/* ===== 十二生肖百科 ===== */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold text-gold-400 font-serif mb-4 text-center">🐉 十二生肖</h2>
        <p className="text-center text-gray-500 text-sm mb-5">点击生肖了解起源传说、性格特征、文化象征与运势</p>
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-12 gap-2">
          {[
            {emoji:'🐭',name:'鼠'},{emoji:'🐮',name:'牛'},{emoji:'🐯',name:'虎'},{emoji:'🐰',name:'兔'},
            {emoji:'🐲',name:'龙'},{emoji:'🐍',name:'蛇'},{emoji:'🐴',name:'马'},{emoji:'🐏',name:'羊'},
            {emoji:'🐵',name:'猴'},{emoji:'🐔',name:'鸡'},{emoji:'🐶',name:'狗'},{emoji:'🐷',name:'猪'}
          ].map(s => (
            <Link key={s.name} href="/shengxiao"
              className="group flex flex-col items-center p-3 rounded-xl bg-dark-700/50 border border-dark-600 hover:border-gold-500/50 transition-all duration-200">
              <span className="text-2xl mb-1">{s.emoji}</span>
              <span className="text-xs font-medium text-gray-400 group-hover:text-gold-400">{s.name}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* ===== 全部工具 Grid（含古籍引用）===== */}
      <h2 className="text-xl font-semibold text-gold-400 font-serif mb-4 text-center">🔮 全部工具</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-12">
        {modules.map((mod) => (
          <Link
            key={mod.key}
            href={mod.href}
            className="group bg-dark-700 rounded-xl border border-dark-600 p-5 hover:border-gold-500 hover:shadow-md hover:shadow-gold-500/10 transition-all duration-200"
          >
            <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-200">
              {mod.emoji}
            </div>
            <h3 className="text-base font-semibold text-gray-200 group-hover:text-gold-400 transition-colors mb-1">
              {getT(mod.nameKey)}
            </h3>
            <p className="text-xs text-gray-400 leading-relaxed mb-2">
              {getT(mod.descKey)}
            </p>
            {getT(mod.sourceKey) && getT(mod.sourceKey) !== mod.sourceKey && (
              <p className="text-[10px] text-gold-500/60 font-serif italic">
                {getT(mod.sourceKey)}
              </p>
            )}
          </Link>
        ))}
      </div>

      {/* ===== 学派源流 ===== */}
      <div id="heritage">
        <HeritageSection />
      </div>

      {/* ===== 底部 CTA ===== */}
      <BottomCTA />
    </div>
  )
}
