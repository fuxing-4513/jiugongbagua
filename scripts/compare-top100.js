// 对照：top100 清单 vs 现库（bookCatalog 全部书名+别名匹配）
const fs = require('fs')
const { TOP100 } = require('./top100-metaphysics.cjs')

const s = fs.readFileSync('src/data/xueguan/books.ts', 'utf8')
const titles = [...s.matchAll(/title: '([^']+)'/g)].map(m => m[1])
// 书名去"经/篇/赋/歌"后缀做宽松匹配 + 别名表
const ALIAS = {
  '周易': ['周易', '易经', '周易本义', '周易正义'],
  '焦氏易林': ['易林'],
  '黄帝内经·素问运气': ['素问', '黄帝内经'],
  '珞琭子三命消息赋': ['珞琭', '消息赋'],
  '滴天髓阐微': ['滴天髓'],
  '沈氏玄空学': ['玄空'],
  '太上感应篇': ['感应篇'],
}

const missing = []
for (const b of TOP100) {
  const candidates = ALIAS[b] || [b]
  const hit = titles.some(t => candidates.some(c => t.includes(c.replace(/[经篇赋歌]/g, '').slice(0, 2)) && c.length >= 2 ? t.includes(c.slice(0, 3)) : t.includes(c.slice(0, 2))))
  // 简化：主名前 3 字包含即算
  const hit2 = candidates.some(c => titles.some(t => c.length >= 3 ? t.includes(c.slice(0, 3)) : t.includes(c)))
  if (!hit2) missing.push(b)
}
console.log('Top100 清单:', TOP100.length, '部 | 现库命中:', TOP100.length - missing.length)
console.log('=== 缺口', missing.length, '部 ===')
missing.forEach(m => console.log('  ✗', m))
