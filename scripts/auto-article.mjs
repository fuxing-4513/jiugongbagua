/**
 * 九宫八卦 — AI自动化文章系统 v2（质量升级版）
 * 
 * 核心改进：
 * 1. 文章结构随机化（8个模块随机挑3-4个+乱序）
 * 2. 开篇6种变体轮换，打破模板痕迹
 * 3. 日期均匀分布到未来30天（对外显示每天~30篇）
 * 4. 底部相关推荐（同类别自动匹配3篇）
 * 5. 侵权规避：古籍引用+声明+不涉真实案例
 * 6. 总关键词池491个，全领域覆盖
 *
 * 用法: node scripts/auto-article.mjs [篇数]
 *   ARTICLE_COUNT=30  node scripts/auto-article.mjs
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const REPO_DIR = path.resolve(__dirname, '..')
const OUTPUT_DIR = path.join(REPO_DIR, 'scripts/generated-articles')

// ==================== 配置 ====================
const COUNT = parseInt(process.env.ARTICLE_COUNT || '50', 10)
const KEYWORDS_FILE = process.env.KEYWORDS_FILE || path.join(REPO_DIR, 'scripts/keywords.txt')

// 文章分类（与keywords.txt中的#分类对应）
const CATEGORIES = [
  '八字命理', '紫微斗数', '风水知识', '姓名文化',
  '面相手相', '解梦文化', '数字能量', '择日择吉',
  '易学基础', '生肖运势', '命理综合', '传统文化',
  '占卜术数', '中医养生', '道家文化'
]

// ==================== 段落模块池 ====================
const SECTIONS = [
  // 模块0: 开篇定义（6种变体）
  {
    id: 'opener',
    variants: [
      (kw, cat) => `${kw}是${cat}体系中非常基础的概念之一。理解${kw}，是深入学习后续知识的前提。`,
      (kw, cat) => `许多对${cat}感兴趣的朋友，最早接触到的概念之一就是"${kw}"。但这背后的内涵，远比你想象的丰富。`,
      (kw, cat) => `说到${kw}，经常有人把它想得很复杂。其实在九宫八卦的命理体系中，这个概念可以这样理解——`,
      (kw, cat) => `如果你刚开始接触${cat}，那么${kw}是一个绕不开的主题。这篇文章帮你把核心要点梳理清楚。`,
      (kw, cat) => `「${kw}」这个词，在业内人士看来，本质是对某种命理规律的概括。本质上并不神秘，关键在于怎么用。`,
      (kw, cat) => `关于${kw}的讨论，在命理爱好者的圈子里一直热度很高。今天九宫八卦就从这个角度做一个系统的梳理。`,
    ]
  },
  // 模块1: 命理依据 + 古籍引用
  {
    id: 'classic',
    variants: [
      (kw, cat) => `在传统命理典籍中，${kw}有着明确的论述。《三命通会》将${kw}列为剖析命局的重要视角之一。`,
      (kw, cat) => `《渊海子平》对${kw}的阐释较为详尽，其中提到看命需先明${kw}之理，而后方可论格局高下。`,
      (kw, cat) => `《滴天髓》有云：「……」命理先贤对${kw}的重视程度，从历代典籍的篇幅中可见一斑。`,
      (kw, cat) => `古籍记载：乙庚合、丙辛合等天干五合理论，与${kw}有着千丝万缕的内在联系。`,
      (kw, cat) => `传统命理对${kw}的解读，最早可追溯至唐代《李虚中命书》。后经宋代徐子平完善，发展成为今天我们看到的面貌。`,
      (kw, cat) => `《五行精纪》一书中对${kw}有较为详实的记载，不仅涵盖了理论基础，还收录了大量实际案例作为印证。`,
    ]
  },
  // 模块2: 实用技巧
  {
    id: 'skills',
    variants: [
      (kw, cat) => `日常生活中，了解${kw}可以通过观察身边的人来加深理解。注意那些${kw}表现明显的命局特征，你会发现规律并不难掌握。`,
      (kw, cat) => `如果你是初学者，建议先从${kw}的基本属性入手，不必急于求成。每月抽时间复习，半年后自然融会贯通。`,
      (kw, cat) => `在分析${kw}时，可以重点关注它在年、月、日、时四柱中的位置和状态——同样的概念出现在不同柱位，含义截然不同。`,
      (kw, cat) => `实用建议：将${kw}的原理应用到自己的命局分析中，结合大运和流年来看，比单独判断要准确得多。`,
    ]
  },
  // 模块3: 经典误区
  {
    id: 'pitfalls',
    variants: [
      (kw, cat) => `关于${kw}，一个常见的误区是把它当成绝对的好或坏。其实在命理中没有绝对的吉凶，关键是看它在全局中的角色。`,
      (kw, cat) => `很多人对${kw}的理解停留在表面，认为它只有一种解释方式。实际上它的含义会随着组合不同而产生显著差异。`,
      (kw, cat) => `另一个值得注意的问题是：${kw}不能孤立判断。如果脱离了整个命局的五行平衡来分析，结论很可能是片面的。`,
    ]
  },
  // 模块4: 五行关联
  {
    id: 'wuxing',
    variants: [
      (kw, cat) => `从五行的角度来看，${kw}与木火土金水有着特定的对应关系。了解这种关联，才能真正把握它在命局中的作用机制。`,
      (kw, cat) => `五行是命理的底层逻辑。${kw}在生克制化中的表现，决定了它在不同命局中是吉是凶、是助力还是阻力。`,
    ]
  },
  // 模块5: 现代应用
  {
    id: 'modern',
    variants: [
      (kw, cat) => `在现代社会，${kw}的价值体现在哪里？对于职场人士而言，了解它可以更好地把握机遇转换期的决策方向。`,
      (kw, cat) => `将${kw}的理论运用到日常生活中，你会发现很多看似偶然的事情其实有其内在规律。这不是迷信，而是对规律的认知。`,
    ]
  },
  // 模块6: 九宫观点
  {
    id: 'jiugong',
    variants: [
      (kw, cat) => `九宫八卦命理体系对${kw}的分析，采用的是星宫同参的方法——既要看星曜本身的属性，也要看它落在哪个宫位。`,
      (kw, cat) => `在九宫体系里，${kw}不是孤立存在的概念。它和命局中其他要素互为表里，共同构成完整的命理画像。`,
      (kw, cat) => `我们之所以强调${kw}的重要性，是因为它在判断格局高低时往往起到画龙点睛的作用。`,
    ]
  },
  // 模块7: 历史渊源
  {
    id: 'history',
    variants: [
      (kw, cat) => `${kw}的概念并非某个时代凭空出现的，而是在漫长的命理实践中逐步沉淀、逐步明确下来的。`,
      (kw, cat) => `追溯${kw}的历史源头，可以发现它与先秦时期的阴阳五行学说一脉相承，经历代先贤不断丰富，才形成今天的完整体系。`,
    ]
  },
]

// ==================== 开篇变体（备选，用于SECTIONS[0]展开） ====================
const OPENER_VARIANTS = SECTIONS[0].variants

// ==================== 文章生成 ====================
function buildArticle(keyword, category, dateStr, existingSlugs, allExistingArticles) {
  const kw = keyword

  // slug生成
  const slugBase = kw.replace(/[《》.,!?:\/\\()"'“”%\s]+/g, '-').replace(/^-+|-+$/g, '').toLowerCase()
  const slug = `${slugBase}-${Date.now().toString(36)}`

  // slug去重
  if (existingSlugs.has(slug)) return null

  // 模板后缀
  const TEMPLATES = [
    '全面解读', '深度分析', '入门指南', '实用技巧',
    '经典案例', '专业详解', '基础知识', '进阶指南',
    '常见问题', '专家视角'
  ]
  const template = TEMPLATES[Math.floor(Math.random() * TEMPLATES.length)]

  // 挑段落模块：从开篇之外的7个模块挑2-3个，加上开篇和九宫观点（必含）
  const sectionPool = SECTIONS.slice(1).map((s, i) => ({ section: s, idx: i + 1 }))
  const shuffled = sectionPool.sort(() => Math.random() - 0.5)
  const pickCount = 2 + Math.floor(Math.random() * 2) // 2或3个
  const picked = shuffled.slice(0, pickCount)

  // 最终段落顺序：开篇 + 挑中的模块(乱序) + 九宫观点（放末尾）
  const openerIdx = Math.floor(Math.random() * SECTIONS[0].variants.length)
  const opener = SECTIONS[0].variants[openerIdx](kw, category)

  const bodyParagraphs = []
  for (const p of picked) {
    const variantIdx = Math.floor(Math.random() * p.section.variants.length)
    bodyParagraphs.push({
      title: getSectionTitle(p.section.id, kw),
      content: p.section.variants[variantIdx](kw, category)
    })
  }

  const jiugongIdx = Math.floor(Math.random() * SECTIONS[6].variants.length)
  const jiugongText = SECTIONS[6].variants[jiugongIdx](kw, category)

  // 组织文章正文
  let content = opener + '\n\n'

  for (const p of bodyParagraphs) {
    content += `### ${p.title}\n\n${p.content}\n\n`
  }

  content += `### 九宫八卦的视角\n\n${jiugongText}\n\n`
  content += `> 想了解自己的完整命理画像？前往 [九宫八卦八字排盘](/bazi) 输入出生信息，获取AI深度分析报告。\n\n`

  // 底部相关推荐（基于category匹配，不足3篇则跨类别补）
  const related = buildRelatedLinks(kw, category, allExistingArticles)
  if (related.length > 0) {
    content += `#### 相关推荐\n\n`
    for (const r of related) {
      content += `- [${r.title}](/wenku/${r.slug})\n`
    }
    content += '\n'
  }

  // 古籍引用/声明（不同版本）
  const decls = [
    `*命理知识参考《三命通会》、《渊海子平》等古籍。本文由九宫八卦AI命理体系基于公开知识独立阐述，仅供学习参考。*`,
    `*本文内容引用自古典命理文献，经九宫八卦AI体系重新整理阐述。内容仅供参考，请勿过度依赖。*`,
    `*文中涉及的古籍引文均来自公开文献。九宫八卦命理体系致力于用现代方式传承传统文化智慧。*`,
  ]
  content += '\n---\n' + decls[Math.floor(Math.random() * decls.length)]

  // summary（从opener里取前半句）
  const summary = opener.length > 80 ? opener.slice(0, 75) + '……' : opener

  return {
    id: Math.floor(Math.random() * 90000000) + 10000000,
    title: `${kw}${template}`,
    slug,
    summary,
    date: dateStr,
    category,
    fullContent: content,
    keywords: [kw],
  }
}

// ==================== 段落标题 ====================
function getSectionTitle(sectionId, kw) {
  const titles = {
    opener: '',
    classic: [
      '古籍中的记载',
      '典籍原典解读',
      '历代传承与演变',
      `${kw}的命理渊源`,
    ],
    skills: [
      '如何实际运用',
      `${kw}的实用技巧`,
      '日常应用建议',
      `${kw}的具体用法`,
    ],
    pitfalls: [
      '常见理解误区',
      `${kw}的误读与真相`,
      '需要避免的错误',
    ],
    wuxing: [
      '五行关联分析',
      `${kw}的五行属性`,
      '从五行看' + kw,
    ],
    modern: [
      '现代生活中的启示',
      `${kw}的当代应用`,
      '对现代人的意义',
    ],
    jiugong: [],
    history: [
      `${kw}的历史溯源`,
      '从古代到现代',
      '概念的由来',
    ],
  }
  const list = titles[sectionId]
  return list ? list[Math.floor(Math.random() * list.length)] : ''
}

// ==================== 相关推荐 ====================
function buildRelatedLinks(keyword, category, allArticles) {
  if (!allArticles || allArticles.length === 0) return []

  // 先找同类别的
  const sameCat = allArticles.filter(a => a.category === category && !a.title.includes(keyword))

  // 随机取3篇（同类不够则补跨类）
  const shuffled = sameCat.sort(() => Math.random() - 0.5)
  const result = shuffled.slice(0, 3)

  if (result.length < 3) {
    const others = allArticles
      .filter(a => a.category !== category && !a.title.includes(keyword))
      .sort(() => Math.random() - 0.5)
    result.push(...others.slice(0, 3 - result.length))
  }

  return result.slice(0, 3)
}

// ==================== 日期分配（核心改进） ====================
/**
 * 每日写入50篇，但分配到未来30天
 * 实际逻辑：每次运行，已有文章的日期不修改
 * 新文章：今天写N篇，其中今天标记1/5，剩下4/5分布在后续29天
 */
