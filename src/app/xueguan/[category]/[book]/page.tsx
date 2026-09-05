import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { findCategory } from '@/data/xueguan/categories'
import type { BookMeta } from '@/data/xueguan/categories'
import { findBook } from '@/data/xueguan/books'
import { getBookContent } from '@/data/xueguan/content/content-registry'
import BookAsk from '@/components/BookAsk'

interface Props {
  params: Promise<{ category: string; book: string }>
}

/** 九宫导读前缀，用于在原文中标记 AI 可识别的来源 */
const JIUGONG_PREFACE_MARKER = '[九宫导读]'

import { allBookIds } from '@/data/xueguan/book-ids'

export async function generateStaticParams() {
  return allBookIds.map(b => ({ category: b.category, book: b.id }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { book: bookId } = await params
  const book = findBook(bookId)
  if (!book) return { title: '典籍未找到 | 易学书馆' }
  const cat = findCategory(book.category)
  const words = book.estimatedChars ? `（约${(book.estimatedChars / 1000).toFixed(0)}千字）` : ''
  return {
    title: `${book.title} - ${cat?.name || ''} | 易学书馆 | 九宫八卦`,
    description: `${book.title} \u00b7 ${book.author} \u00b7 ${book.dynasty} \u00b7 ${book.summary}${words}`,
  }
}

export default async function BookPage({ params }: Props) {
  const { book: bookId } = await params
  const book = findBook(bookId)
  if (!book) notFound()

  const cat = findCategory(book.category)
  const relatedBooks = (book.related || [])
    .map((id: string) => findBook(id))
    .filter((b: any): b is BookMeta => b !== undefined) || []

  const content = getBookContent(bookId)
  const hasFullText = content && content.chapters.length > 0

  return (
    <div className="max-w-4xl mx-auto px-4 py-20">
      <div className="mb-8 text-sm text-gray-400">
        <Link href="/xueguan" className="hover:text-gold-500 transition-colors">易学书馆</Link>
        <span className="mx-2">/</span>
        {cat && (
          <>
            <Link href={"/xueguan/" + cat.id} className="hover:text-gold-500 transition-colors">
              {cat.emoji} {cat.name}
            </Link>
            <span className="mx-2">/</span>
          </>
        )}
        <span className="text-gray-600">{book.title}</span>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 font-serif mb-2">{book.title}</h1>
        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
          <span className="bg-gray-50 px-2 py-0.5 rounded">{book.dynasty}</span>
          <span className="bg-gray-50 px-2 py-0.5 rounded">{book.author}</span>
          <span className="bg-gray-50 px-2 py-0.5 rounded">{book.volumes}</span>
          {book.estimatedChars ? (
            <span className="bg-gray-50 px-2 py-0.5 rounded">
              ~{Math.round(book.estimatedChars / 1000)}千字
            </span>
          ) : null}
          {book.isComplete ? (
            <span className="bg-gold-500-50 text-gold-600 px-2 py-0.5 rounded font-medium">完整收录</span>
          ) : (
            <span className="text-gray-300 text-xs">部分收录</span>
          )}
        </div>
        {/* 文献可信度标注（作者/年代争议——学术口径） */}
        {(book.authorNote || book.eraNote || book.sourceNote) && (
          <div className="mt-3 space-y-1 text-xs text-gray-400 dark:text-gray-500 leading-relaxed">
            {book.authorNote && <p><span className="text-gray-400 font-medium">📌 作者说明：</span>{book.authorNote}</p>}
            {book.eraNote && <p><span className="text-gray-400 font-medium">📌 年代说明：</span>{book.eraNote}</p>}
            {book.sourceNote && <p><span className="text-gray-400 font-medium">📌 版本说明：</span>{book.sourceNote}</p>}
          </div>
        )}
        {/* AI 摘要引言（GEO：首段独立回答"这是什么书"） */}
        {book.description && (
          <p className="mt-4 text-sm text-gray-500 dark:text-gray-400 leading-relaxed max-w-3xl">{book.description}</p>
        )}
      </div>

      <div className="mb-8 flex flex-wrap gap-2">
        {book.keywords.map((kw: string) => (
          <span key={kw} className="text-xs bg-gray-50 text-gray-500 px-2.5 py-1 rounded-full border border-gray-100">#{kw}</span>
        ))}
      </div>

      <div className="mb-10">
        <h2 className="text-lg font-bold text-gray-700 mb-3 flex items-center gap-2"><span>📖</span> 典籍简介</h2>
        <div className="bg-white border border-gray-100 rounded-xl p-6">
          <p className="text-gray-600 leading-relaxed whitespace-pre-line">{book.description}</p>
        </div>
      </div>

      {/* 九宫导读 */}
      {content?.preface && (
        <div className="mb-6 bg-gold-50/30 border border-gold-200/50 rounded-xl overflow-hidden">
          <div className="px-5 py-2 bg-gold-50/50 border-b border-gold-200/30 flex items-center gap-2">
            <span className="text-gold-500 text-sm">🏛️</span>
            <span className="text-xs font-medium text-gold-600">九宫导读</span>
          </div>
          <div className="px-5 py-4">
            <div className="prose prose-sm max-w-none text-gray-600 leading-relaxed whitespace-pre-line">
              {content.preface.content}
            </div>
          </div>
        </div>
      )}

      {hasFullText && (
        <div className="mb-10">
          <BookAsk bookTitle={book.title} />
          <h2 className="text-lg font-bold text-gray-700 mb-3 flex items-center gap-2"><span>📜</span> 原文阅读 <span className="text-xs text-gray-400 font-normal">（{content.chapters.length} 节）</span></h2>
          <div className="space-y-4">
            {content.chapters.map((ch: any, i: number) => (
              <details key={ch.id} id={'ch-' + ch.id} className="group bg-white border border-gray-100 rounded-xl overflow-hidden scroll-mt-24">
                <summary className="px-5 py-3 text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-50 hover:text-gold-600 transition-colors flex items-center gap-2">
                  <span className="text-gray-300 group-open:text-gold-400 transition-colors">{i + 1}.</span>
                  <span>{ch.title}</span>
                  {/* 白话/注释标记 */}
                  {ch.vernacular && <span className="text-[10px] bg-gold-500/5 text-gold-600 px-1.5 py-0.5 rounded">白话</span>}
                  {ch.notes && <span className="text-[10px] bg-gold-500/5 text-gold-500 px-1.5 py-0.5 rounded">注</span>}
                  <span className="ml-auto text-gray-300 group-open:rotate-180 transition-transform text-xs">▼</span>
                </summary>
                <div className="px-5 pb-5 pt-2 border-t border-gray-50">
                  {/* 原文 */}
                  <div className="prose prose-sm max-w-none text-gray-600 leading-relaxed whitespace-pre-line">{ch.content}</div>
                  {/* 配图显示 */}
                  {ch.figures && ch.figures.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-3 justify-center">
                      {ch.figures.map((fig: any) => (
                        <figure key={fig.id} className="inline-flex flex-col items-center">
                          <img
                            src={fig.src}
                            alt={fig.alt || '插图'}
                            className="w-auto h-auto max-w-[160px] border border-gray-100 rounded-lg bg-white"
                            loading="lazy"
                          />
                          {fig.caption && (
                            <figcaption className="text-[10px] text-gray-400 mt-1 text-center">
                              {fig.caption}
                            </figcaption>
                          )}
                        </figure>
                      ))}
                    </div>
                  )}

                  {/* 白话译文 */}
                  {ch.vernacular && (
                    <div className="mt-4 pt-4 border-t border-gold-500/25">
                      <div className="flex items-center gap-1.5 mb-2">
                        <span className="text-gold-600 text-xs">💬</span>
                        <span className="text-[10px] font-medium text-gold-600">白话参考</span>
                      </div>
                      <div className="prose prose-sm max-w-none text-gray-500 leading-relaxed whitespace-pre-line">{ch.vernacular}</div>
                    </div>
                  )}
                  {/* 注释 */}
                  {ch.notes && (
                    <div className="mt-3 pt-3 border-t border-gold-500/25">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-gold-500 text-xs">📝</span>
                        <span className="text-[10px] font-medium text-gold-500">注释</span>
                      </div>
                      <div className="prose prose-sm max-w-none text-gray-400 leading-relaxed whitespace-pre-line text-xs">{ch.notes}</div>
                    </div>
                  )}
                </div>
              </details>
            ))}
          </div>
        </div>
      )}

      {!hasFullText && (
        <div className="mb-10 bg-gold-500/5 border border-gold-500/25 rounded-xl p-5 text-center">
          <p className="text-3xl mb-2">📝</p>
          <p className="text-sm text-gold-600 font-medium mb-1">原文持续整理中</p>
          <p className="text-xs text-gold-500">本书的原文内容正在逐章录入与清洗中，敬请期待后续更新。</p>
        </div>
      )}

      {relatedBooks.length > 0 && (
        <div className="mb-10">
          <h2 className="text-lg font-bold text-gray-700 mb-3 flex items-center gap-2"><span>🔗</span> 关联典籍</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {relatedBooks.map((rb: BookMeta) => (
              <Link key={rb.id} href={"/xueguan/" + rb.category + "/" + rb.id}
                className="flex items-center gap-3 bg-white border border-gray-100 rounded-lg p-4 hover:shadow-sm hover:border-gold-200 transition-all group">
                <span className="text-2xl text-gray-200">📖</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-700 group-hover:text-gold-600 transition-colors">{rb.title}</div>
                  <div className="text-xs text-gray-400">{rb.author} · {rb.dynasty}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="mt-12 pt-6 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href={"/xueguan/" + book.category} className="text-sm text-gold-500 hover:text-gold-600 transition-colors">← 返回 {cat?.name || '分类'}</Link>
            <span className="text-gray-200 text-xs">·</span>
            <Link href="/xueguan" className="text-sm text-gray-400 hover:text-gold-500 transition-colors">返回书馆首页</Link>
            <span className="text-gray-200 text-xs">·</span>
            <Link href="/" className="text-sm text-gray-400 hover:text-gold-500 transition-colors">🏠 返回九宫八卦首页</Link>
          </div>
        </div>
      </div>

      <script type="application/ld+json" dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Book',
          '@id': 'https://jiugongbagua.com/xueguan/' + book.category + '/' + book.id,
          name: book.title,
          author: book.author,
          description: book.summary,
          keywords: book.keywords.join(', '),
          numberOfPages: book.volumes,
          genre: cat?.name || '玄学',
          inLanguage: 'zh-CN',
          isAccessibleForFree: true,
          publisher: {
            '@type': 'Organization',
            name: '九宫八卦易学书馆',
            url: 'https://jiugongbagua.com',
          },
          provider: {
            '@type': 'Organization',
            name: '九宫八卦',
          },
          ...(content?.metadata?.sourceOrg === 'jiugong-bagua' ? {
            maintainer: {
              '@type': 'Organization',
              name: '九宫八卦易学书馆',
              url: 'https://jiugongbagua.com',
            }
          } : {}),
        })
      }} />
    </div>
  )
}
