const fs = require('fs');

// The problem: xe.txt has everything from getCharWuxing onward on a single line.
// I need to split it into proper multi-line format.

const broken = fs.readFileSync('C:/Users/4513/.openclaw/workspace/jiugong-bagua/src/app/xingming/NamingClient.tsx', 'utf8');
const xe = fs.readFileSync('C:/Users/4513/.openclaw/workspace/jiugong-bagua/src/app/xingming/xe.txt', 'utf8');

// Read lines 1-246 from broken (correct first half)
const brokenLines = broken.split('\n');
const firstPart = brokenLines.slice(0, 246).join('\n');

// From xe.txt, find CHARS_WX and extract formatted continuation
const charsIdx = xe.indexOf('const CHARS_WX:');
const afterChars = xe.substring(charsIdx);

const weiStr = "'炜':'火'";
const weiIdx = afterChars.indexOf(weiStr);
const charsEnd = afterChars.indexOf('}', weiIdx) + 1;

const unformattedBlock = afterChars.substring(weiIdx, charsEnd);
// Format: each entry on its own line
const entries = unformattedBlock.split(',');
const formattedLines = entries.map(e => {
  const t = e.trim();
  if (!t) return '';
  if (t === '}') return '}';
  return '  ' + t;
}).filter(l => l.length > 0);
const formattedChars = formattedLines.join(',\n') + ',';

// Now handle the rest after CHARS_WX
const restAfterClose = xe.substring(charsIdx + charsEnd + 1);
// This is: function getCharWuxing...followed by const SHENG_CYCLE...etc., all on one/two lines

// Insert newlines before each known section marker
let rest = restAfterClose;

// Split into sections by known top-level constructs
// Top-level things: functions, const definitions, export default
const sections = [];
let remaining = rest;

// Known section markers in order:
const sectionMarkers = [
  { name: 'getCharWuxing', marker: 'function getCharWuxing' },
  { name: 'SHENG_CYCLE', marker: 'const SHENG_CYCLE:' },
  { name: 'KE_CYCLE', marker: 'const KE_CYCLE:' },
  { name: 'analyzeWuxing', marker: 'function analyzeWuxing' },
  { name: 'SHI_CHEN_GAN', marker: 'const SHI_CHEN_GAN:' },
  { name: 'SHI_CHEN_DIZHI', marker: 'const SHI_CHEN_DIZHI:' },
  { name: 'NAYIN', marker: 'const NAYIN:' },
  { name: 'calcBazi', marker: 'function calcBazi' },
  { name: 'TIAN_GAN', marker: 'const TIAN_GAN' },
  { name: 'DI_ZHI', marker: 'const DI_ZHI' },
  { name: 'WX_TG', marker: 'const WX_TG:' },
  { name: 'WX_DZ', marker: 'const WX_DZ:' },
  { name: 'charWx', marker: 'function charWx' },
  { name: 'checkCharWx', marker: 'function checkCharWx' },
  { name: 'CHAR_POOL', marker: 'const CHAR_POOL:' },
  { name: 'HOUR_OPTS', marker: 'const HOUR_OPTS:' },
  { name: 'getHourDz', marker: 'function getHourDz' },
  { name: 'genNameResult', marker: 'interface NameResult' },
  { name: 'generateNames', marker: 'function generateNames' },
  { name: 'export', marker: 'export default function NamingClient' },
];

// Find positions
const positions = sectionMarkers.map(s => {
  const idx = remaining.indexOf(s.marker);
  return { ...s, idx };
}).filter(p => p.idx >= 0).sort((a, b) => a.idx - b.idx);

console.log('Found sections:');
positions.forEach(p => console.log(`  ${p.name} at ${p.idx} "${p.marker}"`));

// Extract formatted sections
const formattedRest = [];
let prevEnd = 0;
for (let i = 0; i < positions.length; i++) {
  const cur = positions[i];
  const next = positions[i + 1];
  const end = next ? next.idx : remaining.length;
  const content = remaining.substring(cur.idx, end).trim();
  formattedRest.push(content);
}

