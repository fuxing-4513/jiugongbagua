/**
 * dream-synonyms.ts — 解梦关键词同义融合
 *
 * 当用户搜"高空掉落"而库里有"高空坠落"时自动匹配。
 *
 * 匹配策略：
 *   1. 精确包含（直接子串匹配）
 *   2. 同义词替换后包含
 *   3. 任意单字重叠 + 同义检测
 *   4. 编辑距离（短词）
 */

// ── 同义词映射 ──
export const SYNONYM_MAP: Record<string, string[]> = {
  // 坠落/掉落/跌下/落下
  '坠落': ['掉落', '跌下', '落下', '坠下', '跌落', '坠'],
  '掉落': ['坠落', '跌下', '落下', '坠下', '跌落', '掉'],
  '跌下': ['坠落', '掉落', '落下', '坠下', '跌落'],
  '落下': ['坠落', '掉落', '跌下', '坠下', '跌落', '落'],
  '跌落': ['坠落', '掉落', '跌下', '坠下', '落下'],
  '掉下': ['坠落', '落下', '跌下', '落下'],
  // 高空/高处
  '高空': ['高处', '空中', '天上', '半空', '高空'],
  '高处': ['高空', '空中', '天上', '半空'],
  '空中': ['高空', '高处', '天上', '半空'],
  // 飞/飞翔/飞行
  '飞': ['飞翔', '飞行', '飞舞', '飞腾', '飞起', '飞天', '飞翔'],
  '飞翔': ['飞', '飞行', '飞舞', '飞腾'],
  '飞行': ['飞', '飞翔'],
  // 爬/攀
  '爬': ['攀', '攀登', '爬上', '攀爬'],
  '攀': ['爬', '攀登', '爬上', '攀爬'],
  // 掉/落/脱
  '掉': ['落', '脱落', '掉落', '落下', '掉下', '掉'],
  '落': ['掉', '脱落', '掉落', '落下', '掉下', '落'],
  // 梦见/梦到
  '梦见': ['梦到', '梦'],
  '梦到': ['梦见', '梦'],
  // 牙齿/牙
  '牙齿': ['牙', '牙'],
  '牙': ['牙齿'],
  // 死/死亡
  '死': ['死亡', '去世', '过世'],
  '死亡': ['死', '去世', '过世'],
  // 丢/丢失/遗失
  '丢': ['丢失', '遗失', '丢'],
  // 水/河/海/江
  '水': ['河', '海', '江', '湖水', '河流', '水里'],
  '河': ['水', '河流', '河水', '河里'],
  '海': ['水', '大海', '海洋', '海里'],
  '水里': ['河里', '海里', '水里'],
  '河里': ['水里', '河里'],
  // 火/烧
  '火': ['烧', '火灾', '火焰', '大火', '着火'],
  '烧': ['火', '火灾', '火焰', '着火'],
  // 蛇
  '蛇': ['大蛇', '小蛇', '蛇虫', '蛇咬', '蛇缠', '蛇'],
  '大蛇': ['蛇', '小蛇', '蛇虫', '蛇咬'],
  '小蛇': ['蛇', '大蛇'],
  // 鬼
  '鬼': ['鬼魂', '鬼怪', '鬼神', '幽灵', '见鬼', '鬼'],
  '鬼魂': ['鬼', '鬼怪', '鬼神'],
  // 考试
  '考试': ['考', '考试落榜', '考试'],
  // 追
  '追': ['追赶', '被追', '追杀', '追逐', '追'],
  // 哭/笑
  '哭': ['哭泣', '流泪', '哭声', '哭喊', '哭'],
  '笑': ['大笑', '微笑', '笑容', '欢笑', '笑'],
  // 钱
  '钱': ['钞票', '金钱', '钱财', '硬币', '钱'],
  '钞票': ['钱', '金钱', '钞票'],
  // 车
  '车': ['汽车', '车子', '车辆', '轿车', '车'],
  '汽车': ['车', '车子', '车辆'],
  // 男人/女人
  '男人': ['男性', '男士', '男人'],
  '女人': ['女性', '女士', '女人'],
  // 孕妇/怀孕
  '孕妇': ['怀孕', '孕', '孕妇'],
  '怀孕': ['孕妇', '孕'],
  // 小孩/孩子
  '小孩': ['孩子', '儿童', '幼儿', '小孩'],
  '孩子': ['小孩', '儿童', '幼儿'],
  // 颜色
  '红': ['红色', '血红', '通红', '红'],
  '白': ['白色', '雪白', '洁白', '白'],
  '黑': ['黑色', '漆黑', '黑暗', '黑'],
  // 动词
  '打': ['打架', '打斗', '打人', '殴打', '打'],
  '杀': ['杀死', '杀害', '杀人', '谋杀', '杀'],
  '救': ['救起', '救援', '救护', '救命', '救'],
  '跑': ['奔跑', '逃跑', '奔走', '跑'],
  '跳': ['跳跃', '跳下', '跳进', '跳水', '跳'],
  // 建筑
  '房子': ['房屋', '屋子', '宅子', '房子'],
  '楼': ['楼房', '高楼', '楼层', '楼梯', '楼'],
  // 自然
  '雨': ['下雨', '雨水', '暴雨', '大雨', '小雨', '雨'],
  '雪': ['下雪', '大雪', '雪花', '飘雪', '积雪', '雪'],
  '风': ['刮风', '大风', '狂风', '风暴', '风'],
  '雷': ['打雷', '雷声', '雷电', '雷雨'],
  // 动物
  '狗': ['犬', '小狗', '狗狗', '野狗', '狗'],
  '猫': ['猫咪', '小猫', '野猫', '猫'],
  '鸟': ['小鸟', '飞鸟', '鸟儿', '雀', '鸟'],
  '鱼': ['鱼儿', '鱼虾', '鱼'],
  // 日常
  '衣服': ['衣裳', '服装', '衣裳', '衣服'],
  '头发': ['发', '毛发', '发丝', '头发'],
}

