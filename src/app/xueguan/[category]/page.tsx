import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { findCategory, flattenCategories, type CategoryNode, type BookMeta } from '@/data/xueguan/categories'
import { bookCatalog, getBooksByCategory } from '@/data/xueguan/books'

interface Props {
  params: Promise<{ category: string }>
}

export async function generateStaticParams() {
  return flattenCategories().map(c => ({ category: c.id }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params
  const cat = findCategory(category)
  if (!cat) return { title: '分类未找到 | 易学书馆' }
  const count = getBooksByCategory(cat.id).length
  return {
    title: `${cat.name} - 易学书馆 | 九宫八卦`,
    description: `九宫易学书馆 · ${cat.name} · 收录 ${count} 部典籍，${cat.desc}`,
    openGraph: {
      title: `${cat.name} - 九宫古籍图书馆`,
      description: `${cat.emoji} ${cat.name}：收录 ${count} 部典籍，${cat.desc}`,
      siteName: '九宫八卦',
      type: 'website',
      url: `https://jiugongbagua.com/xueguan/${cat.id}`,
    },
  }
}

/** 根据分类 id 获取来自多个层面的书籍（精准 + 子分类下所有书） */
function getRelatedBooks(catId: string): { exact: BookMeta[]; subCats: { cat: CategoryNode; books: BookMeta[] }[] } {
  const exact = getBooksByCategory(catId)
  const cat = findCategory(catId)
  const subCats: { cat: CategoryNode; books: BookMeta[] }[] = []
  if (cat?.children) {
    for (const sub of cat.children) {
      const books = getBooksByCategory(sub.id)
      if (books.length > 0) subCats.push({ cat: sub, books })
    }
  }
  return { exact, subCats }
}

export default async function CategoryPage({ params }: Props) {
  const { category } = await params
  const cat = findCategory(category)
  if (!cat) notFound()

  const isLeaf = !cat.children || cat.children.length === 0
  const { exact, subCats } = getRelatedBooks(category)
  const allBooks = isLeaf ? exact : []

  return (
    <div className="max-w-5xl mx-auto px-4 py-20">
      {/* 面包屑 */}
      <div className="mb-8 text-sm text-gray-400">
        <Link href="/xueguan" className="hover:text-gold-500 transition-colors">易学书馆</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-600">{cat.emoji} {cat.name}</span>
      </div>

      {/* 分类头部 */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-gray-800 font-serif mb-2">
          {cat.emoji} {cat.name}
        </h1>
        <p className="text-gray-500">{cat.desc}</p>
      </div>

      {/* 如果有子分类：展示子分类 */}
      {!isLeaf && subCats.length > 0 && (
        <div className="space-y-10">
          {subCats.map(({ cat: sub, books }) => (
            <section key={sub.id}>
              <h2 className="text-xl font-bold text-gray-700 font-serif mb-4 flex items-center gap-2">
                <span>{sub.emoji}</span>
                {sub.name}
                <span className="text-xs text-gray-400 font-normal">({books.length} 部)</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {books.map(book => (
                  <BookCard key={book.id} book={book} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      {/* 如果是叶子分类：直接展示书籍列表 */}
      {isLeaf && (
        <div className="space-y-6">
          {allBooks.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <p className="text-4xl mb-4">📭</p>
              <p>该分类下暂无收录典籍，后续将陆续补充。</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {allBooks.filter(Boolean).map(book => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* 如果没有子分类也没有书 */}
      {isLeaf && allBooks.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-4">📭</p>
          <p>该分类下暂无收录典籍，后续将陆续补充。</p>
        </div>
      )}

      {/* 返回链接 */}
      <div className="mt-10 pt-6 border-t border-gray-100 text-center">
        <Link href="/xueguan" className="text-sm text-gray-400 hover:text-gold-500 transition-colors mx-3">返回书馆首页</Link>
        <span className="text-gray-200 text-xs">·</span>
        <Link href="/" className="text-sm text-gray-400 hover:text-gold-500 transition-colors mx-3">🏠 返回九宫八卦首页</Link>
      </div>
    </div>
  )
}

/** 书籍卡片 */
function BookCard({ book }: { book: BookMeta }) {
  return (
    <Link
      href={`/xueguan/${book.category}/${book.id}`}
      className="block bg-white border border-gray-100 rounded-xl p-5 hover:shadow-md hover:border-gold-200 transition-all group"
    >
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-gray-800 group-hover:text-gold-600 transition-colors text-base mb-1">
            {book.title}
          </h3>
          <div className="flex items-center gap-3 text-xs text-gray-400 mb-2">
            <span>{book.author}</span>
            <span>·</span>
            <span>{book.dynasty}</span>
            {book.isComplete && (
              <>
                <span>·</span>
                <span className="text-jade-500 font-medium">完整收录</span>
              </>
            )}
          </div>
          <p className="text-sm text-gray-500 leading-relaxed line-clamp-2">
            {book.summary}
          </p>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {book.keywords.slice(0, 4).map(kw => (
              <span key={kw} className="text-[10px] bg-gray-50 text-gray-400 px-1.5 py-0.5 rounded">
                {kw}
              </span>
            ))}
          </div>
        </div>
        <span className="text-2xl text-gray-200 group-hover:text-gold-300 transition-colors flex-shrink-0">
          📖
        </span>
      </div>
    </Link>
  )
}
