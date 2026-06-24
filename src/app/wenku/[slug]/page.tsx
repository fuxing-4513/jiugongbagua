import type { Metadata } from 'next'
import { articles, type Article } from '../wenkuData'

// 构建时预生成的slug-index映射
const slugIndex: Record<string, number> = {}
for (let i = 0; i < articles.length; i++) slugIndex[articles[i].slug] = i

export async function generateStaticParams() {
  return articles.map(a => ({ slug: a.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const decoded = decodeURIComponent(slug)
  const idx = slugIndex[decoded]
  const article = idx !== undefined ? articles[idx] : undefined
  if (!article) return { title: '九宫八卦 - 命理知识文库' }

  const desc = article.fullContent.slice(0, 120).replace(/["""']/g, '').trim() + '...'

  return {
    title: `${article.title} - 九宫八卦命理知识文库`,
    description: desc,
    keywords: `${article.title},${article.category},八字,命理,紫微斗数,风水,易经,传统文化`,
    openGraph: { title: `${article.title} - 九宫八卦`, description: article.summary, type: 'article', publishedTime: article.date },
    alternates: { canonical: `https://jiugongbagua.com/wenku/${article.slug}` },
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
  '八字命理': 'bg-red-800 text-red-200',
  '风水知识': 'bg-amber-900 text-amber-200',
  '面相手相': 'bg-orange-900 text-orange-200',
  '数字能量': 'bg-cyan-800 text-cyan-200',
  '择日择吉': 'bg-teal-800 text-teal-200',
  '生肖运势': 'bg-pink-900 text-pink-200',
  '命理综合': 'bg-slate-700 text-slate-200',
  '占卜术数': 'bg-violet-900 text-violet-200',
  '中医养生': 'bg-emerald-900 text-emerald-200',
  '道家文化': 'bg-stone-800 text-stone-200',
}

function getArticle(slug: string): Article | undefined {
  const idx = slugIndex[slug]
  return idx !== undefined ? articles[idx] : undefined
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  // Next.js 16 export模式传递的slug是URL编码的（例如%E5%A5%87%E9%97%A8%E9%81%81%E7%94%B2）
  // 而slugIndex的key是原始中文字符串
  const decoded = decodeURIComponent(slug)
  const article = getArticle(decoded)

  if (!article) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-gold-300 mb-4">文章准备中</h1>
        <p className="text-gray-400 mb-6">这篇内容正在整理中，请稍后再来看看。</p>
        <a href="/wenku" className="text-gold-500 hover:underline">← 返回文库列表</a>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <nav className="text-xs text-gray-400 mb-6">
        <a href="/" className="hover:text-gold-400">首页</a>
        <span className="mx-2">/</span>
        <a href="/wenku" className="hover:text-gold-400">知识文库</a>
        <span className="mx-2">/</span>
        <span className="text-gray-300">{article.title}</span>
      </nav>

      <article>
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

        <div className="bg-dark-800/80 rounded-xl border border-dark-600 p-6">
          <div className="text-sm text-gray-200 leading-7 whitespace-pre-line">{article.fullContent}</div>
        </div>
      </article>

      <div className="mt-8 text-center">
        <a href="/wenku" className="text-sm text-gold-500 hover:text-gold-400 underline">← 返回文库列表</a>
      </div>
    </div>
  )
}
