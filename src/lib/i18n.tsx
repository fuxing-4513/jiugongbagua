'use client'

import React, { createContext, useContext, useState, useCallback } from 'react'
import { zhCN, type Locale as LocaleCN } from './locales/zh-CN'
import { zhTW, type Locale as LocaleTW } from './locales/zh-TW'
import { en, type Locale as LocaleEN } from './locales/en'

export type SupportedLocale = 'zh-CN' | 'zh-TW' | 'en'

const locales: Record<SupportedLocale, LocaleCN | LocaleTW | LocaleEN> = {
  'zh-CN': zhCN,
  'zh-TW': zhTW,
  'en': en,
}

type LocaleType = LocaleCN | LocaleTW | LocaleEN

interface LocaleContextType {
  locale: SupportedLocale
  t: LocaleType
  setLocale: (locale: SupportedLocale) => void
  localeNames: Record<SupportedLocale, string>
}

const LocaleContext = createContext<LocaleContextType | null>(null)

const localeNames: Record<SupportedLocale, string> = {
  'zh-CN': '简体中文',
  'zh-TW': '繁體中文',
  'en': 'English',
}

const LOCALE_KEY = 'jiugong-locale'

/** 从 URL ?lang= 参数读取语言（供 hreflang 链接落地时生效） */
function getLocaleFromUrl(): SupportedLocale | null {
  if (typeof window === 'undefined') return null
  try {
    const v = new URLSearchParams(window.location.search).get('lang')
    if (v === 'zh-CN' || v === 'zh-TW' || v === 'en') return v
  } catch {}
  return null
}

function getStoredLocale(): SupportedLocale {
  if (typeof window === 'undefined') return 'zh-CN'
  try {
    const v = localStorage.getItem(LOCALE_KEY)
    if (v === 'zh-CN' || v === 'zh-TW' || v === 'en') return v
  } catch {}
  return 'zh-CN'
}

/** 初始语言：URL 参数优先于 localStorage */
function getInitialLocale(): SupportedLocale {
  return getLocaleFromUrl() ?? getStoredLocale()
}

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<SupportedLocale>(getInitialLocale)

  const setLocale = useCallback((newLocale: SupportedLocale) => {
    setLocaleState(newLocale)
    try { localStorage.setItem(LOCALE_KEY, newLocale) } catch {}
  }, [])

  const t = locales[locale] as LocaleType

  return (
    <LocaleContext.Provider value={{ locale, t, setLocale, localeNames }}>
      {children}
    </LocaleContext.Provider>
  )
}

export function useLocale(): LocaleContextType {
  const context = useContext(LocaleContext)
  if (!context) {
    throw new Error('useLocale must be used within a LocaleProvider')
  }
  return context
}

// Helper function to get nested property by dot-separated path
export function t(key: string, locale: LocaleType): string {
  const keys = key.split('.')
  let value: unknown = locale
  for (const k of keys) {
    if (typeof value !== 'object' || value === null) return key
    value = (value as Record<string, unknown>)[k]
  }
  return typeof value === 'string' ? value : key
}

// Hook: returns a getT(key) function bound to current locale
// Replaces duplicated inline getT across components
export function useT() {
  const { t: locale } = useLocale()
  return useCallback((key: string): string => t(key, locale), [locale])
}

// Hook: returns a getTArray(key) function for array-valued locale keys
export function useTArray() {
  const { t: locale } = useLocale()
  return useCallback((key: string): unknown[] => {
    const keys = key.split('.')
    let value: unknown = locale
    for (const k of keys) {
      if (typeof value !== 'object' || value === null) return []
      value = (value as Record<string, unknown>)[k]
    }
    return Array.isArray(value) ? value : []
  }, [locale])
}
