/**
 * 修复 wenkuData.ts 中中文引号导致的 TS 编译错误
 * 中文" " → 英文" "（因为外层JSON用"包裹）
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const filePath = path.resolve(__dirname, '../src/app/wenku/wenkuData.ts')

const content = fs.readFileSync(filePath, 'utf8')

// 修复：把 content 和 summary 字段里的中文引号 \u201c \u201d 转成英文双引号
// 注意：因为外层已经用"包裹JSON字段，所以必须转义
function fixEntry(str) {
  return str
    .replace(/[\u201c\u201d]/g, '\\"')  // 中文左/右引号 → 转义英文引号
    .replace(/[\u2018\u2019]/g, "'")    // 中文单引号 → 英文单引号
}

const lines = content.split('\n')
const fixedLines = lines.map(line => {
  // 只处理包含 article 对象的行
  if (!line.match(/\{id:\d+,title:/)) return line

  // 尝试修复 summary 字段
  const summaryMatch = line.match(/summary:"([^"]*?)",date:/)
  if (summaryMatch && summaryMatch[1].includes('\\')) {
    // 已经有\\"转义，没问题
    return line
  }

  // 如果 summary 里包含非转义引号，需要修复
  // 简单做法：把整个行的中文引号全替换
  return fixEntry(line)
})

fs.writeFileSync(filePath, fixedLines.join('\n'), 'utf8')

// 统计
const matchCount = content.match(/[\u201c\u201d]/g)
console.log(`替换前中文引号数量: ${matchCount ? matchCount.length : 0}`)
const afterCount = fixedLines.join('\n').match(/[\u201c\u201d]/g)
console.log(`替换后中文引号数量: ${afterCount ? afterCount.length : 0}`)
console.log('✅ 修复完成')
