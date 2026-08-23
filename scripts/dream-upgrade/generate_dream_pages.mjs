/**
 * generate_dream_pages.mjs — 生成解梦词条 SEO 落地页数据
 *
 * 为每个词条生成独立落地页 /jiemeng/[slug]：
 *   - slug = 拼音式安全化关键词（这里用 keyword 直接 URL 编码，Next 支持中文路由）
 *   - 页面含完整解读(古籍/白话/场景/心理学) + 结构化数据(JSON-LD) + 内链
 *
 * 运行：node scripts/dream-upgrade/generate_dream_pages.mjs
 */
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const SRC = join(ROOT, 'public', 'data', 'c5dc0cc7-dreams-c3526e2d.json');
const OUT_DIR = join(ROOT, 'src', 'app', 'jiemeng', 'dream-data');
mkdirSync(OUT_DIR, { recursive: true });

const raw = JSON.parse(readFileSync(SRC, 'utf-8'));
const dreams = Array.isArray(raw) ? raw : raw.dreams;

// slug 化：中文保留，特殊字符替换
function toSlug(d) {
  return encodeURIComponent(d.keyword)
    .replace(/[%()（）\s.]/g, '')
    .toLowerCase();
}

// 只为"有实质内容"的词条生成页面（detail >= 60字），上限全量
const pages = dreams
  .filter(d => (d.detail || '').length >= 40 && d.title)
  .map(d => {
    const slug = toSlug(d);
    return {
      slug,
      keyword: d.keyword,
      title: d.title,
      category: d.category,
      tags: d.tags || [],
      ancient: d.ancient || '',
      modern: d.modern || '',
      detail: d.detail || '',
      psychologyNote: d.psychologyNote || '',
      mood: d.mood || '',
    };
  });

// 去重 slug
const seen = new Set();
const unique = pages.filter(p => !seen.has(p.slug) && seen.add(p.slug));

console.log(`生成落地页数据: ${unique.length} 条`);

// 写成多个分片文件（避免单文件过大导致 TS 编译慢）
const CHUNK = 800;
let fileIdx = 0;
for (let i = 0; i < unique.length; i += CHUNK) {
  const chunk = unique.slice(i, i + CHUNK);
  const varName = `dreamPages_${fileIdx}`;
  const content = `// 自动生成 — 勿手改 (generate_dream_pages.mjs)\nimport type { DreamPageData } from './types';\n\nexport const ${varName}: DreamPageData[] = ${JSON.stringify(chunk)};\n`;
  writeFileSync(join(OUT_DIR, `part${fileIdx}.ts`), content, 'utf-8');
  console.log(`  part${fileIdx}.ts: ${chunk.length} 条`);
  fileIdx++;
}

// 类型定义与聚合入口
const typeDef = `// 自动生成 — 勿手改
export interface DreamPageData {
  slug: string
  keyword: string
  title: string
  category: string
  tags: string[]
  ancient: string
  modern: string
  detail: string
  psychologyNote: string
  mood: string
}
`;
writeFileSync(join(OUT_DIR, 'types.ts'), typeDef, 'utf-8');

const imports = [];
for (let i = 0; i < fileIdx; i++) imports.push(`import { dreamPages_${i} } from './part${i}'`);
const indexContent = `${typeDef}\n${imports.join('\n')}\n\nexport const dreamPages: DreamPageData[] = [\n  ${Array.from({length: fileIdx}, (_, i) => `...dreamPages_${i}`).join(',\n  ')}\n];\n`;
writeFileSync(join(OUT_DIR, 'index.ts'), indexContent, 'utf-8');

console.log(`✅ 共 ${fileIdx} 个分片 + types.ts + index.ts`);
