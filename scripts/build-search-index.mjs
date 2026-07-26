// ============================================================
// 易学书馆 · 搜索索引构建脚本（postbuild 阶段运行）
// 解析 content/*.ts 文件提取章节信息，构建可搜索索引 JSON
// ============================================================

import fs from 'fs'
import path from 'path'

const CONTENT_DIR = 'src/data/xueguan/content'
const BOOKS_FILE = 'src/data/xueguan/books.ts'
const OUTPUT = 'public/data/xueguan-search.json'

// 提取字符串字面量（单引号或模板字面量）
function extractString(txt, startPos) {
  const quote = txt[startPos]
  if (quote !== "'" && quote !== '`') return { value: '', end: startPos + 1 }
  
  let value = ''
  let i = startPos + 1
  while (i < txt.length) {
    const c = txt[i]
    if (c === quote) break
    if (c === '\\' && quote === '`') {
      value += txt[i + 1]
      i += 2
    } else {
      value += c
      i++
    }
  }
  return { value: value.replace(/\\n/g, '\n'), end: i + 1 }
}

function parseContentFile(filePath) {
  const name = path.basename(filePath).replace('.ts', '')
  const content = fs.readFileSync(filePath, 'utf-8')
  
  const chapters = []
  
  // 提取章节 id 和 title
  const chapterPattern = /id:\s+'([^']+)',?\s*title:\s+'([^']+)'/g
  let match
  while ((match = chapterPattern.exec(content)) !== null) {
    chapters.push({ id: match[1], title: match[2] })
  }
  
  // 也匹配 export const {name}Content: BookChapter 的模式
  const bookIdMatch = content.match(/bookId:\s+'([^']+)'/)
  const bookId = bookIdMatch ? bookIdMatch[1] : name.replace(/-content$/, '')
  
  // 从批量文件(batch*.ts, *-deep.ts等)中提取 bookId
  if (name.startsWith('batch') || name.endsWith('-deep')) {
    const keyPattern = /export\s+const\s+(\w+):\s*BookChapter\s*=\s*\{[^}]*bookId:\s+'([^']+)'/g
    let m
    while ((m = keyPattern.exec(content)) !== null) {
      // These will be handled differently
    }
  }
  
  return { bookId, chapters }
}

function loadBookMeta() {
  const content = fs.readFileSync(BOOKS_FILE, 'utf-8')
  const books = []
  
  // 使用正则匹配所有图书条目 id 的位置
  const idRe = /^\s+id:\s+'([a-z][a-z0-9_-]*)'/gm
  let idMatch
  
  while ((idMatch = idRe.exec(content)) !== null) {
    const start = idMatch.index
    const bookId = idMatch[1]
    
    // 从 id 位置向前后的有限范围提取字段（避免匹配其他图书的字段）
    const segmentStart = Math.max(0, start - 200)
    const segmentEnd = Math.min(content.length, start + 500)
    const seg = content.substring(segmentStart, segmentEnd)
    
    const titleMatch = seg.match(/title:\s+'([^']+)'/)
    const authorMatch = seg.match(/author:\s+'([^']+)'/)
    const dynastyMatch = seg.match(/dynasty:\s+'([^']+)'/)
    const categoryMatch = seg.match(/category:\s+'([^']+)'/)
    const summaryMatch = seg.match(/summary:\s+'([^']+)'/)
    const keywordsMatch = seg.match(/keywords:\s*\[([^\]]+)\]/)
    const isCompleteMatch = seg.match(/isComplete:\s*(true|false)/)
    
    if (bookId) {
      books.push({
        id: bookId,
        title: titleMatch ? titleMatch[1] : '',
        author: authorMatch ? authorMatch[1] : '',
        dynasty: dynastyMatch ? dynastyMatch[1] : '',
        category: categoryMatch ? categoryMatch[1] : '',
        summary: summaryMatch ? summaryMatch[1] : '',
        keywords: keywordsMatch ? keywordsMatch[1].split(',').map(k => k.trim().replace(/'/g, '')) : [],
        isComplete: isCompleteMatch ? isCompleteMatch[1] === 'true' : false,
      })
    }
  }
  
  return books
}

function main() {
  console.log('🔍 构建易学书馆搜索索引...')
  
  const books = loadBookMeta()
  const contentFiles = fs.readdirSync(CONTENT_DIR)
    .filter(f => f.endsWith('.ts') && f !== 'content-registry.ts')
  
  // 从内容文件中提取章节信息
  const bookMap = {}
  for (const book of books) {
    bookMap[book.id] = { ...book, chapters: [] }
  }
  
  for (const file of contentFiles) {
    const filePath = path.join(CONTENT_DIR, file)
    const parsed = parseContentFile(filePath)
    
    if (bookMap[parsed.bookId]) {
      bookMap[parsed.bookId].chapters = parsed.chapters
    } else {
      // 批量文件中的内容 - 尝试所有 bookId 模式
      const content = fs.readFileSync(filePath, 'utf-8')
      const keyPattern = /bookId:\s+'([^']+)'/g
      let m
      while ((m = keyPattern.exec(content)) !== null) {
        const bid = m[1]
        // 提取这个 bookId 的章节
        const chPattern = /id:\s+'([^']+)',?\s*title:\s+'([^']+)'/g
        const ch = []
        let cm
        while ((cm = chPattern.exec(content)) !== null) {
          ch.push({ id: cm[1], title: cm[2] })
        }
        if (bookMap[bid]) {
          bookMap[bid].chapters = ch
        }
      }
    }
  }
  
  // 构建搜索索引
  const indexData = {
    version: '1.1',
    generatedAt: new Date().toISOString(),
    sourceOrg: 'jiugong-bagua',
    provider: '九宫八卦易学书馆',
    providerUrl: 'https://jiugongbagua.com',
    totalBooks: books.length,
    totalContentBooks: Object.values(bookMap).filter(b => b.chapters.length > 0).length,
    books: Object.values(bookMap).sort((a, b) => a.title.localeCompare(b.title, 'zh')),
  }
  
  fs.mkdirSync(path.dirname(OUTPUT), { recursive: true })
  fs.writeFileSync(OUTPUT, JSON.stringify(indexData), 'utf-8')
  
  const sizeKB = (fs.statSync(OUTPUT).size / 1024).toFixed(1)
  const withContent = Object.values(bookMap).filter(b => b.chapters.length > 0).length
  console.log(`✅ 搜索索引已生成: ${OUTPUT} (${sizeKB} KB)`)
  console.log(`   总计 ${books.length} 本书, ${withContent} 本有章节内容`)
}

main()
