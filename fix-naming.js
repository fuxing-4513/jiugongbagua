const fs = require('fs')
const p = 'C:/Users/4513/.openclaw/workspace/jiugong-bagua/src/app/xingming/NamingClient.tsx'
let c = fs.readFileSync(p, 'utf8')

// Find the 4th STROKE definition (the real one)
const parts = c.split(/const STROKE: Record<string,\s*number> = \{/)
// parts[0] is everything before first STROKE
// parts[1]-parts[4] start with the stroke data
// We want parts[4] (the real one) but we also need what follows it
// Actually let's just find where the 4th STROKE block ends
const strokeBlocks = c.match(/const STROKE: Record<string,\s*number> = \{[\s\S]*?\}/g)
console.log('blocks:', strokeBlocks.map(b => b.length))
// Block 3 (0-indexed) should be the real one
const realStroke = strokeBlocks[3]
// Find all code before block 3
let beforeBlock3 = ''
let ptr = 0
for (let i = 0; i < 3; i++) {
  const idx = c.indexOf(strokeBlocks[i], ptr)
  if (idx >= 0) {
    beforeBlock3 += c.slice(ptr, idx)
    ptr = idx + strokeBlocks[i].length
  }
}
// Everything after block 3
const afterBlock3 = c.slice(ptr + strokeBlocks[3].length)

// Deduplicate the real stroke dict
const inner = realStroke.slice(realStroke.indexOf('{') + 1, realStroke.lastIndexOf('}'))
const pairs = inner.match(/'[^']+'/g) || []
const vals = inner.match(/(?<=:\s*)\d+/g) || []
const seen = new Set()
const deduped = []
for (let i = 0; i < pairs.length && i < vals.length; i++) {
  if (!seen.has(pairs[i])) { seen.add(pairs[i]); deduped.push('  ' + pairs[i] + ':' + vals[i]) }
}
const newStroke = 'const STROKE: Record<string, number> = {\n' + deduped.join(',\n') + ',\n}'

// Find the WUXING_CHARS dict too - should be right after STROKE
const wcIdx = afterBlock3.indexOf('const WUXING_CHARS')
let middleContent = ''
let remaining = afterBlock3
if (wcIdx >= 0) {
  middleContent = afterBlock3.slice(0, wcIdx)
  // Skip to the real function definitions
  // Find 'function getStroke' or 'export default'  
  remaining = afterBlock3.slice(wcIdx)
}

// Also deduplicate WUXING_CHARS
const wcEnd = remaining.indexOf('};') + 2
const wcDict = remaining.slice(0, wcEnd)
const wcInner = wcDict.slice(wcDict.indexOf('{') + 1, wcDict.lastIndexOf('}'))
// Find all entries like '键':['木',16] or '键': {wx: '木', stroke: 9}
// WUXING_CHARS format varies - just keep what we have

// Now rebuild: use client + imports + stroke + rest
const header = "'use client'\n\nimport { useState, useCallback } from 'react'\nimport { Solar, Lunar } from 'lunar-typescript'\nimport { useLocale } from '@/lib/i18n'\n\n"
// Find tk function in beforeBlock3
let tkFn = 'function tk(key: string, lang: Record<string, unknown>): string {\n  const keys = key.split(\'.\'); let v: unknown = lang\n  for (const k of keys) { if (typeof v !== \'object\' || v === null) return key; v = (v as Record<string, unknown>)[k] }\n  return typeof v === \'string\' ? v : key\n}\n\n'

let afterDicts = ''
// Find where the POEM_NAMES or the real code starts
const poemIdx = remaining.indexOf('const POEM_NAMES')
const funcIdx = remaining.indexOf('function ')
const exportIdx = remaining.indexOf('export default')

// Pick earliest meaningful content
const nextIdx = Math.min(
  poemIdx >= 0 ? poemIdx : Infinity,
  funcIdx >= 0 ? funcIdx : Infinity,
  exportIdx >= 0 ? exportIdx : Infinity
)
if (nextIdx < Infinity) {
  afterDicts = remaining.slice(nextIdx)
}

// But we also need GU_POEM_DATA from beforeBlock3
let poemData = ''
const gpdIdx = beforeBlock3.indexOf('const GU_POEM_DATA')
if (gpdIdx >= 0) {
  const gpdEnd = beforeBlock3.indexOf('};', beforeBlock3.indexOf('};', beforeBlock3.indexOf('};', gpdIdx) + 1) + 1) + 2
  poemData = beforeBlock3.slice(gpdIdx, gpdEnd)
}

// Also grab WUXING_CHARS from the remaining content
let wxChars = ''
const wxCIdx = remaining.indexOf('WUXING_CHARS')
if (wxCIdx >= 0) {
  // Find its end - look for '};' after it
  let wxCStart = remaining.lastIndexOf('const', wxCIdx)
  if (wxCStart < 0) wxCStart = wxCIdx
  const wxCEnd = remaining.indexOf('};', wxCStart) + 2
  wxChars = remaining.slice(wxCStart, wxCEnd)
}

// Also grab CHAR_POOL
let charPool = ''
const cpIdx = remaining.indexOf('const CHAR_POOL')
if (cpIdx >= 0) {
  let cpStart = remaining.lastIndexOf('const', cpIdx)
  if (cpStart < 0) cpStart = cpIdx
  // CHAR_POOL might span many lines, find the closing })
  let depth = 0, cpEnd = -1
  for (let i = cpStart; i < remaining.length; i++) {
    if (remaining[i] === '{') depth++
    else if (remaining[i] === '}') { depth--; if (depth === 0) { cpEnd = i + 1; break } }
  }
  if (cpEnd > cpStart) charPool = remaining.slice(cpStart, cpEnd)
}

// GRAB HOUR_OPTS, HOUR_DZ, SHI_CHEN_DIZHI etc from the function content if exist
// Build final file
const final = header + tkFn + newStroke + '\n\n' + wxChars + '\n' + charPool + '\n' + poemData + '\n' + afterDicts
fs.writeFileSync(p, final)
console.log('final size:', final.length)
console.log('has export default:', final.includes('export default'))
console.log('has STROKE:', final.includes('STROKE:'))
console.log('has POEM_NAMES:', final.includes('POEM_NAMES'))
