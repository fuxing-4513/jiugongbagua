const fs = require('fs');
const f = 'C:/Users/4513/.openclaw/workspace/jiugong-bagua/src/app/bazi/BaziClient.tsx';
let c = fs.readFileSync(f, 'utf8');
c = c.replace(
  'function mk(gz, gan, zhi) {',
  'function mk(gz: string, gan: string, zhi: string): any {'
);
fs.writeFileSync(f, c, 'utf8');
console.log('types fixed');
