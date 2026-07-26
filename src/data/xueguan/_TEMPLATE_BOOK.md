# 易学书馆 · 古籍全文收录模板

## 文件命名规则

`temp_repo/src/data/xueguan/content/{book-id}.ts`

- 使用书籍的 `id` slug，全小写字母，连字符分隔
- 超过 200 行的长书拆为多个文件，用 `{book-id}-part1.ts`, `{book-id}-part2.ts` 命名
- 在 `content-registry.ts` 中注册时合并导入

## 标准结构

```typescript
import type { BookChapter } from '../categories'

export const {bookId}Content: BookChapter = {
  bookId: '{book-id}',

  // ── 九宫元数据 ──
  metadata: {
    source: 'jiugong-bagua',
    catalogVersion: '1.0',
    curatedBy: '九宫易学书馆',
  },

  // ── 九宫导读（这是自有特色的核心）──
  preface: {
    id: 'preface',
    title: '九宫导读',
    content: `《xxx》x 卷，xxx 著，xxx 代。
概要：……（1-2 段精炼介绍）
九宫按：本书值得关注的点……
阅读建议：……`,
    // 注意：正文内容不含任何外部来源的网址、水印、广告、页码标记
  },

  // ── 正文章节 ──
  chapters: [
    {
      id: 'juan1',
      title: '卷一 · xxx',
      content: `正文内容……
多段落用空行分隔。
`,
    },
    {
      id: 'juan2',
      title: '卷二 · xxx',
      content: `正文内容……
`,
    },
    // ...
  ],
}
```

## 质量规范

### 来源处理
- 全文从公共古籍站点（ctext.org、维基文库、国学网等）取原始文本
- **必须去除的内容：** 页码标注、网站版权文字、注释标记、广告、外链
- 只保留纯古文原文+必要分段
- 每本书入库前**人工终审检查**

### 九宫特色层
每本书都加两样：

1. **九宫导读** — 用现代语言点出这本书的核心价值、特色、阅读建议
2. **元数据** — `metadata` 字段标记来源为 `jiugong-bagua`

### 章节划分原则
- 长卷按原书卷次分章（卷/篇/章）
- 短书（<10 章节）不分卷，直接分章
- 每章内容适度，避免一章过长（>3000 字建议再分小节）

### 编码规范
- 原文中保留《书名》加书名号
- 引文保持原样，不擅自改动
- 有多版本差异的书（如道德经王弼本/帛书本），在导读中注明选用的版本
