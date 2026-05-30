const fs = require('fs');
const p = 'C:/Users/4513/.openclaw/workspace/jiugong-bagua/src/app/xingming/NamingClient.tsx';
const c = fs.readFileSync(p, 'utf8');
const lines = c.split('\n');

// Look for where the export default appears in the first copy
// Before L418 there should be structual elements
for (let i = 0; i < 420; i++) {
  const l = lines[i];
  if (l.includes('const CHAR_POOL') || l.includes('export default function') || l.includes('function generateNames') || l.includes('CHAR_POOL:')) {
    console.log('L' + (i+1) + ': ' + l.substring(0, 100));
  }
}
console.log('\n--- Checking where first copy ends ---');
// Look for 'return' or JSX closing in the first half
for (let i = 390; i < 420; i++) {
  const l = lines[i];
  if (l.includes('const CHAR_POOL') || l.includes('})') || l.includes('</div>') || l.includes('}>') || l.includes('} //')) {
    console.log('L' + (i+1) + ': ' + l.substring(0, 150));
  }
}
