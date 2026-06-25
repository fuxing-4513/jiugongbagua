/**
 * rewrite-wenku.mjs - 文库文章AI打磨（去AIGC特征+差异化改写）
 * 
 * 策略：对每篇文章替换模板化段落为多样化表达，不改变核心内容
 * 运行：node scripts/rewrite-wenku.mjs
 */

import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join } from 'path';

const QUEUE_DIR = 'scripts/wenku-queue';

// 多样化替换词库
const VARIANTS = {
  // 开头变体
  intro: [
    (zi, stroke, el) => `说起「${zi}」这个字，很多人首先想到的是……`,
    (zi, stroke, el) => `「${zi}」字在姓名学中属${stroke}画${el}行，今天就从根上聊聊这个字。`,
    (zi, stroke, el) => `「${zi}」是一个很有深度的字，${stroke}画、五行属${el}。`,
    (zi, stroke, el) => `从姓名学角度看，「${zi}」字（${stroke}画/${el}行）值得好好说道说道。`,
    (zi, stroke, el) => `我们今天要聊的这个字——「${zi}」，${stroke}画属${el}，在命理上有自己独特的定位。`,
  ],
  // 说文引用变体
  shuowen: [
    (text) => text,
    (text) => `《说文解字》的解释是：「${text}」`,
    (text) => `按《说文》的说法——「${text}」`,
    (text) => `翻开《说文解字》，上面写着：「${text}」`,
    (text) => `在《说文》中，对这个字的诠释是：「${text}」`,
    (text) => `《说文解字》对此字有精确的解说：「${text}」`,
  ],
  // 五行依据变体
  wuxing: [
    (zi, stroke, el) => `从数理五行体系来看，${stroke}画归入${el}行。`,
    (zi, stroke, el) => `在姓名学数字五行框架中，${stroke}画对应的是${el}行。`,
    (zi, stroke, el) => `${zi}字${stroke}画，按五行配数属于${el}。`,
    (zi, stroke, el) => `数理上，${stroke}画为${el}行，这是姓名学沿用已久的配属规则。`,
    (zi, stroke, el) => `按照传统姓名学五格数理，${stroke}画的${zi}字五行属${el}。`,
  ],
  // 本义引申变体
  benyi: [
    (zi) => `从本义层层展开，${zi}引申出……`,
    (zi) => `由本义出发，${zi}的含义不断扩展——`,
    (zi) => `看完了本义，再看它的引申义：`,
    (zi) => `本义是基础，在此基础上引申出的含义包括：`,
    (zi) => `这个字的核心意思就是开头说的，由此延伸开来——`,
  ],
  // 命局适配变体
  mingju: [
    (el) => `在八字命局中，补${el}的日主选这个字比较合适。`,
    (el) => `如果你是八字需补${el}的类型，这个字正对路。`,
    (el) => `这个字对命局${el}偏弱的人有补充作用。`,
    (el) => `八字缺${el}的人，这个字是加分项。`,
    (el) => `从五行平衡来看，适合命局${el}不足的人使用。`,
  ],
  // 搭配变体
  dafeng: [
    () => `搭配方面，与相生五行配合使用效果更好。`,
    () => `与其他字配合时，建议参考生克关系来选择。`,
    () => `取名搭配的话，和它相生的五行字比较协调。`,
    () => `在姓名组合中，和它能形成顺畅生克关系的字是首选。`,
  ],
};

