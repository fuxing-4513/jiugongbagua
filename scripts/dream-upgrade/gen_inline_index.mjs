/**
 * gen_inline_index.mjs — 生成内联搜索索引（打包进JS，零网络依赖）
 *
 * 背景：部分网络环境下 /data/*.json* 的 fetch 会被 CDN/WAF 拦截，
 * 导致搜索失效。将索引直接编译进页面 chunk 后搜索100%可用。
 *
 * 运行：node scripts/dream-upgrade/gen_inline_index.mjs
 */
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const SRC = join(ROOT, 'public', 'data', 'c5dc0cc7-dreams-c3526e2d.json');
const OUT = join(ROOT, 'src', 'app', 'jiemeng', 'searchIndex.ts');

const raw = JSON.parse(readFileSync(SRC, 'utf-8'));
const dreams = Array.isArray(raw) ? raw : raw.dreams;

// 与轻量索引同构，另带 ancient 供详情兜底展示
const rows = dreams.map(d => ({
  k: d.keyword,
  t: d.title,
  c: d.category,
  g: (d.tags || []).slice(0, 4),
  m: (d.modern || '').replace(/\s+/g, ''),
  a: d.ancient || '',
}));

const header = `// 自动生成（gen_inline_index.mjs）— 勿手改
// 内联搜索索引：随页面代码一起加载，搜索零网络依赖

export interface InlineDreamRow {
  k: string
  t: string
  c: string
  g: string[]
  m: string
  a: string
}

export const SEARCH_INDEX: InlineDreamRow[] = `;

writeFileSync(OUT, header + JSON.stringify(rows) + ';\n', 'utf-8');
console.log(`内联索引已生成: ${rows.length} 条`);
console.log(`文件大小: ${(JSON.stringify(rows).length / 1024 / 1024).toFixed(2)} MB (源码, gzip后约1/4)`);
