// 从渊海子平抽取核心赋文 → 生成《子平赋诀》独立书
const fs = require('fs')

const src = fs.readFileSync('src/data/xueguan/content/yuanhai-zipping.ts', 'utf8')
// 提取 chapters 数组字面量
const cs = src.indexOf('chapters: [')
const ce = src.lastIndexOf(']')
const arrText = src.slice(cs + 'chapters: ['.length, ce)
const chapters = Function('return [' + arrText + ']')()

const WANT = ['继善篇', '碧渊赋', '四言独步', '五言独步', '身命赋', '金玉赋', '玄机赋', '络绎赋', '通明赋', '千里马', '气象篇']
// 找卷五章节的 subchapters
const juan5 = chapters.find(c => (c.title || '').includes('卷五'))
const subs = (juan5 && juan5.subchapters) || []
const picked = subs.filter(c => WANT.some(w => (c.title || '').includes(w)))
console.log('渊海总章数:', chapters.length, '| 卷五子节:', subs.length, '| 抽取赋文:', picked.length)
picked.forEach(p => console.log(' -', p.title, '(' + (p.content || '').length + '字)'))

if (!picked.length) { console.error('无抽取——退出'); process.exit(1) }

const chs = picked.map((c, i) => `    {\n      id: 'fu${i + 1}',\n      title: '${(c.title || '').replace(/'/g, '')}',\n      content: \`${(c.content || '').replace(/`/g, '\\`').replace(/\$\{/g, '\\${')}\`,\n    }`).join(',\n')

const out = `// 子平赋诀（自《渊海子平·诸家赋文歌诀》卷辑录——同公版底本）
import type { BookChapter } from '../categories'

export const zipingfujueContent: BookChapter = {
  bookId: 'ziping-fujue',
  metadata: {
    sourceOrg: 'jiugong-bagua',
    catalogVersion: '1.0',
    curatedBy: '九宫易学书馆',
    curatedAt: '2026-09-05',
    sourceVersion: '辑自《渊海子平》卷五·诸家赋文歌诀（通行本）',
  },
  preface: {
    id: 'preface',
    title: '九宫导读',
    content: '《子平赋诀》辑自《渊海子平》卷五"诸家赋文歌诀"。\\n\\n【概要】\\n子平法成熟期（宋元明）形成的核心口诀赋文：继善篇总论命理纲要，四言/五言独步简诀括格局喜忌，碧渊赋、金玉赋、玄机赋等铺陈十神生克与格局取用，身命赋专论日主强弱。\\n\\n【九宫按】\\n赋文以韵语浓缩子平法精华，历来为命理入门必诵。与《滴天髓》《子平真诠》对读，可收"歌诀提纲+实例阐发"之效。\\n\\n【阅读建议】\\n先诵四言、五言独步得框架，再读继善篇与诸赋细部；赋中"喜忌"语宜结合具体命局理解，不可胶柱鼓瑟。\\n\\n【版本说明】\\n文本辑自本馆《渊海子平》卷五（通行本），与原本卷次一致。',
  },
  chapters: [
${chs}
  ],
}
`
fs.writeFileSync('src/data/xueguan/content/ziping-fujue.ts', out)
console.log('已生成 src/data/xueguan/content/ziping-fujue.ts')
