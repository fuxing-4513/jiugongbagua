import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const queueDir = path.join(__dirname, '../scripts/wenku-queue')
const files = fs.readdirSync(queueDir).filter(f => f.startsWith('name-') && f.endsWith('.txt'))

const articles = []
let id = 1

for (const file of files) {
  const content = fs.readFileSync(path.join(queueDir, file), 'utf-8')
  
  const titleMatch = content.match(/^标题:\s*(.+)$/m)
  const catMatch = content.match(/^分类:\s*(.+)$/m)
  const summaryMatch = content.match(/^摘要:\s*(.+)$/m)
  
  if (!titleMatch || !catMatch || !summaryMatch) {
    console.log(`Skipping ${file}: missing header fields`)
    continue
  }
  
  const contentStart = content.indexOf('---')
  const fullContent = contentStart >= 0 
    ? content.slice(contentStart + 3).trim()
    : content.trim()
  
  const title = titleMatch[1].trim()
  const category = catMatch[1].trim()
  const summary = summaryMatch[1].trim()
  
  const slug = `name-${file.replace('name-', '').replace('.txt', '')}`
  
  articles.push({
    id,
    title,
    slug,
    summary,
    date: '2026-06-25',
    category,
    fullContent,
  })
  
  id++
}

const output = `export interface Article { id: number; title: string; slug: string; summary: string; date: string; category: string; fullContent: string; }

export const articles: Article[] = ${JSON.stringify(articles, null, 2)}
`

fs.writeFileSync(path.join(__dirname, '../src/app/wenku/wenkuData.ts'), output, 'utf-8')
console.log(`Done! Imported ${articles.length} articles to wenkuData.ts`)
