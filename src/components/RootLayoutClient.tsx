'use client'

import { LocaleProvider, useLocale } from '@/lib/i18n'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import ErrorBoundary from '@/components/ErrorBoundary'

function RootInner({ children }: { children: React.ReactNode }) {
  const { locale } = useLocale()
  return (
    <html lang={locale === 'en' ? 'en' : locale === 'zh-TW' ? 'zh-Hant' : 'zh-Hans'} suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta
          httpEquiv="Content-Security-Policy"
          content={
            "default-src 'self'; " +
            "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com; " +
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
            "font-src 'self' https://fonts.gstatic.com; " +
            "img-src 'self' data: blob: https:; " +
            "connect-src 'self' https://www.google-analytics.com; " +
            "frame-ancestors 'none'; " +
            "base-uri 'self'; " +
            "form-action 'self'"
          }
        />
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        <meta httpEquiv="X-Frame-Options" content="DENY" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/favicon.svg" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="preconnect" href="https://fonts.gstatic.com" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([
              {
                '@context': 'https://schema.org',
                '@type': 'WebSite',
                name: '九宫八卦',
                url: 'https://jiugongbagua.com',
                description: '中国传统命理文化平台',
                inLanguage: ['zh-CN', 'zh-TW', 'en'],
                potentialAction: {
                  '@type': 'SearchAction',
                  target: {
                    '@type': 'EntryPoint',
                    urlTemplate: 'https://jiugongbagua.com/wenku?q={search_term_string}',
                  },
                  'query-input': 'required name=search_term_string',
                },
              },
              {
                '@context': 'https://schema.org',
                '@type': 'WebApplication',
                name: '九宫八卦命理测算平台',
                url: 'https://jiugongbagua.com',
                description: '九宫八卦是中国传统命理文化平台，提供八字算命、紫微斗数、六爻占卜、小六壬、周公解梦、姓名测试、号码测吉凶、黄历择日、塔罗占卜、测字等在线服务。',
                applicationCategory: 'LifestyleApplication',
                operatingSystem: 'All',
              },
              {
                '@context': 'https://schema.org',
                '@type': 'BreadcrumbList',
                itemListElement: [
                  { '@type': 'ListItem', position: 1, name: '首页', item: 'https://jiugongbagua.com' },
                ],
              },
            ]),
          }}
        />
      </head>
      <body className="min-h-screen flex flex-col">
        <div className="cosmic-overlay" aria-hidden="true" />
        <ErrorBoundary>
          <Nav />
          <main className="flex-1 pt-16">
            {children}
          </main>
          <Footer />
        </ErrorBoundary>
      </body>
    </html>
  )
}

export default function RootLayoutClient({ children }: { children: React.ReactNode }) {
  return (
    <LocaleProvider>
      <RootInner>{children}</RootInner>
    </LocaleProvider>
  )
}
