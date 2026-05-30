// Generator script: builds the complete lingqian-data-remaining.ts
const fs = require('fs');
const dir = 'C:\\Users\\4513\\.openclaw\\workspace\\jiugong-bagua\\src\\app\\lingqian\\';

function esc(s) { return s.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n'); }

let out = "import { LingqianCategory } from './types'\n\n// 9种签种完整数据合并\n// 总计 724 签\n\n";

// Read part files and strip imports/comments
function readPart(p) {
  let t = fs.readFileSync(dir + p, 'utf8');
  return t.split('\n').slice(1).join('\n') + '\n';
}
out += readPart('lingqian-data-part1.ts');
out += readPart('lingqian-data-part2.ts');
out += readPart('lingqian-data-part3.ts');
out += readPart('lingqian-data-part4.ts');

// Now generate remaining 5 categories from data arrays
function genCat(key, name, icon, total, items, num) {
  let s = `\n// ${num}. ${name} (${total}签)\nconst ${key}: LingqianCategory = {\n  key: '${key}',\n  name: '${name}',\n  icon: '${icon}',\n  total: ${total},\n  items: [\n`;
  for (const it of items) {
    s += `    {id:${it[0]},title:'${esc(it[1])}',level:'${it[2]}',poem:'${esc(it[3])}',verdict:'${esc(it[4])}',meaning:'${esc(it[5])}'},\n`;
  }
  s += '  ]\n}\n';
  return s;
}
