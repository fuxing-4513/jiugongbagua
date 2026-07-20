# 安全审计报告 — jiugongbagua.com

**审计日期:** 2026-07-20  
**项目路径:** `/home/openclaw/.openclaw/workspace/temp_repo`  
**目标域名:** jiugongbagua.com (GitHub Pages / Cloudflare Pages 静态站点)  
**审计范围:** 依赖漏洞、敏感文件暴露、前端安全、配置安全、部署安全

---

## 严重 (必须立即修复)

### S-01 内网 IP 地址泄露至生产 CSP
| 字段 | 内容 |
|------|------|
| **位置** | `src/app/layout.tsx` 第 54 行 |
| **问题描述** | CSP 的 `connect-src` 中硬编码了 `http://172.23.127.193:3000`。该内网 IPv4 地址暴露在构建产物中，攻击者可通过查看页面源码探知开发环境网络拓扑。 |
| **建议修复** | 从生产 CSP 中移除该地址。若为本地开发调试所需，应通过环境变量在构建时动态注入，且生产环境禁止包含。 |
| **严重性** | 信息泄露 — 内网地址暴露 |

### S-02 硬编码地理位置坐标在公开 API 端点
| 字段 | 内容 |
|------|------|
| **位置** | `public/api/v2/users/list.json` |
| **问题描述** | 该 JSON 文件包含 `{"users":[{"id":1,"username":"root","x_icbm":"31.2304,121.4737"}]}`，硬编码了上海地区的精确经纬度坐标，且使用 `root` 用户名。该文件部署后任何人可访问。 |
| **建议修复** | 删除该文件。如果这是测试数据，确保 `robots.txt` 条目的 `Disallow: /api/` 已被搜索引擎遵守，但手动请求仍可访问。彻底移除该文件。 |
| **严重性** | 敏感数据暴露 |

### S-03 构建产物 (`out/`) 中备份 HTML 文件重复部署
| 字段 | 内容 |
|------|------|
| **位置** | `out/aisage-dialog-backup.html` (已存在于 `out/` 构建输出中) |
| **问题描述** | `public/aisage-dialog-backup.html` 被复制到 `out/`，作为可访问的 HTML 页面暴露。这相当于部署了完整的备份页面，包含完整的内联 CSS/JS 和 CSP 策略副本。 |
| **建议修复** | 删除 `public/aisage-dialog-backup.html` 并在 `.gitignore` 中添加相关备份模式。备份文件不应放在 `public/` 目录下。 |
| **严重性** | 部署了不应存在的页面资源 |

---

## 高

### H-01 public/ 目录中存在多个可公开访问的备份文件
| 字段 | 内容 |
|------|------|
| **位置** | `public/index.html.bak`, `public/index-nextjs-backup.html`, `public/index-nextjs-backup.html.bak`, `public/aisage-dialog-backup.html` |
| **问题描述** | 共 4 个备份/遗留 HTML 部署在 `public/`，所有静态站点生成器都会将 `public/` 中的文件原样复制到输出。这些文件不再被使用，但可被任何人浏览。文件总大小约 178KB。 |
| **建议修复** | 立即删除所有 `.bak` 和 `*-backup*` 文件。备份应放在项目根目录下的 `backups/` 或通过 `git` 历史管理。 |
| **严重性** | 信息泄漏 — 旧版页面可被直接访问 |

### H-02 CSP 使用 `'unsafe-inline'` 导致 XSS 防御弱化
| 字段 | 内容 |
|------|------|
| **位置** | `src/app/layout.tsx` 第 49 行 |
| **问题描述** | `script-src 'self' 'unsafe-inline' ...` 允许所有内联脚本执行。任何存储型/反射型 XSS 漏洞都可被利用，因为 `unsafe-inline` 绕过了 CSP 脚本白名单保护。虽然百度统计需要 `unsafe-inline`，但这显著降低了整体安全性。 |
| **建议修复** | 考虑使用 `nonce` 或 `strict-dynamic` 策略替代 `unsafe-inline`。百度统计可通过 `nonce` 机制或使用其 `hm.js` 的 CDN 地址加 `'unsafe-hashes'` 来兼容。 |
| **严重性** | XSS 防御被大幅削弱 |

