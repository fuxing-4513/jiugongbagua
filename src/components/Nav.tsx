'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useLocale, useT, type SupportedLocale } from '@/lib/i18n'

const toolCategories: { label: string; items: { key: string; href: string; emoji?: string }[] }[] = [
  { label: '命理推算', items: [
    { key: 'modules.bazi.name', href: '/bazi', emoji: '📜' },
    { key: 'modules.ziwei.name', href: '/ziwei', emoji: '⭐' },
    { key: 'modules.zonghe.name', href: '/zonghe-zhengming', emoji: '🔗' },
    { key: 'modules.liuyao.name', href: '/liuyao', emoji: '📊' },
    { key: 'modules.xiaoliuren.name', href: '/xiaoliuren', emoji: '🔢' },
    { key: 'modules.chenggu.name', href: '/chenggu', emoji: '⚖️' },
    { key: 'modules.meihua.name', href: '/meihua', emoji: '🌸' },
    { key: 'modules.qimen.name', href: '/qimen', emoji: '🧭' },
  ]},
  { label: '生活测算', items: [
    { key: 'modules.jiemeng.name', href: '/jiemeng', emoji: '💤' },
    { key: 'modules.xingming.name', href: '/xingming', emoji: '📛' },
    { key: 'modules.shuma.name', href: '/shuma', emoji: '🔢' },
    { key: 'modules.taluo.name', href: '/taluo', emoji: '🃏' },
    { key: 'modules.taluoCards.name', href: '/taluo/cards' },
    { key: 'modules.lingqian.name', href: '/lingqian', emoji: '🏮' },
  ]},
  { label: '知识文化', items: [
    { key: 'modules.huangli.name', href: '/huangli', emoji: '📅' },
    { key: 'modules.shengxiao.name', href: '/shengxiao', emoji: '🐯' },
    { key: 'modules.xingzuo.name', href: '/xingzuo', emoji: '✨' },
    { key: 'modules.fengshui.name', href: '/fengshui', emoji: '🏠' },
  ]},
]

