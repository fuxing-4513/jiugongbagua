// ============================================================
// 易学书馆 - 完整分类体系
// 设计目标：广度覆盖 + 深度清洗 + AI 友好
// ============================================================

/** 分类节点 */
export interface CategoryNode {
  /** 唯一标识 slug */
  id: string
  /** 中文名称 */
  name: string
  /** 简要描述 */
  desc: string
  /** emoji 图标 */
  emoji: string
  /** 排序权重（数字小优先） */
  order: number
  /** 子分类 */
  children?: CategoryNode[]
}

/** 书籍元数据 */
export interface BookMeta {
  /** 唯一标识 slug */
  id: string
  /** 书名 */
  title: string
  /** 作者/编者 */
  author: string
  /** 朝代 */
  dynasty: string
  /** 所属分类 id（可多级，用 / 分隔） */
  category: string
  /** 一句话简介（展示用） */
  summary: string
  /** 详细描述 */
  description: string
  /** 核心概念标签（用于交叉索引） */
  keywords: string[]
  /** 章节数/卷数 */
  volumes: string
  /** 是否为完整收录 */
  isComplete: boolean
  /** 文献可信度：作者题署的学术说明（如"传统题署刘伯温，现代学术认为作者问题存在争议"——无争议可省） */
  authorNote?: string
  /** 文献可信度：成书年代说明（成书年代有争议/托名时标注） */
  eraNote?: string
  /** 底本/版本说明（sourceVersion 的展示别名——如"据明万历本整理"） */
  sourceNote?: string
  /** 排序权重 */
  order: number
  /** 关联其他书籍 id */
  related?: string[]
  /** 章节概览（SEO + 导航用） */
  chapterOutline?: ChapterOutline[]
  /** 文本长度预估（字符数），0=未知 */
  estimatedChars?: number
}

/** 章节概览 */
export interface ChapterOutline {
  /** 章节编号/卷号 */
  id: string
  /** 章节标题 */
  title: string
  /** 简要说明 */
  summary?: string
  /** 子章节 */
  children?: ChapterOutline[]
}

/** 书籍章节内容 */
export interface BookChapter {
  bookId: string
  /** 九宫元数据 */
  metadata?: {
    sourceOrg: string       // 'jiugong-bagua'
    catalogVersion?: string // 数据版本号
    curatedBy?: string      // 九宫易学书馆
    curatedAt?: string      // 收录日期 YYYY-MM-DD
    sourceVersion?: string  // 底本版本说明
  }
  /** 九宫导读（第一节展开时显示为特殊样式） */
  preface?: {
    id: string
    title: string
    content: string
  }
  chapters: {
    id: string
    title: string
    content: string
    /** 白话译文（现代汉语翻译） */
    vernacular?: string
    /** 注释说明 */
    notes?: string
    /** 配图（卦象图、示意图等） */
    figures?: {
      id: string
      src: string       // 图片路径，如 /images/xueguan/{book-id}/{figure-id}.svg
      alt: string
      caption?: string
      type?: 'hexagram' | 'trigram' | 'diagram' | 'chart' | 'illustration'
    }[]
    subchapters?: BookChapter['chapters']
  }[]
}

/** 古籍配图元数据 */
export interface BookFigure {
  id: string
  /** 所属古籍 */
  bookId: string
  /** 图片分类 */
  type: 'hexagram' | 'trigram' | 'diagram' | 'chart' | 'illustration'
  /** 标题 */
  title: string
  /** 文件路径（相对于 public/images/xueguan/） */
  filePath: string
  /** 原始来源说明 */
  source?: string
}