### H-03 `force-deploy.js` 包含开发者本机 Windows 绝对路径
| 字段 | 内容 |
|------|------|
| **位置** | `force-deploy.js` 第 4-5 行 |
| **问题描述** | 硬编码了 `C:\\Users\\4513\\.openclaw\\workspace\\jiugong-bagua`，暴露了本地文件系统结构、用户名和开发环境路径。部署脚本不应包含与运行环境无关的绝对路径。 |
| **建议修复** | 重构部署脚本使用相对路径或通过 `__dirname` 构建路径。移除硬编码的开发者本地路径，或使用环境变量注入。 |
| **严重性** | 本地环境信息暴露 |

### H-04 备份 HTML 中 `frame-ancestors '*'` 与当前策略冲突
| 字段 | 内容 |
|------|------|
| **位置** | `public/index.html.bak` (内嵌 HTML 中的 CSP) |
| **问题描述** | 当前 `layout.tsx` 使用 `frame-ancestors 'none'`（拒绝被嵌入 iframe），但备份 HTML 中使用了 `frame-ancestors '*'`（允许任何站点嵌入）。如果有攻击者引用旧版本或存在缓存不一致，可能导致点击劫持。 |
| **建议修复** | 删除所有备份 HTML 文件。确保 GitHub Pages / Cloudflare Pages 缓存刷新。 |
| **严重性** | 点击劫持风险 |

### H-05 `public/data/v2/users_profile.json` 模拟用户数据接口
| 字段 | 内容 |
|------|------|
| **位置** | `public/data/v2/users_profile.json` |
| **问题描述** | 该文件模拟了一个 POST 端点结构，包含 `{"method": "POST", "fields": ["username", "email", "phone"]}`。虽然没有真实数据，但暴露了设计中的用户数据收集字段（用户名、邮箱、手机号），暗示存在或计划存在的表单。 |
| **建议修复** | 移除此 JSON 文件。如果用于前端 Mock，应通过构建工具在开发环境使用而非部署到 `public/`。 |
| **严重性** | 数据收集模式泄露 |

---

## 中

### M-01 依赖漏洞: postcss XSS 通过 next 传递
| 字段 | 内容 |
|------|------|
| **位置** | `package.json` → `next@16.2.6` 依赖链 → `postcss (<8.5.10)` |
| **问题描述** | `npm audit` 发现 1 个 moderate 漏洞: `GHSA-qx2v-qp2m-jg93` — PostCSS 在 CSS stringify 输出中存在 XSS 漏洞 (CVSS 6.1)，影响版本 `<8.5.10`。受影响的 `postcss` 是 Next.js 16.2.6 的间接依赖。 |
| **建议修复** | 等待 Next.js 更新其 postcss 依赖版本。可使用 `overrides` 字段强制升级 postcss 到 `^8.5.10`（如果兼容）。 |
| **严重性** | CVSS 6.1 (Moderate) |

### M-02 CSP `connect-src` 包含 `http://localhost:3000`
| 字段 | 内容 |
|------|------|
| **位置** | `src/app/layout.tsx` 第 54 行 |
| **问题描述** | 生产环境 CSP 的 `connect-src` 中保留了 `http://localhost:3000`。任何具备同站点脚本执行能力的攻击者都可以向本地开发服务器发送请求（SSRF），或利用本地运行的恶意服务。 |
| **建议修复** | 使用环境变量区分开发/生产 CSP。生产环境移除 `localhost` 和 `172.23.127.193`。 |
| **严重性** | 本地服务 SSRF 风险 |

