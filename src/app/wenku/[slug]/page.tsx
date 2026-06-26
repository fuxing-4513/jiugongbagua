import type { Metadata } from 'next'
import { articles } from '../wenkuData'
import { notFound } from 'next/navigation'

export async function generateStaticParams() {
  return articles.map(a => ({ slug: a.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const art = articles.find(a => a.slug === slug)
  if (!art) return { title: '文章未找到' }
  return {
    title: `${art.title} | 九宫文库`,
    description: art.summary,
  }
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const art = articles.find(a => a.slug === slug)
  if (!art) notFound()
  
  return (
    <div className="max-w-4xl mx-auto px-4 py-20">
      <div className="mb-8">
        <a href="/wenku" className="text-sm text-gold-500 hover:underline">← 返回文库</a>
      </div>
      <article className="prose prose-invert max-w-none">
        <div className="mb-6">
          <span className="text-xs px-2 py-1 rounded-full bg-dark-700 text-gray-400 border border-dark-600">{art.category}</span>
          <span className="text-xs text-gray-500 ml-3">{art.date}</span>
          <h1 className="text-3xl font-bold text-gold-400 mt-4 mb-2">{art.title}</h1>
          <p className="text-gray-400 text-sm">{art.summary}</p>
        </div>
        {/* 安全说明：art.fullContent 来自编译期静态 wenkuData.ts，不含用户输入，无 XSS 风险 */}
        <div className="text-gray-200 leading-relaxed space-y-3" dangerouslySetInnerHTML={{ __html: art.fullContent.replace(/\n/g, '<br/>') }} />
      </article>
    </div>
  )
}
