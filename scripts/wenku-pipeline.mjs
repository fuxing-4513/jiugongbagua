// 文库自动化流水线 v2
// 每天挖掘国内玄学热点 -> 5次改写打磨 -> 输出到wenku-queue供审查
// 触发: cron 每天07:00运行
// 输出: scripts/wenku-queue/wenku-draft-YYYY-MM-DD-N.json

export const VERSION = '2.0'
export const DAILY_TARGET = 3
export const WEEKLY_TARGET = 15

// 热点种子
export const SEED_KEYWORDS = [
  '八字', '命理', '运势2026', '风水', '紫微斗数', '生肖运势',
  '桃花运', '事业运', '财运', '婚姻感情', '贵人', '小人',
  '大运流年', '五行', '易经智慧', '面相手相',
]

// 国内top10平台
export const PLATFORMS = [
  'zhihu.com', 'xiaohongshu.com', 'weibo.com', 'baidu.com',
  'douyin.com', 'bilibili.com', 'toutiao.com', 'hupu.com',
  'douban.com', 'mp.weixin.qq.com',
]

// 九宫分析角度
export const JIUGONG_ANGLES = [
  {
    name: '制用结构',
    intro: '一个人的行为模式取决于他"制"什么——有人制财、有人制官、有人制人。九宫体系用"绳子(工具)×牛(猎物)"框架来分析。',
    hook: '大多数人只看到他在做什么,看不到他真正在"制"什么。',
  },
  {
    name: '控制权三级',
    intro: '控制权分三级:出处(能量来源) > 生(能量流向) > 控制(谁说了算)。一级控制权决定天花板。',
    hook: '他不是靠能力走到今天的,他是靠"出处"。出处不对,再努力也白费。',
  },
  {
    name: '关系链引擎',
    intro: '从日主到目标字的最短路径——BFS多跳推理揭示关键"桥梁"节点。',
    hook: '从A到B从来不是直路。找到那个C,才看懂全局。',
  },
  {
    name: '两象定一象',
    intro: '两条独立路径指向同一结论才是可信的。单条是巧合,双线是必然。',
    hook: '一个特征只是偶然,两条独立的分析路径都指向同一个方向,这就是该认真对待的事。',
  },
  {
    name: '借根分析',
    intro: '根是有没有底盘的问题。有根的人自己是底盘,无根的人凡事要"借"。',
    hook: '无根不是缺点,是一种商业模式。借对了就起飞,借错了就翻车。',
  },
  {
    name: '原局有无',
    intro: '原局有的字叫"道上运",原局无的叫"外来运"。前者顺风顺水,后者要么爆发要么翻。',
    hook: '同一个人今年顺明年逆,根源就在原局有和原局无。',
  },
  {
    name: '四柱视角',
    intro: '年柱=政策/祖业,月柱=市场/社交,日柱=自己/老板,时柱=团队/晚年。',
    hook: '一个人的命运80%已经被年月框住了。剩下20%的主动权在日时。',
  },
  {
    name: '墓库体系',
    intro: '辰戌丑未四大墓库——藏与透、开与闭,决定能量是积蓄还是爆发。',
    hook: '有些人看着平平无奇突然爆发了,那不是运气,是"库开了"。',
  },
  {
    name: '官运层次',
    intro: '正制vs反制——在体制内升得快还是在体制外闯得野,取决于官杀是制你还是被你制。',
    hook: '真正的权力不是你有多少下属,而是你不需要任何人同意就能做决定。',
  },
]

// 热点评分
export function scoreTopic(title, content, keyword) {
  let s = 0
  const text = (title + ' ' + content)
  const core = ['八字','命理','运势','风水','紫微斗数','五行','易经','天干','十神','流年','大运']
  const high = ['财运','事业','桃花','婚姻','贵人','小人','破财','升职','创业','赚钱']
  for (const w of core) { if (text.includes(w)) s += 5 }
  for (const w of high) { if (text.includes(w)) s += 3 }
  if (text.includes('2026') || text.includes('今年')) s += 4
  if ((content || '').length > 300) s += 2
  return s
}

// 聚类
export function clusterHotspots(hotspots) {
  const cls = { 财运:[], 事业:[], 感情:[], 健康:[], 运势:[], 风水:[], 命理:[], 其他:[] }
  for (const h of hotspots) {
    const t = (h.title || '') + (h.snippet || '')
    if (/财|钱|富|投资|赚钱|暴富/.test(t)) cls.财运.push(h)
    else if (/官|事业|升|职|创业|管理|老板/.test(t)) cls.事业.push(h)
    else if (/姻|桃|婚|情|恋|脱单|分手/.test(t)) cls.感情.push(h)
    else if (/病|医|健|养生|睡眠|失眠/.test(t)) cls.健康.push(h)
    else if (/运|势|2026|今年/.test(t)) cls.运势.push(h)
    else if (/水|房|宅|居|办公室/.test(t)) cls.风水.push(h)
    else if (/命|八|甲|卜|数|卦|易/.test(t)) cls.命理.push(h)
    else cls.其他.push(h)
  }
  return cls
}