### M-03 `anti-scrape.ts` 反爬逻辑全在客户端执行
| 字段 | 内容 |
|------|------|
| **位置** | `src/lib/anti-scrape.ts` |
| **问题描述** | 反爬虫功能通过文件名混淆（随机前缀+哈希）、蜜罐端点、浏览器特征检测三种机制实现，全部在客户端 JS 中运行。有经验的攻击者可以：1) 通过浏览器 DevTools 直接读取 JS 源码中的 `FILE_MAP` 解密实际文件名；2) 通过 Puppeteer/Playwright 模拟真实浏览器指纹绕过检测；3) `detectScraper()` 的所有检测点都是已知的反检测绕过目标。蜜罐文件在客户端触发，对服务器端 API 爬取无防护。 |
| **建议修复** | 对于纯静态站点，客户端反爬效果有限且增加包体积。建议：1) 如果使用 Cloudflare，启用 Bot Fight Mode 或 WAF 规则；2) 如果文件需要保护，考虑服务器端鉴权；3) 降低反爬逻辑复杂度，避免蜜罐端点为攻击者提供攻击面。 |
| **严重性** | 安全幻觉 — 保护可被轻松绕过 |

### M-04 缺少 `sitemap.xml` 文件
| 字段 | 内容 |
|------|------|
| **位置** | `public/sitemap.xml` |
| **问题描述** | 项目没有 `sitemap.xml`，搜索引擎无法全面发现站点页面。虽然不影响安全性，但结合 `robots.txt` 中没有明确允许/禁止路径时，可能导致搜索引擎索引到敏感 JSON 数据文件。 |
| **建议修复** | 为静态站点生成 `sitemap.xml`，确保搜索引擎发现合法页面而非数据文件。 |
| **严重性** | 索引透明度缺陷 |

### M-05 GitHub Actions 工作流缺少对 `pages` 环境的限制
| 字段 | 内容 |
|------|------|
| **位置** | `.github/workflows/deploy.yml` |
| **问题描述** | 工作流仅在 `master` 分支推送和手动触发时运行。但 `workflow_dispatch` 允许任何人（有仓库权限时）手动触发部署。没有分支保护规则和部署环境审批。`id-token: write` 权限用于 OIDC JWT 令牌，如果恶意 PR 或 Actions 注入成功，可获取短时效部署凭证。 |
| **建议修复** | 1) 添加 `branches: [master]` 到 `workflow_dispatch` 限制（GitHub 原生不支持，但可加 `if: github.ref == 'refs/heads/master'`）；2) 考虑添加 `environment` 审批规则用于生产部署。 |
| **严重性** | 未授权触发部署风险 |

---

## 低

### L-01 `dangerouslySetInnerHTML` 在文库页面未使用 DOM Purify
| 字段 | 内容 |
|------|------|
| **位置** | `src/app/wenku/[slug]/page.tsx` 第 37 行 |
| **问题描述** | 文库文章内容通过 `dangerouslySetInnerHTML` 渲染。代码注释说明内容来自编译期静态 `wenkuData.ts`，不含用户输入。但如果有任何生成流程被攻破或引入了用户提供的文本，会导致 XSS。项目已安装 `dompurify` 但未在关键路径使用。 |
| **建议修复** | 在 `art.fullContent.replace()` 结果上使用 `DOMPurify.sanitize()` 作为纵深防御。另外在 `layout.tsx` 的 `JSON.stringify` 块中同样使用了 `dangerouslySetInnerHTML`，建议外包给安全的 JSON-LD 注入方案。 |
| **严重性** | 纵深防御缺失 |

### L-02 CSP 中 `block-all-mixed-content` 指令已废弃
| 字段 | 内容 |
|------|------|
| **位置** | `src/app/layout.tsx` 第 58 行 |
| **问题描述** | `block-all-mixed-content` CSP 指令已被现代浏览器弃用（Chrome 已移除支持）。`upgrade-insecure-requests` 已涵盖其功能。该指令没有实际效果，但可能造成虚幻的安全感。 |
| **建议修复** | 移除 `block-all-mixed-content`，保留 `upgrade-insecure-requests`。 |
| **严重性** | 无实际安全效果 |

