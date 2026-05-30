const fs = require('fs');
const p = 'C:/Users/4513/.openclaw/workspace/jiugong-bagua/src/app/xingming/NamingClient.tsx';
const c = fs.readFileSync(p, 'utf8');
const lines = c.split('\n');

// Find ALL key markers
for (let i = 0; i < lines.length; i++) {
  const l = lines[i];
  if (l.includes('export default')) {
    console.log('export default at line:', i+1);
  }
  if (l.includes('const CHAR_POOL')) {
    console.log('const CHAR_POOL at line:', i+1);
  }
  if (l.includes('const STROKE')) {
    console.log('const STROKE at line:', i+1);
  }
}
console.log('Total lines:', lines.length);

// Check the first few and last few lines
console.log('\nLines 415-425:');
for (let i = 414; i < 425 && i < lines.length; i++) {
  console.log((i+1) + ': ' + lines[i].substring(0, 120));
}
