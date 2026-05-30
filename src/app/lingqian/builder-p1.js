// Part 1: Build existing data header
const fs = require('fs');
const dir = 'C:\\Users\\4513\\.openclaw\\workspace\\jiugong-bagua\\src\\app\\lingqian\\';

let out = "import { LingqianCategory } from './types'\n\n// 9种签种完整数据合并\n// 总计 724 签\n\n";

// Read part files
['lingqian-data-part1.ts','lingqian-data-part2.ts','lingqian-data-part3.ts','lingqian-data-part4.ts'].forEach(f => {
  let t = fs.readFileSync(dir + f, 'utf8');
  let lines = t.split('\n');
  lines.shift(); // strip import or comment
  out += lines.join('\n') + '\n';
});

fs.writeFileSync(dir + 'lingqian-data-remaining.ts', out, 'utf8');
console.log('Phase 1: written existing 4 cats, size=' + fs.statSync(dir + 'lingqian-data-remaining.ts').size);