### L-03 CNAME 文件域名不一致
| 字段 | 内容 |
|------|------|
| **位置** | `force-deploy.js` 第 24 行 (`jiugongbagua.com`) vs `package.json` 第 16 行 (`www.jiugongbagua.com`) |
| **问题描述** | `force-deploy.js` 写入 CNAME 为 `jiugongbagua.com`（裸域），而 `package.json` 的 `postbuild` 脚本写入的是 `www.jiugongbagua.com`。两处部署的目标域名不一致，可能导致 GitHub Pages 自定义域名配置冲突。 |
| **建议修复** | 统一使用同一个 CNAME 值，建议使用 `www.jiugongbagua.com` 配合裸域 CNAME 跳转。 |
| **严重性** | 部署配置不一致 |

### L-04 ESLint 忽略规则排除了 JS 文件审查
| 字段 | 内容 |
|------|------|
| **位置** | `eslint.config.mjs` 第 16-17 行 |
| **问题描述** | ESLint 配置忽略了 `src/app/xingming/*.js` 和 `src/app/lingqian/*.js`。这些 JS 文件中的代码不经过 lint 检查，可能包含安全问题或编码缺陷。 |
| **建议修复** | 改为 TypeScript 文件或将其移出 `src/` 到独立的 scripts/ 目录。如果需要保留 JS 文件，添加明确的自定义 lint 规则。 |
| **严重性** | 代码审查盲区 |

### L-05 `_headers` 文件缺少 CSP 头配置
| 字段 | 内容 |
|------|------|
| **位置** | `public/_headers` |
| **问题描述** | `_headers` 配置文件设置了 `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`, CORS 头，但没有设置 `Content-Security-Policy`。CSP 仅在 HTML `<meta>` 标签中设置。Cloudflare Pages 和 GitHub Pages 都支持通过 `_headers` 添加 CSP 响应头，HTML meta 方式优先级较低且对某些资源类型不生效。 |
| **建议修复** | 在 `_headers` 中添加 `Content-Security-Policy` 条目作为冗余。注意 meta 标签和 HTTP 头之间的 CSP 策略会合并，必须确保一致。 |
| **严重性** | CSP 部署方式不够健壮 |

### L-06 `test-worker.html` 暴露 Worker API URL
| 字段 | 内容 |
|------|------|
| **位置** | `public/test-worker.html` |
| **问题描述** | 测试页面对 `aisage-api.4513.workers.dev/aisage/status` 进行 fetch 调用并显示结果。该页面在部署后可被任何人访问，可能便于攻击者侦察 Cloudflare Worker 后端接口。虽然该 Worker URL 已在 CSP 中列出，测试页面的存在增加了不必要的攻击面。 |
| **建议修复** | 删除该测试页面或在部署时通过 `.gitignore` / 构建排除。 |
| **严重性** | 攻击面最小化 |

---

## 信息 (参考建议)

### I-01 反爬虫策略设计评价
| 字段 | 内容 |
|------|------|
| **位置** | `src/lib/anti-scrape.ts` |
| **问题描述** | 反爬策略的设计具有创造性：文件名混淆（`7f3a9b1e-*-d84f07a2` 模式）、蜜罐端点、浏览器特征检测、随机延时等。该方案在纯静态站点场景下是合理的轻量防护。但需理解其局限性：所有混淆逻辑均在客户端源码中可逆，`detectScraper()` 使用的 `navigator.webdriver` 和插件检测等可被 Puppeteer Stealth 插件绕过。 |
| **建议** | 保持现状但降低预期。如果数据敏感度增加，应迁移到需要 API 密钥/限流的服务端方案。 |

### I-02 DOMPurify 已安装但使用不足
| 字段 | 内容 |
|------|------|
| **位置** | `package.json` → `dompurify: ^3.4.11` |
| **问题描述** | 项目已依赖 `dompurify`（最新版 ^3.4.11），这是一个好的安全实践。但审计中发现，存在 `dangerouslySetInnerHTML` 的位置并未实际调用 DOMPurify。建议统一加固。 |
| **建议** | 在所有 `dangerouslySetInnerHTML` 使用前调用 `DOMPurify.sanitize()`。 |

