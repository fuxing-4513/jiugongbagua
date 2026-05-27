const fs = require('fs');
let c = fs.readFileSync('C:/Users/4513/.openclaw/workspace/jiugong-bagua/src/app/xingming/XingmingClient.tsx', 'utf8');

// Extract STROKES section
const start = c.indexOf("const STROKES: Record<string, number> = {");
const end = c.indexOf("function getStroke", start);
if (start < 0) { console.log('STROKES not found'); process.exit(1); }

const before = c.slice(0, start);
const strokesPart = c.slice(start, end);
const after = c.slice(end);

// Extract entries
const entries = [...strokesPart.matchAll(/'([^']+)':(\d+)/g)];
const seen = new Map();
const unique = [];
for (const e of entries) {
  if (!seen.has(e[1])) {
    seen.set(e[1], true);
    unique.push(`'${e[1]}':${e[2]}`);
  }
}

const newStrokes = `const STROKES: Record<string, number> = {\n  ${unique.join(',\n  ')},\n}\n\n`;
fs.writeFileSync('C:/Users/4513/.openclaw/workspace/jiugong-bagua/src/app/xingming/XingmingClient.tsx', before + newStrokes + after);
console.log('Deduplicated:', unique.length, 'entries');
