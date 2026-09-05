// 生成易学书馆搜索索引（books 元数据 + 章节标题）
// 输出到 anti-scrape 混淆路径（public/data/{PREFIX}-xueguan-search-{HASH}.json）
const fs = require('fs')
const path = require('path')

// 从 anti-scrape 取文件名规则（PREFIX/HASH 为固定分段常量）
const PREFIX = 'c5dc0cc7'
const HASH = 'c3526e2d'

// 解析 bookCatalog
const booksSrc = fs.readFileSync('src/data/xueguan/books.ts', 'utf8')
const bcStart = booksSrc.indexOf('export const bookCatalog = [')
const bcEnd = booksSrc.indexOf('\n]', bcStart)
const catalogText = booksSrc.slice(bcStart + 'export const bookCatalog = ['.length, bcEnd)
const books = Function('return [' + catalogText + ']')().filter(Boolean)

// 解析 content 章节标题
const contentDir = 'src/data/xueguan/content'
const titleCache = {}
for (const f of fs.readdirSync(contentDir)) {
  if (!f.endsWith('.ts')) continue
  const s = fs.readFileSync(path.join(contentDir, f), 'utf8')
  // 找 bookId
  const bid = (s.match(/bookId: '([a-z0-9-]+)'/) || [])[1]
  if (!bid) continue
  // 章节标题（含 subchapters 的 title）
  const titles = [...s.matchAll(/title: '([^']{2,40})'/g)].map(m => m[1])
    .filter(t => t !== '九宫导读')
    .map(t => ({ id: t.slice(0, 4) + Math.abs([...t].reduce((a, c) => a + c.charCodeAt(0), 0)) % 997, title: t }))
  titleCache[bid] = titles
}

const searchBooks = books.map(b => ({
  id: b.id, title: b.title, author: b.author || '', dynasty: b.dynasty || '',
  category: b.category || '', summary: (b.summary || '').slice(0, 120),
  keywords: b.keywords || [], isComplete: !!b.isComplete,
  chapters: titleCache[b.id] || [],
}))

const out = { totalBooks: searchBooks.length, totalContentBooks: searchBooks.filter(b => b.chapters.length > 0).length, books: searchBooks }
const dest = path.join('public/data', `${PREFIX}-xueguan-search-${HASH}.json`)
fs.writeFileSync(dest, JSON.stringify(out))
console.log(`搜索索引生成: ${searchBooks.length} 书 / ${out.totalContentBooks} 有正文 → ${dest}`)
