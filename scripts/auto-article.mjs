/**
 * 九宫八卦 — AI自动化文章采集改写脚本
 * 
 * 用法:
 *   node scripts/auto-article.mjs [篇数]
 * 
 * 环境变量:
 *   ARTICLE_COUNT: 目标篇数（默认100）
 *   KEYWORDS_FILE: 关键词文件路径（默认 scripts/keywords.txt）
 *   TARGET_FILE:   wenkuData.ts 写入路径（自动）
 * 
 * 流程:
 *   1. 读取关键词池
 *   2. 逐个关键词：抓取热点 → 大模型改写 → 生成结构化文章
 *   3. 批量写入 wenkuData.ts
 *   4. git commit & push → GitHub Actions 自动构建部署
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const REPO_DIR = path.resolve(__dirname, '..')
const OUTPUT_DIR = path.join(REPO_DIR, 'scripts/generated-articles')

// ==================== 配置 ====================

const COUNT = parseInt(process.env.ARTICLE_COUNT || '100', 10)
const KEYWORDS_FILE = process.env.KEYWORDS_FILE || path.join(REPO_DIR, 'scripts/keywords.txt')

// 文章分类池
const CATEGORIES = [
  '八字命理', '紫微斗数', '风水知识', '姓名文化',
  '面相手相', '解梦文化', '数字能量', '择日择吉',
  '易学基础', '生肖运势'
]

// 文章模板后缀
const TEMPLATES = [
  '全面解读', '深度分析', '入门指南', '实用技巧',
  '经典案例', '专业详解', '基础知识', '进阶指南',
  '常见问题', '专家视角'
]

// ==================== 主流程 ====================

async function main() {
  console.log('🔮 九宫八卦 AI文章生成器')
  console.log('='.repeat(40))
  console.log(`目标篇数: ${COUNT}`)
  console.log(`关键词文件: ${KEYWORDS_FILE}`)
  console.log(`输出目录: ${OUTPUT_DIR}`)
  console.log('')

  // 1. 读取关键词
  if (!fs.existsSync(KEYWORDS_FILE)) {
    console.error(`❌ 未找到关键词文件: ${KEYWORDS_FILE}`)
    console.error('   请先创建关键词文件（每行一个关键词）')
    process.exit(1)
  }
  
  const keywords = fs.readFileSync(KEYWORDS_FILE, 'utf8')
    .split('\n')
    .map(k => k.trim())
    .filter(k => k.length > 0 && !k.startsWith('#'))

  console.log(`关键词池: ${keywords.length} 个`)
  console.log('')

  // 2. 读取已有文章（避免重复slug）
  const wenkuDataPath = path.join(REPO_DIR, 'src/app/wenku/wenkuData.ts')
  const existingContent = fs.readFileSync(wenkuDataPath, 'utf8')
  const existingSlugs = new Set(
    [...existingContent.matchAll(/slug:"([^"]+)"/g)].map(m => m[1])
  )
  console.log(`已有文章: ${existingSlugs.size} 篇`)

  // 3. 读取已生成但未入库的文章记录
  fs.mkdirSync(OUTPUT_DIR, { recursive: true })
  const generatedFiles = fs.readdirSync(OUTPUT_DIR).filter(f => f.endsWith('.json'))
  const pendingArticles = generatedFiles
    .map(f => JSON.parse(fs.readFileSync(path.join(OUTPUT_DIR, f), 'utf8')))
    .filter(a => !existingSlugs.has(a.slug))

  console.log(`待入库: ${pendingArticles.length} 篇`)
  console.log('')

  // 4. 生成新文章
  let success = 0
  let skipped = 0
  let failed = 0
  const articles = [...pendingArticles] // 先取已生成的

  for (let i = 0; i < COUNT; i++) {
    // 选关键词（轮换+随机偏移）
    const idx = (i + Math.floor(Math.random() * keywords.length)) % keywords.length
    const keyword = keywords[idx]
    const category = CATEGORIES[i % CATEGORIES.length]
    const template = TEMPLATES[Math.floor(Math.random() * TEMPLATES.length)]

    // 生成slug
    const slugBase = keyword.replace(/[《》.,!?:\/\\()"'“”%\s]+/g, '-').replace(/^-+|-+$/g, '').toLowerCase()
    const slug = `${slugBase}-${Date.now().toString(36)}`

    // 去重
    if (existingSlugs.has(slug)) {
      skipped++
      continue
    }

    process.stdout.write(`  📄 [${i+1}/${COUNT}] ${keyword} - ${template} ... `)

    try {
      // 构建文章（后续接入大模型改写）
      const now = new Date()
      const dateStr = now.toISOString().split('T')[0]
      
      const article = {
        id: Math.floor(Math.random() * 90000000) + 10000000,
        title: `${keyword}${template}`,
        slug,
        summary: `「${keyword}」的${template}——九宫八卦命理体系权威解读。了解${keyword}对个人命运和运势分析的重要意义。`,
        date: dateStr,
        category,
        fullContent: await generateArticleContent(keyword, category, template),
        keywords: [keyword],
        internalLinks: []
      }

      // 保存到generated-articles（缓存）
      fs.writeFileSync(
        path.join(OUTPUT_DIR, `${slug}.json`),
        JSON.stringify(article, null, 2),
        'utf8'
      )

      articles.push(article)
      existingSlugs.add(slug)
      success++
      process.stdout.write('✅\n')
    } catch (err) {
      failed++
      process.stdout.write(`❌ ${err.message}\n`)
    }
  }

  // 5. 写入 wenkuData.ts
  if (articles.length > 0) {
    writeToWenkuData(wenkuDataPath, articles)
  }

  console.log('')
  console.log('='.repeat(40))
  console.log(`✅ 本轮完成`)
  console.log(`   新生成: ${success} 篇`)
  console.log(`   跳过（重复）: ${skipped} 篇`)
  console.log(`   失败: ${failed} 篇`)
  console.log(`   累计待入库: ${articles.length} 篇`)
  console.log(`   文章保存到: ${wenkuDataPath}`)
  console.log('')
  console.log('📊 运行 npm run build 检查构建效果')
  console.log('📤 运行 git commit & push 部署上线')
}

// ==================== 改写引擎 ====================

/**
 * 生成文章正文（结构化800-1500字）
 * 目前是占位版本，后续接入大模型API
 */
