// 古籍 RAG 索引生成 v2：扫描全部 content 文件（含 batch*）——按文件内 bookId 匹配元数据
import fs from 'fs'
import path from 'path'

const booksSrc = fs.readFileSync('src/data/xueguan/books.ts', 'utf8')
const bcStart = booksSrc.indexOf('export const bookCatalog = [')
const bcEnd = booksSrc.indexOf('\n]', bcStart)
const catalogText = booksSrc.slice(bcStart + 'export const bookCatalog = ['.length, bcEnd)
const books = Function('return [' + catalogText + ']')().filter(Boolean)
const byId = {}
for (const b of books) byId[b.id] = b

const contentDir = 'src/data/xueguan/content'
const outDir = 'rag-index'
fs.mkdirSync(outDir, { recursive: true })

let count = 0
const ids = []
for (const file of fs.readdirSync(contentDir)) {
  if (!file.endsWith('.ts')) continue
  const src = fs.readFileSync(path.join(contentDir, file), 'utf8')
  // 按 export 块切分（单书文件 1 块；batch 多书文件多块）
  const blocks = src.match(/export const \w+Content[\s\S]*?(?=export const |$)/g) || [src]
  for (const blk of blocks) {
    if (blk.includes('content-registry')) continue
    const bid = (blk.match(/bookId: '([a-z0-9-]+)'/) || [])[1]
    if (!bid || !byId[bid] || !byId[bid].isComplete) continue
    const b = byId[bid]
    // preface
    const pref = blk.match(/preface: \{[\s\S]*?content: `([\s\S]*?)`,?\s*\}/)
    const preface = pref ? pref[1].replace(/\\n/g, '\n').replace(/`/g, '').slice(0, 600) : ''
    // chapters（双格式：反引号 ` 与单引号 '——旧数据 batch 用单引号；preview 300 字）
    const chs = []
    const tits = [...blk.matchAll(/title: '([^']{2,50})',[\s\S]{0,400}?content: (`[\s\S]*?`|'(?:[^'\\]|\\.)*')/g)]
    for (const t of tits) {
      const title = t[1].trim()
      if (!title || title === '九宫导读') continue
      let body = t[2]
      if (body.startsWith('`')) { body = body.slice(1, -1).replace(/\\n/g, ' ') }
      else { body = body.slice(1, -1).replace(/\\n/g, ' ').replace(/\\'/g, "'").replace(/\\\\/g, '\\') }
      body = body.replace(/\s+/g, ' ').trim()
      if (body.length < 20) continue
      chs.push({ title: title.slice(0, 50), preview: body.slice(0, 300) })
      if (chs.length >= 200) break
    }
    // 有 bookId 且 isComplete 的书一律进索引（无章节也进——元数据/导读兜底——保证"这本书讲什么"必答）
    const entry = {
      id: bid, title: b.title, author: b.author || '', dynasty: b.dynasty || '',
      summary: (b.summary || '').slice(0, 250), keywords: b.keywords || [],
      preface: preface || (b.description || '').slice(0, 400),
      chapters: chs,
    }
    fs.writeFileSync(path.join(outDir, `${bid}.json`), JSON.stringify(entry))
    ids.push(bid)
    count++
    }
}
fs.writeFileSync(path.join(outDir, '__index__.json'), JSON.stringify(ids))
console.log(`RAG 索引 v2: ${count} 书 → ${outDir}/`)
