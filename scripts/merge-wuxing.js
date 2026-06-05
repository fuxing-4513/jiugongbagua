// 合并多个 wuxing-list 分段文件
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const OUTPUT = path.join(DATA_DIR, 'wuxing-list.json');

// 从临时文件合并
const files = ['jin', 'mu', 'shui', 'huo', 'tu'].map(el => 
  path.join(DATA_DIR, `wuxing-${el}.json`)
);

const allChars = [];
const byElement = {};

for (const f of files) {
  if (!fs.existsSync(f)) {
    console.log(`跳过: ${f} (不存在)`);
    continue;
  }
  const data = JSON.parse(fs.readFileSync(f, 'utf8'));
  const chars = data.chars || [];
  console.log(`${path.basename(f)}: ${chars.length} 字`);
  allChars.push(...chars);
  
  // count
  const el = path.basename(f).replace('wuxing-', '').replace('.json', '');
  byElement[el] = chars.length;
}

const output = {
  generated: new Date().toISOString(),
  source: 'kangxizidian.com.cn',
  total: allChars.length,
  byElement,
  chars: allChars,
};

fs.writeFileSync(OUTPUT, JSON.stringify(output, null, 2), 'utf8');
console.log(`\n✅ 合并完成: ${OUTPUT}`);
console.log(`   总计: ${allChars.length} 字`);
for (const [el, count] of Object.entries(byElement)) {
  const names = { jin: '金', mu: '木', shui: '水', huo: '火', tu: '土' };
  console.log(`   属${names[el]}: ${count} 字`);
}
