// 古籍采集入库生成器：繁→简转换 + 生成 content TS + 注册信息
// 用法：node scripts/ingest-book.mjs <book-key>
import fs from 'fs'
import path from 'path'
import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const OpenCC = require('opencc-js')

const conv = OpenCC.Converter({ from: 't', to: 'cn' })
const TMP = process.env.LOCALAPPDATA + '/Temp'

// 书名 → (id, category, 作者/朝代/简介, 分章模式)
const PLAN = {
  'zuowang-lun': {
    file: 'zuowang-lun.txt', id: 'zuowang-lun', category: 'daojia-jingdian',
    title: '坐忘论', author: '司马承祯', dynasty: '唐', vol: '一卷',
    summary: '唐代道教修炼经典，提出"安心坐忘"七阶次第，融合庄子坐忘与道家养生',
    kw: ['坐忘', '司马承祯', '道教修炼', '静定', '养生'],
    split: '=== ', // 以 === 标题分章
  },
  'yanbo-diaosou-ge': {
    file: 'yanbo-diaosou-ge.txt', id: 'yanbo-diaosou-ge', category: 'bushi-qimen',
    title: '烟波钓叟歌', author: '托名赵普（宋）', dynasty: '宋', vol: '一篇',
    summary: '奇门遁甲最重要口诀歌，总论阴阳二遁、九宫八门、六仪三奇与用局之法',
    kw: ['奇门遁甲', '烟波钓叟歌', '九宫', '八门', '三奇六仪'],
    split: null, // 不分章（单章）
  },
  'tai-xuan-jing': {
    file: 'tai-xuan-jing.txt', id: 'tai-xuan-jing', category: 'bushi-yijing',
    title: '太玄经', author: '扬雄', dynasty: '西汉', vol: '十卷',
    summary: '扬雄仿《周易》而作的哲学占测经典，以玄为首、八十一首涵盖宇宙万物运行',
    kw: ['太玄', '扬雄', '玄学', '易学', '占测'],
    split: '=== ',
  },
  'dili-bianzheng': {
    file: 'dili-bianzheng.txt', id: 'dili-bianzheng', category: 'fengshui-liqi',
    title: '地理辨正', author: '蒋大鸿', dynasty: '清', vol: '五卷',
    summary: '玄空风水开山经典，辨正青囊诸经，阐发三元九运理气大义',
    kw: ['玄空', '蒋大鸿', '地理辨正', '青囊', '三元九运', '理气'],
    split: '== ',
  },
  'renzi-xuzhi': {
    file: 'renzi-xuzhi.txt', id: 'renzi-xuzhi', category: 'fengshui-xingshi',
    title: '人子须知', author: '徐善继、徐善述', dynasty: '明', vol: '三十卷',
    summary: '明代风水形势派集大成之作，龙穴砂水四科详备，风水文献百科',
    kw: ['人子须知', '徐善继', '风水', '形势', '龙穴砂水', '寻龙点穴'],
    split: '== ',
  },
}

async function main() {
  const key = process.argv[2]
  const p = PLAN[key]
  if (!p) { console.error('未知书:', key, '可选:', Object.keys(PLAN).join(',')); process.exit(1) }
  const raw = fs.readFileSync(path.join(TMP, p.file), 'utf-8')
  const zh = conv(raw) // 繁→简
  // 清洗：[[目标|文字]]→文字、[[链接]]→链接名、残留模板/标签
  let text = zh
  text = text.replace(/\[\[([^\]|]*)\|([^\]]*)\]\]/g, '$2')  // 带显示的链接先处理
  text = text.replace(/\[\[([^\]]*)\]\]/g, '$1')             // 无显示链接
  text = text.replace(/<[^>]+>/g, '')
  text = text.trim()
  // 分章：=== 标题 === 严格解析
  let chapters = []
  if (p.split) {
    const segs = text.split(/(?:^|\n)\s*===+\s*([^=]+?)\s*===+\s*(?=\n|$)/)
    // segs: [导言, t1, b1, t2, b2, ...]
    let intro = (segs[0] || '').trim()
    if (intro.length > 30) chapters.push({ title: '序言', body: intro })
    for (let i = 1; i < segs.length; i += 2) {
      const title = (segs[i] || '').trim()
      const body = (segs[i + 1] || '').trim()
      if (title && body.length > 20) chapters.push({ title, body })
    }
  } else {
    chapters.push({ title: '全篇', body: text })
  }
  // 过滤空
  chapters = chapters.filter(c => c.body.length > 30)
  console.log(`《${p.title}》${zh.length}字 → ${chapters.length} 章`)

  // 生成 content TS
  const meta = `  metadata: {\n    sourceOrg: 'jiugong-bagua',\n    catalogVersion: '1.0',\n    curatedBy: '九宫易学书馆',\n    curatedAt: '2026-09-05',\n    sourceVersion: '维基文库公版文本（${p.title}）',\n  },`
  const preface = `  preface: {\n    id: 'preface',\n    title: '九宫导读',\n    content: '《${p.title}》${p.vol}，${p.author}（${p.dynasty}）。\\n\\n【概要】\\n${p.summary}。\\n\\n【九宫按】\\n本书是${p.dynasty}代${p.category.includes('daojia') ? '道家修炼' : '术数'}文献，言简意深，历来为${p.category.includes('daojia') ? '养生修心' : '奇门'}' + '研究者所重。\\n\\n【阅读建议】\\n通读原文，体会${p.category.includes('daojia') ? '"静定收心"的次第' : '歌诀的体系框架'}，不必强求一字记诵。\\n\\n【版本说明】\\n本文以维基文库公版文本为底本录入。',\n  },`
  const chs = chapters.map((c, i) => `    {\n      id: 'ch${i + 1}',\n      title: '${c.title.replace(/'/g, '')}',\n      content: \`${c.body.replace(/`/g, '\\`').replace(/\$\{/g, '\\${')}\`,\n    }`).join(',\n')
  const out = `// ${p.title}（自动采集入库——维基文库公版）\nimport type { BookChapter } from '../categories'\n\nexport const ${key.replace(/-/g, '')}Content: BookChapter = {\n  bookId: '${p.id}',\n${meta}\n${preface}\n  chapters: [\n${chs}\n  ],\n}\n`
  const dest = path.join('src/data/xueguan/content', key + '.ts')
  fs.writeFileSync(dest, out)
  console.log('已生成:', dest)
}
main().catch(e => { console.error(e); process.exit(1) })
