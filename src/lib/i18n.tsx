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

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<SupportedLocale>('zh-CN')

  const setLocale = useCallback((newLocale: SupportedLocale) => {
    setLocaleState(newLocale)
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
