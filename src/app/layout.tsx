import type { Metadata } from 'next'
import { LocaleProvider } from '@/lib/i18n'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import './globals.css'

export const metadata: Metadata = {
  title: '九宫八卦 - 中国传统命理文化平台',
  description: '九宫八卦是中国传统命理文化平台，提供八字算命、紫微斗数、六爻占卜、小六壬、周公解梦、姓名测试、号码测吉凶、黄历择日、塔罗占卜、测字等在线服务。',
  keywords: '九宫八卦,八字算命,紫微斗数,六爻占卜,小六壬,周公解梦,姓名测试,号码测吉凶,黄历,塔罗占卜,测字,命理,易经,传统文化',
  openGraph: {
    title: '九宫八卦 - 中国传统命理文化平台',
    description: '传承经典 · 智慧起航。八字算命、紫微斗数、六爻占卜等多种传统命理服务。',
    type: 'website',
    locale: 'zh_CN',
    siteName: '九宫八卦',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.gstatic.com" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: '九宫八卦',
              url: 'https://jiugongbagua.com',
              description: '中国传统命理文化平台',
              inLanguage: ['zh-CN', 'zh-TW', 'en'],
            }),
          }}
        />
      </head>
      <body className="min-h-screen flex flex-col bg-gradient-to-b from-red-50 to-white">
        <LocaleProvider>
          <Nav />
          <main className="flex-1 pt-16">
            {children}
          </main>
          <Footer />
        </LocaleProvider>
      </body>
    </html>
  )
}
