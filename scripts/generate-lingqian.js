// Generate complete lingqian-data.ts file
const fs = require('fs');
const path = require('path');

const target = path.join(__dirname, 'src', 'app', 'lingqian', 'lingqian-data.ts');

let output = `import { LingqianCategory } from './types'

// ============================================================
// 九宫灵签占卜 - 9种签种完整数据
// 总计 664 签
// ============================================================

`;

// Helper to write a category
function writeCategory(key, name, icon, items) {
  output += `const ${key}: LingqianCategory = {\n`;
  output += `  key: '${key}',\n`;
  output += `  name: '${name}',\n`;
  output += `  icon: '${icon}',\n`;
  output += `  total: ${items.length},\n`;
  output += `  items: [\n`;
  for (const item of items) {
    output += `    {id:${item.id},title:'${item.title}',level:'${item.level}',poem:'${item.poem}',verdict:'${item.verdict}',meaning:'${item.meaning}'},\n`;
  }
  output += `  ]\n`;
  output += `}\n\n`;
}

// 1. 观音灵签 (100签)
const guanyin = require('./temp-guanyin');
writeCategory('guanyin', '观音灵签', '🪷', guanyin);

// 2. 佛祖灵签 (51签)
const fozu = require('./temp-fozu');
writeCategory('fozu', '佛祖灵签', '☸️', fozu);

// 3. 六十甲子签 (60签)
const liushijiazi = require('./temp-liushijiazi');
writeCategory('liushijiazi', '六十甲子签', '☯️', liushijiazi);

// 4. 月老灵签 (101签)
const yuelao = require('./temp-yuelao');
writeCategory('yuelao', '月老灵签', '❤️', yuelao);

// 5. 关帝灵签 (100签)
const guandi = require('./temp-guandi');
writeCategory('guandi', '关帝灵签', '⚔️', guandi);

// 6. 黄大仙灵签 (100签)
const huangdaxian = require('./temp-huangdaxian');
writeCategory('huangdaxian', '黄大仙灵签', '🧧', huangdaxian);

// 7. 吕祖灵签 (100签)
const lvzu = require('./temp-lvzu');
writeCategory('lvzu', '吕祖灵签', '🍶', lvzu);

// 8. 妈祖灵签 (101签)
const mazu = require('./temp-mazu');
writeCategory('mazu', '妈祖灵签', '⛵', mazu);

// 9. 财神灵签 (61签)
const caishen = require('./temp-caishen');
writeCategory('caishen', '财神灵签', '💰', caishen);

// Export all
output += `export const ALL_CATEGORIES: LingqianCategory[] = [\n`;
output += `  guanyin, fozu, liushijiazi, yuelao, guandi,\n`;
output += `  huangdaxian, lvzu, mazu, caishen,\n`;
output += `]\n`;

fs.writeFileSync(target, output, 'utf8');
console.log('File written successfully! Size:', fs.statSync(target).size);
