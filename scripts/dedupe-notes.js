// 清理重复 authorNote/eraNote（脚本幂等修复——同书同字段同值只留一个）
const fs = require('fs')
const f = 'src/data/xueguan/books.ts'
let s = fs.readFileSync(f, 'utf8')

// 提取所有标注行（字段名+值），对重复的（同书内出现两次同值）删除第二次
const lines = s.split('\n')
let removed = 0
for (let i = 0; i < lines.length; i++) {
  const m = lines[i].match(/^\s*(authorNote|eraNote|sourceNote): '(.+)',\s*$/)
  if (!m) continue
  const field = m[1], val = m[2]
  // 向前找所属书 id（最近出现的 id: '...'）
  let bookId = null
  for (let j = i - 1; j >= Math.max(0, i - 40); j--) {
    const bm = lines[j].match(/^\s*id: '([a-z0-9-]+)',\s*$/)
    if (bm) { bookId = bm[1]; break }
  }
  // 向后找同字段同值
  for (let j = i + 1; j < Math.min(lines.length, i + 40); j++) {
    if (lines[j].includes(`${field}: '${val}'`)) {
      // 确认同一书（中间无 id: 行）
      const between = lines.slice(i + 1, j)
      if (!between.some(l => /^\s*id: '/.test(l))) {
        lines[j] = lines[j].trim() ? '// 重复标注已清理' : lines[j]
        removed++
        break
      }
    }
  }
}
fs.writeFileSync(f, lines.filter(l => l !== '// 重复标注已清理').join('\n'))
console.log('清理重复:', removed)
// 验证
const v = fs.readFileSync(f, 'utf8')
for (const key of ['传统题署刘基', '托名张果', '托名黄帝']) {
  console.log(key, '出现:', v.split(key).length - 1, '次')
}
