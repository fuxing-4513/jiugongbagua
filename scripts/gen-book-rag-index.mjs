// 古籍 RAG 索引生成：每书 → { id/title/author/dynasty/summary/keywords/preface/chapters[] }
// 输出 rag-index/ 目录（每书 1 JSON + __index__ 列表）——供灌 KV
import fs from 'fs'
import path from 'path'

const booksSrc = fs.readFileSync('src/data/xueguan/books.ts', 'utf8')
const bcStart = booksSrc.indexOf('export const bookCatalog = [')
const bcEnd = booksSrc.indexOf('\n]', bcStart)
const catalogText = booksSrc.slice(bcStart + 'export const bookCatalog = ['.length, bcEnd)
const books = Function('return [' + catalogText + ']')().filter(Boolean)

const contentDir = 'src/data/xueguan/content'
const outDir = 'rag-index'
fs.mkdirSync(outDir, { recursive: true })

let count = 0
const ids = []
for (const b of books) {
  if (!b.isComplete) continue
  const file = path.join(contentDir, `${b.id}.ts`)
  if (!fs.existsSync(file)) continue
  const src = fs.readFileSync(file, 'utf8')
  // preface（九宫导读 content）
  const pref = src.match(/preface: \{[\s\S]*?content: `([\s\S]*?)`,?\s*\}/)
  const preface = pref ? pref[1].replace(/\\n/g, '\n').replace(/`/g, '').slice(0, 600) : ''
  // chapters（平铺全文 title/content 对——含嵌套 subchapters 一律提取）
  const chs = []
  const tits = [...src.matchAll(/title: '([^']{2,50})',[\s\S]{0,80}?content: `([\s\S]*?)`/g)]
  for (const t of tits) {
    const title = t[1].replace(/^九宫导读$/, '').trim()
    if (!title || title === '九宫导读') continue
    const body = t[2].replace(/\\n/g, ' ').replace(/\s+/g, ' ').trim()
    if (body.length < 20) continue
    chs.push({ title: title.slice(0, 40), preview: body.slice(0, 150) })
    if (chs.length >= 80) break
  }
  if (chs.length === 0) continue
  const entry = {
    id: b.id, title: b.title, author: b.author || '', dynasty: b.dynasty || '',
    summary: (b.summary || '').slice(0, 250), keywords: b.keywords || [],
    preface: preface || (b.description || '').slice(0, 300),
    chapters: chs,
  }
  fs.writeFileSync(path.join(outDir, `${b.id}.json`), JSON.stringify(entry))
  ids.push(b.id)
  count++
}
fs.writeFileSync(path.join(outDir, '__index__.json'), JSON.stringify(ids))
console.log(`RAG 索引生成: ${count} 书 → ${outDir}/（+__index__）`)
