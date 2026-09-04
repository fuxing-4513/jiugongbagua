'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useLocale, useT, useTArray, type SupportedLocale } from '@/lib/i18n'
import { api } from '@/lib/api'

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
  const [night, setNight] = useState(false)
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null)
  const getT = useT()

  // 同步当前主题状态
  useEffect(() => {
    setNight(document.documentElement.getAttribute('data-theme') === 'night')
  }, [])

  // 登录态检查
  useEffect(() => {
    api.me().then(r => setLoggedIn(!!r.ok)).catch(() => setLoggedIn(false))
  }, [])

  const toggleTheme = () => {
    const next = !night
    setNight(next)
    if (next) document.documentElement.setAttribute('data-theme', 'night')
    else document.documentElement.removeAttribute('data-theme')
    try { localStorage.setItem('jiugong-theme', next ? 'night' : 'light') } catch {}
  }

  const handleLangChange = (lang: SupportedLocale) => {
    // 繁体 → 简体：整页刷新（SSR 输出简体，避免 DOM 残留繁体转换结果）
    if (locale === 'zh-TW' && lang === 'zh-CN') {
      try {
        localStorage.setItem('jiugong-locale', 'zh-CN')
        const url = new URL(window.location.href)
        url.searchParams.delete('lang')
        window.history.replaceState(null, '', url.toString())
      } catch {}
      setLangOpen(false)
      window.location.reload()
      return
    }
    setLocale(lang)
    // 同步 ?lang= 到地址栏，与 hreflang 备用链接保持一致（可分享、可被搜索引擎收录）
    try {
      const url = new URL(window.location.href)
      if (lang === 'zh-CN') url.searchParams.delete('lang')
      else url.searchParams.set('lang', lang)
      window.history.replaceState(null, '', url.toString())
    } catch {}
    setLangOpen(false)
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-panel shadow-sm">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 flex-shrink-0">
          <span className="text-2xl">☯</span>
          <span className="text-xl font-bold text-gold-500 font-serif">
            {getT('site.name')}
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-4">
          <Link href="/" className="text-sm text-gray-600 hover:text-jade-500 transition-colors whitespace-nowrap">
            {getT('nav.home')}
          </Link>

          <Link href="/tools" className="text-sm text-gray-600 hover:text-jade-500 transition-colors whitespace-nowrap">排盘推演</Link>
          <Link href="/huangli" className="text-sm text-gray-600 hover:text-jade-500 transition-colors whitespace-nowrap">每日宜忌</Link>
          <Link href="/xueguan" className="text-sm text-gray-600 hover:text-jade-500 transition-colors whitespace-nowrap">古籍书馆</Link>

          {/* 全部工具 Dropdown */}
          <div className="relative">
            <button
              onClick={() => setToolsOpen(!toolsOpen)}
              className="text-sm text-gray-600 hover:text-jade-500 transition-colors flex items-center gap-1 whitespace-nowrap"
              aria-label="全部工具"
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
                <div className="absolute top-full right-0 mt-2 w-64 bg-white border border-gray-200 rounded-xl shadow-lg py-3 z-20 max-h-96 overflow-y-auto">
                  {toolCategories.map((cat, ci) => (
                    <div key={ci}>
                      {ci > 0 && <div className="mx-3 my-1 border-t border-gray-100" />}
                      <p className="px-4 pb-1 text-[10px] text-gray-500 font-medium uppercase tracking-wider">{cat.label}</p>
                      {cat.items.map((mod) => (
                        <Link key={mod.href} href={mod.href}
                          className="flex items-center gap-2 px-4 py-1.5 text-sm text-gray-600 hover:bg-gray-100 hover:text-jade-500 transition-colors"
                          onClick={() => setToolsOpen(false)}
                        >
                          <span className="text-xs">{mod.emoji||''}</span>
                          <span>{getT(mod.key)}</span>
                        </Link>
                      ))}
                    </div>
                  ))}
                  <div className="mx-3 my-1 border-t border-gray-100" />
                  <Link href="/tools" className="flex items-center gap-2 px-4 py-1.5 text-sm text-gold-600 hover:bg-gold-50 transition-colors" onClick={() => setToolsOpen(false)}>
                    ✨ 排盘推演总览
                  </Link>
                </div>
              </>
            )}
          </div>

          <Link href="/app" className="text-sm text-gold-600 hover:text-gold-500 transition-colors font-medium whitespace-nowrap">{getT('nav.app')}</Link>
          {loggedIn === null ? (
            <span className="text-sm text-gray-400 whitespace-nowrap">…</span>
          ) : loggedIn ? (
            <Link href="/mycharts" className="text-sm text-gray-600 dark:text-gray-300 hover:text-jade-500 transition-colors whitespace-nowrap" title="我的命盘">📁 我的命盘</Link>
          ) : (
            <Link href="/login" className="text-sm text-gray-600 dark:text-gray-300 hover:text-jade-500 transition-colors whitespace-nowrap">登录</Link>
          )}

          {/* 主题切换（夜/昼） */}
          <button
            onClick={toggleTheme}
            className="text-sm text-gray-600 hover:text-jade-500 transition-colors flex items-center gap-1 border border-gray-300 dark:border-gray-600 rounded px-2.5 py-1"
            aria-label={night ? '切换到白天模式' : '切换到夜晚模式'}
            title={night ? '点击切换为白天（昼）' : '点击切换为夜晚（夜）'}
          >
            {night ? '昼' : '夜'}
          </button>

          {/* Language */}
          <div className="relative">
            <button
              onClick={() => setLangOpen(!langOpen)}
              className="text-sm text-gray-600 hover:text-jade-500 transition-colors flex items-center gap-1 border border-gray-300 rounded px-2 py-1"
              aria-label="切换语言"
              aria-expanded={langOpen}
            >
              🌐 {localeNames[locale]}
            </button>
            {langOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setLangOpen(false)} />
                <div className="absolute top-full right-0 mt-2 w-36 bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-20">
                  {(Object.entries(localeNames) as [SupportedLocale, string][]).map(([key, name]) => (
                    <button key={key} onClick={() => handleLangChange(key)}
                      aria-label={`切换至${name}`}
                      className={`block w-full text-left px-4 py-2 text-sm transition-colors ${locale === key ? 'bg-jade-50 text-jade-600 font-medium' : 'text-gray-600 hover:bg-gray-100 hover:text-jade-500'}`}
                    >{name}</button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* 移动端快捷：语言 + 夜昼（与 PC 端对齐） */}
        <div className="lg:hidden flex items-center gap-1.5 mr-1">
          <button
            onClick={() => handleLangChange(locale === 'zh-CN' ? 'zh-TW' : 'zh-CN')}
            className="text-xs px-2 py-1 rounded-lg border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-jade-300 transition-colors"
            aria-label="切换简繁"
          >
            {locale === 'zh-CN' ? '繁' : '简'}
          </button>
          <button
            onClick={toggleTheme}
            className="text-xs px-2 py-1 rounded-lg border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-violet-300 transition-colors"
            aria-label="切换昼夜"
          >
            {night ? '昼' : '夜'}
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button className="lg:hidden flex items-center justify-center w-10 h-10 text-gray-600 hover:text-jade-500 active:scale-95 transition-transform" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Toggle menu">
          {mobileMenuOpen ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          )}
        </button>
      </div>

      {/* 移动端常驻导航条（关键入口直接可见，无需展开菜单） */}
      <nav className="lg:hidden border-t border-gray-100 dark:border-gray-800 bg-white/90 dark:bg-[#101318]/90 backdrop-blur-sm">
        <div className="flex overflow-x-auto no-scrollbar gap-1 px-3 py-2">
          {(useTArray()('home.mobileNav') as { label: string }[]).map((n, i) => {
            const hrefs = ['/', '/tools', '/huangli', '/ai', '/xueguan', '/app']
            return (
              <Link key={i} href={hrefs[i] || '/'} onClick={() => setMobileMenuOpen(false)}
                className="shrink-0 px-3 py-1.5 rounded-full text-xs text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700 hover:border-violet-300 dark:hover:border-violet-500/50 hover:text-violet-600 dark:hover:text-violet-300 transition-colors whitespace-nowrap">
                {n.label}
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-gray-200 bg-white">
          <div className="px-4 py-3 space-y-2">
            <div className="flex items-center justify-between">
              <Link href="/" className="block py-2 text-sm text-gray-600 hover:text-jade-500" onClick={() => setMobileMenuOpen(false)}>{getT('nav.home')}</Link>
              <button onClick={toggleTheme} className="text-sm px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800" aria-label="切换主题">{night ? '昼' : '夜'}</button>
            </div>
            <Link href="/tools" className="block py-2 text-sm text-gray-600 hover:text-jade-500" onClick={() => setMobileMenuOpen(false)}>排盘推演</Link>
            <Link href="/huangli" className="block py-2 text-sm text-gray-600 hover:text-jade-500" onClick={() => setMobileMenuOpen(false)}>每日宜忌</Link>
            <Link href="/xueguan" className="block py-2 text-sm text-gray-600 hover:text-jade-500" onClick={() => setMobileMenuOpen(false)}>古籍书馆</Link>
            <div className="py-2">
              <p className="text-xs text-gray-500 mb-1">{getT('nav.tools')}</p>
              {toolCategories.map((cat, ci) => (
                <div key={ci} className="mb-2">
                  <p className="text-[10px] text-gray-400 px-1 mb-0.5">{cat.label}</p>
                  <div className="grid grid-cols-2 gap-0.5">
                    {cat.items.map((mod) => (
                      <Link key={mod.href} href={mod.href} className="flex items-center gap-1 py-1 px-1 text-sm text-gray-500 hover:text-jade-500 rounded" onClick={() => setMobileMenuOpen(false)}>
                        <span className="text-xs">{mod.emoji||''}</span>
                        <span>{getT(mod.key)}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <Link href="/app" className="block py-2 text-sm text-gold-600 hover:text-gold-500 font-medium" onClick={() => setMobileMenuOpen(false)}>{getT('nav.app')}</Link>
            {loggedIn ? (
              <Link href="/mycharts" className="block py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-jade-500" onClick={() => setMobileMenuOpen(false)}>📁 我的命盘</Link>
            ) : (
              <Link href="/login" className="block py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-jade-500" onClick={() => setMobileMenuOpen(false)}>登录</Link>
            )}
            <Link href="/help" className="block py-2 text-sm text-gray-500 hover:text-jade-500" onClick={() => setMobileMenuOpen(false)}>{getT('nav.help')}</Link>
            <Link href="/contact" className="block py-2 text-sm text-gray-500 hover:text-jade-500" onClick={() => setMobileMenuOpen(false)}>{getT('nav.contact')}</Link>
            <div className="pt-2 border-t border-gray-200">
              <p className="text-xs text-gray-500 mb-1">{getT('nav.language')}</p>
              <div className="flex gap-2">
                {(Object.entries(localeNames) as [SupportedLocale, string][]).map(([key, name]) => (
                  <button key={key} onClick={() => { handleLangChange(key); setMobileMenuOpen(false) }}
                    className={`text-sm px-2 py-1 rounded ${locale === key ? 'bg-jade-50 text-jade-600' : 'text-gray-500 hover:text-jade-500'}`}
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
