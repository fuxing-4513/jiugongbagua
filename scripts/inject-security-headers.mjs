/**
 * inject-security-headers.mjs
 * 构建后脚本：在 out/ 目录中给所有 HTML 注入 CSP meta 标签
 * 
 * 用途：Cloudflare Free 计划无 Transform Rules 且可能覆盖 _headers，
 * 通过在 HTML 中写 meta 标签来强制安全策略（CSP 等），不受 HTTP 头覆盖影响。
 * 
 * 在构建后运行：node scripts/inject-security-headers.mjs
 * 会自动修改 out/ 下所有 .html 文件
 */

import { readFileSync, writeFileSync, readdirSync, existsSync, statSync } from 'fs';
import { join, extname } from 'path';

const OUT_DIR = join(process.cwd(), 'out');

// ── CSP 策略 · 内容安全策略（meta 标签版本） ──
const CSP_META = `<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval' https://hm.baidu.com https://*.baidu.com https://www.googletagmanager.com;
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: blob: https:;
  font-src 'self' data:;
  connect-src 'self' https://hm.baidu.com https://*.baidu.com https://www.googletagmanager.com;
  frame-src 'self';
  object-src 'none';
  media-src 'self';
  block-all-mixed-content;
  upgrade-insecure-requests;
">`;

// ── Referrer-Policy meta 标签 ──
const REFERRER_META = `<meta name="referrer" content="strict-origin-when-cross-origin">`;

// ── Permissions-Policy meta 标签 ──
const PERMISSIONS_META = `<meta http-equiv="Permissions-Policy" content="camera=(), microphone=(), geolocation=(), interest-cohort=()">`;

// ── 反爬虫 meta 标签 ──
const ANTIBOT_META = `<meta name="robots" content="noarchive,nosnippet">`;

// ── 需要注入的 meta 集合 ──
const META_TAGS = [CSP_META, REFERRER_META, PERMISSIONS_META, ANTIBOT_META].join('\n');

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
  
  // 检查是否已有 CSP meta（避免重复注入）
  if (html.includes('Content-Security-Policy')) {
    console.log(`  ⏭️ 已有 CSP, 跳过: ${filePath.replace(OUT_DIR, '')}`);
    return false;
  }

  // 在 </head> 前注入 meta 标签
  if (html.includes('</head>')) {
    html = html.replace('</head>', `${META_TAGS}\n</head>`);
    writeFileSync(filePath, html, 'utf-8');
    return true;
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

  console.log(`✅ ${injected}/${htmlFiles.length} 个文件已注入安全 meta 标签`);
  console.log(`⚠️  未修改 ${htmlFiles.length - injected} 个文件（已有 CSP 或非标准 HTML）`);
}

main();
