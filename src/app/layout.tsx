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
        {/* 🔥 银河背景直接内联 绕过CDN缓存 */}
        <style dangerouslySetInnerHTML={{ __html: `body{font-family:var(--font-sans);background:radial-gradient(ellipse 130% 100% at 50% 100%,#0a1040 0%,#020215 55%),radial-gradient(ellipse 700px 500px at 18% 22%,rgba(255,90,160,.45) 0%,rgba(220,60,140,.20) 30%,transparent 55%),radial-gradient(ellipse 650px 450px at 82% 25%,rgba(40,180,240,.40) 0%,rgba(20,140,220,.18) 25%,rgba(10,70,160,.08) 45%,transparent 60%),radial-gradient(ellipse 600px 400px at 62% 48%,rgba(160,50,230,.38) 0%,rgba(120,30,180,.15) 30%,transparent 55%),radial-gradient(ellipse 700px 350px at 48% 38%,rgba(255,190,50,.30) 0%,rgba(251,170,30,.12) 35%,transparent 60%),radial-gradient(ellipse 550px 380px at 70% 68%,rgba(20,200,200,.32) 0%,rgba(10,150,160,.14) 35%,transparent 58%),radial-gradient(ellipse 500px 320px at 25% 60%,rgba(255,140,50,.28) 0%,rgba(240,90,40,.12) 35%,transparent 58%),radial-gradient(ellipse 600px 250px at 50% 90%,rgba(160,50,220,.20) 0%,rgba(100,20,160,.08) 40%,transparent 55%),url('/beidou-bg.svg') no-repeat center center/cover,#020210!important;color:#d1d5db;background-attachment:fixed}.cosmic-overlay{position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:0;background:radial-gradient(ellipse 600px 350px at 48% 42%,rgba(255,240,160,.25) 0%,rgba(251,210,70,.14) 30%,transparent 58%),radial-gradient(ellipse 500px 200px at 50% 5%,rgba(255,252,235,.30) 0%,rgba(255,248,210,.14) 30%,transparent 52%),radial-gradient(ellipse 400px 250px at 20% 30%,rgba(255,160,210,.18) 0%,rgba(240,100,180,.08) 35%,transparent 58%),radial-gradient(ellipse 350px 220px at 80% 28%,rgba(100,200,255,.18) 0%,rgba(50,160,230,.08) 35%,transparent 55%),radial-gradient(ellipse 300px 200px at 75% 55%,rgba(190,100,255,.14) 0%,transparent 55%),radial-gradient(ellipse 350px 200px at 22% 62%,rgba(255,170,80,.15) 0%,transparent 55%),radial-gradient(ellipse 350px 180px at 72% 70%,rgba(50,210,210,.14) 0%,transparent 55%),radial-gradient(ellipse 450px 150px at 50% 92%,rgba(251,220,80,.10) 0%,transparent 55%);animation:cosmicPulse 6s ease-in-out infinite}.cosmic-overlay::before{content:'';position:absolute;top:0;left:0;width:100%;height:100%;background:radial-gradient(circle 4px at 20% 15%,rgba(255,252,240,.65) 0%,transparent 100%),radial-gradient(circle 3px at 75% 20%,rgba(255,248,220,.60) 0%,transparent 100%),radial-gradient(circle 5px at 52% 38%,rgba(255,245,200,.58) 0%,transparent 100%),radial-gradient(circle 3px at 42% 28%,rgba(255,250,230,.55) 0%,transparent 100%),radial-gradient(circle 4px at 82% 32%,rgba(150,220,255,.60) 0%,transparent 100%),radial-gradient(circle 3px at 18% 50%,rgba(130,210,255,.55) 0%,transparent 100%),radial-gradient(circle 4px at 30% 18%,rgba(255,190,220,.58) 0%,transparent 100%),radial-gradient(circle 3px at 68% 55%,rgba(255,170,210,.52) 0%,transparent 100%),radial-gradient(circle 5px at 48% 60%,rgba(255,210,90,.55) 0%,transparent 100%),radial-gradient(circle 3px at 85% 48%,rgba(255,190,70,.52) 0%,transparent 100%),radial-gradient(circle 3px at 62% 72%,rgba(110,230,210,.52) 0%,transparent 100%),radial-gradient(circle 4px at 15% 68%,rgba(80,220,190,.48) 0%,transparent 100%),radial-gradient(circle 4px at 72% 42%,rgba(210,150,255,.50) 0%,transparent 100%),radial-gradient(circle 3px at 58% 80%,rgba(190,130,255,.48) 0%,transparent 100%),radial-gradient(circle 2px at 35% 85%,rgba(255,245,190,.50) 0%,transparent 100%),radial-gradient(circle 2px at 78% 82%,rgba(255,230,150,.48) 0%,transparent 100%);animation:sparklePulse 4s ease-in-out infinite alternate}@keyframes cosmicPulse{0%,100%{opacity:.55}50%{opacity:.8}}@keyframes sparklePulse{0%{opacity:.65}50%{opacity:1}100%{opacity:.65}}` }} />
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
