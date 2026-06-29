/**
 * inject-security-headers.mjs
 * 构建后脚本：在 out/ 目录中给所有 HTML 注入安全 meta 标签
 *
 * 适用于静态站点无 HTTP 头的场景。
 * 注意：CSP 已在 layout.tsx 中硬编码，此脚本只补充非 CSP 的安全标签。
 */

import { readFileSync, writeFileSync, readdirSync, existsSync, statSync } from 'fs';
import { join, extname } from 'path';

const OUT_DIR = join(process.cwd(), 'out');

// ── Referrer-Policy meta 标签 ──
const REFERRER_META = `<meta name="referrer" content="strict-origin-when-cross-origin">`;

// ── Permissions-Policy meta 标签 ──
const PERMISSIONS_META = `<meta http-equiv="Permissions-Policy" content="camera=(), microphone=(), geolocation=()">`;

// ── 需要注入的 meta 集合 ──
const META_TAGS = [REFERRER_META, PERMISSIONS_META].join('\n');

function walkDir(dir) {
  const files = [];
  try {
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry);
      if (statSync(full).isDirectory()) {
        files.push(...walkDir(full));
      } else if (extname(full) === '.html') {
        files.push(full);
      }
    }
  } catch (e) {
    // dir might not exist
  }
  return files;
}

function injectIntoHtml(filePath) {
  let html = readFileSync(filePath, 'utf-8');

  // 在 </head> 前注入 meta 标签（仅在不存在时）
  if (!html.includes('name="referrer"') && !html.includes('Permissions-Policy')) {
    if (html.includes('</head>')) {
      html = html.replace('</head>', `${META_TAGS}\n</head>`);
      writeFileSync(filePath, html, 'utf-8');
      return true;
    }
  }
  
  return false;
}

function main() {
  if (!existsSync(OUT_DIR)) {
    console.error(`❌ ${OUT_DIR} 目录不存在。请先运行 next build`);
    process.exit(1);
  }

  const htmlFiles = walkDir(OUT_DIR);
  console.log(`找到 ${htmlFiles.length} 个 HTML 文件`);

  let injected = 0;
  for (const f of htmlFiles) {
    if (injectIntoHtml(f)) injected++;
  }

  console.log(`✅ ${injected}/${htmlFiles.length} 个文件已注入安全 meta`);
  console.log(`⚠️  跳过 ${htmlFiles.length - injected} 个文件`);
}

main();
