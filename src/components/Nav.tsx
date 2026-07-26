'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useLocale, useT, type SupportedLocale } from '@/lib/i18n'
import ThemeToggle from '@/components/ThemeToggle'

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
    { key: 'modules.huangli.name', href: '/huangli', emoji: '📅' },
    { key: 'modules.jiemeng.name', href: '/jiemeng', emoji: '💤' },
    { key: 'modules.xingming.name', href: '/xingming', emoji: '📛' },
    { key: 'modules.shuma.name', href: '/shuma', emoji: '🔢' },
    { key: 'modules.taluo.name', href: '/taluo', emoji: '🃏' },
    { key: 'modules.lingqian.name', href: '/lingqian', emoji: '🏮' },
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
        <Link href="/" className="flex items-center gap-2 flex-shrink-0 group">
          <span className="text-2xl transition-transform group-hover:scale-110 duration-300">☯</span>
          <span className="text-xl font-bold text-gold-500 font-serif">
            {getT('site.name')}
          </span>
        </Link>

        {/* Desktop Nav — 精简 */}
        <div className="hidden lg:flex items-center gap-1">
          <NavLink href="/">{getT('nav.home')}</NavLink>

          {/* 测算工具 Dropdown（合并八字/斗数/六爻/黄历等全部） */}
          <div className="relative">
            <button
              onClick={() => setToolsOpen(!toolsOpen)}
              className="flex items-center gap-1 px-3 py-2 text-sm text-gray-600 hover:text-jade-500 rounded-lg hover:bg-black/[0.03] transition-all"
              aria-expanded={toolsOpen}
            >
              <span>测算工具</span>
              <svg className={`w-3 h-3 transition-transform duration-200 ${toolsOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {toolsOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setToolsOpen(false)} />
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[480px] bg-white border border-gray-200 rounded-2xl shadow-xl py-4 px-2 z-20">
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <p className="px-3 pb-1 text-[11px] text-gray-400 font-medium tracking-wider">命理推算</p>
                      {toolCategories[0].items.map((mod) => (
                        <Link key={mod.href} href={mod.href}
                          className="flex items-center gap-2.5 px-3 py-2 text-sm text-gray-600 hover:bg-black/[0.03] hover:text-jade-500 rounded-lg transition-all"
                          onClick={() => setToolsOpen(false)}
                        >
                          <span className="text-base w-5 text-center">{mod.emoji||''}</span>
                          <span>{getT(mod.key)}</span>
                        </Link>
                      ))}
                    </div>
                    <div className="w-px bg-gray-100 self-stretch my-1" />
                    <div className="flex-1">
                      <p className="px-3 pb-1 text-[11px] text-gray-400 font-medium tracking-wider">生活测算</p>
                      {toolCategories[1].items.map((mod) => (
                        <Link key={mod.href} href={mod.href}
                          className="flex items-center gap-2.5 px-3 py-2 text-sm text-gray-600 hover:bg-black/[0.03] hover:text-jade-500 rounded-lg transition-all"
                          onClick={() => setToolsOpen(false)}
                        >
                          <span className="text-base w-5 text-center">{mod.emoji||''}</span>
                          <span>{getT(mod.key)}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* 文库（易学书馆 + 文章库 + 词表） */}
          <NavLink href="/xueguan">易学书馆</NavLink>
          <NavLink href="/wenku">文库</NavLink>

          {/* 右侧：主题切换 + 语言 */}
          <div className="flex items-center gap-2 ml-3 pl-3 border-l border-gray-200">
            <ThemeToggle />
            <div className="relative">
              <button
                onClick={() => setLangOpen(!langOpen)}
                className="text-xs text-gray-400 hover:text-gray-600 transition-colors px-2 py-1 rounded hover:bg-black/[0.03]"
                aria-label="切换语言"
                aria-expanded={langOpen}
              >
                {localeNames[locale]}
              </button>
              {langOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setLangOpen(false)} />
                  <div className="absolute top-full right-0 mt-2 w-28 bg-white border border-gray-200 rounded-xl shadow-lg py-1.5 z-20">
                    {(Object.entries(localeNames) as [SupportedLocale, string][]).map(([key, name]) => (
                      <button key={key} onClick={() => handleLangChange(key)}
                        className={`block w-full text-left px-4 py-1.5 text-sm transition-colors ${locale === key ? 'bg-jade-50 text-jade-600 font-medium' : 'text-gray-500 hover:bg-gray-50 hover:text-jade-500'}`}
                      >{name}</button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
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

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-gray-200 bg-white">
          <div className="px-4 py-3 space-y-1">
            <MobileLink href="/" onClick={() => setMobileMenuOpen(false)}>{getT('nav.home')}</MobileLink>
            <div className="py-1">
              <p className="text-xs text-gray-400 mb-1 px-1">命理推算</p>
              <div className="grid grid-cols-2 gap-0.5">
                {toolCategories[0].items.map((mod) => (
                  <MobileLink key={mod.href} href={mod.href} onClick={() => setMobileMenuOpen(false)} emoji={mod.emoji}>
                    {getT(mod.key)}
                  </MobileLink>
                ))}
              </div>
            </div>
            <div className="py-1">
              <p className="text-xs text-gray-400 mb-1 px-1">生活测算</p>
              <div className="grid grid-cols-2 gap-0.5">
                {toolCategories[1].items.map((mod) => (
                  <MobileLink key={mod.href} href={mod.href} onClick={() => setMobileMenuOpen(false)} emoji={mod.emoji}>
                    {getT(mod.key)}
                  </MobileLink>
                ))}
              </div>
            </div>
            <MobileLink href="/xueguan" onClick={() => setMobileMenuOpen(false)}>易学书馆</MobileLink>
            <MobileLink href="/wenku" onClick={() => setMobileMenuOpen(false)}>文库</MobileLink>
            <div className="pt-3 mt-2 border-t border-gray-100 flex items-center justify-between">
              <ThemeToggle />
              <div className="flex gap-2">
                {(Object.entries(localeNames) as [SupportedLocale, string][]).map(([key, name]) => (
                  <button key={key} onClick={() => { handleLangChange(key); setMobileMenuOpen(false) }}
                    className={`text-xs px-2 py-1 rounded ${locale === key ? 'bg-jade-50 text-jade-600' : 'text-gray-400 hover:text-jade-500'}`}
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

/* ——— 子组件 ——— */

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="px-3 py-2 text-sm text-gray-600 hover:text-jade-500 rounded-lg hover:bg-black/[0.03] transition-all">
      {children}
    </Link>
  )
}

function MobileLink({ href, onClick, emoji, children }: { href: string; onClick: () => void; emoji?: string; children: React.ReactNode }) {
  return (
    <Link href={href} onClick={onClick} className="flex items-center gap-2 px-2 py-1.5 text-sm text-gray-600 hover:text-jade-500 rounded-lg hover:bg-gray-50 transition-all">
      {emoji && <span className="text-xs">{emoji}</span>}
      <span>{children}</span>
    </Link>
  )
}