// ============================================================
// 完整分类树
// ============================================================
export const categoryTree: CategoryNode[] = [
  {
    id: 'mingli',
    name: '命理推演',
    desc: '以人出生时间推算命运格局的学问',
    emoji: '📜',
    order: 1,
    children: [
      { id: 'mingli-bazi', name: '四柱八字', desc: '以年月日时干支推算命运', emoji: '☯', order: 1 },
      { id: 'mingli-ziwei', name: '紫微斗数', desc: '以十二宫星曜盘推演命格', emoji: '⭐', order: 2 },
      { id: 'mingli-heluo', name: '河洛理数', desc: '河图洛书数理推命', emoji: '🌊', order: 3 },
      { id: 'mingli-tieban', name: '铁板神数', desc: '邵雍所传数理推命术', emoji: '🔢', order: 4 },
      { id: 'mingli-chenggu', name: '称骨测算', desc: '袁天罡称骨法', emoji: '⚖️', order: 5 },
    ]
  },
  {
    id: 'bushi',
    name: '卜筮占验',
    desc: '通过卦象、符号预测吉凶的技艺',
    emoji: '🔮',
    order: 2,
    children: [
      { id: 'bushi-yijing', name: '易经周易', desc: '群经之首，万法之源', emoji: '☰', order: 1 },
      { id: 'bushi-liuyao', name: '六爻纳甲', desc: '纳甲筮法，六爻预测', emoji: '📊', order: 2 },
      { id: 'bushi-meihua', name: '梅花易数', desc: '邵康节外应起卦法', emoji: '🌸', order: 3 },
      { id: 'bushi-qimen', name: '奇门遁甲', desc: '三奇八门，时空预测', emoji: '🧭', order: 4 },
      { id: 'bushi-liuren', name: '六壬神课', desc: '大六壬天时预测', emoji: '🌀', order: 5 },
      { id: 'bushi-xiaoliuren', name: '小六壬', desc: '六宫掌诀快捷预测', emoji: '👋', order: 10 },
      { id: 'bushi-lingqian', name: '灵签占卜', desc: '各类灵签神数', emoji: '🏮', order: 9 },
      { id: 'bushi-zhuge', name: '诸葛神数', desc: '诸葛马前课数理', emoji: '🪶', order: 8 },
    ]
  },
  {
    id: 'xiangshu',
    name: '相术观人',
    desc: '以形貌体态推断性格命运的学问',
    emoji: '👤',
    order: 3,
    children: [
      { id: 'xiangshu-mian', name: '面相学', desc: '通过面部特征观人', emoji: '🧑', order: 1 },
      { id: 'xiangshu-shou', name: '手相学', desc: '手纹掌形断吉凶', emoji: '🤚', order: 2 },
      { id: 'xiangshu-gu', name: '骨相学', desc: '骨骼形骸定贵贱', emoji: '💀', order: 3 },
    ]
  },
  {
    id: 'fengshui',
    name: '风水堪舆',
    desc: '相地之术，宅墓环境布局',
    emoji: '🏠',
    order: 4,
    children: [
      { id: 'fengshui-xingshi', name: '形势派', desc: '龙砂穴水，形胜为宗', emoji: '⛰️', order: 1 },
      { id: 'fengshui-liqi', name: '理气派', desc: '八卦九宫，理气布局', emoji: '🧭', order: 2 },
      { id: 'fengshui-zonghe', name: '综合·阳宅', desc: '八宅/玄空/阳宅三要', emoji: '🏘️', order: 3 },
    ]
  },
  {
    id: 'daojia',
    name: '道家玄理',
    desc: '道家经典与玄学理论基础',
    emoji: '☯',
    order: 5,
    children: [
      { id: 'daojia-jingdian', name: '道家经典', desc: '黄老庄列等基础典籍', emoji: '📖', order: 1 },
      { id: 'daojia-danding', name: '丹道养生', desc: '内外丹术与养生', emoji: '⚗️', order: 2 },
      { id: 'daojia-ganying', name: '劝善感应', desc: '因果报应与劝善书', emoji: '🙏', order: 3 },
    ]
  },
  {
    id: 'yiyi',
    name: '医易运气',
    desc: '易医同源，五运六气与中医数理',
    emoji: '🔬',
    order: 7,
    children: [
      { id: 'yiyi-wuyun', name: '五运六气', desc: '天地气运流转与人体健康', emoji: '🌪️', order: 1 },
      { id: 'yiyi-jingdian', name: '医易经典', desc: '易学与中医结合的典籍', emoji: '📗', order: 2 },
      { id: 'yiyi-maizhen', name: '脉诊命理', desc: '以脉象推演健康与命运', emoji: '🫀', order: 3 },
    ]
  },
    {
    id: 'jiemeng',
    name: '解梦释兆',
    desc: '梦境解析与征兆解读',
    emoji: '💤',
    order: 6,
    children: [
      { id: 'jiemeng-zhougong', name: '周公解梦', desc: '传统梦境象征体系', emoji: '😴', order: 1 },
      { id: 'jiemeng-guji', name: '梦占古籍', desc: '历代梦书集成', emoji: '📚', order: 2 },
    ]
  },
  {
    id: 'zashu',
    name: '杂术汇要',
    desc: '其他术数方法与民俗方术',
    emoji: '✨',
    order: 7,
    children: [
      { id: 'zashu-xingming', name: '姓名学', desc: '五格数理与姓名文化', emoji: '📛', order: 1 },
      { id: 'zashu-shuma', name: '数字能量', desc: '数字吉凶与数理文化', emoji: '🔢', order: 2 },
      { id: 'zashu-huangli', name: '择日黄历', desc: '通书选择与趋吉避凶', emoji: '📅', order: 3 },
      { id: 'zashu-shengxiao', name: '生肖民俗', desc: '十二生肖文化与运势', emoji: '🐉', order: 4 },
    ]
  },
  {
    id: 'western',
    name: '西方玄学',
    desc: '西方占星、塔罗与神秘学体系',
    emoji: '🌙',
    order: 8,
    children: [
      { id: 'western-astrology', name: '西方占星', desc: '西洋占星术与星盘', emoji: '♈', order: 1 },
      { id: 'western-tarot', name: '塔罗牌', desc: '韦特塔罗体系牌义', emoji: '🃏', order: 2 },
      { id: 'western-occult', name: '神秘学', desc: '西方神秘学经典', emoji: '🔮', order: 3 },
    ]
  },
]

/** 展开所有分类为扁平列表（用于检索） */
export function flattenCategories(): CategoryNode[] {
  const result: CategoryNode[] = []
  function walk(node: CategoryNode) {
    result.push(node)
    node.children?.forEach(walk)
  }
  categoryTree.forEach(walk)
  return result
}

/** 根据 id 查找分类节点 */
export function findCategory(id: string): CategoryNode | undefined {
  return flattenCategories().find(c => c.id === id)
}
