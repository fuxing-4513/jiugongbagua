import type { Metadata } from 'next'
import LayoutClient from '@/components/LayoutClient'
import './globals.css'

const baseUrl = 'https://jiugongbagua.com'
const baseDescription = '九宫八卦是中国传统命理文化平台，提供八字排盘、紫微斗数、六爻、小六壬、周公解梦、姓名测试、号码测吉凶、黄历择日、塔罗等在线服务。'

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: '九宫八卦 - 中国传统命理文化平台',
    template: '%s | 九宫八卦',
  },
  description: baseDescription,
  keywords: ['九宫八卦','八字排盘','紫微斗数','六爻','小六壬','周公解梦','姓名测试','号码测吉凶','黄历','塔罗','命理','易经','梅花易数','合婚','传统文化','奇门遁甲','八字合婚免费','紫微斗数排盘详解','六爻在线占卜','周易64卦详解','免费在线算命','解梦大全'],
  authors: [{ name: '九宫八卦' }],
  creator: '九宫八卦',
  publisher: '九宫八卦',
  openGraph: {
    title: '九宫八卦 - 传统命理在线测算平台',
    description: '传承经典 · 智慧启航。八字排盘、紫微斗数、六爻、梅花易数、小六壬等二十余种传统命理服务。',
    type: 'website',
    locale: 'zh_CN',
    siteName: '九宫八卦',
    url: baseUrl,
  },
  twitter: {
    card: 'summary',
    title: '九宫八卦 - 中国传统命理文化平台',
    description: baseDescription,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-Hans" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {/* 安全策略 */}
        <meta
          httpEquiv="Content-Security-Policy"
          content={
            "default-src 'self'; " +
            "script-src 'self' 'unsafe-inline' https://hm.baidu.com https://*.baidu.com https://www.googletagmanager.com; " +
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
            "font-src 'self' https://fonts.gstatic.com; " +
            "img-src 'self' data: blob: https:; " +
            "connect-src 'self' https://aisage-api.4513.workers.dev https://api.deepseek.com https://hm.baidu.com https://*.baidu.com https://www.google-analytics.com; " +
            "frame-src 'self'; " +
            "frame-ancestors 'none'; " +
            "base-uri 'self'; " +
            "form-action 'self'; " +
            "object-src 'none'; " +
            "media-src 'self'; " +
            "block-all-mixed-content; " +
            "upgrade-insecure-requests"
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
                '@type': 'Organization',
                '@id': `${baseUrl}/#organization`,
                name: '九宫八卦',
                url: baseUrl,
                logo: `${baseUrl}/favicon.svg`,
                description: '中国传统命理文化平台',
                foundingDate: '2024',
                contactPoint: {
                  '@type': 'ContactPoint',
                  contactType: 'customer service',
                  email: 'contact@jiugongbagua.com',
                },
                sameAs: [
                  'https://jiugongbagua.com',
                ],
              },
              {
                '@context': 'https://schema.org',
                '@type': 'WebSite',
                '@id': `${baseUrl}/#website`,
                name: '九宫八卦',
                url: baseUrl,
                description: '中国传统命理文化平台',
                inLanguage: ['zh-CN', 'zh-TW', 'en', 'ja', 'ko'],
                publisher: { '@id': `${baseUrl}/#organization` },
                potentialAction: {
                  '@type': 'SearchAction',
                  target: { '@type': 'EntryPoint', urlTemplate: `${baseUrl}/wenku?q={search_term_string}` },
                  'query-input': 'required name=search_term_string',
                },
              },
              {
                '@context': 'https://schema.org',
                '@type': 'WebApplication',
                '@id': `${baseUrl}/#webapplication`,
                name: '九宫八卦命理测算平台',
                url: baseUrl,
                description: baseDescription,
                applicationCategory: 'LifestyleApplication',
                operatingSystem: 'All',
                offers: {
                  '@type': 'Offer',
                  price: '0',
                  priceCurrency: 'CNY',
                },
                author: { '@id': `${baseUrl}/#organization` },
              },
              {
                '@context': 'https://schema.org',
                '@type': 'BreadcrumbList',
                '@id': `${baseUrl}/#breadcrumb`,
                itemListElement: [
                  { '@type': 'ListItem', position: 1, name: '首页', item: baseUrl },
                ],
              },
            ]),
          }}
        />
      </head>
      <body className="min-h-screen flex flex-col">
        <LayoutClient>{children}</LayoutClient>
      </body>
    </html>
  )
}
