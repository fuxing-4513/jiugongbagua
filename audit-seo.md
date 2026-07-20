# SEO 审计报告 — jiugongbagua.com

> 审计日期: 2026-07-20 | 项目路径: temp_repo (Next.js App Router, static export)
> 审核范围: 技术 SEO、页面元数据、结构化数据、可访问性、性能 SEO

---

## 严重问题 (搜索引擎完全无法理解/致命)

### 1. JSON-LD `@context` 拼写错误

| 字段 | 值 |
|---|---|
| **位置** | `src/app/layout.tsx` 第 126 行, `BreadcrumbList` 项 |
| **问题** | `"@context": "https://Schema.org"` 中 `schema` 首字母大写了 (Schema)，导致 JSON-LD 无效。Google 结构化数据测试会丢弃整个 `BreadcrumbList` 块。 |
| **建议** | 立即修正为 `"@context": "https://schema.org"` (全小写) |

### 2. Canonical URL 域名不一致（www vs 非 www）

| 字段 | 值 |
|---|---|
| **位置** | 所有 `page.tsx` 的 `alternates.canonical` + `src/app/sitemap.ts` + `CNAME` |
| **问题** | - 所有页面 `canonical` 使用 `https://jiugongbagua.com` (**无 www**)<br>- `CNAME` 文件指定 `www.jiugongbagua.com` (**有 www**)<br>- `src/app/robots.ts` 中 sitemap URL 指向 `https://www.jiugongbagua.com/sitemap.xml` (**有 www**)<br>- `_headers` 中 `Access-Control-Allow-Origin` 使用 `www.jiugongbagua.com` |
| **建议** | 统一域名策略。GitHub Pages / Cloudflare Pages 通常以 CNAME 为准。建议: 1) 将 canonical 改为 `https://www.jiugongbagua.com` (与 CNAME 一致)；2) 或确保裸域名重定向到 www，所有 canonical 保持无 www。当前混合状态会导致搜索引擎抓取和索引不一致。 |

### 3. 404 页面缺失 (not-found.tsx)

| 字段 | 值 |
|---|---|
| **位置** | `src/app/` 目录下无 `not-found.tsx` 或 `not-found.ts` |
| **问题** | Next.js 在未找到页面时会使用浏览器默认 404 页面（白屏/纯文字），与网站暗金色主题完全不匹配，且不会提供导航回首页的链接。页面访问体验差，搜索引擎可能认为域名未正确配置。 |
| **建议** | 创建 `src/app/not-found.tsx`，至少包含: 友好提示文案 + 返回首页的链接 + 网站通用导航。使用与网站一致的暗色主题样式。 |

---

## 重要问题 (影响排名显著)

### 4. 四个页面缺少 metadata 导出 (无 title/description)

以下页面 **没有导出 `metadata`**，会继承 layout 的默认 title 模板 (`%s | 九宫八卦`)，导致 `<title>` 变成 ` | 九宫八卦` (缺少页面专属名称) 或使用不准确的页面描述:

| 页面文件 | 当前问题 |
|---|---|
| `src/app/taluo/cards/page.tsx` | 缺少 `export const metadata`，动态生成的 `<title>` 会是残缺的 |
| `src/app/wenku/page.tsx` | 页面标题和描述完全缺失，搜索引擎无法索引 "文库·建设中" 页面 |
| `src/app/profile/page.tsx` | '用户中心' 页面无自定义 title/description |
| `src/app/zonghe-zhengming/page.tsx` | '八字紫微综合印证' 页面无自定义 title/description |

**建议**: 为每个页面添加 `export const metadata`，例如:
- `/taluo/cards` → `title: "塔罗牌义大全 - 78张韦特塔罗牌详解"`
- `/wenku` → `title: "九宫文库 - 命理知识库"`
- `/profile` → `title: "用户中心 - 排盘记录与收藏"`
- `/zonghe-zhengming` → `title: "八字紫微综合印证 - 同盘校验"`

### 5. Heluo 和 Wiki 页面缺少 canonical / hreflang 配置

| 文件 | 缺失字段 |
|---|---|
| `src/app/heluo/page.tsx` | 无 `alternates.canonical`，无 `alternates.languages` (hreflang) |
| `src/app/wiki/page.tsx` | 无 `alternates.canonical`，无 `alternates.languages` (hreflang) |

虽然 Next.js 可能自动填充某些 alternates，但显示声明可确保搜索引擎正确理解页面语言变体。此外，heluo 和 wiki 也未配置 Open Graph 元数据。