async function generateArticleContent(keyword, category, template) {
  // 构建结构化正文
  let content = `## 什么是${keyword}\n\n`

  content += `${keyword}是中国传统${category}领域中的重要概念。` +
    `深入研究${keyword}，能够帮助我们更好地理解个人命运的规律和方向。\n\n`

  content += `## ${keyword}的核心要点\n\n`

  content += `### 1. 基本含义\n\n`
  content += `在${category}体系中，${keyword}有着特定的象征意义和吉凶属性。` +
    `它反映了一个人在性格、事业、财运、婚姻等方面的特征和趋势。\n\n`

  content += `### 2. 命理依据\n\n`
  content += `《三命通会》云：「……」传统命理对${keyword}的分析，` +
    `需要结合八字原局、大运走势、流年引动等多方面因素综合判断。\n\n`

  content += `### 3. 实际应用\n\n`
  content += `了解${keyword}对个人运势的意义，可以帮助我们在适当的时间做出正确的选择。` +
    `但需注意，命理分析只是参考，个人努力同样重要。\n\n`

  content += `## 案例分析\n\n`
  content += `以实际命盘为例，当${keyword}出现在不同柱位时，其影响程度和表现形式各有差异。` +
    `年柱见之影响祖上，月柱见之影响父母兄弟，日柱见之影响自身配偶，时柱见之影响子女晚年。\n\n`

  content += `## 九宫八卦专业建议\n\n`
  content += `> 九宫八卦AI命理体系，基于传统命理典籍和现代数据分析，` +
    `为您提供专业的${keyword}分析和个性化命理建议。\n\n`
  content += `前往 [九宫八卦八字排盘](/bazi) 输入出生信息，获取完整的AI命理分析报告。\n\n`
  content += `相关阅读：`
  content += `\n- [知识文库](/wenku) - 更多命理知识`
  content += `\n- [八字排盘](/bazi) - 在线命盘分析`
  content += `\n- [专家预约](/experts) - 一对一深度解读`
  content += `\n\n---`
  content += `\n*本文由九宫八卦AI命理体系自动生成，内容仅供参考。*`

  return content
}

// ==================== wenkuData.ts 写入 ====================

function writeToWenkuData(filePath, newArticles) {
  // 读取现有文章
  const existingContent = fs.readFileSync(filePath, 'utf8')

  // 正则提取已有articles数组
  const match = existingContent.match(/export\s+const\s+articles:\s*Article\[\]\s*=\s*\[([\s\S]*?)\];/)
  if (!match) {
    console.error('❌ 无法解析 wenkuData.ts 的文章数组')
    process.exit(1)
  }

  const existingArrayStr = match[1].trim()
  const existingArticles = []

  // 简单解析已有文章（通过id去重）
  const idRegex = /{id:(\d+),/g
  let idMatch
  const existingIds = new Set()
  while ((idMatch = idRegex.exec(existingContent)) !== null) {
    existingIds.add(parseInt(idMatch[1], 10))
  }

  // 过滤掉新文章和已有文章重复的
  const uniqueNew = newArticles.filter(a => !existingIds.has(a.id))

  if (uniqueNew.length === 0) {
    console.log('   没有新的文章需要写入')
    return
  }

  // 构建完整数组
  const allArticlesStr = existingArrayStr.endsWith(',') 
    ? existingArrayStr.slice(0, -1) 
    : existingArrayStr
  
  let newArrayStr = allArticlesStr + ',\n'
  for (const a of uniqueNew) {
    // 安全转义（content中的双引号）
    const safeContent = a.fullContent.replace(/"/g, '\\"').replace(/\n/g, '\\n')
    const entry = `{id:${a.id},title:"${a.title}",slug:"${a.slug}",summary:"${a.summary}",date:'${a.date}',category:'${a.category}',fullContent:"${safeContent}"},`
    newArrayStr += entry + '\n'
  }
  newArrayStr += '];'

  const newContent = existingContent.replace(
    /export\s+const\s+articles:\s*Article\[\]\s*=\s*\[[\s\S]*?\];/,
    `export const articles: Article[] = [\n${newArrayStr}`
  )

  fs.writeFileSync(filePath, newContent, 'utf8')
  console.log(`✅ 成功写入 ${uniqueNew.length} 篇新文章到 wenkuData.ts`)
}

// ==================== 启动 ====================

main().catch(err => {
  console.error('❌ 脚本异常退出:', err)
  process.exit(1)
})
