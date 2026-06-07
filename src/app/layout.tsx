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
        {/* 🔥 银河星系背景 - 确保优先于所有面板 */}
        <style dangerouslySetInnerHTML={{ __html: `body{font-family:var(--font-sans);background:radial-gradient(ellipse 160% 120% at 50% 110%,#0a1040 0%,#020215 60%),radial-gradient(ellipse 1000px 700px at 15% 15%,rgba(255,100,150,.65) 0%,rgba(255,60,130,.35) 18%,rgba(220,20,120,.18) 40%,transparent 55%),radial-gradient(ellipse 900px 650px at 85% 18%,rgba(40,190,255,.55) 0%,rgba(20,150,240,.3) 18%,rgba(10,90,200,.12) 40%,transparent 58%),radial-gradient(ellipse 850px 600px at 60% 40%,rgba(160,50,240,.5) 0%,rgba(110,30,200,.25) 25%,rgba(70,15,160,.1) 45%,transparent 58%),radial-gradient(ellipse 900px 500px at 45% 30%,rgba(255,210,70,.45) 0%,rgba(251,180,30,.22) 30%,rgba(220,150,25,.1) 50%,transparent 60%),radial-gradient(ellipse 800px 500px at 72% 60%,rgba(20,220,220,.5) 0%,rgba(10,170,180,.25) 30%,rgba(5,110,120,.08) 50%,transparent 58%),radial-gradient(ellipse 700px 450px at 22% 55%,rgba(255,160,60,.45) 0%,rgba(250,110,45,.2) 30%,rgba(220,70,30,.08) 50%,transparent 58%),radial-gradient(ellipse 800px 400px at 50% 85%,rgba(160,50,240,.4) 0%,rgba(90,15,170,.15) 40%,transparent 55%),url('/beidou-bg.svg') no-repeat center center/cover,#020210!important;color:#d1d5db;background-attachment:fixed}.cosmic-overlay{position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:0;background:radial-gradient(ellipse 700px 400px at 48% 40%,rgba(255,250,180,.4) 0%,rgba(251,225,90,.22) 25%,rgba(200,175,40,.08) 50%,transparent 60%),radial-gradient(ellipse 600px 250px at 50% 8%,rgba(255,255,245,.5) 0%,rgba(255,252,230,.25) 25%,transparent 50%),radial-gradient(ellipse 450px 300px at 18% 25%,rgba(255,180,225,.3) 0%,rgba(250,130,195,.15) 30%,transparent 55%),radial-gradient(ellipse 400px 250px at 82% 22%,rgba(110,220,255,.3) 0%,rgba(55,180,245,.15) 30%,transparent 55%),radial-gradient(ellipse 350px 250px at 72% 50%,rgba(180,100,255,.25) 0%,rgba(130,50,210,.1) 35%,transparent 55%),radial-gradient(ellipse 400px 250px at 22% 58%,rgba(255,185,90,.25) 0%,rgba(240,130,55,.12) 35%,transparent 55%),radial-gradient(ellipse 400px 220px at 70% 65%,rgba(50,225,225,.25) 0%,rgba(25,170,175,.1) 35%,transparent 55%),radial-gradient(ellipse 500px 200px at 50% 90%,rgba(251,230,105,.2) 0%,rgba(200,185,65,.08) 40%,transparent 55%);animation:cosmicPulse 6s ease-in-out infinite}.cosmic-overlay::before{content:'';position:absolute;top:0;left:0;width:100%;height:100%;background:radial-gradient(circle 5px at 18% 12%,rgba(255,255,250,.9) 0%,transparent 100%),radial-gradient(circle 4px at 75% 18%,rgba(255,252,235,.85) 0%,transparent 100%),radial-gradient(circle 6px at 50% 35%,rgba(255,250,220,.82) 0%,transparent 100%),radial-gradient(circle 4px at 40% 22%,rgba(255,253,245,.82) 0%,transparent 100%),radial-gradient(circle 5px at 80% 30%,rgba(170,235,255,.85) 0%,transparent 100%),radial-gradient(circle 4px at 15% 45%,rgba(150,225,255,.8) 0%,transparent 100%),radial-gradient(circle 5px at 28% 15%,rgba(255,210,235,.82) 0%,transparent 100%),radial-gradient(circle 4px at 65% 52%,rgba(255,185,225,.75) 0%,transparent 100%),radial-gradient(circle 6px at 45% 55%,rgba(255,225,110,.8) 0%,transparent 100%),radial-gradient(circle 4px at 85% 45%,rgba(255,205,90,.75) 0%,transparent 100%),radial-gradient(circle 4px at 60% 68%,rgba(130,245,230,.75) 0%,transparent 100%),radial-gradient(circle 5px at 12% 62%,rgba(100,235,210,.7) 0%,transparent 100%),radial-gradient(circle 5px at 70% 40%,rgba(225,170,255,.75) 0%,transparent 100%),radial-gradient(circle 4px at 55% 75%,rgba(210,150,255,.7) 0%,transparent 100%),radial-gradient(circle 3px at 32% 80%,rgba(255,250,205,.75) 0%,transparent 100%),radial-gradient(circle 3px at 78% 78%,rgba(255,240,170,.72) 0%,transparent 100%);animation:sparklePulse 4s ease-in-out infinite alternate}@keyframes cosmicPulse{0%,100%{opacity:.6}50%{opacity:.85}}@keyframes sparklePulse{0%{opacity:.7}50%{opacity:1}100%{opacity:.7}}` }} />
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