**建议**: 添加完整的 `alternates` 配置，例如:
```ts
alternates: {
  canonical: 'https://jiugongbagua.com/heluo',
  languages: {
    'zh-CN': 'https://jiugongbagua.com/heluo',
    'zh-TW': 'https://jiugongbagua.com/heluo?lang=zh-TW',
    'en': 'https://jiugongbagua.com/heluo?lang=en',
  },
},
```

### 6. 动态路由页面缺少 canonical / hreflang

| 文件 | 问题 |
|---|---|
| `src/app/wenku/[slug]/page.tsx` | `generateMetadata` 返回了 title/description，但缺少 `alternates` |
| `src/app/glossary/[slug]/page.tsx` | `generateMetadata` 返回了 title/description，但缺少 `alternates` |

动态页面如果没有 canonical，搜索引擎可能将 `?lang=zh-TW` 等变体视为重复内容。

**建议**: 在 `generateMetadata` 中增加 `alternates`，传入 `params.slug` 构建各语言版本的 URL。

### 7. JSON-LD BreadcrumbList 不完整

| 字段 | 值 |
|---|---|
| **位置** | `src/app/layout.tsx` JSON-LD 第 123-128 行 |
| **问题** | BreadcrumbList 硬编码了 1 项 (首页)，没有反映用户当前所在页面的层级路径。 |
| **建议** | BreadcrumbList 应动态生成，反映页面层级 (如: 首页 > 八字排盘 > …)。可在客户端组件中根据 pathname 动态注入或使用 Breadcrumb 组件同步输出。 |

### 8. Sitemap 遗漏 `zonghe-zhengming` 页面

| 字段 | 值 |
|---|---|
| **位置** | `src/app/sitemap.ts` |
| **问题** | sitemap 列出了 24 个页面，但遗漏了实际的 `/zonghe-zhengming` 页面。该页面已有对应的 page.tsx 文件。 |
| **建议** | 在 sitemap.ts 的 `mainPages` 数组中添加 `{ path: '/zonghe-zhengming', priority: 0.6, changeFreq: 'monthly' }` |

### 9. robots.ts sitemap URL 域名不一致

| 字段 | 值 |
|---|---|
| **位置** | `src/app/robots.ts` 倒数第 2 行 |
| **问题** | `sitemap: 'https://www.jiugongbagua.com/sitemap.xml'` 使用了 `www.` 前缀，但 `src/app/sitemap.ts` 生成的所有 URL 均为 `https://jiugongbagua.com` (无 www)。搜索引擎访问 sitemap URL 时会找不到文件，或指向错误的域名。 |
| **建议** | 统一域名，将 robots.ts 中 sitemap URL 改为 `https://jiugongbagua.com/sitemap.xml` (或全部改为 www 并保持 canonical 一致)。 |

### 10. public/robots.txt 与 src/app/robots.ts 冲突

| 字段 | 值 |
|---|---|
| **位置** | `public/robots.txt` 和 `src/app/robots.ts` 并存 |
| **问题** | Next.js `output: 'export'` 模式下，`src/app/robots.ts` 作为 route handler 会生成 `out/robots.txt`，但 `public/robots.txt` 也会直接复制到输出目录。两者规则不同：<br>- `public/robots.txt`: 简单规则，禁止 `/data/`, `/api/`, `/_next/`<br>- `robots.ts`: 详细规则，按 Baidu/Google/Bing 分 UA，封禁 20+ AI 爬虫，sitemap 指向 `www.` |
| **建议** | 删除 `public/robots.txt`，仅保留 `src/app/robots.ts` 作为唯一来源。或者将 `public/robots.txt` 内容升级以匹配 `robots.ts`，并删除 route handler。 |

---

## 建议优化 (小改进)

### 11. Breadcrumb 组件未输出 JSON-LD 结构化数据

| 字段 | 值 |
|---|---|
| **位置** | `src/components/Breadcrumb.tsx` |
| **问题** | Breadcrumb 组件仅实现视觉面包屑导航 (带 Link 的分隔列表)，但未嵌入 `BreadcrumbList` JSON-LD 结构化数据。 |
| **建议** | 在 Breadcrumb 组件中同步输出 `<script type="application/ld+json">` 包含当前路径的 BreadcrumbList。 |

### 12. SVG 图标/按钮缺少 aria-label