// 选题
export function selectTopics(clusters, count) {
  const selected = []
  const order = ['财运','事业','感情','运势','风水','命理','健康','其他']
  const used = new Set()
  for (let iter = 0; iter < 20; iter++) {
    for (const cat of order) {
      if (selected.length >= count) break
      const items = clusters[cat] || []
      const avail = items.filter((_, i) => !used.has(cat + '-' + i))
      if (avail.length === 0) continue
      avail.sort((a, b) => (b.score || 0) - (a.score || 0))
      const idx = items.indexOf(avail[0])
      used.add(cat + '-' + idx)
      selected.push({ ...avail[0], assignedCategory: cat })
    }
    if (selected.length >= count) break
  }
  return selected
}

// 初稿
export function generateDraft(topic) {
  const angles = [...JIUGONG_ANGLES].sort(() => Math.random() - 0.5)
  const primary = angles[0]
  const secondary = Math.random() > 0.5 ? angles[1] : null
  const usedAngles = secondary ? [primary, secondary] : [primary]

  const kw = topic.keyword || ''
  const snippet = topic.snippet || ''
  const source = topic.source || '全网'
  const cat = topic.assignedCategory || '命理知识'

  const hooks = [
    `${kw}这个话题,最近讨论度很高。但大多数人讲的都是同一个角度——不是从吉凶断,就是从禁忌说。九宫认为,这件事的底层逻辑远不止于此。`,
    `你有没有发现,最近关于"${kw}"的讨论突然多了起来?扫了一圈,大部分人都在聊表面。今天从命理的角度,聊聊这事背后是怎么回事。`,
    `坦白说,${kw}我已经看过太多人写过了。但有一个角度几乎没人聊——从九宫"原局有/原局无"的角度去拆。`,
  ]

  const bridges = [
    `先说说${source}上最近的讨论:${snippet.slice(0, 80)}...`,
    `这几天关于${kw}最有意思的讨论:${snippet.slice(0, 100)}...`,
  ]

  const sections = [
    hooks[Math.floor(Math.random() * hooks.length)],
    '',
    bridges[Math.floor(Math.random() * bridges.length)],
    '',
  ]

  for (const a of usedAngles) {
    sections.push(`### ${a.name}: ${a.hook}`)
    sections.push('')
    sections.push(a.intro)
    sections.push('')

    const analyses = [
      `把${a.name}套到${kw}这个场景里:绝大多数人在讨论${kw}的时候,都把注意力放在"结果"上,没有去想"结构"——在九宫体系里,结果只是结构的副产品。`,
      `从${a.name}的角度看,${kw}的本质不是吉凶问题,而是"归属"问题。同一个${kw},在不同人的命局里,意义完全不一样。`,
      `这就是为什么同样都是${kw},有人能从中获益,有人却栽跟头。${a.name}讲的就是这个分水岭。`,
    ]
    sections.push(analyses[Math.floor(Math.random() * analyses.length)])
    sections.push('')
  }

  const endings = [
    `说到底,${kw}不是什么神秘的事。有一套扎实的分析体系,什么表象都能拆透。`,
    `命理的价值不是预测,是分析。${kw}给了你一个入口,怎么拆怎么用,看你的本事。`,
    `想知道你的八字和${kw}有什么关系? [点此排盘](/bazi) 看看AI分析怎么说。`,
  ]
  sections.push(endings[Math.floor(Math.random() * endings.length)])

  return {
    title: topic.title,
    content: sections.join('\n'),
    summary: snippet.slice(0, 150),
    category: cat,
    date: new Date().toISOString().split('T')[0],
    source: source,
    keyword: kw,
    angle: usedAngles.map(a => a.name).join('+'),
    draftVersion: 1,
  }
}

// 5次改写

export function rewritePass1(article) {
  let c = article.content
  c = c
    .replace(/你会发现/g, () => ['你会发现','你会看到','说白了','说穿了','仔细想想'][Math.floor(Math.random()*5)])
    .replace(/这背后/g, () => ['这背后','从根本上讲','这个逻辑是'][Math.floor(Math.random()*3)])
    .replace(/大多数人/g, () => ['大多数人','很多朋友','我观察到的情况是'][Math.floor(Math.random()*3)])
    .replace(/从[^的]{0,8}的角度/g, () => ['从命理角度看','用九宫的话说','换个角度','如果从格局讲'][Math.floor(Math.random()*4)])

  // 穿插口语
  if (Math.random() > 0.4) {
    const talks = [
      '我见过不少求测的人,一上来就问"我这个月财运怎么样?"——命理不是这么用的。',
      '前两天有朋友来找我排盘,问"我是不是命里犯小人?"我说先别急着给自己贴标签。',
      '做了这些年命理,最大的感受是:大多数人不是不信命,是不信自己能看懂命。',
    ]
    const pos = Math.floor(c.length * 0.4)
    c = c.slice(0, pos) + '\n' + talks[Math.floor(Math.random() * talks.length)] + '\n' + c.slice(pos)
  }
  return { ...article, content: c, draftVersion: 2 }
}

