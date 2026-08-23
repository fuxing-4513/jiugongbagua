import type { Metadata } from 'next'
import Link from 'next/link'
import { dreamPages } from '../dream-data'
import { notFound } from 'next/navigation'

const SITE = 'https://www.jiugongbagua.com'

export async function generateStaticParams() {
  return dreamPages.map(d => ({ slug: d.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const d = dreamPages.find(x => x.slug === slug)
  if (!d) return { title: '梦境解析未找到' }
  const desc = `${d.title}是什么意思？${(d.modern || '').replace(/\s+/g, '').slice(0, 120)}…九宫解梦提供古籍原文、白话解析、分场景细看与心理学视角四层解读。`
  return {
    title: `${d.title}是什么意思_${d.title}预兆什么`,
    description: desc,
    keywords: [d.keyword, d.title, ...d.tags.slice(0, 4), '周公解梦', '解梦'],
    alternates: { canonical: `${SITE}/jiemeng/${slug}/` },
    openGraph: {
      title: `${d.title}是什么意思 | 周公解梦`,
      description: desc,
      type: 'article',
    },
  }
}

export default async function DreamPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const d = dreamPages.find(x => x.slug === slug)
  if (!d) notFound()

  // 同类推荐（同分类随机取6条）
  const related = dreamPages.filter(x => x.category === d.category && x.slug !== d.slug).slice(0, 6)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: `${d.title}是什么意思`,
    description: (d.modern || '').slice(0, 150),
    inLanguage: 'zh-CN',
    author: { '@type': 'Organization', name: '九宫八卦' },
    publisher: { '@type': 'Organization', name: '九宫八卦' },
    mainEntityOfPage: `${SITE}/jiemeng/${d.slug}/`,
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <nav className="text-xs text-gray-500 mb-4">
        <Link href="/" className="hover:text-gold-600">首页</Link>
        <span className="mx-1">›</span>
        <Link href="/jiemeng/" className="hover:text-gold-600">周公解梦</Link>
        <span className="mx-1">›</span>
        <span className="text-gray-700">{d.title}</span>
      </nav>

      <h1 className="text-3xl font-bold text-gold-700 font-serif mb-2">{d.title}是什么意思</h1>
      <p className="text-sm text-gray-500 mb-6">
        <span className="bg-amber-100/60 text-gray-600 px-2 py-0.5 rounded text-xs mr-2">{d.category}</span>
        {d.tags.slice(0, 4).map((t, i) => (
          <span key={i} className="text-[10px] bg-amber-100/60 text-gray-500 px-2 py-0.5 rounded mr-1">{t}</span>
        ))}
      </p>

      {/* 古籍原文 */}
      {d.ancient && (
        <section className="bg-amber-50 rounded-lg p-4 mb-5 border border-amber-100/60">
          <h2 className="text-xs text-gold-600/90 mb-1 font-semibold">📜 古籍原文</h2>
          <p className="text-sm text-gray-700 leading-relaxed">{d.ancient}</p>
        </section>
      )}

      {/* 白话解析 */}
      {d.modern && (
        <section className="mb-5">
          <h2 className="text-xs text-blue-600/90 mb-1 font-semibold">💡 白话解析</h2>
          <p className="text-base text-gray-800 leading-relaxed">{d.modern}</p>
        </section>
      )}

      {/* 详细解读 */}
      {d.detail && (
        <section className="mb-5">
          <h2 className="text-xs text-gray-500 mb-1 font-semibold">📖 分场景细看</h2>
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{d.detail.replace(/【/g, '\n【')}</p>
        </section>
      )}

      {/* 心理学视角 */}
      {d.psychologyNote && (
        <section className="bg-violet-50/70 border border-violet-200/60 rounded-lg p-4 mb-5">
          <h2 className="text-xs text-violet-600/90 mb-1 font-semibold">🧠 心理学视角</h2>
          <p className="text-sm text-gray-700 leading-relaxed">{d.psychologyNote}</p>
        </section>
      )}

      {/* 情绪标签 */}
      {d.mood && (
        <p className="text-xs text-gray-400 mb-6">😴 梦中常见情绪：{d.mood.split(',').join('、')}</p>
      )}

      {/* 行动引导 */}
      <div className="bg-white/80 border border-amber-200/60 rounded-xl p-5 mb-8 text-center">
        <p className="text-sm text-gray-600 mb-3">还想查其他梦？全库 7700+ 条梦境解析免费搜索</p>
        <Link href="/jiemeng/" className="inline-block bg-gold-600 hover:bg-gold-500 text-dark-900 font-semibold px-6 py-2 rounded-lg transition-colors">
          🔍 进入解梦大全
        </Link>
      </div>

      {/* 同类推荐 */}
      {related.length > 0 && (
        <section className="mb-8">
          <h2 className="text-sm font-semibold text-gold-700 mb-3">同类梦境解析</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {related.map(r => (
              <Link key={r.slug} href={`/jiemeng/${r.slug}/`}
                className="text-xs bg-white/80 border border-amber-200/60 rounded-lg px-3 py-2 text-gray-600 hover:border-gold-400 hover:text-gold-600 transition-colors truncate">
                {r.title}
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