| 位置 | 问题 |
|---|---|
| `src/components/Nav.tsx:137` | 移动端汉堡菜单按钮的 `<svg>` 没有 title 或 aria-label (虽然父 button 有 `aria-label="Toggle menu"`，但这是英文；移动菜单按钮有英文 `Toggle menu` 而非中文) |
| 首页/各页的按钮 SVG | 多处 SVG 仅作为装饰性元素使用 `aria-hidden`，但部分交互式 SVG 需添加无障碍标签 |

**建议**: 确保所有交互式 SVG 或图标按钮有适当的 `aria-label`（中文语境建议使用中文标签）。

### 13. 首页 `<h1>` 内容动态

| 字段 | 值 |
|---|---|
| **位置** | `src/app/HomeClient.tsx:53` |
| **问题** | 首页 h1 内容 `{getT('home.heroTitle')}` 完全通过 i18n 动态渲染。虽然 Next.js 使用 `'use client'` 的 CSR 模式，但 metadata 是静态硬编码的，可能导致 metadata.title 与页面可见 `<h1>` 内容不匹配（取决于语言切换）。 |
| **建议** | 确保默认语言下 metadata.title 与 h1 内容保持一致。如首页 metadata 已有明确标题，可考虑在 `getT` 默认值中与 metadata 对齐。 |

### 14. 无 `<title>` 降级后备标签

| 字段 | 值 |
|---|---|
| **位置** | `src/app/layout.tsx` |
| **问题** | 布局中没有显式的 `<title>` HTML 标签 (Next.js 通过 `<head>` 管理 title)，但在静态导出模式下，如果 JS 执行失败，某些页面可能缺少 title。 |
| **建议** | 当前无问题 — Next.js 管理方式正确。建议在 shell HTML 中保留一份备用的 `<title>` fallback。

### 15. JSON-LD SearchAction target URL 格式

| 字段 | 值 |
|---|---|
| **位置** | `src/app/layout.tsx` 第 111 行 |
| **问题** | `SearchAction.target.urlTemplate` 链接到 `/wenku?q={search_term_string}`，但 `/wenku` 页面当前状态为 "建设中"。搜索引擎爬取后会认为搜索功能不可用。 |
| **建议** | 待 `/wenku` 搜索功能上线后启用此 SearchAction，或暂时移除。 |

### 16. 部分页面 heading 结构可改进

| 位置 | 问题 |
|---|---|
| 多数页面 | 结构为 `h1` → `h2` → `h3`，层级基本正确 |
| 首页 (`HomeClient.tsx`) | 有 `h1` (hero标题) → `h2` (各区域标题, 如"十二生肖", "全部工具") → `h3` (卡片标题)，结构合理 |
| `src/app/profile/page.tsx` | 使用了 `h1` + `section > h2`，但多个按钮/链接使用 `min-h-[44px]` 但缺少 `role` 属性 |

### 17. 未使用 Next.js Image 组件

| 字段 | 值 |
|---|---|
| **位置** | 全局 |
| **问题** | 项目未使用 `<Image>` 组件，仅用 `<img>` (通过 `dangerouslySetInnerHTML` 或直接渲染)。`next.config.ts` 设定了 `images.unoptimized: true`，符合静态导出模式。但由于未使用 Next.js Image，缺少自动 lazy loading、responsive srcset 和尺寸优化。 |
| **建议** | 静态导出模式下可接受。如后续需要优化图片，可考虑手动添加 `loading="lazy"` 和 `srcset`。 |

### 18. 字体预连接已配置，但可扩展

| 字段 | 值 |
|---|---|
| **位置** | `src/app/layout.tsx:71` |
| **当前** | `<link rel="preconnect" href="https://fonts.gstatic.com" />` — 已配置 |
| **建议** | 可额外添加 `<link rel="preconnect" href="https://fonts.googleapis.com" />` 以加速 Google Fonts 下载。 |

### 19. JS/CSS 压缩

| 字段 | 值 |
|---|---|
| **状态** | 生产构建使用 TerserPlugin (`drop_console: true`, `comments: false`, `mangle: true`)，CSS 通过构建工具自动压缩。配置完善。 |
| **建议** | 无需更改。 |

### 20. 图片格式 (favicon/manifest)

| 字段 | 值 |
|---|---|
| **状态** | SVG + ICO 双格式 favicon，Web App Manifest 配置正确。 |
| **建议** | 考虑添加 `public/og-image.jpg` (1200×630) 用于社交媒体分享卡片。当前 Open Graph 仅定义了 title/description，缺少 `og:image`。 |

---

## 已正确处理

