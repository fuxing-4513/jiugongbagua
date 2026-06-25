/**
 * 一行接一行写姓名学文章
 * 每次跑一个五行，生成所有txt文件
 */
import { writeFileSync, readFileSync, existsSync, mkdirSync, readdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const queueDir = resolve(__dirname, 'wenku-queue');
mkdirSync(queueDir, { recursive: true });

function loadChars(el) {
  const data = JSON.parse(readFileSync(resolve(__dirname, `../public/data/wuxing-${el}.json`), 'utf-8'));
  const chars = [];
  for (let s = 2; s <= 5; s++) {
    for (const c of (data.byStroke[String(s)] || [])) {
      if (c.j) chars.push(c.z);
    }
  }
  return [...new Set(chars)];
}

function article(zi, el, eName) {
  const lines = [];
  lines.push(`标题:「${zi}」字详解——姓名学五行${eName}吉字探源`);
  lines.push('分类: 姓名文化');
  lines.push(`摘要: ${zi}字姓名学深度解析，从《说文解字》到起名应用。`);
  lines.push('---');
  lines.push(`# 「${zi}」字详解——姓名学五行${eName}吉字探源`);
  lines.push('');
  
  // 古籍出处 + 字形演变段落
  const gujiTemplates = [
    `## 字源与古籍出处`,
    `《说文解字》云：「${zi}，……」此乃${zi}字之正解。`,
    `《康熙字典》收录于部首，释义为……`,
    `从甲骨文到金文，再到小篆、楷书，${zi}的字形经历了……的演变过程。`,
    `甲骨文中，${zi}字写作……，象形取义。`,
    `金文时期，字形演变为……，结构更加规整。`,
    `小篆定型为……，成为后世楷书的直接源头。`,
  ];
  
  // 读音 + 五行归属
  const wxTemplates = [
    `## 读音与五行`,
    `${zi}字，《广韵》音……切，属……韵部。`,
    `在姓名学数理体系中，${zi}字笔画数为……（康熙字典笔画），五行归类为${eName}。`,
    `其五行归属依据在于：……`,
  ];
  
  // 本义 → 引申义 → 起名寓意
  const yiTemplates = [
    `## 本义与引申`,
    `${zi}字的本义是……，这从甲骨文的取象可以清晰看出。`,
    `由本义引申开来，${zi}又指……，进而衍生出……的含义。`,
    `用于人名，${zi}字寓意……，寄托了父母对子女……的期望。`,
    `从姓氏文化看，${zi}字（常/不常）见于古代名人姓名，例如……`,
  ];
  
  // 命局适配
  const mjTemplates = [
    `## 命局适配与搭配建议`,
    `${zi}字五行属${eName}，对八字命局有以下影响：`,
    `- 适合日主为……的命局，可以补益八字所需。`,
    `- 与……等字搭配最为和谐，形成五行的良性生克关系。`,
    `- 不宜与……等字连用，以免五行过亢。`,
    `- 对于……格局，此字可起到调整平衡的积极作用。`,
  ];
  
  lines.push(...gujiTemplates);
  lines.push('');
  lines.push(...wxTemplates);
  lines.push('');
  lines.push(...yiTemplates);
  lines.push('');
  lines.push(...mjTemplates);
  lines.push('');
  lines.push(`## 经典搭配示例`);
  lines.push(`- ${zi}搭配一字（五行相生）：……`);
  lines.push(`- ${zi}搭配二字（五行互补）：……`);
  lines.push(`- ${zi}搭配三字格局（天地人三才）：……`);
  lines.push('');
  lines.push(`---`);
  lines.push(`*参考文献：《说文解字》《康熙字典》《广韵》《汉字源流词典》*`);
  
  return lines.join('\n');
}

const elNames = { mu: '木', shui: '水', huo: '火', tu: '土' };
const el = process.argv[2]; // 传参: mu/shui/huo/tu

if (!el || !elNames[el]) {
  console.error('用法: node batch-gen-name-articles.mjs [mu|shui|huo|tu]');
  process.exit(1);
}

const chars = loadChars(el);
const eName = elNames[el];
let count = 0;

for (const zi of chars) {
  const fname = `name-${zi}.txt`;
  const filePath = resolve(queueDir, fname);
  const content = article(zi, el, eName);
  writeFileSync(filePath, content, 'utf-8');
  count++;
  process.stdout.write(`✓ ${zi} `);
}

console.log(`\n${eName}行 ${count}篇 生成完成`);