function assignDates(newCount, existingArticles) {
  const today = new Date()
  const todayStr = today.toISOString().split('T')[0] // e.g. 2026-06-24

  // 统计今天已经标记了几篇
  const todayExisting = existingArticles.filter(a => a.date === todayStr).length

  // 今天最多只能放8篇（控制日增量）
  const maxToday = 8
  const remainingToday = Math.max(0, maxToday - todayExisting)

  // 新文章分配
  const dates = []
  let putToday = Math.min(remainingToday, Math.floor(newCount / 5)) // 约1/5放今天
  putToday = Math.max(0, putToday)

  for (let i = 0; i < newCount; i++) {
    if (i < putToday) {
      dates.push(todayStr)
    } else {
      // 剩下的随机分配到未来1-29天
      const futureDays = 1 + Math.floor(Math.random() * 29)
      const d = new Date(today)
      d.setDate(d.getDate() + futureDays)
      dates.push(d.toISOString().split('T')[0])
    }
  }

  return dates
}

// ==================== wenkuData.ts 写入 ====================
function writeToWenkuData(filePath, newArticles) {
  const existingContent = fs.readFileSync(filePath, 'utf8')

  const match = existingContent.match(/export\s+const\s+articles:\s*Article\[\]\s*=\s*\[([\s\S]*?)\];/)
  if (!match) {
    console.error('❌ 无法解析 wenkuData.ts')
    process.exit(1)
  }

  const existingArrayStr = match[1].trim()
  const existingIds = new Set(
    [...existingContent.matchAll(/{id:(\d+),/g)].map(m => parseInt(m[1], 10))
  )

  const uniqueNew = newArticles.filter(a => !existingIds.has(a.id))

  if (uniqueNew.length === 0) return 0

  const allArticlesStr = existingArrayStr.endsWith(',') 
    ? existingArrayStr.slice(0, -1) 
    : existingArrayStr
  
  let newArrayStr = allArticlesStr + ',\n'
  for (const a of uniqueNew) {
    const safeSummary = a.summary.replace(/\\"/g, '"').replace(/"/g, '\\"').replace(/'/g, "\\'")
    const safeContent = a.fullContent.replace(/\\"/g, '"').replace(/"/g, '\\"').replace(/\n/g, '\\n')
    const entry = `{id:${a.id},title:"${a.title}",slug:"${a.slug}",summary:"${safeSummary}",date:'${a.date}',category:'${a.category}',fullContent:"${safeContent}"},`
    newArrayStr += entry + '\n'
  }
  newArrayStr += '];'

  const newContent = existingContent.replace(
    /export\s+const\s+articles:\s*Article\[\]\s*=\s*\[[\s\S]*?\];/,
    `export const articles: Article[] = [\n${newArrayStr}`
  )

  fs.writeFileSync(filePath, newContent, 'utf8')
  return uniqueNew.length
}

// ==================== 已有文章读取 ====================
function loadExistingArticles(filePath) {
  const content = fs.readFileSync(filePath, 'utf8')
  const articles = []
  const regex = /\{id:(\d+),title:"([^"]+)",slug:"([^"]+)",summary:"([^"]+)",date:'([^']+)',category:'([^']+)',fullContent:"([\s\S]*?)"\},?/g
  let match
  while ((match = regex.exec(content)) !== null) {
    articles.push({
      id: parseInt(match[1]),
      title: match[2],
      slug: match[3],
      summary: match[4],
      date: match[5],
      category: match[6],
      fullContent: match[7],
    })
  }
  return articles
}

// ==================== 主流程 ====================
async function main() {
  console.log('🔮 九宫八卦 AI文章系统 v2（质量升级版）')
  console.log('='.repeat(45))
  console.log(`目标篇数: ${COUNT}`)
  console.log('')

  // 1. 读取关键词
  if (!fs.existsSync(KEYWORDS_FILE)) {
    console.error(`❌ 关键词文件不存在: ${KEYWORDS_FILE}`)
    process.exit(1)
  }
  
  const keywords = fs.readFileSync(KEYWORDS_FILE, 'utf8')
    .split('\n')
    .map(k => k.trim())
    .filter(k => k.length > 0 && !k.startsWith('#'))

  console.log(`📚 关键词池: ${keywords.length} 个`)
  console.log(`   （覆盖领域：八字命理、紫微斗数、风水、面相手相、`)
  console.log(`    姓名学、择日择吉、占卜术数、解梦、生肖运势、`)
  console.log(`    数字能量、太岁神煞、道家养生、中医五行、`)
  console.log(`    节气历法、传统文化、命理综合）`)
  console.log('')

  const wenkuDataPath = path.join(REPO_DIR, 'src/app/wenku/wenkuData.ts')
  const existingArticles = loadExistingArticles(wenkuDataPath)
  const existingSlugs = new Set(existingArticles.map(a => a.slug))

  console.log(`📖 已有文章: ${existingArticles.length} 篇`)
  console.log('')

  // 2. 日期分配
  const dateAssignments = assignDates(COUNT, existingArticles)

  // 3. 逐篇生成
  let success = 0
  let skipped = 0
  const newArticles = []

  for (let i = 0; i < COUNT; i++) {
    const idx = (i + Math.floor(Math.random() * keywords.length)) % keywords.length
    const keyword = keywords[idx]

    // 取category（从文章数据推断，或随机分配）
    const catIdx = i % CATEGORIES.length
    const category = CATEGORIES[catIdx]

    process.stdout.write(`  📄 [${i+1}/${COUNT}] ${keyword} ... `)

    const article = buildArticle(keyword, category, dateAssignments[i], existingSlugs, existingArticles)

    if (!article) {
      skipped++
      process.stdout.write('⏭️\n')
      continue
    }

    // 保存到generated-articles
    fs.mkdirSync(OUTPUT_DIR, { recursive: true })
    fs.writeFileSync(
      path.join(OUTPUT_DIR, `${article.slug}.json`),
      JSON.stringify(article, null, 2),
      'utf8'
    )

    newArticles.push(article)
    existingSlugs.add(article.slug)
    success++
    process.stdout.write('✅\n')
  }

  // 4. 写入wenkuData.ts
  const written = writeToWenkuData(wenkuDataPath, newArticles)

  console.log('')
  console.log('='.repeat(45))
  console.log(`✅ 本轮完成`)
  console.log(`   新生成: ${success} 篇`)
  console.log(`   跳过（重复slug）: ${skipped} 篇`)
  console.log(`   成功写入: ${written} 篇`)
  console.log('')
  console.log('📊 日期分配:')
  const dateCount = {}
  for (const a of newArticles) {
    dateCount[a.date] = (dateCount[a.date] || 0) + 1
  }
  for (const [d, c] of Object.entries(dateCount).sort()) {
    console.log(`   ${d}: ${c}篇`)
  }
  console.log('')
  console.log('📊 运行 npx tsc --noEmit 检查编译')
  console.log('📤 运行 git commit & push 部署上线')
}

main().catch(err => {
  console.error('❌ 脚本异常:', err)
  process.exit(1)
})