export default function Nav() {
  const { locale, setLocale, localeNames } = useLocale()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [toolsOpen, setToolsOpen] = useState(false)
  const [langOpen, setLangOpen] = useState(false)
  const getT = useT()

  const handleLangChange = (lang: SupportedLocale) => {
    setLocale(lang)
    setLangOpen(false)
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-panel shadow-sm">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 flex-shrink-0">
          <span className="text-2xl">☯</span>
          <span className="text-xl font-bold text-gold-400 font-serif">
            {getT('site.name')}
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-5">
          <Link href="/" className="text-sm text-gray-300 hover:text-jade-400 transition-colors">
            {getT('nav.home')}
          </Link>

          {/* 核心模块直接平铺 */}
          <Link href="/bazi" className="text-sm text-gray-300 hover:text-jade-400 transition-colors">{getT('nav.bazi')}</Link>
          <Link href="/ziwei" className="text-sm text-gray-300 hover:text-jade-400 transition-colors">{getT('nav.ziwei')}</Link>
          <Link href="/liuyao" className="text-sm text-gray-300 hover:text-jade-400 transition-colors">{getT('nav.liuyao')}</Link>
          <Link href="/huangli" className="text-sm text-gray-300 hover:text-jade-400 transition-colors">{getT('nav.huangli')}</Link>

          {/* 更多工具 Dropdown */}
          <div className="relative">
            <button
              onClick={() => setToolsOpen(!toolsOpen)}
              className="text-sm text-gray-300 hover:text-jade-400 transition-colors flex items-center gap-1"
              aria-label="更多工具"
              aria-expanded={toolsOpen}
            >
              {getT('nav.tools')}
              <svg className={`w-3 h-3 transition-transform ${toolsOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {toolsOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setToolsOpen(false)} />
                <div className="absolute top-full right-0 mt-2 w-64 bg-dark-900 border border-dark-600 py-3 z-20 max-h-96 overflow-y-auto">
                  {toolCategories.map((cat, ci) => (
                    <div key={ci}>
                      {ci > 0 && <div className="mx-3 my-1 border-t border-dark-600" />}
                      <p className="px-4 pb-1 text-[10px] text-gray-500 font-medium uppercase tracking-wider">{cat.label}</p>
                      {cat.items.map((mod) => (
                        <Link key={mod.href} href={mod.href}
                          className="flex items-center gap-2 px-4 py-1.5 text-sm text-gray-300 hover:bg-dark-600 hover:text-jade-400 transition-colors"
                          onClick={() => setToolsOpen(false)}
                        >
                          <span className="text-xs">{mod.emoji||''}</span>
                          <span>{getT(mod.key)}</span>
                        </Link>
                      ))}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          <Link href="/wenku" className="text-sm text-gray-300 hover:text-jade-400 transition-colors">{getT('nav.wenku')}</Link>
          <Link href="/glossary" className="text-sm text-gray-300 hover:text-jade-400 transition-colors">{getT('nav.glossary')}</Link>
          <Link href="/app" className="text-sm text-gold-400 hover:text-gold-300 transition-colors font-medium">{getT('nav.app')}</Link>
          <Link href="/profile" className="text-sm text-gray-300 hover:text-jade-400 transition-colors" title="我的收藏">👤 我的</Link>

          {/* Language */}
          <div className="relative">
            <button
              onClick={() => setLangOpen(!langOpen)}
              className="text-sm text-gray-300 hover:text-jade-400 transition-colors flex items-center gap-1 border border-dark-600 rounded px-2 py-1"
              aria-label="切换语言"
              aria-expanded={langOpen}
            >
              🌐 {localeNames[locale]}
            </button>
            {langOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setLangOpen(false)} />
                <div className="absolute top-full right-0 mt-2 w-36 bg-dark-900 border border-dark-600 py-2 z-20">
                  {(Object.entries(localeNames) as [SupportedLocale, string][]).map(([key, name]) => (
                    <button key={key} onClick={() => handleLangChange(key)}
                      aria-label={`切换至${name}`}
                      className={`block w-full text-left px-4 py-2 text-sm transition-colors ${locale === key ? 'bg-dark-600 text-gold-400 font-medium' : 'text-gray-300 hover:bg-dark-600 hover:text-jade-400'}`}
                    >{name}</button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Mobile Menu Button - 增大触摸区域 */}
        <button className="lg:hidden flex items-center justify-center w-10 h-10 text-gray-300 hover:text-jade-400 active:scale-95 transition-transform" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Toggle menu">
          {mobileMenuOpen ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-dark-600 bg-dark-900">
          <div className="px-4 py-3 space-y-2">
            <Link href="/" className="block py-2 text-sm text-gray-300 hover:text-jade-400" onClick={() => setMobileMenuOpen(false)}>{getT('nav.home')}</Link>
            <Link href="/bazi" className="block py-2 text-sm text-gray-300 hover:text-jade-400" onClick={() => setMobileMenuOpen(false)}>{getT('nav.bazi')}</Link>
            <Link href="/ziwei" className="block py-2 text-sm text-gray-300 hover:text-jade-400" onClick={() => setMobileMenuOpen(false)}>{getT('nav.ziwei')}</Link>
            <Link href="/liuyao" className="block py-2 text-sm text-gray-300 hover:text-jade-400" onClick={() => setMobileMenuOpen(false)}>{getT('nav.liuyao')}</Link>
            <Link href="/huangli" className="block py-2 text-sm text-gray-300 hover:text-jade-400" onClick={() => setMobileMenuOpen(false)}>{getT('nav.huangli')}</Link>
            <div className="py-2">
              <p className="text-xs text-gray-500 mb-1">{getT('nav.tools')}</p>
              {toolCategories.map((cat, ci) => (
                <div key={ci} className="mb-2">
                  <p className="text-[10px] text-gray-600 px-1 mb-0.5">{cat.label}</p>
                  <div className="grid grid-cols-2 gap-0.5">
                    {cat.items.map((mod) => (
                      <Link key={mod.href} href={mod.href} className="flex items-center gap-1 py-1 px-1 text-sm text-gray-400 hover:text-jade-400 rounded" onClick={() => setMobileMenuOpen(false)}>
                        <span className="text-xs">{mod.emoji||''}</span>
                        <span>{getT(mod.key)}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <Link href="/wenku" className="block py-2 text-sm text-gray-300 hover:text-jade-400" onClick={() => setMobileMenuOpen(false)}>{getT('nav.wenku')}</Link>
            <Link href="/glossary" className="block py-2 text-sm text-gray-300 hover:text-jade-400" onClick={() => setMobileMenuOpen(false)}>{getT('nav.glossary')}</Link>
            <Link href="/app" className="block py-2 text-sm text-gold-400 hover:text-gold-300 font-medium" onClick={() => setMobileMenuOpen(false)}>{getT('nav.app')}</Link>
            <Link href="/profile" className="block py-2 text-sm text-gray-300 hover:text-jade-400" onClick={() => setMobileMenuOpen(false)}>👤 我的收藏</Link>
            <Link href="/help" className="block py-2 text-sm text-gray-400 hover:text-jade-400" onClick={() => setMobileMenuOpen(false)}>{getT('nav.help')}</Link>
            <Link href="/contact" className="block py-2 text-sm text-gray-400 hover:text-jade-400" onClick={() => setMobileMenuOpen(false)}>{getT('nav.contact')}</Link>
            <div className="pt-2 border-t border-dark-600">
              <p className="text-xs text-gray-500 mb-1">{getT('nav.language')}</p>
              <div className="flex gap-2">
                {(Object.entries(localeNames) as [SupportedLocale, string][]).map(([key, name]) => (
                  <button key={key} onClick={() => { handleLangChange(key); setMobileMenuOpen(false) }}
                    className={`text-sm px-2 py-1 rounded ${locale === key ? 'bg-dark-600 text-gold-400' : 'text-gray-400 hover:text-jade-400'}`}
                  >{name}</button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
