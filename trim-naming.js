const fs = require('fs');
const p = 'C:/Users/4513/.openclaw/workspace/jiugong-bagua/src/app/xingming/NamingClient.tsx';
const c = fs.readFileSync(p, 'utf8');
const lines = c.split('\n');
console.log('Total lines:', lines.length);

// Find the second copy start - '// inline'use client''
const dupIdx = lines.findIndex(l => l.includes("inline'use client'") || l.includes('// inline'));
if (dupIdx > 0) {
  const keep = lines.slice(0, dupIdx).join('\n');
  fs.writeFileSync(p, keep);
  console.log('Truncated OK. Now', keep.split('\n').length, 'lines');
  const ec = (keep.match(/export default/g) || []).length;
  console.log('export default count:', ec);
} else {
  console.log('No duplicate boundary found');
}
