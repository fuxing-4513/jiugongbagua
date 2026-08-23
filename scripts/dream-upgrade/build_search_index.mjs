/**
 * build_search_index.mjs — 生成解梦轻量搜索索引
 *
 * 索引只含关键词/标题/分类/标签/摘要前80字（~几百KB），
 * 页面秒开秒搜；完整数据(几MB)后台懒加载，仅在查看详情时需要。
 *
 * 运行：node scripts/dream-upgrade/build_search_index.mjs
 * （数据更新后、构建前运行）
 */
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const SRC = join(ROOT, 'public', 'data', 'c5dc0cc7-dreams-c3526e2d.json');
const OUT = join(ROOT, 'public', 'data', 'c5dc0cc7-dreams-index-c3526e2d.json');

const raw = JSON.parse(readFileSync(SRC, 'utf-8'));
const dreams = Array.isArray(raw) ? raw : raw.dreams;

const index = dreams.map(d => ({
  k: d.keyword,
  t: d.title,
  c: d.category,
  g: (d.tags || []).slice(0, 4),
  m: (d.modern || '').replace(/\s+/g, '').slice(0, 72),
}));

writeFileSync(OUT, JSON.stringify(index));
console.log(`索引生成完成: ${index.length} 条`);
console.log(`索引大小: ${(JSON.stringify(index).length / 1024).toFixed(0)} KB`);
