import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { articles } from '../wenkuData'

export async function generateStaticParams() {
  return articles.map(a => ({ slug: a.slug }))
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const article = articles.find(a => a.slug === params.slug)
  if (!article) return { title: '文章未找到' }

  // 从前200字提取更具体的描述
  const desc = article.fullContent.slice(0, 120).replace(/["""']/g, '').trim() + '...'

  return {
    title: `${article.title} - 九宫八卦命理知识文库`,
    description: desc,
    keywords: `${article.title},${article.category},八字,命理,紫微斗数,风水,易经,传统文化`,
    openGraph: {
      title: `${article.title} - 九宫八卦`,
      description: article.summary,
      type: 'article',
      publishedTime: article.date,
    },
    alternates: {
      canonical: `https://jiugongbagua.com/wenku/${article.slug}`,
    },
  }
}

const categoryColors: Record<string, string> = {
  '易学基础': 'bg-red-900 text-red-200',
  '五行学说': 'bg-green-900 text-green-200',
  '命理知识': 'bg-blue-900 text-blue-200',
  '紫微斗数': 'bg-purple-900 text-purple-200',
  '数字文化': 'bg-cyan-900 text-cyan-200',
  '姓名文化': 'bg-indigo-900 text-indigo-200',
  '解梦文化': 'bg-yellow-900 text-yellow-200',
  '风水文化': 'bg-amber-900 text-amber-200',
  '传统文化': 'bg-rose-900 text-rose-200',
  '择日文化': 'bg-teal-900 text-teal-200',
}

export default function ArticlePage({ params }: { params: { slug: string } }) {
  const article = articles.find(a => a.slug === params.slug)
  if (!article) notFound()

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      {/* 面包屑 */}
      <nav className="text-xs text-gray-400 mb-6">
        <a href="/" className="hover:text-gold-400">首页</a>
        <span className="mx-2">/</span>
        <a href="/wenku" className="hover:text-gold-400">知识文库</a>
        <span className="mx-2">/</span>
        <span className="text-gray-300">{article.title}</span>
      </nav>

      <article>
        {/* 头部 */}
        <header className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <span className={`text-[10px] px-2 py-0.5 rounded-full ${categoryColors[article.category] || 'bg-dark-700 text-gray-400'}`}>
              {article.category}
            </span>
            <span className="text-[10px] text-gray-600">{article.date}</span>
          </div>
          <h1 className="text-2xl font-bold text-gold-300 font-serif mb-3">{article.title}</h1>
          <p className="text-sm text-gray-300 leading-relaxed">{article.summary}</p>
        </header>

        {/* 正文 */}
        <div className="bg-dark-800/80 rounded-xl border border-dark-600 p-6">
          <div className="text-sm text-gray-200 leading-7 whitespace-pre-line">
            {article.fullContent}
          </div>
        </div>
      </article>

      {/* 上一篇 / 下一篇 */}
      <div className="mt-8 flex justify-between">
        {(() => {
          const idx = articles.findIndex(a => a.slug === params.slug)
          const prev = idx > 0 ? articles[idx - 1] : null
          const next = idx < articles.length - 1 ? articles[idx + 1] : null
          return (
            <>
              <div>
                {prev && (
                  <a href={`/wenku/${prev.slug}`} className="text-xs text-gray-500 hover:text-gold-400">
                    ← {prev.title}
                  </a>
                )}
              </div>
              <div>
                {next && (
                  <a href={`/wenku/${next.slug}`} className="text-xs text-gray-500 hover:text-gold-400">
                    {next.title} →
                  </a>
                )}
              </div>
            </>
          )
        })()}
      </div>

      {/* 返回列表 */}
      <div className="mt-6 text-center">
        <a href="/wenku" className="text-sm text-gold-500 hover:text-gold-400 underline">
          ← 返回文库列表
        </a>
      </div>
    </div>
  )
}