### I-03 `productionBrowserSourceMaps: false` 良好实践
| 字段 | 内容 |
|------|------|
| **位置** | `next.config.ts` 第 14 行 |
| **问题描述** | 正确配置了禁用生产环境的浏览器端 Source Map，防止爬虫获取 TypeScript 源码结构。同时 Webpack 配置关闭了 `devtool` 并启用了 TerserPlugin 压缩混淆。 |
| **建议** | 继续保持。 |

### I-04 权限策略良好但可更严格
| 字段 | 内容 |
|------|------|
| **位置** | `public/_headers` (Permissions-Policy) |
| **问题描述** | Permissions-Policy 已禁用了 camera, microphone, geolocation, interest-cohort。但未禁用 `accelerometer`, `gyroscope`, `magnetometer`, `battery`, `usb` 等。 |
| **建议** | 考虑添加 `accelerometer=(), gyroscope=(), magnetometer=(), battery=(), usb=(), display-capture=()"` 以最小化设备 API 暴露。 |

### I-05 `deploy-gh-pages.js` 和 `force-deploy.js` 两份部署脚本
| 字段 | 内容 |
|------|------|
| **位置** | `deploy-gh-pages.js`, `force-deploy.js` |
| **问题描述** | 项目同时存在两份部署脚本，逻辑类似但略有不同。`force-deploy.js` 包含硬编码的 Windows 路径（已在 H-03 中报告），`deploy-gh-pages.js` 使用 `gh-pages` 分支的 clone-and-push 方式。GitHub Actions 工作流是第三种部署方式。三套部署机制增加了配置漂移和意外暴露的风险。 |
| **建议** | 统一使用 GitHub Actions 自动部署（已配置），删除多余的本地部署脚本或在仓库文档中明确标注「仅本地调试」。 |

### I-06 良好的安全头基线与 `_headers` 支持
| 字段 | 内容 |
|------|------|
| **位置** | `public/_headers` |
| **问题描述** | 项目已设置以下安全响应头：`X-Content-Type-Options: nosniff`、`X-Frame-Options: DENY`、`Referrer-Policy: strict-origin-when-cross-origin`、`Permissions-Policy`（部分）及合理的 CORS 配置。同时数据文件设置了适当的 Cache-Control 策略。 |
| **建议** | 在 `_headers` 中添加 CSP 以获取 HTTP 响应头级别的保护。 |

---

## 汇总

| 严重度 | 数量 | 关键修复优先级 |
|--------|------|---------------|
| 🔴 严重 | 3 | S-01 S-02 S-03 — 立即修复 |
| 🟠 高 | 5 | H-01 H-02 H-03 H-04 H-05 — 本周内修复 |
| 🟡 中 | 5 | M-01 M-02 M-03 M-04 M-05 — 下个迭代修复 |
| 🔵 低 | 6 | L-01 L-02 L-03 L-04 L-05 L-06 — 近期跟进 |
| ⚪ 信息 | 6 | I-01~I-06 — 参考建议 |

### 优先级行动清单

1. **[紧急]** 从 `public/` 删除所有 `.bak`、`*-backup*` 和 `test-worker.html` 文件
2. **[紧急]** 从 `public/api/` 和 `public/data/v2/users_profile.json` 删除模拟/测试数据
3. **[紧急]** 修复 CSP 中泄露的内网 IP 和 localhost
4. **[高]** 统一部署流程，保留 Actions 工作流，移除本地部署脚本或重构
5. **[高]** 检查 CSP `unsafe-inline` 的替代方案
6. **[高]** 在 `public/` 中设置目录级索引禁止（可通过 Cloudflare Page Rule 或 `public/data/index.html` 的 Forbidden 内容实现，当前已有）
7. **[中]** 监控 Next.js/PostCSS 漏洞修复更新
8. **[中]** 降低客户端反爬逻辑的复杂度或说明其局限性
