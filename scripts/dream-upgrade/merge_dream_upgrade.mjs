/**
 * merge_dream_upgrade.mjs — 周公解梦数据库升级脚本
 *
 * 功能：
 * 1. 读取 scripts/dream-upgrade/premium_batch_*.json 深度精写词条
 * 2. 与现有数据库按关键词匹配：命中则替换升级，未命中则新增
 * 3. 清理重复关键词（保留内容最丰富的一条）
 * 4. 输出统计报告
 *
 * 运行：node scripts/dream-upgrade/merge_dream_upgrade.mjs
 */
import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const DATA_FILE = join(ROOT, 'public', 'data', 'c5dc0cc7-dreams-c3526e2d.json');
const BATCH_DIR = join(ROOT, 'scripts', 'dream-upgrade');

// ── 加载现有数据库 ──
const raw = JSON.parse(readFileSync(DATA_FILE, 'utf-8'));
const dreams = Array.isArray(raw) ? raw : raw.dreams;
console.log(`现有数据库: ${dreams.length} 条`);

// ── 加载所有精写批次 ──
const batchFiles = readdirSync(BATCH_DIR).filter(f => f.startsWith('premium_batch_') && f.endsWith('.json')).sort();
let premium = [];
for (const f of batchFiles) {
  const items = JSON.parse(readFileSync(join(BATCH_DIR, f), 'utf-8'));
  premium.push(...items);
  console.log(`  ${f}: ${items.length} 条`);
}
console.log(`精写词条合计: ${premium.length} 条`);

// ── 工具：内容丰富度 ──
const richness = d => (d.modern?.length || 0) + (d.detail?.length || 0);

// ── 第一步：去重现有库（同关键词保留最丰富的一条）──
const byKeyword = new Map();
for (const d of dreams) {
  const prev = byKeyword.get(d.keyword);
  if (!prev || richness(d) > richness(prev)) byKeyword.set(d.keyword, d);
}
const dedupedCount = dreams.length - byKeyword.size;
console.log(`\n清理重复关键词: ${dedupedCount} 条`);

// ── 第二步：合并精写词条（替换或新增）──
let replaced = 0, added = 0;
for (const p of premium) {
  // 匹配规则：keyword 完全一致，或现有 keyword/title 包含精写关键词（如"掉牙"匹配"梦见掉牙"）
  let targetKey = null;
  if (byKeyword.has(p.keyword)) {
    targetKey = p.keyword;
  } else {
    for (const key of byKeyword.keys()) {
      if ((byKeyword.get(key).title || '').includes(p.keyword) || key.includes(p.keyword)) {
        // 防误伤：关键词太短(单字)时要求完全一致才替换
        if (p.keyword.length >= 2 || key === p.keyword) { targetKey = key; break; }
      }
    }
  }
  if (targetKey) {
    // 替换：以精写版为主，保留原条目的分类（若冲突以精写为准）
    byKeyword.set(targetKey, { ...byKeyword.get(targetKey), ...p });
    replaced++;
  } else {
    byKeyword.set(p.keyword, p);
    added++;
  }
}
console.log(`精写合并: 替换升级 ${replaced} 条, 新增 ${added} 条`);

// ── 第三步：输出 ──
const merged = [...byKeyword.values()];
// 保持结构 { dreams: [...] } 或原样输出数组
if (Array.isArray(raw)) {
  writeFileSync(DATA_FILE, JSON.stringify(merged), 'utf-8');
} else {
  writeFileSync(DATA_FILE, JSON.stringify({ ...raw, dreams: merged }), 'utf-8');
}
console.log(`\n✅ 升级完成: ${dreams.length} → ${merged.length} 条`);
console.log(`文件大小: ${(JSON.stringify(merged).length / 1024 / 1024).toFixed(2)} MB`);

// ── 统计深度分布变化 ──
const lens = merged.map(d => (d.modern?.length || 0) + (d.detail?.length || 0));
console.log(`深度解读(>500字): ${lens.filter(l => l > 500)} 条`.replace('>500字): ', '>500字): ') + '');
console.log(`  >200字: ${lens.filter(l => l > 200).length}`);
console.log(`  <=80字(一句话): ${lens.filter(l => l <= 80).length}`);
