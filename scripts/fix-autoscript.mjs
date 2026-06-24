/**
 * 修复 auto-article.mjs 第328-329行，
 * 在写入时对summary也做引号转义
 */
import fs from 'fs'
import { fileURLToPath } from 'url'

const __dirname = fileURLToPath(import.meta.url).replace(/\/[^/]+$/, '')
const filePath = __dirname + '/auto-article.mjs'

let content = fs.readFileSync(filePath, 'utf8')

// 替换的旧代码段和新代码段
const oldLines = [
  "  let newArrayStr = allArticlesStr + ',\\n'",
  "  for (const a of uniqueNew) {",
  "    const safeContent = a.fullContent.replace(/\"/g, '\\\\\"').replace(/\\n/g, '\\\\n')",
  "    const entry = `{id:${a.id},title:\"${a.title}\",slug:\"${a.slug}\",summary:\"${a.summary}\",date:'${a.date}',category:'${a.category}',fullContent:\"${safeContent}\"},`",
  "    newArrayStr += entry + '\\n'",
  "  }",
].join('\n')

const newLines = [
  "  let newArrayStr = allArticlesStr + ',\\n'",
  "  for (const a of uniqueNew) {",
  "    const safeSummary = a.summary.replace(/\\\\\"/g, '\"').replace(/\"/g, '\\\\\"').replace(/'/g, \"\\\\'\")",
  "    const safeContent = a.fullContent.replace(/\\\\\"/g, '\"').replace(/\"/g, '\\\\\"').replace(/\\n/g, '\\\\n')",
  "    const entry = `{id:${a.id},title:\"${a.title}\",slug:\"${a.slug}\",summary:\"${safeSummary}\",date:'${a.date}',category:'${a.category}',fullContent:\"${safeContent}\"},`",
  "    newArrayStr += entry + '\\n'",
  "  }",
].join('\n')

if (!content.includes(oldLines)) {
  console.error('ERROR: Could not find old code block')
  process.exit(1)
}

content = content.replace(oldLines, newLines)
fs.writeFileSync(filePath, content)
console.log('✅ auto-article.mjs fixed')
