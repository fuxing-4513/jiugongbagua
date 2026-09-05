import type { Metadata } from 'next'
import Link from 'next/link'
import { categoryTree, type CategoryNode } from '@/data/xueguan/categories'
import { getCategoryStats, bookCatalog } from '@/data/xueguan/books'

export const metadata: Metadata = {
  title: '易学书馆 - 九宫古籍图书馆 | 九宫八卦',
  description: '九宫八卦易学书馆，汇集中国命理、卜筮、风水、相术、道家及西方占星塔罗等经典古籍，分类清晰、数据结构化，支持AI检索调用。九宫易学，正本清源。',
  openGraph: {
    title: '易学书馆 - 九宫古籍图书馆',
    description: '汇集 数百部命理卜筮风水道家古籍，全文录入，数据结构化，支持AI调用。',
    siteName: '九宫八卦',
    type: 'website',
    url: 'https://jiugongbagua.com/xueguan',
  },
  twitter: {
    card: 'summary',
    title: '易学书馆 - 九宫古籍图书馆',
    description: '汇集 数百部命理卜筮风水道家古籍，全文录入，数据结构化，支持AI调用。',
  },
  keywords: ['易学书馆', '九宫八卦', '古籍', '命理', '卜筮', '风水', '道家经典', '占星', '塔罗'],
}

/** 统计某个分类下（含子分类）的书籍总数 */
function countBooksInCategory(catId: string): number {
  let count = 0
  for (const book of bookCatalog) {
    if (!book) continue
    if (!book) continue
    if (book.category === catId || book.category.startsWith(catId + '-')) count++
  }
  return count
}

/** 获取某个分类的直接子分类列表 */
function getChildren(cat: CategoryNode): CategoryNode[] {
  return cat.children || []
}

