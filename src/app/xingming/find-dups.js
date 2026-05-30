const c = require('fs').readFileSync('C:/Users/4513/.openclaw/workspace/jiugong-bagua/src/app/xingming/NamingClient.tsx', 'utf8');
const charsIdx = c.indexOf('const CHARS_WX:');
const charsEnd = c.indexOf('}', charsIdx);
const charsContent = c.substring(charsIdx, charsEnd + 1);

const entries = charsContent.match(/'[^']+':'(?:木|火|土|金|水)'/g) || [];
const counts = {};
const dups = [];
for (const e of entries) {
  const key = e.split("':")[0];
  const val = e.split("'")[5] || e.split("'")[3];
  if (counts[key]) { dups.push(key + ' (' + val + ')'); }
  counts[key] = (counts[key] || 0) + 1;
}
console.log('Duplicates:', dups.join(', '));
for (const k of Object.keys(counts).filter(k => counts[k] > 1)) {
  console.log(k + ' appears ' + counts[k] + ' times');
}
