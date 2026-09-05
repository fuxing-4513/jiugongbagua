# 易学书馆 · 古籍扩充 SOP（标准作业流程）

> 目标：135 → 300+ 部华人圈核心古籍。质量铁律：**只收公版原典 + 九宫导读/白话标注**，绝不批量 AI 生成充数。

## 一、采集源可用性（2026-09-05 实测）

| 源 | 状态 | 说明 |
|---|---|---|
| ctext.org（中国哲学书电子化计划） | ⚠️ 需会话 | HTTP 200 但 GET 空（反爬）——需带 cookie/模拟会话，或人工复制文本 |
| zh.wikisource.org | ⚠️ 需甄别 | 多数道教/术数典籍是 **scan 转写**（pages 索引 PDF——无内联文本不可采）；仅**全文模板页**（`<poem>`/纯文本）可采 |
| gushiwen.cn | ⚠️ 版权模糊 | 页面排版有版权主张——仅参考校对，不直接复制 |
| 汉典 zdic.net | 词典为主 | 可辅助查字 |

**可采集判断法**：wikisource 页 `?action=raw` 若含 `<pages ...>` = scan 版（放弃）；若为纯 wikitext/`<poem>` = 文本版（可采）。

## 二、数据格式（对齐现有架构）

接入一本书 = 3 步：
1. **正文**：`src/data/xueguan/content/{book-id}.ts`（复制 `_REFERENCE_TEMPLATE.ts`）——含：
   - `metadata`（sourceOrg: 'jiugong-bagua' / sourceVersion 注明底本）
   - `preface`（**九宫导读**——原创概要/按语/阅读建议/版本说明——GEO 引用点）
   - `chapters`（`{id, title, content}` 按卷/篇拆分——**白话语译章节可加 `vernacular` 字段、注释加 `notes`**）
2. **注册**：`content-registry.ts` 加 import + 注册条目
3. **书目**：`books.ts` 的 `bookCatalog` 加 `{id, title, author, dynasty, category, summary, keywords, volumes, isComplete: true}`
4. 验证：`npx tsc --noEmit` + 本地 dev 看 `/xueguan/[category]/[book-id]`

## 三、扩充候选书单（按优先级——华人圈核心缺口）

### 风水（现库最弱）
- [ ] 《葬书》郭璞（晋）——风水祖书（需 ctext 会话或人工整理）
- [ ] 《青囊奥语》《天玉经》杨筠松
- [ ] 《撼龙经》《疑龙经》
- [ ] 《雪心赋》卜应天（唐）
- [ ] 《人子须知资孝地理心学统宗》徐善继（大部头）

### 相学
- [ ] 《麻衣相法》（麻衣神相）
- [ ] 《柳庄相法》袁珙

### 六壬
- [ ] 《六壬大全》（明·郭御青辑——大部头分卷）
- [ ] 《大六壬指南》陈公献

### 奇门
- [ ] 《奇门遁甲统宗》
- [ ] 《烟波钓叟歌》（口诀——短）

### 道家/修炼
- [ ] 《周易参同契》魏伯阳
- [ ] 《悟真篇》张伯端
- [ ] 《黄帝阴符经》（短——wikisource scan——需文本源）
- [ ] 《坐忘论》司马承祯

### 择日
- [ ] 《协纪辨方书》（清·大部头）

### 卜筮补充
- [ ] 《灵棋经》
- [ ] 《太玄经》扬雄

## 四、SEO/GEO 要求（每本都要满足）
- ✅ 独立 URL `/xueguan/{category}/{bookId}`（自动）
- ✅ generateMetadata（书名关键词 desc——自动按 book 元数据生成）
- ✅ Book JSON-LD（含 inLanguage/isAccessibleForFree——已全局实现）
- ✅ 出处可视化：页面 h1 = 书名、章 details 手风琴、白话/注标记
- ⚠️ 新书注意：preface 里含【九宫按】（原创——AI cite 点）；sourceVersion 写清底本

## 五、文库（用户自创文章）——未来机制
- 用户每日 2 篇自创 → 存 `src/data/articles/{YYYYMMDD}-{slug}.md`（frontmatter: title/date/tags）
- 页面 `/wenku/[slug]` 生成 + `/wenku` 列表
- 文章标原创（sameAs/author 结构）——纯原创内容 = GEO 最硬资产
- 当前文库保持"建设中"占位——架构就绪后启动
