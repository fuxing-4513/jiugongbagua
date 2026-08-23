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
  keywords: ['九宫八卦','八字排盘','紫微斗数','六爻','小六壬','周公解梦','姓名测试','号码测吉凶','黄历','塔罗','命理','易经','梅花易数','合婚','传统文化','奇门遁甲'],
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
        {/* charSet 与 viewport 由 Next.js 自动注入，此处勿重复声明。
            CSP 用 <meta> 下发（浏览器支持，仅 frame-ancestors/report-uri 例外）；
            X-Frame-Options / X-Content-Type-Options 无 meta 形式、写了也无效，
            如需强制防嵌入，在 Cloudflare 加一条 Response Header Transform Rule。
            public/_headers 为将来迁移 Cloudflare Pages 预留。 */}
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
            "base-uri 'self'; " +
            "form-action 'self'; " +
            "object-src 'none'; " +
            "media-src 'self'; " +
            "upgrade-insecure-requests"
          }
        />
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
                url: baseUrl,
                description: '中国传统命理文化平台',
                inLanguage: ['zh-CN', 'zh-TW', 'en'],
                potentialAction: {
                  '@type': 'SearchAction',
                  target: { '@type': 'EntryPoint', urlTemplate: `${baseUrl}/wenku?q={search_term_string}` },
                  'query-input': 'required name=search_term_string',
                },
              },
              {
                '@context': 'https://schema.org',
                '@type': 'WebApplication',
                name: '九宫八卦命理测算平台',
                url: baseUrl,
                description: baseDescription,
                applicationCategory: 'LifestyleApplication',
                operatingSystem: 'All',
              },
              {
                '@context': 'https://schema.org',
                '@type': 'BreadcrumbList',
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
