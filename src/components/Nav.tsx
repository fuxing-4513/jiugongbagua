'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useLocale, type SupportedLocale } from '@/lib/i18n'

const toolModules: { key: string; href: string }[] = [
  { key: 'modules.bazi.name', href: '/bazi' },
  { key: 'modules.ziwei.name', href: '/ziwei' },
  { key: 'modules.liuyao.name', href: '/liuyao' },
  { key: 'modules.xiaoliuren.name', href: '/xiaoliuren' },
  { key: 'modules.jiemeng.name', href: '/jiemeng' },
  { key: 'modules.xingming.name', href: '/xingming' },
  { key: 'modules.shuma.name', href: '/shuma' },
  { key: 'modules.huangli.name', href: '/huangli' },
  { key: 'modules.taluo.name', href: '/taluo' },
  { key: 'modules.cezi.name', href: '/cezi' },
  { key: 'modules.chenggu.name', href: '/chenggu' },
  { key: 'modules.fengshui.name', href: '/fengshui' },
  { key: 'modules.lingqian.name', href: '/lingqian' },
  { key: 'modules.meihua.name', href: '/meihua' },
  { key: 'modules.qimen.name', href: '/qimen' },
  { key: 'modules.shengxiao.name', href: '/shengxiao' },
  { key: 'modules.xingzuo.name', href: '/xingzuo' },
]

export default function Nav() {
  const { locale, t, setLocale, localeNames } = useLocale()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [toolsOpen, setToolsOpen] = useState(false)
  const [langOpen, setLangOpen] = useState(false)

  const getT = (key: string) => {
    const keys = key.split('.')
    let value: unknown = t
    for (const k of keys) {
      if (typeof value !== 'object' || value === null) return key
      value = (value as Record<string, unknown>)[k]
    }
    return typeof value === 'string' ? value : key
  }

  const handleLangChange = (lang: SupportedLocale) => {
    setLocale(lang)
    setLangOpen(false)
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-dark-800/95 backdrop-blur border-b border-dark-600 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl">☯</span>
          <span className="text-xl font-bold text-gold-400 font-serif">
            {getT('site.name')}
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6">
          <Link
            href="/"
            className="text-sm text-gray-300 hover:text-gold-400 transition-colors"
          >
            {getT('nav.home')}
          </Link>

          {/* Tools Dropdown */}
          <div className="relative">
            <button
              onClick={() => setToolsOpen(!toolsOpen)}
              className="text-sm text-gray-300 hover:text-gold-400 transition-colors flex items-center gap-1"
            >
              {getT('nav.tools')}
              <svg className={`w-3 h-3 transition-transform ${toolsOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {toolsOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setToolsOpen(false)} />
                <div className="absolute top-full right-0 mt-2 w-48 bg-dark-700 rounded-lg shadow-lg border border-dark-600 py-2 z-20">
                  {toolModules.map((mod) => (
                    <Link
                      key={mod.href}
                      href={mod.href}
                      className="block px-4 py-2 text-sm text-gray-300 hover:bg-dark-600 hover:text-gold-400 transition-colors"
                      onClick={() => setToolsOpen(false)}
                    >
                      {getT(mod.key)}
                    </Link>
                  ))}
                </div>
              </>
            )}
          </div>

          <Link
            href="/wenku"
            className="text-sm text-gray-300 hover:text-gold-400 transition-colors"
          >
            {getT('nav.knowledge')}
          </Link>
          <Link
            href="/experts"
            className="text-sm text-gray-300 hover:text-gold-400 transition-colors"
          >
            {getT('nav.experts')}
          </Link>

          {/* Language Switcher */}
          <div className="relative">
            <button
              onClick={() => setLangOpen(!langOpen)}
              className="text-sm text-gray-300 hover:text-gold-400 transition-colors flex items-center gap-1 border border-dark-600 rounded px-2 py-1"
            >
              🌐 {localeNames[locale]}
              <svg className={`w-3 h-3 transition-transform ${langOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {langOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setLangOpen(false)} />
                <div className="absolute top-full right-0 mt-2 w-36 bg-dark-700 rounded-lg shadow-lg border border-dark-600 py-2 z-20">
                  {(Object.entries(localeNames) as [SupportedLocale, string][]).map(([key, name]) => (
                    <button
                      key={key}
                      onClick={() => handleLangChange(key)}
                      className={`block w-full text-left px-4 py-2 text-sm transition-colors ${
                        locale === key
                          ? 'bg-red-50 text-red-700 font-medium'
                          : 'text-gray-300 hover:bg-dark-600 hover:text-gold-400'
                      }`}
                    >
                      {name}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-gray-300"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-dark-600 bg-white">
          <div className="px-4 py-3 space-y-2">
            <Link
              href="/"
              className="block py-2 text-sm text-gray-300 hover:text-gold-400"
              onClick={() => setMobileMenuOpen(false)}
            >
              {getT('nav.home')}
            </Link>
            <div className="py-2">
              <p className="text-xs text-gray-400 mb-1">{getT('nav.tools')}</p>
              <div className="grid grid-cols-2 gap-1">
                {toolModules.map((mod) => (
                  <Link
                    key={mod.href}
                    href={mod.href}
                    className="block py-1.5 text-sm text-gray-600 hover:text-gold-400"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {getT(mod.key)}
                  </Link>
                ))}
              </div>
            </div>
            <Link
              href="/wenku"
              className="block py-2 text-sm text-gray-300 hover:text-gold-400"
              onClick={() => setMobileMenuOpen(false)}
            >
              {getT('nav.knowledge')}
            </Link>
            <Link
              href="/experts"
              className="block py-2 text-sm text-gray-300 hover:text-gold-400"
              onClick={() => setMobileMenuOpen(false)}
            >
              {getT('nav.experts')}
            </Link>
            <div className="pt-2 border-t border-gray-100">
              <p className="text-xs text-gray-400 mb-1">{getT('nav.language')}</p>
              <div className="flex gap-2">
                {(Object.entries(localeNames) as [SupportedLocale, string][]).map(([key, name]) => (
                  <button
                    key={key}
                    onClick={() => {
                      handleLangChange(key)
                      setMobileMenuOpen(false)
                    }}
                    className={`text-sm px-2 py-1 rounded ${
                      locale === key
                        ? 'bg-red-100 text-red-700'
                        : 'text-gray-600 hover:text-gold-400'
                    }`}
                  >
                    {name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