const secondPart = formattedRest.join('\n\n');
// But wait - content between markers also gets included in the join
// Actually 'remaining.substring(cur.idx, end)' already captures exactly what's after each marker
// So let me rebuild differently

// Better approach: use these positions as split points  
const restParts = [];
let cursor = 0;
for (let i = 0; i < positions.length; i++) {
  const p = positions[i];
  // Include any content before this marker (but only if we haven't captured it)
  if (p.idx > cursor) {
    restParts.push(remaining.substring(cursor, p.idx).trim());
  }
  restParts.push(remaining.substring(p.idx, p.idx + p.marker.length));
  cursor = p.idx + p.marker.length;
}
if (cursor < remaining.length) {
  restParts.push(remaining.substring(cursor).trim());
}

// Filter empty parts
const filteredParts = restParts.filter(p => p.length > 0);

// Rejoin
// Each section starts with its marker, followed by content until next marker
// We need to format the content (the part after the marker) with newlines

// Let me try differently - just insert \n before each marker
let result = remaining;
for (let i = positions.length - 1; i >= 0; i--) {
  const p = positions[i];
  if (p.idx > 0) {
    result = result.substring(0, p.idx) + '\n\n' + result.substring(p.idx);
  }
}

// Some markers like 'const TIAN_GAN' may also match 'const TIAN_GAN = {...}' which is fine

// Also format the long single-line data blocks (CHAR_POOL, HOUR_OPTS, etc.)
// CHAR_POOL has entries like '字':'五行', compacted
// HOUR_OPTS has entries like {v:'0',l:'子时 23:00-00:59'}, compacted

// Format CHAR_POOL (should have 木火土金水 arrays)
// Each array is like:
//   '林','森','柏',... (all on one line)
// Insert newlines every ~5 entries to make it readable but not break
// Actually let me just keep the compact format for these huge data arrays, but split at array boundaries

// Let me write the assembled file and check
const part2Lines = result.split('\n').map(l => l.trim()).filter(l => l.length > 0);
const final = firstPart + '\n' + formattedChars + '\n\n' + part2Lines.join('\n');

fs.writeFileSync('C:/Users/4513/.openclaw/workspace/jiugong-bagua/src/app/xingming/NamingClient.tsx', final, 'utf8');
console.log('Written. Length:', final.length, 'bytes');

// Verify
const c = fs.readFileSync('C:/Users/4513/.openclaw/workspace/jiugong-bagua/src/app/xingming/NamingClient.tsx', 'utf8');
const cl = c.split('\n');
console.log('Lines:', cl.length);

let longOnes = 0;
cl.forEach((line, i) => {
  if (line.length > 500) { longOnes++; if (longOnes <= 5) console.log(`Long: L${i+1}: ${line.length} chars`); }
});
console.log('Total long lines (>500):', longOnes);

const markers = [
  'const STROKE:', 'const WXC:', 'const NUM_DETAIL:', 'const SANCAI_MAP:',
  'const POEM_NAMES:', 'const CHARS_WX:', 'const SHENG_CYCLE:', 'const KE_CYCLE:',
  'function getCharWuxing', 'function analyzeWuxing', 'const SHI_CHEN_GAN:',
  'const SHI_CHEN_DIZHI:', 'const NAYIN:', 'function calcBazi', 'const TIAN_GAN',
  'const DI_ZHI', 'const WX_TG:', 'const WX_DZ', 'function charWx',
  'function checkCharWx', 'const CHAR_POOL:', 'const HOUR_OPTS:',
  'function getHourDz', 'interface NameResult', 'function generateNames',
  'export default function NamingClient'
];
for (const m of markers) {
  const re = new RegExp(m.replace(/[:\-\(\)]/g, '\\$&'), 'g');
  const count = (c.match(re) || []).length;
  if (count > 1) console.log('DUPL:', m, count);
  else if (count === 0) console.log('MISS:', m);
}
