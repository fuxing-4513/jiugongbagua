import type { Metadata } from 'next'

export async function generateStaticParams() {
  return []
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  return {
    title: `九宫八卦 - 命理知识文库`,
    description: '九宫八卦命理文库，深度命理分析文章。',
  }
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  return (
    <div className="max-w-4xl mx-auto px-4 py-20 text-center">
      <h1 className="text-2xl font-bold text-gold-300 mb-4">📚 文库 · 改造中</h1>
      <p className="text-gray-400 mb-2 leading-relaxed">
        这篇文章正在重新撰写中。
      </p>
      <p className="text-gray-500 text-sm mb-6">
        九宫文库正在进行品质升级，每一篇文章都将基于完整的命理推理逻辑。
        <br />敬请期待。
      </p>
      <a href="/wenku" className="text-gold-500 hover:underline text-sm">← 返回文库列表</a>
    </div>
  )
}
