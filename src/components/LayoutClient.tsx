'use client'

import { useEffect } from 'react'
import { LocaleProvider, useLocale } from '@/lib/i18n'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import ErrorBoundary from '@/components/ErrorBoundary'
import TopLoadingBar from '@/components/TopLoadingBar'
import FloatingExpertButton from '@/components/FloatingExpertButton'

function LayoutInner({ children }: { children: React.ReactNode }) {
  const { locale } = useLocale()

  // 动态同步 html lang 属性
  useEffect(() => {
    const lang = locale === 'zh-TW' ? 'zh-Hant' : 'zh-Hans'
    document.documentElement.lang = lang
  }, [locale])

  return (
    <>
      <div className="cosmic-overlay" aria-hidden="true" />
      <TopLoadingBar />
      <ErrorBoundary>
        <Nav />
        <FloatingExpertButton />
        <main className="flex-1 pt-16">
          {children}
        </main>
        <Footer />
      </ErrorBoundary>
    </>
  )
}

export default function LayoutClient({ children }: { children: React.ReactNode }) {
  return (
    <LocaleProvider>
      <LayoutInner>{children}</LayoutInner>
    </LocaleProvider>
  )
}
