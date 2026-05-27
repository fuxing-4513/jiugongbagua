const fs = require('fs');
const path = 'C:/Users/4513/.openclaw/workspace/jiugong-bagua/src/app/xingming/XingmingClient.tsx';
let c = fs.readFileSync(path, 'utf8');

// Find STROKES definition boundaries
const startIdx = c.indexOf('const STROKES: Record<string, number> = {');
const endMatch = c.match(/\/\/ ── 81数理吉凶/);
const endIdx = endMatch ? endMatch.index : c.indexOf('const WUGE_81:');

const before = c.slice(0, startIdx);
const dictBlock = c.slice(startIdx, endIdx);

// Extract all entries and deduplicate
const entries = [...dictBlock.matchAll(/'([^']+)':(\d+)/g)];
const seen = new Set();
const unique = [];
for (const e of entries) {
  if (!seen.has(e[1])) {
    seen.add(e[1]);
    unique.push("'" + e[1] + "':" + e[2]);
  }
}

const newDict = `const STROKES: Record<string, number> = {\n  ${unique.join(',\n  ')},\n}\n\n`;

const after = c.slice(endIdx);
fs.writeFileSync(path, before + newDict + after);
console.log('OK - deduplicated to', unique.length, 'entries');