| 项目 | 状态 | 备注 |
|---|---|---|
| **metadataBase** | ✅ 已设置 | `metadataBase: new URL('https://jiugongbagua.com')` |
| **layout title 模板** | ✅ 已配置 | `title: { default: '九宫八卦 - 中国传统命理文化平台', template: '%s \| 九宫八卦' }` |
| **全局 description** | ✅ 已配置 | 完整的 baseDescription (中文 100+ 字) |
| **keywords** | ✅ 已配置 | 涵盖主要命理关键词 |
| **Open Graph** | ✅ 已配置 | title/description/type/locale/siteName/url |
| **Twitter Card** | ✅ 已配置 | `card: 'summary'` |
| **robots meta** | ✅ 已配置 | `index: true, follow: true`，含 `googleBot` |
| **JSON-LD WebSite + WebApplication** | ✅ 正确 | `@context: 'https://schema.org'` (BreadcrumbList 除外) |
| **CSP 安全策略** | ✅ 已配置 | 完善的 Content-Security-Policy |
| **X-Content-Type-Options** | ✅ 已设置 | `nosniff` |
| **X-Frame-Options** | ✅ 已设置 | `DENY` |
| **Favicon 多格式** | ✅ 已配置 | SVG + ICO + apple-touch-icon |
| **Manifest** | ✅ 已配置 | `public/manifest.json` 含 PWA 基本设置 |
| **`_headers` 安全头** | ✅ 已配置 | `public/_headers` 含 NoSniff / XFO / Referrer-Policy / Permissions-Policy |
| **Sitemap 基本结构** | ✅ 已配置 | 24 个页面，含优先级和更新频率 |
| **Robots AI 爬虫封禁** | ✅ 已实现 | 封禁 20+ AI 训练爬虫 |
| **百度/谷歌/必应专门规则** | ✅ 已配置 | 允许主流搜索引擎，仅禁止敏感路径 |
| **Hreflang 在多页面中实现** | ✅ 大部分页面 | 首页 + 15 个核心工具页面已实现 zh-CN/zh-TW/en 三语 |
| **Canonical 在多页面中实现** | ✅ 大部分页面 | 首页 + 15 个核心工具页面已配置 |
| **HTML lang 属性** | ✅ `zh-Hans` | 但考虑改为 `zh-CN` 更精确（因为 hreflang 使用 zh-CN） |
| **Viewport meta** | ✅ 已设置 | `width=device-width, initial-scale=1` |
| **Heading 结构** | ✅ 基本合理 | 每个页面有唯一 h1，层级 h1→h2→h3 基本正确 |
| **Aria 标签** | ✅ 部分已实现 | Nav 工具下拉、语言切换、TarotCard、刷新按钮有 aria-label |
| **trailingSlash** | ✅ 已配置 | `trailingSlash: true`，减少重复内容问题 |
| **source maps** | ✅ 已禁用 | `productionBrowserSourceMaps: false` |
| **代码混淆** | ✅ 已开启 | TerserPlugin: `drop_console`, `mangle.toplevel`, `comments: false` |
| **ErrorBoundary** | ✅ 已实现 | 含错误提示 + 刷新按钮 |
| **加载动画** | ✅ 已实现 | LoadingSpinner 组件 |

---

## 按页面汇总的 SEO 元数据

### 有完整 metadata (包括 title/description/canonical/hreflang/OG) 的页面

