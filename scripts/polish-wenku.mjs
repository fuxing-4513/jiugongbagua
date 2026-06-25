/**
 * polish-wenku.mjs - 文库文章第二轮精修
 * 
 * 修复：重复词组、残留占位符、过度模板化表达
 * 增加：每个字不同的内容风格（随机化段落结构）
 */

import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join } from 'path';

const QUEUE_DIR = 'scripts/wenku-queue';

// 修复规则
const FIXES = [
  // 重复词修复
  { from: /寓意寓意/g, to: '寓意' },
  { from: /期望期望/g, to: '期望' },
  { from: /特质特质/g, to: '特质' },
  { from: /含义含义/g, to: '含义' },
  { from: /适合适合/g, to: '适合' },
  { from: /搭配搭配/g, to: '搭配' },
  { from: /谨慎谨慎/g, to: '谨慎' },
  { from: /字形字形/g, to: '字形' },
  { from: /演变演变/g, to: '演变' },
  
  // 残留占位符修复
  { from: /——紧密相关/g, to: '有着直接联系' },
  { from: /紧密相关紧密相关/g, to: '有直接关系' },
  { from: /紧密相关的/g, to: '相关的' },
  
  // less模板化句尾
  { from: /古籍释义与起名应用。/g, to: '' },
  { from: /摘要:\s*$/gm, to: '摘要: ' },
  
  // 去掉多余空行
  { from: /\n\n\n+/g, to: '\n\n' },
];

// 段落结构随机化——打乱段落顺序/换句式
function shuffleParagraphs(content, zi) {
  // 把"字源与古籍""五行属性依据""本义与引申""命局适配""经典搭配"段落拆开重新编排
  const sections = content.split('\n## ');
  if (sections.length < 3) return content;
  
  // 第一个section(标题+摘要)不动
  const header = sections[0];
  const bodySections = sections.slice(1);
  
  // 检查是不是标准的五个段
  const sectionNames = bodySections.map(s => s.split('\n')[0].trim());
  const knownSections = ['字源与古籍出处', '字源与古籍', '五行属性依据', '本义与引申', '命局适配', '经典搭配'];
  const isStandard = sectionNames.every(n => knownSections.some(k => n.startsWith(k)));
  
  if (!isStandard || bodySections.length < 3) return content;
  
  // 每篇文章有概率微调
  if (Math.random() > 0.3) return content; // 70%保持原序
  
  // 找"经典搭配"段移到前面（偶尔换顺序增加多样性）
  const classicIdx = bodySections.findIndex(s => s.startsWith('经典搭配'));
  const mingjuIdx = bodySections.findIndex(s => s.startsWith('命局适配'));
  
  if (classicIdx >= 0 && mingjuIdx >= 0 && Math.random() > 0.5) {
    // 把命局适配和经典搭配交换顺序
    [bodySections[mingjuIdx], bodySections[classicIdx]] = [bodySections[classicIdx], bodySections[mingjuIdx]];
  }
  
  return header + '\n## ' + bodySections.join('\n## ');
}

// === 主流程 ===
const files = readdirSync(QUEUE_DIR).filter(f => f.startsWith('name-') && f.endsWith('.txt'));
console.log(`总${files.length}篇`);

let polished = 0;
for (let i = 0; i < files.length; i++) {
  const f = files[i];
  const content = readFileSync(join(QUEUE_DIR, f), 'utf-8');
  if (content.length < 400) continue;
  
  const zi = f.replace('name-', '').replace('.txt', '');
  let result = content;
  let changed = false;
  
  // 应用修复
  for (const fix of FIXES) {
    if (fix.from.test(result)) {
      result = result.replace(fix.from, fix.to);
      changed = true;
    }
  }
  
  // 段落随机化
  const shuffled = shuffleParagraphs(result, zi);
  if (shuffled !== result) {
    result = shuffled;
    changed = true;
  }
  
  if (changed) {
    writeFileSync(join(QUEUE_DIR, f), result, 'utf-8');
    polished++;
  }
  
  if ((i + 1) % 300 === 0) {
    console.log(`进度: ${i+1}/${files.length}, 已精修${polished}篇`);
  }
}

console.log(`精修完成！总${files.length}篇，${polished}篇有变动`);
