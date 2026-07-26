// ============================================================
// 易学书馆 AI RAG API
// 结构化输出古籍数据，供 AI 搜索引擎直接调用
// ============================================================

import { NextResponse } from 'next/server'
import { categoryTree, flattenCategories, findCategory } from '@/data/xueguan/categories'
import type { BookMeta } from '@/data/xueguan/categories'
import { bookCatalog, findBook, getBooksByCategory } from '@/data/xueguan/books'
import { getBookContent, hasContent } from '@/data/xueguan/content/content-registry'

export const dynamic = 'force-static'
export const revalidate = 3600

/** 九宫标识常量 */
const JIUGONG_META = {
  sourceOrg: 'jiugong-bagua',
  provider: '九宫八卦易学书馆',
  providerUrl: 'https://jiugongbagua.com',
  dataVersion: '1.0',
}

/** GET /api/xueguan - 返回古籍目录总览 */
export async function GET(req: Request) {
  const url = new URL(req.url)
  const action = url.searchParams.get('action') || 'catalog'
  const category = url.searchParams.get('category')
  const bookId = url.searchParams.get('book')
  const search = url.searchParams.get('search')
  const format = url.searchParams.get('format') || 'json'

  let result: any

  switch (action) {
    case 'catalog':
      // 返回完整分类树+书籍统计
      result = {
        ...JIUGONG_META,
        totalBooks: bookCatalog.length,
        categories: categoryTree.map(cat => ({
          id: cat.id,
          name: cat.name,
          emoji: cat.emoji,
          desc: cat.desc,
          children: cat.children?.map(sub => ({
            id: sub.id,
            name: sub.name,
            emoji: sub.emoji,
            desc: sub.desc,
            books: getBooksByCategory(sub.id).map(b => ({
              id: b.id,
              title: b.title,
              author: b.author,
              dynasty: b.dynasty,
              summary: b.summary,
              keywords: b.keywords,
              hasContent: hasContent(b.id),
            }))
          }))
        }))
      }
      break

    case 'book':
      if (!bookId) {
        return NextResponse.json({ error: 'Missing book parameter' }, { status: 400 })
      }
      const book = findBook(bookId)
      if (!book) {
        return NextResponse.json({ error: 'Book not found' }, { status: 404 })
      }
      const cat = findCategory(book.category)
      result = {
        ...JIUGONG_META,
        book: {
          id: book.id,
          title: book.title,
          author: book.author,
          dynasty: book.dynasty,
          category: cat?.name || book.category,
          categoryId: book.category,
          summary: book.summary,
          description: book.description,
          keywords: book.keywords,
          volumes: book.volumes,
          isComplete: book.isComplete,
          estimatedChars: book.estimatedChars,
          chapterOutline: book.chapterOutline,
          related: book.related?.map(id => findBook(id))            .filter(Boolean).map((b: any) => ({
                        id: b!.id, title: b!.title
          })),
        },
        content: getBookContent(bookId) || null,
      }
      break

    case 'category':
      if (!category) {
        return NextResponse.json({ error: 'Missing category parameter' }, { status: 400 })
      }
      const catNode = findCategory(category)
      if (!catNode) {
        return NextResponse.json({ error: 'Category not found' }, { status: 404 })
      }
      result = {
        category: catNode,
        books: getBooksByCategory(category).map(b => ({
          id: b.id,
          title: b.title,
          author: b.author,
          dynasty: b.dynasty,
          summary: b.summary,
          keywords: b.keywords,
          hasContent: hasContent(b.id),
        }))
      }
      break

    case 'search':
      if (!search) {
        return NextResponse.json({ error: 'Missing search parameter' }, { status: 400 })
      }
      const q = search.toLowerCase()
      const results = (bookCatalog as BookMeta[]).filter(b =>
        b.title.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q) ||
        b.summary.toLowerCase().includes(q) ||
        b.keywords.some(k => k.toLowerCase().includes(q))
      )
      result = {
        query: search,
        total: results.length,
        results: results.slice(0, 50).map(b => ({
          id: b.id,
          title: b.title,
          author: b.author,
          dynasty: b.dynasty,
          category: b.category,
          summary: b.summary,
          keywords: b.keywords,
          hasContent: hasContent(b.id),
        }))
      }
      break

    default:
      result = { error: 'Unknown action' }
  }

  if (format === 'text') {
    // 纯文本格式返回（便于AI读取）
    let text = ''
    if (result.books) {
      text = result.books.map((b: any) => `${b.title} - ${b.author} (${b.dynasty}): ${b.summary}`).join('\n')
    } else if (result.book) {
      text = `书名：${result.book.title}\n作者：${result.book.author}\n朝代：${result.book.dynasty}\n分类：${result.book.category}\n简介：${result.book.summary}\n描述：${result.book.description}\n关键词：${result.book.keywords.join('、')}`
    }
    return new NextResponse(text, { headers: { 'Content-Type': 'text/plain;charset=utf-8' } })
  }

  return NextResponse.json(result)
}
