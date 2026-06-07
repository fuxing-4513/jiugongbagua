import type { Metadata } from 'next'
import LayoutClient from '@/components/LayoutClient'
import './globals.css'

const baseUrl = 'https://jiugongbagua.com'
const baseDescription = '九宫八卦是中国传统命理文化平台，提供八字算命、紫微斗数、六爻占卜、小六壬、周公解梦、姓名测试、号码测吉凶、黄历择日、塔罗占卜、测字等在线服务。'

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: '九宫八卦 - 中国传统命理文化平台',
    template: '%s | 九宫八卦',
  },
  description: baseDescription,
  keywords: ['九宫八卦','八字算命','紫微斗数','六爻占卜','小六壬','周公解梦','姓名测试','号码测吉凶','黄历','塔罗占卜','测字','命理','易经','梅花易数','合婚','传统文化','奇门遁甲'],
  authors: [{ name: '九宫八卦' }],
  creator: '九宫八卦',
  publisher: '九宫八卦',
  openGraph: {
    title: '九宫八卦 - 传统命理在线测算平台',
    description: '传承经典 · 智慧启航。八字算命、紫微斗数、六爻占卜、梅花易数、小六壬等二十余种传统命理服务。',
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
  verification: { google: '' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-Hans" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {/* CSP 安全策略 */}
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
        {/* 强制禁用缓存 */}
        <meta httpEquiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
        <meta httpEquiv="Pragma" content="no-cache" />
        <meta httpEquiv="Expires" content="0" />
        {/* 银河照片背景 — 真实星云 */}
        <style dangerouslySetInnerHTML={{ __html: `body{font-family:var(--font-sans);background:url(/galaxy-bg.jpg) no-repeat center center fixed;background-size:cover;color:#e0e0e0!important}.cosmic-overlay{position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:0;background:radial-gradient(ellipse 600px 350px at 48% 40%,rgba(255,250,200,.3) 0%,rgba(251,230,100,.15) 30%,transparent 65%),radial-gradient(ellipse 500px 220px at 50% 6%,rgba(255,255,245,.35) 0%,rgba(255,252,230,.18) 30%,transparent 55%),radial-gradient(ellipse 400px 250px at 16% 25%,rgba(255,190,235,.2) 0%,rgba(250,140,205,.1) 35%,transparent 60%),radial-gradient(ellipse 350px 220px at 84% 22%,rgba(120,230,255,.2) 0%,rgba(65,190,250,.1) 35%,transparent 60%),radial-gradient(ellipse 350px 200px at 20% 58%,rgba(255,200,105,.15) 0%,transparent 60%),radial-gradient(ellipse 350px 180px at 72% 65%,rgba(60,235,235,.15) 0%,transparent 60%),radial-gradient(ellipse 450px 150px at 50% 92%,rgba(251,235,110,.12) 0%,transparent 60%);animation:cosmicPulse 6s ease-in-out infinite}.cosmic-overlay::before{content:'';position:absolute;top:0;left:0;width:100%;height:100%;background:radial-gradient(circle 4px at 18% 12%,rgba(255,255,250,.7) 0%,transparent 100%),radial-gradient(circle 3px at 75% 16%,rgba(255,252,235,.65) 0%,transparent 100%),radial-gradient(circle 5px at 50% 32%,rgba(255,250,220,.62) 0%,transparent 100%),radial-gradient(circle 4px at 80% 28%,rgba(180,240,255,.65) 0%,transparent 100%),radial-gradient(circle 4px at 28% 15%,rgba(255,220,240,.62) 0%,transparent 100%),radial-gradient(circle 5px at 45% 52%,rgba(255,235,120,.6) 0%,transparent 100%),radial-gradient(circle 4px at 10% 60%,rgba(110,245,220,.55) 0%,transparent 100%),radial-gradient(circle 4px at 72% 38%,rgba(235,180,255,.58) 0%,transparent 100%),radial-gradient(circle 2px at 45% 24%,rgba(255,255,255,.7) 0%,transparent 100%),radial-gradient(circle 2px at 68% 22%,rgba(255,255,255,.65) 0%,transparent 100%);animation:sparklePulse 4s ease-in-out infinite alternate}@keyframes cosmicPulse{0%,100%{opacity:.65}50%{opacity:.9}}@keyframes sparklePulse{0%{opacity:.7}50%{opacity:1}100%{opacity:.7}}` }} />
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
