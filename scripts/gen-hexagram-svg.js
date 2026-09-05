// 生成周易 64 卦象 SVG（解析 zhouyi.ts 章节标题 → 六爻卦画）
const fs = require('fs')
const path = require('path')

// 八卦三爻（下→上）：1阳 0阴
const TRIGRAM = {
  '乾': [1, 1, 1], '兑': [1, 1, 0], '离': [1, 0, 1], '震': [1, 0, 0],
  '巽': [0, 1, 1], '坎': [0, 1, 0], '艮': [0, 0, 1], '坤': [0, 0, 0],
}

const src = fs.readFileSync('src/data/xueguan/content/zhouyi.ts', 'utf8')
// 匹配章节块: title: '第N卦 · 名（上X下Y）',
const chs = [...src.matchAll(/title: '第[^']*卦 · ([^（]+)（([^上]+)上([^下]+)下）'/g)]
console.log('解析到卦章节:', chs.length)

const outDir = path.join('public/images/xueguan/zhouyi')
fs.mkdirSync(outDir, { recursive: true })

let ok = 0
chs.forEach((m, idx) => {
  const [, name, upper, lower] = m
  const up = TRIGRAM[upper.trim()]
  const low = TRIGRAM[lower.trim()]
  if (!up || !low) { console.error('未知卦:', upper, lower); return }
  const lines = [...low, ...up] // 从下(初)到上(上)六爻
  // 爻画：阳=实线，阴=两段断线——从下往上排
  const svg = [
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 190" width="160" height="152">',
    '<style>.y{stroke-linecap:round}</style>',
  ]
  for (let i = 0; i < 6; i++) {
    const y = 160 - i * 24
    const yang = lines[i] === 1
    if (yang) {
      svg.push(`<line class="y" x1="45" y1="${y}" x2="155" y2="${y}" stroke="#b08d2e" stroke-width="14"/>`)
    } else {
      svg.push(`<line class="y" x1="45" y1="${y}" x2="95" y2="${y}" stroke="#b08d2e" stroke-width="14"/>`)
      svg.push(`<line class="y" x1="105" y1="${y}" x2="155" y2="${y}" stroke="#b08d2e" stroke-width="14"/>`)
    }
  }
  // 卦名小字
  svg.push(`<text x="100" y="184" text-anchor="middle" font-size="13" fill="#987818" font-family="serif">第${idx + 1}卦 · ${name.trim()}</text>`)
  svg.push('</svg>')
  const id = 'h' + String(idx + 1).padStart(2, '0')
  fs.writeFileSync(path.join(outDir, id + '.svg'), svg.join('\n'))
  ok++
})
console.log('生成卦象 SVG:', ok, '个 →', outDir)
