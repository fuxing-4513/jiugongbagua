const fs = require('fs');
const c = fs.readFileSync('C:/Users/4513/.openclaw/workspace/jiugong-bagua/src/app/xingming/NamingClient.tsx', 'utf8');
const lines = c.split('\n');
console.log('Total lines:', lines.length);

// Identify lines > 500 chars
const longLines = [];
lines.forEach((l, i) => {
  if (l.length > 500) longLines.push({ line: i+1, len: l.length });
});
console.log('Lines > 500 chars:');
longLines.forEach(ll => console.log(`  L${ll.line}: ${ll.len} chars`));

// Show the full content of each long line
for (const ll of longLines) {
  console.log(`\n=== L${ll.line} (${ll.len} chars) ===`);
  console.log(lines[ll.line - 1]);
}
