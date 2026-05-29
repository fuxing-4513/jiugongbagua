const fs = require('fs')
const c = fs.readFileSync('C:/Users/4513/.openclaw/workspace/jiugong-bagua/src/app/huangli/HuangliClient.tsx','utf8').replace(/\r\n/g,'\n')
const lines = c.split('\n')

// Find the two sections
const solarLine = lines.findIndex(l => l.includes('二十四节气表'))
const shiChenLine = lines.findIndex(l => l.includes('老黄历吉时查询'))
console.log('Solar line:', solarLine+1)
console.log('ShiChen line:', shiChenLine+1)

// Find solar section boundaries (starts with <div className="bg-white, ends at next <!-- comment or file end)
const solarDivLine = lines.slice(0, solarLine+1).reduce((acc, l, i) => l.includes('<div className="bg-white') ? i : acc, -1)
console.log('Solar div at line:', solarDivLine+1)

// Find next section comment after solar
let solarEndLine = -1
for (let i = solarLine + 1; i < lines.length; i++) {
  if (lines[i].includes('</>') || lines[i].includes('){') && lines[i].trim() === '}') {
    // Actually, find the closing </div> of the outer container
  }
  if (lines[i].includes('{/*') && i > solarLine + 5) {
    solarEndLine = i
    break
  }
}
console.log('Solar end (next comment) at line:', solarEndLine+1)

// ShiChen div
const shiChenDiv = lines.slice(0, shiChenLine+1).reduce((acc, l, i) => l.includes('<div className="bg-white') ? i : acc, -1)
console.log('ShiChen div at line:', shiChenDiv+1)

// Find shiChen section end (next comment after shiChen or end of file)
let shiChenEndLine = -1
for (let i = shiChenLine + 1; i < lines.length; i++) {
  if (lines[i].includes('{/*') && i > shiChenLine + 5) {
    shiChenEndLine = i
    break
  }
}
console.log('ShiChen end at line:', shiChenEndLine+1)

// Now extract the exact lines for each section
// Solar: from solarDivLine to solarEndLine (exclusive)
const solarSection = lines.slice(solarDivLine, solarEndLine)
console.log('Solar section:', solarSection.length, 'lines')
console.log('First line:', solarSection[0])
console.log('Last line:', solarSection[solarSection.length-1])

// ShiChen: from shiChenDiv to shiChenEndLine (exclusive)
const shiChenSection = lines.slice(shiChenDiv, shiChenEndLine)
console.log('ShiChen section:', shiChenSection.length, 'lines')
console.log('First line:', shiChenSection[0])
console.log('Last line:', shiChenSection[shiChenSection.length-1])