/**
 * 核心匹配函数
 * @param query 用户输入
 * @param keyword 数据库关键词
 */
export function synonymMatch(query: string, keyword: string): boolean {
  const q = query.trim()
  const k = keyword.trim()
  if (!q || !k) return false

  // ── 0: 分字提取 ──
  const qChars = [...new Set(q.split(''))]    // 单字去重
  const kChars = [...new Set(k.split(''))]

  // ── 1: 精确包含 ──
  if (k.includes(q) || q.includes(k)) return true

  // ── 2: 同义词替换后包含 ──
  const qExpanded = expandAll(q)
  const kExpanded = expandAll(k)
  for (const qe of qExpanded) {
    for (const ke of kExpanded) {
      if (ke.includes(qe) || qe.includes(ke)) return true
    }
  }

  // ── 3: 含2字以上重叠 + 语义检查 ──
  // 注意：仅当查询词较长(>=3字)时才启用字重叠模糊匹配。
  // 二字词之间编辑距离恒为2，若放开会导致所有二字词互相命中（结果被垃圾淹没）。
  // 且 keyword 为长文本(白话/详情)时单字重叠必然≥2，必须用长度门槛挡住（"梦见水"曾全库命中）。
  const overlapping = qChars.filter(c => kChars.includes(c))
  const kIsLongText = k.length > 12
  if (q.length >= 3 && overlapping.length >= 2 && !kIsLongText) {
    // 长查询词与关键词有2字重叠 → 大概率同词根
    return true
  }
  if (q.length >= 3 && overlapping.length === 1) {
    // 1字重叠 → 还需检查语义关系
    const shared = overlapping[0]
    // 查双方的上下文是否在对方的能力范围内
    const qContext = extractContext(q, shared)
    const kContext = extractContext(k, shared)
    // 如果共享字不在〖的〗〖了〗〖有〗等虚词里，基本靠谱
    if (!['的', '了', '有', '在', '是', '和', '或', '与', '被', '把', '从', '向'].includes(shared)) {
      // 检查单字的同义关系
      const qSyn = getAllSynonyms(q)
      const kSyn = getAllSynonyms(k)
      for (const qs of qSyn) {
        for (const ks of kSyn) {
          if (ks.includes(qs) || qs.includes(ks)) return true
        }
      }
      // 容错：如果共享字是实词（非虚词），且其中一方含对方2字
      for (const qs of qSyn) {
        if (k.includes(qs)) return true
      }
      for (const ks of kSyn) {
        if (q.includes(ks)) return true
      }
    }
  }

  // ── 4: 编辑距离（短词，仅同长度且高度相似） ──
  // 二字词编辑距离恒≤2，必须收紧为"仅差1字"才视为近似（如 掉牙≈换牙）；
  // 单字词之间距离恒为1（狗≈猫也=1），长度1必须整体排除。
  if (q.length === k.length && q.length >= 2 && q.length <= 4) {
    if (levenshtein(q, k) <= 1) return true
  }

  return false
}

/** 展开所有可能的同义变体 */
function expandAll(text: string): string[] {
  const results = new Set<string>([text])
  // 对每个已知同义词组，如果它的任何变体出现在文本中，展开
  for (const [key, syns] of Object.entries(SYNONYM_MAP)) {
    if (text.includes(key)) {
      for (const syn of syns) {
        results.add(text.replace(key, syn))
      }
    }
  }
  return Array.from(results)
}

/** 获取文本的所有同义词集合（含自身） */
function getAllSynonyms(text: string): Set<string> {
  const set = new Set<string>([text])
  for (const [key, syns] of Object.entries(SYNONYM_MAP)) {
    // 如果文本包含这个词
    if (text.includes(key)) {
      for (const syn of syns) {
        set.add(syn)
      }
    }
    // 如果这个词包含在文本中
    // (反向关系，方便短词找长文本)
  }
  // 反向查找：该文本是否出现在同义词值中
  for (const [key, syns] of Object.entries(SYNONYM_MAP)) {
    for (const syn of syns) {
      if (text === syn || text.includes(syn)) {
        set.add(key)
      }
    }
  }
  return set
}

/** 提取共享字周围的上下文（前后最多2字） */
function extractContext(text: string, char: string): string {
  const idx = text.indexOf(char)
  if (idx === -1) return ''
  const start = Math.max(0, idx - 2)
  const end = Math.min(text.length, idx + 3)
  return text.substring(start, end)
}

/** 编辑距离 */
function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0))
  for (let i = 0; i <= m; i++) dp[i][0] = i
  for (let j = 0; j <= n; j++) dp[0][j] = j
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1])
    }
  }
  return dp[m][n]
}

/**
 * 多词组合搜索（空格分隔，AND逻辑）
 * @param query 用户搜索词
 * @param searchTarget 数据的搜索摘要
 */
export function multiTermMatch(query: string, searchTarget: string): boolean {
  const terms = query.split(/\s+/).filter(Boolean)
  if (terms.length === 0) return true
  return terms.every(term => synonymMatch(term, searchTarget))
}
