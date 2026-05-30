const fs = require('fs')
const p = 'C:/Users/4513/.openclaw/workspace/jiugong-bagua/src/app/xingming/NamingClient.tsx'
let c = fs.readFileSync(p, 'utf8')

// Find STROKE dict bounds
const start = c.indexOf('const STROKE: Record<string,number> = {')
const end = c.indexOf('};', start) + 2
console.log('STROKE dict at', start, '-', end)

const dict = c.slice(start, end)
// Extract all key:val pairs
const pairs = dict.match(/'[^']+'/g)
const vals = dict.match(/(?<=:\s*)\d+/g)
console.log('pairs:', pairs?.length, 'vals:', vals?.length)

// Build deduped
const seen = new Set()
const out = []
if (pairs && vals) {
  for (let i = 0; i < pairs.length && i < vals.length; i++) {
    if (!seen.has(pairs[i])) {
      seen.add(pairs[i])
      out.push(`  ${pairs[i]}:${vals[i]}`)
    }
  }
}

const newDict = 'const STROKE: Record<string,number> = {\n' + out.join(',\n') + ',\n}'
c = c.slice(0, start) + newDict + c.slice(end)
fs.writeFileSync(p, c)
console.log('STROKE entries:', out.length, '(was', pairs?.length, ')')

// Now check for WUXING_CHARS dict too
const wStart = c.indexOf('const WUXING_CHARS')
const wEnd = c.indexOf('};', c.indexOf('};', wStart) + 100) + 2
console.log('WUXING_CHARS:', c.slice(wStart, wStart + 50), 'end offset', wEnd)