function applyVariants(content, zi, stroke, el, shuowenQuote) {
  let result = content;
  
  // 替换说文引用
  if (shuowenQuote) {
    const swPattern = /(《说文解字》(?:对此字|对此|)的解说[是：。][^《]*)(")/;
    const swVariants = VARIANTS.shuowen;
    const swChoice = swVariants[Math.floor(Math.random() * swVariants.length)];
    const swText = swChoice(shuowenQuote);
    const swRegex = /《说文解字》(?:对此字|对此|)的解说[是：。][^《]*/;
    if (swRegex.test(result)) {
      result = result.replace(swRegex, swText);
    }
  }
  
  // 替换五行依据
  const wxRegex = /从数理五行体系来看，\d+画归入\w+行。/;
  if (wxRegex.test(result)) {
    const wxVariants = VARIANTS.wuxing;
    const wxChoice = wxVariants[Math.floor(Math.random() * wxVariants.length)];
    result = result.replace(wxRegex, wxChoice(zi, stroke, el));
  }
  
  // 替换第二句五行依据
  const wxRegex2 = /在姓名学数字五行框架中，\d+画对应的是\w+行。|按姓名学数理五行体系归为\w+行。|按五行配数属于\w+。|数理上，\d+画为\w+行，这是姓名学沿用已久的配属规则。/;
  if (!wxRegex2.test(result)) {
    // 尝试替换另一种形式
    const altRegex = /按姓名学数理五行体系归为\w+行。/;
    if (altRegex.test(result)) {
      const wxVariants = VARIANTS.wuxing;
      const wxChoice = wxVariants[Math.floor(Math.random() * wxVariants.length)];
      result = result.replace(altRegex, wxChoice(zi, stroke, el));
    }
  }
  
  // 替换命局适配
  const mjRegex = /(适合：.*八字需补\w+的日主[^。]*。)/;
  if (mjRegex.test(result)) {
    const mjVariants = VARIANTS.mingju;
    const mjChoice = mjVariants[Math.floor(Math.random() * mjVariants.length)];
    result = result.replace(mjRegex, mjChoice(el));
  }
  
  // 替换搭配
  const dpRegex = /搭配方面，与相生五行配合使用效果更好。/;
  if (dpRegex.test(result)) {
    const dpVariants = VARIANTS.dafeng;
    const dpChoice = dpVariants[Math.floor(Math.random() * dpVariants.length)];
    result = result.replace(dpRegex, dpChoice());
  }
  
  return result;
}

function shouldRewrite(fileName) {
  const content = readFileSync(join(QUEUE_DIR, fileName), 'utf-8');
  // 只改写大于1KB且有模板特征的文章
  if (content.length < 800) return false;
  // 检测是否包含模板特征
  const templateSigns = [
    '从数理五行体系来看',
    '在姓名学数字五行框架中',
    '《说文解字》载',
    '本义与引申',
    '命局适配',
    '经典搭配',
  ];
  return templateSigns.some(s => content.includes(s));
}

// 从内容中提取字、笔画、五行、说文引用
function extractMeta(content) {
  const zi = content.match(/「([一-龥])」字/)?.[1] || '';
  const stroke = content.match(/(\d+)画/)?.[1] || '';
  const el = content.match(/五行属(\w+)/)?.[1] || (content.includes('金') ? '金' : content.includes('木') ? '木' : content.includes('水') ? '水' : content.includes('火') ? '火' : content.includes('土') ? '土' : '');
  const shuowenQuote = content.match(/《说文解字》载[：:][「「]?([^」」。]*)/)?.[1] || '';
  return { zi, stroke, el, shuowenQuote };
}

// === 主流程 ===
const files = readdirSync(QUEUE_DIR).filter(f => f.startsWith('name-') && f.endsWith('.txt'));
console.log(`总文件数: ${files.length}`);

let rewritten = 0;
for (let i = 0; i < files.length; i++) {
  const f = files[i];
  if (!shouldRewrite(f)) continue;
  
  const content = readFileSync(join(QUEUE_DIR, f), 'utf-8');
  const meta = extractMeta(content);
  if (!meta.zi) continue;
  
  const newContent = applyVariants(content, meta.zi, meta.stroke, meta.el, meta.shuowenQuote);
  if (newContent !== content) {
    writeFileSync(join(QUEUE_DIR, f), newContent, 'utf-8');
    rewritten++;
  }
  
  if ((i + 1) % 200 === 0) {
    console.log(`进度: ${i+1}/${files.length}, 已改写${rewritten}篇`);
  }
}

console.log(`改写完成！总${files.length}篇，改写${rewritten}篇`);
