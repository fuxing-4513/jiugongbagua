// 生成九宫文库搜索索引（卦象64 + 人物 + 干支22 + 术语1022——全知识库检索）
// 输出 anti-scrape 混淆路径 public/data/{PREFIX}-wenku-search-{HASH}.json
const fs = require('fs')
const path = require('path')

const PREFIX = 'c5dc0cc7'
const HASH = 'c3526e2d'

const out = { updatedAt: new Date().toISOString().slice(0, 10), gua: [], renwu: [], ganzhi: [], glossary: [] }

// ── 1. 卦象 64（周易 content chapters：title "第N卦 · 名（上下）"——slug guaNN）──
try {
  const zy = fs.readFileSync('src/data/xueguan/content/zhouyi.ts', 'utf8')
  const chs = [...zy.matchAll(/title: '第([一二三四五六七八九十百零]+)卦[^']*?·[^']*?([（(]?[^']*?)['"]/g)].map(m => ({ n: m[1], rest: m[2] }))
  // 更稳：直接提 title 序列
  const titles = [...zy.matchAll(/title: '([^']{6,40})'/g)].map(m => m[1]).filter(t => t.includes('卦'))
  titles.forEach((t, i) => {
    const m = t.match(/第(.+?)卦\s*[·.]?\s*([^（(]+)/)
    if (m) out.gua.push({ n: i + 1, name: (m[2] || '').trim(), full: t.replace(/第.+?卦\s*[·.]?\s*/, ''), slug: `gua${String(i + 1).padStart(2, '0')}` })
  })
} catch (e) { console.log('卦象解析失败', e.message) }

// ── 2. 人物（people.ts + ext-1~7）──
const peopleFiles = ['src/data/renwu/people.ts', 'src/data/renwu/people-ext-1.ts', 'src/data/renwu/people-ext-2.ts', 'src/data/renwu/people-ext-3.ts', 'src/data/renwu/people-ext-4.ts', 'src/data/renwu/people-ext-5.ts', 'src/data/renwu/people-ext-6.ts', 'src/data/renwu/people-ext-7.ts']
for (const pf of peopleFiles) {
  const s = fs.readFileSync(pf, 'utf8')
  for (const m of s.matchAll(/id: '([a-z0-9-]+)', name: '([^']+)',[^]*?era: '([^']*)',[^]*?slug: '([^']+)',[^]*?intro: '([^']*)'/g)) {
    out.renwu.push({ id: m[1], name: m[2], era: m[3], slug: m[4], intro: (m[5] || '').slice(0, 60) })
  }
  // 兼容顺序变化：id/name 后找 intro
}
// 兜底：若上面正则漏（字段顺序差异）——用宽松二次提取
const seenRenwu = new Set(out.renwu.map(r => r.id))
for (const pf of peopleFiles) {
  const s = fs.readFileSync(pf, 'utf8')
  const blocks = s.split('\n  {\n')
  for (const b of blocks) {
    const id = (b.match(/id: '([a-z0-9-]+)'/) || [])[1]
    if (!id || seenRenwu.has(id)) continue
    const name = (b.match(/name: '([^']+)'/) || [])[1] || id
    const slug = (b.match(/slug: '([^']+)'/) || [])[1] || id
    const intro = (b.match(/intro: '([^']*)'/) || [])[1] || ''
    out.renwu.push({ id, name, era: '', slug, intro: intro.slice(0, 60) })
    seenRenwu.add(id)
  }
}

// ── 3. 干支 22 ──
try {
  const gz = fs.readFileSync('src/data/ganzhi/ganzhi.ts', 'utf8')
  for (const m of gz.matchAll(/id: '([^']+)',\s*kind: '([^']+)',\s*wuxing: '([^']+)',[^]*?meaning: '([^']*)'/g)) {
    out.ganzhi.push({ id: m[1], kind: m[2], wuxing: m[3], meaning: (m[4] || '').slice(0, 50) })
  }
} catch (e) { console.log('干支解析失败', e.message) }

// ── 4. 术语（glossary-data + ext-1~7）──
const glFiles = ['src/lib/glossary-data.ts', 'src/lib/glossary-ext-1.ts', 'src/lib/glossary-ext-2.ts', 'src/lib/glossary-ext-3.ts', 'src/lib/glossary-ext-4.ts', 'src/lib/glossary-ext-5.ts', 'src/lib/glossary-ext-6.ts', 'src/lib/glossary-ext-7.ts']
for (const gf of glFiles) {
  const s = fs.readFileSync(gf, 'utf8')
  for (const m of s.matchAll(/\{slug:'([^']+)',name:'([^']+)'[^]*?category:'([^']+)',shortDesc:'([^']{0,80})'/g)) {
    out.glossary.push({ slug: m[1], name: m[2], category: m[3], shortDesc: (m[4] || '').slice(0, 60) })
  }
}

// 去重（人物 id 唯一 + 术语 slug 唯一）
out.renwu = out.renwu.filter((r, i, a) => a.findIndex(x => x.id === r.id) === i)
out.glossary = out.glossary.filter((g, i, a) => a.findIndex(x => x.slug === g.slug) === i)

// 输出
const file = `public/data/${PREFIX}-wenku-search-${HASH}.json`
fs.writeFileSync(file, JSON.stringify(out))
console.log(`文库搜索索引: 卦${out.gua.length} 人物${out.renwu.length} 干支${out.ganzhi.length} 术语${out.glossary.length} → ${file}`)
