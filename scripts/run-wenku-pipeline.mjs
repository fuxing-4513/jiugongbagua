// cron: 每天早上7点执行
// 调起pipeline模块,采集热点+生成3篇文章+5次改写+质检

import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const { writeFileSync, existsSync, readdirSync, mkdirSync } = await import('fs')
const { join, dirname } = await import('path')
const { fileURLToPath } = await import('url')

const __dirname = dirname(fileURLToPath(import.meta.url))
const QUEUE_DIR = join(__dirname, 'wenku-queue')

import {
  SEED_KEYWORDS, PLATFORMS, JIUGONG_ANGLES,
  scoreTopic, clusterHotspots, selectTopics,
  generateDraft, rewritePass1, rewritePass2, rewritePass3,
  rewritePass4, rewritePass5, qualityCheck,
} from './wenku-pipeline.mjs'

const today = new Date().toISOString().split('T')[0]

console.log('=== 文库自动化流水线 ===')
console.log('日期:', today)
console.log('')

// 1. 采集热点(用最少API调用的方式:web_search+平台限定)
// 不直接调用web_search(因为是tool),用web_fetch采集
// 缓存到wenku-hotcache目录
const CACHE_DIR = join(__dirname, 'wenku-hotcache')
mkdirSync(CACHE_DIR, { recursive: true })

async function collectWithWebFetch() {
  const allTopics = []
  const seen = new Set()

  for (const kw of SEED_KEYWORDS) {
    for (const platform of PLATFORMS) {
      const url = `https://www.baidu.com/s?wd=${encodeURIComponent(kw + ' site:' + platform)}&ie=utf-8`
      try {
        const resp = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (compatible)' }, signal: AbortSignal.timeout(5000) })
        const html = await resp.text()
        // 简单提取标题
        const titleMatches = html.match(/<h3[^>]*>.*?<a[^>]*>(.*?)<\/a>/g) || []
        for (const m of titleMatches.slice(0, 3)) {
          const title = m.replace(/<[^>]+>/g, '').trim()
          if (title.length > 5 && !seen.has(title)) {
            seen.add(title)
            allTopics.push({ title, snippet: '', keyword: kw, source: platform, score: scoreTopic(title, '', kw) })
          }
        }
      } catch { /* ignore timeouts */ }
    }
  }

  return allTopics
}

async function main() {
  const hotspots = await collectWithWebFetch()
  console.log('采集到热点:', hotspots.length)

  const clusters = clusterHotspots(hotspots)
  const selected = selectTopics(clusters, 3)
  console.log('选定文章:', selected.length)
  console.log('')

  const results = []
  for (let i = 0; i < selected.length; i++) {
    const topic = selected[i]
    console.log('--- 文章', i+1, ':', topic.title)

    let article = generateDraft(topic)
    console.log('  初稿 v1')
    article = rewritePass1(article); console.log('  改写 v2')
    article = rewritePass2(article); console.log('  改写 v3')
    article = rewritePass3(article); console.log('  改写 v4')
    article = rewritePass4(article); console.log('  改写 v5')
    article = rewritePass5(article); console.log('  改写 v6')

    const issues = qualityCheck(article)
    if (issues.length > 0) console.log('  质检:', issues.join('; '))
    else console.log('  质检 ✅')

    article.id = Date.now() + i
    article.filename = 'wenku-draft-' + today + '-' + (i+1) + '.json'
    article.reviewUrl = 'https://jiugongbagua.com/wenku-review/' + article.filename
    results.push(article)
  }

  // 保存
  for (const a of results) {
    const fp = join(QUEUE_DIR, a.filename)
    writeFileSync(fp, JSON.stringify(a, null, 2), 'utf-8')
    console.log('  保存:', fp)
    console.log('  角度:', a.angle, '| 字数:', a.charCount || '?')
  }

  console.log('')
  console.log('=== 完成!', results.length, '篇待审 ===')
  for (const a of results) {
    console.log('  ' + a.title)
    console.log('    ' + QUEUE_DIR + '/' + a.filename)
  }
}

main().catch(e => console.error('FAILED:', e.message))