export function rewritePass2(article) {
  let c = article.content
  const kw = article.keyword
  const blocks = [
    `从"原局有/原局无"看${kw}:原局有${kw}相关字的人叫"道上运",大运来了顺风顺水;原局没有的话,${kw}来了是"外来运",要么爆发要么翻车。`,
    `用"制用结构"分析${kw}:核心不在于"有没有",在于"能不能制得住"。能制住就是你的工具,制不住就是你的负担。`,
    `从"控制权三级"看${kw}:看出处(能量来源)->看流向(用到哪)->看控制(谁说了算)。三级层层扒开,无所谓玄学。`,
  ]
  const pick = blocks[Math.floor(Math.random() * blocks.length)]
  const mid = Math.floor(c.length * 0.45)
  c = c.slice(0, mid) + '\n### 九宫的底层拆解\n' + pick + '\n' + c.slice(mid)
  return { ...article, content: c, draftVersion: 3 }
}

export function rewritePass3(article) {
  let c = article.content
  const kw = article.keyword

  const longTail = [
    `说到底,关于"${kw}2026年运势",我的看法是:运势不是等来的,是分析出来的。`,
    `这就是"${kw}命理分析"和普通运势文章的区别——前者在拆结构,后者在讲故事。`,
    `关于"${kw}的真正逻辑",九宫的结论是:不是事情本身决定吉凶,是你和事情之间的关系决定吉凶。`,
  ]
  c += '\n' + longTail[Math.floor(Math.random() * longTail.length)]
  c += '\n---\n想了解自己的命局配置? [九宫八卦AI排盘分析](/bazi) | [免费排盘](/bazi)'
  return { ...article, content: c, draftVersion: 4 }
}

export function rewritePass4(article) {
  let c = article.content
  c = c
    .replace(/首先/g, () => ['先说','第一个','头一条'][Math.floor(Math.random()*3)])
    .replace(/其次/g, () => ['再者','第二个','另外'][Math.floor(Math.random()*3)])
    .replace(/最后/g, () => ['说到底','最后想说','总结一句'][Math.floor(Math.random()*3)])
    .replace(/综上所述/g, () => ['总结','七七八八说完了'][Math.floor(Math.random()*2)])

  // 段落拆分
  const paras = c.split('\n')
  const out = []
  for (const p of paras) {
    if (p.length > 180 && p.length < 400 && Math.random() > 0.4) {
      const cut = p.lastIndexOf('。', Math.floor(p.length / 2))
      if (cut > 20) {
        out.push(p.slice(0, cut + 1))
        out.push(p.slice(cut + 1).trim())
        continue
      }
    }
    out.push(p)
  }
  c = out.join('\n')
  return { ...article, content: c, draftVersion: 5 }
}

export function rewritePass5(article) {
  let c = article.content
  c = c
    .replace(/这个问题/g, '这个事')
    .replace(/非常重要/g, '挺重要')
    .replace(/不可忽视/g, '不能小看')
    .replace(/具有一定/g, '有')
    .replace(/基于此/g, '所以')
    .replace(/换言之/g, '换句话说')
    .replace(/显而易见/g, '明摆着')
    .replace(/值得注意/g, '有意思的是')
    .replace(/至关重要/g, '很关键')
    .replace(/当务之急/g, '首先要做的事')

  const prefixes = ['', '从命理看', '九宫解读:', '玄学视角:']
  const finalTitle = Math.random() > 0.5
    ? prefixes[Math.floor(Math.random() * prefixes.length)] + article.title
    : article.title

  return {
    ...article,
    title: finalTitle,
    content: c,
    draftVersion: 6,
    status: 'pending_review',
  }
}

// 质量检查
export function qualityCheck(article) {
  const issues = []
  const c = article.content || ''
  const chineseChars = c.replace(/[\s\w\d]/g, '').length
  article.charCount = chineseChars

  if (chineseChars < 500) issues.push('字数不足(仅' + chineseChars + '字)')
  if (chineseChars > 4000) issues.push('内容过长(' + chineseChars + '字,建议精简)')

  const checks = [
    [/首先[，,]/, '"首先"'],
    [/综上所述/, '"综上所述"'],
    [/[我们]需要[^。]{0,30}才能更好地/, '"需要XX才能更好地"'],
    [/不可否认/, '"不可否认"'],
    [/毋庸置疑/, '"毋庸置疑"'],
  ]
  for (const [pat, name] of checks) {
    const found = c.match(pat)
    if (found && found.length >= 2) issues.push('AIGC词:' + name + 'x' + found.length)
  }

  const paras = c.split('\n').filter(p => p.trim().length > 0)
  if (paras.length > 0) {
    const avg = paras.reduce((a, p) => a + p.length, 0) / paras.length
    if (avg > 300) issues.push('段落偏长(平均' + Math.round(avg) + '字)')
    if (paras.length < 4) issues.push('分段过少')
  }

  return issues
}
