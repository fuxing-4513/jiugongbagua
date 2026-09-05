// 输出现库完整书目（id/title/category）
const fs = require('fs')
const s = fs.readFileSync('src/data/xueguan/books.ts', 'utf8')
const books = [...s.matchAll(/id: '([a-z0-9-]+)',[\s\S]*?title: '([^']+)',[\s\S]*?category: '([a-z-]+)'/g)].map(m => ({ id: m[1], title: m[2], cat: m[3] }))
console.log('现库书目', books.length, '部:')
const byCat = {}
for (const b of books) { (byCat[b.cat] = byCat[b.cat] || []).push(b.title) }
for (const [cat, titles] of Object.entries(byCat)) {
  console.log(`\n[${cat}] ${titles.length}部`)
  console.log(' ', titles.join(' / '))
}
