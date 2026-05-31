const fs = require('fs');
const c = fs.readFileSync('./src/app/cezi/ceziDict.ts', 'utf8');
const entries = c.match(/'[\u4e00-\u9fff]':\s*\{/g);
console.log('entries:', entries?.length);
if (entries && entries.length > 0) {
  const chars = entries.map(e => e[1]);
  const unique = [...new Set(chars)];
  console.log('unique chars:', unique.length);
  const ext = chars.filter(ch => ch.charCodeAt(0) >= 0x4E00 && ch.charCodeAt(0) <= 0x9FFF);
  console.log('BMP U4E00-U9FFF:', ext.length);

  // Check common coverage
  const common = '的一不是了人';  // brief sample
  const hasCommon = chars.filter(ch => common.includes(ch));
  console.log('common present:', hasCommon.length, '/', common.length);
}
