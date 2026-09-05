// 给争议/托名古籍加 authorNote/eraNote（文献可信度层）
const fs = require('fs')
const f = 'src/data/xueguan/books.ts'
let s = fs.readFileSync(f, 'utf8')

// [bookId, 字段, 值]
const notes = [
  ['ditian-sui', 'authorNote', '传统题署刘基（刘伯温），现代学术普遍认为系后世依托，今传本经清代任铁樵增注阐发而成（即《滴天髓阐微》）。'],
  ['guolao-xingzong', 'authorNote', '旧题唐张果（张果老）撰，属托名——现存系统形成于明代（托名张果以增重）。'],
  ['yuzhao-dingzhen', 'authorNote', '旧题晋郭璞撰，属托名——四库馆臣已辨其为依托，约成于五代至宋初。'],
  ['huangdi-yinfujing', 'authorNote', '传统托名黄帝，作者不可考。'],
  ['huangdi-yinfujing', 'eraNote', '成书年代存争议：战国至汉代间成书为通行说法，亦有学者主张约六朝——本站底本依《道藏》李筌注本系统。'],
]

for (const [id, field, val] of notes) {
  // 幂等：该字段值已存在则跳过
  if (s.includes(`${field}: '${val.replace(/'/g, "\\'")}'`)) { console.log('已存在跳过:', id, field); continue }
  // 找该书 author 行后的插入锚：该书的 volumes 或 isComplete 行（对象内稳定字段）
  const re = new RegExp(`id: '${id}',([\\s\\S]*?)(\\n\\s*)(volumes|isComplete):`)
  const m = s.match(re)
  if (!m) { console.log('未找到:', id); continue }
  const anchor = m[0].replace(/[\s\S]*\n\s*(volumes|isComplete):/, '$1:')
  // 简单处理：在 matched 尾（即 volumes/isComplete 行开头）前插
  const full = m[0]
  const lastIdx = full.lastIndexOf('\n')
  const head = full.slice(0, lastIdx)
  const tail = full.slice(lastIdx)
  const ind = tail.match(/^\n(\s*)/)[1]
  const line = `${ind}${field}: '${val.replace(/'/g, "\\'")}',`
  s = s.replace(full, head + '\n' + line + tail)
  console.log('已标注:', id, field)
}
fs.writeFileSync(f, s)
console.log('完成')