| 页面 | Title | Description | Canonical | Hreflang | OG |
|---|---|---|---|---|---|
| `/` (首页) | 九宫八卦 - 中国传统命理文化平台 | 九宫八卦是中国传统命理文化平台... | ✅ | ✅ | ✅ |
| `/bazi` | 四柱八字排盘 | 输入出生年月日时，在线免费四柱八字排盘... | ✅ | ✅ | ✅ |
| `/ziwei` | 紫微斗数排盘在线 | 紫微斗数在线排盘... | ✅ | ✅ | ✅ |
| `/liuyao` | 六爻在线免费 | 六爻在线起卦解卦... | ✅ | ✅ | ✅ |
| `/xiaoliuren` | 小六壬在线 | 小六壬在线免费测算... | ✅ | ✅ | ✅ |
| `/jiemeng` | 周公解梦在线查询 | 周公解梦大全在线查询... | ✅ | ✅ | ✅ |
| `/xingming` | 姓名测试打分免费 | 姓名测试打分免费在线工具... | ✅ | ✅ | ✅ |
| `/shuma` | 号码测吉凶在线 | 手机号码测吉凶、车牌号测吉凶在线免费... | ✅ | ✅ | ✅ |
| `/huangli` | 黄历择日查询 | 今日黄历择日查询... | ✅ | ✅ | ✅ |
| `/taluo` | 塔罗牌在线 | 免费在线塔罗牌解读... | ✅ | ✅ | ✅ |
| `/hehun` | 八字合婚配对免费 | 八字合婚免费配对测试... | ✅ | ✅ | ✅ |
| `/chenggu` | 称骨测算 | 称骨测算在线... | ✅ | ✅ | ✅ |
| `/fengshui` | 风水罗盘在线 | 风水罗盘在线工具... | ✅ | ✅ | ✅ |
| `/lingqian` | 灵签在线 | 灵签在线抽签... | ✅ | ✅ | ✅ |
| `/meihua` | 梅花易数 | 梅花易数在线起卦... | ✅ | ✅ | ✅ |
| `/qimen` | 奇门遁甲在线排盘 | 奇门遁甲在线排盘... | ✅ | ✅ | ✅ |
| `/shengxiao` | 十二生肖百科 | 十二生肖百科大全... | ✅ | ✅ | ✅ |
| `/xingzuo` | 星座运势查询 | 十二星座运势查询... | ✅ | ✅ | ✅ |
| `/contact` | 联系我们 - 九宫八卦 | 联系九宫八卦平台... | ✅ 部分 | ❌ | ❌ |
| `/faq` | 常见问题 - 九宫八卦 | 关于九宫八卦命理平台... | ❌ | ❌ | ❌ |
| `/help` | 帮助中心 - 九宫八卦 | 九宫八卦帮助中心... | ❌ | ❌ | ❌ |
| `/privacy` | 隐私政策 - 九宫八卦 | 九宫八卦隐私政策... | ❌ | ❌ | ❌ |
| `/terms` | 服务条款 - 九宫八卦 | 九宫八卦平台服务条款... | ❌ | ❌ | ❌ |
| `/app` | AI 排盘 - 九宫八卦 | 智能命理排盘系统... | ❌ | ❌ | ❌ |
| `/glossary` | 术语百科 - 九宫八卦 | 中国传统命理学术语百科大全... | ❌ | ❌ | ❌ |

### 有基本 metadata (有 title/description，缺 canonical/hreflang/OG) 的页面

| 页面 | Title | Description |
|---|---|---|
| `/heluo` | 河洛推命 - 九宫八卦 | 河图洛书数理推命... |
| `/wiki` | 命理百科 - 九宫八卦 | 全面了解中国传统命理文化知识体系... |

### 动态页面 (generateMetadata，缺 canonical/hreflang)

| 页面 | Title 生成 | Description |
|---|---|---|
| `/wenku/[slug]` | ✅ `${art.title} \| 九宫文库` | ✅ art.summary |
| `/glossary/[slug]` | ✅ `${term.name} - 术语百科 - 九宫八卦` | ✅ term.shortDesc |

### 完全缺少 metadata 的页面 (⚠️ 严重)

| 页面 | 问题 |
|---|---|
| `/taluo/cards` | ❌ 无 `export const metadata`，title 为未定义 |
| `/wenku` | ❌ 无 `export const metadata` |
| `/profile` | ❌ 无 `export const metadata` |
| `/zonghe-zhengming` | ❌ 无 `export const metadata` |

---

## 修复优先级建议

```
P0 (立即修复):
  □ JSON-LD @context 拼写: Schema.org → schema.org
  □ 统一域名策略 (www vs 非 www) + canonical + sitemap + robots
  □ 创建 src/app/not-found.tsx

P1 (本周内修复):
  □ 4 个缺少 metadata 的页面添加 export const metadata
  □ sitemap.ts 补充 zonghe-zhengming 页面
  □ robots.ts sitemap URL 域名修正

P2 (本月内修复):
  □ heluo / wiki 页面添加 canonical + hreflang
  □ wenku/[slug] / glossary/[slug] generateMetadata 增加 alternates
  □ Breadcrumb 组件嵌入 JSON-LD
  □ 删除 public/robots.txt (或与 robots.ts 统一)

P3 (长期优化):
  □ 添加 og:image (1200×630 社交分享图)
  □ JSON-LD SearchAction 待 wenku 搜索上线后再启用
  □ 移动端汉堡菜单 aria-label 使用中文 (切换菜单)
  □ 添加 dns-prefetch 或 preconnect 优化
  □ 考虑 lang="zh-Hans" 改为 lang="zh-CN" (与 hreflang 一致)
```

---

*审计结束。总计发现问题: **3** 严重 + **7** 重要 + **10** 建议优化 = **20** 项。*
