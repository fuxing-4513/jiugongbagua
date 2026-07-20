/**
 * inject-security-headers.mjs
 * 构建后脚本：在 out/ 目录中给所有 HTML 注入安全 meta 标签
 *
 * v2.5 - 新增 CSP 策略和 XSS 防护
 */

import { readFileSync, writeFileSync, readdirSync, existsSync, statSync } from 'fs';
import { join, extname } from 'path';

const OUT_DIR = join(process.cwd(), 'out');

// ── CSP meta 标签 ──
// 由于 GitHub Pages 无法设置 HTTP 头，通过 meta 标签实现 CSP
const CSP_META = `<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://hm.baidu.com https://*.baidu.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://hm.baidu.com; font-src 'self' data:; frame-src 'none'; object-src 'none'; base-uri 'self'">`;

// ── X-Content-Type-Options meta 标签 ──
const XCONTENT_META = `<meta http-equiv="X-Content-Type-Options" content="nosniff">`;

// ── Referrer-Policy meta 标签 ──
const REFERRER_META = `<meta name="referrer" content="strict-origin-when-cross-origin">`;

// ── Permissions-Policy meta 标签 ──
const PERMISSIONS_META = `<meta http-equiv="Permissions-Policy" content="camera=(), microphone=(), geolocation=()">`;

// ── 所有 meta 集合 ──
const META_TAGS = [CSP_META, XCONTENT_META, REFERRER_META, PERMISSIONS_META].join('\n');

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
  } catch (e) {}
  return files;
}

function injectIntoHtml(filePath) {
  let html = readFileSync(filePath, 'utf-8');

  // 不在已经包含 CSP 的页面重复注入
  if (html.includes('http-equiv="Content-Security-Policy"')) return false;

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

  console.log(`✅ ${injected}/${htmlFiles.length} 个文件已注入安全 meta`);
  console.log(`⚠️  跳过 ${htmlFiles.length - injected} 个文件`);
}

main();
