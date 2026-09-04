'use client'

import Link from 'next/link'
import { useT } from '@/lib/i18n'
import Breadcrumb from '@/components/Breadcrumb'

// 主引擎（权重最高）
const mainEngines = [
  { key: 'bazi', emoji: '📜', href: '/bazi', tag: '能量周期 · 五行喜忌 · 财官节点' },
  { key: 'ziwei', emoji: '⭐', href: '/ziwei', tag: '人生格局 · 心理画像 · 大运走势' },
  { key: 'qimen', emoji: '🧭', href: '/qimen', tag: '特定时空 · 择吉与竞争策略' },
]
// 分组工具
const toolGroups: { label: string; items: { key: string; emoji: string; href: string }[] }[] = [
  {
    label: '关系与情感',
    items: [
      { key: 'hehun', emoji: '💑', href: '/hehun' },
      { key: 'zonghe', emoji: '🔗', href: '/zonghe-zhengming' },
      { key: 'xingzuo', emoji: '♈', href: '/xingzuo' },
    ],
  },
  {
    label: '即时占卜',
    items: [
      { key: 'liuyao', emoji: '☯', href: '/liuyao' },
      { key: 'xiaoliuren', emoji: '👋', href: '/xiaoliuren' },
      { key: 'meihua', emoji: '🌸', href: '/meihua' },
      { key: 'lingqian', emoji: '🏮', href: '/lingqian' },
      { key: 'taluo', emoji: '🃏', href: '/taluo' },
      { key: 'jiemeng', emoji: '💤', href: '/jiemeng' },
    ],
  },
  {
    label: '自我与数理',
    items: [
      { key: 'xingming', emoji: '📝', href: '/xingming' },
      { key: 'astro', emoji: '🪐', href: '/astro' },
      { key: 'numerology', emoji: '✨', href: '/numerology' },
      { key: 'shuma', emoji: '🔢', href: '/shuma' },
      { key: 'chenggu', emoji: '⚖️', href: '/chenggu' },
      { key: 'fengshui', emoji: '🧭', href: '/fengshui' },
    ],
  },
  {
    label: '文化与择日',
    items: [
      { key: 'huangli', emoji: '📅', href: '/huangli' },
      { key: 'shengxiao', emoji: '🐉', href: '/shengxiao' },
      { key: 'wenku', emoji: '📚', href: '/wenku' },
      { key: 'experts', emoji: '👨‍🏫', href: '/experts' },
    ],
  },
]

export default function ToolsPage() {
  const getT = useT()

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <Breadcrumb items={[{ label: getT('nav.home'), href: '/' }, { label: '排盘推演' }]} />

      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gold-600 font-serif mb-3">排盘推演</h1>
        <p className="text-sm text-gray-500 max-w-2xl mx-auto">
          三大命理体系为主引擎，辅以场景化即时工具。所有排盘免费，无需注册，30 秒出盘 + AI 白话解读。
        </p>
      </div>

      {/* 三大主引擎 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        {mainEngines.map(m => (
          <Link key={m.key} href={m.href}
            className="group rounded-2xl border border-gold-500/30 bg-gradient-to-b from-dark-800/90 to-dark-900/70 p-6 hover:border-violet-400/60 hover:shadow-lg hover:shadow-violet-900/10 transition-all duration-200">
            <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-200">{m.emoji}</div>
            <h2 className="text-lg font-semibold text-gold-300 font-serif mb-1 group-hover:text-violet-300 transition-colors">
              {getT(`modules.${m.key}.name`)}
            </h2>
            <p className="text-xs text-gray-400 mb-3">{m.tag}</p>
            <p className="text-[10px] text-gray-500">古籍依据：{getT(`modules.${m.key}.source`)}</p>
            <span className="inline-block mt-4 text-xs font-medium text-gold-500 group-hover:text-gold-400">
              免费排盘 →
            </span>
          </Link>
        ))}
      </div>

      {/* 分组工具 */}
      {toolGroups.map(g => (
        <section key={g.label} className="mb-8">
          <h2 className="text-sm font-semibold text-gold-600/90 font-serif mb-3">{g.label}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {g.items.map(it => (
              <Link key={it.href} href={it.href}
                className="group flex items-center gap-3 rounded-xl border border-dark-600/50 bg-dark-800/50 p-3.5 hover:border-jade-400/50 transition-all duration-200">
                <span className="text-xl">{it.emoji}</span>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-200 group-hover:text-jade-400 transition-colors">{getT(`modules.${it.key}.name`)}</p>
                  <p className="text-[10px] text-gray-500 truncate">{getT(`modules.${it.key}.desc`)}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ))}

      <p className="text-center text-[10px] text-gray-600 mt-6">
        解梦 7,749 词条 · 姓名 2,808 字详解 · 古籍 135 部全文 —— 传统命理模型仅供文化研究与决策参考
      </p>
    </div>
  )
}