export default function XueguanPage() {
  const totalBooks = bookCatalog.filter(Boolean).length
  const completeBooks = bookCatalog.filter((b: any) => b.isComplete).length

  return (
    <>
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        '@id': 'https://jiugongbagua.com/xueguan#collection',
        name: '易学书馆 - 九宫古籍图书馆',
        description: '九宫八卦易学书馆，汇集中国命理、卜筮、风水、相术、道家及西方占星塔罗等经典古籍。',
        url: 'https://jiugongbagua.com/xueguan',
        isPartOf: {
          '@type': 'WebSite',
          '@id': 'https://jiugongbagua.com/#website',
        },
        about: {
          '@type': 'Thing',
          name: '中国传统易学古籍',
          description: '命理典籍、卜筮经典、风水古籍、道家经典、占星塔罗等',
        },
        numberOfItems: totalBooks,
      }) }}
    />
    <div className="max-w-5xl mx-auto px-4 py-20">
      {/* 头部 */}
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold text-gold-600 font-serif mb-4">
          📚 易学书馆
        </h1>
        <p className="text-gray-500 text-lg mb-2 max-w-2xl mx-auto leading-relaxed">
          汇集古今中外玄学经典古籍，命理·卜筮·风水·相术·道家·占星·塔罗
        </p>
        <div className="flex items-center justify-center gap-6 text-sm text-gray-400 mt-4">
          <span>📖 已收录 <strong className="text-gold-500">{totalBooks}</strong> 部</span>
          <span>✅ 完整收录 <strong className="text-gold-600">{completeBooks}</strong> 部</span>
          <span>📂 <strong className="text-gray-500">{categoryTree.length}</strong> 大类</span>
        </div>

        {/* 珍稀馆藏入口 */}
        <div className="mt-4">
          <a href="/cangku"
            className="flex items-center justify-between gap-3 px-5 py-3 bg-gradient-to-r from-[#fdf8ee] to-[#f8f1df] dark:from-[#1a1c22] dark:to-[#181a20] border border-gold-300/70 dark:border-gold-500/30 rounded-xl text-sm hover:border-gold-400 dark:hover:border-gold-500/60 transition-all group">
            <span className="flex items-center gap-3">
              <span className="text-lg">🏛️</span>
              <span className="text-left">
                <span className="font-medium text-gray-800 dark:text-gray-100 block">珍稀馆藏 · 海外玄学古籍著录库</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">敦煌遗书（P.2831/P.3507…）· 宋元易学珍本 · 佚书残卷——馆藏级著录</span>
              </span>
            </span>
            <span className="text-gold-500 group-hover:translate-x-0.5 transition-transform">→</span>
          </a>
        </div>

        {/* 馆藏说明（医学史/民俗文献定位——合规免责） */}
        <div className="mt-5 max-w-3xl mx-auto rounded-xl border border-amber-200/70 dark:border-amber-500/25 bg-amber-50/70 dark:bg-amber-500/5 px-5 py-4 text-left">
          <p className="text-xs leading-relaxed text-amber-800/90 dark:text-amber-200/80">
            📜 <strong>馆藏说明</strong>：本馆收录的中国传统典籍均为历史文化文献，含命理、卜筮、风水、择日及古代医学史与民俗文献（如祝由、符箓相关篇章）——供文化研究与学术参考，不构成医疗建议、不提供疗效承诺。古籍所述方法与观念不代表现代科学结论，身体不适请及时就医。
          </p>
        </div>

        {/* 搜索入口 */}
        <div className="mt-6 max-w-lg mx-auto">
          <a
            href="/xueguan/search"
            className="flex items-center gap-3 px-5 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-400 hover:border-gold-300 hover:text-gray-600 transition-all group"
          >
            <span className="text-lg group-hover:scale-110 transition-transform">🔍</span>
            <span className="flex-1 text-left">搜索古籍名称、作者、章节或关键词...</span>
            <span className="text-[10px] bg-gray-50 text-gray-300 px-2 py-0.5 rounded border border-gray-100">回车</span>
          </a>
        </div>
      </div>

      {/* 分类展示 */}
      <div className="space-y-10">
        {categoryTree.map((mainCat) => {
          const children = getChildren(mainCat)
          const mainCount = countBooksInCategory(mainCat.id)
          return (
            <section key={mainCat.id}>
              <div className="flex items-center gap-2 mb-5">
                <span className="text-2xl">{mainCat.emoji}</span>
                <h2 className="text-2xl font-bold text-gray-800 font-serif">
                  <Link href={`/xueguan/${mainCat.id}`} className="hover:text-gold-500 transition-colors">
                    {mainCat.name}
                  </Link>
                </h2>
                <span className="text-xs text-gray-400 ml-2">({mainCount} 部)</span>
                <p className="text-xs text-gray-400 ml-4 hidden sm:inline">{mainCat.desc}</p>
              </div>

              {/* 子分类网格 */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {children.map((sub) => {
                  const subCount = countBooksInCategory(sub.id)
                  return (
                    <Link
                      key={sub.id}
                      href={`/xueguan/${sub.id}`}
                      className="group relative bg-white border border-gray-100 rounded-xl p-4 text-center hover:shadow-md hover:border-gold-200 transition-all active:scale-[0.98]"
                    >
                      <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">{sub.emoji}</div>
                      <div className="text-sm font-medium text-gray-700 group-hover:text-gold-600 transition-colors">
                        {sub.name}
                      </div>
                      <div className="text-[10px] text-gray-400 mt-1">{subCount} 部典籍</div>
                      <div className="text-[10px] text-gray-300 mt-0.5 leading-tight line-clamp-1">{sub.desc}</div>
                    </Link>
                  )
                })}
              </div>
            </section>
          )
        })}
      </div>

      {/* 底部说明 */}
      <div className="mt-16 pt-8 border-t border-gray-100 text-center">
        <p className="text-xs text-gray-300">
          九宫易学书馆 · 正本清源
        </p>
        <div className="mt-4">
          <Link href="/" className="text-sm text-gray-400 hover:text-gold-500 transition-colors">🏠 返回九宫八卦首页</Link>
        </div>
      </div>
    </div>
    </>
  )
}
